# EscapeX
A browser-based maze escape game featuring progressively challenging level, BFS-based hunter AI, dynamic gameplay, and a cinematic user interface.

## EscapeX 

### AI-Powered Maze Runner with BFS Enemy

EscapeX is an interactive maze runner game where the player must navigate through a maze and reach the exit while an AI-controlled enemy continuously chases the player using the **Breadth-First Search (BFS)** pathfinding algorithm.

The game is designed to demonstrate **Artificial Intelligence, pathfinding, game logic, and interactive web development** in a visual and demo-friendly way.

---

## Objective

The player's objective is to:

* Navigate through the maze.
* Avoid the AI-controlled enemy.
* Find the exit.
* Reach the exit before being caught.
* Progress through increasingly challenging levels.

The main challenge is that the enemy does not move randomly. It uses **BFS pathfinding to calculate a route toward the player's current position**.

---

## Features

* Maze-based gameplay
* AI-controlled enemy
* BFS pathfinding algorithm
* Player-controlled character
* Exit/goal system
* Win and lose conditions
* Enemy danger detection
* Timer-based gameplay
* Keyboard controls
* Pause and resume
* Fullscreen support
* Progressive difficulty
* Cinematic start/boot screen
* Multiple levels
* Enemy speed increases as the levels progress

---

## AI Enemy – BFS Pathfinding

The main AI feature of EscapeX is the enemy's ability to chase the player using **Breadth-First Search (BFS)**.

BFS is a graph traversal algorithm that can find the shortest path between two points in an unweighted grid.

In EscapeX:

```text
Player Position
      ↓
Current Maze
      ↓
    BFS
      ↓
Find Path to Player
      ↓
Choose Next Position
      ↓
Enemy Moves
      ↓
Repeat
```

The enemy recalculates its path toward the player's current position during gameplay.

This makes the enemy actively **chase the player instead of following a predefined route**.

---

## Gameplay

The game contains multiple levels with progressively increasing difficulty.

As the player progresses:

* Maze layouts become more challenging.
* Enemy movement becomes faster.
* The player has less time to escape.
* Navigation becomes more difficult.

The player must use the maze structure strategically to reach the exit while avoiding the enemy.

---

## Win Condition

The player wins the level by successfully reaching the exit.

```text
Player → Exit
       ↓
   Level Complete
```

After successfully completing a level, the player can progress to the next level.

---

## Lose Condition

The player loses when the AI-controlled enemy catches the player.

```text
Enemy → Player
        ↓
    Player Caught
        ↓
     Game Over
```

The game then displays the appropriate result screen.

---

## Controls

| Key | Action         |
| --- | -------------- |
| ↑   | Move Up        |
| ↓   | Move Down      |
| ←   | Move Left      |
| →   | Move Right     |
| P   | Pause / Resume |

Additional gameplay controls are available through the game's interface.

---

## Technologies Used

### Frontend

* HTML5
* CSS3
* JavaScript

### Algorithm

* Breadth-First Search (BFS)
* Grid-based pathfinding

### Development Concepts

* Game state management
* Event handling
* Collision detection
* Maze generation
* Player movement
* Enemy AI
* Level progression
* Dynamic difficulty

---

## Project Structure

```text
EscapeX/
│
├── frontend/
│   ├── index.html
│   │
│   ├── css/
│   │   └── style.css
│   │
│   └── js/
│       └── game.js
│
├── backend/
│   ├── bfs.py
│   ├── game.py
│   └── main.py
│
├── README.md
└── requirements.txt
```

> **Note:** The current gameplay and BFS implementation are handled by the JavaScript frontend. The backend files are not required for the core gameplay described in this README.

---

## How to Run

### 1. Clone the repository

```bash
git clone https://github.com/YOUR-USERNAME/EscapeX.git
```

### 2. Open the project

```bash
cd EscapeX
```

### 3. Start the game

Open:

```text
frontend/index.html
```

in a modern web browser.

For the best experience, you can also use **VS Code Live Server** to run the frontend.

### 4. Start playing

Use the arrow keys to move through the maze.

Reach the exit before the AI enemy catches you!

---

## How the Game Works

The basic gameplay loop is:

```text
Start Game
    ↓
Generate Maze
    ↓
Place Player
    ↓
Place Enemy
    ↓
Place Exit
    ↓
Player Moves
    ↓
Enemy Calculates BFS Path
    ↓
Enemy Moves Toward Player
    ↓
Check Collision
   ↙       ↘
Caught     Safe
  ↓          ↓
Lose      Continue
             ↓
       Check Exit
        ↙       ↘
      Yes        No
       ↓          ↓
     Win       Continue
```

---

## Concepts Demonstrated

EscapeX demonstrates practical applications of:

* Artificial Intelligence
* Breadth-First Search
* Pathfinding algorithms
* Data Structures and Algorithms
* Maze generation
* Game development
* JavaScript programming
* HTML/CSS development
* Event-driven programming
* Collision detection
* State management
* Progressive difficulty

---

## Why BFS?

BFS is well suited for this project because the maze can be represented as a grid where each valid movement has the same cost.

BFS explores the available positions level by level and can therefore find a shortest path from the enemy to the player.

This makes it simple, reliable, and easy to demonstrate visually.

---

## Future Improvements

Possible improvements for future versions include:

* A* pathfinding for comparison with BFS
* More advanced enemy AI
* Multiple enemies
* Random maze generation
* Power-ups
* Different player abilities
* Sound effects and background music
* Leaderboards
* Player score system
* Mobile and touch controls
* Additional game modes
* Online multiplayer functionality

---

## Project Purpose

EscapeX was developed as a practical demonstration of **AI-based pathfinding in an interactive game environment**.

The project shows how a fundamental algorithm such as **BFS** can be applied to create an enemy that intelligently follows and chases a player.

The visual nature of the project makes the AI behavior easy to understand and demonstrate.

---

##Team Members ##
K Naveen Nayak - Team Lead
Prajwal - Backend/modifing
M A Rihan - Frontend/Ui
Manoj L E - Presentation/testing

B.Tech — Artificial Intelligence & Data Science
Reva University, Bengaluru.

### Areas of Interest

* Artificial Intelligence
* Machine Learning
* Data Structures & Algorithms
* Competitive Programming
* Data Analysis
* IoT
* Software Development

---

## Project Highlight

> **Can you escape before the AI catches you?**

**EscapeX — Where every move matters.**
