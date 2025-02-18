
/************* Variables *************/

const bulletSize = 5;
let score = 0;
let lives = 3;
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
const displayLives = document.querySelector('.lives span')

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


/************* Tir aleatoire des invaders ***********/
function enemyShoot() {
    if (invaders.length > 0 && Math.random() < 0.03) {
        let shooter = invaders[Math.floor(Math.random() * invaders.length)];
        let bullet = createObjet(shooter.x + 20, shooter.y + 40 , 'bullet enemy-bullet');
        enemyBullets.push(bullet);
        console.log("8888", enemyBullets, "enemyBullets !!")
    }
}


/****************** Player Lives *****************/
function playerLives() {
    const heartsArray = new Array(lives).fill('❤️');
    displayLives.innerHTML = heartsArray.join('');
}


/******************** move Player ***************/
function movePlayer() {

document.addEventListener('keydown', (event) => {

    if (!gameStarted || gamePaused || gameOver) return;

    switch (event.key) {
        case 'ArrowLeft':
            if (player.x > 0) {
                moveObjet(player, player.x - 1, player.y);
            }
            break;
        case 'ArrowRight':
            if (player.x < 550) {
                moveObjet(player, player.x + 1, player.y);
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
}

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
        invaderDirection *= -1; movePlayer() 
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
    if (invaders.length === 0 && !gameOver) { 
        gameStarted = false;
        showPopUp('YOU WIN!');
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

/****************** move player shoot *****************/
function moveBulletsPlayer() {

    if (!gameStarted || gamePaused || gameOver) return;


    for (let i = 0 ; i< bullets.length; i++) {
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
                
                removeObjet(invaders[j]);
                removeObjet(bullets[i]);

                bullets.splice(i, 1);
                invaders.splice(j, 1);
                score += 10;
                displayScore.innerHTML = score;
                break;
            }
        }
    }
}

/*************** move Bullets Invaders **************/

function moveBulletsInvaders() {

    for (let i = 0 ; i< enemyBullets.length; i++) {
        let bulletEn = enemyBullets[i];
        moveObjet(bulletEn, bulletEn.x, bulletEn.y + 5);

        // Verifier sortie de container
        if (bulletEn.y > 550) {
            removeObjet(bulletEn);
            enemyBullets.splice(i, 1);
            continue;
        }

        // Verifier collision avec player
        if (checkCollision(bulletEn, player)) {
            removeObjet(bulletEn);
            enemyBullets.splice(i, 1);
            lives--;
            playerLives();

            if (lives <= 0) {
                gameOver = true;
                showPopUp('GAME OVER!');
                return;
            }
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
            movePlayer() 
            counter = 0
        }

        enemyShoot();
        //movePlayer() 
        moveBulletsInvaders()
        moveInvaders()
        moveBulletsPlayer();
        counter++
        ReqID = requestAnimationFrame(gameLoop)
    }
}

/******************* Timer *******************/
function Timer() {
    if (gamePaused || !gameStarted) return;
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
    timeLeft = 60;
    createInvaders();
    hidePopUp();
    gameLoop()
}

document.addEventListener('keydown', (e) => {
    if (e.key === 'p' || e.key === 'P') pauseGame();
});






