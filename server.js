var app = require('./js/app');

app.listen(app.get('port'), function () {
    console.log('Server started: http://%s:%s', app.get('host'), app.get('port'));
});
