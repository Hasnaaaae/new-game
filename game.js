
/************* Variables *************/

const bulletSize = 5;
let score = 0;
let gameOver = false;
let timeLeft = 50;
let invaderDirection = 1;
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
const displayTimer = document.querySelector('.timer');


/************* container *************/
const gameContainer = document.createElement('div');
gameContainer.className = 'game-container';
document.body.appendChild(gameContainer);

let gameContainerRECT = gameContainer.getBoundingClientRect()

console.log("getBoundingClientRect : ", gameContainerRECT.top);


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
        for (let col = 0; col < 5; col++) {
            let x = 50 + (col * 60);
            let y = 50 + (row * 60);
            invaders.push(createObjet(x, y, 'invader'));
        }
    }
}



/******************** Move Object ***************/
function moveObjet(objet, newX, newY) {
    objet.x = newX;
    objet.y = newY;
    objet.element.style.transform = `translate(${newX}px, ${newY}px)`;
}

/******************** Remove Object ***************/
function removeObjet(objet) {
    console.log("removed")
    objet.element.remove();
}

/******************** player Shoot ***************/
function playerShoot() {
    let bullet = createObjet(player.x + 22, player.y, 'bullet');
    bullets.push(bullet);
}

let canShoot = true
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
        case ' ':
            if (canShoot) {
                playerShoot();
                canShoot = false
                setTimeout(() => {
                    canShoot = true

                }, 200)
            }

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
                showPopUp('GAME OVER!');
            }
        }

    } else {
        // mouvement normal
        for (let i = 0; i < invaders.length; i++) {
            moveObjet(invaders[i], invaders[i].x + (2 * invaderDirection), invaders[i].y);
        }
    }
}

let invaderBounding = player.element.getBoundingClientRect();
console.log("getBoundingClientRect invader : ", invaderBounding);

/****************** Check Colllision *****************/

function checkCollision(elem1, elem2) {
       let bulletRECT = elem1.element.getBoundingClientRect()
       let invaderRECT = elem2.element.getBoundingClientRect()
       if (bulletRECT.right <= invaderRECT.left || 
        bulletRECT.left >= invaderRECT.right || 
        bulletRECT.bottom <= invaderRECT.top || 
        bulletRECT.top >= invaderRECT.bottom) {
           return false
        }
        return true
}



/***************** move Bullets Invaders **************/
function moveBulletsInvaders() {
    for (let i = enemyBullets.length - 1; i >= 0; i--) {
        let bullet = enemyBullets[i];
        moveObjet(bullet, bullet.x, bullet.y + 5);

        // Verifier sortie de container
        if (bullet.y > 600) {
            removeObjet(bullet);
            enemyBullets.splice(i, 1);
            continue;
        }

        // Verifier collision avec player
        if (checkCollision(bullet, player)) {
            gameOver = true;
            endGame('Game Over!');
        }
    }
} 


/******************* Game Loop **********************/
let ReqID = null
let counter = 0
function gameLoop() {

    if (gameStarted && !gameOver) {
        if (counter === 60) {
            Timer()
            counter = 0
        }

        moveInvaders()
        moveBulletsPlayer();
        counter++
        ReqID = requestAnimationFrame(gameLoop)
    }
}

/******************* Timer *******************/
function Timer() {
    if (gamePaused) return;
    timeLeft--;
    displayTimer.textContent = `Timer: ${timeLeft}s`;
    if (timeLeft <= 0) {
        gameStarted = false
        showPopUp('TIME\'S UP - GAME OVER!')
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
        showPopUp('GAME PAUSED');
    } else {
        hidePopUp();
        gameLoop();
    }
}

/****************** Hide PopUp ******************/
function hidePopUp() {
    popUp.style.display = 'none';
}


/***************** Start Game *****************/
function startGame() {
    if (gameOver) return;
    gameStarted = true;
    createInvaders();
    hidePopUp();
    gameLoop()
}

document.addEventListener('keydown', (e) => {
    if (e.key === 'p' || e.key === 'P') pauseGame();
});






