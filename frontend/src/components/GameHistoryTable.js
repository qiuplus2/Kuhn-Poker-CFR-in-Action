// components/GameHistoryTable.js
import React from 'react';
import './GameHistoryTable.css';

const GameHistoryTable = ({ history }) => {
  return (
    <div className="game-history-container">
      <h3>Game History</h3>
      {history.length === 0 ? (
        <p className="no-history">No moves yet</p>
      ) : (
        <table className="game-history-table">
          <thead>
            <tr>
              <th>Turn</th>
              <th>Player</th>
              <th>Action</th>
            </tr>
          </thead>
          <tbody>
            {history.map((move, index) => (
              <tr key={index}>
                <td>{index + 1}</td>
                <td>{move.player.toUpperCase()}</td>
                <td className={move.action === 'bet' ? 'bet-action' : 'pass-action'}>
                  {move.action.toUpperCase()}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      )}
    </div>
  );
};

export default GameHistoryTable;