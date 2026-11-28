import * as THREE from 'three';
// A stationary frontal cylindrical cinema. The source film is monoscopic.
export async function enterPanorama(engine,onEnd){
 if(!navigator.xr)throw Error('WebXR indisponible. Ouvre Morphoz dans le navigateur du Quest.');
 if(engine.rec)throw Error('Termine l’export avant la VR.');
 const session=await navigator.xr.requestSession('immersive-vr',{optionalFeatures:['local-floor']});
 const renderer=engine.renderer,wasPlaying=engine.running;
 engine.running=false;cancelAnimationFrame(engine.raf);
 const scene=new THREE.Scene();scene.background=new THREE.Color(0x000000);
 const camera=new THREE.PerspectiveCamera(70,1,.05,50);
 const target=new THREE.WebGLRenderTarget(1536,864,{depthBuffer:true});
 const radius=4,arc=Math.PI,height=4.8;
 const geometry=new THREE.CylinderGeometry(radius,radius,height,96,1,true,-Math.PI/2,arc);
 // CylinderGeometry x=sin(theta), z=cos(theta): rotate toward -Z.
 geometry.rotateY(Math.PI);
 const material=new THREE.MeshBasicMaterial({map:target.texture,side:THREE.BackSide,toneMapped:false});
 const screen=new THREE.Mesh(geometry,material);
 // Reverse horizontal texture coordinates for inside viewing.
 const uv=geometry.attributes.uv;for(let i=0;i<uv.count;i++)uv.setX(i,1-uv.getX(i));uv.needsUpdate=true;
 scene.add(screen);screen.position.y=0;
 let closed=false,initialized=false,last=performance.now(),lastDraw=0;
 const cleanup=()=>{if(closed)return;closed=true;renderer.setAnimationLoop(null);renderer.xr.enabled=false;engine.panorama=null;engine.vrTarget=null;target.dispose();geometry.dispose();material.dispose();renderer.setRenderTarget(null);engine.resize(engine.previewWidth,engine.previewHeight);if(wasPlaying)engine.play();else{engine.audio?.pause();engine.render()}onEnd?.(wasPlaying)};
 session.addEventListener('end',cleanup,{once:true});
 engine.panorama=session;engine.vrTarget=target;
 try{
 renderer.xr.enabled=true;renderer.xr.setReferenceSpaceType('local');await renderer.xr.setSession(session);
 if(engine.audio){try{await engine.ac.resume();await engine.audio.play()}catch{}}
 renderer.setAnimationLoop((now,frame)=>{
 if(closed)return;
 if(!initialized){const pose=frame?.getViewerPose(renderer.xr.getReferenceSpace());if(pose){const p=pose.transform.position,q=pose.transform.orientation;scene.position.set(p.x,p.y,p.z);const e=new THREE.Euler().setFromQuaternion(new THREE.Quaternion(q.x,q.y,q.z,q.w),'YXZ');scene.rotation.y=e.y;initialized=true;}}
 const dt=Math.min(.1,(now-last)/1000);last=now;
 // Film update at 30 Hz, headset presentation at native XR refresh.
 if(now-lastDraw>=32){lastDraw=now;engine.readAudio();engine.clock=engine.audio&&!engine.audio.paused?engine.audio.currentTime:engine.clock+dt*2;renderer.xr.enabled=false;renderer.setRenderTarget(target);engine.render();renderer.setRenderTarget(null);renderer.xr.enabled=true;}
 renderer.render(scene,camera);
 });
 return session;
 }catch(e){try{await session.end()}catch{}cleanup();throw e}
}
