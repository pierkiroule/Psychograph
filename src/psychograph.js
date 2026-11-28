import * as THREE from 'three';
import {makeArt} from './materials.js';
const V=`varying vec2 v;void main(){v=uv;gl_Position=vec4(position.xy,0.,1.);}`;
const F=`precision highp float;varying vec2 v;uniform sampler2D a,b;uniform vec2 size;uniform float time,f,amount;void main(){vec2 p=v-.5;vec2 q=p*vec2(size.x/size.y,1.);q/=max(1.,size.x/size.y);float t=time*.065;float h=sin(f*3.14159);vec2 d=vec2(sin(q.y*8.+t),cos(q.x*7.-t))*(.008+.028*h)*amount;vec2 u=.5+q*.91;vec2 x=clamp(u+d*f,.005,.995),y=clamp(u-d*(1.-f),.005,.995);float m=smoothstep(0.,1.,clamp(f+sin(q.x*5.+sin(q.y*6.))*h*.16,0.,1.));vec3 col=mix(texture2D(a,x).rgb,texture2D(b,y).rgb,m);gl_FragColor=vec4(col,1.);}`;
export class Psychograph{
 constructor(canvas){this.canvas=canvas;this.renderer=new THREE.WebGLRenderer({canvas,antialias:false,preserveDrawingBuffer:true});this.renderer.setPixelRatio(1);this.scene=new THREE.Scene();this.camera=new THREE.Camera();this.seed=Math.random()*100;this.ids=[];this.intensity=.55;this.paused=false;this.time=0;this.f=1;this.last=performance.now();this.a=this.texture(this.seed,[]);this.b=this.a;this.u={a:{value:this.a},b:{value:this.b},size:{value:new THREE.Vector2(800,800)},time:{value:0},f:{value:1},amount:{value:.55}};this.mat=new THREE.ShaderMaterial({vertexShader:V,fragmentShader:F,uniforms:this.u,depthTest:false,depthWrite:false});this.mesh=new THREE.Mesh(new THREE.PlaneGeometry(2,2),this.mat);this.mesh.frustumCulled=false;this.scene.add(this.mesh);this.resize(800,800);this.renderer.setAnimationLoop(t=>this.frame(t))}
 texture(seed,ids){let t=new THREE.CanvasTexture(makeArt(seed,ids));t.minFilter=THREE.LinearFilter;t.magFilter=THREE.LinearFilter;t.generateMipmaps=false;return t}
 resize(w,h){this.renderer.setSize(Math.round(w),Math.round(h),false);this.u.size.value.set(w,h)}
 setMoods(ids){if(JSON.stringify(ids)===JSON.stringify(this.ids))return;this.ids=[...ids];this.schedule()}
 setIntensity(v){this.intensity=v}
 variation(){this.seed=Math.random()*100;this.schedule()}
 schedule(){clearTimeout(this.timer);this.timer=setTimeout(()=>{if(this.f<1){this.pending=true;return}this.transition()},90)}
 transition(){this.pending=false;const next=this.texture(this.seed,this.ids);if(this.a!==this.b)this.a.dispose();this.a=this.b;this.b=next;this.u.a.value=this.a;this.u.b.value=this.b;this.f=0;if(this.paused)this.f=1}
 snapshot(){return {version:2,seed:this.seed,moods:[...this.ids],intensity:this.intensity}}
 restore(s){this.seed=s.seed;this.ids=[...s.moods];this.intensity=s.intensity;this.f=1;this.transition()}
 frame(now){const dt=Math.min(.08,Math.max(0,(now-this.last)/1000));this.last=now;if(!this.paused){this.time+=dt;this.f=Math.min(1,this.f+dt/3.2)}if(this.f>=1&&this.pending)this.transition();this.u.f.value=this.f;this.u.time.value=this.time;this.u.amount.value=this.intensity;this.renderer.render(this.scene,this.camera)}
 dispose(){clearTimeout(this.timer);this.renderer.setAnimationLoop(null);this.a.dispose();if(this.a!==this.b)this.b.dispose();this.mesh.geometry.dispose();this.mat.dispose();this.renderer.dispose()}
}
