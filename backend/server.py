# server.py - Flask server to connect backend with frontend

from flask import Flask, jsonify, request, send_from_directory
from flask_cors import CORS
from kuhn_poker import KuhnPoker
from cfr import CFRSolver
from stupid_bot import StupidBot
import json
import os
import numpy as np
import time

app = Flask(__name__, static_folder='../frontend/build', static_url_path='')
CORS(app) 

# Custom JSON encoder for NumPy arrays
class NumpyEncoder(json.JSONEncoder):
    def default(self, obj):
        if isinstance(obj, np.ndarray):
            return obj.tolist()
        if isinstance(obj, np.float32):
            return float(obj)
        return json.JSONEncoder.default(self, obj)

@app.route('/')
def serve():
    return send_from_directory(app.static_folder, 'index.html')

@app.route('/api/train', methods=['POST'])
def train():
    """API endpoint to train the solvers"""
    try:
        data = request.json
        iterations = data.get('iterations', 10000)
        track_interval = data.get('track_interval', 100)
        
        # 创建游戏和求解器
        game = KuhnPoker()
        cfr_solver = CFRSolver(game)
        
        # 训练 CFR 求解器
        start_time = time.time()
        cfr_strategy = cfr_solver.train(iterations=iterations, track_interval=track_interval)
        cfr_time = time.time() - start_time
        
        # 获取训练指标历史
        metrics_history = cfr_solver.get_training_history()
        
        # 保存训练指标历史
        with open(os.path.join(app.static_folder, 'metrics_history.json'), 'w') as f:
            json.dump(metrics_history, f, cls=NumpyEncoder, indent=2)
        
        # 保存策略
        strategies = {
            "cfr": cfr_strategy,
            "stupid_bot": {"dummy": [0.0, 1.0]}  # StupidBot 总是选择 BET
        }
        
        with open(os.path.join(app.static_folder, 'strategies.json'), 'w') as f:
            json.dump(strategies, f, cls=NumpyEncoder, indent=2)
        
        # 评估 CFR vs StupidBot
        results = evaluate_vs_stupid_bot(game, cfr_strategy, num_games=1000)
        
        evaluation_results = {
            "cfr_vs_stupid": results,
            "training_time": {
                "cfr": cfr_time
            }
        }
        
        with open(os.path.join(app.static_folder, 'evaluation_results.json'), 'w') as f:
            json.dump(evaluation_results, f, cls=NumpyEncoder, indent=2)
        
        return jsonify({
            "status": "success",
            "message": f"Training completed with {iterations} iterations",
            "training_time": {
                "cfr": cfr_time
            }
        })
    except Exception as e:
        print(f"训练出错: {str(e)}")
        return jsonify({"status": "error", "message": str(e)}), 500

@app.route('/api/metrics', methods=['GET'])
def get_metrics():
    """API endpoint to get metrics history"""
    try:
        # 检查 metrics_history.json 文件是否存在
        history_path = os.path.join(app.static_folder, 'metrics_history.json')
        
        if not os.path.exists(history_path):
            # 如果文件不存在，返回空数据结构
            return jsonify({
                "iterations": [],
                "strategies": {},
                "expected_payoffs": [],
                "regrets": {}
            })
        else:
            # 如果文件存在，直接读取
            with open(history_path, 'r') as f:
                training_history = json.load(f)
            return jsonify(training_history)
    except Exception as e:
        print(f"获取指标出错: {str(e)}")
        return jsonify({"error": str(e)}), 500

def evaluate_vs_stupid_bot(game, strategy, num_games=1000):
    """Evaluate CFR strategy against StupidBot"""
    import random
    
    total_payoff = 0
    
    for _ in range(num_games):
        # Deal cards
        cards = list(range(1, game.num_cards + 1))
        random.shuffle(cards)
        cards = cards[:2]  # Take only first 2 cards
        
        # Play CFR as player 0, StupidBot as player 1
        history = []
        
        # Game loop
        while not game.is_terminal(history):
            player = len(history) % 2
            
            if player == 0:  # CFR's turn
                card = cards[0]
                info_set = game.get_info_set(card, history)
                
                # Get action from CFR strategy
                if info_set in strategy:
                    action_probs = strategy[info_set]
                    action = game.PASS if random.random() < action_probs[0] else game.BET
                else:
                    # If info set not in strategy, use uniform random
                    action = random.choice([game.PASS, game.BET])
            else:  # StupidBot's turn
                # StupidBot always bets
                action = game.BET
                
            history.append(action)
        
        # Get payoff (from player 0's perspective)
        payoff = game.get_payoff(cards, history)
        total_payoff += payoff
    
    avg_payoff = total_payoff / num_games
    return {
        "avg_payoff": avg_payoff,
        "total_games": num_games
    }



@app.route('/api/play', methods=['POST'])
def play_game():
    """API endpoint to play a game against the CFR bot"""
    data = request.json
    player_card = data.get('playerCard')
    
    # Load CFR strategy
    try:
        with open(os.path.join(app.static_folder, 'strategies.json'), 'r') as f:
            strategies = json.load(f)
            cfr_strategy = {k: np.array(v) for k, v in strategies["cfr"].items()}
    except:
        # If strategy not found, use default uniform strategy
        cfr_strategy = {}
    
    # Create game
    game = KuhnPoker()
    
    # Deal cards
    cards = list(range(1, game.num_cards + 1))
    if player_card:
        cards.remove(player_card)
        cards.insert(0, player_card)
    else:
        import random
        random.shuffle(cards)
    
    cards = cards[:2]  # Take only first 2 cards
    
    # Process game history
    history = data.get('history', [])
    
    # If it's bot's turn
    if len(history) % 2 == 1:
        bot_card = cards[1]
        info_set = game.get_info_set(bot_card, history)
        
        # Get bot's strategy
        strategy = cfr_strategy.get(info_set, np.array([0.5, 0.5]))
        
        # Sample action based on strategy
        import random
        action = game.PASS if random.random() < strategy[0] else game.BET
        history.append(action)
    
    # Check if game is terminal
    is_terminal = game.is_terminal(history)
    payoff = game.get_payoff(cards, history) if is_terminal else 0
    
    return jsonify({
        'cards': cards,
        'history': history,
        'isTerminal': is_terminal,
        'payoff': payoff
    })

if __name__ == '__main__':
    # Ensure directories exist
    # os.makedirs(app.static_folder, exist_ok=True)
    os.makedirs(os.path.dirname(os.path.join(app.static_folder, 'metrics_history.json')), exist_ok=True)

    
    # Train models if they don't exist
    if not os.path.exists(os.path.join(app.static_folder, 'strategies.json')):
        print("Pre-training models...")
        game = KuhnPoker()
        cfr_solver = CFRSolver(game)
        
        # Train with fewer iterations for startup speed
        cfr_strategy = cfr_solver.train(iterations=5000, track_interval=100)
        
        # Save metrics history
        metrics_history = cfr_solver.get_metrics_history()
        with open(os.path.join(app.static_folder, 'metrics_history.json'), 'w') as f:
            json.dump(metrics_history, f, cls=NumpyEncoder, indent=2)
        
        # Save strategies
        strategies = {
            "cfr": cfr_strategy,
            "stupid_bot": {"dummy": [0.0, 1.0]}  # StupidBot always chooses BET
        }
        
        with open(os.path.join(app.static_folder, 'strategies.json'), 'w') as f:
            json.dump(strategies, f, cls=NumpyEncoder, indent=2)
            
        # Quick evaluation
        results = evaluate_vs_stupid_bot(game, cfr_strategy, num_games=1000)
        
        evaluation_results = {
            "cfr_vs_stupid": results,
            "training_time": {
                "cfr": 0
            }
        }
        
        with open(os.path.join(app.static_folder, 'evaluation_results.json'), 'w') as f:
            json.dump(evaluation_results, f, cls=NumpyEncoder, indent=2)
    
    app.run(debug=True)