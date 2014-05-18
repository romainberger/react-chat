var express = require('express')
  , routes  = require('./routes')
  , http    = require('http')
  , path    = require('path')
  , socket  = require('socket.io')
  , app     = express()

app.set('port', process.env.PORT || 3000)
app.set('views', __dirname + '/views')
app.set('view engine', 'ejs')
app.use(express.favicon())
app.use(express.logger('dev'))
app.use(express.bodyParser())
app.use(express.methodOverride())
app.use(app.router)
app.use(express.static(path.join(__dirname, 'public')))

app.get('/',     routes.index)
app.get('/chat', routes.index)

var server = http.createServer(app)

server.listen(app.get('port'), function() {
  console.log('Express server listening on port ' + app.get('port'))
})

var io = socket.listen(server)
  , comments = []

io.sockets.on('connection', function(socket) {
  socket.on('new:comment', function(comment) {
    comments.push(comment)
    io.sockets.emit('new:comment', comment)
  })

  socket.on('init', function() {
    socket.emit('init', comments)
  })
})
