// Local structural descriptors and soft correspondence field, with bounded displacements.
const N=64, L=(p,i)=>.2126*p[i*4]+.7152*p[i*4+1]+.0722*p[i*4+2];
export function landmarks(p){
 const out=[];
 for(let y=5;y<59;y+=3)for(let x=5;x<59;x+=3){
 const i=y*N+x,gx=L(p,i+1)-L(p,i-1),gy=L(p,i+N)-L(p,i-N);
 const strength=Math.hypot(gx,gy);if(strength<15)continue;
 const desc=[];let mean=0;
 for(let v=-2;v<=2;v++)for(let u=-2;u<=2;u++){const z=L(p,i+v*N+u);desc.push(z);mean+=z/25}
 const norm=Math.sqrt(desc.reduce((s,z)=>s+(z-mean)**2,0))||1;
 out.push({x:x/63,y:1-y/63,strength,desc:desc.map(z=>(z-mean)/norm)});
 }
 out.sort((a,b)=>b.strength-a.strength);const selected=[];
 for(const p of out){if(selected.every(q=>Math.hypot(p.x-q.x,p.y-q.y)>.085))selected.push(p);if(selected.length===36)break}
 return selected;
}
export function match(a,b){const cost=(p,q)=>p.desc.reduce((s,x,i)=>s+(x-q.desc[i])**2,0)+2*((p.x-q.x)**2+(p.y-q.y)**2);
 const pairs=[];for(const p of a){const ranked=b.map(q=>({q,c:cost(p,q)})).sort((x,y)=>x.c-y.c);if(!ranked.length)continue;const {q,c}=ranked[0];if(c>.85||ranked[1]&&c>ranked[1].c*.84||Math.hypot(p.x-q.x,p.y-q.y)>.38)continue;if(a.some(o=>o!==p&&cost(o,q)<c))continue;pairs.push({p,q,c})}return pairs.sort((a,b)=>a.c-b.c).slice(0,12)}
