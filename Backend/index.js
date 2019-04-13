require('dotenv').config()
var app = require('express')()
var http = require('http').Server(app)
var io = require('socket.io')(http)
var cors = require('cors')
var ss = require('socket.io-stream');
var path = require('path');
var ffmpeg = require('fluent-ffmpeg');

app.use(cors())

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

    // ffmpeg('./TestVid.mp4')
    // .input('./TestVid.mp4')
    // .on('end', function(err) {
    //   if(!err){
    //     console.log('Merging finished !');
    //   }
    // })
    // .on('error', function(err) {
    //   console.log('An error occurred: ' + err.message);
    // })
    // .mergeToFile('./merged.mp4', './tempdir/')
    // ffmpeg('./SampleVideo_1280x720_30mb.mp4')
    // .setStartTime('00:00:00')
    // .setDuration('40')
    // .output('./TestVid.mp4')
    // .on('end', function(err) {   
    //   if(!err)
    //   {
    //     console.log('conversion Done');
    //   }                 
    // })
    // .on('error', function(err){
    //     console.log('error: ', +err);
    // }).run()
    socket.emit('stop', {})

    socket.to(roomId).emit('stop', {})
  })

  ss(socket).on('receive file', (stream, data) => {
    // file goes here
    var filename = path.basename(`/raw/${roomId - socket.user.uid}.mp4`);
    stream.pipe(fs.createWriteStream(filename))
    stream.on('close', function () {
      if ('roomId' in recievedVideos) {
        recievedVideos[roomId] = recievedVideos[roomId].push(path.basename(`/raw/${roomId - socket.user.uid}.mp4`))
      } else {
        recievedVideos[roomId] = [path.basename(`/raw/${roomId - socket.user.uid}.mp4`)]
      }
      recievedVideos[roomId].push(`${socket.user.uid}.mp4`)
      if (recievedVideos.length === roomUserIds.length) {
        cutSequences[roomId] // start time, start user, cuts array
        recievedVideos[roomId] // array of video files
        // call video clipping function
      }
    });

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
