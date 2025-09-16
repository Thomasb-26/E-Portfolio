// Smooth scroll navbar
document.querySelectorAll('.nav-links a').forEach(a=>{
  a.addEventListener('click', e=>{
    e.preventDefault();
    const target = document.querySelector(a.getAttribute('href'));
    if(target) target.scrollIntoView({behavior:'smooth'});
  });
});

// Tracking souris (particules simples)
const canvas = document.getElementById('cursor-tracking');
const ctx = canvas.getContext('2d');
canvas.width = window.innerWidth;
canvas.height = window.innerHeight;

let particles = [];

window.addEventListener('mousemove', e=>{
  particles.push({x:e.clientX,y:e.clientY,alpha:1,radius:5});
});

function animate(){
  ctx.clearRect(0,0,canvas.width,canvas.height);
  for(let i=0;i<particles.length;i++){
    let p = particles[i];
    ctx.beginPath();
    ctx.arc(p.x,p.y,p.radius,0,Math.PI*2);
    ctx.fillStyle = `rgba(0,255,255,${p.alpha})`;
    ctx.fill();
    p.alpha -=0.02;
    p.radius +=0.2;
    if(p.alpha<=0) particles.splice(i,1);
  }
  requestAnimationFrame(animate);
}
animate();

window.addEventListener('resize', ()=>{
  canvas.width = window.innerWidth;
  canvas.height = window.innerHeight;
});

