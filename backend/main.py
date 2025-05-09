# main.py - Script to run training and evaluation

import random
import argparse
from kuhn_poker import KuhnPoker
from cfr import CFRSolver
from stupid_bot import StupidBot

def evaluate_vs_stupid_bot(game, strategy, num_games=1000):
    """Evaluate CFR strategy against StupidBot"""
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
    return avg_payoff

def play_interactive_game(game, cfr_strategy):
    """Play an interactive game against the CFR bot"""
    print("Welcome to Kuhn Poker!")
    print("You are playing against a trained CFR bot.")
    print("Card values: 1 (lowest) to 3 (highest)")
    print("Actions: 0 = PASS, 1 = BET")
    
    # Deal cards
    cards = list(range(1, game.num_cards + 1))
    random.shuffle(cards)
    
    # Player gets first card, bot gets second
    player_card = cards[0]
    bot_card = cards[1]
    
    print(f"Your card is: {player_card}")
    
    # Initial history is empty
    history = []
    
    # Game loop
    while not game.is_terminal(history):
        player = len(history) % 2
        
        if player == 0:  # Human player's turn
            action = None
            while action not in [0, 1]:
                try:
                    action = int(input("Your action (0=PASS, 1=BET): "))
                except ValueError:
                    print("Invalid input. Please enter 0 or 1.")
        else:  # Bot's turn
            # Get bot's strategy
            info_set = game.get_info_set(bot_card, history)
            strategy = cfr_strategy.get(info_set, [0.5, 0.5])
            
            # Sample action
            action = game.PASS if random.random() < strategy[0] else game.BET
            print(f"Bot action: {game.ACTION_STR[action]}")
        
        history.append(action)
    
    # Game ended, show results
    print(f"Game over! Your card: {player_card}, Bot's card: {bot_card}")
    payoff = game.get_payoff([player_card, bot_card], history)
    
    if payoff > 0:
        print(f"You win {abs(payoff)}!")
    elif payoff < 0:
        print(f"Bot wins {abs(payoff)}!")
    else:
        print("It's a tie!")

def main():
    parser = argparse.ArgumentParser(description='Run Kuhn Poker with CFR vs StupidBot')
    parser.add_argument('--iterations', type=int, default=10000, help='Number of CFR training iterations')
    parser.add_argument('--interactive', action='store_true', help='Play interactive game after training')
    parser.add_argument('--eval-games', type=int, default=10000, help='Number of evaluation games')
    
    args = parser.parse_args()
    
    # Create game
    game = KuhnPoker()
    
    # Create and train CFR solver
    print(f"Training CFR for {args.iterations} iterations...")
    cfr_solver = CFRSolver(game)
    cfr_strategy = cfr_solver.train(args.iterations)
    
    # Evaluate against StupidBot
    print("Evaluating against StupidBot...")
    avg_payoff = evaluate_vs_stupid_bot(game, cfr_strategy, args.eval_games)
    print(f"Average payoff vs StupidBot over {args.eval_games} games: {avg_payoff:.4f}")
    
    # Interactive mode
    if args.interactive:
        play_interactive_game(game, cfr_strategy)

if __name__ == "__main__":
    main()