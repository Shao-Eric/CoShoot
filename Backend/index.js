require('dotenv').config()
var app = require('express')()
var http = require('http').Server(app)
var io = require('socket.io')(http)
var cors = require('cors')
var ss = require('socket.io-stream');
var fs = require('fs')
const fsPromises = fs.promises
var path = require('path');
var ffmpeg = require('fluent-ffmpeg');

app.use(cors())

function getTimeDifference(date1, date2) {
  let milliseconds = Math.abs(date2 - date1)
  var minutes = Math.floor(milliseconds / 60000);
  var seconds = ((milliseconds % 60000) / 1000)
  return (seconds == 60 ? (minutes+1) + ":00" : minutes + ":" + (seconds < 10 ? "0" : "") + seconds)
}

app.get('/', function (req, res) {
  res.send('CoShoot Locally')
})

let roomUserIds = {}
let cutSequences = {}
let recievedVideos = {}
function makeid(length) {
  var text = "";
  //var possible = "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz";
  var possible = "abcdefghijklmnopqrstuvwxyz";

  for (var i = 0; i < length; i++)
    text += possible.charAt(Math.floor(Math.random() * possible.length));

  return text;
}

io.on('connection', (socket) => {
  let roomId = null
  socket.on('join', (msg) => {
    roomId = msg.roomId
    if (!roomId) {
      roomId = makeid(5)
      // get user info and set socket info
      let { name } = msg
      socket.user = { name, uid: 0 }

      // join the correct room
      socket.join(roomId)

      roomUserIds[roomId] = [socket.user]

      socket.emit('room created', roomId)
      console.log(`user ${socket.user.uid} has created room ${roomId}`)
    } else {
      // get user info and set socket info
      let { name } = msg
      socket.user = { name, uid: roomUserIds[roomId].length }

      // join the correct room
      socket.join(roomId)

      socket.emit('user joined', socket.user)

      for (let user of roomUserIds[roomId]) {
        socket.emit('user joined', user)
      }

      roomUserIds[roomId].push(socket.user)

      socket.to(roomId).emit('user joined', socket.user)
      console.log(`user ${socket.user.uid} has joined room ${roomId}`)
    }
  })

  socket.on('user joined', (msg) => {
    roomUserIds[roomId].push(msg)
  })

  socket.on('start', (msg) => {
    // get current date
    let date = new Date()
    console.log("start triggered and user " + msg.uid + " will start first at " + date)
    cutSequences[roomId] = { startTime: date, startUser: msg.uid }
    socket.emit('start', { user: msg })
    socket.to(roomId).emit('start', { user: msg })
  })

  socket.on('control', (msg) => {
    // get new date and save user i
    let date = new Date()
    if ('cuts' in cutSequences[roomId]) {
      cutSequences[roomId]['cuts'].push({ uid: socket.user.uid, date })
    } else {
      cutSequences[roomId]['cuts'] = [{ uid: socket.user.uid, date }]
    }

    console.log("user " + socket.user.uid + " has taken control at " + date)
    socket.emit('control', { user: socket.user })
    socket.to(roomId).emit('control', { user: socket.user })
  })

  socket.on('stop', (msg) => {
    console.log('stop called by creator')
    socket.emit('stop', {})

    socket.to(roomId).emit('stop', {})
  })

  socket.on('recieve file', (msg) => {
    // file goes here
    console.log("A file has been recieved with url: ", msg)
    if (roomId in recievedVideos) {
      recievedVideos[roomId] = recievedVideos[roomId].push({
        uid: socket.user.uid,
        url: msg
      })
    } else {
      recievedVideos[roomId] = [{
        uid: socket.user.uid,
        url: msg
      }]
    }
    if (recievedVideos[roomId].length === roomUserIds[roomId].length) {
      console.log("All files have been recieved", recievedVideos)
      if(!fs.existsSync(`./videos/${roomId}`)){
        fs.mkdir(`./videos/${roomId}`, { recursive: true }, (err) => {
          if (err) throw err;
        })
      }
      let array = [{uid: cutSequences[roomId].startUser, time: cutSequences[roomId].startTime}, ...cutSequences[roomId].cuts]
      let promises = array.map(({uid, time}, index) => {
        let outputPath = `${roomId}/${index}.mp4`
        let firebaseURL = recievedVideos[roomId].filter(item => item.uid == uid)
        let start, duration
        if(index == 0){
          start = '00:00:00'
        } else {
          start = getTimeDifference(time - array[index - 1].time)
        }
        duration = getTimeDifference(array[index + 1].time - time)
        return new Promise((resolve, reject) => {
          ffmpeg(firebaseURL)
          .setStartTime(start)
          .setDuration(duration)
          .output(outputPath)
          .on('end', function(err) {
            resolve(`./videos/${outputPath}`)
          })
          .on('error', function(err) {
            reject(err)
          })
        })
      })

      Promise.all(promises).then(res => {
        let merge = ffmpeg()
        res.forEach(file => {
          merge.addInput(file)
        })
        merge.on('error', function(err) {
          console.log('An error occurred: ' + err.message);
        })
        .on('end', function() {
          fsPromises.unlink(res).then(() => console.log(`deleted ${res}`)).catch(err => console.log(err))
          console.log('Merging finished !')
        })
        .mergeToFile('./videos/merged.mp4', './tempdir/')
      })
    }
    console.log("requesting all videos")
  })

  socket.on('disconnect', function () {
    if (socket.user) {
      roomUserIds[roomId] = roomUserIds[roomId].filter(user => user.uid != socket.user.uid)
    }
    console.log('user disconnected');
  });
})

app.post('/test', (req, res) => {
  let name = req.body.uid
  res.send(name)
})

http.listen(3000, function () {
  console.log('listening on http://localhost:3000')
})
