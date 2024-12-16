const canvas = document.querySelector('canvas');
const ctx = canvas.getContext('2d');

canvas.width = document.body.clientWidth;
canvas.height = document.body.clientHeight;

addEventListener('resize', () => {
    canvas.width = document.body.clientWidth;
    canvas.height = document.body.clientHeight;
});

class Drop {
    constructor(x) {
        this.x = x
        this.y = -300 - (Math.random() * 100);
        this.xVel = 0;
        this.yVel = 0;
        this.length = 3;
    }

    draw() {
        ctx.lineWidth = 3;
        ctx.beginPath();
        ctx.moveTo(this.x, this.y - this.length);
        ctx.lineTo(this.x, this.y);
        ctx.globalAlpha = 0.7;
        ctx.stroke();
    }

    update(xAccel, yAccel) {
        this.yVel += 0.1; // accel due to gravity

        this.xVel += xAccel;
        this.yVel += yAccel;

        this.x += this.xVel;
        this.y += this.yVel;

        this.draw();
    }
}

const drops = [];

function animate() {
    requestAnimationFrame(animate)
    ctx.globalAlpha = 0.3;
    ctx.fillStyle = 'white';
    ctx.fillRect(0, 0, canvas.width, canvas.height)

    const newDropCount = Math.round(Math.random() * 10);
    for (let i = 0; i< newDropCount; i++)
    {
        const xpos = Math.round(Math.random() * canvas.width);
        drops.push(new Drop(xpos));
    }

    drops.forEach((d, i) => {
        d.update(0, 0);
        
        if (d.y > canvas.height) {
            drops.splice(i, 1);
        }
    });
}

animate();