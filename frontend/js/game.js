/* =========================================================
   ESCAPEX
   GAME ENGINE
   BFS AI + 15 LEVELS
   ========================================================= */

"use strict";


/* =========================================================
   DOM
   ========================================================= */

const board =
    document.getElementById("game-board");

const bootScreen =
    document.getElementById("boot-screen");

const gameScreen =
    document.getElementById("game-screen");

const progressBar =
    document.getElementById("boot-progress");

const bootPercent =
    document.getElementById("boot-percent");

const bootStatus =
    document.getElementById("boot-status");

const enterButton =
    document.getElementById("enter-button");

const levelNumber =
    document.getElementById("level-number");

const levelName =
    document.getElementById("level-name");

const bottomLevel =
    document.getElementById("bottom-level");

const levelSubtitle =
    document.getElementById("level-subtitle");

const timerElement =
    document.getElementById("timer");

const statusElement =
    document.getElementById("status");

const levelIntro =
    document.getElementById("level-intro");

const introLevel =
    document.getElementById("intro-level");

const introName =
    document.getElementById("intro-name");

const introSubtitle =
    document.getElementById("intro-subtitle");

const dangerOverlay =
    document.getElementById("danger-overlay");

const dangerText =
    document.getElementById("danger-text");

const pauseOverlay =
    document.getElementById("pause-overlay");

const resultOverlay =
    document.getElementById("result-overlay");

const resultEyebrow =
    document.getElementById("result-eyebrow");

const resultTitle =
    document.getElementById("result-title");

const resultSubtitle =
    document.getElementById("result-subtitle");

const resultLevel =
    document.getElementById("result-level");

const livesDisplay =
    document.getElementById("lives-display");

const soundToggle =
    document.getElementById("sound-toggle");

const SOUND_STORAGE_KEY =
    "escapex-sound-muted";


/* =========================================================
   LEVEL DATA
   ========================================================= */

const LEVELS = [

    {
        name: "AWAKENING",
        subtitle: "THE HUNT BEGINS",
        theme: "awakening",
        rows: 15,
        cols: 25,
        enemyDelay: 620,
        seed: 1001,
        extraOpenings: 8
    },

    {
        name: "FIRST CONTACT",
        subtitle: "THE HUNTER HAS AWAKENED",
        theme: "first-contact",
        rows: 15,
        cols: 25,
        enemyDelay: 590,
        seed: 2037,
        extraOpenings: 9
    },

    {
        name: "THE PURSUIT",
        subtitle: "DISTANCE IS COLLAPSING",
        theme: "pursuit",
        rows: 15,
        cols: 25,
        enemyDelay: 560,
        seed: 3019,
        extraOpenings: 10
    },

    {
        name: "DEAD SIGNAL",
        subtitle: "NO SIGNAL. NO HELP.",
        theme: "dead-signal",
        rows: 15,
        cols: 25,
        enemyDelay: 530,
        seed: 4091,
        extraOpenings: 11
    },

    {
        name: "INTO THE DARK",
        subtitle: "VISIBILITY IS A LUXURY",
        theme: "into-dark",
        rows: 17,
        cols: 27,
        enemyDelay: 500,
        seed: 5017,
        extraOpenings: 12
    },

    {
        name: "HUNTER PROTOCOL",
        subtitle: "THE AI IS LEARNING",
        theme: "hunter-protocol",
        rows: 17,
        cols: 27,
        enemyDelay: 470,
        seed: 6073,
        extraOpenings: 13
    },

    {
        name: "NO SAFE PATH",
        subtitle: "EVERY ROUTE HAS A COST",
        theme: "no-safe-path",
        rows: 17,
        cols: 27,
        enemyDelay: 440,
        seed: 7013,
        extraOpenings: 14
    },

    {
        name: "THE MAZE REMEMBERS",
        subtitle: "THE HUNTER REMEMBERS YOUR MOVES",
        theme: "maze-remembers",
        rows: 17,
        cols: 27,
        enemyDelay: 410,
        seed: 8099,
        extraOpenings: 15
    },

    {
        name: "CLOSING DISTANCE",
        subtitle: "RUN FASTER",
        theme: "closing-distance",
        rows: 19,
        cols: 29,
        enemyDelay: 380,
        seed: 9011,
        extraOpenings: 16
    },

    {
        name: "PREDATOR MODE",
        subtitle: "THE HUNTER IS NOW AGGRESSIVE",
        theme: "predator-mode",
        rows: 19,
        cols: 29,
        enemyDelay: 350,
        seed: 10007,
        extraOpenings: 17
    },

    {
        name: "CRITICAL ESCAPE",
        subtitle: "EXIT WINDOW IS CLOSING",
        theme: "critical-escape",
        rows: 19,
        cols: 29,
        enemyDelay: 320,
        seed: 11003,
        extraOpenings: 18
    },

    {
        name: "ZERO VISIBILITY",
        subtitle: "TRUST YOUR INSTINCT",
        theme: "zero-visibility",
        rows: 21,
        cols: 31,
        enemyDelay: 290,
        seed: 12011,
        extraOpenings: 19
    },

    {
        name: "THE LAST ROUTE",
        subtitle: "THERE IS NOWHERE LEFT TO HIDE",
        theme: "last-route",
        rows: 21,
        cols: 31,
        enemyDelay: 260,
        seed: 13007,
        extraOpenings: 20
    },

    {
        name: "FINAL PURSUIT",
        subtitle: "THE HUNTER IS BEHIND YOU",
        theme: "final-pursuit",
        rows: 21,
        cols: 31,
        enemyDelay: 230,
        seed: 14009,
        extraOpenings: 21
    },

    {
        name: "ESCAPEX: TERMINAL",
        subtitle: "THE FINAL EXIT",
        theme: "terminal",
        rows: 21,
        cols: 31,
        enemyDelay: 190,
        seed: 15013,
        extraOpenings: 23
    }

];


/* =========================================================
   GAME STATE
   ========================================================= */

const state = {

    level: 1,

    rows: 15,

    cols: 25,

    grid: [],

    player: {
        row: 1,
        col: 1
    },

    enemy: {
        row: 1,
        col: 1
    },

    exit: {
        row: 1,
        col: 1
    },

    phase: "boot",

    paused: false,

    lives: 3,

    soundMuted: false,

    audioContext: null,

    audioUnlocked: false,

    levelStartedAt: 0,

    elapsedBeforeCatch: 0,

    timerInterval: null,

    enemyTimer: null,

    introTimer: null,

    resultTimer: null,

    dangerDistance: Infinity,

    playerElement: null,

    enemyElement: null,

    exitElement: null

};


/* =========================================================
   SEEDED RANDOM
   ========================================================= */

function seededRandom(seed) {

    let value = seed >>> 0;

    return function () {

        value += 0x6D2B79F5;

        let t = value;

        t = Math.imul(
            t ^ (t >>> 15),
            t | 1
        );

        t ^= t + Math.imul(
            t ^ (t >>> 7),
            t | 61
        );

        return (
            ((t ^ (t >>> 14)) >>> 0)
            / 4294967296
        );
    };
}


/* =========================================================
   SHUFFLE
   ========================================================= */

function shuffle(array, random) {

    for (
        let i = array.length - 1;
        i > 0;
        i--
    ) {

        const j =
            Math.floor(random() * (i + 1));

        [
            array[i],
            array[j]
        ] = [
            array[j],
            array[i]
        ];
    }

    return array;
}


/* =========================================================
   MAZE GENERATION
   ========================================================= */

function generateMaze(rows, cols, seed, extraOpenings) {

    const random =
        seededRandom(seed);

    const grid =
        Array.from(
            { length: rows },
            () => Array(cols).fill(1)
        );


    const directions = [

        [-2, 0],
        [2, 0],
        [0, -2],
        [0, 2]

    ];


    const stack = [
        [1, 1]
    ];

    grid[1][1] = 0;


    while (stack.length > 0) {

        const current =
            stack[stack.length - 1];

        const row =
            current[0];

        const col =
            current[1];


        const possible =
            shuffle(
                [...directions],
                random
            ).filter(
                ([dr, dc]) => {

                    const nr =
                        row + dr;

                    const nc =
                        col + dc;

                    return (
                        nr > 0 &&
                        nr < rows - 1 &&
                        nc > 0 &&
                        nc < cols - 1 &&
                        grid[nr][nc] === 1
                    );
                }
            );


        if (possible.length === 0) {

            stack.pop();

            continue;
        }


        const [dr, dc] =
            possible[0];

        const nr =
            row + dr;

        const nc =
            col + dc;


        grid[
            row + dr / 2
        ][
            col + dc / 2
        ] = 0;


        grid[nr][nc] = 0;

        stack.push([nr, nc]);
    }


    /* -----------------------------------------------------
       ADD LOOPS
       ----------------------------------------------------- */

    const candidates = [];


    for (
        let r = 1;
        r < rows - 1;
        r++
    ) {

        for (
            let c = 1;
            c < cols - 1;
            c++
        ) {

            if (grid[r][c] !== 1) {
                continue;
            }


            let openNeighbors = 0;


            if (grid[r - 1][c] === 0)
                openNeighbors++;

            if (grid[r + 1][c] === 0)
                openNeighbors++;

            if (grid[r][c - 1] === 0)
                openNeighbors++;

            if (grid[r][c + 1] === 0)
                openNeighbors++;


            if (openNeighbors >= 2) {

                candidates.push({
                    row: r,
                    col: c
                });

            }
        }
    }


    shuffle(candidates, random);


    for (
        let i = 0;
        i <
        Math.min(
            extraOpenings,
            candidates.length
        );
        i++
    ) {

        const cell =
            candidates[i];

        grid[cell.row][cell.col] = 0;
    }


    return grid;
}


/* =========================================================
   OPEN CELL CHECK
   ========================================================= */

function isOpen(row, col) {

    return (
        row >= 0 &&
        row < state.rows &&
        col >= 0 &&
        col < state.cols &&
        state.grid[row][col] === 0
    );
}


/* =========================================================
   NEIGHBORS
   ========================================================= */

function getNeighbors(position) {

    const directions = [

        [-1, 0],
        [1, 0],
        [0, -1],
        [0, 1]

    ];

    const result = [];


    for (const [dr, dc] of directions) {

        const row =
            position.row + dr;

        const col =
            position.col + dc;


        if (isOpen(row, col)) {

            result.push({
                row,
                col
            });

        }
    }


    return result;
}


/* =========================================================
   POSITION KEY
   ========================================================= */

function key(position) {

    return `${position.row},${position.col}`;
}


/* =========================================================
   BFS
   ========================================================= */

function bfs(start, target) {

    const queue = [start];

    const visited =
        new Set([key(start)]);

    const parent =
        new Map();


    while (queue.length > 0) {

        const current =
            queue.shift();


        if (
            current.row === target.row &&
            current.col === target.col
        ) {

            const path = [];

            let cursor = current;


            while (cursor) {

                path.unshift(cursor);

                cursor =
                    parent.get(
                        key(cursor)
                    );
            }


            return path;
        }


        for (
            const next
            of getNeighbors(current)
        ) {

            const nextKey =
                key(next);


            if (visited.has(nextKey)) {
                continue;
            }


            visited.add(nextKey);

            parent.set(
                nextKey,
                current
            );

            queue.push(next);
        }
    }


    return [];
}


/* =========================================================
   DISTANCE MAP
   ========================================================= */

function getDistanceMap(start) {

    const queue = [start];

    const distances =
        new Map();

    distances.set(
        key(start),
        0
    );


    while (queue.length > 0) {

        const current =
            queue.shift();

        const currentDistance =
            distances.get(
                key(current)
            );


        for (
            const next
            of getNeighbors(current)
        ) {

            const nextKey =
                key(next);


            if (
                distances.has(nextKey)
            ) {
                continue;
            }


            distances.set(
                nextKey,
                currentDistance + 1
            );

            queue.push(next);
        }
    }


    return distances;
}


/* =========================================================
   FIND EXIT
   FARTHEST CELL FROM PLAYER
   ========================================================= */

function findExit() {

    const distances =
        getDistanceMap(
            state.player
        );


    let farthest =
        state.player;

    let maxDistance = -1;


    for (
        const [
            positionKey,
            distance
        ]
        of distances
    ) {

        if (distance > maxDistance) {

            const [
                row,
                col
            ] =
                positionKey
                    .split(",")
                    .map(Number);


            farthest = {
                row,
                col
            };

            maxDistance = distance;
        }
    }


    return farthest;
}


/* =========================================================
   FIND ENEMY START
   FAR FROM PLAYER AND EXIT
   ========================================================= */

function findEnemyStart() {

    const playerDistances =
        getDistanceMap(
            state.player
        );


    const exitDistances =
        getDistanceMap(
            state.exit
        );


    const candidates = [];


    for (let r = 1; r < state.rows - 1; r++) {

        for (let c = 1; c < state.cols - 1; c++) {

            if (!isOpen(r, c)) {
                continue;
            }


            const position = {
                row: r,
                col: c
            };


            const playerDistance =
                playerDistances.get(
                    key(position)
                ) ?? 0;


            const exitDistance =
                exitDistances.get(
                    key(position)
                ) ?? 0;


            if (playerDistance < 8) {
                continue;
            }


            const score =
                playerDistance * 0.72 +
                exitDistance * 0.28;


            candidates.push({
                position,
                score
            });
        }
    }


    candidates.sort(
        (a, b) =>
            b.score - a.score
    );


    if (candidates.length > 0) {

        return candidates[0].position;
    }


    return {
        row: state.rows - 2,
        col: state.cols - 2
    };
}


/* =========================================================
   CREATE ENTITY
   ========================================================= */

function createEntity(className) {

    const element =
        document.createElement("div");

    element.className =
        className;

    board.appendChild(element);

    return element;
}


/* =========================================================
   POSITION ENTITY
   ========================================================= */

function positionEntity(
    element,
    position
) {

    const x =
        (
            position.col + 0.5
        )
        *
        (100 / state.cols);

    const y =
        (
            position.row + 0.5
        )
        *
        (100 / state.rows);


    element.style.left =
        `${x}%`;

    element.style.top =
        `${y}%`;
}


/* =========================================================
   RENDER MAZE
   ========================================================= */

function renderMaze() {

    board.innerHTML = "";


    board.style.setProperty(
        "--rows",
        state.rows
    );

    board.style.setProperty(
        "--cols",
        state.cols
    );


    const level =
        LEVELS[state.level - 1];


    board.dataset.theme =
        level.theme;


    for (
        let row = 0;
        row < state.rows;
        row++
    ) {

        for (
            let col = 0;
            col < state.cols;
            col++
        ) {

            const cell =
                document.createElement("div");


            cell.className =
                "cell " +
                (
                    state.grid[row][col] === 1
                        ? "wall"
                        : "floor"
                );


            board.appendChild(cell);
        }
    }


    state.playerElement =
        createEntity("player");

    state.enemyElement =
        createEntity("enemy");

    state.exitElement =
        createEntity("exit");


    positionEntity(
        state.playerElement,
        state.player
    );

    positionEntity(
        state.enemyElement,
        state.enemy
    );

    positionEntity(
        state.exitElement,
        state.exit
    );
}


/* =========================================================
   TIMER
   ========================================================= */

function startTimer(preserveElapsed = false) {

    stopTimer();


    state.levelStartedAt =
        Date.now() -
        (preserveElapsed ? state.elapsedBeforeCatch : 0);


    state.timerInterval =
        setInterval(
            updateTimer,
            100
        );
}


function stopTimer() {

    if (
        state.timerInterval
    ) {

        clearInterval(
            state.timerInterval
        );

        state.timerInterval = null;
    }
}


function updateTimer() {

    if (
        state.phase !== "playing" ||
        state.paused
    ) {

        return;
    }


    const elapsed =
        Math.floor(
            (
                Date.now() -
                state.levelStartedAt
            ) / 1000
        );


    const minutes =
        Math.floor(
            elapsed / 60
        )
        .toString()
        .padStart(2, "0");


    const seconds =
        (
            elapsed % 60
        )
        .toString()
        .padStart(2, "0");


    timerElement.textContent =
        `${minutes}:${seconds}`;
}


/* =========================================================
   STATUS
   ========================================================= */

function setStatus(
    text,
    className = "status-ready"
) {

    statusElement.textContent =
        text;

    statusElement.className =
        className;
}


function updateLivesDisplay() {

    if (!livesDisplay) {
        return;
    }

    livesDisplay.textContent =
        String(state.lives);

    livesDisplay.setAttribute(
        "aria-label",
        `${state.lives} ${state.lives === 1 ? "life" : "lives"} remaining`
    );

    livesDisplay.classList.toggle(
        "low",
        state.lives <= 1
    );
}


function loadMutePreference() {

    try {

        return localStorage.getItem(SOUND_STORAGE_KEY) === "true";

    } catch (error) {

        console.warn(
            "Unable to read sound preference:",
            error
        );

        return false;
    }
}


function saveMutePreference() {

    try {

        localStorage.setItem(
            SOUND_STORAGE_KEY,
            String(state.soundMuted)
        );

    } catch (error) {

        console.warn(
            "Unable to save sound preference:",
            error
        );
    }
}


function updateSoundToggle() {

    soundToggle.textContent =
        state.soundMuted ? "🔇" : "🔊";

    soundToggle.classList.toggle(
        "muted",
        state.soundMuted
    );

    soundToggle.setAttribute(
        "aria-label",
        state.soundMuted ? "Unmute sound" : "Mute sound"
    );

    soundToggle.setAttribute(
        "aria-pressed",
        String(state.soundMuted)
    );
}


function unlockAudio() {

    if (state.audioUnlocked) {
        return;
    }

    const AudioCtor =
        window.AudioContext ||
        window.webkitAudioContext;

    if (!AudioCtor) {
        return;
    }

    try {

        state.audioContext =
            new AudioCtor();

        state.audioUnlocked = true;

        if (state.audioContext.state === "suspended") {

            const resumeResult =
                state.audioContext.resume();

            if (resumeResult && typeof resumeResult.catch === "function") {

                resumeResult.catch(error => {

                    console.warn(
                        "Unable to resume audio:",
                        error
                    );
                });
            }
        }

    } catch (error) {

        state.audioContext = null;
        state.audioUnlocked = false;

        console.warn(
            "Audio is unavailable:",
            error
        );
    }
}


function playSfx(type) {

    if (state.soundMuted) {
        return;
    }

    try {

        unlockAudio();

        if (!state.audioContext || !state.audioUnlocked) {
            return;
        }

        const context =
            state.audioContext;

        const oscillator =
            context.createOscillator();

        const gainNode =
            context.createGain();

        const sounds = {
            caught: {
                frequency: 150,
                duration: 0.20,
                wave: "sawtooth",
                volume: 0.045
            },
            life: {
                frequency: 210,
                duration: 0.13,
                wave: "square",
                volume: 0.035
            },
            win: {
                frequency: 520,
                duration: 0.28,
                wave: "triangle",
                volume: 0.045
            },
            gameover: {
                frequency: 105,
                duration: 0.42,
                wave: "sawtooth",
                volume: 0.05
            },
            move: {
                frequency: 260,
                duration: 0.045,
                wave: "triangle",
                volume: 0.018
            },
            button: {
                frequency: 420,
                duration: 0.055,
                wave: "square",
                volume: 0.025
            }
        };

        const sound =
            sounds[type] || sounds.button;

        oscillator.type =
            sound.wave;

        oscillator.frequency.setValueAtTime(
            sound.frequency,
            context.currentTime
        );

        gainNode.gain.setValueAtTime(
            0.0001,
            context.currentTime
        );

        gainNode.gain.exponentialRampToValueAtTime(
            sound.volume,
            context.currentTime + 0.01
        );

        gainNode.gain.exponentialRampToValueAtTime(
            0.0001,
            context.currentTime + sound.duration
        );

        oscillator.connect(gainNode);
        gainNode.connect(context.destination);

        oscillator.start();
        oscillator.stop(
            context.currentTime + sound.duration
        );

    } catch (error) {

        console.warn(
            "Unable to play sound:",
            error
        );
    }
}


/* =========================================================
   PLAYER MOVEMENT
   ========================================================= */

function movePlayer(
    dr,
    dc
) {

    if (
        state.phase !== "playing" ||
        state.paused
    ) {

        return;
    }


    const next = {

        row:
            state.player.row + dr,

        col:
            state.player.col + dc

    };


    if (
        !isOpen(
            next.row,
            next.col
        )
    ) {

        return;
    }


    state.player =
        next;

    playSfx("move");


    positionEntity(
        state.playerElement,
        state.player
    );


    /* movement animation */

    state.playerElement.classList.remove(
        "step"
    );

    void state.playerElement.offsetWidth;

    state.playerElement.classList.add(
        "step"
    );


    updateDanger();


    /*
     * EXIT ALWAYS HAS PRIORITY
     * OVER ENEMY COLLISION.
     */

    if (
        state.player.row ===
            state.exit.row &&
        state.player.col ===
            state.exit.col
    ) {

        winLevel();

        return;
    }


    /*
     * If the player steps directly
     * into the enemy.
     */

    if (
        state.player.row ===
            state.enemy.row &&
        state.player.col ===
            state.enemy.col
    ) {

        caught();

        return;
    }
}


/* =========================================================
   ENEMY DISTANCE
   ========================================================= */

function getEnemyDistance() {

    const path =
        bfs(
            state.enemy,
            state.player
        );


    if (path.length === 0) {

        return Infinity;
    }


    return path.length - 1;
}
let dangerCooldown = false;
let wasDangerClose = false;
function updateDanger() {

    const distance = getEnemyDistance();

    state.dangerDistance = distance;

    const isClose = distance <= 6;

    if (
        isClose &&
        !wasDangerClose &&
        !dangerCooldown &&
        state.phase === "playing"
    ) {

        dangerCooldown = true;

        dangerOverlay.classList.remove("danger-pop");

        void dangerOverlay.offsetWidth;

        dangerOverlay.classList.add("danger-pop");

        setTimeout(() => {

            dangerOverlay.classList.remove("danger-pop");

            dangerCooldown = false;

        }, 950);
    }

    wasDangerClose = isClose;

    if (distance <= 1) {

        dangerText.textContent = "RUN";

        setStatus(
            "DANGER",
            "status-danger"
        );

        return;
    }

    if (distance <= 3) {

        dangerText.textContent = "MOVE";

        setStatus(
            "DANGER",
            "status-danger"
        );

        return;
    }

    if (distance <= 6) {

        dangerText.textContent = "CLOSE";

        setStatus(
            "HUNTING",
            "status-danger"
        );

        return;
    }

    setStatus(
        "HUNTING",
        "status-safe"
    );
}
/* =========================================================
   ENEMY SPEED
   ========================================================= */

function getEnemyDelay() {

    const level =
        LEVELS[state.level - 1];


    let delay =
        level.enemyDelay;


    const distance =
        state.dangerDistance;


    /*
     * The closer the enemy is,
     * the faster it moves.
     */

    if (distance <= 2) {

        delay *= 0.46;

    } else if (distance <= 4) {

        delay *= 0.58;

    } else if (distance <= 6) {

        delay *= 0.70;

    } else if (distance <= 9) {

        delay *= 0.84;
    }


    /*
     * When the player is close
     * to the exit, hunter becomes
     * significantly more aggressive.
     */

    const exitDistance =
        bfs(
            state.player,
            state.exit
        ).length - 1;


    if (exitDistance <= 3) {

        delay *= 0.62;

    } else if (exitDistance <= 6) {

        delay *= 0.78;
    }


    /*
     * Later levels have a stronger
     * minimum pressure.
     */

    const minimum =
        state.level >= 12
            ? 65
            : 85;


    return Math.max(
        minimum,
        Math.floor(delay)
    );
}


/* =========================================================
   ENEMY MOVE
   ========================================================= */

function enemyMove() {

    if (
        state.phase !== "playing" ||
        state.paused
    ) {

        return;
    }


    /*
     * Recalculate BFS EVERY MOVE.
     *
     * This means the enemy does not
     * follow an old path.
     *
     * It reacts to the player's
     * latest position.
     */

    const path =
        bfs(
            state.enemy,
            state.player
        );


    if (
        path.length <= 1
    ) {

        caught();

        return;
    }


    /*
     * Move exactly one BFS step.
     */

    const next =
        path[1];


    state.enemy =
        next;


    /*
     * Faster visual transition
     * at higher levels.
     */

    const delay =
        getEnemyDelay();


    const visualTime =
        Math.max(
            0.07,
            Math.min(
                0.20,
                delay / 1000
            )
        );


    board.style.setProperty(
        "--enemy-transition",
        `${visualTime}s`
    );


    positionEntity(
        state.enemyElement,
        state.enemy
    );


    /*
     * Check collision AFTER movement.
     */

    if (
        state.enemy.row ===
            state.player.row &&
        state.enemy.col ===
            state.player.col
    ) {

        caught();

        return;
    }


    updateDanger();


    scheduleEnemyMove();
}


/* =========================================================
   ENEMY LOOP
   ========================================================= */

function scheduleEnemyMove() {

    clearTimeout(
        state.enemyTimer
    );


    if (
        state.phase !== "playing" ||
        state.paused
    ) {

        return;
    }


    const delay =
        getEnemyDelay();


    state.enemyTimer =
        setTimeout(
            enemyMove,
            delay
        );
}


function stopEnemy() {

    clearTimeout(
        state.enemyTimer
    );

    state.enemyTimer = null;
}


/* =========================================================
   PAUSE
   ========================================================= */

function togglePause() {

    if (
        state.phase !== "playing"
    ) {

        return;
    }


    state.paused =
        !state.paused;


    if (state.paused) {

        pauseOverlay.classList.add(
            "active"
        );

        setStatus(
            "PAUSED"
        );

        stopEnemy();

    } else {

        pauseOverlay.classList.remove(
            "active"
        );

        setStatus(
            "HUNTING",
            "status-safe"
        );

        scheduleEnemyMove();
    }
}


/* =========================================================
   FULLSCREEN
   ========================================================= */

async function toggleFullscreen() {

    try {

        if (!document.fullscreenElement) {

            await document.documentElement
                .requestFullscreen({
                    navigationUI: "hide"
                });

        } else {

            await document.exitFullscreen();
        }

    } catch (error) {

        console.warn(
            "Fullscreen unavailable:",
            error
        );
    }
}


/* =========================================================
   START LEVEL
   ========================================================= */

function startLevel(
    levelNumberValue,
    showIntro = true
) {

    stopEnemy();
    stopTimer();

    clearTimeout(
        state.resultTimer
    );

    state.resultTimer = null;


    clearTimeout(
        state.introTimer
    );


    state.level =
        levelNumberValue;


    const level =
        LEVELS[
            state.level - 1
        ];


    state.rows =
        level.rows;

    state.cols =
        level.cols;


    state.grid =
        generateMaze(
            state.rows,
            state.cols,
            level.seed,
            level.extraOpenings
        );


    state.player = {

        row: 1,

        col: 1

    };


    state.exit =
        findExit();


    state.enemy =
        findEnemyStart();

    state.lives = 3;

    state.elapsedBeforeCatch = 0;

    updateLivesDisplay();


    state.paused = false;

    state.phase =
        showIntro
            ? "intro"
            : "playing";


    /* HUD */

    levelNumber.textContent =
        String(state.level)
            .padStart(2, "0");


    bottomLevel.textContent =
        String(state.level)
            .padStart(2, "0");


    levelName.textContent =
        level.name;


    levelSubtitle.textContent =
        level.subtitle;


    /* Render */

    renderMaze();


    setStatus(
        "READY"
    );


    timerElement.textContent =
        "00:00";


    updateDanger();


    /*
     * Cinematic transition
     */

    board.classList.add(
        "level-changing"
    );


    setTimeout(() => {

        board.classList.remove(
            "level-changing"
        );

    }, 700);


    if (showIntro) {

        showLevelIntro();

    } else {

        beginGameplay();
    }
}


/* =========================================================
   LEVEL INTRO
   ========================================================= */

function showLevelIntro() {

    const level =
        LEVELS[
            state.level - 1
        ];


    introLevel.textContent =
        `LEVEL ${String(state.level).padStart(2, "0")}`;


    introName.textContent =
        level.name;


    introSubtitle.textContent =
        level.subtitle;


    /*
     * Reset animation.
     */

    levelIntro.classList.remove(
        "active"
    );

    void levelIntro.offsetWidth;

    levelIntro.classList.add(
        "active"
    );


    state.introTimer =
        setTimeout(() => {

            levelIntro.classList.remove(
                "active"
            );


            setTimeout(() => {

                beginGameplay();

            }, 650);

        }, 2500);
}


/* =========================================================
   BEGIN GAMEPLAY
   ========================================================= */

function beginGameplay() {

    state.phase =
        "playing";


    state.paused =
        false;


    setStatus(
        "HUNTING",
        "status-safe"
    );


    startTimer();

    updateDanger();

    scheduleEnemyMove();
}


/* =========================================================
   CAUGHT
   ========================================================= */

function caught() {

    if (
        state.phase !== "playing"
    ) {

        return;
    }


    state.phase =
        "caught";


    stopEnemy();

    stopTimer();

    state.elapsedBeforeCatch =
        Math.max(
            0,
            Date.now() - state.levelStartedAt
        );

    state.lives =
        Math.max(
            0,
            state.lives - 1
        );

    updateLivesDisplay();
    playSfx("caught");
    playSfx("life");


    if (state.lives === 0) {

        setStatus(
            "GAME OVER",
            "status-danger"
        );

        resultEyebrow.textContent =
            "ESCAPEX";

        resultTitle.textContent =
            "GAME OVER";

        resultSubtitle.textContent =
            "THE HUNTER CAUGHT YOU.";

        resultLevel.textContent =
            "PRESS R TO RESTART";

        resultOverlay.classList.add(
            "active"
        );

        state.phase =
            "gameover";

        playSfx("gameover");

        return;
    }


    dangerOverlay.classList.remove("danger-pop")


    setStatus(
        "CAUGHT",
        "status-danger"
    );


    resultEyebrow.textContent =
        "HUNTER LOCKED";


    resultTitle.textContent =
        "CAUGHT!";


    resultSubtitle.textContent =
        "YOU LOST A LIFE.";


    resultLevel.textContent =
        `${state.lives} ${state.lives === 1 ? "LIFE" : "LIVES"} REMAINING`;


    resultOverlay.classList.add(
        "active"
    );


    state.resultTimer =
        setTimeout(() => {

            resultOverlay.classList.remove(
                "active"
            );


            respawnPlayer();

        }, 1900);
}


function respawnPlayer() {

    if (state.phase !== "caught") {
        return;
    }

    state.player = {
        row: 1,
        col: 1
    };

    state.enemy =
        findEnemyStart();

    state.phase =
        "playing";

    state.paused = false;

    renderMaze();

    setStatus(
        "HUNTING",
        "status-safe"
    );

    startTimer(true);
    updateDanger();
    scheduleEnemyMove();
}


/* =========================================================
   WIN LEVEL
   ========================================================= */

function winLevel() {

    if (
        state.phase !== "playing"
    ) {

        return;
    }


    state.phase =
        "won";


    stopEnemy();

    stopTimer();

    playSfx("win");


    dangerOverlay.classList.remove(
        "active"
    );


    setStatus(
        "ESCAPED",
        "status-safe"
    );


    /*
     * FINAL LEVEL
     */

    if (
        state.level === LEVELS.length
    ) {

        resultEyebrow.textContent =
            "ESCAPEX COMPLETE";


        resultTitle.textContent =
            "ESCAPED.";


        resultSubtitle.textContent =
            "THE HUNT IS OVER.";


        resultLevel.textContent =
            "ALL 15 LEVELS SURVIVED.";


        resultOverlay.classList.add(
            "active"
        );


        state.resultTimer =
            setTimeout(() => {

                resultOverlay.classList.remove(
                    "active"
                );


                startLevel(
                    1,
                    true
                );

            }, 4500);


        return;
    }


    /*
     * Normal level completion
     */

    resultEyebrow.textContent =
        "LEVEL COMPLETE";


    resultTitle.textContent =
        "ESCAPED.";


    resultSubtitle.textContent =
        "THE HUNT CONTINUES.";


    resultLevel.textContent =
        `NEXT — LEVEL ${String(
            state.level + 1
        ).padStart(2, "0")}`;


    resultOverlay.classList.add(
        "active"
    );


    state.resultTimer =
        setTimeout(() => {

            resultOverlay.classList.remove(
                "active"
            );


            startLevel(
                state.level + 1,
                true
            );

        }, 1800);
}


/* =========================================================
   RESTART CURRENT LEVEL
   ========================================================= */

function restartCurrentLevel() {

    if (
        state.phase === "boot"
    ) {

        return;
    }


    resultOverlay.classList.remove(
        "active"
    );

    pauseOverlay.classList.remove(
        "active"
    );


    startLevel(
        state.level,
        true
    );
}


/* =========================================================
   BOOT ANIMATION
   ========================================================= */

function runBootAnimation() {

    let progress = 0;


    const messages = [

        "INITIALIZING ESCAPEX",
        "BUILDING MAZE ENGINE",
        "LOADING BFS PATHFINDING",
        "INITIALIZING HUNTER",
        "CALIBRATING EXIT",
        "THE HUNT BEGINS"

    ];


    const interval =
        setInterval(() => {

            progress +=
                Math.random() * 4 + 1;


            if (progress >= 100) {

                progress = 100;

                clearInterval(
                    interval
                );


                progressBar.style.width =
                    "100%";


                bootPercent.textContent =
                    "100%";


                bootStatus.textContent =
                    "READY";


                setTimeout(() => {

                    enterButton.classList.add(
                        "visible"
                    );

                }, 350);


                return;
            }


            progressBar.style.width =
                `${progress}%`;


            bootPercent.textContent =
                `${Math.floor(progress)}%`;


            const index =
                Math.min(
                    messages.length - 1,
                    Math.floor(
                        progress /
                        (
                            100 /
                            messages.length
                        )
                    )
                );


            bootStatus.textContent =
                messages[index];

        }, 70);
}


/* =========================================================
   ENTER GAME
   ========================================================= */

async function enterGame() {

    enterButton.disabled =
        true;


    /*
     * Fullscreen requires a user gesture.
     */

    try {

        if (
            !document.fullscreenElement &&
            document.documentElement.requestFullscreen
        ) {

            await document.documentElement
                .requestFullscreen({
                    navigationUI: "hide"
                });
        }

    } catch (error) {

        console.warn(
            "Fullscreen request rejected:",
            error
        );
    }


    bootScreen.classList.add(
        "exit"
    );


    setTimeout(() => {

        gameScreen.classList.remove(
            "hidden"
        );


        startLevel(
            1,
            true
        );

    }, 700);
}


/* =========================================================
   KEYBOARD CONTROLS
   ========================================================= */

window.addEventListener(
    "keydown",
    event => {

        const key =
            event.key.toLowerCase();


        /*
         * Prevent browser scrolling.
         */

        if (
            [
                "arrowup",
                "arrowdown",
                "arrowleft",
                "arrowright",
                " "
            ].includes(key)
        ) {

            event.preventDefault();
        }


        /*
         * Ignore key repeat.
         */

        if (event.repeat) {
            return;
        }


        /*
         * Movement
         */

        switch (key) {

            case "w":
            case "arrowup":

                movePlayer(-1, 0);

                break;


            case "s":
            case "arrowdown":

                movePlayer(1, 0);

                break;


            case "a":
            case "arrowleft":

                movePlayer(0, -1);

                break;


            case "d":
            case "arrowright":

                movePlayer(0, 1);

                break;


            /*
             * Pause
             */

            case "p":
            case "escape":

                togglePause();

                break;


            /*
             * Restart
             */

            case "r":

                restartCurrentLevel();

                break;


            /*
             * Fullscreen
             */

            case "f":

                toggleFullscreen();

                break;
        }

    },
    {
        passive: false
    }
);


/* =========================================================
   ENTER BUTTON
   ========================================================= */

enterButton.addEventListener(
    "click",
    enterGame
);

soundToggle.addEventListener(
    "click",
    () => {

        unlockAudio();

        state.soundMuted =
            !state.soundMuted;

        saveMutePreference();
        updateSoundToggle();

        if (!state.soundMuted) {
            playSfx("button");
        }
    }
);


/* =========================================================
   ENTER WITH KEY
   ========================================================= */

window.addEventListener(
    "keydown",
    event => {

        if (
            state.phase === "boot" &&
            (
                event.key === "Enter" ||
                event.key === " "
            )
        ) {

            if (
                enterButton.classList.contains(
                    "visible"
                )
            ) {

                enterGame();
            }
        }

    }
);


/* =========================================================
   FULLSCREEN CHANGE
   ========================================================= */

document.addEventListener(
    "fullscreenchange",
    () => {

        /*
         * Nothing else needed.
         * CSS automatically fits the viewport.
         */

        if (document.fullscreenElement) {

            document.body.classList.add(
                "is-fullscreen"
            );

        } else {

            document.body.classList.remove(
                "is-fullscreen"
            );
        }

    }
);


/* =========================================================
   INITIALIZE
   ========================================================= */

document.addEventListener(
    "DOMContentLoaded",
    () => {

        state.soundMuted =
            loadMutePreference();

        updateSoundToggle();
        updateLivesDisplay();

        runBootAnimation();

    }
);