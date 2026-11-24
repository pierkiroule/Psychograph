import * as THREE from 'three';
// One continuous implicit material; ordered operations modify the same spatial field.
// Shader generated per recipe, rather than overlaying one object per sensor.
const MAX=12;
const operations=[
'p.xy=rot(.7*sin(p.z*2.+t))*p.xy; p+=.22*sin(p.yzx*3.+t);',
'd+=.13*sin(p.x*23.)*sin(p.y*21.)*sin(p.z*19.); rough=min(1.,rough+.3);',
'p*=vec3(1.1,.8,1.1); d+=max(0.,.13-length(sin(p*4.)));',
'p+=.17*cos(p.zxy*4.-t); d-=.10; color=mix(color,vec3(.96,.36,.62),.27);',
'p=mix(p,abs(p)-.25,.7); d+=.09*sin(p.x*15.)*sin(p.y*15.); color=mix(color,vec3(.22,.72,.96),.30);',
'd+=max(0.,.12-abs(sin(p.x*6.+p.y*3.+sin(p.z*5.))));',
'p+=.12*sin(p.zxy*5.+t); color=mix(color,vec3(.65,.35,.95),.26);',
'p*=1.16; d-=.09; rough*=.6; color*=.97;',
'p+=.2*sin(p.yzx*4.+t); d-=.13*exp(-3.*length(p-vec3(.65,.1,0.)));',
'p.z+=.35*sin(p.x*3.)*cos(p.y*3.); d+=max(0.,.42-length(p+vec3(.1,.25,.7)));',
'color=mix(color,vec3(.72,.81,.95)+.16*cos(vec3(0.,2.,4.)+length(p)*7.+t),.32); rough*=.4;',
'p.xz=rot(1.1*sin(p.y*2.+t))*p.xz; p.yz=rot(.5*sin(p.x*3.-t))*p.yz;'
];
const vert='varying vec2 uvp;void main(){uvp=uv;gl_Position=vec4(position.xy,0.,1.);}';
function shader(seq,seed){
 const ordered=[...seq].reverse().map((i,j)=>'{float t=phase+'+(j*.71).toFixed(3)+';'+operations[i]+'}').join('\n');
 const palette=[
[.16,.72,.89],[.36,.38,.86],[.64,.75,.98],[.96,.38,.65],[.19,.57,.98],[.77,.44,.91],
[.80,.29,.76],[.34,.23,.71],[.22,.79,.64],[.25,.37,.87],[.82,.88,.99],[.54,.29,.93]
][seq[0]??0];
 const first=seq[0]??0,base=[
 'length(vec2(length(p.xz)-.77,p.y))-.36',
 'length(p)-1.+.15*sin(p.x*7.)*sin(p.y*7.)*sin(p.z*7.)',
 'max(length(p)-1.15,.20-length(sin(p*4.)))',
 'length(p)-.94+.17*sin(p.x*5.+phase)*cos(p.y*5.)',
 '(abs(p.x)+abs(p.y)+abs(p.z)-1.5)*.577',
 'max(length(p)-1.1,.045-abs(sin(p.x*5.+p.y*4.)))',
 'length(p)-1.+.15*sin(p.x*8.+p.y*5.)',
 'length(p)-1.05+.19*cos(p.y*9.)*sin(p.x*4.)',
 'min(length(p-vec3(.42,0.,0.))-.73,length(p+vec3(.42,0.,0.))-.73)',
 'max(length(p)-1.05,.67-length(p+vec3(0.,0.,.7)))',
 'abs(length(p)-.98)-.065',
 'length(vec2(length(p.xz)-.78,p.y+.26*sin(atan(p.z,p.x)*3.+phase)))-.3'
 ][first];
 return `varying vec2 uvp;uniform float phase;uniform float presence;
 mat2 rot(float a){return mat2(cos(a),-sin(a),sin(a),cos(a));}
 vec4 field(vec3 p){float d=0.;float rough=.32;vec3 color=vec3(${palette.map(v=>v.toFixed(3)).join(",")});
 p.xz=rot(${seed.toFixed(4)})*p.xz;
 ${ordered}
 float shape=${base};d=shape+clamp(d,-.45,.45);
 return vec4(color,d);}
 float sdf(vec3 p){return field(p).w;}
 void main(){
 vec2 uv=(uvp-.5)*2.;vec3 bg=vec3(1.);
 if(presence<.5){gl_FragColor=vec4(bg,1.);return;}
 vec3 ro=vec3(.25*sin(phase),.16*cos(phase),4.5);
 vec3 rd=normalize(vec3(uv*1.03,-2.4));
 float travel=2.0;bool hit=false;vec3 p;
 for(int i=0;i<108;i++){p=ro+rd*travel;float d=sdf(p);if(d<.003){hit=true;break;}travel+=clamp(d*.22,.003,.14);if(travel>7.)break;}
 if(!hit){gl_FragColor=vec4(bg,1.);return;}
 vec2 e=vec2(.004,0.);vec3 n=normalize(vec3(sdf(p+e.xyy)-sdf(p-e.xyy),sdf(p+e.yxy)-sdf(p-e.yxy),sdf(p+e.yyx)-sdf(p-e.yyx))+vec3(.00001));
 vec3 l=normalize(vec3(-.5,.8,1.));float diffuse=.57+.43*max(0.,dot(n,l));
 float spec=pow(max(0.,dot(n,normalize(l-rd))),48.);
 float rim=pow(1.-max(0.,dot(n,-rd)),2.);
 vec3 c=field(p).rgb;
 float layers=.5+.5*sin(p.x*4.+p.y*3.+sin(p.z*5.)*.8+phase);
 float grain=.5+.5*sin(p.x*39.+sin(p.y*31.)*sin(p.z*27.));
 c=mix(c,vec3(.94,.97,1.),layers*.16);
 c*=.98+grain*.02;
 float occlusion=clamp(sdf(p+n*.075)/.075,.35,1.);
 c=c*mix(.78,1.,diffuse)*mix(.87,1.,occlusion)+spec*.26+rim*.10;
 c=mix(c,vec3(.96,.97,.98),rim*.16);
 gl_FragColor=vec4(pow(clamp(c,0.,1.),vec3(.82)),1.);
 }`;
}
export function createSynth(canvas){
 const renderer=new THREE.WebGLRenderer({canvas,antialias:false,preserveDrawingBuffer:true});
 renderer.setPixelRatio(1);renderer.setSize(512,512,false);
 const scene=new THREE.Scene(),camera=new THREE.Camera(),geo=new THREE.PlaneGeometry(2,2);
 const uniforms={phase:{value:0},presence:{value:0}};
 let seq=[],seed=0,material;
 const mesh=new THREE.Mesh(geo,new THREE.ShaderMaterial({vertexShader:vert,fragmentShader:shader([],0),uniforms}));scene.add(mesh);
 function rebuild(){const next=new THREE.ShaderMaterial({vertexShader:vert,fragmentShader:shader(seq,seed),uniforms});mesh.material.dispose();mesh.material=next;uniforms.presence.value=seq.length?1:0;}
 function reset(){seq=[];seed=Math.random()*6.28;rebuild();return []}
 function toggle(i){if(seq.length>=MAX)return false;seq.push(i);rebuild();return true}
 return {render(seconds){uniforms.phase.value=(seconds%12)*Math.PI/6;renderer.render(scene,camera)},reset,toggle,boost:toggle,clear:reset,pop(){seq.pop();rebuild();return [...seq]},getSequence(){return [...seq]},dispose(){mesh.material.dispose();geo.dispose();renderer.dispose()}};
}
