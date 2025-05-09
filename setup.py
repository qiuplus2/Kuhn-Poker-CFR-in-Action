# setup.py - Sets up the project structure and dependencies

import os
import subprocess
import sys
import shutil

def create_directory_structure():
    """Create the project directory structure"""
    print("Creating directory structure...")
    
    # Backend directories
    os.makedirs("backend", exist_ok=True)
    
    # Frontend directories
    os.makedirs("frontend/src", exist_ok=True)
    os.makedirs("frontend/src/components", exist_ok=True)
    os.makedirs("frontend/public", exist_ok=True)

def create_backend_files():
    """Create backend Python files"""
    print("Creating backend files...")
    
    # Copy code from previously defined artifacts to backend directory
    files_to_create = {
        "backend/kuhn_poker.py": "kuhn_poker.py",
        "backend/cfr.py": "cfr.py",
        "backend/mccfr.py": "mccfr.py",
        "backend/evaluator.py": "evaluator.py",
        "backend/main.py": "main.py",
        "backend/server.py": "server.py"
    }
    
    for target_path, source_file in files_to_create.items():
        source_path = os.path.join("artifacts", source_file)
        # In a real implementation, we would read the content from artifacts directory
        # For now, we assume the files are already created
        shutil.copy(source_path, target_path)

def create_frontend_files():
    """Create React frontend files"""
    print("Creating frontend files...")
    
    # Creating package.json
    package_json = {
        "name": "kuhn-poker-frontend",
        "version": "0.1.0",
        "private": true,
        "dependencies": {
            "react": "^18.2.0",
            "react-dom": "^18.2.0",
            "react-scripts": "5.0.1",
            "chart.js": "^4.0.0"
        },
        "scripts": {
            "start": "react-scripts start",
            "build": "react-scripts build",
            "test": "react-scripts test",
            "eject": "react-scripts eject"
        },
        "eslintConfig": {
            "extends": [
                "react-app"
            ]
        },
        "browserslist": {
            "production": [
                ">0.2%",
                "not dead",
                "not op_mini all"
            ],
            "development": [
                "last 1 chrome version",
                "last 1 firefox version",
                "last 1 safari version"
            ]
        },
        "proxy": "http://localhost:5000"
    }
    
    with open("frontend/package.json", "w") as f:
        import json
        json.dump(package_json, f, indent=2)
    
    # Copy component files from artifacts
    component_files = {
        "frontend/src/App.js": "App.js",
        "frontend/src/App.css": "App.css",
        "frontend/src/components/PokerTable.js": "PokerTable.js",
        "frontend/src/components/PokerTable.css": "PokerTable.css",
        "frontend/src/components/Card.js": "Card.js",
        "frontend/src/components/Card.css": "Card.css",
        "frontend/src/components/GameHistoryTable.js": "GameHistoryTable.js",
        "frontend/src/components/GameHistoryTable.css": "GameHistoryTable.css",
        "frontend/src/components/StrategyVisualizer.js": "StrategyVisualizer.js",
        "frontend/src/components/StrategyVisualizer.css": "StrategyVisualizer.css",
        "frontend/src/components/ResultsChart.js": "ResultsChart.js",
        "frontend/src/components/ResultsChart.css": "ResultsChart.css"
    }
    
    for target_path, source_file in component_files.items():
        source_path = os.path.join("artifacts", source_file)
        # In a real implementation, we would read the content from artifacts directory
        shutil.copy(source_path, target_path)
    
    # Create index.js
    index_js = """
import React from 'react';
import ReactDOM from 'react-dom/client';
import './index.css';
import App from './App';

const root = ReactDOM.createRoot(document.getElementById('root'));
root.render(
  <React.StrictMode>
    <App />
  </React.StrictMode>
);
"""
    
    with open("frontend/src/index.js", "w") as f:
        f.write(index_js)
    
    # Create index.css
    index_css = """
body {
  margin: 0;
  font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', 'Roboto', 'Oxygen',
    'Ubuntu', 'Cantarell', 'Fira Sans', 'Droid Sans', 'Helvetica Neue',
    sans-serif;
  -webkit-font-smoothing: antialiased;
  -moz-osx-font-smoothing: grayscale;
  background-color: #f0f2f5;
}

code {
  font-family: source-code-pro, Menlo, Monaco, Consolas, 'Courier New',
    monospace;
}
"""
    
    with open("frontend/src/index.css", "w") as f:
        f.write(index_css)
    
    # Create public/index.html
    index_html = """<!DOCTYPE html>
<html lang="en">
  <head>
    <meta charset="utf-8" />
    <link rel="icon" href="%PUBLIC_URL%/favicon.ico" />
    <meta name="viewport" content="width=device-width, initial-scale=1" />
    <meta name="theme-color" content="#000000" />
    <meta
      name="description"
      content="Kuhn Poker: CFR vs MCCFR"
    />
    <title>Kuhn Poker: CFR vs MCCFR</title>
  </head>
  <body>
    <noscript>You need to enable JavaScript to run this app.</noscript>
    <div id="root"></div>
  </body>
</html>
"""
    
    with open("frontend/public/index.html", "w") as f:
        f.write(index_html)

def create_requirements_txt():
    """Create requirements.txt file"""
    requirements = """
Flask==2.0.1
numpy==1.21.2
matplotlib==3.4.3
"""
    
    with open("requirements.txt", "w") as f:
        f.write(requirements)

def create_readme():
    """Create README.md file"""
    readme = """# Kuhn Poker: CFR vs MCCFR Implementation

This project implements Kuhn Poker game with two different solution algorithms:
1. CFR (Counterfactual Regret Minimization)
2. MCCFR (Monte Carlo Counterfactual Regret Minimization)

## Project Structure

- `backend/`: Python implementation of game logic and solvers
  - `kuhn_poker.py`: Kuhn Poker game rules
  - `cfr.py`: CFR solver
  - `mccfr.py`: MCCFR solver
  - `evaluator.py`: Strategy evaluation and comparison
  - `main.py`: Script to run training and evaluation
  - `server.py`: Flask server for connecting to frontend

- `frontend/`: React frontend for visualization
  - User interface to play against the bots
  - Strategy visualization
  - Performance comparison

## Setup

1. Install Python dependencies:
   ```
   pip install -r requirements.txt
   ```

2. Install frontend dependencies:
   ```
   cd frontend
   npm install
   ```

## Running the Application

1. Start the backend server:
   ```
   python backend/server.py
   ```

2. Start the frontend development server:
   ```
   cd frontend
   npm start
   ```

3. Open your browser and navigate to `http://localhost:3000`

## Standalone Usage

You can also run the solvers directly without the UI:

```
python backend/main.py
```

For interactive mode:
```
python backend/main.py --interactive
```

## Notes

This implementation uses:
- Python for backend game logic and solvers
- React.js for the frontend
- Chart.js for data visualization
"""
    
    with open("README.md", "w") as f:
        f.write(readme)

def main():
    """Main setup function"""
    print("Setting up Kuhn Poker project...")
    
    create_directory_structure()
    create_requirements_txt()
    create_readme()
    
    print("""
Setup completed!

To run the project:
1. Install Python dependencies:
   pip install -r requirements.txt

2. Install frontend dependencies:
   cd frontend && npm install

3. Start the backend server:
   python backend/server.py

4. In a new terminal, start the frontend:
   cd frontend && npm start

5. Open your browser and navigate to http://localhost:3000
""")

if __name__ == "__main__":
    main()