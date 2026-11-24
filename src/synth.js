import * as THREE from 'three';
import {AnaglyphEffect} from 'three/addons/effects/AnaglyphEffect.js';
const T=Math.PI*2;
const vertex=`
varying vec2 vUv;
uniform float phase, seed, fluid, turbulence;
void main(){
vUv=uv;vec3 p=position;
p.z+=.12*sin(p.x*5.+phase+seed)*cos(p.y*4.-phase)*fluid;
p.z+=.08*sin(p.y*9.+phase*2.+seed)*turbulence;
gl_Position=projectionMatrix*modelViewMatrix*vec4(p,1.);
}`;
const fragment=`
precision highp float;
varying vec2 vUv;
uniform float phase,seed,voice,level,rough,heat,cold,fragile,diffuse,light,fluid,turbulence;
uniform vec3 ink,accent;
uniform float family,growth,depth,weight,air;
float hash(vec2 p){return fract(sin(dot(p,vec2(127.1,311.7)))*43758.5453);}
float noise(vec2 p){vec2 i=floor(p),f=fract(p);f=f*f*(3.-2.*f);return mix(mix(hash(i),hash(i+vec2(1,0)),f.x),mix(hash(i+vec2(0,1)),hash(i+1.),f.x),f.y);}
float fb(vec2 p){float n=0.,a=.5;for(int i=0;i<5;i++){n+=a*noise(p);p=mat2(1.6,1.2,-1.2,1.6)*p;a*=.5;}return n;}

// Periodic fields inspired by activator-inhibitor patterns, branching and tissue folding.
// These are analytic approximations, not numerical biological simulations.
float ridge(vec2 p){return 1.-abs(2.*fb(p)-1.);}
vec2 warp(vec2 p,vec2 o){return p+.45*(vec2(fb(p*2.7+seed+o),fb(p.yx*2.7-seed-o))-.5);}
float cells(vec2 p){vec2 i=floor(p),f=fract(p);float a=10.,b=10.;for(int y=-1;y<=1;y++){for(int x=-1;x<=1;x++){vec2 g=vec2(float(x),float(y));vec2 h=vec2(hash(i+g+seed),hash(i+g+seed+37.));float d=length(g+h-f);if(d<a){b=a;a=d;}else b=min(b,d);}}return b-a;}
void main(){
vec2 p=(vUv-.5)*2.;float t=phase;vec2 o=vec2(cos(t),sin(t));
float sym=.35+.35*sin(seed);p.x=mix(p.x,abs(p.x)-.12,sym);
p+=.08*fluid*vec2(sin(p.y*4.+t),cos(p.x*4.-t));
p=warp(p,o*.12);p=warp(p*1.15,o*.08)/1.15;
p+=.15*turbulence*(vec2(fb(p*5.+o*.2),fb(p.yx*5.-o*.2))-.5);
p*=1.-.12*heat+.1*cold-.08*growth;
float n=fb(p*3.+seed),r=length(p),ang=atan(p.y,p.x);
float field=0.,detail=0.;
if(family<.5){ // activator-inhibitor-like labyrinth
float v=fb(p*5.+seed+o*.08);field=1.-smoothstep(.08,.24,abs(sin(v*24.+n*5.)));detail=v;
}else if(family<1.5){ // cellular interfaces
float v=cells(p*(5.+growth*3.)+seed);field=exp(-v*(9.+cold*8.));detail=fb(p*13.+seed);
}else if(family<2.5){ // dendritic vascular networks
float v=ridge(p*vec2(4.,2.)+seed);field=pow(v,7.)*smoothstep(.35,.7,n);detail=ridge(p*14.+seed);
}else if(family<3.5){ // folded tissue
float v=sin(p.y*18.+fb(p*3.+seed)*14.+.3*cos(t));field=pow(.5+.5*v,3.);detail=fb(p*8.+seed);
}else if(family<4.5){ // radial skeletal growth
float v=sin(ang*(5.+floor(mod(seed,5.)))+r*8.+n*5.);field=exp(-abs(v)*8.)*(.5+.5*sin(r*25.+n*4.));detail=n;
}else if(family<5.5){ // spectral membranes
float v=fb(p*4.+seed);field=exp(-abs(v-.47)*24.)+.35*exp(-abs(v-.57)*35.);detail=v;
}else if(family<6.5){ // chemotactic trail-like networks
float v=fb(p*6.+seed);field=pow(1.-abs(sin(v*18.+p.y*2.)),5.);detail=fb(p*16.+seed);
}else{ // colony aggregation
float v=cells(p*4.+seed);field=smoothstep(.12,.36,v)*smoothstep(.35,.62,n);detail=fb(p*10.+seed);}
float silhouette=1.-smoothstep(.43,.94,r+.45*(n-.5));
float holes=smoothstep(.23,.48,fb(p*2.+seed+17.));
float grain=noise(p*180.+seed);
float membrane=exp(-abs(n-.48)*30.);
float fissure=abs(sin(fb(p*6.+seed)*42.));
float alpha=field*silhouette*mix(.45,1.,holes);
alpha=mix(alpha,alpha*.6+membrane*silhouette*.25,diffuse);
alpha*=mix(1.,smoothstep(.025,.2,fissure),fragile*.7);
alpha*=mix(1.,smoothstep(.1,.55,detail),rough*.7);
alpha*=.65+.35*weight;
float h=fb(p*12.+seed);float relief=clamp(.5+5.*(fb((p+vec2(.012,.018))*12.+seed)-h),0.,1.);
vec3 c=mix(ink,accent,clamp(detail+.16*heat-.12*cold,0.,1.));
c*=.55+.75*relief+rough*(grain-.5)*.22;
c+=vec3(.14,.13,.11)*membrane*(.3+light);
alpha*=1.-.35*air;
float fade=1.-smoothstep(.78,.99,max(abs(p.x),abs(p.y)));
gl_FragColor=vec4(c,clamp(alpha*fade*level,0.,1.));

}`;
const palettes=[['#ffffff','#182d32','#527d80','#a5b9b5'],['#ffffff','#242d31','#80664b','#a7a89c'],['#ffffff','#30243c','#796aa1','#b58c90'],['#ffffff','#233c31','#648b75','#b28b52'],['#ffffff','#171717','#555555','#999999'],['#ffffff','#20201d','#8e8070','#b6a18b'],['#ffffff','#18374b','#466b83','#8daeb9'],['#ffffff','#382b21','#826a54','#b99c78']];
export function createSynth(canvas){
const renderer=new THREE.WebGLRenderer({canvas,antialias:true,preserveDrawingBuffer:true});
renderer.setPixelRatio(1);renderer.setSize(800,800,false);
const scene=new THREE.Scene(),camera=new THREE.PerspectiveCamera(42,1,.1,50);camera.position.z=5;
const stereo=new AnaglyphEffect(renderer);stereo.setSize(800,800);
const geo=new THREE.PlaneGeometry(2.9,2.9,36,36);
let palette,seed,mode=false;const targets=Array(12).fill(0),levels=Array(12).fill(0),meshes=[];
for(let i=0;i<12;i++){const uniforms={phase:{value:0},seed:{value:0},voice:{value:i},level:{value:0},ink:{value:new THREE.Color()},accent:{value:new THREE.Color()}};for(const k of ['rough','heat','cold','fragile','diffuse','light','fluid','turbulence','family','growth','depth','weight','air'])uniforms[k]={value:0};
const mat=new THREE.ShaderMaterial({vertexShader:vertex,fragmentShader:fragment,uniforms,transparent:true,depthWrite:false,side:THREE.DoubleSide});
const mesh=new THREE.Mesh(geo,mat);scene.add(mesh);meshes.push(mesh)}
function reset(){seed=Math.random()*100;palette=palettes[Math.floor(Math.random()*palettes.length)];scene.background=new THREE.Color(palette[0]);targets.fill(0);targets[0]=.85;targets[8]=.85;targets[10]=.7;meshes.forEach((m,i)=>{const u=m.material.uniforms;u.seed.value=seed+i*17;u.family.value=(Math.floor(seed)%8+Math.floor(i/2))%8;u.ink.value.set(palette[1+i%3]);u.accent.value.set(palette[1+(i+1)%3]);m.position.set(Math.sin(seed+i*2.4)*.38,Math.cos(seed+i*1.7)*.38,(i-5.5)*.12);m.rotation.z=Math.sin(seed+i)*.7;m.scale.setScalar(.65+.35*Math.abs(Math.sin(seed+i*3)));});return targets.map((v,i)=>v?i:-1).filter(i=>i>=0)}
reset();
function render(seconds,settle=false){const t=(seconds%12)*T/12;meshes.forEach((m,i)=>{levels[i]=settle?targets[i]:levels[i]+(targets[i]-levels[i])*.09;const u=m.material.uniforms;u.phase.value=t;u.level.value=levels[i];for(const [k,j] of Object.entries({rough:1,heat:3,cold:4,fragile:5,diffuse:6,light:10,fluid:0,turbulence:11,growth:8,depth:9,weight:7,air:2}))u[k].value=levels[j];m.visible=levels[i]>.002;m.position.z=(i-5.5)*(.08+.09*levels[9])+.035*Math.sin(t+i);m.rotation.y=.045*Math.sin(t+i*.7);m.rotation.x=.035*Math.cos(t+i);});camera.position.x=.025*Math.sin(t);camera.lookAt(0,0,0);if(mode)stereo.render(scene,camera);else renderer.render(scene,camera)}
return {render,reset,toggle(i){targets[i]=targets[i]?0:.75;return !!targets[i]},boost(i){targets[i]=Math.min(1,targets[i]+.25)},clear(){targets.fill(0)},setMode(v){mode=v},dispose(){geo.dispose();meshes.forEach(m=>m.material.dispose());stereo.dispose();renderer.dispose()}}
}
