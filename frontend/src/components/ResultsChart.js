// ResultsChart.js
import React from 'react';
import './ResultsChart.css';

// We'll create a simplified version without using Chart.js for now
const ResultsChart = ({ results }) => {
  return (
    <div className="results-chart">
      <div className="chart-placeholder">
        <h3>Winning Rate</h3>
        {!results ? (
          <p>Loading results data...</p>
        ) : (
          <div className="results-text">
            <p>Results data loaded successfully.</p>
            <div className="result-bars">
              <div className="result-item">
                <div className="label">CFR Win Rate</div>
                <div className="bar-container">
                  <div 
                    className="bar cfr-bar" 
                    style={{ width: `${results.cfr_vs_mccfr?.player0_win_rate * 100 || 50}%` }}
                  ></div>
                  <span>{results.cfr_vs_mccfr?.player0_win_rate?.toFixed(2) || '0.50'}</span>
                </div>
              </div>
              <div className="result-item">
                <div className="label">MCCFR Win Rate</div>
                <div className="bar-container">
                  <div 
                    className="bar mccfr-bar" 
                    style={{ width: `${results.cfr_vs_mccfr?.player1_win_rate * 100 || 50}%` }}
                  ></div>
                  <span>{results.cfr_vs_mccfr?.player1_win_rate?.toFixed(2) || '0.50'}</span>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default ResultsChart;