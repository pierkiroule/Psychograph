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
float hash(vec2 p){return fract(sin(dot(p,vec2(127.1,311.7)))*43758.5453);}
float noise(vec2 p){vec2 i=floor(p),f=fract(p);f=f*f*(3.-2.*f);return mix(mix(hash(i),hash(i+vec2(1,0)),f.x),mix(hash(i+vec2(0,1)),hash(i+1.),f.x),f.y);}
float fb(vec2 p){float n=0.,a=.5;for(int i=0;i<5;i++){n+=a*noise(p);p=mat2(1.6,1.2,-1.2,1.6)*p;a*=.5;}return n;}
void main(){
vec2 p=(vUv-.5)*2.;float t=phase;vec2 orbit=vec2(cos(t),sin(t));
p+=.12*fluid*vec2(sin(p.y*5.+t),cos(p.x*5.-t));
p+=.08*turbulence*vec2(fb(p*5.+orbit),fb(p.yx*5.-orbit));
float n=fb(p*3.+seed+orbit*.25), a=atan(p.y,p.x),r=length(p);
float d=r-.55+.24*(n-.5);float pattern=n;
if(voice<.5){d=abs(p.y+.25*sin(p.x*5.+t)+.2*(n-.5))-.17;pattern=fb(p*7.+orbit);}
else if(voice<1.5){d=r-.78+.3*n;pattern=fb(vec2(p.x*45.,p.y*4.)+seed);}
else if(voice<2.5){d=abs(p.y+.35*sin(p.x*2.+t))-.28;pattern=fb(p*2.+orbit);}
else if(voice<3.5){d=r-.42-.16*sin(a*5.+t)+.22*n;pattern=fb(p*6.+orbit);}
else if(voice<4.5){d=max(abs(p.x),abs(p.y)*.58+abs(p.x)*.5)-.53;pattern=abs(sin((p.x+p.y)*18.+n*2.));}
else if(voice<5.5){d=abs(sin(a*7.+r*9.+n*3.))-.13;d=max(d,r-.82);pattern=n;}
else if(voice<6.5){d=r-.6+.35*(n-.5);pattern=fb(p*2.+orbit*.6);}
else if(voice<7.5){d=abs(p.y+.18*sin(p.x*7.+t))-.08;pattern=abs(sin(p.x*20.+n));}
else if(voice<8.5){d=abs(sin(a*5.+r*8.+n*2.))-.16;d=max(d,r-.8);pattern=fb(p*8.);}
else if(voice<9.5){d=abs(sin(r*22.+n*4.+t))-.15;d=max(d,r-.85);pattern=n;}
else if(voice<10.5){d=r-.55+.12*n;pattern=pow(max(0.,1.-r),3.);}
else {d=abs(sin(a*3.+r*12.+t+n*2.))-.22;d=max(d,r-.83);pattern=n;}
float edge=1.-smoothstep(-.025,.035+.12*diffuse,d);
float grain=noise(p*180.+seed);
float cracks=abs(sin(n*45.+p.x*5.));
edge*=mix(1.,smoothstep(.04,.22,cracks),fragile*.6);
vec3 c=mix(ink,accent,clamp(pattern+.16*heat-.13*cold,0.,1.));
float relief=fb(p*14.+seed);c*=.75+.5*relief+rough*(grain-.5)*.35;
c+=light*.18*pow(max(0.,1.-abs(d)*8.),2.);
float fade=1.-smoothstep(.72,1.,max(abs(p.x),abs(p.y)));
gl_FragColor=vec4(c,edge*fade*level*(.45+.55*pattern));
}`;
const palettes=[['#172528','#d4d6b9','#80b8b3','#c9a17c'],['#e9e2d3','#242d31','#80664b','#a7a89c'],['#201b28','#d8a5a4','#796aa1','#e5c4a2'],['#152421','#d8d7b5','#79a38c','#e0a86a'],['#151515','#eeeeee','#999999','#555555']];
export function createSynth(canvas){
const renderer=new THREE.WebGLRenderer({canvas,antialias:true,preserveDrawingBuffer:true});
renderer.setPixelRatio(1);renderer.setSize(800,800,false);
const scene=new THREE.Scene(),camera=new THREE.PerspectiveCamera(42,1,.1,50);camera.position.z=5;
const stereo=new AnaglyphEffect(renderer);stereo.setSize(800,800);
const geo=new THREE.PlaneGeometry(2.9,2.9,36,36);
let palette,seed,mode=false;const targets=Array(12).fill(0),levels=Array(12).fill(0),meshes=[];
for(let i=0;i<12;i++){const uniforms={phase:{value:0},seed:{value:0},voice:{value:i},level:{value:0},ink:{value:new THREE.Color()},accent:{value:new THREE.Color()}};for(const k of ['rough','heat','cold','fragile','diffuse','light','fluid','turbulence'])uniforms[k]={value:0};
const mat=new THREE.ShaderMaterial({vertexShader:vertex,fragmentShader:fragment,uniforms,transparent:true,depthWrite:false,side:THREE.DoubleSide});
const mesh=new THREE.Mesh(geo,mat);scene.add(mesh);meshes.push(mesh)}
function reset(){seed=Math.random()*100;palette=palettes[Math.floor(Math.random()*palettes.length)];scene.background=new THREE.Color(palette[0]);targets.fill(0);targets[0]=.7;targets[8]=.65;targets[10]=.45;meshes.forEach((m,i)=>{const u=m.material.uniforms;u.seed.value=seed+i*17;u.ink.value.set(palette[1+i%3]);u.accent.value.set(palette[1+(i+1)%3]);m.position.set(Math.sin(seed+i*2.4)*.38,Math.cos(seed+i*1.7)*.38,(i-5.5)*.12);m.rotation.z=Math.sin(seed+i)*.7;m.scale.setScalar(.65+.35*Math.abs(Math.sin(seed+i*3)));});return targets.map((v,i)=>v?i:-1).filter(i=>i>=0)}
reset();
function render(seconds,settle=false){const t=(seconds%12)*T/12;meshes.forEach((m,i)=>{levels[i]=settle?targets[i]:levels[i]+(targets[i]-levels[i])*.09;const u=m.material.uniforms;u.phase.value=t;u.level.value=levels[i];for(const [k,j] of Object.entries({rough:1,heat:3,cold:4,fragile:5,diffuse:6,light:10,fluid:0,turbulence:11}))u[k].value=levels[j];m.visible=levels[i]>.002;m.position.z=(i-5.5)*.12+.07*Math.sin(t+i);m.rotation.y=.12*Math.sin(t+i*.7);m.rotation.x=.09*Math.cos(t+i);});camera.position.x=.045*Math.sin(t);camera.lookAt(0,0,0);if(mode)stereo.render(scene,camera);else renderer.render(scene,camera)}
return {render,reset,toggle(i){targets[i]=targets[i]?0:.75;return !!targets[i]},boost(i){targets[i]=Math.min(1,targets[i]+.25)},clear(){targets.fill(0)},setMode(v){mode=v},dispose(){geo.dispose();meshes.forEach(m=>m.material.dispose());stereo.dispose();renderer.dispose()}}
}
