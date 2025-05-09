class StupidBot:
    """
    A simple bot that always bets (calls) regardless of its card
    """
    
    def __init__(self, game):
        """Initialize the stupid bot"""
        self.game = game
    
    def get_action(self, card, history):
        """
        Always returns BET action regardless of card or history
        """
        return self.game.BET