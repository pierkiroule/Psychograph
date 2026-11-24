// Independent procedural grammars. All randomness belongs to the recipe.
export const names=['Fluidité','Rugosité','Légèreté','Chaleur','Fraîcheur','Fragilité','Diffusion','Intensité','Croissance','Profondeur','Luminosité','Turbulence'];
const palettes=['#f2ead9 #252923 #897459 #b0b7a2','#101a24 #b7cdd0 #547e91 #eacda0','#f7f4ec #171b22 #7e8990 #b6a18f','#281c25 #cf8460 #e8c7aa #713c52','#103a38 #d5e4ba #78b2a0 #e1a655','#eee8f1 #3e2452 #8f699e #c6b4d5','#191919 #eeeeee #777777 #bbbbbb','#f5d7a0 #312c4c #cc6548 #58778c','#152026 #b6c3d1 #de9970 #55786c','#fefefe #111111 #bd3230 #777777'].map(p=>p.split(' '));
export function recipe(forces=[],previous=-1){const seed=(Math.random()*2**32)>>>0;let mode=Math.floor(Math.random()*16);if(forces.length&&Math.random()<.65)mode=forces[Math.floor(Math.random()*forces.length)];if(mode===previous)mode=(mode+1+Math.floor(Math.random()*15))%16;return {seed,mode,forces:[...forces]}}
export function paint(canvas,rec,size=800){
canvas.width=canvas.height=size;const g=canvas.getContext('2d');const S=1000;g.scale(size/S,size/S);let seed=rec.seed;const rand=()=>{seed=(Math.imul(seed,1664525)+1013904223)>>>0;return seed/2**32},r=(a,b)=>a+(b-a)*rand(),pick=a=>a[Math.floor(rand()*a.length)],T=Math.PI*2;
const P=pick(palettes),ink=()=>pick(P.slice(1));let cx=r(250,750),cy=r(250,750),angle=r(0,T);g.fillStyle=P[0];g.fillRect(0,0,S,S);
const line=(pts,col,w=1,a=1,close=false)=>{g.globalAlpha=a;g.strokeStyle=col;g.lineWidth=w;g.beginPath();pts.forEach(([x,y],i)=>i?g.lineTo(x,y):g.moveTo(x,y));if(close)g.closePath();g.stroke();g.globalAlpha=1};
const blob=(x,y,rad,stretch,col,a,fill=true)=>{let pts=[],ph=r(0,T),f=r(2,7);for(let j=0;j<=100;j++){let t=j*T/100,d=rad*(1+.23*Math.sin(t*f+ph)+.12*Math.cos(t*11+ph));pts.push([x+d*Math.cos(t),y+stretch*d*Math.sin(t)])}g.beginPath();pts.forEach(([x,y],i)=>i?g.lineTo(x,y):g.moveTo(x,y));g.closePath();g.globalAlpha=a;g.fillStyle=g.strokeStyle=col;if(fill)g.fill();else g.stroke();g.globalAlpha=1;return pts};
const mist=(x,y,rad,col,a)=>{const z=g.createRadialGradient(x,y,0,x,y,rad);z.addColorStop(0,col);z.addColorStop(1,col+'00');g.globalAlpha=a;g.fillStyle=z;g.fillRect(x-rad,y-rad,rad*2,rad*2);g.globalAlpha=1};
function branch(x,y,t,len,d){if(d<0)return;let xx=x+Math.cos(t)*len,yy=y+Math.sin(t)*len;line([[x,y],[xx,yy]],ink(),Math.max(.4,d*1.3),r(.2,.9));for(let j=0;j<2;j++)branch(xx,yy,t+r(-1,1),len*r(.59,.79),d-1)}
function wash(x,y,rad){let col=ink();for(let j=0;j<15;j++)blob(x+r(-8,8),y+r(-8,8),rad*(1-j*.013),r(.5,1),col,.045)}
function crystal(x,y,rad){let pts=Array.from({length:6},(_,i)=>[x+rad*Math.cos(i*T/6+angle)*r(.6,1.3),y+rad*Math.sin(i*T/6+angle)]);g.beginPath();pts.forEach(([x,y],i)=>i?g.lineTo(x,y):g.moveTo(x,y));g.closePath();g.fillStyle=ink();g.globalAlpha=r(.12,.7);g.fill();g.globalAlpha=1;for(let p of pts)line([p,[x,y]],P[2],.8,.5)}
function grammar(m,minor=false){let k=minor?.25:1;switch(m){
case 0:for(let i=0;i<20*k;i++)wash(r(0,S),r(0,S),r(40,280));break;
case 1:for(let i=0;i<2500*k;i++){let x=r(0,S),y=r(0,S),d=r(1,100);line([[x,y],[x+d*Math.cos(angle),y+d*Math.sin(angle)]],ink(),r(.3,7),r(.03,.5))}break;
case 2:for(let i=0;i<28*k;i++){let x=r(0,S),y=r(0,S);mist(x,y,r(100,450),ink(),r(.1,.5))}break;
case 3:for(let i=0;i<15*k;i++){let x=r(0,S),y=r(0,S),d=r(40,200);blob(x,y,d,.8,P[1],.8);mist(x,y,d*.8,P[3],.9)}break;
case 4:for(let i=0;i<90*k;i++)crystal(r(0,S),r(0,S),r(15,110));break;
case 5:for(let i=0;i<45*k;i++){let x=r(0,S),y=r(0,S);branch(x,y,r(0,T),r(25,90),3)}break;
case 6:for(let i=0;i<85*k;i++)mist(r(0,S),r(0,S),r(30,220),ink(),r(.06,.4));break;
case 7:for(let i=0;i<18*k;i++){let x=r(0,S),y=r(0,S);g.save();g.translate(x,y);g.rotate(angle+r(-.3,.3));g.globalAlpha=r(.2,.9);g.fillStyle=ink();g.fillRect(0,0,r(10,300),r(2,85));g.restore()}break;
case 8:for(let i=0;i<8*k;i++)branch(cx+r(-160,160),cy+r(-160,160),r(0,T),r(70,170),7);break;
case 9:for(let i=0;i<12*k;i++){let x=r(0,S),y=r(0,S),d=r(50,250);for(let j=0;j<24;j++)blob(x+j*2,y+j,d+j*3,.65,ink(),.13,false)}break;
case 10:for(let i=0;i<9*k;i++){let x=r(0,S),y=r(0,S),d=r(40,200);let pts=blob(x,y,d,.55,P[2],.15);for(let j=0;j<100;j++)line([[x,y],pick(pts)],P[2],.6,.12)}break;
case 11:for(let i=0;i<650*k;i++){let t=r(0,T),d=r(10,480);line(Array.from({length:32},(_,j)=>[cx+d*Math.cos(t+j*.07),cy+d*Math.sin(t+j*.07)]),ink(),r(.3,2),r(.03,.4))}break;
case 12:for(let i=0;i<6*k;i++){let x=r(100,900),y=r(100,900);blob(x,y,r(80,240),r(.2,.8),ink(),.9);for(let j=0;j<40;j++)line([[x+r(-100,100),y+r(-100,100)],[x+r(-130,130),y+r(-130,130)]],P[0],r(.5,5),.45)}break;
case 13:for(let i=0;i<60*k;i++){let x=r(0,S),y=r(0,S),d=r(10,160);g.strokeStyle=ink();g.globalAlpha=.5;g.lineWidth=r(.5,4);g.beginPath();g.arc(x,y,d,0,T);g.stroke();g.globalAlpha=1}break;
case 14:for(let i=0;i<14*k;i++){let x=r(0,S),y=r(0,S),w=r(30,450),h=r(30,450);g.fillStyle=ink();g.globalAlpha=r(.1,.8);g.fillRect(x,y,w,h);g.globalAlpha=1;line([[x,y],[x+w,y+h]],P[2],1,.4)}break;
case 15:for(let i=0;i<5*k;i++){let x=r(200,800),y=r(200,800),d=r(90,280);for(let j=0;j<22;j++)blob(x,y,d*(1-j*.032),.9,ink(),.07);for(let j=0;j<100;j++)line([[x,y],[x+r(-d,d),y+r(-d,d)]],P[0],.5,.15)}break;
}}
grammar(rec.mode);for(const f of rec.forces.slice(-3))if(f!==rec.mode)grammar(f,true);
g.globalAlpha=.12;for(let i=0;i<1800;i++){g.fillStyle=rand()<.5?'#ffffff':'#000000';g.fillRect(r(0,S),r(0,S),r(.4,2),r(.4,2))}g.globalAlpha=1;
}
