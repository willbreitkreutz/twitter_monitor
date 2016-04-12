var io = require('socket.io')(3000);
var tweetStream = require('node-tweet-stream')

var tw = new tweetStream({
  consumer_key:         'QSAAilCOX1PCMtcKNx0xucwKg',
  consumer_secret:      'DQK2ZtMurjDdInSunwQmxjqcwEI9XU90K41YNO8pY4eFyWhLB2',
  token:                '129841132-cxhTzz0P3L3Hk19VOid2fn1D47Sgj8kwvkeHDCcQ',
  token_secret:         '2xAqNgyKSkc0wDziaUPTQta5MDprFOOddje98ayN7ORuz'
})

var currentTrack = []

io.on('connection', function (socket) {
  tw.on('tweet', function(tweet){
     io.emit('tweet', tweet);
  })
  socket.on('changeTrack', function (data) {
    if(data == ''){
      currentTrack.forEach(function(word){
        tw.untrack(word)
      })
      currentTrack = []
      console.log('cleared tracking')
    }else{

      var keywords = data.split(',')
      currentTrack.forEach(function(word){
        tw.untrack(word)
      })
      currentTrack = []
      keywords.forEach(function(word){
        tw.track(word)
        currentTrack.push(word)
        console.log('now listening for tweets with ', word)
      })

    }
  });
  socket.on('clearTrack', function(){
    currentTrack.forEach(function(word){
      tw.untrack(word)
    })
    currentTrack = []
    console.log('cleared tracking')
  })
});

console.log('IO server started on port 3000')
