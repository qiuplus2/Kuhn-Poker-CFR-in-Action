import React, { useState, useEffect } from 'react';
import './App.css';
import PokerTable from './components/PokerTable';
import GameHistoryTable from './components/GameHistoryTable';
import TrainingMetrics from './components/TrainingMetrics';



function App() {
  const [gameHistory, setGameHistory] = useState([]);
  const [cards, setCards] = useState({ cfr: null, stupid: null });
  const [stats, setStats] = useState({ cfrWins: 0, stupidWins: 0, total: 0 });
  const [isBotVsBot, setIsBotVsBot] = useState(false);
  const [numGames, setNumGames] = useState(1000);
  const [isDemoRunning, setIsDemoRunning] = useState(false);
  const [showMetrics, setShowMetrics] = useState(false);
  

  const playGame = () => {
    // Clear previous game history
    setGameHistory([]);
    
    // Deal cards
    const dealtCards = [1, 2, 3];
    shuffleArray(dealtCards);
    
    // Randomly decide who goes first
    const firstPlayer = Math.random() > 0.5 ? 'cfr' : 'stupid';
    const secondPlayer = firstPlayer === 'cfr' ? 'stupid' : 'cfr';
    
    // Assign cards
    setCards({
      cfr: firstPlayer === 'cfr' ? dealtCards[0] : dealtCards[1],
      stupid: firstPlayer === 'stupid' ? dealtCards[0] : dealtCards[1]
    });
    
    // Play the game
    const history = playRound(firstPlayer, secondPlayer, dealtCards[0], dealtCards[1]);
    setGameHistory(history);
    
    // Update stats
    const winner = determineWinner(history, firstPlayer, secondPlayer, dealtCards[0], dealtCards[1]);
    if (winner === 'cfr') {
      setStats(prev => ({ ...prev, cfrWins: prev.cfrWins + 1, total: prev.total + 1 }));
    } else if (winner === 'stupid') {
      setStats(prev => ({ ...prev, stupidWins: prev.stupidWins + 1, total: prev.total + 1 }));
    }
  };

  const playRound = (firstPlayer, secondPlayer, firstCard, secondCard) => {
    const history = [];
    
    // First player's action
    const firstAction = firstPlayer === 'cfr' 
      ? getCFRAction(firstCard) 
      : 'bet'; // Stupid bot always bets
    history.push({ player: firstPlayer, action: firstAction });
    
    // Second player's action
    const secondAction = secondPlayer === 'cfr' 
      ? getCFRAction(secondCard) 
      : 'bet'; // Stupid bot always bets
    history.push({ player: secondPlayer, action: secondAction });
    
    // If first player passed and second player bet, first player gets chance to call
    if (firstAction === 'pass' && secondAction === 'bet') {
      const finalAction = firstPlayer === 'cfr' 
        ? getCFRAction(firstCard) 
        : 'bet'; // Stupid bot always bets
      history.push({ player: firstPlayer, action: finalAction });
    }
    
    return history;
  };

  const getCFRAction = (card) => {
    // With King (3), always bet since it's the strongest card
    if (card === 3) return 'bet';
    
    // With Jack (1), always pass since it's the weakest card
    if (card === 1) return 'pass';
    
    // With Queen (2), use a mixed strategy:
    // - If we're first to act, bet 75% of the time
    // - If we're second to act and opponent bet, call 60% of the time
    // - If we're second to act and opponent passed, bet 80% of the time
    const random = Math.random();
    if (gameHistory.length === 0) {  // First to act
      return random < 0.75 ? 'bet' : 'pass';
    } else if (gameHistory.length === 1) {  // Second to act
      if (gameHistory[0].action === 'bet') {
        return random < 0.60 ? 'bet' : 'pass';
      } else {
        return random < 0.80 ? 'bet' : 'pass';
      }
    } else {  // Final call
      return random < 0.60 ? 'bet' : 'pass';
    }
  };

  const shuffleArray = (array) => {
    for (let i = array.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [array[i], array[j]] = [array[j], array[i]];
    }
  };

  const determineWinner = (history, firstPlayer, secondPlayer, firstCard, secondCard) => {
    if (history.length < 2) return null;

    const moves = history.slice(-2);
    
    // Both pass
    if (moves[0].action === 'pass' && moves[1].action === 'pass') {
      return firstCard > secondCard ? firstPlayer : secondPlayer;
    }
    
    // First bets, second passes
    if (moves[0].action === 'bet' && moves[1].action === 'pass') {
      return firstPlayer;
    }
    
    // First passes, second bets
    if (moves[0].action === 'pass' && moves[1].action === 'bet') {
      if (history.length > 2 && history[2].action === 'pass') {
        return secondPlayer;
      }
      return firstCard > secondCard ? firstPlayer : secondPlayer;
    }
    
    // Both bet
    if (moves[0].action === 'bet' && moves[1].action === 'bet') {
      return firstCard > secondCard ? firstPlayer : secondPlayer;
    }
    
    return null;
  };

  const runBotVsBot = () => {
    setIsBotVsBot(true);
    setStats({ cfrWins: 0, stupidWins: 0, total: 0 });
    
    for (let i = 0; i < numGames; i++) {
      playGame();
    }
  };

  const runSlowDemo = async () => {
    setIsDemoRunning(true);
    setIsBotVsBot(true);
    setStats({ cfrWins: 0, stupidWins: 0, total: 0 });
    setGameHistory([]);

    // Play 25 games with 0.5 second delay between each
    for (let i = 0; i < 1000; i++) {
      playGame();
      await new Promise(resolve => setTimeout(resolve, 0)); // 0.5 second pause
    }
    setIsDemoRunning(false);
  };

  const toggleMetrics = () => {
    setShowMetrics(!showMetrics);
  };

  return (
    <div className="app">
      <header className="app-header">
        <h1>Kuhn Poker: CFR Bot vs Stupid Bot</h1>
        <div className="header-buttons">
          <button 
            className={`button-toggle ${showMetrics ? 'active' : ''}`} 
            onClick={toggleMetrics}
          >
            {showMetrics ? 'Hide Training Metrics' : 'Show Training Metrics'}
          </button>
        </div>
      </header>

      {showMetrics && <TrainingMetrics />}
      

      <main className="main-content">
        <div className="game-container">
          <div className="game-controls">
            
            <button 
              className="button-primary" 
              onClick={playGame}
              disabled={isDemoRunning}
            >
              Play Single Game
            </button>
            <button 
              className="button-primary demo-button" 
              onClick={runSlowDemo}
              disabled={isDemoRunning}
            >
              {isDemoRunning ? 'Demo Running...' : 'Run Slow Demo'}
            </button>
            <div className="stats-container">
              <h3>Win Statistics</h3>
              <div className="thermometer-wrapper">
                {/* CFR BOT */}
                <div className="thermometer-group">
                  <div className="percentage-label">
                    {stats.total > 0 ? (stats.cfrWins / stats.total * 100).toFixed(1) : 0}%
                  </div>
                  <div className={`thermometer ${stats.cfrWins >= stats.stupidWins ? 'green' : 'red'}`}>
                    <div
                      className="fill"
                      style={{ height: `${stats.total > 0 ? (stats.cfrWins / stats.total) * 100 : 0}%` }}
                    ></div>
                  </div>
                  <div className="bot-label">CFR Bot</div>
                </div>

                {/* STUPID BOT */}
                <div className="thermometer-group">
                  <div className="percentage-label">
                    {stats.total > 0 ? (stats.stupidWins / stats.total * 100).toFixed(1) : 0}%
                  </div>
                  <div className={`thermometer ${stats.stupidWins > stats.cfrWins ? 'green' : 'red'}`}>
                    <div
                      className="fill"
                      style={{ height: `${stats.total > 0 ? (stats.stupidWins / stats.total) * 100 : 0}%` }}
                    ></div>
                  </div>
                  <div className="bot-label">Stupid Bot</div>
                </div>
              </div>
            </div>
          </div>

          <div className="game-area">
            <PokerTable 
              gameHistory={gameHistory}
              cards={cards}
              onPlayClick={playGame}
              isBotVsBot={isBotVsBot}
            />
          </div>

          <div className="analysis-container">
            <GameHistoryTable history={gameHistory} />
          </div>
        </div>
      </main>

      <footer>
        <p>Kuhn Poker GTO Solver Implementation - CFR Bot vs Stupid Bot</p>
      </footer>
    </div>
  );
}

export default App;