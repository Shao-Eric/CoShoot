var app = require('express')()
var http = require('http').Server(app)
var io = require('socket.io')(http)
var cors = require('cors')

app.use(cors())

app.get('/', function (req, res) {
  res.send('CoShoot Locally')
})

let roomUserIds = []

io.on('connection', (socket) => {
  let roomId = null

  socket.on('join', (msg) => {
    // get user info and set socket info
    let { name, roomId } = msg
    socket.user = { name, uid: roomUserIds.length }

    // join the correct room
    socket.join(roomId)

    roomUserIds.push(socket.user.uid)
    socket.to(roomId).emit('user joined', socket.user)

    console.log(`user ${socket.user.uid} has joined room ${roomId}`)
  })

  socket.on('user joined', (msg) => {
    roomUserIds.push(msg.uid)
  })

  socket.on('disconnect', function () {
    if (socket.user) {
      roomUserIds = roomUserIds.filter(id => id != socket.user.uid)
    }
    console.log('user disconnected');
  });
})

http.listen(3006, function () {
  console.log('listening on http://localhost:3006')
})
