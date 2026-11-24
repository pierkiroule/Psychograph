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
float ell(vec2 p,vec2 b){return (length(p/b)-1.)*min(b.x,b.y);}
float join(float a,float b,float k){float h=clamp(.5+.5*(b-a)/k,0.,1.);return mix(b,a,h)-k*h*(1.-h);}
float seg(vec2 p,vec2 a,vec2 b){vec2 q=p-a,v=b-a;return length(q-v*clamp(dot(q,v)/dot(v,v),0.,1.));}
float morph(vec2 p,float f){
float d=2.;vec2 q=vec2(abs(p.x),p.y);
if(f<.5){d=join(ell(p-vec2(0,.35),vec2(.19,.23)),ell(p+vec2(0,.16),vec2(.29,.49)),.15);d=join(d,seg(q,vec2(.14,.1),vec2(.55,-.25))-.065,.12);}
else if(f<1.5){d=join(ell(p,vec2(.13,.66)),ell(q-vec2(.37,.18),vec2(.37,.26)),.12);d=join(d,ell(q-vec2(.28,-.25),vec2(.24,.19)),.08);}
else if(f<2.5){d=ell(p,vec2(.57,.69));d=max(d,-ell(p-vec2(.17,.13),vec2(.24,.37)));d=join(d,ell(p+vec2(.34,.23),vec2(.25,.31)),.13);}
else if(f<3.5){d=max(abs(length(p*vec2(1.,.8))-.48)-.07,-p.y-.28);d=min(d,seg(q,vec2(.48,-.65),vec2(.48,.02))-.065);d=min(d,seg(p,vec2(-.7,-.66),vec2(.7,-.66))-.04);}
else if(f<4.5){d=seg(p,vec2(0,-.75),vec2(.04,.72))-.045;for(int i=0;i<5;i++){float j=float(i);vec2 a=vec2(0.,-.45+j*.23),b=vec2(.55-j*.065,a.y+.25);d=min(d,seg(q,a,b)-.025);d=min(d,seg(q,mix(a,b,.55),b+vec2(-.03,.18))-.014);}}
else if(f<5.5){d=ell(p-vec2(-.17,.12),vec2(.46,.46));d=min(d,abs(length(vec2(p.x,p.y*2.8))-.69)-.025);d=min(d,ell(p-vec2(.57,-.43),vec2(.11,.11)));}
else if(f<6.5){d=abs(p.y+.22*sin(p.x*4.))-.13;d=min(d,abs(p.y+.3+.12*sin(p.x*7.))-.045);d=max(d,abs(p.x)-.83);}
else {d=2.;for(int i=0;i<6;i++){float j=float(i);vec2 c=vec2(sin(j*2.4+seed),cos(j*1.7+seed))*.43;d=join(d,ell(p-c,vec2(.12+.05*mod(j,3.),.23)),.09);}}
return d;
}
void main(){
vec2 p=(vUv-.5)*2.;float t=phase;vec2 orbit=vec2(cos(t),sin(t));
float n=fb(p*3.+seed+orbit*.16);
p+=.19*fluid*vec2(sin(p.y*4.+t),cos(p.x*4.-t));
p+=.25*turbulence*(vec2(fb(p*4.+orbit+seed),fb(p.yx*4.-orbit+seed))- .5);
p.x+=.12*(n-.5);p*=1.-.13*heat-.08*growth+.09*cold;
float d=morph(p,family);float other=morph(p+vec2(.13,-.09),mod(family+2.,8.));
d=join(d,other+.13-.12*growth,.12+.13*fluid);
float grain=noise(p*190.+seed),fine=fb(p*18.+seed),vein=abs(sin(fb(p*5.+seed)*38.+p.y*5.));
d+=(n-.5)*(.14+.23*rough)+(.5-fine)*.055;
float edge=1.-smoothstep(-.015,.022+.13*diffuse+.07*air,d);
float pigment=clamp(.35+n*.55+fine*.3,0.,1.);
if(voice<.5){pigment*=.6+.4*sin(p.y*18.+n*7.+t);}
else if(voice<1.5){pigment=mix(fine,grain,.4);edge*=smoothstep(.1,.4,fine);}
else if(voice<2.5){edge*=.55+.45*n;pigment=n;}
else if(voice<3.5){pigment=exp(-abs(d)*8.);}
else if(voice<4.5){float facet=abs(sin((p.x+p.y)*22.+floor(n*6.)));pigment=mix(facet,n,.4);}
else if(voice<5.5){edge*=smoothstep(.035,.18,vein);pigment=fine;}
else if(voice<6.5){pigment=n;edge*=.4+.6*n;}
else if(voice<7.5){pigment=pow(n,2.);edge*=smoothstep(.12,.4,n);}
else if(voice<8.5){pigment=1.-smoothstep(.03,.22,vein);}
else if(voice<9.5){pigment=.5+.5*sin(d*48.+n*4.);}
else if(voice<10.5){pigment=exp(-abs(d)*13.);edge=max(edge*.45,pigment*.65);}
else {pigment=fb(p*6.+vec2(sin(t),cos(t)));}
edge*=mix(1.,smoothstep(.025,.16,vein),fragile*.7);
float rim=exp(-abs(d)*38.);float relief=clamp(.5+(fb((p+vec2(.012,.015))*14.+seed)-fb(p*14.+seed))*6.,0.,1.);
vec3 c=mix(ink,accent,clamp(pigment+.13*heat-.12*cold,0.,1.));
c*=.65+.55*relief+rough*(grain-.5)*.35;
c+=vec3(.16,.13,.09)*rim*(.4+light);
float fade=1.-smoothstep(.79,.99,max(abs(p.x),abs(p.y)));
gl_FragColor=vec4(c,clamp(edge*fade*level*(.52+.35*pigment+.13*weight),0.,1.));

}`;
const palettes=[['#172528','#d4d6b9','#80b8b3','#c9a17c'],['#e9e2d3','#242d31','#80664b','#a7a89c'],['#201b28','#d8a5a4','#796aa1','#e5c4a2'],['#152421','#d8d7b5','#79a38c','#e0a86a'],['#151515','#eeeeee','#999999','#555555'],['#eee9df','#20201d','#8e8070','#b6a18b'],['#101b26','#b4d5dc','#466b83','#d7bba3'],['#28231d','#c4a678','#826a54','#e4d7b9']];
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
function reset(){seed=Math.random()*100;palette=palettes[Math.floor(Math.random()*palettes.length)];scene.background=new THREE.Color(palette[0]);targets.fill(0);targets[0]=.7;targets[8]=.65;targets[10]=.45;meshes.forEach((m,i)=>{const u=m.material.uniforms;u.seed.value=seed+i*17;u.family.value=(Math.floor(seed)%8+Math.floor(i/3))%8;u.ink.value.set(palette[1+i%3]);u.accent.value.set(palette[1+(i+1)%3]);m.position.set(Math.sin(seed+i*2.4)*.38,Math.cos(seed+i*1.7)*.38,(i-5.5)*.12);m.rotation.z=Math.sin(seed+i)*.7;m.scale.setScalar(.65+.35*Math.abs(Math.sin(seed+i*3)));});return targets.map((v,i)=>v?i:-1).filter(i=>i>=0)}
reset();
function render(seconds,settle=false){const t=(seconds%12)*T/12;meshes.forEach((m,i)=>{levels[i]=settle?targets[i]:levels[i]+(targets[i]-levels[i])*.09;const u=m.material.uniforms;u.phase.value=t;u.level.value=levels[i];for(const [k,j] of Object.entries({rough:1,heat:3,cold:4,fragile:5,diffuse:6,light:10,fluid:0,turbulence:11,growth:8,depth:9,weight:7,air:2}))u[k].value=levels[j];m.visible=levels[i]>.002;m.position.z=(i-5.5)*(.08+.09*levels[9])+.035*Math.sin(t+i);m.rotation.y=.12*Math.sin(t+i*.7);m.rotation.x=.09*Math.cos(t+i);});camera.position.x=.045*Math.sin(t);camera.lookAt(0,0,0);if(mode)stereo.render(scene,camera);else renderer.render(scene,camera)}
return {render,reset,toggle(i){targets[i]=targets[i]?0:.75;return !!targets[i]},boost(i){targets[i]=Math.min(1,targets[i]+.25)},clear(){targets.fill(0)},setMode(v){mode=v},dispose(){geo.dispose();meshes.forEach(m=>m.material.dispose());stereo.dispose();renderer.dispose()}}
}
