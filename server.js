var app = require('./js/app');

var http = require('http').Server(app);

require('./websocketserver.js')(http)

http.listen(app.get('port'), function () {
    console.log('Server started: http://%s:%s', app.get('host'), app.get('port'));
});

