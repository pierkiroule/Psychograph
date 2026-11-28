// Independent, seeded painterly generators. All coordinates use a 1000-unit square.
const TAU=Math.PI*2;
function rng(seed){let x=seed>>>0;return()=>{x=(Math.imul(x,1664525)+1013904223)>>>0;return x/4294967296}}
const palettes=[['#f3eee2','#192e38','#557b80','#b78d66','#c8c4ad'],['#eae7db','#382e39','#a34d4e','#d58b55','#766b83'],['#edf0e9','#233e32','#749b83','#beaf78','#92afb0'],['#f3ece3','#2d2943','#6d6894','#aeb8ce','#b96d71'],['#e7ded1','#342820','#8b5941','#bcaa87','#537478'],['#e9edf0','#102c4c','#447d9a','#91c8cb','#d9aa72']];
function wash(c,x,y,rx,ry,col,alpha){c.save();c.translate(x,y);c.scale(rx,ry);let g=c.createRadialGradient(0,0,0,0,0,1);g.addColorStop(0,col);g.addColorStop(.55,col);g.addColorStop(1,'transparent');c.globalAlpha=alpha;c.fillStyle=g;c.fillRect(-1,-1,2,2);c.restore()}
function line(c,points,col,w,a=1){c.beginPath();c.moveTo(...points[0]);for(let i=1;i<points.length;i++)c.lineTo(...points[i]);c.strokeStyle=col;c.lineWidth=w;c.globalAlpha=a;c.stroke();c.globalAlpha=1}
function shape(c,pts,col,a){c.beginPath();c.moveTo(...pts[0]);for(let i=1;i<pts.length;i++){let p=pts[i],q=pts[(i+1)%pts.length];c.quadraticCurveTo(p[0],p[1],(p[0]+q[0])/2,(p[1]+q[1])/2)}c.closePath();c.fillStyle=col;c.globalAlpha=a;c.fill();c.globalAlpha=1}
function blob(c,r,x,y,rx,ry,col,a){let pts=[];for(let i=0;i<48;i++){let t=i/48*TAU,k=.82+.12*Math.sin(t*3+r()*1.2)+.12*r();pts.push([x+Math.cos(t)*rx*k,y+Math.sin(t)*ry*k])}shape(c,pts,col,a)}
const pick=(r,p)=>p[1+Math.floor(r()*4)];
// 0: interference ribbons, open sweeping curves
function waves(c,r,p){for(let i=0;i<45;i++){let pts=[],y=180+i*14,ph=r()*2;for(let x=-80;x<=1080;x+=10)pts.push([x,y+85*Math.sin(x*.005+ph+i*.06)+42*Math.sin(x*.013-i*.12)]);line(c,pts,p[1+i%4],2+r()*11,.12+r()*.22)}}
// 1: hot plumes, stratified ascending pigment
function heat(c,r,p){for(let i=0;i<130;i++){let t=r(),x=500+Math.sin(t*7)*145+(r()-.5)*350*t,y=900-t*780;wash(c,x,y,40+r()*150,65+r()*210,p[2+i%2],.05+r()*.16)}for(let i=0;i<9;i++)blob(c,r,200+r()*600,500+r()*350,80+r()*140,120+r()*240,p[1],.09)}
// 2: translucent silk filaments
function wind(c,r,p){for(let i=0;i<230;i++){let pts=[],y=250+r()*500,phase=r()*TAU;for(let x=-100;x<1100;x+=12)pts.push([x,y+110*Math.sin(x*.004+phase)+55*Math.sin(x*.009+phase*2)]);line(c,pts,p[1+i%4],.4+r()*3,.08+r()*.17)}}
// 3: layered silhouettes and terrain
function relief(c,r,p){for(let i=0;i<9;i++){let base=280+i*73,pts=[[0,1000],[0,base]],phase=r()*6;for(let x=0;x<=1000;x+=8)pts.push([x,base+95*Math.sin(x*.006+phase)+35*Math.sin(x*.019+phase)+15*Math.sin(x*.051)]);pts.push([1000,1000]);c.beginPath();pts.forEach(([x,y],j)=>j?c.lineTo(x,y):c.moveTo(x,y));c.closePath();c.fillStyle=p[1+i%4];c.globalAlpha=.35+i*.065;c.fill();c.globalAlpha=1}}
// 4: wet ink washes with pooled edges
function ink(c,r,p){for(let j=0;j<9;j++){let x=170+r()*660,y=150+r()*700,rx=70+r()*260,ry=55+r()*210,col=pick(r,p);for(let i=0;i<19;i++)blob(c,r,x+(r()-.5)*45,y+(r()-.5)*45,rx*(.7+r()*.4),ry*(.7+r()*.4),col,.035+r()*.055);wash(c,x,y,rx*.6,ry*.6,p[1],.24)}}
// 5: branching growth with tapered organic strokes
function growth(c,r,p){function branch(x,y,a,l,w,depth){let pts=[[x,y]];for(let j=0;j<9;j++){a+=(r()-.5)*.25;x+=Math.cos(a)*l/9;y+=Math.sin(a)*l/9;pts.push([x,y])}line(c,pts,depth>3?p[1]:p[2],w,.68);if(depth>0){branch(x,y,a-.22-r()*.55,l*(.59+r()*.15),w*.67,depth-1);branch(x,y,a+.22+r()*.55,l*(.57+r()*.17),w*.63,depth-1)}else wash(c,x,y,8+r()*30,6+r()*20,p[3],.27)}for(let i=0;i<4;i++)branch(250+r()*500,850+r()*100,-Math.PI/2+(r()-.5),140+r()*140,9+r()*9,6)}
// 6: photographic shadows, dark field
function darkness(c,r,p){c.fillStyle=p[1];c.fillRect(0,0,1000,1000);for(let i=0;i<20;i++){let x=r()*1000,y=r()*1000;wash(c,x,y,80+r()*350,60+r()*290,p[2+i%3],.07+r()*.19)}for(let i=0;i<7;i++)blob(c,r,100+r()*800,100+r()*800,90+r()*230,60+r()*250,p[1],.31)}
// 7: light refraction, broad optical caustics
function light(c,r,p){for(let i=0;i<34;i++){let x=r()*1000,y=r()*1000;wash(c,x,y,35+r()*280,35+r()*280,i%3===0?'#fff9df':p[2+i%3],.16+r()*.18)}for(let i=0;i<16;i++){let a=r()*TAU,x=500+Math.cos(a)*r()*300,y=500+Math.sin(a)*r()*300;line(c,[[x-380*Math.cos(a),y-380*Math.sin(a)],[x+380*Math.cos(a),y+380*Math.sin(a)]],'#fff9e8',1+r()*8,.12)}}
// 8: orbital structures with irregular arcs
function gravity(c,r,p){let x=300+r()*400,y=300+r()*400;for(let i=0;i<52;i++){let a=r()*TAU,span=.4+r()*4,rx=40+i*9,ry=rx*(.35+r()*.5),pts=[];for(let t=0;t<span;t+=.025)pts.push([x+rx*Math.cos(t+a),y+ry*Math.sin(t+a)]);line(c,pts,p[1+i%4],.5+r()*7,.15+r()*.28)}wash(c,x,y,150,130,p[1],.4)}
// 9: spacious fog with ambiguous silhouettes
function mist(c,r,p){for(let i=0;i<12;i++)blob(c,r,100+r()*800,360+r()*500,70+r()*180,90+r()*260,p[1+i%3],.09);for(let i=0;i<45;i++)wash(c,r()*1000,r()*1000,160+r()*310,55+r()*190,i%2?p[0]:p[4],.12+r()*.15)}
// 10: faceted translucent mineral plates
function crystal(c,r,p){for(let i=0;i<85;i++){let x=150+r()*700,y=150+r()*700,a=r()*TAU,rad=25+r()*155,n=3+Math.floor(r()*4),pts=[];for(let j=0;j<n;j++){let t=a+j/n*TAU;pts.push([x+Math.cos(t)*rad*(.6+r()*.4),y+Math.sin(t)*rad])}c.beginPath();pts.forEach(([x,y],j)=>j?c.lineTo(x,y):c.moveTo(x,y));c.closePath();let g=c.createLinearGradient(x-rad,y-rad,x+rad,y+rad);g.addColorStop(0,p[0]);g.addColorStop(1,pick(r,p));c.fillStyle=g;c.globalAlpha=.16+r()*.33;c.fill();c.strokeStyle=p[1];c.lineWidth=.7;c.stroke();c.globalAlpha=1}}
// 11: chemigram, scratched plates and grain
function trace(c,r,p){for(let i=0;i<32;i++){let x=r()*1000,y=r()*1000;blob(c,r,x,y,30+r()*240,20+r()*150,pick(r,p),.08+r()*.22)}for(let i=0;i<180;i++){let x=r()*1000,y=r()*1000,pts=[[x,y]];for(let j=0;j<12;j++){x+=(r()-.48)*27;y+=(r()-.4)*26;pts.push([x,y])}line(c,pts,i%3?p[1]:p[0],.4+r()*2,.12+r()*.24)}}
export const generators=[waves,heat,wind,relief,ink,growth,darkness,light,gravity,mist,crystal,trace];
export function makeArt(seed,ids,size=960){const r=rng(Math.floor(seed*100000)),cv=document.createElement('canvas');cv.width=cv.height=size;const c=cv.getContext('2d');c.scale(size/1000,size/1000);c.lineCap='round';c.lineJoin='round';let p=palettes[Math.floor(r()*palettes.length)],m=ids.length?[...ids]:[Math.floor(r()*12)];c.fillStyle=p[0];c.fillRect(0,0,1000,1000);let layer=document.createElement('canvas');layer.width=layer.height=size;let ctx=layer.getContext('2d');m.forEach((id,i)=>{ctx.setTransform(size/1000,0,0,size/1000,0,0);ctx.clearRect(0,0,1000,1000);ctx.save();ctx.translate(500,500);if(id!==3&&id!==5)ctx.rotate((r()-.5)*.8);ctx.translate(-500,-500);generators[id]?.(ctx,r,p);ctx.restore();c.save();c.setTransform(1,0,0,1,0,0);c.globalAlpha=i===0?1:Math.max(.32,.76/m.length+.22);c.globalCompositeOperation=i===0?'source-over':id===7?'screen':'source-over';c.drawImage(layer,0,0);c.restore()});c.setTransform(1,0,0,1,0,0);let img=c.getImageData(0,0,size,size),d=img.data;for(let i=0;i<d.length;i+=4){let n=(r()-.5)*9;d[i]+=n;d[i+1]+=n;d[i+2]+=n}c.putImageData(img,0,0);return cv}
