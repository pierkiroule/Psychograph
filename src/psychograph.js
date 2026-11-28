import * as THREE from 'three';
const V=`varying vec2 v;void main(){v=uv;gl_Position=vec4(position.xy,0.,1.);}`;
const F=`precision highp float;varying vec2 v;uniform vec2 size;uniform float time,seed,other,blend,intensity;uniform vec4 m0,m1,m2;uniform vec3 audio;
vec3 hash(vec3 p){p=fract(p*vec3(.1031,.1030,.0973));p+=dot(p,p.yxz+33.33);return fract((p.xxy+p.yxx)*p.zyx);}
float noise(vec2 p){vec2 i=floor(p),x=fract(p);vec2 u=x*x*x*(x*(x*6.-15.)+10.);return mix(mix(dot(hash(vec3(i,0.)).xy-.5,x),dot(hash(vec3(i+vec2(1,0),0.)).xy-.5,x-vec2(1,0)),u.x),mix(dot(hash(vec3(i+vec2(0,1),0.)).xy-.5,x-vec2(0,1)),dot(hash(vec3(i+1.,0.)).xy-.5,x-1.),u.x),u.y)*2.;}
float fb(vec2 p){mat2 R=mat2(.8,.6,-.6,.8);float a=.55,s=0.;for(int i=0;i<5;i++){s+=a*noise(p);p=R*p*2.05+7.3;a*=.49;}return s;}
vec3 paint(vec2 p,float k){
float t=time*.045;float wave=m0.x,heat=m0.y,wind=m0.z,relief=m0.w,ink=m1.x,grow=m1.y,dark=m1.z,light=m1.w,gravity=m2.x,mist=m2.y,crystal=m2.z,trace=m2.w;
float r=length(p);vec2 q=p;
q+=.13*wave*vec2(sin(p.y*5.+t),sin(p.x*4.-t));q+=.19*wind*vec2(fb(p*2.+t),fb(p*2.-t+13.));q*=1.+.30*gravity*exp(-r*r*2.);
vec2 flow=vec2(fb(q*2.+k+t),fb(q*2.+k+17.-t));q+=flow*(.30+.45*ink+.22*heat+.14*audio.x)*intensity;
float a=fb(q*2.6+k),b=fb(q*5.+k*1.7),c=fb(q*11.+k*.7);
float mass=smoothstep(-.22,.20,a+.35*b+.12*sin(t+k));float vein=exp(-abs(a+.32*b)*19.);float branch=exp(-abs(sin((a+.2*b)*19.+q.y*2.))*5.)*smoothstep(-.12,.18,b);
float mineral=pow(max(0.,1.-abs(sin(9.*a+q.x*2.))*2.),3.);
float strata=.5+.5*sin(14.*a+q.y*4.+b*4.);
vec3 paper=mix(vec3(.96,.94,.89),vec3(.075,.11,.15),dark*.88);
vec3 P=.5+.27*cos(vec3(0.,2.1,4.2)+k*.19+heat*1.2-light*.6);
vec3 Q=.5+.25*cos(vec3(0.,2.1,4.2)+k*.19+2.4);
P=mix(P,vec3(.12,.27,.29),ink*.35);Q=mix(Q,vec3(.72,.48,.25),heat*.45);
vec3 col=mix(paper,P,mass*(.62+.16*relief));
col=mix(col,Q,smoothstep(-.04,.28,b)*(.24+.27*wave));
col=mix(col,P*.34,vein*(.08+.35*grow+.20*trace)*mass);
col=mix(col,Q*.6,branch*grow*.40);col=mix(col,Q*.85,strata*relief*.18);
col=mix(col,vec3(.91,.86,.70),mineral*crystal*.45);
float fog=smoothstep(-.13,.28,fb(p*1.8+k-t));col=mix(col,paper,fog*(.08+.55*mist));
float glow=exp(-dot(p-vec2(.22*sin(k),.30*cos(k)),p-vec2(.22*sin(k),.30*cos(k)))*3.);
col=mix(col,vec3(1.,.93,.77),glow*light*.38);
col+=c*.025*(1.+trace);col=mix(col,paper,smoothstep(.65,1.45,r)*.25);
return clamp(col,0.,1.);
}
void main(){vec2 p=(v-.5)*2.;p.x*=size.x/size.y;float f=smoothstep(0.,1.,blend);vec3 a=paint(p,seed),b=paint(p,other);vec3 col=mix(a,b,f);gl_FragColor=vec4(col,1.);}
`;
export class Psychograph{
constructor(canvas){this.canvas=canvas;this.renderer=new THREE.WebGLRenderer({canvas,antialias:true,preserveDrawingBuffer:true});this.renderer.setPixelRatio(1);this.scene=new THREE.Scene();this.camera=new THREE.Camera();this.current=Array(12).fill(0);this.target=this.current.slice();this.seed=17+Math.random()*80;this.next=this.seed;this.mix=0;this.time=0;this.intensity=.55;this.paused=false;this.dead=false;this.uniforms={size:{value:new THREE.Vector2(800,800)},time:{value:0},seed:{value:this.seed},other:{value:this.next},blend:{value:0},intensity:{value:this.intensity},m0:{value:new THREE.Vector4()},m1:{value:new THREE.Vector4()},m2:{value:new THREE.Vector4()},audio:{value:new THREE.Vector3()}};this.mat=new THREE.ShaderMaterial({vertexShader:V,fragmentShader:F,uniforms:this.uniforms,depthTest:false,depthWrite:false});this.mesh=new THREE.Mesh(new THREE.PlaneGeometry(2,2),this.mat);this.mesh.frustumCulled=false;this.scene.add(this.mesh);this.resize(800,800);this.last=performance.now();this.renderer.setAnimationLoop(now=>this.frame(now));}
resize(w,h){this.renderer.setSize(w,h,false);this.uniforms.size.value.set(w,h)}
setMoods(ids){this.target=this.target.map((_,i)=>ids.includes(i)?1:0)}
setIntensity(v){this.intensity=v}
variation(){if(this.mix>0)return;this.next=1+Math.random()*100;this.mix=.001}
snapshot(){return {version:1,seed:this.seed,moods:this.target.map((v,i)=>v?i:-1).filter(i=>i>=0),intensity:this.intensity}}
restore(s){this.seed=s.seed;this.next=s.seed;this.mix=0;this.setMoods(s.moods);this.intensity=s.intensity;this.current=this.target.slice();this.time=0}
frame(now){if(this.dead)return;let dt=Math.min(.08,Math.max(0,(now-this.last)/1000));this.last=now;if(!this.paused){this.time+=dt;this.current=this.current.map((v,i)=>v+(this.target[i]-v)*(1-Math.exp(-dt*1.15)));if(this.mix>0){this.mix+=dt*.18;if(this.mix>=1){this.seed=this.next;this.mix=0}}}const u=this.uniforms;u.time.value=this.time;u.seed.value=this.seed;u.other.value=this.next;u.blend.value=this.mix;u.intensity.value=this.intensity;u.m0.value.fromArray(this.current.slice(0,4));u.m1.value.fromArray(this.current.slice(4,8));u.m2.value.fromArray(this.current.slice(8,12));this.renderer.render(this.scene,this.camera)}
dispose(){this.dead=true;this.renderer.setAnimationLoop(null);this.mesh.geometry.dispose();this.mat.dispose();this.renderer.dispose()}
}
