// Dafhio Dominion - LAN server (no dependencies)
// Usage: put this file next to dafhio-dominion.html, then run:  node server.js [port]
// Everyone on the same Wi-Fi opens the printed address; one player presses Host, others Join (Server mode).
const http=require('http'),fs=require('fs'),path=require('path'),crypto=require('crypto'),os=require('os');
const PORT=+process.argv[2]||8080,DIR=__dirname,GAME='dafhio-dominion.html';
const TYPES={'.html':'text/html; charset=utf-8','.js':'application/javascript','.png':'image/png','.svg':'image/svg+xml'};
const srv=http.createServer((req,res)=>{
  let f=decodeURIComponent(req.url.split('?')[0]);if(f==='/')f='/'+GAME;
  const p=path.join(DIR,path.normalize(f));
  if(!p.startsWith(DIR)){res.writeHead(403);return res.end('Forbidden')}
  fs.readFile(p,(e,d)=>{if(e){res.writeHead(404);return res.end('Not found')}res.writeHead(200,{'Content-Type':TYPES[path.extname(p)]||'application/octet-stream','Cache-Control':'no-cache'});res.end(d)});
});
let host=null,nid=1;const clients=new Map();
srv.on('upgrade',(req,sock)=>{
  const key=req.headers['sec-websocket-key'];if(!key||String(req.headers.upgrade).toLowerCase()!=='websocket'){sock.destroy();return}
  const acc=crypto.createHash('sha1').update(key+'258EAFA5-E914-47DA-95CA-C5AB0DC85B11').digest('base64');
  sock.write('HTTP/1.1 101 Switching Protocols\r\nUpgrade: websocket\r\nConnection: Upgrade\r\nSec-WebSocket-Accept: '+acc+'\r\n\r\n');
  const c={sock,id:'c'+(nid++),buf:Buffer.alloc(0),frag:[],role:null};sock.setNoDelay(true);
  sock.on('data',d=>onData(c,d));sock.on('close',()=>onClose(c));sock.on('error',()=>{});
});
function send(c,obj){const data=Buffer.from(JSON.stringify(obj)),n=data.length;let h;
  if(n<126)h=Buffer.from([0x81,n]);else if(n<65536){h=Buffer.alloc(4);h[0]=0x81;h[1]=126;h.writeUInt16BE(n,2)}else{h=Buffer.alloc(10);h[0]=0x81;h[1]=127;h.writeBigUInt64BE(BigInt(n),2)}
  try{c.sock.write(Buffer.concat([h,data]))}catch(e){}}
function onData(c,d){c.buf=Buffer.concat([c.buf,d]);
  while(c.buf.length>=2){const b0=c.buf[0],b1=c.buf[1],fin=b0&0x80,op=b0&15,masked=b1&0x80;let len=b1&127,off=2;
    if(len===126){if(c.buf.length<4)return;len=c.buf.readUInt16BE(2);off=4}else if(len===127){if(c.buf.length<10)return;len=Number(c.buf.readBigUInt64BE(2));off=10}
    const mo=off;if(masked)off+=4;if(c.buf.length<off+len)return;
    let pl=c.buf.slice(off,off+len);if(masked){const m=c.buf.slice(mo,mo+4);pl=Buffer.from(pl.map((x,i)=>x^m[i&3]))}
    c.buf=c.buf.slice(off+len);
    if(op===8){try{c.sock.end()}catch(e){}return}
    if(op===9){try{c.sock.write(Buffer.concat([Buffer.from([0x8A,pl.length]),pl]))}catch(e){}continue}
    if(op===1||op===0){c.frag.push(pl);if(!fin)continue;const txt=Buffer.concat(c.frag).toString();c.frag=[];let msg;try{msg=JSON.parse(txt)}catch(e){continue}onMsg(c,msg)}
  }}
function onMsg(c,m){
  if(m.t==='host'){if(host&&host!==c){send(c,{t:'err',msg:'A game is already hosted on this server'});return}host=c;c.role='host';send(c,{t:'hosted'});console.log('Host connected:',m.name);return}
  if(m.t==='join'){if(!host){send(c,{t:'err',msg:'No host yet - ask your friend to press Host first'});return}c.role='client';clients.set(c.id,c);send(host,{t:'peer',id:c.id,name:m.name});send(c,{t:'joined',id:c.id});console.log('Player joined:',m.name);return}
  if(c.role==='client'&&m.t==='m'&&host){send(host,{t:'m',from:c.id,m:m.m});return}
  if(c.role==='host'){if(m.t==='to'){const k=clients.get(m.id);if(k)send(k,{t:'m',m:m.m})}else if(m.t==='all'){for(const k of clients.values())send(k,{t:'m',m:m.m})}}
}
function onClose(c){if(c===host){host=null;for(const k of clients.values())send(k,{t:'hostleft'});clients.clear();console.log('Host left')}
  else if(clients.has(c.id)){clients.delete(c.id);if(host)send(host,{t:'leave',id:c.id})}}
srv.listen(PORT,'0.0.0.0',()=>{console.log('Dafhio Dominion LAN server running on port '+PORT);
  for(const l of Object.values(os.networkInterfaces()))for(const a of l)if(a.family==='IPv4'&&!a.internal)console.log('  Players open:  http://'+a.address+':'+PORT);
  console.log('  (this PC: http://localhost:'+PORT+')');});
