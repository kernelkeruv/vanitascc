const fs=require('node:fs');const vm=require('node:vm');const assert=require('node:assert/strict');
const path=require('node:path').resolve(__dirname,'../assets/js/device-lab.js');
class El {constructor(id){this.id=id;this.textContent=id==='events'?'Ready. No scan is running.':'';this.disabled=false;this.listeners={};this.nodes=[];}
  addEventListener(name,cb){this.listeners[name]=cb;}trigger(){return this.listeners.click?.()};
  prepend(n){this.nodes.unshift(n)} get childElementCount(){return this.nodes.length;} get lastChild(){return this.nodes.at(-1)}
  remove(){this.nodes.shift()}
}
const els={};const get=id=>els[id]??=(new El(id));
const chr={listeners:{}, readValue:async()=>new DataView(Uint8Array.from([83]).buffer),
 addEventListener(n,cb){this.listeners[n]=cb}, removeEventListener(n){delete this.listeners[n]},
 startNotifications:async()=>{},stopNotifications:async()=>{}};
const dev={listeners:{},gatt:{connected:false,async connect(){this.connected=true;return this;},
 async getPrimaryService(){return {getCharacteristic:async()=>chr}}, disconnect(){this.connected=false;dev.listeners.gattserverdisconnected?.()}},
 addEventListener(n,cb){this.listeners[n]=cb}};
const ctx={document:{getElementById:get,createElement:()=>new El('entry')},
 navigator:{bluetooth:{requestDevice:async options=>{assert.equal(options.acceptAllDevices,true);return dev;}}},
 window:{isSecureContext:true},Date,DataView,Uint8Array,RangeError,Boolean,Object,Error};
vm.runInNewContext(fs.readFileSync(path,'utf8'),ctx,{filename:path});
(async()=>{await get('connect').trigger();assert.equal(get('device-status').textContent,'Connected (BLE)');
await get('battery').trigger();assert.equal(get('battery-status').textContent,'83%');
await get('heart-start').trigger();assert.equal(get('heart-status').textContent,'Waiting for measurement');
chr.listeners.characteristicvaluechanged?.({target:{value:new DataView(Uint8Array.from([0,72]).buffer)}});
assert.equal(get('heart-status').textContent,'72 bpm (live)');
await get('heart-stop').trigger();assert.equal(get('heart-status').textContent,'Not monitoring');
await get('disconnect').trigger();assert.equal(get('device-status').textContent,'Not connected');
console.log('PASS mocked Web Bluetooth permission/connect/battery/HR notification/stop/disconnect');
})().catch(err=>{console.error(err);process.exitCode=1});
