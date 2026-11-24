import * as THREE from 'three';
const TAU=Math.PI*2;
const rng=s=>()=>{s=(Math.imul(s,1664525)+1013904223)>>>0;return s/4294967296};
const palettes=[['#202a29','#587a70','#b49c73'],['#202020','#777777','#b0b0b0'],['#24384d','#648b9b','#b68c65'],['#4c302b','#a16b52','#c9a77e'],['#39304d','#827396','#b9a0ad']];
palettes.push(['#e63946','#ffb703','#023047'],['#6434a5','#f72585','#4cc9f0'],['#004d40','#80b918','#e9c46a'],['#ef476f','#ffd166','#118ab2'],['#001219','#005f73','#ee9b00'],['#ff595e','#1982c4','#8ac926'],['#9d4edd','#ff99c8','#a9def9'],['#264653','#e76f51','#2a9d8f'],['#22223b','#9a8c98','#c9ada7'],['#000000','#d00000','#ffba08'],['#00509d','#00b4d8','#caf0f8'],['#432818','#bb9457','#99582a'],['#006d77','#e29578','#83c5be'],['#ff006e','#8338ec','#3a86ff'],['#283618','#606c38','#dda15e']);
const canvas2=()=>{const c=document.createElement('canvas');c.width=c.height=768;return c};
function line(g,pts,color,width,alpha){g.globalAlpha=alpha;g.strokeStyle=color;g.lineWidth=width;g.lineCap='round';g.lineJoin='round';g.beginPath();pts.forEach(([x,y],i)=>i?g.lineTo(x,y):g.moveTo(x,y));g.stroke()}
function wash(g,x,y,r,color,a){const gr=g.createRadialGradient(x,y,0,x,y,r);gr.addColorStop(0,color);gr.addColorStop(.72,color+'55');gr.addColorStop(1,color+'00');g.globalAlpha=a;g.fillStyle=gr;g.fillRect(x-r,y-r,r*2,r*2)}
function layout(k,r){if(k===0)return [[384,384,1]];if(k===1)return Array.from({length:7},()=>[100+r()*568,100+r()*568,.18+r()*.25]);if(k===2)return [[240,420,.8],[540,450,.65]];if(k===3)return [[280,280,.8],[450,480,.8]];if(k===4)return [[210,350,1.1],[600,580,.2]];return Array.from({length:4},(_,i)=>[160+i*145,220+r()*330,.3+r()*.3])}
function ink(g,r,p){for(let j=0;j<12;j++){let x=(r()-.5)*220,y=(r()-.5)*180;const rad=25+r()*100;for(let k=0;k<32;k++){const a=r()*TAU,d=r()*rad;wash(g,x+Math.cos(a)*d,y+Math.sin(a)*d,8+r()*35,p[j%3],.08+r()*.13)}const pts=[];for(let k=0;k<50;k++){x+=(r()-.5)*18;y+=r()*5;pts.push([x,y])}line(g,pts,p[0],.7+r()*2,.25)}}
function network(g,r,p){const nodes=[[0,0,0]];for(let i=0;i<850;i++){const a=r()*TAU,d=Math.sqrt(r())*280,x=Math.cos(a)*d,y=Math.sin(a)*d;let best=0,dist=Infinity;for(let j=0;j<nodes.length;j++){const n=nodes[j],dd=(n[0]-x)**2+(n[1]-y)**2;if(dd<dist){dist=dd;best=j}}const n=nodes[best],l=Math.sqrt(dist)||1,step=Math.min(l,9+r()*9),q=[n[0]+(x-n[0])/l*step,n[1]+(y-n[1])/l*step,n[2]+1];nodes.push(q);line(g,[n,q],p[i%3],Math.max(.35,3.8-q[2]*.09),.35+r()*.45)}}
function skeleton(g,r,p){const n=5+Math.floor(r()*10),phase=r()*TAU;for(let j=1;j<17;j++){const pts=[];for(let k=0;k<=240;k++){const a=k/240*TAU,rad=j*14*(1+.14*Math.cos(n*a+phase)+.07*Math.sin(a*3+j*.3));pts.push([Math.cos(a)*rad,Math.sin(a)*rad*.78])}line(g,pts,p[j%3],.65+j*.04,.7)}for(let j=0;j<n*3;j++){const a=j/(n*3)*TAU,pts=[];for(let k=1;k<18;k++){const t=k/18,rad=t*260,ang=a+.15*Math.sin(t*4+phase);pts.push([Math.cos(ang)*rad,Math.sin(ang)*rad*.78])}line(g,pts,p[0],1.2,.65)}}
function folds(g,r,p){for(let j=0;j<38;j++){const pts=[];for(let i=0;i<100;i++){const t=i/99,a=t*TAU,rad=65+j*4+28*Math.sin(a*3+j*.12)+18*Math.cos(a*5-j*.1);pts.push([Math.cos(a)*rad+Math.sin(j*.12)*55,Math.sin(a)*rad*.65+j*2-38])}g.globalAlpha=.10;g.fillStyle=p[j%3];g.beginPath();pts.forEach(([x,y],i)=>i?g.lineTo(x,y):g.moveTo(x,y));g.closePath();g.fill();line(g,pts,p[0],.7,.22)}}
function imprint(g,r,p){for(let j=0;j<16;j++){const a=r()*TAU,x=Math.cos(a)*r()*190,y=Math.sin(a)*r()*190;for(let i=0;i<130;i++){const t=r()*TAU,d=Math.sqrt(r())*65;const xx=x+Math.cos(t)*d,yy=y+Math.sin(t)*d;g.globalAlpha=.15+r()*.6;g.fillStyle=p[j%3];g.fillRect(xx,yy,.5+r()*5,.5+r()*3);if(i%8===0)line(g,[[xx,yy],[xx+(r()-.5)*25,yy+(r()-.5)*25]],p[0],.6,.35)}}}
function attractor(g,r,p){let x=.1,y=.1,z=.1;const a=9+r()*4,b=24+r()*8,c=2.5;const pts=[];for(let i=0;i<17000;i++){const dt=.006,dx=a*(y-x),dy=x*(b-z)-y,dz=x*y-c*z;x+=dx*dt;y+=dy*dt;z+=dz*dt;if(i>500)pts.push([x*9+(z-24)*3,y*7-(z-24)*5]);if(pts.length===180){line(g,pts,p[Math.floor(i/180)%3],.45,.17);pts.splice(0,179)}}}
function reaction(g,r,p){const N=144,L=N*N;let a=new Float32Array(L).fill(1),b=new Float32Array(L),aa=new Float32Array(L),bb=new Float32Array(L);for(let j=0;j<20;j++){const x=15+Math.floor(r()*(N-30)),y=15+Math.floor(r()*(N-30));for(let dy=-4;dy<=4;dy++)for(let dx=-4;dx<=4;dx++){const i=(y+dy)*N+x+dx;b[i]=.8;a[i]=.4}}const F=.028+r()*.012,K=.055+r()*.009;for(let t=0;t<420;t++){for(let y=1;y<N-1;y++)for(let x=1;x<N-1;x++){const i=y*N+x,u=a[i],v=b[i],q=u*v*v;aa[i]=Math.max(0,Math.min(1,u+.2*(a[i-1]+a[i+1]+a[i-N]+a[i+N]-4*u)-q+F*(1-u)));bb[i]=Math.max(0,Math.min(1,v+.1*(b[i-1]+b[i+1]+b[i-N]+b[i+N]-4*v)+q-(F+K)*v))} [a,aa]=[aa,a];[b,bb]=[bb,b]}const c=document.createElement('canvas');c.width=c.height=N;const ctx=c.getContext('2d'),im=ctx.createImageData(N,N);const col=new THREE.Color(p[0]);for(let i=0;i<L;i++){const x=i%N-N/2,y=Math.floor(i/N)-N/2;im.data[i*4]=col.r*255;im.data[i*4+1]=col.g*255;im.data[i*4+2]=col.b*255;im.data[i*4+3]=Math.min(255,b[i]*650)*Math.max(0,Math.min(1,(68-Math.hypot(x,y))/12))}ctx.putImageData(im,0,0);g.globalAlpha=.9;g.drawImage(c,-280,-280,560,560)}
function xray(g,r,p){for(let j=0;j<11;j++){const a=r()*TAU,x=(r()-.5)*240,y=(r()-.5)*240;g.save();g.translate(x,y);g.rotate(a);const w=20+r()*85,h=65+r()*130;g.globalAlpha=.14;g.fillStyle=p[j%3];g.beginPath();g.ellipse(0,0,w,h,0,0,TAU);g.fill();g.globalAlpha=.55;g.strokeStyle=p[0];g.lineWidth=.8;g.stroke();for(let k=0;k<12;k++){const yy=-h+k*h/6;line(g,[[0,-h],[w*.75*Math.sin(k/12*Math.PI),yy],[0,h]],p[0],.45,.18)}g.restore()}}
function geometric(g,r,p){for(let i=0;i<18;i++){g.save();g.translate((r()-.5)*420,(r()-.5)*420);g.rotate(r()*TAU);g.globalAlpha=.35+r()*.6;g.fillStyle=p[i%3];const w=12+r()*140,h=12+r()*120;g.fillRect(-w/2,-h/2,w,h);g.restore()}}
function ribbons(g,r,p){for(let j=0;j<9;j++){const a=r()*TAU;g.save();g.rotate(a);for(let k=0;k<25;k++){const pts=Array.from({length:90},(_,i)=>{const x=i*6-267;return [x,Math.sin(x*.012+j)*70+Math.sin(x*.027+k*.06)*25+k*1.5]});line(g,pts,p[j%3],.7,.35)}g.restore()}}
function petals(g,r,p){const n=3+Math.floor(r()*12);for(let j=0;j<n;j++){g.save();g.rotate(j*TAU/n);g.globalAlpha=.48;g.fillStyle=p[j%3];g.beginPath();g.moveTo(0,0);g.bezierCurveTo(-130,-80,-90,-260,0,-250);g.bezierCurveTo(110,-200,90,-60,0,0);g.fill();g.restore()}}
function landscape(g,r,p){for(let j=0;j<9;j++){g.globalAlpha=.15+j*.065;g.fillStyle=p[j%3];g.beginPath();g.moveTo(-290,220);for(let i=0;i<=100;i++){const x=i*5.8-290;g.lineTo(x,-170+j*40+45*Math.sin(x*.013+j)+25*Math.cos(x*.033+j*2))}g.lineTo(290,220);g.closePath();g.fill()}}
function calligraphy(g,r,p){for(let j=0;j<6;j++){let x=(r()-.5)*260,y=(r()-.5)*240,a=r()*TAU;for(let i=0;i<100;i++){a+=(r()-.5)*.23;const xx=x+Math.cos(a)*5,yy=y+Math.sin(a)*5;line(g,[[x,y],[xx,yy]],p[j%3],.4+24*Math.pow(Math.sin(i/100*Math.PI),2),.65);x=xx;y=yy}}}
function bubbles(g,r,p){for(let j=0;j<65;j++){const x=(r()-.5)*470,y=(r()-.5)*470,d=4+r()*48;g.globalAlpha=.2+r()*.5;g.strokeStyle=p[j%3];g.lineWidth=.5+r()*2;g.beginPath();g.arc(x,y,d,0,TAU);g.stroke();if(j%3===0)wash(g,x,y,d,p[j%3],.3)}}
function crystals(g,r,p){for(let j=0;j<32;j++){const x=(r()-.5)*400,y=(r()-.5)*400,d=15+r()*75,a=r()*TAU;g.globalAlpha=.3+r()*.5;g.fillStyle=p[j%3];g.beginPath();for(let k=0;k<3;k++){const t=a+k*TAU/3;g.lineTo(x+Math.cos(t)*d,y+Math.sin(t)*d)}g.closePath();g.fill()}}
function constellation(g,r,p){for(let j=0;j<240;j++){const a=r()*TAU,d=Math.pow(r(),.6)*270,x=Math.cos(a)*d,y=Math.sin(a)*d;g.globalAlpha=.25+r()*.65;g.fillStyle=p[j%3];g.beginPath();g.arc(x,y,1+Math.pow(r(),5)*16,0,TAU);g.fill()}}
const engines=[ink,network,skeleton,folds,imprint,attractor,reaction,xray,geometric,ribbons,petals,landscape,calligraphy,bubbles,crystals,constellation];
const vert=`varying vec2 vUv;uniform float phase,fluid,depth,turbulence;void main(){vUv=uv;vec3 p=position;p.z+=.06*sin(p.x*4.+phase)*cos(p.y*3.-phase)*(fluid+depth);p.xy+=.025*turbulence*vec2(sin(p.y*6.+phase),cos(p.x*5.-phase));gl_Position=projectionMatrix*modelViewMatrix*vec4(p,1.);}`;
const frag=`varying vec2 vUv;uniform sampler2D map;uniform float fade;uniform float phase,fluid,rough,air,heat,cold,fragile,diffuse,weight,growth,light,turbulence;void main(){vec2 p=vUv-.5;p*=1.-.12*growth-.06*heat+.06*cold;p+=.018*fluid*vec2(sin(p.y*15.+phase),cos(p.x*12.-phase));p+=.009*turbulence*vec2(sin(p.y*31.+phase),cos(p.x*27.-phase));vec2 uv=p+.5;vec4 c=texture2D(map,uv);vec4 b=(texture2D(map,uv+vec2(.004,0.))+texture2D(map,uv-vec2(.004,0.))+texture2D(map,uv+vec2(0.,.004))+texture2D(map,uv-vec2(0.,.004)))*.25;c=mix(c,b,diffuse*.65);float n=fract(sin(dot(floor(uv*768.),vec2(127.1,311.7)))*43758.5453);c.a*=mix(1.,smoothstep(.05,.35,n),fragile*.6);c.a*= (1.-air*.45)*(.8+weight*.2);c.rgb=mix(c.rgb,vec3(.42,.24,.12),heat*.22);c.rgb=mix(c.rgb,vec3(.16,.32,.46),cold*.22);c.rgb+=rough*(n-.5)*.12+light*.09;float edge=step(0.,uv.x)*step(uv.x,1.)*step(0.,uv.y)*step(uv.y,1.);gl_FragColor=vec4(c.rgb,c.a*edge*fade);}`;
export function createSynth(canvas){
const renderer=new THREE.WebGLRenderer({canvas,antialias:true,preserveDrawingBuffer:true});renderer.setPixelRatio(1);renderer.setSize(800,800,false);
const scene=new THREE.Scene();scene.background=new THREE.Color('#ffffff');const camera=new THREE.PerspectiveCamera(42,1,.1,50);camera.position.z=5;
const geo=new THREE.PlaneGeometry(3.5,3.5,32,32),keys=['fluid','rough','air','heat','cold','fragile','diffuse','weight','growth','depth','light','turbulence'],targets=Array(12).fill(0),levels=Array(12).fill(0);let meshes=[],seed=1234;
const voices=[
[0,9,6,1], [14,2,4,11], [15,9,13,3], [0,10,6,4],
[14,2,13,11], [4,12,7,5], [0,6,13,10], [8,12,4,8],
[1,10,2,7], [11,3,7,3], [7,13,10,5], [5,9,15,8]
];
// Each sensor has a recognisable palette and an independent morphological voice.
const voiceColors=[
['#164e63','#0891b2','#67e8f9'],['#292524','#78716c','#a16207'],['#64748b','#a5b4fc','#c4b5fd'],['#9a3412','#ea580c','#fbbf24'],['#1e3a8a','#0284c7','#a5f3fc'],['#52525b','#a78bfa','#d4d4d8'],['#86198f','#db2777','#f9a8d4'],['#171717','#b91c1c','#eab308'],['#14532d','#65a30d','#a3a635'],['#312e81','#475569','#94a3b8'],['#a16207','#eab308','#fde68a'],['#581c87','#c026d3','#0e7490']
];
function remove(m){scene.remove(m);m.material.uniforms.map.value.dispose();m.material.dispose()}
function addVoice(i,engineId,p,extra=false){
 const r=rng((seed+Math.imul(i+1,2654435761)+(extra?7919:0))>>>0);
 const c=canvas2(),g=c.getContext('2d');g.translate(384,384);g.scale(extra ? .75 : 1,extra ? .75 : 1);g.rotate((r()-.5)*.7);engines[engineId](g,r,p);
 const tex=new THREE.CanvasTexture(c);tex.colorSpace=THREE.SRGBColorSpace;
 const uniforms={map:{value:tex},phase:{value:0},fade:{value:0}};for(const k of keys)uniforms[k]={value:0};
 const mat=new THREE.ShaderMaterial({vertexShader:vert,fragmentShader:frag,uniforms,transparent:true,depthWrite:false,side:THREE.DoubleSide});
 const m=new THREE.Mesh(geo,mat);m.userData={voice:i,extra,alpha:0,retiring:false,angle:r()*TAU};scene.add(m);meshes.push(m);
}
const pairs=[[0,3,0],[8,5,1],[2,11,5],[1,6,6],[9,10,11]];
function reconcile(){
 const wanted=targets.map((v,i)=>v>0?i:-1).filter(i=>i>=0);
 for(const m of meshes)m.userData.retiring=true;
 for(const i of wanted){
 let m=meshes.find(m=>m.userData.voice===i&&!m.userData.extra);
 if(!m){const r=rng((seed+i*7919)>>>0);const v=voices[i];addVoice(i,v[Math.floor(r()*2)],voiceColors[i]);m=meshes[meshes.length-1]}
 m.userData.retiring=false;
 }
 for(let j=0;j<pairs.length;j++){const [a,b,e]=pairs[j];if(!targets[a]||!targets[b])continue;let m=meshes.find(m=>m.userData.extra&&m.userData.voice===12+j);if(!m){addVoice(12+j,e,[voiceColors[a][0],voiceColors[b][1],voiceColors[a][2]],true);m=meshes[meshes.length-1]}m.userData.retiring=false;}
}
function reset(){for(const m of meshes)remove(m);meshes=[];seed=(Math.random()*4294967296)>>>0;targets.fill(0);levels.fill(0);targets[0]=.75;reconcile();return [0]}

reset();
function render(seconds,settle=false){
 const t=seconds%12*TAU/12;
 for(let i=0;i<12;i++)levels[i]=settle?targets[i]:levels[i]+(targets[i]-levels[i])*.08;
 const active=meshes.filter(m=>!m.userData.retiring).length;
 meshes.forEach((m,j)=>{
 const d=m.userData,i=d.voice,idx=i%12,u=m.material.uniforms;
 const strength=d.extra?Math.min(targets[pairs[i-12][0]],targets[pairs[i-12][1]]):targets[i];
 const goal=d.retiring?0:(.45+.55*strength)/Math.max(1,Math.pow(active,.22));
 d.alpha=settle?goal:d.alpha+(goal-d.alpha)*.075;
 u.phase.value=t;keys.forEach((k,n)=>u[k].value=levels[n]*.65);
 const a=t+d.angle;let x=0,y=0,z=0,scale=1;
 switch(idx){case 0:x=.12*Math.sin(a);y=.12*Math.sin(2*a);break;case 1:scale=1+.025*Math.cos(a);break;case 2:x=.24*Math.sin(a);y=.18*Math.cos(a);break;case 3:scale=1+.18*Math.sin(a);y=.12*Math.cos(a);break;case 4:z=.12*Math.sin(a);break;case 5:x=.12*Math.cos(a);scale=.9+.1*Math.sin(a);break;case 6:scale=1+.16*Math.sin(a);break;case 7:scale=.94+.06*Math.cos(a);break;case 8:scale=.85+.15*Math.sin(a);break;case 9:y=.12*Math.sin(a);break;case 10:scale=1+.07*Math.cos(a);break;case 11:x=.18*Math.sin(a);y=.18*Math.cos(a);z=.3*Math.sin(a);break}
 const spread=active>1 ? .22 : 0;
 m.position.set(x+spread*Math.cos(d.angle),y+spread*Math.sin(d.angle),(j%17-8)*.025);
 m.rotation.z=z;m.scale.setScalar(scale*(active>3 ? .8 : 1));u.fade.value=d.alpha*(idx===5 ? .72+.28*Math.cos(a):1);
 });
 meshes=meshes.filter(m=>{if(m.userData.retiring&&m.userData.alpha<.003){remove(m);return false}return true});
 renderer.render(scene,camera);
}
return {render,reset,toggle(i){targets[i]=targets[i]?0:.75;reconcile();return !!targets[i]},boost(i){targets[i]=Math.min(1,targets[i]+.25);reconcile()},clear(){targets.fill(0);reconcile()},dispose(){for(const m of meshes)remove(m);geo.dispose();renderer.dispose()}}
}
