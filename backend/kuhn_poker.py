# Basic game implementation

class KuhnPoker:
    """Implementation of Kuhn Poker - a simplified poker variant with 3 cards (1,2,3)"""
    
    PASS = 0
    BET = 1
    
    # String representations for actions
    ACTION_STR = {
        PASS: "PASS",
        BET: "BET"
    }
    
    def __init__(self, num_cards=3):
        """Initialize the game with specified number of cards"""
        self.num_cards = num_cards
        
    def is_terminal(self, history):
        if len(history) < 2:
            return False
            
        # Game ends if:
        # 1. Both players pass
        # 2. One player bets and other passes
        # 3. Both players bet
        return (history[-1] == self.PASS and history[-2] == self.PASS) or \
               (history[-1] == self.PASS and history[-2] == self.BET) or \
               (history[-1] == self.BET and history[-2] == self.BET)
    
    def get_payoff(self, cards, history):
        if not self.is_terminal(history):
            return 0
            
        player0_card = cards[0]
        player1_card = cards[1]
        
        # Both pass - higher card wins 1
        if history[0] == self.PASS and history[1] == self.PASS:
            return 1 if player0_card > player1_card else -1
            
        # One bets, other passes - betting player wins 1
        if history[-1] == self.PASS and history[-2] == self.BET:
            return -1 if len(history) % 2 == 0 else 1
            
        # Both bet - higher card wins 2
        if history[-1] == self.BET and history[-2] == self.BET:
            return 2 if player0_card > player1_card else -2
        
        return 0
    
    def get_info_set(self, card, history):
        """Get info set key for a player based on their card and the history"""
        return f"{card}:{':'.join(['PASS' if a == self.PASS else 'BET' for a in history])}"
        
    def get_possible_actions(self, history):
        """Get list of possible actions for the current player"""
        return [self.PASS, self.BET]
    
    def pretty_print_history(self, cards, history):
        """Return a readable game history"""
        result = f"Player 0 has card {cards[0]}, Player 1 has card {cards[1]}\n"
        for i, action in enumerate(history):
            player = i % 2
            result += f"Player {player} {self.ACTION_STR[action]}ES\n"
        
        if self.is_terminal(history):
            payoff = self.get_payoff(cards, history)
            winner = "Player 0" if payoff > 0 else "Player 1"
            amount = abs(payoff)
            result += f"{winner} wins {amount}"
        
        return result