import {landmarks,match} from './morph.js';
import {enterPanorama} from './panorama.js';
import * as THREE from 'three';
import {EffectComposer} from 'three/addons/postprocessing/EffectComposer.js';
import {RenderPass} from 'three/addons/postprocessing/RenderPass.js';
import {UnrealBloomPass} from 'three/addons/postprocessing/UnrealBloomPass.js';
import {OutputPass} from 'three/addons/postprocessing/OutputPass.js';
import {analyzeScore,buildStory} from './score.js';
const V=`varying vec2 vUv;void main(){vUv=uv;gl_Position=vec4(position.xy,0.,1.);}`;
const F=`precision highp float;varying vec2 vUv;uniform sampler2D a,b,c,d;uniform vec4 ratio,w,band;uniform vec2 res;uniform float time,seed,absn;uniform vec3 palette;uniform vec4 gesture;uniform sampler2D heroA,heroB;uniform vec2 heroRatio;uniform float morphPhase,heroMix,mood;uniform vec4 links[12];uniform float linkCount;
float hash(vec2 p){vec3 q=fract(vec3(p.xyx)*.1031);q+=dot(q,q.yzx+33.33);return fract((q.x+q.y)*q.z);}
// Isotropic triangular gradient noise: no rectangular lattice interpolation.
vec2 grad(vec2 p){float a=6.2831853*hash(p);return vec2(cos(a),sin(a));}
float simplex(vec2 p){
 vec2 i=floor(p+(p.x+p.y)*.3660254038);
 vec2 x=p-i+(i.x+i.y)*.2113248654;
 vec2 j=x.x>x.y?vec2(1.,0.):vec2(0.,1.);
 vec2 y=x-j+.2113248654,z=x-1.+.4226497308;
 vec3 h=max(vec3(.5-dot(x,x),.5-dot(y,y),.5-dot(z,z)),0.);
 h*=h;h*=h;
 return 70.*dot(h,vec3(dot(grad(i),x),dot(grad(i+j),y),dot(grad(i+1.),z)));
}
float fb(vec2 p){mat2 rot=mat2(.8,.6,-.6,.8);float v=.57*simplex(p);p=rot*p*2.03+11.;v+=.28*simplex(p);p=rot*p*2.01-7.;v+=.15*simplex(p);return .5+.5*clamp(v,-1.,1.);}
vec2 cover(vec2 p,float r){float ar=res.x/res.y;return (p-.5)*vec2(min(1.,ar/r),min(1.,r/ar))+.5;}
vec3 photo(sampler2D tex,vec2 p,float r,float s){
 float t=time*.15;
 vec2 center=.5+.12*vec2(sin(t+s),cos(t*.83+s));
 vec2 flow=vec2(fb(p*1.6+vec2(s,t)),fb(p*1.6+vec2(t,s+9.)))-.5;
 // Reserve a guaranteed margin for every tap, even at maximum abstraction.
 vec2 q=.5+(p-.5)*(.82-.16*absn)+flow*(.025+.12*absn+.025*band.y);
 float focus=exp(-dot(p-center,p-center)*12.);
 vec2 delta=(q-center)*(.004+.10*absn)*(1.-focus);
 vec3 x=texture2D(tex,cover(q,r)).rgb*.46;
 x+=texture2D(tex,cover(q+delta,r)).rgb*.135;
 x+=texture2D(tex,cover(q-delta,r)).rgb*.135;
 x+=texture2D(tex,cover(q+delta*.45,r)).rgb*.135;
 x+=texture2D(tex,cover(q-delta*.45,r)).rgb*.135;
 return x;
}
vec3 recognizable(vec2 p){float f=morphPhase;vec2 da=vec2(0.),db=vec2(0.);float total=.35;for(int i=0;i<12;i++){if(float(i)<linkCount){vec4 k=links[i];vec2 middle=mix(k.xy,k.zw,f);float weight=exp(-dot(p-middle,p-middle)*19.);da+=(k.xy-middle)*weight;db+=(k.zw-middle)*weight;total+=weight;}}float arc=sin(f*3.14159265);vec2 flow=vec2(simplex(p*2.2+seed),simplex(p*2.2+seed+17.))*.035*arc;vec2 base=.5+(p-.5)*(.94-.17*arc);vec2 qa=clamp(base+da/total*.75+flow,.02,.98),qb=clamp(base+db/total*.75-flow,.02,.98);vec3 A=texture2D(heroA,cover(qa,heroRatio.x)).rgb,B=texture2D(heroB,cover(qb,heroRatio.y)).rgb;float organic=fb(p*2.8+seed);float m=smoothstep(0.,1.,clamp(f+(organic-.5)*arc*.8,0.,1.));return mix(A,B,m);}
void main(){vec2 p=vUv; vec2 v=p-.5; float r=length(v); p=.5+v*(1.-gesture.x*.23*exp(-r*2.)); p+=gesture.y*.035*vec2(sin(v.y*8.+time*.17),cos(v.x*7.-time*.13));float t=time*.12;vec3 A=photo(a,p,ratio.x,seed),B=photo(b,p,ratio.y,seed+11.),C=photo(c,p,ratio.z,seed+22.),D=photo(d,p,ratio.w,seed+33.);vec4 mask=vec4(fb(p*2.1+vec2(seed,t)),fb(p*2.6+vec2(t,seed+3.)),fb(p*2.3+vec2(seed+7.,-t)),fb(p*3.+vec2(-t,seed+13.)));mask=pow(max(mask,vec4(.03)),vec4(mix(7.,1.3,absn)))*w;mask/=max(dot(mask,vec4(1.)),.0001);vec3 col=A*mask.x+B*mask.y+C*mask.z+D*mask.w;vec3 screen=1.-pow(max(1.-col,vec3(.001)),vec3(1.+absn*.22));col=mix(col,screen,absn*.22);col=mix(col, palette*.75+col*.4,gesture.z*.16*absn);float fog=smoothstep(.42,.9,fb(p*2.+vec2(t,seed)));col=mix(col,palette*.8+vec3(.18),fog*absn*.25);for(int i=0;i<12;i++){float j=float(i)+seed;vec2 pos=vec2(hash(vec2(j,9.)),hash(vec2(j,23.)))+.06*vec2(sin(t+j),cos(t*.8+j));vec2 v=(p-pos)*vec2(res.x/res.y,1.);float r=.014+.05*hash(vec2(j,4.));col+=exp(-dot(v,v)/(r*r))*(.012+.025*band.z)*absn;}vec3 memory=recognizable(vUv);col=mix(col,memory,heroMix);float lum=dot(col,vec3(.2126,.7152,.0722));col=mix(vec3(lum),col,1.-mood*.06);col+=vec3(.035,.012,-.018)*max(mood,0.);gl_FragColor=vec4(clamp(col,0.,1.),1.);}`;

const particleVertex=`
attribute vec3 tint; attribute vec3 origin; attribute float phase;
uniform float t, energy, scatter, amount;
varying vec3 vColor; varying float vFade;
void main(){
 vec3 p=origin;
 float a=phase+t*.10;
 vec3 drift=vec3(sin(a+p.y*2.),cos(a*.8+p.x*2.),sin(a*.7+p.x));
 p+=drift*(.08+scatter*.8)*( .3+amount*.7);
 p.z+=scatter*.6*sin(a*1.3);
 vec4 mv=modelViewMatrix*vec4(p,1.);
 gl_Position=projectionMatrix*mv;
 gl_PointSize=clamp((3.+5.*scatter+energy*2.)/max(.6,-mv.z),1.,12.);
 vColor=tint;vFade=(.2+.8*scatter)*(.5+.5*sin(a*.5));
}`;
const particleFragment=`
varying vec3 vColor;varying float vFade;
void main(){vec2 p=gl_PointCoord-.5;float a=exp(-dot(p,p)*19.)*vFade;gl_FragColor=vec4(vColor,a*.65);}
`;
const ease=x=>x*x*(3-2*x);
export class Dream{
 constructor(canvas){
 this.canvas=canvas;this.renderer=new THREE.WebGLRenderer({canvas,antialias:false,preserveDrawingBuffer:true,alpha:false});
 this.renderer.setPixelRatio(1);this.renderer.setSize(960,540,false);
 this.renderer.outputColorSpace=THREE.SRGBColorSpace;
 this.scene=new THREE.Scene();this.camera=new THREE.PerspectiveCamera(43,16/9,.1,30);this.camera.position.z=4;
 this.uniforms={a:{value:null},b:{value:null},c:{value:null},d:{value:null},ratio:{value:new THREE.Vector4(1,1,1,1)},w:{value:new THREE.Vector4(1,0,0,0)},band:{value:new THREE.Vector4()},res:{value:new THREE.Vector2(960,540)},time:{value:0},seed:{value:Math.random()*80},absn:{value:.38},palette:{value:new THREE.Vector3()},gesture:{value:new THREE.Vector4()},heroA:{value:null},heroB:{value:null},heroRatio:{value:new THREE.Vector2(1,1)},morphPhase:{value:0},heroMix:{value:1},mood:{value:0},links:{value:Array.from({length:12},()=>new THREE.Vector4())},linkCount:{value:0}};
 this.material=new THREE.ShaderMaterial({vertexShader:V,fragmentShader:F,uniforms:this.uniforms,depthTest:false,depthWrite:false});
 this.back=new THREE.Mesh(new THREE.PlaneGeometry(2,2),this.material);this.back.frustumCulled=false;this.back.renderOrder=-10;this.scene.add(this.back);
 this.composer=new EffectComposer(this.renderer);this.composer.addPass(new RenderPass(this.scene,this.camera));
 this.bloom=new UnrealBloomPass(new THREE.Vector2(960,540),.22,.65,.72);this.composer.addPass(this.bloom);this.composer.addPass(new OutputPass());
 this.items=[];this.bands=[0,0,0,0];this.amount=.38;this.mood='calme';this.anchor=-1;this.pairCache=new Map();this.clock=0;this.running=false;this.seed=Math.random()*80;this.score=[];this.story=[];this.previewWidth=960;this.previewHeight=540;
 }
 async load(files,song){
 for(const [fileIndex,file] of files.entries()){const url=URL.createObjectURL(file);try{const im=new Image();im.src=url;await im.decode();const k=Math.min(1,1536/Math.max(im.width,im.height));const cv=document.createElement('canvas');cv.width=Math.max(1,Math.round(im.width*k));cv.height=Math.max(1,Math.round(im.height*k));cv.getContext('2d').drawImage(im,0,0,cv.width,cv.height);
 const small=document.createElement('canvas');small.width=small.height=64;const ctx=small.getContext('2d');ctx.drawImage(cv,0,0,64,64);const data=ctx.getImageData(0,0,64,64).data,pal=[0,0,0];for(let i=0;i<data.length;i+=4)for(let j=0;j<3;j++)pal[j]+=data[i+j]/(4096*255);
 const tex=new THREE.CanvasTexture(cv);tex.colorSpace=THREE.NoColorSpace;tex.minFilter=THREE.LinearFilter;tex.magFilter=THREE.LinearFilter;tex.generateMipmaps=false;this.items.push({tex,ratio:cv.width/cv.height,pal,data,marks:landmarks(data),id:fileIndex});
 }catch(e){console.warn(e)}finally{URL.revokeObjectURL(url)}}
 if(!this.items.length)throw Error('Aucune image lisible');
 if(song){this.audioUrl=URL.createObjectURL(song);this.audio=new Audio(this.audioUrl);this.audio.loop=true;this.ac=new AudioContext();this.analyser=this.ac.createAnalyser();this.analyser.fftSize=2048;this.analyser.smoothingTimeConstant=.86;this.source=this.ac.createMediaElementSource(this.audio);this.dest=this.ac.createMediaStreamDestination();this.source.connect(this.analyser);this.analyser.connect(this.ac.destination);this.analyser.connect(this.dest);this.bins=new Uint8Array(this.analyser.frequencyBinCount);try{const decoded=await this.ac.decodeAudioData(await song.arrayBuffer());this.duration=decoded.duration;this.score=analyzeScore(decoded)}catch(e){console.warn('Analyse audio indisponible',e)}}
 this.order();this.makeParticles();this.render();
 }
 order(){let pool=[...this.items],out=[pool.splice(Math.floor(Math.random()*pool.length),1)[0]];while(pool.length){let last=out.at(-1),distance=x=>x.pal.reduce((s,v,i)=>s+(v-last.pal[i])**2,0);pool.sort((a,b)=>distance(a)-distance(b));out.push(pool.shift())}if(this.anchor>=0){const j=out.findIndex(x=>x.id===this.anchor);if(j>0)out.unshift(...out.splice(j,1))}this.sequence=out;this.story=buildStory(this.score,this.duration||90,this.seed)}
 makeParticles(){if(this.points){this.scene.remove(this.points);this.points.geometry.dispose();this.points.material.dispose()}const count=14000,pos=new Float32Array(count*3),tint=new Float32Array(count*3),phase=new Float32Array(count);for(let i=0;i<count;i++){let im=this.items[i%this.items.length],x=Math.random(),y=Math.random(),p=(Math.floor(y*64)*64+Math.floor(x*64))*4;pos.set([(x-.5)*5.6,(.5-y)*3.2,-.8+Math.random()*1.8],i*3);tint.set([im.data[p]/255,im.data[p+1]/255,im.data[p+2]/255],i*3);phase[i]=Math.random()*40}const g=new THREE.BufferGeometry();g.setAttribute('position',new THREE.BufferAttribute(pos,3));g.setAttribute('origin',new THREE.BufferAttribute(pos.slice(),3));g.setAttribute('tint',new THREE.BufferAttribute(tint,3));g.setAttribute('phase',new THREE.BufferAttribute(phase,1));const m=new THREE.ShaderMaterial({vertexShader:particleVertex,fragmentShader:particleFragment,uniforms:{t:{value:0},energy:{value:0},scatter:{value:0},amount:{value:this.amount}},transparent:true,depthWrite:false,depthTest:false,blending:THREE.NormalBlending});this.points=new THREE.Points(g,m);this.points.frustumCulled=false;this.points.renderOrder=5;this.scene.add(this.points)}
 setMood(x){this.mood=x;if(this.items.length)this.render()}
 setAnchor(x){this.anchor=x;if(this.items.length){this.order();this.clock=0;this.render()}}
 setAmount(x){this.amount=x;if(this.items.length)this.render()}
 resize(w,h){this.renderer.setSize(w,h,false);this.composer.setSize(w,h);this.camera.aspect=w/h;this.camera.updateProjectionMatrix();this.uniforms.res.value.set(w,h)}
 render(){if(!this.sequence?.length)return;const u=this.uniforms;let t=this.clock%(this.duration||90),story=this.story,ix=story.findIndex(s=>t<s.end);if(ix<0)ix=story.length-1;let s=story[ix],next=story[(ix+1)%story.length],f=ease(Math.min(1,Math.max(0,(t-s.start)/(s.end-s.start))));let g=s.gesture.map((v,i)=>v+(next.gesture[i]-v)*f);
 let phase=this.clock/14,i=Math.floor(phase),f2=ease(phase-i),items=[],weights=[];for(let k=0;k<4;k++){let slot=(i+k)%4;items[slot]=this.sequence[(i+k)%this.sequence.length];weights[slot]=[(1-f2)*.55,1.-.45*f2,.55+.45*f2,.55*f2][k]}
 let pal=[0,0,0],sum=weights.reduce((a,b)=>a+b,0);items.forEach((v,k)=>{u[['a','b','c','d'][k]].value=v.tex;v.pal.forEach((x,j)=>pal[j]+=x*weights[k]/sum)});
 const style=this.mood==='lumineux'?1:this.mood==='mystere'?-1:0;const period=this.mood==='calme'?16:12;const cycle=this.clock/period,hi=Math.floor(cycle),local=cycle-hi;const hA=this.sequence[hi%this.sequence.length],hB=this.sequence[(hi+1)%this.sequence.length];const mf=ease(Math.max(0,Math.min(1,(local-.19)/.64)));const key=hA.id+':'+hB.id;if(!this.pairCache.has(key))this.pairCache.set(key,match(hA.marks,hB.marks));const pairs=this.pairCache.get(key);u.linkCount.value=pairs.length;for(let k=0;k<pairs.length;k++){const {p,q}=pairs[k];u.links.value[k].set(p.x,p.y,q.x,q.y)}u.heroA.value=hA.tex;u.heroB.value=hB.tex;u.heroRatio.value.set(hA.ratio,hB.ratio);u.morphPhase.value=mf;const crest=Math.sin(mf*Math.PI);u.heroMix.value=Math.max(.30,1-this.amount*(.28+.42*crest));u.mood.value=style;
 u.ratio.value.fromArray(items.map(x=>x.ratio));u.w.value.fromArray(weights);u.band.value.fromArray(this.bands);u.palette.value.fromArray(pal);u.time.value=this.clock;u.seed.value=this.seed;u.absn.value=this.amount;u.gesture.value.fromArray(g.map((x,i)=>x*(this.mood==='calme'?.65:this.mood==='mystere'?1.15:1)));
 this.camera.position.x=.12*Math.sin(this.clock*.12)*g[0];this.camera.position.y=.08*Math.cos(this.clock*.09)*g[0];this.camera.lookAt(0,0,0);
 if(this.points){let pu=this.points.material.uniforms;pu.t.value=this.clock;pu.energy.value=this.bands[2];pu.scatter.value=g[3]*this.amount*(.2+.5*crest);pu.amount.value=this.amount;this.points.visible=this.amount>.04&&g[3]>.05}
 this.bloom.strength=.025+this.amount*(.06+g[2]*.09)*(style===1?1.7:1);if(this.vrTarget){this.renderer.render(this.scene,this.camera)}else this.composer.render();
 }
 readAudio(){if(!this.analyser||this.audio.paused)return;this.analyser.getByteFrequencyData(this.bins);const hz=this.ac.sampleRate/2048;for(let k=0;k<3;k++){let lo=Math.max(1,Math.floor([35,220,2000][k]/hz)),hi=Math.min(this.bins.length,Math.ceil([220,2000,8000][k]/hz)),sum=0;for(let i=lo;i<hi;i++)sum+=this.bins[i];this.bands[k]+=(sum/Math.max(1,hi-lo)/255-this.bands[k])*.055}}
 async play(){if(this.disposed||this.panorama)return;if(this.audio){try{await this.ac.resume();await this.audio.play()}catch(e){console.warn(e)}}if(this.disposed||this.panorama||this.running)return;this.running=true;let last=performance.now(),slow=0,frames=0;const frame=now=>{if(!this.running)return;let raw=(now-last)/1000;last=now;this.readAudio();this.clock=this.audio&&!this.audio.paused?this.audio.currentTime:this.clock+Math.min(.1,raw);this.render();slow+=raw;frames++;if(frames===90){if(!this.rec&&slow/frames>.045&&this.previewWidth>640){this.previewWidth=640;this.previewHeight=360;this.resize(640,360)}frames=0;slow=0}this.raf=requestAnimationFrame(frame)};this.raf=requestAnimationFrame(frame)}
 pause(){this.running=false;cancelAnimationFrame(this.raf);this.audio?.pause()}
 async variation(){this.pause();this.seed=Math.random()*80;this.order();this.makeParticles();this.clock=0;if(this.audio)this.audio.currentTime=0;await this.play()}
async exportHD(){if(this.panorama||this.rec)throw Error('Une session est déjà active');if(!window.MediaRecorder||!this.canvas.captureStream)throw Error('Export non disponible');this.pause();this.resize(1920,1080);this.clock=0;this.bands=[0,0,0,0];if(this.audio)this.audio.currentTime=0;this.render();let stream=this.canvas.captureStream(30);if(this.dest)this.dest.stream.getAudioTracks().forEach(t=>stream.addTrack(t.clone()));try{const mime=['video/mp4','video/webm;codecs=vp8,opus','video/webm'].find(t=>MediaRecorder.isTypeSupported(t));const rec=new MediaRecorder(stream,{...(mime?{mimeType:mime}:{}),videoBitsPerSecond:10000000});this.rec=rec;let chunks=[];let done=new Promise((resolve,reject)=>{rec.ondataavailable=e=>{if(e.data.size)chunks.push(e.data)};rec.onerror=e=>reject(e.error||Error('Export interrompu'));rec.onstop=()=>{let url=URL.createObjectURL(new Blob(chunks,{type:rec.mimeType}));let a=document.createElement('a');a.href=url;a.download='Morphoz-'+Date.now()+(rec.mimeType.includes('mp4')?'.mp4':'.webm');a.click();setTimeout(()=>URL.revokeObjectURL(url),60000);resolve()}});rec.start(1000);await this.play();this.timer=setTimeout(()=>this.finishExport(),this.audio&&Number.isFinite(this.audio.duration)?this.audio.duration*1000:60000);await done;}finally{clearTimeout(this.timer);this.pause();stream.getTracks().forEach(t=>t.stop());this.rec=null;if(!this.disposed){this.resize(this.previewWidth,this.previewHeight);this.render()}}}
finishExport(){if(this.rec?.state==='recording')this.rec.stop()}

 async enterVR(onEnd){return enterPanorama(this,onEnd)}
 dispose(){if(this.disposed)return;this.disposed=true;this.panorama?.end().catch(()=>{});this.finishExport();this.pause();this.source?.disconnect();this.ac?.close().catch(()=>{});if(this.audioUrl)URL.revokeObjectURL(this.audioUrl);this.items.forEach(x=>x.tex.dispose());if(this.points){this.points.geometry.dispose();this.points.material.dispose()}this.back.geometry.dispose();this.material.dispose();this.bloom.dispose();this.composer.dispose();this.renderer.dispose()}
}