var AM = new AssetManager();

AM.queueDownload("./img/RobotUnicorn.png");
AM.queueDownload("./img/guy.jpg");
AM.queueDownload("./img/mushroomdude.png");
AM.queueDownload("./img/runningcat.png");
AM.queueDownload("./img/notthere.png");

AM.downloadAll(function () {
	var canvas = document.getElementById("gameWorld");
	var ctx = canvas.getContext("2d");

	var img = AM.getAsset("./img/mushroomdude.png");

	ctx.drawImage(img,
                  0, 0,  // source from sheet
                  189, 230, // width and height of source
                  200, 200, // destination coordinates
                  95, 115); // destination width and height

	console.log("All Done!");

	var DAMPING = 0.9999;
	var GRAVITY = 0.3;

	function Particle(x, y) {
		this.lifespan = 100;
		this.x = this.oldX = x;
		this.y = this.oldY = y;
	}

	function StatusBars() {
		this.health = 100;
		this.stamina = 100;
	}

	StatusBars.prototype.update = function(healthMod, staminaMod) {
		var newHealth = this.health + healthMod;
		var newStamina = this.stamina + staminaMod;
		if (newHealth > 100) {
			this.health = 100;
		} else if (newHealth < 0) {
			this.health = 0;
		} else {
			this.health += healthMod;
		} 
		if (newStamina > 100) {
			this.stamina = 100;
		} else if (newStamina < 0) {
			this.stamina = 0;
		} else {
			this.stamina += staminaMod;
		}
	};

	StatusBars.prototype.draw = function() {
		//ctx.save();
		ctx.beginPath();
		ctx.strokeStyle = "black";
		ctx.rect(20, 20, 500, 30);
		ctx.rect(20, 60, 500, 20);
		ctx.stroke();
		ctx.beginPath();
		ctx.fillStyle = "red";
		ctx.rect(21, 21, this.health * 5 - 2, 28);
		ctx.fill();
		ctx.beginPath();
		ctx.fillStyle = "yellow";
		ctx.rect(21, 61, this.stamina * 5 - 2, 18);
		ctx.fill();
		//ctx.restore();
	}

	Particle.prototype.integrate = function() {
		var velocity = this.getVelocity();
		this.oldX = this.x;
		this.oldY = this.y;
		this.x += velocity.x * DAMPING;
		this.y += velocity.y * DAMPING;
	};

	Particle.prototype.getVelocity = function() {
		return {
			x: this.x - this.oldX,
			y: this.y - this.oldY
		};
	};

	Particle.prototype.move = function(x, y) {
		this.x += x;
		this.y += y;
	};

	Particle.prototype.bounce = function() {
		if (this.y > canvas.height) {
			var velocity = this.getVelocity();
			this.oldY = canvas.height;
			this.y = this.oldY - velocity.y * 0.3;
		}
	};

	Particle.prototype.draw = function() {
		ctx.strokeStyle = '#ffffff';
		ctx.lineWidth = 3;
		ctx.beginPath();
		ctx.moveTo(this.oldX, this.oldY);
		ctx.lineTo(this.x, this.y);
		ctx.stroke();
	};

	var sparks = [];
	var flash = [];
	var statusBars = new StatusBars();

	function radialGradient(x, y, radius) {
		this.lifespan = 20;
		this.alpha = 1;
		this.radius = radius;
		this.x = x;
		this.y = y;
	}

	radialGradient.prototype.draw = function() {
		this.alpha = this.alpha - 0.1;
		ctx.save();
		ctx.globalAlpha = this.alpha;
		var grd = ctx.createRadialGradient(this.x, this.y, 5, this.x, this.y, this.radius);
		grd.addColorStop(0, 'white');
		grd.addColorStop(1, 'lightskyblue');
		ctx.arc(this.x, this.y, this.radius, 0, 2 * Math.PI);
		ctx.fillStyle = grd;
		ctx.fill();
		ctx.restore();
	}

	function createSparks(x, y) {
		statusBars.update(0, -10);
		var particleCount = Math.random() * (3) + 2;
		for (var i = 0; i < particleCount; i++) {
			var spark = new Particle(x, y);
			spark.move(Math.random() * 5 - 2.5, Math.random() * -5);
			sparks.push(spark);
		}
		flash.push(new radialGradient(x, y, Math.random() * 20 + 40));
	}
	//ctx.globalCompositeOperation = 'overlay';
	requestAnimationFrame(frame);

	function frame() {
		requestAnimationFrame(frame);
		//createSparks(400, 400);
		ctx.clearRect(0, 0, canvas.width, canvas.height);
		while (sparks.length > 0 && sparks[0].lifespan <= 0.1) {
			sparks.shift();
		}
		for (var i = 0; i < sparks.length; i++) {	statusBars.draw();
			sparks[i].move(0, GRAVITY);
			sparks[i].integrate();
			sparks[i].bounce();
			sparks[i].draw();
			sparks[i].lifespan--;
		}
		while (flash.length > 0 && flash[0].alpha < 0.1) {
			flash.shift();
		}
		for (var i = 0; i < flash.length; i++) {
			flash[i].draw();
		}
		statusBars.update(0.1, 0.1);
		statusBars.draw();
	}

	canvas.addEventListener('click', function(event) {
		var rect = canvas.getBoundingClientRect();
		var x = event.clientX - rect.left;
		var y = event.clientY - rect.top;
		createSparks(x, y);
	}, false);
});this.stamina + staminaMod