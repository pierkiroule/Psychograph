import * as THREE from 'three';
const T=Math.PI*2;
const colors=[0x168caa,0x9e7242,0x9eace2,0xf17c28,0x2588d2,0xbb8cb8,0xe66a9c,0xb72a35,0x4a943f,0x424d94,0xe9b65c,0x863ac7];
const hash=n=>{const x=Math.sin(n*127.1+311.7)*43758.5453;return x-Math.floor(x)};
const clamp=(x,a,b)=>Math.max(a,Math.min(b,x));
const V=(x,y,z)=>new THREE.Vector3(x,y,z);
// Periodic parametric surfaces: the actual vertex positions evolve, not just the object transform.
function surface(i,u,v,t,s,seed){
 const a=u*T,b=v*T,q=Math.sin(t+seed),c=Math.cos(t),k=.5+s*.5;
 let x,y,z,r;
 switch(i){
 case 0: { // twisted flowing ribbon, two edges of a continuous surface
 const w=(v-.5)*(.85+.15*Math.sin(3*a+t)); const ang=2*a+.55*Math.sin(t);
 r=1.13+w*Math.cos(ang);x=r*Math.cos(a);y=r*Math.sin(a);z=w*Math.sin(ang)+.22*Math.sin(3*a+t);break;}
 case 1: { // faceted mineral shell
 const lat=Math.PI*v; r=.95+.22*Math.cos(5*a)*Math.sin(7*lat)+.16*Math.sin(3*a+t)*Math.sin(lat);
 x=r*Math.sin(lat)*Math.cos(a);y=r*Math.cos(lat)*1.3;z=r*Math.sin(lat)*Math.sin(a);break;}
 case 3: { // convection torus with lobed surface
 r=.43+.15*Math.sin(4*a+2*b-t)+.1*Math.cos(3*b+t);const R=.94+.16*Math.sin(3*a+t);
 x=(R+r*Math.cos(b))*Math.cos(a);y=r*Math.sin(b)+.3*Math.sin(2*a-t);z=(R+r*Math.cos(b))*Math.sin(a);break;}
 case 4: { // crystalline star envelope
 const lat=Math.PI*v; r=.72+.45*Math.pow(Math.abs(Math.cos(3*a)*Math.sin(3*lat)),4);
 r*=1+.07*Math.sin(t+6*a);x=r*Math.sin(lat)*Math.cos(a);y=r*Math.cos(lat);z=r*Math.sin(lat)*Math.sin(a);break;}
 case 5: { // open gossamer pleated membrane
 const rho=.16+1.05*v;const ang=a+.22*v*Math.sin(5*a+t);
 x=rho*Math.cos(ang);z=rho*Math.sin(ang);y=.55*v*Math.sin(6*a+3*v-t)+.22*Math.cos(3*a+t);break;}
 case 6: { // growing concentric undulating cup
 const rho=.12+1.25*v; x=rho*Math.cos(a);z=rho*Math.sin(a);y=.8*v*v+.26*v*Math.sin(7*a-4*v+t)+.15*Math.sin(3*a+t);break;}
 case 7: { // densely folded closed body
 const lat=Math.PI*v; r=.92+.23*Math.sin(5*a+3*lat+t)*Math.sin(lat)+.12*Math.cos(9*lat-t);
 x=r*Math.sin(lat)*Math.cos(a);y=1.15*r*Math.cos(lat);z=r*Math.sin(lat)*Math.sin(a);break;}
 case 9: { // open spiral architectural shell
 const ang=u*T*2.4;const R=.2+.88*u;const tube=.12+.33*u;
 x=(R+tube*Math.cos(b))*Math.cos(ang);z=(R+tube*Math.cos(b))*Math.sin(ang);y=(u-.5)*1.6+tube*Math.sin(b)+.12*Math.sin(ang+t);break;}
 case 10:{ // petal-like translucent radial wings
 const rho=.10+v*(.8+.38*Math.cos(5*a));x=rho*Math.cos(a);z=rho*Math.sin(a);y=.65*v*Math.sin(5*a+t)+.25*v*v;break;}
 case 11:{ // tube around a deforming torus knot
 const A=a*2,B=a*3+.22*Math.sin(t);const R=.78+.35*Math.cos(B);
 const cx=R*Math.cos(A),cz=R*Math.sin(A),cy=.36*Math.sin(B);
 const tube=.13+.045*Math.sin(7*a+t);x=cx+tube*Math.cos(b)*Math.cos(A);z=cz+tube*Math.cos(b)*Math.sin(A);y=cy+tube*Math.sin(b);break;}
 default:{const lat=Math.PI*v;x=Math.sin(lat)*Math.cos(a);y=Math.cos(lat);z=Math.sin(lat)*Math.sin(a);}
 }
 return [x*k,y*k,z*k];
}
function makeSurface(i,seed){
 const U= i===11||i===9?112:72,W=36;
 const g=new THREE.PlaneGeometry(1,1,U,W);
 const mat=new THREE.MeshPhysicalMaterial({color:colors[i],metalness:i===1||i===4||i===11 ? .45:.12,roughness:i===1 ? .38:.26,clearcoat:.65,side:THREE.DoubleSide,flatShading:i===1||i===4,transparent:true,opacity:1,depthWrite:true});
 const mesh=new THREE.Mesh(g,mat);mesh.frustumCulled=false;
 return {object:mesh,update(t,s){const p=g.attributes.position;for(let j=0;j<=W;j++)for(let k=0;k<=U;k++){const [x,y,z]=surface(i,k/U,j/W,t,s,seed);p.setXYZ(j*(U+1)+k,x,y,z)}p.needsUpdate=true;g.computeVertexNormals();mat.opacity=s;mat.depthWrite=s>.92;mesh.visible=s>.008;},dispose(){g.dispose();mat.dispose()}};
}
function makeSwarm(seed){
 const count=650,g=new THREE.IcosahedronGeometry(.035,0),m=new THREE.MeshStandardMaterial({color:0xffffff,roughness:.28,metalness:.28,transparent:true});
 const o=new THREE.InstancedMesh(g,m,count),dummy=new THREE.Object3D();o.frustumCulled=false;
 for(let j=0;j<count;j++)o.setColorAt(j,new THREE.Color(colors[2]).lerp(new THREE.Color(0x5269a2),hash(seed+j)));
 return {object:o,update(t,s){for(let j=0;j<count;j++){const a=hash(j+seed)*T,b=Math.acos(2*hash(j*3+seed)-1),r=.35+hash(j*5+seed)*.94;const w=a+.22*Math.sin(t+b*3);dummy.position.set(r*Math.sin(b)*Math.cos(w)+.16*Math.sin(t+j*.13),r*Math.cos(b)+.18*Math.cos(t+a),r*Math.sin(b)*Math.sin(w));dummy.scale.setScalar(s*(.45+hash(j*9)*1.8));dummy.updateMatrix();o.setMatrixAt(j,dummy.matrix)}o.instanceMatrix.needsUpdate=true;o.visible=s>.008;m.opacity=s;},dispose(){g.dispose();m.dispose()}};
}
function makeTree(seed){
 const group=new THREE.Group(),geo=new THREE.CylinderGeometry(1,1,1,7),mat=new THREE.MeshStandardMaterial({color:colors[8],roughness:.32,metalness:.08,transparent:true});
 const nodes=[],up=V(0,1,0);
 function branch(parent,dir,len,n,id){if(n===0)return;const m=new THREE.Mesh(geo,mat);group.add(m);nodes.push({m,parent,dir,len,n,id,end:V(0,0,0)});const index=nodes.length-1;for(let k=0;k<3;k++){const a=k*T/3+hash(id+seed)*T;const d=dir.clone().add(V(Math.cos(a)*.8,.18,Math.sin(a)*.8)).normalize();branch(index,d,len*.67,n-1,id*3+k+1)}}
 branch(-1,V(0,1,0),.65,5,1);
 return {object:group,update(t,s){for(const node of nodes){const start=node.parent<0?V(0,-1.1,0):nodes[node.parent].end;const d=node.dir.clone().add(V(.10*Math.sin(t+node.id),.03*Math.cos(t),.10*Math.cos(t+node.id))).normalize();const len=node.len*(.65+.35*s)*(1+.10*Math.sin(t+node.id*.15));node.end.copy(start).addScaledVector(d,len);node.m.position.copy(start).lerp(node.end,.5);node.m.quaternion.setFromUnitVectors(up,d);node.m.scale.set(.012*node.n*s,len,.012*node.n*s)}group.visible=s>.008;mat.opacity=s;},dispose(){geo.dispose();mat.dispose()}};
}
export function createSynth(canvas){
 const renderer=new THREE.WebGLRenderer({canvas,antialias:true,preserveDrawingBuffer:true,alpha:false});
 renderer.setPixelRatio(1);renderer.setSize(900,900,false);renderer.setClearColor(0xffffff);renderer.outputColorSpace=THREE.SRGBColorSpace;
 renderer.toneMapping=THREE.ACESFilmicToneMapping;renderer.toneMappingExposure=1.35;
 const scene=new THREE.Scene();scene.background=new THREE.Color(0xffffff);
 const camera=new THREE.PerspectiveCamera(38,1,.1,30);camera.position.set(3.1,2.0,5.2);camera.lookAt(0,0,0);
 scene.add(new THREE.HemisphereLight(0xffffff,0xb3b9c4,2.1));
 for(const [x,y,z,p,c] of [[3,5,4,4,0xfff4e8],[-4,2,3,2.2,0xe3efff],[0,3,-4,3,0xffffff]]){const l=new THREE.DirectionalLight(c,p);l.position.set(x,y,z);scene.add(l)}
 const levels=Array(12).fill(0),targets=Array(12).fill(0),objects=new Map();let seed=1;
 function remove(i){const o=objects.get(i);if(o){scene.remove(o.object);o.dispose();objects.delete(i)}}
 function ensure(i){if(objects.has(i))return;const o=i===2?makeSwarm(seed):i===8?makeTree(seed):makeSurface(i,seed);objects.set(i,o);scene.add(o.object)}
 function reset(){for(const i of objects.keys())remove(i);seed=Math.random()*10000;targets.fill(0);levels.fill(0);targets[0]=.8;ensure(0);return [0]}
 function render(seconds,settle=false){
 const t=(seconds%12)*T/12;
 for(let i=0;i<12;i++){levels[i]=settle?targets[i]:levels[i]+(targets[i]-levels[i])*.09;if(!targets[i]&&levels[i]<.003)remove(i)}
 const ids=[...objects.keys()],n=ids.length;
 ids.forEach((i,j)=>{const o=objects.get(i),s=levels[i],a=hash(seed+i)*T;
 const radius=n===1?0:Math.min(.95,.35+n*.06),scale=n===1?1.12:Math.max(.46,.96-.06*n);
 o.object.position.set(radius*Math.cos(a),.30*Math.sin(a+t),radius*Math.sin(a));
 o.object.scale.setScalar(scale);o.object.rotation.set(.16*Math.sin(t+a),a+.35*Math.sin(t),.15*Math.cos(t+a));o.update(t+a,s);
 // Coupled forces modify the volume and the spatial choreography.
 if(targets[0]&&targets[3])o.object.rotation.z+=.22*Math.sin(t+a);
 if(targets[8]&&targets[5])o.object.scale.multiplyScalar(.88+.12*Math.cos(t+a));
 if(targets[2]&&targets[11])o.object.position.add(V(.2*Math.cos(t+a),.15*Math.sin(t+a),.2*Math.sin(t+a)));
 });
 camera.position.set(3.1+.24*Math.sin(t),2+.16*Math.cos(t),5.2);camera.lookAt(0,0,0);renderer.render(scene,camera)
 }
 reset();return {render,reset,toggle(i){targets[i]=targets[i]?0:.8;if(targets[i])ensure(i);return !!targets[i]},boost(i){targets[i]=Math.min(1,targets[i]+.2);ensure(i)},clear(){targets.fill(0)},dispose(){for(const i of objects.keys())remove(i);renderer.dispose()}};
}
