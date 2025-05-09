// components/StrategyVisualizer.js
import React, { useState } from 'react';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';
import './StrategyVisualizer.css';

const cardNames = {
  '1': 'Jack (1)',
  '2': 'Queen (2)',
  '3': 'King (3)'
};



const formatInfoSet = (infoSet) => {
  // Format information set like "1:" or "2:BET:PASS" into readable form
  const parts = infoSet.split(':');
  const card = cardNames[parts[0]] || `Card ${parts[0]}`;
  
  let history = '';
  if (parts.length > 1) {
    // Format history of actions
    for (let i = 1; i < parts.length; i++) {
      if (parts[i]) {
        history += ` after ${parts[i].toLowerCase()}`;
      }
    }
  } else {
    history = ' (initial)';
  }
  
  return `${card}${history}`;
};



const StrategyVisualizer = ({ metricsData }) => {
  const [selectedMetric, setSelectedMetric] = useState('strategy');
  const [selectedInfoSet, setSelectedInfoSet] = useState(null);
  
  if (!metricsData || !metricsData.iterations || metricsData.iterations.length === 0) {
    return <div className="loading">No metrics data available. Run training first.</div>;
  }
  
  // Prepare strategy data for the charts
  const infoSets = selectedMetric === 'strategy' 
    ? Object.keys(metricsData.strategies) 
    : Object.keys(metricsData.regrets);
  
  // Default to first info set if none selected
  const currentInfoSet = selectedInfoSet || infoSets[0];
  
  // Format data for the selected info set
  const chartData = metricsData.iterations.map((iteration, idx) => {
    if (selectedMetric === 'strategy') {
      const strategy = metricsData.strategies[currentInfoSet]?.[idx] || [0.5, 0.5];
      return {
        iteration,
        pass: strategy[0],
        bet: strategy[1]
      };
    } else if (selectedMetric === 'regret') {
      const regret = metricsData.regrets[currentInfoSet]?.[idx] || [0, 0];
      return {
        iteration,
        passRegret: regret[0],
        betRegret: regret[1]
      };
    } else { // expected payoff
      return {
        iteration,
        expectedPayoff: metricsData.expected_payoffs[idx]
      };
    }
  });
  
  return (
    <div className="strategy-visualizer">
      <div className="visualizer-controls">
        <div className="metric-selector">
          <label>Select Metric:</label>
          <select
            value={selectedMetric}
            onChange={(e) => {
              setSelectedMetric(e.target.value);
              setSelectedInfoSet(null); // Reset info set when changing metrics
            }}
          >
            <option value="strategy">Strategy Probabilities</option>
            <option value="regret">Regret Values</option>
            <option value="payoff">Expected Payoff</option>
          </select>
        </div>
        
        {selectedMetric !== 'payoff' && (
          <div className="info-set-selector">
            <label>Select Information Set:</label>
            <select
              value={currentInfoSet}
              onChange={(e) => setSelectedInfoSet(e.target.value)}
            >
              {infoSets.map((infoSet) => (
                <option key={infoSet} value={infoSet}>
                  {formatInfoSet(infoSet)}
                </option>
              ))}
            </select>
          </div>
        )}
      </div>
      
      <div className="chart-container">
        <h3>
          {selectedMetric === 'strategy' 
            ? `Strategy Probabilities for ${formatInfoSet(currentInfoSet)}`
            : selectedMetric === 'regret'
              ? `Regret Values for ${formatInfoSet(currentInfoSet)}`
              : 'Expected Payoff Over Iterations'
          }
        </h3>
        
        <ResponsiveContainer width="100%" height={400}>
          <LineChart
            data={chartData}
            margin={{ top: 5, right: 30, left: 20, bottom: 5 }}
          >
            <CartesianGrid strokeDasharray="3 3" />
            <XAxis 
              dataKey="iteration" 
              label={{ value: 'Iterations', position: 'insideBottomRight', offset: -5 }} 
            />
            <YAxis 
              label={{ 
                value: selectedMetric === 'strategy' 
                  ? 'Probability' 
                  : selectedMetric === 'regret' 
                    ? 'Regret Value' 
                    : 'Expected Payoff', 
                angle: -90, 
                position: 'insideLeft' 
              }} 
            />
            <Tooltip />
            <Legend />
            
            {selectedMetric === 'strategy' && (
              <>
                <Line 
                  type="monotone" 
                  dataKey="pass" 
                  name="PASS Probability" 
                  stroke="#8884d8" 
                  activeDot={{ r: 8 }} 
                />
                <Line 
                  type="monotone" 
                  dataKey="bet" 
                  name="BET Probability" 
                  stroke="#82ca9d" 
                  activeDot={{ r: 8 }} 
                />
              </>
            )}
            
            {selectedMetric === 'regret' && (
              <>
                <Line 
                  type="monotone" 
                  dataKey="passRegret" 
                  name="PASS Regret" 
                  stroke="#8884d8" 
                  activeDot={{ r: 8 }} 
                />
                <Line 
                  type="monotone" 
                  dataKey="betRegret" 
                  name="BET Regret" 
                  stroke="#82ca9d" 
                  activeDot={{ r: 8 }} 
                />
              </>
            )}
            
            {selectedMetric === 'payoff' && (
              <Line 
                type="monotone" 
                dataKey="expectedPayoff" 
                name="Expected Payoff" 
                stroke="#ff7300" 
                activeDot={{ r: 8 }} 
              />
            )}
          </LineChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
};

export default StrategyVisualizer;