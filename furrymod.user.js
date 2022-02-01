// ==UserScript==
// @name        FurryMod
// @namespace   furrymod
// @description Moomoo.io cheat
// @include     https://moomoo.io/*
// @version     1
// @run-at      document-start
// @require     https://cdnjs.cloudflare.com/ajax/libs/msgpack-lite/0.1.26/msgpack.min.js
// ==/UserScript==

// const en = new Uint8Array(Array.from(msgpack.encode('123')))
// console.log(en))

let this_backup = null, onmessage_backup

function send (...data) {
  this_backup.send_org(new Uint8Array(Array.from(msgpack.encode(data))))
}

WebSocket.prototype.send_org = WebSocket.prototype.send

WebSocket.prototype.send = function (data) {
  const m = msgpack.decode(data)
  intercept(m)
  if (this_backup == null) {
    this_backup = this
    init()
  }
  this.send_org(data)
}

function init () {
  console.log('Furrymod READY!')
  onmessage_backup = this_backup.onmessage
  this_backup.onmessage = (m) => {
    onmessage(msgpack.decode(new Uint8Array(m.data)))
    onmessage_backup(m)
  }
}
function intercept (data) {
  if (data[0] != 2 && data[0] != '2' && data[0] != 'pp') {
  	console.log(...data)
  }
  if (data[0] == 'c') {
    if (data[1][0] == 1) {
      send('13c', [0, 42, 0])
    } else {
      send('13c', [0, 0, 0])
    }
  }
}
function onmessage (data) {
  console.log(data)
}
