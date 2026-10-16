'use strict';
// ======================= v4.3.84 firearm detail pass (batch 1: pistol, revolver, smg, ar) — extra static parts on the same base, anchors untouched =======================
(function(){if(typeof HIB43==='undefined')return;const W0=()=>wmat43();
const wrap=(k,f)=>{const o=HIB43[k];if(typeof o!=='function')return;HIB43[k]=function(){const r=o.apply(this,arguments);try{f(r.g,W0(),r);}catch(e){console.warn('guns484',k,e);}return r;};};
const B=(g,w,h,d,m,x,y,z,rx,ry,rz,b)=>M43(g,rboxG(w,h,d,b),m,x,y,z,rx,ry,rz);
const C=(g,r,l,m,x,y,z,rx,ry,rz,s)=>M43(g,cylG(r,l,s||12),m,x,y,z,rx,ry,rz);
wrap('pistol',(g,W,r)=>{const sl=r.ud.slide||g;
  for(let i=0;i<5;i++)B(sl,.0352,.022,.0022,W.park,0,.06,-.145-i*.0062,0,0,0,.0007);           // front serrations
  B(sl,.016,.004,.03,W.steel,0,.0795,-.03,0,0,0,.001);                                           // barrel hood in port
  B(sl,.0352,.0012,.2,W.park,0,.0535,-.075,0,0,0,.0004);                                         // slide/frame parting line
  B(g,.003,.006,.03,W.steel,-.0185,.034,-.06,0,0,0,.001);B(g,.003,.009,.008,W.steel,-.0185,.03,-.045,0,0,0,.001); // slide stop
  B(g,.004,.008,.008,W.steel,-.017,.03,-.12,0,0,0,.0015);                                        // takedown
  C(g,.0028,.036,W.steel,0,.026,-.06,0,0,Math.PI/2,8);                                           // pins
  for(let i=0;i<6;i++)B(g,.036,.003,.004,W.rubber,0,-.03-i*.011,.03+i*.0016,.25,0,0,.001);       // front strap grooves
  B(g,.012,.01,.014,W.gun,0,.07,.046,-.5,0,0,.002);});                                            // hammer spur
wrap('revolver',(g,W)=>{
  C(g,.0045,.15,W.chrome,0,.048,-.17,0,0,0,10);                                                   // ejector rod
  B(g,.004,.014,.02,W.blued,0,.093,-.272,0,0,0,.001);                                             // front blade
  for(let i=0;i<8;i++)B(g,.0165,.0015,.008,W.park,0,.0865,-.1-i*.022,0,0,0,.0004);                // vent rib slots
  B(g,.006,.012,.012,W.steel,-.019,.055,.005,0,0,0,.002);                                         // cylinder latch
  C(g,.006,.004,W.brass,-.021,-.04,.04,0,Math.PI/2,0,14);C(g,.006,.004,W.brass,.021,-.04,.04,0,Math.PI/2,0,14); // grip medallions
  C(g,.003,.041,W.chrome,0,-.06,.05,0,0,Math.PI/2,8);                                             // grip screw
  B(g,.006,.014,.004,W.blued,0,.1,.04,-.4,0,0,.001);});                                           // rear sight notch
wrap('smg',(g,W,r)=>{
  C(g,.007,.018,W.steel,-.036,.05,-.08,0,0,Math.PI/2,10);B(g,.004,.006,.06,W.park,-.03,.05,-.06,0,0,0,.001); // charging handle + slot
  B(g,.004,.012,.012,W.steel,.03,.02,.06,0,0,0,.002);                                             // selector
  B(g,.026,.02,.01,W.park,0,.09,.07,0,0,0,.003);C(g,.004,.012,W.hole,0,.092,.07,0,0,0,8);            // rear diopter
  B(g,.012,.016,.008,W.steel,.03,.03,.17,0,0,0,.002);});                                          // sling loop
wrap('ar',(g,W)=>{
  C(g,.008,.014,W.park,.032,.07,.02,0,0,Math.PI/2,12);                                            // forward assist
  B(g,.003,.024,.05,W.park,.0285,.062,-.02,0,0,0,.001);                                           // dust cover
  B(g,.04,.008,.03,W.park,0,.09,.11,0,0,0,.002);                                                  // charging handle
  B(g,.008,.012,.012,W.tan,.03,.07,.08,0,0,0,.003);                                               // brass deflector
  B(g,.024,.022,.03,W.park,0,.075,-.43,0,0,0,.003);C(g,.004,.03,W.steel,0,.06,-.43,0,0,0,8); // gas block
  C(g,.017,.004,W.park,0,.05,.115,0,0,0,16);C(g,.017,.004,W.park,0,.05,.16,0,0,0,16);              // buffer rings
  B(g,.01,.012,.008,W.steel,0,.026,-.36,0,0,0,.002);                                               // sling swivel
  for(let i=0;i<6;i++)B(g,.037,.006,.003,W.rubber,0,-.03-i*.012,.077+i*.003,.2,0,0,.001);});      // grip texture
// rebuild those viewmodels if they were built before this file
try{const hi=typeof GFX43==='undefined'||GFX43.q!=='bassa';for(const k of ['pistol','revolver','smg','ar']){const vm=VM[k],H=vm&&vm.userData.hi43,L=vm&&vm.userData.lo43;if(!H||!L)continue;
  try{vm.remove(H.g);for(const ch of L.children)ch.visible=true;for(const u of UDK43)delete vm.userData[u];Object.assign(vm.userData,L.ud);vm.userData.base=L.base;vm.userData.rot=L.rot;delete vm.userData.hi43;delete vm.userData.lo43;vmBuild43(k);}catch(e){console.warn('guns484',k,e);}}
  vmMode43(hi);}catch(e){}
})();
