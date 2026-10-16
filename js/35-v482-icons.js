'use strict';
// ======================= v4.3.82 icons in text: RES[k].i is an <img class="resI481"> (drawn icon). Text-only sinks (toast, float text, harvest bar, loot popups)
// used textContent -> raw '<img ...>' code appeared. Render those strings as safe HTML (only our data: icon images survive, everything else escaped).
(function(){
const RX=/<img class="resI481"[^>]*src="(data:image\/[a-z]+;base64,[A-Za-z0-9+/=]+)"[^>]*>/g;
const esc=s=>s.replace(/[&<>"]/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;'}[c]));
function safeHTML(v){let out='',last=0,m;RX.lastIndex=0;while((m=RX.exec(v))){out+=esc(v.slice(last,m.index))+'<img class="resI481" alt="" src="'+m[1]+'">';last=RX.lastIndex;}return out+esc(v.slice(last));}
window.icoHTML482=safeHTML;
try{const D=Object.getOwnPropertyDescriptor(Node.prototype,'textContent');Object.defineProperty(Node.prototype,'textContent',{configurable:true,enumerable:D.enumerable,get(){return D.get.call(this);},
  set(v){if(typeof v==='string'&&this.nodeType===1&&v.indexOf('<img class="resI481"')>=0){try{this.innerHTML=safeHTML(v);return;}catch(e){}}D.set.call(this,v);}});}catch(e){console.warn('ico482',e);}
// canvas text (3D floating labels): drop the tags, keep the words
try{const P=CanvasRenderingContext2D.prototype;for(const k of ['fillText','strokeText','measureText']){const f=P[k];P[k]=function(t){if(typeof t==='string'&&t.indexOf('<img')>=0){arguments[0]=t.replace(/<img[^>]*>/g,'').replace(/\s{2,}/g,' ').trim();}return f.apply(this,arguments);};}}catch(e){}
// emoji that Android fonts may lack -> drawn icons for resource-like keys; safe fallback for any RES entry without icon
try{for(const k of Object.keys(RES)){const r=RES[k];if(!r)continue;if(typeof r.i!=='string'||!r.i||(r.i.indexOf('<img')<0&&/[\u{1F000}-\u{1FFFF}\u26AB]/u.test(r.i))){const u=typeof cIcon482==='function'?cIcon482(k):'';if(u)r.i='<img class="resI481" alt="" src="'+u+'">';else r.i='●';}}}catch(e){}
// coal icon was black on dark UI (looked blank before 'Carbone')
try{if(RES.coal){const c=document.createElement('canvas');c.width=c.height=64;const g=c.getContext('2d');const lump=(x,y,r,a)=>{g.fillStyle='#3b3f46';g.beginPath();for(let i=0;i<7;i++){const t=i/7*6.283+a,rr=r*(.8+.2*Math.sin(i*2.3));g.lineTo(x+Math.cos(t)*rr,y+Math.sin(t)*rr);}g.closePath();g.fill();g.strokeStyle='#8a929e';g.lineWidth=2;g.stroke();g.fillStyle='rgba(200,210,225,.55)';g.beginPath();g.arc(x-r*.35,y-r*.35,r*.25,0,7);g.fill();};
  lump(24,38,14,.3);lump(42,34,12,1.1);lump(33,22,10,2);RES.coal.i='<img class="resI481" alt="" src="'+c.toDataURL()+'">';}}catch(e){}
const st=document.createElement('style');st.textContent='img.resI481{width:1.15em;height:1.15em;vertical-align:-.2em;object-fit:contain;display:inline-block}';document.head.appendChild(st);
})();
