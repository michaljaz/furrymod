// ==UserScript==
// @name        FurryMod
// @namespace   furrymod
// @description Moomoo.io cheat
// @include     *://moomoo.io/*
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
  document.querySelector('#ot-sdk-btn-floating').remove()
  console.log('Furrymod READY!')
  onmessage_backup = this_backup.onmessage
  this_backup.onmessage = (m) => {
    onmessage(msgpack.decode(new Uint8Array(m.data)))
    onmessage_backup(m)
  }
}
function intercept (data) {
  if (data[0] != 2 && data[0] != '2' && data[0] != 'pp') {
  	// console.log(...data)
  }
  if (data[0] == 'c') {
    if (data[1][0] == 1) {
      send('13c', [0, 42, 0])
    } else {
      send('13c', [0, 0, 0])
    }
  }
}

let tribes = {}
let players = {}

function onmessage (data) {
  if (data[0] == 'a') {
    // nothing
  } else if (data[0] == 'ac') {
    console.log('TRIBE_CREATED', tribes)
    const {sid, owner} = data[1][0]
    tribes[sid] = owner
  } else if (data[0] == 'ad') {
    console.log('TRIBE_DELETED', tribes)
    delete tribes[data[1][0]]
  } else if (data[0] == 'id') {
    console.log('TRIBE_INIT', tribes)
    const {teams} = data[1][0]
    for (var i = 0; i < teams.length; i++) {
      const {sid, owner} = teams[i]
      tribes[sid] = owner
    }
  } else if (data[0] == '5') {
    let p = {0: [], 1: [], 2: []}
    // console.log()
    for (var i = 0; i < data[1][0].length; i++) {
      p[i % 3].push(data[1][0][i])
    }
    for (var i = 0; i < p[0].length; i++) {
      players[p[0][i]] = {name: p[1][i], gold: p[2][i]}
    }
    // console.log(players)
  } else if (data[0] == '33') {
    const entities=[]
    for(var i=0;i<data[1][0].length/13;i++){
      entities.push(data[1][0].slice(13*i,13*i+13))
    }
    console.log(data[1][0],entities)
  } else{
    // console.log(data)
  }
}
