// Original procedural soundscape. Binaural carriers remain separate and dry.
export class Soundscape{
 constructor(){this.ctx=null;this.closed=false;this.nodes=[]}
 async start(preset,volume=.35){
 const AC=window.AudioContext||window.webkitAudioContext;if(!AC)throw Error('Audio non disponible');
 const c=this.ctx=new AC();await c.resume();if(this.closed)return;
 const t=c.currentTime;this.master=c.createGain();this.master.gain.value=0;this.master.connect(c.destination);
 this.envelope=c.createGain();this.envelope.gain.setValueAtTime(0,t);this.envelope.gain.linearRampToValueAtTime(1,t+4);this.envelope.gain.setValueAtTime(1,t+49);this.envelope.gain.linearRampToValueAtTime(0,t+60);this.envelope.connect(this.master);this.volume(volume);
 const base=[160,174,150,136,196,165][preset]||160;
 const merge=c.createChannelMerger(2);const binaural=c.createGain();binaural.gain.value=.055;merge.connect(binaural);binaural.connect(this.envelope);
 for(let i=0;i<2;i++){const o=c.createOscillator();o.type='sine';o.frequency.setValueAtTime(base+(i?10:0),t);o.frequency.linearRampToValueAtTime(base+(i?6:0),t+40);o.frequency.linearRampToValueAtTime(base+(i?9:0),t+60);o.connect(merge,0,i);o.start(t);o.stop(t+60);this.nodes.push(o)}
 const bed=c.createGain();bed.gain.value=.20;bed.connect(this.envelope);
 const breath=c.createGain();breath.gain.value=.74;breath.connect(bed);const lfo=c.createOscillator(),depth=c.createGain();lfo.frequency.value=.115;depth.gain.value=.18;lfo.connect(depth);depth.connect(breath.gain);lfo.start(t);lfo.stop(t+60);this.nodes.push(lfo);
 for(const [i,k] of [1,1.5,2,2.5].entries()){const o=c.createOscillator(),g=c.createGain(),pan=c.createStereoPanner();o.type='sine';o.frequency.value=base*.5*k;g.gain.value=[.20,.09,.04,.018][i];pan.pan.value=[0,-.4,.4,0][i];o.connect(g);g.connect(pan);pan.connect(breath);o.start(t);o.stop(t+60);this.nodes.push(o)}
 const n=c.createBuffer(2,c.sampleRate*8,c.sampleRate);for(let ch=0;ch<2;ch++){const a=n.getChannelData(ch);let b0=0,b1=0,b2=0;for(let i=0;i<a.length;i++){let w=Math.random()*2-1;b0=.99765*b0+w*.099046;b1=.963*b1+w*.2965164;b2=.57*b2+w*1.0526913;a[i]=(b0+b1+b2+w*.1848)*.05}for(let i=0;i<1024;i++){const f=i/1024;a[i]*=f;a[a.length-1-i]*=f}}
 const src=c.createBufferSource();src.buffer=n;src.loop=true;const lp=c.createBiquadFilter();lp.type='lowpass';lp.frequency.value=[550,850,420,320,1000,650][preset];const ng=c.createGain();ng.gain.value=.24;src.connect(lp);lp.connect(ng);ng.connect(breath);src.start(t);src.stop(t+60);this.nodes.push(src);
 // Diffuse reverb on the ambient bed only.
 const rev=c.createConvolver(),ir=c.createBuffer(2,c.sampleRate*2,c.sampleRate);for(let ch=0;ch<2;ch++){let a=ir.getChannelData(ch);for(let i=0;i<a.length;i++)a[i]=(Math.random()*2-1)*Math.pow(1-i/a.length,3)}rev.buffer=ir;const wet=c.createGain();wet.gain.value=.12;bed.connect(rev);rev.connect(wet);wet.connect(this.envelope);
 }
 volume(v){if(this.master&&this.ctx)this.master.gain.setTargetAtTime(Math.min(.65,Math.max(0,v)),this.ctx.currentTime,.035)}
 stop(){this.closed=true;const c=this.ctx;if(!c)return;try{this.master?.gain.cancelScheduledValues(c.currentTime);this.master?.gain.setValueAtTime(0,c.currentTime);for(const n of this.nodes){try{n.stop()}catch{}}}finally{c.close().catch(()=>{});this.ctx=null}}
}
