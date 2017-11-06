/**
 * Copyright 2017 IBM All Rights Reserved.
 *
 * Licensed under the Apache License, Version 2.0 (the 'License');
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *    http://www.apache.org/licenses/LICENSE-2.0
 *
 *  Unless required by applicable law or agreed to in writing, software
 *  distributed under the License is distributed on an 'AS IS' BASIS,
 *  WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 *  See the License for the specific language governing permissions and
 *  limitations under the License.
 */
'use strict';
var log4js = require('log4js');
var logger = log4js.getLogger('SampleWebApp');
var express = require('express');
var session = require('express-session');
var cookieParser = require('cookie-parser');
var bodyParser = require('body-parser');
var http = require('http');
var util = require('util');
var app = express();
var expressJWT = require('express-jwt');
var jwt = require('jsonwebtoken');
var bearerToken = require('express-bearer-token');
var cors = require('cors');
var config = require('./config.json');
var helper = require('./app/helper.js');
var channels = require('./app/create-channel.js');
var join = require('./app/join-channel.js');
var install = require('./app/install-chaincode.js');
var instantiate = require('./app/instantiate-chaincode.js');
var invoke = require('./app/invoke-transaction.js');
var query = require('./app/query.js');
var host = process.env.HOST || config.host;
var port = process.env.PORT || config.port;
var channelName = config.channelName;
var chaincodeName = config.chaincodeName;
///////////////////////////////////////////////////////////////////////////////
//////////////////////////////// SET CONFIGURATONS ////////////////////////////
///////////////////////////////////////////////////////////////////////////////
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
app.use(expressJWT({
	secret: 'thisismysecret'
}).unless({
	path: ['/users','/^\\/static\\/.*/']
}));
app.use('/static', express.static('public'));
app.use(bearerToken());
app.use(function(req, res, next) {
	if (req.originalUrl.indexOf('/users') >= 0) {
		return next();
	}
    if (req.originalUrl.indexOf('/static') >= 0) {
        return next();
    }

	var token = req.token;
	jwt.verify(token, app.get('secret'), function(err, decoded) {
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
			req.username = decoded.username;
			req.orgname = decoded.orgName;
			logger.debug(util.format('Decoded from JWT token: username - %s, orgname - %s', decoded.username, decoded.orgName));
			return next();
		}
	});
});

app.use(function (err, req, res, next) {
    var status;
    var message;
    var code;
    //expreeJWT error
    if (err.name == 'UnauthorizedError' && err.inner) {
        status = 401;
        code = "token_error";
    } else {
    	next();
        status = err.status;
    }
    res.status(status).send({
        "success": false,
        "code": code,
        "message": err.message
    });
});

///////////////////////////////////////////////////////////////////////////////
//////////////////////////////// START SERVER /////////////////////////////////
///////////////////////////////////////////////////////////////////////////////
var server = http.createServer(app).listen(port, function() {});
logger.info('****************** SERVER STARTED ************************');
logger.info('**************  http://' + host + ':' + port +
	'  ******************');
server.timeout = 240000;

function getErrorMessage(field) {
	var response = {
		success: false,
		message: field + ' field is missing or Invalid in the request'
	};
	return response;
}
//update configtx by file
app.post('/configtxlator/:channelName/', function (req, res) {
    var channelName = req.params.channelName;
    var configPath = req.body.configPath;
    var configtxlator = require('./app/configtxlator.js');
    configtxlator.updateChannelConfigByFile(channelName, req.orgname, configPath)
        .then(function (message) {
            res.send(message);
        });
});

///////////////////////////////////////////////////////////////////////////////
///////////////////////// REST ENDPOINTS START HERE ///////////////////////////
///////////////////////////////////////////////////////////////////////////////
// Register and enroll user
app.post('/users', function(req, res) {
	var username = req.body.username;
	var orgName = req.body.orgName;
	logger.debug('End point : /users');
	logger.debug('User name : ' + username);
	logger.debug('Org name  : ' + orgName);
	if (!username) {
		res.json(getErrorMessage('\'username\''));
		return;
	}
	if (!orgName) {
		res.json(getErrorMessage('\'orgName\''));
		return;
	}
	var token = jwt.sign({
		exp: Math.floor(Date.now() / 1000) + parseInt(config.jwt_expiretime),
		username: username,
		orgName: orgName
	}, app.get('secret'));
	helper.getRegisteredUsers(username, orgName, true).then(function(response) {
		if (response && typeof response !== 'string') {
			response.token = token;
			res.json(response);
		} else {
			res.json({
				success: false,
				message: response
			});
		}
	});
});
// Create Channel
app.post('/channels', function(req, res) {
	logger.info('<<<<<<<<<<<<<<<<< C R E A T E  C H A N N E L >>>>>>>>>>>>>>>>>');
	logger.debug('End point : /channels');
	var channelName = req.body.channelName;
	var channelConfigPath = req.body.channelConfigPath;
	logger.debug('Channel name : ' + channelName);
	logger.debug('channelConfigPath : ' + channelConfigPath); //../artifacts/channel/mychannel.tx
	if (!channelName) {
		res.json(getErrorMessage('\'channelName\''));
		return;
	}
	if (!channelConfigPath) {
		res.json(getErrorMessage('\'channelConfigPath\''));
		return;
	}

	channels.createChannel(channelName, channelConfigPath, req.username, req.orgname)
	.then(function(message) {
		res.send(message);
	});
});
// Join Channel
app.post('/channels/:channelName/peers', function(req, res) {
	logger.info('<<<<<<<<<<<<<<<<< J O I N  C H A N N E L >>>>>>>>>>>>>>>>>');
	var channelName = req.params.channelName;
	var peers = req.body.peers;
	logger.debug('channelName : ' + channelName);
	logger.debug('peers : ' + peers);
	if (!channelName) {
		res.json(getErrorMessage('\'channelName\''));
		return;
	}
	if (!peers || peers.length == 0) {
		res.json(getErrorMessage('\'peers\''));
		return;
	}

	join.joinChannel(channelName, peers, req.username, req.orgname)
	.then(function(message) {
		res.send(message);
	});
});
// Install chaincode on target peers
app.post('/chaincodes', function(req, res) {
	logger.debug('==================== INSTALL CHAINCODE ==================');
	var peers = req.body.peers;
	var chaincodeName = req.body.chaincodeName;
	var chaincodePath = req.body.chaincodePath;
	var chaincodeVersion = req.body.chaincodeVersion;
	logger.debug('peers : ' + peers); // target peers list
	logger.debug('chaincodeName : ' + chaincodeName);
	logger.debug('chaincodePath  : ' + chaincodePath);
	logger.debug('chaincodeVersion  : ' + chaincodeVersion);
	if (!peers || peers.length == 0) {
		res.json(getErrorMessage('\'peers\''));
		return;
	}
	if (!chaincodeName) {
		res.json(getErrorMessage('\'chaincodeName\''));
		return;
	}
	if (!chaincodePath) {
		res.json(getErrorMessage('\'chaincodePath\''));
		return;
	}
	if (!chaincodeVersion) {
		res.json(getErrorMessage('\'chaincodeVersion\''));
		return;
	}

	install.installChaincode(peers, chaincodeName, chaincodePath, chaincodeVersion, req.username, req.orgname)
	.then(function(message) {
		res.send(message);
	});
});
// Instantiate chaincode on target peers
app.post('/channels/:channelName/chaincodes', function(req, res) {
	logger.debug('==================== INSTANTIATE CHAINCODE ==================');
	var chaincodeName = req.body.chaincodeName;
	var chaincodeVersion = req.body.chaincodeVersion;
	var channelName = req.params.channelName;
	var functionName = req.body.functionName;
	var args = req.body.args;
	var updateFlag = req.body.updateFlag;
	logger.debug('channelName  : ' + channelName);
	logger.debug('chaincodeName : ' + chaincodeName);
	logger.debug('chaincodeVersion  : ' + chaincodeVersion);
	logger.debug('functionName  : ' + functionName);
	logger.debug('args  : ' + args);
	if (!chaincodeName) {
		res.json(getErrorMessage('\'chaincodeName\''));
		return;
	}
	if (!chaincodeVersion) {
		res.json(getErrorMessage('\'chaincodeVersion\''));
		return;
	}
	if (!channelName) {
		res.json(getErrorMessage('\'channelName\''));
		return;
	}
	if (!functionName) {
		res.json(getErrorMessage('\'functionName\''));
		return;
	}
	if (!args) {
		res.json(getErrorMessage('\'args\''));
		return;
	}
	instantiate.instantiateChaincode(channelName, chaincodeName, chaincodeVersion, functionName, args, req.username, req.orgname, updateFlag)
	.then(function(message) {
		res.send(message);
	});
});
// Invoke transaction on chaincode on target peers
app.post('/channels/:channelName/chaincodes/:chaincodeName', function(req, res) {
	logger.debug('==================== INVOKE ON CHAINCODE ==================');
	var peers = req.body.peers;
	var chaincodeName = req.params.chaincodeName;
	var channelName = req.params.channelName;
	var fcn = req.body.fcn;
	var args = req.body.args;
	logger.debug('channelName  : ' + channelName);
	logger.debug('chaincodeName : ' + chaincodeName);
	logger.debug('fcn  : ' + fcn);
	logger.debug('args  : ' + args);
	if (!peers || peers.length == 0) {
		res.json(getErrorMessage('\'peers\''));
		return;
	}
	if (!chaincodeName) {
		res.json(getErrorMessage('\'chaincodeName\''));
		return;
	}
	if (!channelName) {
		res.json(getErrorMessage('\'channelName\''));
		return;
	}
	if (!fcn) {
		res.json(getErrorMessage('\'fcn\''));
		return;
	}
	if (!args) {
		res.json(getErrorMessage('\'args\''));
		return;
	}

	invoke.invokeChaincode(peers, channelName, chaincodeName, fcn, args, req.username, req.orgname)
	.then(function(message) {
		res.send(message);
	});
});
// Query on chaincode on target peers
app.get('/channels/:channelName/chaincodes/:chaincodeName', function(req, res) {
	logger.debug('==================== QUERY BY CHAINCODE ==================');
	var channelName = req.params.channelName;
	var chaincodeName = req.params.chaincodeName;
	let args = req.query.args;
	let fcn = req.query.fcn;
	let peer = req.query.peer;

	logger.debug('channelName : ' + channelName);
	logger.debug('chaincodeName : ' + chaincodeName);
	logger.debug('fcn : ' + fcn);
	logger.debug('args : ' + args);

	if (!chaincodeName) {
		res.json(getErrorMessage('\'chaincodeName\''));
		return;
	}
	if (!channelName) {
		res.json(getErrorMessage('\'channelName\''));
		return;
	}
	if (!fcn) {
		res.json(getErrorMessage('\'fcn\''));
		return;
	}
	if (!args) {
		res.json(getErrorMessage('\'args\''));
		return;
	}
	args = args.replace(/'/g, '"');
	args = JSON.parse(args);
	logger.debug(args);

	query.queryChaincode(peer, channelName, chaincodeName, args, fcn, req.username, req.orgname)
	.then(function(message) {
		res.send(message);
	});
});
//  Query Get Block by BlockNumber
app.get('/channels/:channelName/blocks/:blockId', function(req, res) {
	logger.debug('==================== GET BLOCK BY NUMBER ==================');
	let blockId = req.params.blockId;
	let peer = req.query.peer;
	logger.debug('channelName : ' + req.params.channelName);
	logger.debug('BlockID : ' + blockId);
	logger.debug('Peer : ' + peer);
	if (!blockId) {
		res.json(getErrorMessage('\'blockId\''));
		return;
	}

	query.getBlockByNumber(peer, blockId, req.username, req.orgname)
		.then(function(message) {
			res.send(message);
		});
});
// Query Get Transaction by Transaction ID
app.get('/channels/:channelName/transactions/:trxnId', function(req, res) {
	logger.debug(
		'================ GET TRANSACTION BY TRANSACTION_ID ======================'
	);
	logger.debug('channelName : ' + req.params.channelName);
	let trxnId = req.params.trxnId;
	let peer = req.query.peer;
	if (!trxnId) {
		res.json(getErrorMessage('\'trxnId\''));
		return;
	}

	query.getTransactionByID(peer, trxnId, req.username, req.orgname)
		.then(function(message) {
			res.send(message);
		});
});
// Query Get Block by Hash
app.get('/channels/:channelName/blocks', function(req, res) {
	logger.debug('================ GET BLOCK BY HASH ======================');
	logger.debug('channelName : ' + req.params.channelName);
	let hash = req.query.hash;
	let peer = req.query.peer;
	if (!hash) {
		res.json(getErrorMessage('\'hash\''));
		return;
	}

	query.getBlockByHash(peer, hash, req.username, req.orgname).then(
		function(message) {
			res.send(message);
		});
});
//Query for Channel Information
app.get('/channels/:channelName', function(req, res) {
	logger.debug(
		'================ GET CHANNEL INFORMATION ======================');
	logger.debug('channelName : ' + req.params.channelName);
	let peer = req.query.peer;

	query.getChainInfo(peer, req.username, req.orgname).then(
		function(message) {
			res.send(message);
		});
});
// Query to fetch all Installed/instantiated chaincodes
app.get('/chaincodes', function(req, res) {
	var peer = req.query.peer;
	var installType = req.query.type;
	//TODO: add Constnats
	if (installType === 'installed') {
		logger.debug(
			'================ GET INSTALLED CHAINCODES ======================');
	} else {
		logger.debug(
			'================ GET INSTANTIATED CHAINCODES ======================');
	}

	query.getInstalledChaincodes(peer, installType, req.username, req.orgname)
	.then(function(message) {
		res.send(message);
	});
});
// Query to fetch channels
app.get('/channels', function(req, res) {
	logger.debug('================ GET CHANNELS ======================');
	logger.debug('peer: ' + req.query.peer);
	var peer = req.query.peer;
	if (!peer) {
		res.json(getErrorMessage('\'peer\''));
		return;
	}

	query.getChannels(peer, req.username, req.orgname)
	.then(function(
		message) {
		res.send(message);
	});
});

var insert = function (table, data, username, orgname) {
    return new Promise(function (reslove, reject) {

        if (!data || data.length == 0) {
            reject('request body can not be empty');
        }
        var id = "";
        try {
            if (typeof data == "String") {
                id = JSON.parse(data).id;
            } else if (typeof data == "object") {
                id = data.id;
            } else {
                logger.warn("typeof data:" + (typeof data));
            }
        } catch (err) {
            logger.error(err);
            reject('json parse Error');
        } finally {
            if (id == null || id == undefined || id == "") {
                reject('request param id must be specify');
            }
        }

        var jsonObject = {
            "Table": table,
            "Key": id.toString(),
            "Data": data,
            "Timestamp": Math.round(new Date().getTime() / 1000)
        };

        var args = [];
        args[2] = JSON.stringify(jsonObject);
        args[1] = id.toString();
        args[0] = table;
        logger.info(args);

        if (!args) {
            reject('args field is missing or Invalid in the request');
        }

        var peers =getPeers();
        var fcn = 'update';
        invoke.invokeChaincode(peers, channelName, chaincodeName, fcn, args, username, orgname)
            .then(function (message) {
            	console.log("message:"+JSON.stringify(message));
                if (message && message.indexOf("Error") == -1) {
                    reslove(message);
                } else {
                    reject(message);
                }
            });
    })
};




//根据表名和参数新增单笔数据
app.post('/insert/:table', function (req, res) {

    insert(req.params.table, req.body, req.username, req.orgname)
        .then((message) => {
    	console.log("message===>"+message);
        res.send(message);
}).catch((err)=>{
        res.send(err.message);
});
});

//根据表名和参数批量新增数据
app.post('/batch/:table', function (req, res) {

    var table = req.params.table;
    var group = req.body;
    if (!group || group.length == 0) {
        res.json(getError('req body can not be empty'));
        return;
    }
    var end = group.length;
    if (group instanceof Array == false) {
        res.json(getError('req body must be Array'));
        return;
    }

    const tps = 10;
    var results = [];

    var oneRoundInvoke = function (startLocation) {
        var oneRoundInvokePromise = new Promise(function (resolve, reject) {
            var promises = [];
            for (var i = 0; i < tps && (startLocation + i) < end; i++) {
                var invokePromise = insert(table, group[i], req.username, req.orgname)
                    .then((message) => {
                    results.push(getRes(true, "invoke", message));
                return;
            }).catch((message)=>{
                    results.push(getRes(false, "invoke", message));
            });
                promises.push(invokePromise);
            }
            Promise.all(promises)
                .then(() => {
                resolve(startLocation + i);
        }, (err) => {
                reject(err);
            });

        });
        return oneRoundInvokePromise
            .then((startLocation) => {
            if (startLocation < (end - 1)) {
            return oneRoundInvoke(startLocation);
        } else {
            return Promise.resolve();
        }
    });
    }
    oneRoundInvoke(0)
        .then(()=>{
        res.json(results);
})
});

function getError(message, key) {
    var response = {
        success: false,
        key: key,
        message: message
    };
    return response;
}
//获取背书节点
var getPeers = function(){
	var jsonPeers = config.peers;
    var peers=[];
    for (var i=0;i<jsonPeers.length;i++){
        var peer = helper.getPeerAddressByName(jsonPeers[i].org, jsonPeers[i].peer)
        peers.push(peer);
    }
    return peers;
}

//key is option
function getRes(success, type, message, key) {
    if (success == true &&
        message.indexOf("Error") == -1 &&
        message.indexOf("Failed") == -1 &&
        message.indexOf("error") == -1) {
        var response = {
            success: success,
        };
        if (type == "query") {
            response.result = JSON.parse(message).Data; //message;
        } else if (type == "invoke") {
            var invokeReturn = JSON.parse(message);
            response.key = invokeReturn.key;
            response.tx_id = invokeReturn.tx_id;
        } else if (type == "couchdb") {
            var jsonObject = JSON.parse(message);
            if (jsonObject.warning) {
                logger.warn("couchdb warning:", jsonObject.warning);
            }
            var docs = jsonObject.docs;
            var size = docs.length;
            var result = [];
            for (var i = 0; i < size; i++) {
                result.push(docs[i].data.Data);
            }
            response.result = result;
        } else if (type == "trace") {
            response.result = JSON.parse(message);
        }else if (type == "raw") {
            response.result = message;
        }
    } else {
        return getError(message, key);
    }
    return response;
};