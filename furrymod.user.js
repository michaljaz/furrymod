// ==UserScript==
// @name        FurryMod
// @namespace   furrymod
// @description Moomoo.io cheat
// @include     *://moomoo.io/*
// @version     1
// @run-at      document-start
// @require     https://cdnjs.cloudflare.com/ajax/libs/msgpack-lite/0.1.26/msgpack.min.js
// ==/UserScript==


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
    console.log(...data)
  }
  if (data[0] == 'c') {
    if (data[1][0] == 1) {
      send('13c', [0, 0, 1])
    } else {
      send('13c', [0, 11, 1])
    }
  }
}

let tribes = {}
let players = {}
let entities = []
let player = false

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
  } else if (data[0] == '2') {
    if (!player && data[1][0][2]==="MJQX") {
      player = data[1][0]
      console.log('PLAYER', player)
    }
  } else if (data[0] == '33') {
    entities = []
    for (var i = 0; i < data[1][0].length / 13; i++) {
      entities.push(data[1][0].slice(13 * i, 13 * i + 13))
    }
    // console.log(entities, player)
  } else {
    // console.log(data)
  }
}

let int

function startEscaper () {
  clearInterval(int)
  int = setInterval(() => {
    moveToNearestPlayer(false)
  }, 100)
}

function startKiller () {
  clearInterval(int)
  int = setInterval(() => {
    moveToNearestPlayer(true)
  }, 100)
}

function stop () {
  clearInterval(int)
}

function moveToNearestPlayer (killer) {
  let playerEntity = false
  for (var i = 0; i < entities.length; i++) {
    if (entities[i][0] === player[1]) {
      playerEntity = entities[i]
      break
    }
  }
  if (playerEntity) {
    let dist = 9999999
    let nent = false
    for (var i = 0; i < entities.length; i++) {
      if (entities[i][0] !== player[1]) {
        let a = Math.abs(entities[i][1] - playerEntity[1])
        let b = Math.abs(entities[i][2] - playerEntity[2])
        let d = Math.sqrt(a * a + b * b)
        if (d < dist) {
          nent = entities[i]
          dist = d
        }
      }
    }
    let a = nent[1] - playerEntity[1]
    let b = nent[2] - playerEntity[2]

    // --
    // -+

    if(killer){
      if ((a < 0 && b < 0) || (a < 0 && b > 0)) {
        send(33, [Math.atan(b / a) - Math.PI])
        // send(2, [Math.atan(b / a) - Math.PI])
      } else {
        send(33, [Math.atan(b / a)])
        // send(2, [Math.atan(b / a)])
      }
    }else{
      if ((a < 0 && b < 0) || (a < 0 && b > 0)) {
        send(33, [Math.atan(b / a)])
        // send(2, [Math.atan(b / a) - Math.PI])
      } else {
        send(33, [Math.atan(b / a) - Math.PI])
        // send(2, [Math.atan(b / a)])
      }
    }


  } else {
    console.log('player not found')
  }
}

document.addEventListener('keydown', (e) => {
  if (e.code == 'KeyP') {
    // send('c', [1, null])
    startKiller()
  }
})
document.addEventListener('keyup', (e) => {
  if (e.code == 'KeyL') {
    // send('c', [1, null])
    startEscaper()
  }
})

document.addEventListener('keyup', (e) => {
  if (e.code == 'KeyO') {
    // send('c', [0, null])
    stop()
  }
})
