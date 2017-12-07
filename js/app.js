var log4js = require('log4js');
var logger = log4js.getLogger('SampleWebApp');
var express = require('express');
var app = express();
var bodyParser = require('body-parser');
var expressJWT = require('express-jwt');
var jwt = require('jsonwebtoken');
var bearerToken = require('express-bearer-token');
var cors = require('cors');
var util = require('util');
var config = require('../config.json');
var helper = require('../app/helper.js');
var errors = require('../app/errors');
var utils = require('../app/utils');
app.set('host', process.env.HOST || 'localhost');
app.set('port', process.env.PORT || 4000);
var sdkUtil = require('../app'); //<co id="web-express-routes-4-1" />
//support parsing of application/json type post data
app.use(bodyParser.json());
//support parsing of application/x-www-form-urlencoded post data
app.use(bodyParser.urlencoded({
    extended: false
}));

app.options('*', cors());
app.use(cors());
//support parsing of application/json type post data
app.use(bodyParser.json());
//support parsing of application/x-www-form-urlencoded post data
app.use(bodyParser.urlencoded({
    extended: false
}));
// set secret variable
app.set('secret', 'thisismysecret');
//jwt
app.use(expressJWT({
    secret: 'thisismysecret'
}).unless({
    path: ['/users', '/^\\/static\\/.*/']
}));
app.use('/static', express.static('public'));
app.use(bearerToken());
app.use(function (req, res, next) {
    if (req.originalUrl.indexOf('/users') >= 0) {
        return next();
    }
    if (req.originalUrl.indexOf('/static') >= 0) {
        return next();
    }
    var token = req.token;
    jwt.verify(token, app.get('secret'), function (err, decoded) {
        if (err) {
            res.send({
                success: false,
                message: 'Failed to authenticate token. Make sure to include the ' +
                'token returned from /users call in the authorization header ' +
                ' as a Bearer token'
            });
            return;
        } else {
            // add the decoded user name and org name to the request object
            // for the downstream code to use
            req.userName = decoded.username;
            req.orgName = decoded.orgName;
            logger.debug(util.format('Decoded from JWT token: username - %s, orgname - %s', decoded.username, decoded.orgName));
            return next();
        }
    });
});
// Register and enroll user
app.post('/users', function (req, res) {
    var username = req.body.username;
    var orgName = req.body.orgName;
    logger.debug('End point : /users');
    logger.debug('User name : ' + username);
    logger.debug('Org name  : ' + orgName);
    if (!username) {
        throw new errors.NotFound("username");
        return;
    }
    if (!orgName) {
        throw new errors.NotFound("orgName");
        return;
    }
    var token = jwt.sign({
        exp: Math.floor(Date.now() / 1000) + parseInt(config.jwt_expiretime),
        username: username,
        orgName: orgName
    }, app.get('secret'));
    helper.getRegisteredUsers(username, orgName, true).then(function (response) {
        if (response && typeof response !== 'string') {
            res.json(utils.getResponse(response.message, 200, token));
        } else {
            res.json(utils.getResponse(response, 500));
        }
        return;
    }).catch(function (err) {
        res.json(utils.getResponse(err, 500));
    });
});
app.post('/createChannel', sdkUtil.createChannel.createChannel);
app.post('/joinChannel', sdkUtil.joinChannel.joinChannel);
app.post('/installChaincode', sdkUtil.installChaincode.installChaincode);
app.post('/instantiateChaincode', sdkUtil.instantiateChaincode.instantiateChaincode);
app.post('/upgradeChaincode', sdkUtil.upgradeChaincode.upgradeChaincode);
app.post('/invokeChaincode', sdkUtil.invokeChaincode.invokeChaincode);
app.post('/invokeChaincodebatch', sdkUtil.invokeChaincodeBatch.invokeChaincodeBatch);


app.use(function (err, req, res, next) {
    if (err.name == 'UnauthorizedError' && err.inner) {
        err.code = "token_error";
    }
    console.log(JSON.stringify(err));
    res.json(utils.getResponse(err.message, err.code));
});

process.on('uncaughtException', function (err) {
    console.log("异步错误");
    //打印出错误
    console.log(err);
    //打印出错误的调用栈方便调试
    console.log(err.stack);
});

module.exports = app;
