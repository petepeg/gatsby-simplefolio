
let gameBoardOne = [
    [1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1],
    [1,9,8,8,8,8,8,8,8,8,8,8,8,8,8,8,8,8,9,1],
    [1,8,1,1,1,1,8,1,1,1,1,1,1,8,1,1,1,1,8,1],
    [1,8,8,8,8,1,8,1,8,8,8,8,1,8,1,8,8,8,8,1],
    [1,8,1,1,8,1,8,1,8,1,1,8,1,8,1,8,1,1,8,1],
    [1,8,1,1,8,8,8,8,8,8,8,8,8,8,8,8,1,1,8,1],
    [1,8,1,1,8,1,1,1,1,1,1,1,1,1,1,8,1,1,8,1],
    [1,8,8,8,8,8,8,8,8,8,8,8,8,8,8,8,8,8,8,1],
    [1,1,1,8,1,1,8,1,1,0,0,1,1,8,1,1,8,1,1,1],
    [0,0,0,8,1,1,8,1,0,0,0,0,1,8,1,1,8,0,0,0],
    [0,0,0,8,1,1,8,1,0,0,0,0,1,8,1,1,8,0,0,0],
    [1,1,1,8,1,1,8,1,1,1,1,1,1,8,1,1,8,1,1,1],
    [1,8,8,8,8,8,8,8,8,8,8,8,8,8,8,8,8,8,8,1],
    [1,8,1,1,8,1,1,1,1,1,1,1,1,1,1,8,1,1,8,1],
    [1,8,1,1,8,8,8,8,8,8,8,8,8,8,8,8,1,1,8,1],
    [1,8,1,1,8,1,8,1,8,1,1,8,1,8,1,8,1,1,8,1],
    [1,8,8,8,8,1,8,1,8,8,8,8,1,8,1,8,8,8,8,1],
    [1,8,1,1,1,1,8,1,1,1,1,1,1,8,1,1,1,1,8,1],
    [1,9,8,8,8,8,8,8,8,8,8,8,8,8,8,8,8,8,9,1],
    [1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1]
]
let gameBoard = JSON.parse(JSON.stringify(gameBoardOne)); // Deep clone
let gameArea = {
    canvas : document.createElement("canvas"),
    start : function() {
        this.canvas.width = 600;
        this.canvas.height = 600;
        this.canvas.id = "canvas";
        this.context = this.canvas.getContext("2d");
        document.body.insertBefore(this.canvas, document.body.childNodes[0]);
        this.frameNo = 0;
        // game speed
        this.interval = setInterval(updateGameArea, 100);
        this.canvas.addEventListener("contextmenu", event => event.preventDefault());
    },
    clear : function() {
        this.context.clearRect(0, 0, this.canvas.width, this.canvas.height);
    }
}
// Global Clock
let clock = 0;
let gamePause = false;
let gameOver = false;
// TODO master entity class, die, pixelchecks will live here as well as shared vars
class Pacman {
    constructor(x,y) {
        this.x = x;
        this.y = y;
        this.speed = 15;
        this.dir = 's';
        this.reqDir = 's'; // requested direction
        this.reqTime = 0;
        this.timeout = 7;
        this.score = 0;
        this.super = false;
        this.scary = false;
        this.deathClock = 0;
        this.timeStart = 0;
        this.lives = 3;
    }

    setDir(direction){
        // Don't let the player stop on a wall, still not great
        if(!this.pixelWallCollision(direction)){
            this.dir = direction;
        }
        this.reqDir = direction; // set a cached input
    }

    setScore(scoreInc) {
        this.score += scoreInc;
    }

    checkKey(e) {

        e = e || window.event;

        if (e.code == 'ArrowUp') {
            // up arrow
            this.setDir('u');
        }
        else if (e.code == 'ArrowDown') {
            // down arrow
            this.setDir('d');
        }
        else if (e.code == 'ArrowLeft') {
            // left arrow
            this.setDir('l');
        }
        else if (e.code == 'ArrowRight') {
            // right arrow
            this.setDir('r');
        } else if (e.code == 'KeyP') {
            // p for pause
            gamePause = true;
        } else {
            console.log(e.code);
        }

    }

    die() {
        this.lives -= 1;
        this.x = 30;
        this.y = 270;
        this.dir = 's';
        this.reqDir = 's';
        this.scary = true;
        this.deathClock = clock;
    }

    pixelCheck(direction) {
        let ctx = gameArea.context
        let pixdata = []
        switch(direction) {
            case 'u':
                pixdata = ctx.getImageData(this.x, (this.y)-1, 30, 1);
                break;
            case 'd':
                pixdata = ctx.getImageData(this.x, (this.y)+30, 30, 1);
                break;
            case 'l':
                pixdata = ctx.getImageData((this.x)-1, this.y, 1, 30);
                break;
            case 'r':
                pixdata = ctx.getImageData((this.x)+30, this.y, 1, 30);
                break;
        }
        
        return pixdata;
    }

    pixelWallCollision(direction) {
        // Checks pixel data for a wall
        let pixelStrip = this.pixelCheck(direction);
        for(let i = 0; i < pixelStrip.data.length-4; i +=4) {
            if(pixelStrip.data[i] + pixelStrip.data[i+1] + pixelStrip.data[i+2] == 0 && pixelStrip.data[i+3] == 255) {
                return true;
            }
        }
        return false
    }

    update() {
        //wrap screen
        if(this.x+30 <= 0) {
            this.x = gameArea.canvas.width-30;
        } else if(this.x >= gameArea.canvas.width) {
            this.x = 0;
        }
        // try and make last input move
        if(this.reqDir != this.dir) {
            this.setDir(this.reqDir);
            this.reqTime += 1;
            console.log('req != dir')
        }
        // timeout cached input
        if(this.reqTime >= this.timeout) {
            this.reqDir = this.dir;
            this.reqTime = 0;
        }
        //movement
        switch(this.dir){
            case 's':
                //still
                break;
            case 'u':
                //up
                if(!this.pixelWallCollision('u')) {
                    this.y -= this.speed;
                }
                break;
            case 'd':
                //down
                if(!this.pixelWallCollision('d')) {
                    this.y += this.speed;
                }
                break;
            case 'l':
                //left
                if(!this.pixelWallCollision('l')) {
                    this.x -= this.speed;
                }
                break;
            case 'r':
                //right
                if(!this.pixelWallCollision('r')) {
                    this.x += this.speed;
                }
                break; 
        }
        // pellets and points
        let gx = Math.floor((this.x+15)/30); // take the center of the players pos and scale into game space
        let gy = Math.floor((this.y+15)/30);
        switch(gameBoard[gy][gx]) {
            case 8:
                this.setScore(1);
                gameBoard[gy][gx] = 0;
                break;
            case 9:
                this.super = true;
                this.scary = true;
                this.timeStart = clock;
                gameBoard[gy][gx] = 0;
                console.log("super start!")
                this.setScore(10);
        }
        // super state
        if(this.super && clock - this.timeStart > 50 ) {
                this.super = false;
                this.scary = false;
                console.log("super over")
        }

        // death scary
        if((this.scary && !this.super) && clock - this.deathClock > 15) {
            this.scary = false;
        }

    }
}

class Ghost {
    constructor(x,y) {
        this.x = x;
        this.y = y;
        this.speed = 15;
        this.alive = true;
        this.deathClock = 0;
        this.bored = false;
        this.timeStart = 0;
    }

    checkForGhost(direction,ghosts) {
        for(let i = 0; i < ghosts.length; i++) {
            let ghost = ghosts[i];
            switch(direction) {
                case 'u':
                    if( (this.x <= ghost.x + 29 && this.x >= ghost.x) || (this.x + 29 >= ghost.x && this.x+29 <= ghost.x + 29) ) {
                        if( (this.y - 1 <= ghost.y + 29 && this.y - 1 >= ghost.y)  ) { 
                            return true; } }
                    break;
                case 'd':
                    if( (this.x <= ghost.x + 29 && this.x >= ghost.x) || (this.x + 29 >= ghost.x && this.x + 29 <= ghost.x + 29) ) {
                        if( (this.y + 30 <= ghost.y + 29 && this.y + 30 >= ghost.y) ) { 
                            return true; } }
                    break;
                case 'l':
                    if( (this.x - 1 <= ghost.x + 29 && this.x - 1 >= ghost.x) ) {
                        if( (this.y <= ghost.y + 29 && this.y >= ghost.y) || (this.y + 29 >= ghost.y && this.y + 29 <= ghost.y + 29)  ) { 
                            return true; } }
                    break;
                case 'r':
                    if( (this.x + 30 <= ghost.x + 29 && this.x + 30 >= ghost.x) ) {
                        if( (this.y <= ghost.y + 29 && this.y >= ghost.y) || (this.y + 29 >= ghost.y && this.y + 29 <= ghost.y + 29)  ) { 
                            return true; } }
                    break;
                default:
                    return false;
            }

        }
        return false;
    }
    pixelCheck(direction) {
        // Get a sliver pixels nest to the entity
        let ctx = gameArea.context
        let pixdata = []
        switch(direction) {
            case 'u':
                pixdata = ctx.getImageData(this.x, this.y-1, 30, 1);
                break;
            case 'd':
                pixdata = ctx.getImageData(this.x, this.y+30, 30, 1);
                break;
            case 'l':
                pixdata = ctx.getImageData(this.x-1, this.y, 1, 30);
                break;
            case 'r':
                pixdata = ctx.getImageData(this.x+30, this.y, 1, 30);
                break;
        }
        
        return pixdata;
    }
    
    pixelWallCollision(direction) {
        // Checks pixel data for a wall
        let pixelStrip = this.pixelCheck(direction);
        for(let i = 0; i < pixelStrip.data.length-4; i +=4) {
            if(pixelStrip.data[i] + pixelStrip.data[i+1] + pixelStrip.data[i+2] == 0 && pixelStrip.data[i+3] == 255) {
                return true;
            }
        }
        return false
    }
    
    die() {
        this.alive = false;
        this.x = 270;
        this.y = 270;
        this.deathClock = clock;
    }

    update(player, ghosts) {
        if(this.alive){
            // basic follow/ run from pacman
            // needs work
            let xDiff = player.x - this.x; 
            let yDiff = player.y - this.y
            // run away 
            if(player.scary || this.bored) {
                if(yDiff < 0 && !this.pixelWallCollision('d') && !this.checkForGhost('d', ghosts) ) {
                    this.y += this.speed;
                } else if(yDiff > 0 && !this.pixelWallCollision('u') && !this.checkForGhost('u', ghosts) ) {
                    this.y -= this.speed;
                } else if(xDiff < 0 && this.x + 45 <= gameArea.canvas.width && !this.pixelWallCollision('r') && !this.checkForGhost('r', ghosts) ) {
                    this. x += this.speed;
                }else if(xDiff > 0 && this.x - 15 >= 0 && !this.pixelWallCollision('l') && !this.checkForGhost('l', ghosts) ) {
                    this. x -= this.speed;
                } else {
                    console.log("ghost stuck");
                }
            // run towards
            } else {
                if(yDiff > 0 && !this.pixelWallCollision('d') && !this.checkForGhost('d', ghosts) ) {
                    this.y += this.speed;
                } else if(yDiff < 0 && !this.pixelWallCollision('u') && !this.checkForGhost('u', ghosts) ) {
                    this.y -= this.speed;
                } else if(xDiff > 0 && !this.pixelWallCollision('r') && !this.checkForGhost('r', ghosts) ) {
                    this. x += this.speed;
                } else if(xDiff < 0 && !this.pixelWallCollision('l') && !this.checkForGhost('l', ghosts) ) {
                    this. x -= this.speed;
                } else {
                    console.log("ghost bored");
                    this.bored = true;
                    this.timeStart = clock;
                }
            }

            // check for pacman
            if( (this.x <= player.x+29 && this.x >= player.x) || (this.x+29 >= player.x && this.x+29 <= player.x+29) ) {
                if( (this.y <= player.y+29 && this.y >= player.y) || (this.y+29 >= player.y && this.y+29 <= player.y+29)  ) {
                    if(player.super){
                        this.die();
                        player.setScore(50);
                    } else {
                        player.die();
                    }
                }
            }

            // get distracted
            if(clock % 30 == 0) {
                this.bored = true;
                this.timeStart = clock;
            }
            // bored timer
            if(this.bored && clock - this.timeStart > 5) {
                this.bored = false;
            }

        } else { //if dead
            console.log("I'm dead")
            if(clock - this.deathClock > 50) {
                this.alive = true;
            }
        }

    }

}

function pelletCheck(player, ghosts) {
    let result = false;
    for(let i = 0; i < gameBoard.length; i++){
        if( gameBoard[i].includes(8) ){
             result = true;
        }
    }

    if(!result) {
        nextLevel(player, ghosts)
    }
}

function nextLevel(player, ghosts) {
    // reset board
    gameBoard = JSON.parse(JSON.stringify(gameBoardOne));
    player.x = 30;
    player.y = 270;
    player.dir = 's';
    player.reqDir = 's';
    for(let i = 0; i < ghosts.length; i++) {
        ghost = ghosts[i];
        ghost.x = 240+(i*30);
        ghost.y = 270;
    }
}

function restartGame(player, ghosts) {
    nextLevel(player,ghosts);
    player.score = 0;
    player.lives = 3;
    gamePause = false;
    gameOver = false;
}

function lifeCheck(player) {
    if(player.lives <= 0){
        gamePause = true;
        gameOver = true;
    }
}

function drawScreen(player, ghosts) {
    ctx = gameArea.context;

    //draw board
    ctx.fillStyle = '#0000c8';
    ctx.fillRect(0,0,600,600);
    for(let i = 0; i< gameBoard.length; i++) {
        for(let j = 0; j < gameBoard.length; j++) {
            //pellets
            switch(gameBoard[i][j]){
                //walls
                case 1:
                    ctx.fillStyle = 'black';
                    ctx.fillRect(j*30, i*30, 30, 30)
                    break;
                //pellets
                case 8:
                    ctx.fillStyle = '#edd100';
                    ctx.fillRect((j*30)+15, (i*30)+15, 6, 6)
                    break;
                //super pellets
                case 9:
                    ctx.fillStyle = '#edd100';
                    ctx.fillRect((j*30)+15, (i*30)+15, 12, 12)
                    break;
            }
        }
    }

    //draw player
    if(player.super){
        ctx.fillStyle = 'red';
        ctx.strokeStyle = 'red';
    } else {
        ctx.fillStyle = '#edd100';
        ctx.strokeStyle = '#edd100';
    }
    // ctx.fillRect(player.x, player.y, 30,30); // test square
    // animated pac
    if(clock % 3 == 0) {
        ctx.lineWidth = '1';
        switch(player.dir) {
            case 'u':
                ctx.beginPath();
                ctx.moveTo(player.x+5,player.y+5);
                ctx.lineTo(player.x+15,player.y+15),
                ctx.lineTo(player.x+25,player.y+5);
                ctx.arc(player.x+15,player.y+15,15,1.75*Math.PI,1.25*Math.PI, false);
                ctx.stroke();
                ctx.fill();
                break;
            case 'd':
                ctx.beginPath();
                ctx.moveTo(player.x+5,player.y+25);
                ctx.lineTo(player.x+15,player.y+15),
                ctx.lineTo(player.x+25,player.y+25);
                ctx.arc(player.x+15,player.y+15,15,0.25*Math.PI,0.75*Math.PI, true);
                ctx.stroke();
                ctx.fill();
                break;
            case 'l':
                ctx.beginPath();
                ctx.moveTo(player.x+5,player.y+5);
                ctx.lineTo(player.x+15,player.y+15),
                ctx.lineTo(player.x+5,player.y+25);
                ctx.arc(player.x+15,player.y+15,15,0.75*Math.PI,1.25*Math.PI, true);
                ctx.stroke();
                ctx.fill();
                break;
            case 'r':
                ctx.beginPath();
                ctx.moveTo(player.x+25,player.y+5);
                ctx.lineTo(player.x+15,player.y+15),
                ctx.lineTo(player.x+25,player.y+25);
                ctx.arc(player.x+15,player.y+15,15,0.25*Math.PI,1.75*Math.PI, false);
                ctx.stroke();
                ctx.fill();
                break;
            default:
                ctx.beginPath();
                ctx.moveTo(player.x+25,player.y+5);
                ctx.lineTo(player.x+15,player.y+15),
                ctx.lineTo(player.x+25,player.y+25);
                ctx.arc(player.x+15,player.y+15,15,0.25*Math.PI,1.75*Math.PI);
                ctx.stroke();
                ctx.fill();
                break;
            
        }
    } else {
        ctx.beginPath();
        ctx.lineWidth = '1';
        ctx.arc(player.x+15,player.y+15,15,0,2*Math.PI);
        ctx.stroke();
        ctx.fill();
    }

    // draw ghosts
    let ghostColors = {
        0:'green',
        1:'purple',
        2:'pink'
    }
    for(let i = 0; i < ghosts.length; i++) {
        ghost = ghosts[i];
        ctx.strokeStyle = ghostColors[i];
        ctx.fillStyle = ghostColors[i];
        //ctx.fillRect(ghost.x, ghost.y, 30, 30); // test rect
        // body
        ctx.beginPath();
        ctx.moveTo(ghost.x + 1, ghost.y + 15);
        ctx.lineTo(ghost.x + 1, ghost.y + 29);
        ctx.lineTo(ghost.x + 29, ghost.y + 29);
        ctx.lineTo(ghost.x + 29, ghost.y + 15);
        ctx.arc(ghost.x + 15, ghost.y + 15, 14, 0, Math.PI, true);
        ctx.stroke();
        ctx.fill();
         
        // eyes
        ctx.beginPath();
        ctx.strokeStyle = 'white';
        ctx.fillStyle = 'white';
        ctx.moveTo(ghost.x + 10, ghost.y + 10);
        ctx.arc(ghost.x + 10, ghost.y + 10,3,0,2*Math.PI);
        ctx.moveTo(ghost.x + 20, ghost.y + 10);
        ctx.arc(ghost.x + 20, ghost.y + 10,3,0,2*Math.PI);
        ctx.stroke();
        ctx.fill();
    }

    //update clock
    clock += 1;

}

function drawPauseScreen(){
    ctx = gameArea.context;
    ctx.font = "30px Console";
    if(gameOver){
        ctx.fillText("GAME OVER", 211, 300);
        ctx.fillText("R To Restart", 220, 412);
    } else {
        ctx.fillText("PAUSE", 250, 300);

    }

}

// Entity Inst
let player = new Pacman(30,270);
let ghosts = [
    new Ghost(270,270),
    new Ghost(270,300),
    new Ghost(330,270),
];

// Game Loop area
function updateGameArea() {
    if(!gamePause) {
        document.onkeydown = function(e){player.checkKey(e)};
    
        player.update();
        for(let i = 0; i < ghosts.length; i++) {
            ghost = ghosts[i];
            ghost.update(player, ghosts);
        }
        
        gameArea.clear();
        drawScreen(player, ghosts);
    
        document.getElementById("player_score").innerHTML = player.score;
        document.getElementById("player_lives").innerHTML = player.lives;
        
        pelletCheck(player, ghosts);
        lifeCheck(player);

    } else {
        // Game over / Pause Screen
        document.onkeydown = function(e){
            e = e || window.event;
            if (e.code == 'KeyP') {
                // p for unpause
                gamePause = false;
            } else if (e.code == 'KeyR') {
                // restart game
                console.log('Restart Game')
                restartGame(player,ghosts);

            } else {
                console.log(e.code)
            }
        };
        drawPauseScreen();
    }

}

