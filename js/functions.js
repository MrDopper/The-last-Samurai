const canvas = document.getElementById('myCanvas');
const ctx = canvas.getContext('2d');
canvas.width = 1080;
canvas.height = 640;

//Gobal varible
const JUMP = -15;
const LEFT_MOVE = -5;
const RIGHT_MOVE = 5;
const DOUBLE_JUMP = 2;
const MIDDLE_BAR = canvas.width / 2;
const MIDDLE_SCREEN = canvas.height / 2;
let time = 99; //Game time 
let timeID;
let isRunning = true;
ctx.clearRect(0, 0, canvas.width, canvas.height);
//An array that store all the keys with a set of value to false
const keys = {
    a: { pressed: false },
    d: { pressed: false },
    w: { pressed: false },
    ArrowLeft: { pressed: false },
    ArrowRight: { pressed: false },
    ArrowUp: { pressed: false }
};

//Background for the map
const map = new Sprite({
    position: { x: 0, y: 0 },
    imageSrc: "./assets/maps/map1.png"
});
const shop = new Sprite({
    position: { x: 750, y: 254 },
    imageSrc: "./assets/objects/shop.png",
    scale: 2.6,
    frame: 6,
    timeHold: 12
});
const lamp = new Sprite({
    position: { x: 685, y: 473 },
    imageSrc: "./assets/objects/lamp.png",
    scale: 2
});
//I created an entity for player
const player = new Fighter({
    position: { x: 270, y: 0 },
    velocity: { x: 0, y: 0 },
    colour: 'yellow',
    attackBoxOffset: {
        x: 0,
        y: 0
    },
    health: 100,
    imageSrc: "./assets/Characters_Sprites/IDLE.png",
    frame: 10,
    scale: 3,
    offset: {
        x: 120,
        y: 92
    },
    timeHold: 7,
    spriteSheet: {
        idle_left: {
            imageSrc: "./assets/Characters_Sprites/IDLE_LEFT.png",
            frame: 10,
            timeHold: 7
        }
        , idle: {
            imageSrc: "./assets/Characters_Sprites/IDLE.png",
            frame: 10,
            timeHold: 7
        },
        run: {
            imageSrc: "./assets/Characters_Sprites/RUN.png",
            frame: 16,
            timeHold: 7
        },
        run_left: {
            imageSrc: "./assets/Characters_Sprites/RUN_LEFT.png",
            frame: 16,
            timeHold: 7
        },
        attack: {
            imageSrc: "./assets/Characters_Sprites/ATTACK.png",
            frame: 7,
            timeHold: 3
        },
        attack_left: {
            imageSrc: "./assets/Characters_Sprites/ATTACK_LEFT.png",
            frame: 7,
            timeHold: 3
        }
    }
});

//I created an entity for enemy
const enemy = new Fighter({
    position: { x: 800, y: 40 },
    velocity: { x: 0, y: 0 },
    colour: 'red',
    offset: {
        x: 0,
        y: 0
    },
    health: 100,
    imageSrc: "./assets/Characters_Sprites/IDLE_LEFT.png",
    frame: 10,
    scale: 3,
    offset: {
        x: 120,
        y: 92
    },
    timeHold: 7,
    spriteSheet: {
        idle_left: {
            imageSrc: "./assets/Characters_Sprites/IDLE_LEFT.png",
            frame: 10,
            timeHold: 7
        }
        , idle: {
            imageSrc: "./assets/Characters_Sprites/IDLE.png",
            frame: 10,
            timeHold: 7
        },
        run: {
            imageSrc: "./assets/Characters_Sprites/RUN.png",
            frame: 16,
            timeHold: 7
        },
        run_left: {
            imageSrc: "./assets/Characters_Sprites/RUN_LEFT.png",
            frame: 16,
            timeHold: 7
        },
        attack: {
            imageSrc: "./assets/Characters_Sprites/ATTACK.png",
            frame: 7,
            timeHold: 3
        },
        attack_left: {
            imageSrc: "./assets/Characters_Sprites/ATTACK_LEFT.png",
            frame: 7,
            timeHold: 3
        }
    }
});

// Cooldown for dashing
player.dashCooldown = false;
enemy.dashCooldown = false;

function drawStaticElements(MIDDLE_BAR) {
    // Health bar frames
    ctx.fillStyle = "white";
    ctx.strokeStyle = "black";
    ctx.lineWidth = 2;
    ctx.fillRect(40, 40, MIDDLE_BAR - 80, 30); // Player frame
    ctx.strokeRect(40, 40, MIDDLE_BAR - 80, 30);
    ctx.fillRect(MIDDLE_BAR + 40, 40, MIDDLE_BAR - 80, 30); // Enemy frame
    ctx.strokeRect(MIDDLE_BAR + 40, 40, MIDDLE_BAR - 80, 30);

    // Timer background (blue box)
    ctx.fillStyle = "rgba(173, 216, 230, 0.5)";
    ctx.beginPath();
    ctx.lineTo(MIDDLE_BAR - 20, 40);
    ctx.lineTo(MIDDLE_BAR + 20, 40);
    ctx.lineTo(MIDDLE_BAR + 40, 60);
    ctx.lineTo(MIDDLE_BAR + 20, 70);
    ctx.lineTo(MIDDLE_BAR - 20, 70);
    ctx.lineTo(MIDDLE_BAR - 40, 60);
    ctx.closePath();
    ctx.fill();
    ctx.stroke();
}

function determineWinner({ player, enemy, timeID }) {
    clearInterval(timeID);
    isRunning = false;
    ctx.fillStyle = "rgba(91, 186, 156, 0.8)";
    ctx.font = "50px bold fantasy";
    ctx.textAlign = "center";
    ctx.textBaseline = "middle";
    if (player.health === enemy.health) {
        ctx.fillText("Tie", MIDDLE_BAR, MIDDLE_SCREEN);
        window.cancelAnimationFrame(animate);
    }
    else if (player.health <= 0 || enemy.health > player.health) {
        ctx.fillText("Player 2 wins", MIDDLE_BAR, MIDDLE_SCREEN);
        window.cancelAnimationFrame(animate);
    }
    else if (enemy.health <= 0 || player.health > enemy.health) {
        ctx.fillText("Player 1 wins", MIDDLE_BAR, MIDDLE_SCREEN);
        window.cancelAnimationFrame(animate);
    }

}

function updateTimer(MIDDLE_BAR) {
    // Timer text inside the blue box
    ctx.fillStyle = "black";
    ctx.font = "20px Arial";
    ctx.textAlign = "center";
    ctx.textBaseline = "middle";
    ctx.fillText(time, MIDDLE_BAR, 55);

    if (time === 0 && enemy.health > player.health) {
        determineWinner({ player, enemy, timeID });
    }
    else if (time === 0 && enemy.health < player.health) {
        determineWinner({ player, enemy, timeID });
    }
    else if (time === 0) {
        determineWinner({ player, enemy, timeID });
    }
}

//Function check if character hitbox is within the range
function checkAttackCollision({ rectangle1, rectangle2 }) {
    return (rectangle1.attackBox.position.x + rectangle1.attackBox.width >= rectangle2.position.x &&
        rectangle1.attackBox.position.x <= rectangle2.position.x + rectangle2.width &&
        rectangle1.attackBox.position.y + rectangle1.attackBox.height >= rectangle2.position.y &&
        rectangle1.attackBox.position.y <= rectangle2.position.y + rectangle2.height)
}
function damage(MIDDLE_BAR, time) {
    const healthBarWidth = MIDDLE_BAR - 80;
    if (time > 0) {
        //Player health bar
        if (player.health > 0) {
            ctx.fillStyle = "green";
            const playerHealthWidth = (player.health / 100) * healthBarWidth;
            ctx.fillRect(40, 40, playerHealthWidth, 30);
        }
        if (enemy.health > 0) {
            // Enemy health bar
            ctx.fillStyle = "green";
            const enemyHealthWidth = (enemy.health / 100) * healthBarWidth;
            const enemyStartX = MIDDLE_BAR + 40 + (healthBarWidth - enemyHealthWidth); //Start point from x
            ctx.fillRect(enemyStartX, 40, enemyHealthWidth, 30);
        }
    }
}

function animate() {
    if (isRunning) {
        window.requestAnimationFrame(animate);    //A loop funciton that keep calling animate function when the window still open
    }
    ctx.fillStyle = "white";
    ctx.fillRect(0, 0, canvas.width, canvas.height); //Fill draw out the game 
    map.update();
    shop.update();
    lamp.update();
    drawStaticElements(MIDDLE_BAR);
    damage(MIDDLE_BAR, time); //Health bar 
    updateTimer(MIDDLE_BAR);
    player.update(enemy);
    enemy.update(player);

    //If the d key is pressed then moves character to the right
    if (keys.d.pressed && !keys.a.pressed) {
        player.velocity.x = RIGHT_MOVE;
        player.updateAnimation("run");
        player.facingLeft = false;
    }
    else if (keys.a.pressed && !keys.d.pressed) {
        player.velocity.x = LEFT_MOVE;
        player.updateAnimation("run_left");
        player.facingLeft = true;
    }
    else {
        player.velocity.x = 0;     //Reset the velocity if nothing is pressed or the if statement is false
        if (player.facingLeft == true) {
            player.updateAnimation("idle_left");
        }
        else {
            player.updateAnimation("idle");
        }
    }
    enemy.facingLeft = true;
    //For enemy
    if (keys.ArrowRight.pressed && !keys.ArrowLeft.pressed) {
        enemy.velocity.x = RIGHT_MOVE;
        enemy.updateAnimation("run");
        enemy.facingLeft = false;
    }
    else if (keys.ArrowLeft.pressed && !keys.ArrowRight.pressed) {
        enemy.velocity.x = LEFT_MOVE;
        enemy.updateAnimation("run_left");
        enemy.facingLeft = true;
    }
    else {
        enemy.velocity.x = 0;     //Reset the velocity if nothing is pressed or the if statement is false
        if (enemy.facingLeft == true) {
            enemy.updateAnimation("idle_left");
        }
        else {
            enemy.updateAnimation("idle");
        }
    }
    //Check collision when player is attacking
    if (checkAttackCollision({
        rectangle1: player,
        rectangle2: enemy
    }) && player.isAttack) {
        player.isAttack = false; //Reset player's attack action
        enemy.health -= 5;
    }
    //Check collision when enemy is attacking
    if (checkAttackCollision({
        rectangle1: enemy,
        rectangle2: player
    }) && enemy.isAttack) {
        enemy.isAttack = false; //Reset enemy's attack action
        player.health -= 5;
    }
    if (player.health <= 0 || enemy.health <= 0) {
        determineWinner({ player, enemy, timeID });
    }
}


//When the keys are pressed
window.addEventListener("keydown", (event) => {
    switch (event.key) {
        case 'd':
            keys.d.pressed = true;
            break;
        case 'a':
            keys.a.pressed = true;
            break;
        case 'w':
            if (player.jumpCount < DOUBLE_JUMP) {
                player.velocity.y = JUMP;
                player.jumpCount++;
            }
            break;
        case " ":
            player.attack();
            break;

        case 'ArrowLeft':
            keys.ArrowLeft.pressed = true;
            break;
        case 'ArrowRight':
            keys.ArrowRight.pressed = true;
            break;
        case 'ArrowUp':
            if (enemy.jumpCount < 2) {
                enemy.velocity.y = JUMP;
                enemy.jumpCount++;
            }
            break;
        case 'k':
            enemy.attack();
            break;
    }
}
);

//When the keys are not pressing
window.addEventListener("keyup", (event) => {
    switch (event.key) {
        case 'd':
            keys.d.pressed = false;
            break;
        case 'a':
            keys.a.pressed = false;
            break;

        case 'ArrowLeft':
            keys.ArrowLeft.pressed = false;
            break;
        case 'ArrowRight':
            keys.ArrowRight.pressed = false;
            break;
    }
});

timeID = setInterval(() => {
    if (time > 0) {
        time--;
    }
}, 1000);

drawStaticElements(MIDDLE_BAR);

animate();
