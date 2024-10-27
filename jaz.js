// helper functions
const PI2 = Math.PI * 2;
const random = (min, max) => Math.random() * (max - min + 1) + min | 0;
const timestamp = _ => new Date().getTime();

// container
class Birthday {
  constructor() {
    this.resize();

    // create a lovely place to store the fireworks
    this.fireworks = [];
    this.counter = 0;
  }
  
  resize() {
    this.width = canvas.width = window.innerWidth;
    let center = this.width / 2 | 0;
    this.spawnA = center - center / 4 | 0;
    this.spawnB = center + center / 4 | 0;
    
    this.height = canvas.height = window.innerHeight;
    this.spawnC = this.height * .1;
    this.spawnD = this.height * .5;
  }
  
  onClick(evt) {
    let x = evt.clientX || evt.touches && evt.touches[0].pageX;
    let y = evt.clientY || evt.touches && evt.touches[0].pageY;
    
    let count = random(3, 5);
    for(let i = 0; i < count; i++) this.fireworks.push(new Firework(
      random(this.spawnA, this.spawnB),
      this.height,
      x,
      y,
      random(0, 360),
      random(30, 110)));
      
    this.counter = -1;
  }
  
  update(delta) {
    ctx.globalCompositeOperation = 'hard-light';
    ctx.fillStyle = `rgba(20,20,20,${7 * delta})`;
    ctx.fillRect(0, 0, this.width, this.height);

    ctx.globalCompositeOperation = 'lighter';
    for (let firework of this.fireworks) firework.update(delta);

    this.counter += delta * 3;
    if (this.counter >= 1) {
      this.fireworks.push(new Firework(
        random(this.spawnA, this.spawnB),
        this.height,
        random(0, this.width),
        random(this.spawnC, this.spawnD),
        random(0, 360),
        random(30, 110)));
      this.counter = 0;
    }

    if (this.fireworks.length > 1000) this.fireworks = this.fireworks.filter(firework => !firework.dead);
  }
}

class Firework {
  constructor(x, y, targetX, targetY, shade, offsprings) {
    this.dead = false;
    this.offsprings = offsprings;

    this.x = x;
    this.y = y;
    this.targetX = targetX;
    this.targetY = targetY;

    this.shade = shade;
    this.history = [];
  }

  update(delta) {
    if (this.dead) return;

    let xDiff = this.targetX - this.x;
    let yDiff = this.targetY - this.y;
    if (Math.abs(xDiff) > 3 || Math.abs(yDiff) > 3) {
      this.x += xDiff * 2 * delta;
      this.y += yDiff * 2 * delta;

      this.history.push({ x: this.x, y: this.y });

      if (this.history.length > 20) this.history.shift();

    } else {
      if (this.offsprings && !this.madeChilds) {
        
        let babies = this.offsprings / 2;
        for (let i = 0; i < babies; i++) {
          let targetX = this.x + this.offsprings * Math.cos(PI2 * i / babies) | 0;
          let targetY = this.y + this.offsprings * Math.sin(PI2 * i / babies) | 0;

          birthday.fireworks.push(new Firework(this.x, this.y, targetX, targetY, this.shade, 0));
        }

        this.madeChilds = true;
      }
      this.history.shift();
    }
    
    if (this.history.length === 0) this.dead = true;
    else if (this.offsprings) { 
      for (let i = 0; i < this.history.length; i++) {
        let point = this.history[i];
        ctx.save();
        ctx.fillStyle = `hsl(${this.shade},100%,${i}%)`;
        ctx.translate(point.x, point.y);
        ctx.scale(0.1, 0.1); // Redimensionamos para hacer los corazones pequeños
        this.drawHeart();
        ctx.restore();
      }
    } else {
      ctx.save();
      ctx.fillStyle = `hsl(${this.shade},100%,50%)`;
      ctx.translate(this.x, this.y);
      ctx.scale(0.1, 0.1); // Redimensionamos para hacer los corazones pequeños
      this.drawHeart();
      ctx.restore();
    }
  }
  
  drawHeart() {
    ctx.beginPath();
    ctx.moveTo(75, 40);
    ctx.bezierCurveTo(75, 37, 70, 25, 50, 25);
    ctx.bezierCurveTo(20, 25, 20, 62.5, 20, 62.5);
    ctx.bezierCurveTo(20, 80, 40, 102, 75, 120);
    ctx.bezierCurveTo(110, 102, 130, 80, 130, 62.5);
    ctx.bezierCurveTo(130, 62.5, 130, 25, 100, 25);
    ctx.bezierCurveTo(85, 25, 75, 37, 75, 40);
    ctx.closePath();
    ctx.fill();
  }
}

let canvas = document.getElementById('birthday');
let ctx = canvas.getContext('2d');

let then = timestamp();

let birthday = new Birthday();
window.onresize = () => birthday.resize();
document.onclick = evt => birthday.onClick(evt);
document.ontouchstart = evt => birthday.onClick(evt);

(function loop(){
  requestAnimationFrame(loop);

  let now = timestamp();
  let delta = now - then;

  then = now;
  birthday.update(delta / 1000);
})();
