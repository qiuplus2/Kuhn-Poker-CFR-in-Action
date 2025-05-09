// components/TrainingMetrics.js
import React, { useState } from 'react';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, BarChart, Bar } from 'recharts';
import './TrainingMetrics.css';
import metricsData from '../data/metrics_history.json';

const TrainingMetrics = () => {
  const [data] = useState(metricsData);

  // Helper function for card name display
  const formatCardName = (card) => {
    const cardNames = {
      'J': 'Jack (J)',
      'Q': 'Queen (Q)',
      'K': 'King (K)'
    };
    return cardNames[card] || card;
  };

  // This function is no longer needed as we're using the full time series data directly
  // in the LineChart component

  // Prepare data for the second chart: All regret changes over iterations
  const getAllRegretsData = () => {
    if (!data || !data.iterations || !data.regrets) {
      return [];
    }
    
    const allSeries = [];
    
    // Combine all iteration data
    data.iterations.forEach((iteration, idx) => {
      const point = { iteration };
      
      // Add data for each regret type
      Object.keys(data.regrets).forEach(infoSet => {
        // Use the BET value from each regret (if it exists)
        if (data.regrets[infoSet].BET && data.regrets[infoSet].BET[idx] !== undefined) {
          point[`${infoSet}-BET`] = data.regrets[infoSet].BET[idx];
        }
        // Use the CHECK/CALL value if it exists
        else if (data.regrets[infoSet].CHECK && data.regrets[infoSet].CHECK[idx] !== undefined) {
          point[`${infoSet}-CHECK`] = data.regrets[infoSet].CHECK[idx];
        }
        else if (data.regrets[infoSet].CALL && data.regrets[infoSet].CALL[idx] !== undefined) {
          point[`${infoSet}-CALL`] = data.regrets[infoSet].CALL[idx];
        }
      });
      
      allSeries.push(point);
    });
    
    return allSeries;
  };

  // Define line colors for regret chart
  const regretColors = [
    '#8884d8', '#82ca9d', '#ffc658', '#ff7300', '#0088fe', 
    '#00c49f', '#ffbb28', '#ff8042', '#a4de6c'
  ];

  return (
    <div className="training-metrics">
      <h2>CFR Training Metrics</h2>
      
      <div className="strategy-visualizer">
        {/* First Visualization: Line chart for first round bet probabilities over time */}
        <div className="chart-container">
          <h3>CFR Bot First Round Bet Probabilities Over Time</h3>
          
          {data && data.first_round_strategies && data.iterations ? (
            <ResponsiveContainer width="100%" height={300}>
              <LineChart
                margin={{ top: 5, right: 30, left: 20, bottom: 30 }}
              >
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis 
                  dataKey="iteration"
                  type="number"
                  domain={['dataMin', 'dataMax']}
                  data={data.iterations}
                  label={{ value: 'Iterations', position: 'insideBottomRight', offset: -5 }}
                />
                <YAxis 
                  label={{ value: 'Bet Probability', angle: -90, position: 'insideLeft' }}
                  domain={[0, 1]}
                />
                <Tooltip formatter={(value) => `${(value * 100).toFixed(1)}%`} />
                <Legend />
                {Object.keys(data.first_round_strategies).map((card, index) => (
                  <Line 
                    key={card}
                    data={data.iterations.map((iteration, idx) => ({
                      iteration,
                      value: data.first_round_strategies[card].BET[idx]
                    }))}
                    type="monotone" 
                    dataKey="value"
                    name={`${formatCardName(card)} BET Probability`}
                    stroke={regretColors[index % regretColors.length]}
                    activeDot={{ r: 5 }} 
                  />
                ))}
              </LineChart>
            </ResponsiveContainer>
          ) : (
            <div className="no-data">No bet probability data available.</div>
          )}
        </div>
        
        {/* Second Visualization: Regret changes over iterations */}
        <div className="chart-container">
          <h3>Regret Changes of the CFR Bot</h3>
          
          {data && data.iterations && data.iterations.length > 0 ? (
            <ResponsiveContainer width="100%" height={400}>
              <LineChart
                data={getAllRegretsData()}
                margin={{ top: 5, right: 30, left: 20, bottom: 5 }}
              >
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis 
                  dataKey="iteration" 
                  label={{ value: 'Iterations', position: 'insideBottomRight', offset: -5 }} 
                />
                <YAxis 
                  label={{ 
                    value: 'Regret Value', 
                    angle: -90, 
                    position: 'insideLeft' 
                  }}
                />
                <Tooltip />
                <Legend />
                {Object.keys(data.regrets).map((infoSet, index) => {
                  // Determine what property to use (BET, CHECK, or CALL)
                  const actionType = Object.keys(data.regrets[infoSet])[0];
                  return (
                    <Line 
                      key={infoSet}
                      type="monotone" 
                      dataKey={`${infoSet}-${actionType}`}
                      name={`${infoSet} ${actionType}`}
                      stroke={regretColors[index % regretColors.length]}
                      dot={false}
                      activeDot={{ r: 4 }} 
                    />
                  );
                })}
              </LineChart>
            </ResponsiveContainer>
          ) : (
            <div className="no-data">No regret data available.</div>
          )}
        </div>
      </div>
    </div>
  );
};

export default TrainingMetrics;