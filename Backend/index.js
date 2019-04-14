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
  let answer = (seconds == 60 ? (minutes+1) + ":00" : minutes + ":" + (seconds < 10 ? "0" : "") + seconds)
  return answer
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
    cutSequences[roomId]['cuts'][cutSequences[roomId]['cuts'].length-1]['endTime'] = new Date()
    socket.emit('stop', {})

    socket.to(roomId).emit('stop', {})
  })

  socket.on('recieve file', (msg) => {
    // file goes here
    console.log("A file has been received with url: ", msg)
    if (roomId in recievedVideos) {
      recievedVideos[roomId].push({
        uid: socket.user.uid,
        url: msg
      })
    } else {
      recievedVideos[roomId] = [{
        uid: socket.user.uid,
        url: msg
      }]
    }
    if (recievedVideos[roomId].length == roomUserIds[roomId].length) {
      console.log("All files have been received", recievedVideos)
      if(!fs.existsSync(`./videos/${roomId}/`)){
        fs.mkdir(`./videos/${roomId}/`, { recursive: true }, (err) => {
          if (err) throw err;
        })
      }
      let array = [{uid: cutSequences[roomId].startUser, date: cutSequences[roomId].startTime}, ...cutSequences[roomId].cuts]
      let promises = array.map((clip, index) => {
        let newArray = recievedVideos[roomId].slice()
        let outputPath = `./videos/${roomId}/${index}.mp4`
        let firebaseURL = newArray.filter(item => item.uid == clip.uid)[0].url
        let start, duration
        if(index == 0){
          start = '00:00:00'
        } else {
          start = `${clip.date.getHours()}:${clip.date.getMinutes()}:${clip.date.getSeconds()}`
        }
        if(index == array.length - 1){
          duration = getTimeDifference(clip.date, clip.endTime)
          return new Promise((resolve, reject) => 
            ffmpeg(firebaseURL)
            .setStartTime(start)
            .setDuration(duration)
            .output(outputPath)
            .on('end', (err) => {
              console.log(err)
              resolve(outputPath)
            })
            .on('error', (err) => {
              reject(err)
            }).run()
          )
        } else {
          duration = getTimeDifference(clip.date, array[index + 1].date)
          return new Promise((resolve, reject) => 
            ffmpeg(firebaseURL)
            .setStartTime(start)
            .setDuration(duration)
            .output(outputPath)
            .on('end', (err) => {
              console.log(err)
              resolve(outputPath)
            })
            .on('error', (err) => {
              reject(err)
            }).run()
          )
        }
      })

      Promise.all(promises).then(response => {
        console.log(response)
        let merge = ffmpeg()
        response.forEach(file => {
          merge.addInput(file)
        })
        merge
        .on('error', function(err) {
          console.log('An error occurred: ' + err.message);
        })
        .on('end', function() {
          console.log('Merging finished !')
        })
        .mergeToFile(`.videos/mergedVideo.mp4`, './tempdir')
      })
      
    }
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
