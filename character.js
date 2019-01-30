/* Scale size of character */
var scale = 1.5;
/* This is used to toggle between attacking poses. 1 is default if the character only has 1 attack pose. */
var attkNum = 1;
var canvas = document.getElementById("gameWorld");
/*
Use this height difference whenever you are using luke_sprites.png and that when the height of
the frame is 2-high. This value is intentionally set to negative. When you apply it to y coordinates, just "+" them.
*/
const LUKE_2_HIGH_DIFF = -105;
/*
The ground height can be changed depending on which platform the character is on. This value
is intentionally set to negative. When you apply it to y coordinates, just "+" them.
*/
var groundHeight = -30;

function Character(game){
    canvas.addEventListener("click", inGameClick);

    //Animation object: spriteSheet, startX, startY, frameWidth, frameHeight, frameDuration, frames, loop, reverse
    this.runAnimation = new Animation(AM.getAsset("./img/luke_sprites.png"), 0, 2310, 96, 70, 0.05, 8, true, false);
    this.jumpAnim = new Animation(AM.getAsset("./img/luke_sprites.png"), 0, 2100, 144, 140, 0.1, 9, false, false);

    this.standAnim = new Animation(AM.getAsset("./img/luke_sprites.png"), 0, 1540, 96, 70, 1, 3, true, false);
    this.crouchAnim = new Animation(AM.getAsset("./img/luke_sprites.png"), 0, 1610, 96, 70, 0.5, 3, true, false);

    // this.cursorAnim = new Animation(AM.getAsset("./img/blueLightsaber.png"), 0, 0, 1647, 1675, 0.5, 1, true, false);

    this.attk1Anim = new Animation(AM.getAsset("./img/luke_sprites.png"), 0, 1820, 144, 140, 0.07, 5, false, false);
    this.attk2Anim = new Animation(AM.getAsset("./img/luke_sprites.png"), 0, 1960, 144, 140, 0.07, 5, false, false);

    this.standing = true;
    this.jumping = false;
    this.running = false;
    this.crouching = false;
    this.attacking = false;

    this.ground = 500;
    this.speed = 1000;

    this.game = game;
    this.ctx = game.ctx;
    Entity.call(this, game, 500, 500);
}
Character.prototype = new Entity();
Character.prototype.constructor = Character;
Character.prototype.update = function () {
    //Running
    if (this.game.d){
      this.running = true;
      this.theD = true;
    } else if (this.game.a){
      this.running = true;
      this.theD = false;
    }

    if (this.running){
      if (this.theD){
        this.x += this.game.clockTick * this.speed;
      } else {
        this.x -= this.game.clockTick * this.speed;
      }
    }
    //Jumping
    if (this.game.w){
        this.jumping = true;
    }
    if (this.jumping){
        if (this.jumpAnim.isDone()) {
            this.jumpAnim.elapsedTime = 0;
            this.jumping = false;
        }
        var jumpDistance = this.jumpAnim.elapsedTime / this.jumpAnim.totalTime;
        var totalHeight = scale * 300;

        if (jumpDistance > 0.5)
            jumpDistance = 1 - jumpDistance;

        var height = totalHeight*(-4 * (jumpDistance * jumpDistance - jumpDistance));
        this.y = this.ground - height;
    }
    //crouching
    if (this.game.s){
      this.crouching = true;
      this.standing = false;
    }
    //Standing
    if (this.game.keyup){
      this.standing = true;
      this.running = false;
      this.crouching = false;
    }

    // Back to Standing after Attacking
    if (this.game.click) {
        this.standing = true;
        this.running = false;
        this.crouching = false;
    }

    if (this.x > 1200 ){
      this.x=0;
    } else if (this.x < 0){
      this.x = 1200;
    }

    // Attacking
    if (this.attacking) {
        if (this.attk1Anim.isDone() || this.attk2Anim.isDone()) {
            this.attk1Anim.elapsedTime = 0;
            this.attk2Anim.elapsedTime = 0;
        }
        this.attacking = true;
        this.standing = false;
    }

    Entity.prototype.update.call(this);
}

Character.prototype.draw = function(){
    // this.cursorAnim.drawFrame(this.game.clockTick, this.ctx, this.game.mouseMoveX - 275 , this.game.mouseMoveY - 125, 0.03);
    if (this.jumping){
        this.jumpAnim.drawFrame(this.game.clockTick, this.ctx, this.x , this.y + groundHeight, scale);
    } else if (this.running){
        this.runAnimation.drawFrame(this.game.clockTick, this.ctx, this.x, this.y + groundHeight, scale);
    } else if (this.standing){
        this.standAnim.drawFrame(this.game.clockTick, this.ctx, this.x, this.y + groundHeight, scale);
    } else if (this.crouching){
        this.crouchAnim.drawFrame(this.game.clockTick, this.ctx, this.x, this.y + groundHeight, scale);
    } else if (this.attacking){
        if (attkNum === 1) {
            this.attk1Anim.drawFrame(this.game.clockTick, this.ctx, this.x - 60, this.y + LUKE_2_HIGH_DIFF + groundHeight, scale);
            if (this.attk1Anim.isDone()) {
                attkNum = 2;
                this.attacking = false;
            }
        } else {
            this.attk2Anim.drawFrame(this.game.clockTick, this.ctx, this.x - 60, this.y + LUKE_2_HIGH_DIFF + groundHeight + 5, scale);
            if (this.attk2Anim.isDone()) {
                attkNum = 1;
                this.attacking = false;
            }
        }
    } else if (!this.attacking) {
        this.attacking = false;
        this.standing = true;
    }
    Entity.prototype.draw.call(this);
}

function inGameClick(event) {
    console.log(event + 'click');
    if (transitionCounter == 0) { // Keep this but move this whole thing to the character class.
        var rect = canvas.getBoundingClientRect();
        var x = event.clientX - rect.left;
        var y = event.clientY - rect.top;
        var audio = AM.getSound('./sounds/Swing2.WAV').cloneNode();
        audio.volume = sfxVolume * 0.2;
        audio.play();
        //console.log(gameEngine.entities[0]);
        gameEngine.entities[0].attacking = true; // entities[0] is luke because we only have one character rn.
    }
}