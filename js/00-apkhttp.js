'use strict';
// 4.3.88: in the APK the WebView origin (appassets.androidplatform.net) is not allowed by the API CORS list, so every call to
// *.gasparelb97.workers.dev (classifica, gilda, report, debug, device id) goes through the native bridge instead of fetch.
(function(){const N=window.ZSNative;if(!N||typeof N.http!=='function'||!window.fetch)return;const of=window.fetch.bind(window);const P=new Map();let seq=0;
  window.__zsHttp=function(id,code,text){const p=P.get(id);if(!p)return;P.delete(id);clearTimeout(p.to);if(!code){p.rej(new TypeError('Network request failed'));return;}
    try{p.res(new Response(text,{status:code,headers:{'content-type':'application/json'}}));}catch(e){p.rej(e);}};
  window.fetch=function(input,init){try{const url=typeof input==='string'?input:(input&&input.url)||'';
      if(!/^https:\/\/[a-z0-9-]+\.gasparelb97\.workers\.dev\//.test(url))return of(input,init);
      init=init||{};const m=String(init.method||'GET').toUpperCase();let ct='';const h=init.headers||{};try{ct=(h instanceof Headers?h.get('content-type'):(h['Content-Type']||h['content-type']))||'';}catch(e){}
      const body=typeof init.body==='string'?init.body:'';const id='h'+(++seq);
      return new Promise((res,rej)=>{const to=setTimeout(()=>{if(P.delete(id))rej(new TypeError('timeout'));},15000);P.set(id,{res,rej,to});
        try{if(init.signal){if(init.signal.aborted){P.delete(id);clearTimeout(to);rej(new DOMException('Aborted','AbortError'));return;}init.signal.addEventListener('abort',()=>{if(P.delete(id)){clearTimeout(to);rej(new DOMException('Aborted','AbortError'));}});}}catch(e){}
        let ok=false;try{ok=N.http(id,m,url,String(ct),body);}catch(e){}if(!ok){P.delete(id);clearTimeout(to);of(input,init).then(res,rej);}});}catch(e){return of(input,init);}};})();
