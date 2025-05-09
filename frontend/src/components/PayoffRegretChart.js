import React, { useEffect, useRef } from 'react';
import './PayoffRegretChart.css';

const PayoffRegretChart = ({ iterations, payoffs, regrets }) => {
  const canvasRef = useRef(null);
  
  useEffect(() => {
    if (!canvasRef.current || iterations.length === 0) return;
    
    const canvas = canvasRef.current;
    const ctx = canvas.getContext('2d');
    const width = canvas.width;
    const height = canvas.height;
    
    // Clear canvas
    ctx.clearRect(0, 0, width, height);
    
    // Calculate scales
    const maxIteration = Math.max(...iterations);
    const minPayoff = Math.min(...payoffs, 0);
    const maxPayoff = Math.max(...payoffs, 0);
    const payoffRange = Math.max(Math.abs(minPayoff), Math.abs(maxPayoff)) * 2;
    
    const maxRegret = Math.max(...regrets, 1);
    
    // Draw axes
    ctx.beginPath();
    ctx.strokeStyle = '#333';
    ctx.lineWidth = 1;
    
    // X-axis (iterations)
    const xAxisY = height / 2;  // Center of canvas
    ctx.moveTo(50, xAxisY);
    ctx.lineTo(width - 20, xAxisY);
    
    // Y-axis (payoff)
    ctx.moveTo(50, 20);
    ctx.lineTo(50, height - 20);
    
    ctx.stroke();
    
    // Draw labels
    ctx.fillStyle = '#333';
    ctx.font = '12px Arial';
    ctx.textAlign = 'center';
    
    // X-axis label
    ctx.fillText('Iterations', width / 2, height - 5);
    
    // Y-axis labels
    ctx.textAlign = 'right';
    ctx.fillText('Payoff', 45, 15);
    ctx.fillText(`+${payoffRange/2}`, 45, 30);
    ctx.fillText(`0`, 45, xAxisY);
    ctx.fillText(`-${payoffRange/2}`, 45, height - 30);
    
    // Draw secondary Y-axis for regret
    ctx.textAlign = 'left';
    ctx.fillText('Regret', width - 15, 15);
    ctx.fillText(`${maxRegret}`, width - 15, 30);
    ctx.fillText(`0`, width - 15, height - 30);
    
    // Draw grid lines
    ctx.beginPath();
    ctx.strokeStyle = '#ddd';
    ctx.setLineDash([5, 5]);
    
    // Horizontal grid lines
    ctx.moveTo(50, 30);
    ctx.lineTo(width - 20, 30);
    ctx.moveTo(50, height - 30);
    ctx.lineTo(width - 20, height - 30);
    
    // Vertical grid lines - every 500 iterations
    const iterationStep = 500;
    for (let i = 0; i <= maxIteration; i += iterationStep) {
      const x = 50 + ((width - 70) * i) / maxIteration;
      ctx.moveTo(x, 20);
      ctx.lineTo(x, height - 20);
      
      // Label for iteration
      ctx.fillText(`${i}`, x, xAxisY + 15);
    }
    
    ctx.stroke();
    ctx.setLineDash([]);
    
    // Draw expected payoff line
    if (payoffs.length > 1) {
      ctx.beginPath();
      ctx.strokeStyle = '#1890ff';
      ctx.lineWidth = 2;
      
      for (let i = 0; i < payoffs.length; i++) {
        const x = 50 + ((width - 70) * iterations[i]) / maxIteration;
        const y = xAxisY - ((payoffs[i] * (height - 60)) / payoffRange);
        
        if (i === 0) {
          ctx.moveTo(x, y);
        } else {
          ctx.lineTo(x, y);
        }
      }
      
      ctx.stroke();
      
      // Add label for expected payoff line
      ctx.fillStyle = '#1890ff';
      ctx.textAlign = 'left';
      ctx.fillText('Expected Payoff', 60, 45);
    }
    
    // Draw regret line
    if (regrets.length > 1) {
      ctx.beginPath();
      ctx.strokeStyle = '#f5222d';
      ctx.lineWidth = 2;
      
      for (let i = 0; i < regrets.length; i++) {
        const x = 50 + ((width - 70) * iterations[i]) / maxIteration;
        const y = height - 30 - ((regrets[i] * (height - 60)) / maxRegret);
        
        if (i === 0) {
          ctx.moveTo(x, y);
        } else {
          ctx.lineTo(x, y);
        }
      }
      
      ctx.stroke();
      
      // Add label for regret line
      ctx.fillStyle = '#f5222d';
      ctx.textAlign = 'right';
      ctx.fillText('Regret Sum', width - 30, 45);
    }
    
    // Draw moving average of expected payoff
    if (payoffs.length > 30) {
      ctx.beginPath();
      ctx.strokeStyle = '#722ed1';
      ctx.lineWidth = 2;
      const windowSize = 30; // 30-game moving average
      
      for (let i = windowSize; i < payoffs.length; i++) {
        const windowSum = payoffs.slice(i - windowSize, i).reduce((sum, val) => sum + val, 0);
        const movingAvg = windowSum / windowSize;
        
        const x = 50 + ((width - 70) * iterations[i]) / maxIteration;
        const y = xAxisY - ((movingAvg * (height - 60)) / payoffRange);
        
        if (i === windowSize) {
          ctx.moveTo(x, y);
        } else {
          ctx.lineTo(x, y);
        }
      }
      
      ctx.stroke();
      
      // Add label for moving average
      ctx.fillStyle = '#722ed1';
      ctx.textAlign = 'left';
      ctx.fillText('30-game Moving Avg', 60, 60);
    }
  }, [iterations, payoffs, regrets]);
  
  return (
    <div className="payoff-regret-chart">
      <h3>Expected Payoff & Regret Over Time</h3>
      <canvas 
        ref={canvasRef} 
        width={800} 
        height={400}
        className="chart-canvas"
      />
      <div className="chart-explanation">
        <p>This chart shows how the CFR bot improves over time:</p>
        <ul>
          <li><span className="blue-dot"></span> <strong>Expected Payoff</strong>: The average payoff the CFR bot receives against the Stupid bot.</li>
          <li><span className="red-dot"></span> <strong>Regret Sum</strong>: Total accumulated regret, which should decrease as the algorithm converges.</li>
          <li><span className="purple-dot"></span> <strong>Moving Average</strong>: Smoothed view of the expected payoff (30-game window).</li>
        </ul>
      </div>
    </div>
  );
};

export default PayoffRegretChart;