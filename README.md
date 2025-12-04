# Kuhn Poker CFR in Action

An interactive visualization and implementation of **Counterfactual Regret Minimization (CFR)** for Kuhn Poker — the simplest non-trivial poker variant for studying game theory.

![Kuhn Poker](https://img.shields.io/badge/Game%20Theory-CFR-blue)
![Python](https://img.shields.io/badge/Python-3.11+-green)
![React](https://img.shields.io/badge/React-18.2-61dafb)

## Overview

This project demonstrates how CFR converges to a Nash Equilibrium strategy in Kuhn Poker. Watch in real-time as the algorithm learns optimal play against a simple "Stupid Bot" that always bets.

### What is Kuhn Poker?

Kuhn Poker is a simplified poker variant:
- **3 cards**: Jack (1), Queen (2), King (3)
- **2 players**: Each receives one card
- **2 actions**: Pass (check/fold) or Bet (bet/call)
- **Simple payoffs**: Winner takes 1 or 2 chips depending on betting

### What is CFR?

Counterfactual Regret Minimization is an algorithm that:
1. Simulates all possible game states
2. Tracks "regret" for not taking each action
3. Updates strategy based on cumulative regrets
4. Converges to Nash Equilibrium over iterations

## Project Structure

```
Kuhn-Poker-CFR-in-Action/
├── backend/                    # Python backend
│   ├── cfr.py                 # CFR solver implementation
│   ├── kuhn_poker.py          # Game rules and logic
│   ├── server.py              # Flask API server
│   ├── main.py                # CLI for training/evaluation
│   ├── stupid_bot.py          # Simple always-bet opponent
│   └── generate_cfr_metrics.ipynb  # Jupyter notebook for analysis
├── frontend/                   # React frontend
│   ├── src/
│   │   ├── App.js             # Main application
│   │   ├── components/        # UI components
│   │   │   ├── PokerTable.js  # Game visualization
│   │   │   ├── Card.js        # Card component
│   │   │   ├── TrainingMetrics.js      # CFR training charts
│   │   │   ├── StrategyVisualizer.js   # Strategy visualization
│   │   │   └── ...
│   │   └── data/              # Training metrics data
│   ├── build/                 # Production build
│   └── package.json           # Node dependencies
├── requirements.txt           # Python dependencies
└── README.md                  # This file
```

## Getting Started

### Prerequisites

- Python 3.11+
- Node.js 18+ and npm

### Installation

1. **Clone the repository**
   ```bash
   git clone https://github.com/yourusername/Kuhn-Poker-CFR-in-Action.git
   cd Kuhn-Poker-CFR-in-Action
   ```

2. **Set up Python environment**
   ```bash
   python3 -m venv venv
   source venv/bin/activate  # On Windows: venv\Scripts\activate
   pip install -r requirements.txt
   ```

3. **Install frontend dependencies**
   ```bash
   cd frontend
   npm install
   ```

### Running the Application

#### Option 1: Full-Stack Mode (Recommended)

1. **Start the Flask backend** (Terminal 1):
   ```bash
   cd backend
   python server.py
   ```
   The backend runs on `http://localhost:5000`

2. **Start the React frontend** (Terminal 2):
   ```bash
   cd frontend
   npm start
   ```
   Open `http://localhost:3000` in your browser

#### Option 2: CLI Mode (Training & Evaluation Only)

```bash
cd backend
python main.py --iterations 10000 --eval-games 10000
```

For interactive play:
```bash
python main.py --interactive
```

## Features

### Interactive Gameplay
- Watch CFR Bot vs Stupid Bot matches
- Run single games or batch simulations
- Real-time win statistics with thermometer visualization

### Training Visualization
- Track strategy evolution over iterations
- Monitor regret values and expected payoffs
- View convergence to Nash Equilibrium

### Strategy Analysis
- Information set strategies for each card
- Probability distributions for Pass/Bet actions
- Comparison with optimal play



## License

MIT License - feel free to use this for learning and research!
