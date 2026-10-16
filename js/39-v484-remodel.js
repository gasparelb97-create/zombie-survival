'use strict';
// ======================= v4.3.84 remodel: proper knife and tool heads, readable metal finishes (same anchors/userData) =======================
(function(){if(typeof HIB43==='undefined'||typeof vmBuild43!=='function')return;
try{const W=wmat43(),c=(k,h)=>{if(W[k]){W[k].color.setHex(h);W[k].needsUpdate=true;}};c('gun',0x4c5058);c('park',0x3a3e45);c('blued',0x384058);c('poly',0x2e3034);}catch(e){}
function knife(){const W=wmat43(),g=new T.Group();
  M43(g,profG('k4Blade',[[-.07,-.014],[-.07,.017],[-.235,.017],[-.29,.011],[-.365,.001],[-.335,-.011],[-.28,-.019],[-.12,-.019]],.0065,.0022),W.blade);
  M43(g,profG('k4Edge',[[-.075,-.016],[-.28,-.0205],[-.338,-.0125],[-.37,.0005],[-.334,-.007],[-.28,-.0145],[-.075,-.011]],.003,.0007),W.edge);
  M43(g,profG('k4Clip',[[-.235,.0172],[-.29,.0115],[-.36,.002],[-.29,.008],[-.235,.0135]],.0072,.0006),W.edge);
  for(const sx of [-.0034,.0034])M43(g,rboxG(.0012,.0045,.13,.0005),W.park,sx,.006,-.155);
  M43(g,rboxG(.024,.064,.011,.003),W.steel,0,.0,-.064);for(const sy of [-.032,.032])M43(g,cylG(.0065,.011,12),W.steel,0,sy,-.064);
  M43(g,latheG('k4Handle',[[0,-.058],[.016,-.058],[.019,-.045],[.0165,-.032],[.0195,-.019],[.0165,-.006],[.0195,.008],[.017,.022],[.0205,.04],[.018,.05],[0,.05]],14),W.leather,0,0,0);
  M43(g,latheG('k4Pom',[[0,-.006],[.019,-.006],[.022,.002],[.018,.014],[.008,.02],[0,.02]],14),W.steel,0,0,.05);
  rHand43(g,0,-.01,.0,0);
  return {g,ud:{},base:[.26,-.24,-.42],rot:[.15,-.35,.5]};}
function tool(kind){const W=wmat43(),g=new T.Group();
  M43(g,latheG('t4Handle',[[0,-.31],[.0165,-.31],[.018,-.27],[.0155,.1],[.0135,.27],[.0145,.31],[0,.31]],14),W.wood,0,.08,0,-Math.PI/2,0,0);
  M43(g,latheG('t4Wrap',[[0,-.09],[.0195,-.09],[.02,.09],[0,.09]],14),W.leather,0,-.13,0,-Math.PI/2,0,0);
  for(let i=0;i<5;i++)M43(g,new T.TorusGeometry(.02,.0022,5,14),W.cord,0,-.2+i*.035,0,Math.PI/2,0,0);
  const heads=[],edges=[];
  if(kind==='axe'){heads.push(M43(g,profG('ax4Head',[[.035,-.03],[.035,.03],[.0,.028],[-.045,.038],[-.08,.07],[-.1,.068],[-.1,-.066],[-.075,-.088],[-.05,-.045],[.0,-.028]],.03,.006),W.tier[0],0,.34,0));
    heads.push(M43(g,rboxG(.034,.058,.022,.006),W.tier[0],0,.34,.04));
    edges.push(M43(g,profG('ax4Edge',[[-.096,-.068],[-.096,.068],[-.084,.074],[-.112,.072],[-.114,0],[-.11,-.07],[-.08,-.092]],.012,.002),W.tierEdge[0],0,.34,0));}
  else if(kind==='pick'){heads.push(M43(g,profG('pk4Head',[[.2,-.022],[.14,.012],[.07,.03],[0,.036],[-.07,.03],[-.14,.012],[-.2,-.022],[-.14,-.002],[-.07,.012],[0,.016],[.07,.012],[.14,-.002]],.026,.006),W.tier[0],0,.35,0,0,Math.PI/2,0));
    heads.push(M43(g,rboxG(.046,.062,.046,.01),W.tier[0],0,.35,0));
    for(const sx of [1,-1])edges.push(M43(g,latheG('pk4Tip',[[0,-.022],[.009,-.006],[.006,.01],[0,.02]],8),W.tierEdge[0],sx*.205,.326,0,0,sx*Math.PI/2,sx*-.5));}
  else{heads.push(M43(g,rboxG(.05,.064,.05,.01),W.tier[0],0,.36,0));heads.push(M43(g,cylG(.031,.1,18),W.tier[0],.05,.36,0,0,Math.PI/2,0));
    edges.push(M43(g,cylG(.035,.014,18),W.tierEdge[0],.103,.36,0,0,Math.PI/2,0));
    for(const sz of [-.0105,.0105])heads.push(M43(g,profG('hm4Claw',[[0,-.022],[0,.022],[.04,.026],[.08,.014],[.115,-.024],[.078,-.006],[.04,-.01]],.016,.004),W.tier[0],-.025,.36,sz,0,-Math.PI/2,0));}
  M43(g,rboxG(.06,.09,.07,.014),gloveM,0,-.12,0);for(let i=0;i<4;i++)M43(g,rboxG(.022,.018,.07,.006),gloveM,-.035,-.155+i*.022,0);
  M43(g,latheG('tSleeve',[[0,.17],[.055,.17],[.06,.12],[.058,-.14],[.046,-.16],[0,-.16]],12),sleeveM,.02,-.2,.12,.9,0,0);
  return {g,ud:{heads,edges},base:[.26,-.3,-.5],rot:[.2,-.4,.55],scale:.85};}
HIB43.knife=knife;HIB43.axe=()=>tool('axe');HIB43.pick=()=>tool('pick');HIB43.hammer=()=>tool('hammer');
try{const hi=typeof GFX43==='undefined'||GFX43.q!=='bassa';for(const k of ['knife','axe','pick','hammer']){const vm=VM[k],H=vm&&vm.userData.hi43,L=vm&&vm.userData.lo43;if(!H||!L)continue;
  try{vm.remove(H.g);for(const ch of L.children)ch.visible=true;for(const u of UDK43)delete vm.userData[u];Object.assign(vm.userData,L.ud);vm.userData.base=L.base;vm.userData.rot=L.rot;delete vm.userData.hi43;delete vm.userData.lo43;vmBuild43(k);}catch(e){console.warn('remodel484',k,e);}}
  vmMode43(hi);}catch(e){console.warn('remodel484',e);}
})();
