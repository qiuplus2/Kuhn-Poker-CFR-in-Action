// components/PokerTable.js
import React, { useState, useEffect } from 'react';
import './PokerTable.css';
import Card from './Card';

const PokerTable = ({ gameHistory, isBotVsBot, cards, onPlayClick }) => {
  const [gameState, setGameState] = useState('new'); // 'new', 'ongoing', 'finished'
  const [winner, setWinner] = useState(null);
  const [pot, setPot] = useState(1); // Starting pot in Kuhn Poker
  
  useEffect(() => {
    // Reset game state when new cards are dealt
    if (gameHistory.length === 0) {
      setGameState('new');
      setWinner(null);
      setPot(1);
      // Remove 'revealed' class from cards
      const cardEls = document.querySelectorAll('.card');
      cardEls.forEach(el => el.classList.remove('revealed'));
    }
    
    // Update pot size
    const betCount = gameHistory.filter(move => move.action === 'bet').length;
    setPot(1 + betCount);
    
    // Check if game has ended
    if (gameHistory.length >= 2) {
      const lastTwoMoves = gameHistory.slice(-2);
      
      // Check terminal conditions
      if (
        (lastTwoMoves[0].action === 'pass' && lastTwoMoves[1].action === 'pass') ||
        (lastTwoMoves[0].action === 'bet' && lastTwoMoves[1].action === 'pass') ||
        (lastTwoMoves[0].action === 'bet' && lastTwoMoves[1].action === 'bet')
      ) {
        endGame();
      }
    }
  }, [gameHistory]);
  
  const endGame = () => {
    setGameState('finished');
    
    // Determine winner based on the last move
    const lastMove = gameHistory[gameHistory.length - 1];
    const winner = lastMove.player;
    setWinner(winner);
    
    // Reveal both cards
    setTimeout(() => {
      const cardEls = document.querySelectorAll('.card');
      cardEls.forEach(el => el.classList.add('revealed'));
    }, 500);
  };
  
  return (
    <div className="poker-table">
      <div className="table-felt">
        <div className="player-area">
          <div className="player-name">CFR Bot</div>
          <div className="card-container">
            <Card 
              value={cards.cfr} 
              faceUp={gameState === 'finished'} 
              className={`cfr-card ${gameState === 'finished' ? 'revealed' : ''}`}
            />
          </div>
        </div>
        
        <div className="table-center">
          <div className="pot">
            <div className="pot-label">Pot</div>
            <div className="pot-amount">{pot}</div>
          </div>
          
          {gameState === 'finished' && (
            <div className={`winner-announcement ${winner === 'cfr' ? 'cfr-wins' : 'stupid-wins'}`}>
              {winner === 'cfr' ? 'CFR Bot Wins!' : 'Stupid Bot Wins!'}
            </div>
          )}
        </div>
        
        <div className="player-area">
          <div className="player-name">Stupid Bot</div>
          <div className="card-container">
            <Card 
              value={cards.stupid} 
              faceUp={gameState === 'finished'} 
              className={`stupid-card ${gameState === 'finished' ? 'revealed' : ''}`}
            />
          </div>
        </div>
      </div>
    </div>
  );
};

export default PokerTable;