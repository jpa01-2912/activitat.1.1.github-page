const canvas = document.getElementById("gameCanvas");
const ctx = canvas.getContext("2d");

const scoreElement = document.getElementById("score");
const bestElement = document.getElementById("best");
const livesElement = document.getElementById("lives");

const startMenu = document.getElementById("startMenu");
const gameOverMenu = document.getElementById("gameOverMenu");

const startButton = document.getElementById("startButton");
const restartButton = document.getElementById("restartButton");

const finalScore = document.getElementById("finalScore");


/* =========================
   VARIABLES DEL JUEGO
========================= */

let gameRunning = false;

let score = 0;
let lives = 3;
let bestScore = 0;

let lastTime = 0;
let meteorTimer = 0;

let meteors = [];

let keys = {
    left: false,
    right: false
};


/* =========================
   JUGADOR
========================= */

const player = {
    x: 400,
    y: 430,

    width: 35,
    height: 25,

    speed: 400,

    invulnerable: 0
};


/* =========================
   ESTRELLAS
========================= */

let stars = [];

for (let i = 0; i < 80; i++) {

    stars.push({
        x: Math.random() * canvas.width,
        y: Math.random() * canvas.height,

        size: Math.random() * 2 + 0.5,

        speed: Math.random() * 30 + 10
    });
}


/* =========================
   DIBUJAR FONDO
========================= */

function drawBackground() {

    const gradient = ctx.createLinearGradient(
        0,
        0,
        0,
        canvas.height
    );

    gradient.addColorStop(0, "#09142b");
    gradient.addColorStop(1, "#030610");

    ctx.fillStyle = gradient;

    ctx.fillRect(
        0,
        0,
        canvas.width,
        canvas.height
    );


    /* Estrellas */

    stars.forEach(star => {

        ctx.fillStyle = "rgba(220,240,255,0.8)";

        ctx.beginPath();

        ctx.arc(
            star.x,
            star.y,
            star.size,
            0,
            Math.PI * 2
        );

        ctx.fill();

    });
}


/* =========================
   DIBUJAR NAVE
========================= */

function drawPlayer() {

    ctx.save();

    ctx.translate(
        player.x,
        player.y
    );


    if (
        player.invulnerable > 0 &&
        Math.floor(player.invulnerable * 10) % 2 === 0
    ) {

        ctx.globalAlpha = 0.4;

    }


    /* Resplandor */

    ctx.shadowBlur = 20;
    ctx.shadowColor = "#48d9ff";


    /* Nave */

    ctx.fillStyle = "#48d9ff";

    ctx.beginPath();

    ctx.moveTo(0, -20);

    ctx.lineTo(20, 15);

    ctx.lineTo(0, 8);

    ctx.lineTo(-20, 15);

    ctx.closePath();

    ctx.fill();


    /* Cabina */

    ctx.fillStyle = "white";

    ctx.beginPath();

    ctx.moveTo(0, -12);

    ctx.lineTo(7, 7);

    ctx.lineTo(0, 4);

    ctx.lineTo(-7, 7);

    ctx.closePath();

    ctx.fill();


    /* Fuego */

    ctx.fillStyle = "#7657ff";

    ctx.beginPath();

    ctx.moveTo(-9, 14);

    ctx.lineTo(-4, 27);

    ctx.lineTo(0, 14);

    ctx.lineTo(4, 27);

    ctx.lineTo(9, 14);

    ctx.closePath();

    ctx.fill();


    ctx.restore();
}


/* =========================
   CREAR METEORITO
========================= */

function createMeteor() {

    const radius =
        15 + Math.random() * 20;

    meteors.push({

        x:
            radius +
            Math.random() *
            (canvas.width - radius * 2),

        y: -radius,

        radius: radius,

        speed:
            120 +
            Math.random() * 120 +
            score * 0.3,

        rotation:
            Math.random() * Math.PI,

        rotationSpeed:
            (Math.random() - 0.5) * 3

    });
}


/* =========================
   DIBUJAR METEORITOS
========================= */

function drawMeteor(meteor) {

    ctx.save();

    ctx.translate(
        meteor.x,
        meteor.y
    );

    ctx.rotate(
        meteor.rotation
    );


    ctx.fillStyle = "#8c6856";

    ctx.shadowBlur = 10;

    ctx.shadowColor =
        "rgba(255,100,50,0.2)";


    ctx.beginPath();


    for (let i = 0; i < 9; i++) {

        const angle =
            i * Math.PI * 2 / 9;

        const size =
            meteor.radius *
            (0.8 + Math.random() * 0.2);

        const x =
            Math.cos(angle) * size;

        const y =
            Math.sin(angle) * size;

        ctx.lineTo(x, y);
    }

    ctx.closePath();

    ctx.fill();


    /* Cráteres */

    ctx.fillStyle = "#60483d";

    ctx.beginPath();

    ctx.arc(
        -meteor.radius * 0.25,
        -meteor.radius * 0.2,
        meteor.radius * 0.18,
        0,
        Math.PI * 2
    );

    ctx.arc(
        meteor.radius * 0.25,
        meteor.radius * 0.15,
        meteor.radius * 0.12,
        0,
        Math.PI * 2
    );

    ctx.fill();


    ctx.restore();
}


/* =========================
   COLISIONES
========================= */

function checkCollision(player, meteor) {

    const distance = Math.sqrt(

        Math.pow(
            player.x - meteor.x,
            2
        )

        +

        Math.pow(
            player.y - meteor.y,
            2
        )

    );


    return (
        distance <
        meteor.radius + 15
    );
}


/* =========================
   ACTUALIZAR JUEGO
========================= */

function update(deltaTime) {

    /* Puntos */

    score += Math.floor(
        deltaTime * 10
    );

    scoreElement.textContent =
        score;


    /* Estrellas */

    stars.forEach(star => {

        star.y +=
            star.speed *
            deltaTime;


        if (star.y > canvas.height) {

            star.y = 0;

            star.x =
                Math.random() *
                canvas.width;

        }

    });


    /* Movimiento */

    if (keys.left) {

        player.x -=
            player.speed *
            deltaTime;

    }

    if (keys.right) {

        player.x +=
            player.speed *
            deltaTime;

    }


    /* Limitar nave */

    player.x =
        Math.max(
            25,
            Math.min(
                canvas.width - 25,
                player.x
            )
        );


    /* Invulnerabilidad */

    if (player.invulnerable > 0) {

        player.invulnerable -=
            deltaTime;

    }


    /* Crear meteoritos */

    meteorTimer -=
        deltaTime;


    if (meteorTimer <= 0) {

        createMeteor();

        meteorTimer =
            Math.max(
                0.25,
                0.7 - score / 2500
            );

    }


    /* Mover meteoritos */

    for (
        let i = meteors.length - 1;
        i >= 0;
        i--
    ) {

        const meteor =
            meteors[i];


        meteor.y +=
            meteor.speed *
            deltaTime;


        meteor.rotation +=
            meteor.rotationSpeed *
            deltaTime;


        /* Fuera de pantalla */

        if (
            meteor.y -
            meteor.radius >
            canvas.height
        ) {

            meteors.splice(i, 1);

            continue;
        }


        /* Colisión */

        if (
            player.invulnerable <= 0 &&
            checkCollision(
                player,
                meteor
            )
        ) {

            meteors.splice(i, 1);

            lives--;

            livesElement.textContent =
                lives;

            player.invulnerable =
                1.5;


            if (lives <= 0) {

                endGame();

                return;
            }
        }
    }
}


/* =========================
   DIBUJAR TODO
========================= */

function draw() {

    drawBackground();


    meteors.forEach(
        drawMeteor
    );


    drawPlayer();
}


/* =========================
   BUCLE DEL JUEGO
========================= */

function gameLoop(time) {

    if (!gameRunning) {
        return;
    }


    const deltaTime =
        Math.min(
            0.035,
            (time - lastTime) / 1000
        );


    lastTime = time;


    update(deltaTime);

    draw();


    requestAnimationFrame(
        gameLoop
    );
}


/* =========================
   EMPEZAR
========================= */

function startGame() {

    score = 0;

    lives = 3;

    meteors = [];

    meteorTimer = 0;

    player.x =
        canvas.width / 2;

    player.invulnerable = 0;


    scoreElement.textContent =
        "0";

    livesElement.textContent =
        "3";


    startMenu.classList.add(
        "hidden"
    );

    gameOverMenu.classList.add(
        "hidden"
    );


    gameRunning = true;

    lastTime =
        performance.now();


    requestAnimationFrame(
        gameLoop
    );
}


/* =========================
   GAME OVER
========================= */

function endGame() {

    gameRunning = false;


    if (score > bestScore) {

        bestScore = score;

        bestElement.textContent =
            bestScore;

    }


    finalScore.textContent =
        score;


    gameOverMenu.classList.remove(
        "hidden"
    );
}


/* =========================
   TECLADO
========================= */

document.addEventListener(
    "keydown",
    event => {

        if (
            event.key === "ArrowLeft" ||
            event.key.toLowerCase() === "a"
        ) {

            keys.left = true;

            event.preventDefault();
        }


        if (
            event.key === "ArrowRight" ||
            event.key.toLowerCase() === "d"
        ) {

            keys.right = true;

            event.preventDefault();
        }

    }
);


document.addEventListener(
    "keyup",
    event => {

        if (
            event.key === "ArrowLeft" ||
            event.key.toLowerCase() === "a"
        ) {

            keys.left = false;

        }


        if (
            event.key === "ArrowRight" ||
            event.key.toLowerCase() === "d"
        ) {

            keys.right = false;

        }

    }
);


/* =========================
   CONTROLES MÓVIL
========================= */

canvas.addEventListener(
    "pointermove",
    event => {

        if (!gameRunning) {
            return;
        }


        const rect =
            canvas.getBoundingClientRect();


        const mouseX =
            event.clientX -
            rect.left;


        player.x =
            mouseX *
            canvas.width /
            rect.width;

    }
);


/* =========================
   BOTONES
========================= */

startButton.addEventListener(
    "click",
    startGame
);


restartButton.addEventListener(
    "click",
    startGame
);


/* =========================
   PRIMER DIBUJADO
========================= */

draw();