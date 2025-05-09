# cfr.py - Counterfactual Regret Minimization implementation

import numpy as np
import random
from collections import defaultdict

class CFRSolver:
    """
    Vanilla CFR implementation for Kuhn Poker
    """
    
    def __init__(self, game):
        """Initialize the CFR solver for the given game"""
        self.game = game
        
        self.iteration_history = []
        self.strategy_history = {}
        self.expected_payoff_history = []
        self.regret_history = {}

        # Strategy is represented as a map from information set to action probabilities
        self.strategy = defaultdict(lambda: np.array([0.5, 0.5], dtype=np.float32))  # Initial uniform strategy
        self.strategy_sum = defaultdict(lambda: np.array([0.0, 0.0], dtype=np.float32))
        self.regret_sum = defaultdict(lambda: np.array([0.0, 0.0], dtype=np.float32))
        self.iterations = 0
        
        # # Added: Tracking metrics over iterations
        # self.metrics_history = {
        #     'iterations': [],
        #     'strategies': defaultdict(list),
        #     'expected_payoffs': [],
        #     'regrets': defaultdict(list)
        # }
        
        # Define key information sets we want to track
        self.key_info_sets = []
        for card in range(1, game.num_cards + 1):
            # Track strategies for initial state with each card
            self.key_info_sets.append(game.get_info_set(card, []))
            # Track strategies after opponent bets
            self.key_info_sets.append(game.get_info_set(card, [game.BET]))
            # Track strategies after opponent passes
            self.key_info_sets.append(game.get_info_set(card, [game.PASS]))
    
    def get_strategy(self, info_set):
        """Get the current strategy for an information set"""
        regrets = self.regret_sum[info_set]
        # Use regret-matching to compute the strategy
        strategy = np.maximum(regrets, 0)
        norm = np.sum(strategy)
        
        if norm > 0:
            strategy /= norm
        else:
            # If all regrets are negative or zero, use a uniform strategy
            strategy = np.array([0.5, 0.5])
            
        return strategy
    
    def get_average_strategy(self):
        """Get the average strategy across all iterations"""
        avg_strategy = {}
        
        for info_set, strategy_sum in self.strategy_sum.items():
            norm = np.sum(strategy_sum)
            if norm > 0:
                avg_strategy[info_set] = strategy_sum / norm
            else:
                # If no iterations have contributed, use a uniform strategy
                avg_strategy[info_set] = np.array([0.5, 0.5])
        
        return avg_strategy
    
    def _cfr(self, cards, history, p0, p1):
        """
        Run one iteration of CFR
        
        Args:
            cards: Cards dealt to players
            history: History of actions
            p0: Probability of reaching this state for player 0
            p1: Probability of reaching this state for player 1
            
        Returns:
            Expected value for the current player
        """
        player = len(history) % 2
        player_card = cards[player]
        
        # If we're at a terminal state, return the payoff
        if self.game.is_terminal(history):
            return self.game.get_payoff(cards, history) if player == 1 else -self.game.get_payoff(cards, history)
            
        info_set = self.game.get_info_set(player_card, history)
        
        # Get current strategy
        strategy = self.get_strategy(info_set)
        
        # Initialize expected values
        action_values = np.zeros(2)  # Values for [PASS, BET]
        
        # For each action, recursively call CFR with updated history
        for action in self.game.get_possible_actions(history):
            next_history = history + [action]
            
            # Update the reach probabilities based on the player
            if player == 0:
                action_values[action] = -self._cfr(cards, next_history, p0 * strategy[action], p1)
            else:
                action_values[action] = -self._cfr(cards, next_history, p0, p1 * strategy[action])
                
        # Calculate expected value under current strategy
        value = np.sum(strategy * action_values)
        
        # Accumulate regrets and strategy
        if player == 0:
            # Calculate regret for each action
            for action in self.game.get_possible_actions(history):
                self.regret_sum[info_set][action] += p1 * (action_values[action] - value)
            # Accumulate strategy weighted by the player's reach probability
            self.strategy_sum[info_set] += p0 * strategy
        else:
            # Calculate regret for each action
            for action in self.game.get_possible_actions(history):
                self.regret_sum[info_set][action] += p0 * (action_values[action] - value)
            # Accumulate strategy weighted by the player's reach probability
            self.strategy_sum[info_set] += p1 * strategy
            
        return value
    
    
    # 确保修改 train 方法如下
    def train(self, iterations, track_interval=100):
        """
        Train the CFR solver for a specified number of iterations
        
        Args:
            iterations: Number of iterations to train for
            track_interval: How often to track metrics
        
        Returns:
            The average strategy
        """
        print(f"Starting CFR training for {iterations} iterations...")
        
        # 初始化期望收益计算
        total_payoff = 0.0
        
        # 确保历史记录变量被重置
        self.iteration_history = []
        self.strategy_history = {}
        self.expected_payoff_history = []
        self.regret_history = {}
        
        for i in range(iterations):
            if (i+1) % 1000 == 0:
                print(f"CFR iteration {i+1}/{iterations}")
                
            # 打乱卡牌
            cards = list(range(1, self.game.num_cards + 1))
            random.shuffle(cards)
            cards = cards[:2]  # 每个玩家一张牌
            
            # 记录当前的策略和遗憾值
            if (i+1) % track_interval == 0 or i == iterations - 1:
                self.iteration_history.append(i+1)
                
                # 记录关键信息集的策略
                for card in range(1, self.game.num_cards + 1):
                    # 初始信息集
                    info_set = self.game.get_info_set(card, [])
                    
                    if info_set not in self.strategy_history:
                        self.strategy_history[info_set] = []
                    
                    # 使用 get_strategy 获取当前策略
                    strategy = self.get_strategy(info_set)
                    self.strategy_history[info_set].append(strategy.tolist())
                    
                    # 记录当前遗憾值
                    if info_set not in self.regret_history:
                        self.regret_history[info_set] = []
                    
                    if info_set in self.regret_sum:
                        regret = self.regret_sum[info_set]
                        self.regret_history[info_set].append(regret.tolist())
                    else:
                        # 如果没有遗憾值，添加零向量
                        self.regret_history[info_set].append([0.0, 0.0])
            
            # 从根节点运行CFR
            iteration_payoff = self._cfr(cards, [], 1.0, 1.0)
            total_payoff += iteration_payoff
            self.iterations += 1
            
            # 记录期望收益
            if (i+1) % track_interval == 0 or i == iterations - 1:
                avg_payoff = total_payoff / (i+1)
                self.expected_payoff_history.append(float(avg_payoff))
                
        print("CFR training complete.")
        return self.get_average_strategy()

    # 添加获取训练历史的方法
    def get_training_history(self):
        """获取训练历史数据"""
        return {
            'iterations': self.iteration_history,
            'strategies': self.strategy_history,
            'expected_payoffs': self.expected_payoff_history,
            'regrets': self.regret_history
        }