
/************* Variables *************/

const bulletSize = 5;
let score = 0;
let gameOver = false;
let timeLeft = 60;
let invaderDirection = 1;
let gameLoop;
let gamePaused = false; 
let gameStarted = false; 
let invaders = [];
let bullets = [];
let enemyBullets = [];
let shootCooldown = 500;

const startBtn = document.querySelector('.startBtn');
const pauseBtn = document.querySelector('.pauseBtn');
const popUp = document.querySelector('.popUp');
const popUpContent = document.querySelector('.popUp-content');
const displayScore = document.querySelector('.score span');



/************* container *************/
const gameContainer = document.createElement('div');
gameContainer.className = 'game-container';
document.body.appendChild(gameContainer);


let containerBounding = gameContainer.getBoundingClientRect();
console.log("getBoundingClientRect : ", containerBounding);


/******************** Create Object ***************/
function createObjet(x, y, className) {
    let element = document.createElement('div');
    element.className = className;
    element.style.transform = `translate(${x}px, ${y}px)`;
    gameContainer.appendChild(element);
    return {
        x: x,
        y: y,
        element: element
    };
}

/******************** Create player ***************/
let player = createObjet(275, 500, 'player');


/******************** Create invaders ***************/
function createInvaders() {
    for (let row = 0; row < 3; row++) {
        for (let col = 0; col < 9; col++) {
            let x = 50 + (col * 60);
            let y = 50 + (row * 60);
            invaders.push(createObjet(x, y, 'invader'));
        }
    }
}

createInvaders();


/******************** Move Object ***************/
function moveObjet(objet, newX, newY) {
    objet.x = newX;
    objet.y = newY;
    objet.element.style.transform = `translate(${newX}px, ${newY}px)`;
}

/******************** Remove Object ***************/
function removeObjet(objet) {
    objet.element.remove();
}

/******************** player Shoot ***************/
function playerShoot() {
    let bullet = createObjet(player.x + 22, player.y, 'bullet');
    bullets.push(bullet);
}

/******************** move Player ***************/
document.addEventListener('keydown', (event) => {

    if (!gameStarted || gamePaused || gameOver) return;

    switch (event.key) {
        case 'ArrowLeft':
            if (player.x > 0) {
                moveObjet(player, player.x - 5, player.y);
            }
            break;
        case 'ArrowRight':
            if (player.x < 550) {
                moveObjet(player, player.x + 5, player.y);
            }
            break;
        case 'ArrowUp':
            playerShoot();
            break;
    }
});

/***************** Move Invaders *****************/
function moveInvaders() {
    if (!gameStarted || gamePaused) return;
    let touched = false;

    for (let i = 0; i < invaders.length; i++) {
        if ((invaders[i].x > 550 && invaderDirection > 0) || (invaders[i].x < 10 && invaderDirection < 0)) {
            touched = true;
        }
    }

    // Changer de direction une fois toucher le bord (janb)
    if (touched) {
        invaderDirection *= -1;
        for (let i = 0; i < invaders.length; i++) {
            moveObjet(invaders[i], invaders[i].x, invaders[i].y + 20);

            // Game over si les invaders sont tres bas
            if (invaders[i].y > 550) {
                gameOver = true;
                endGame('tssalat lo3ba baraka 3lik 🥲');
            }
        }

    } else {
        // mouvement normal
        for (let i = 0; i < invaders.length; i++) {
            moveObjet(invaders[i], invaders[i].x + (2 * invaderDirection), invaders[i].y);
        }
    }
}

// let invaderBounding = player.getBoundingClientRect();
// console.log("getBoundingClientRect invader : ", invaderBounding);

/****************** Check Colllision *****************/

function checkCollision(elem1, elem2) {
    return elem1.x < elem2.x + 40 &&
           elem1.x + 40 > elem2.x &&
           elem1.y < elem2.y + 40 &&
           elem1.y + 40 > elem2.y;
}

/****************** move player shoot *****************/
function moveBulletsPlayer() {

    if (!gameStarted || gamePaused || gameOver) return;
    setTimeout(() => shootCooldown);
    for (let i = bullets.length - 1; i >= 0; i--) {
        moveObjet(bullets[i], bullets[i].x, bullets[i].y - 5);

        // Verifier sortie de container
        if (bullets[i].y < 0) {
            removeObjet(bullets[i]);
            bullets.splice(i, 1);
            continue;
        }

        // Verifier collision avec invaders
        for (let j = invaders.length - 1; j >= 0; j--) {
            if (checkCollision(bullets[i], invaders[j])) {
            removeObjet(bullets[i]);
            removeObjet(invaders[j]);
            bullets.splice(i, 1);
            invaders.splice(j, 1);
            score += 10;
            displayScore.innerHTML = score;
            break;
            }
        }
    }
}

/******************* Game Loop **********************/
let ReqID = null
let counter = 0
function gameLoo() {

    if (gameStarted) {
        if (counter === 60) {
            Timer()
            alienShoot()
            counter = 0
        }
        counter++

        ReqID = requestAnimationFrame(gameLoo)
   }
}

/******************* Timer *******************/
function Timer() {
    timeLeft--;
    document.getElementsByClassName('timer').textContent = `Timer: ${timeLeft}s`;
    if (timeLeft <= 0) {
        showPopUp('tsala lwa9t 🥲')
    }
}


/*---------------- show PopUp -----------------*/
function showPopUp(message) {
    popUp.style.display = 'flex';
    if (!startGame) {
        popUpContent.innerHTML = `
        <h2>Start Game</h2>
        <button onclick="pauseGame()">startBtn</button>`
    } else {
        popUpContent.innerHTML = `
        <h2>${message}</h2>
        ${message === 'GAME PAUSED' ?
                `<button onclick="pauseGame()">Continue</button>
                 <button onclick="startGame()">Restart</button>` :
                `<button onclick="startGame()">Play Again</button>`
            }
    `;
    }

}

/****************** pauseGame ******************/
function pauseGame() {

    cancelAnimationFrame(ReqID)

    if (!gameStarted) return;

    gamePaused = !gamePaused;
    if (gamePaused) {
        console.log("pause!!!")
        showPopUp('GAME PAUSED');
    } else {
        hidePopUp(); 
    }
}

/****************** Hide PopUp ******************/
function hidePopUp() {
    popUp.style.display = 'none';
}


/***************** Start Game *****************/
function startGame() {
    gameStarted = true;
    createInvaders();
    hidePopUp();
    gameLoop = setInterval(() => {
        if (gameOver) return;
        //Timer()
        moveInvaders()
        moveBulletsPlayer();
        // enemyShoot(); 

        if (invaders.length === 0) {
            endGame('holy 🥳');
        }
    }, 1000 / 10);

    setInterval(Timer, 1000);
}

// startGame()

document.addEventListener('keydown', (e) => {
    if (e.key === 'p' || e.key === 'P') pauseGame();
});
