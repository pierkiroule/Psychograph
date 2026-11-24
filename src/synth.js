// V8 — live vector choreography. All geometry is evaluated from time, not textures.
const T=Math.PI*2;
const hash=(n)=>{const v=Math.sin(n*127.1+311.7)*43758.5453;return v-Math.floor(v)};
const palettes=[
['#006d77','#219ebc','#83c5be'],['#292524','#a16207','#78716c'],
['#8595d1','#667f95','#b8a4cf'],['#ce361e','#ff9700','#f6bd60'],
['#174ea6','#00a7c4','#87ceeb'],['#604b70','#b79ab0','#8f7d8d'],
['#c02678','#f08cb0','#f6b4ad'],['#191919','#c1121f','#e9a000'],
['#245c36','#74a82f','#c5a451'],['#26356b','#667797','#9fa9bc'],
['#c78b22','#f0bf59','#e6a5bc'],['#6327a4','#de3988','#008b9e']];
function stroke(g,points,col,w,a){g.globalAlpha=a;g.strokeStyle=col;g.lineWidth=w;g.beginPath();points.forEach(([x,y],i)=>i?g.lineTo(x,y):g.moveTo(x,y));g.stroke()}
function disk(g,x,y,r,col,a){g.globalAlpha=a;g.fillStyle=col;g.beginPath();g.arc(x,y,Math.max(.1,r),0,T);g.fill()}
function wash(g,x,y,r,col,a){const q=g.createRadialGradient(x,y,0,x,y,r);q.addColorStop(0,col+'bb');q.addColorStop(.6,col+'66');q.addColorStop(1,col+'00');g.globalAlpha=a;g.fillStyle=q;g.fillRect(x-r,y-r,2*r,2*r)}
function polygon(g,pts,c,a){g.globalAlpha=a;g.fillStyle=c;g.beginPath();pts.forEach(([x,y],i)=>i?g.lineTo(x,y):g.moveTo(x,y));g.closePath();g.fill()}
const voices=[
 // Fluidity: changing ribbon contours.
 (g,t,s,p)=>{for(let j=0;j<8;j++){const pts=[];for(let i=0;i<=90;i++){let x=-270+i*6,y=85*Math.sin(x*.009+t+j*.48)+38*Math.sin(x*.021-t+j*.3)+j*18-65;pts.push([x,y])}stroke(g,pts,p[j%3],3+j*3,.14+s*.32)}},
 // Roughness: faceted angular architecture.
 (g,t,s,p)=>{for(let j=0;j<35;j++){let a=j*2.39996,d=40+Math.sqrt(j/35)*210,x=d*Math.cos(a),y=d*Math.sin(a),r=10+hash(j+4)*47,b=a+.12*Math.sin(t+j);polygon(g,Array.from({length:3+j%3},(_,k)=>[x+r*Math.cos(b+k*T/(3+j%3)),y+r*Math.sin(b+k*T/(3+j%3))]),p[j%3],.25+s*.55)}},
 // Lightness: drifting individual seeds.
 (g,t,s,p)=>{for(let j=0;j<220;j++){let a=hash(j*3)*T,d=250*Math.sqrt(hash(j*7+1)),x=d*Math.cos(a)+28*Math.sin(t+j),y=d*Math.sin(a)+25*Math.cos(t+j*.4);disk(g,x,y,1+hash(j+12)*4,p[j%3],.15+s*.55);if(j%9===0)stroke(g,[[x,y],[x+12*Math.cos(t+a),y-16]],p[j%3],.7,.4)}},
 // Heat: organic convection, diffuse fields.
 (g,t,s,p)=>{for(let j=0;j<19;j++){let a=j*2.39996+t*.0,d=45+hash(j)*150;wash(g,d*Math.cos(a)+30*Math.sin(t+j),d*Math.sin(a)-45*Math.cos(t+j*.7),45+hash(j+5)*80,p[j%3],.35+s*.45)}},
 // Cold: branching ice dendrites.
 (g,t,s,p)=>{for(let j=0;j<6;j++){let a=j*T/6+t*.0,l=170+25*Math.sin(t);let x=l*Math.cos(a),y=l*Math.sin(a);stroke(g,[[0,0],[x,y]],p[0],2,.8);for(let k=1;k<8;k++){let d=k*l/8;for(const sign of [-1,1]){let b=a+sign*.95,m=(1-k/10)*65;stroke(g,[[d*Math.cos(a),d*Math.sin(a)],[d*Math.cos(a)+m*Math.cos(b),d*Math.sin(a)+m*Math.sin(b)]],p[1],1.5,.7)}}}},
 // Fragility: discontinuous delicate contours.
 (g,t,s,p)=>{for(let j=0;j<38;j++){let a=j*2.39996,d=30+hash(j)*220,x=d*Math.cos(a),y=d*Math.sin(a),pts=[];for(let i=0;i<12;i++){let b=a+i*.21;pts.push([x+i*3*Math.cos(b)+9*Math.sin(t+j),y+i*3*Math.sin(b)])}stroke(g,pts,p[j%3],.55+hash(j+3)*1.4,.35+s*.45)}},
 // Diffusion: expanding pigment blooms and rings.
 (g,t,s,p)=>{for(let j=0;j<7;j++){let a=j*2.39996,d=hash(j+2)*140,x=d*Math.cos(a),y=d*Math.sin(a);for(let k=0;k<4;k++){let r=25+k*22+12*Math.sin(t+j+k*.7);wash(g,x,y,r,p[(j+k)%3],.18+s*.17)}}},
 // Intensity: bold calligraphic gesture.
 (g,t,s,p)=>{for(let j=0;j<5;j++){const pts=[];for(let i=0;i<85;i++){let a=i*.064+j*1.7,r=25+i*2.5;pts.push([r*Math.cos(a+.12*Math.sin(t)),r*Math.sin(a)])}stroke(g,pts,p[j%3],7+j*5,.5+s*.35)}},
 // Growth: hierarchical animated trees.
 (g,t,s,p)=>{function branch(x,y,a,l,n,k){if(!n)return;let b=a+.09*Math.sin(t+k),xx=x+l*Math.cos(b),yy=y+l*Math.sin(b);stroke(g,[[x,y],[xx,yy]],p[n%3],n*.85,.8);branch(xx,yy,b-.48,l*.72,n-1,k+1);branch(xx,yy,b+.57,l*.69,n-1,k+2)}branch(0,235,-Math.PI/2,118,7,0)},
 // Depth: layered horizons with changing silhouettes.
 (g,t,s,p)=>{for(let j=0;j<8;j++){let pts=[[-285,245]];for(let i=0;i<=100;i++){let x=i*5.7-285;pts.push([x,-165+j*43+40*Math.sin(x*.013+j+.2*Math.sin(t))+21*Math.sin(x*.029-j)])}pts.push([285,245]);polygon(g,pts,p[j%3],.12+j*.06)}},
 // Light: translucent orbiting veils.
 (g,t,s,p)=>{for(let j=0;j<9;j++){let a=j*T/9,x=110*Math.cos(a+.16*Math.sin(t)),y=110*Math.sin(a+.16*Math.sin(t));g.save();g.translate(x,y);g.rotate(a+.1*Math.cos(t));g.globalAlpha=.12+s*.16;g.fillStyle=p[j%3];g.beginPath();g.ellipse(0,0,45+10*Math.sin(t+j),130,0,0,T);g.fill();g.restore()}},
 // Turbulence: evolving filament trajectories.
 (g,t,s,p)=>{for(let j=0;j<32;j++){let pts=[],a=j*T/32;for(let i=0;i<90;i++){let r=20+i*2.7,b=a+i*.045+.4*Math.sin(i*.08+t);pts.push([r*Math.cos(b)+18*Math.sin(b*3+t),r*Math.sin(b)])}stroke(g,pts,p[j%3],.7+s*1.5,.25+s*.25)}}
];
export function createSynth(canvas){
 canvas.width=canvas.height=900;const g=canvas.getContext('2d',{alpha:false});if(!g)throw Error('Canvas unavailable');
 const targets=Array(12).fill(0),levels=Array(12).fill(0);let seed=1;
 function reset(){seed=Math.floor(Math.random()*100000);targets.fill(0);levels.fill(0);return []}
 function render(seconds,settle=false){
 const t=(seconds%12)*T/12;
 for(let i=0;i<12;i++)levels[i]=settle?targets[i]:levels[i]+(targets[i]-levels[i])*.13;
 g.setTransform(1,0,0,1,0,0);g.globalAlpha=1;g.fillStyle='#ffffff';g.fillRect(0,0,900,900);
 const ids=levels.map((v,i)=>v>.006?i:-1).filter(i=>i>=0),count=ids.length;
 ids.forEach((i,k)=>{
 const a=hash(seed+i*19)*T,spread=count>1?Math.min(160,45+count*14):0;
 const sc=count===1?1.35:Math.max(.53,1.12-count*.055);
 g.save();g.translate(450+spread*Math.cos(a),450+spread*Math.sin(a));g.scale(sc,sc);g.rotate((hash(seed+i)-.5)*.24);
 // Independent signatures; strength controls opacity and size, not identity.
 g.globalAlpha=1;voices[i](g,t+a,levels[i],palettes[i]);g.restore();
 });
 // Semantic interactions add a distinctive live motif.
 if(levels[0]>.2&&levels[3]>.2){g.save();g.translate(450,450);for(let k=0;k<8;k++){const a=k*T/8+t;wash(g,145*Math.cos(a),145*Math.sin(a),34,'#e76f51',.2)}g.restore()}
 if(levels[8]>.2&&levels[5]>.2){g.save();g.translate(450,450);for(let k=0;k<40;k++){let a=k*2.39996;disk(g,(120+40*Math.sin(t+k))*Math.cos(a),180*Math.sin(a),2,'#78905e',.45)}g.restore()}
 g.globalAlpha=1;
 }
 reset();return {render,reset,toggle(i){targets[i]=targets[i]?0:.75;return !!targets[i]},boost(i){targets[i]=Math.min(1,targets[i]+.25)},clear(){targets.fill(0)},dispose(){}};
}
