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
var util = require('util');
var utils = require('./utils');
var errors = require('./errors');
var path = require('path');
var fs = require('fs');

var tx_id = null;
var config = require('../config.json');
var helper = require('./helper.js');
var logger = helper.getLogger('Join-Channel');
//helper.hfc.addConfigFile(path.join(__dirname, 'network-config.json'));
var ORGS = helper.ORGS;
var allEventhubs = [];

//
//Attempt to send a request to the orderer with the sendCreateChain method
//
var joinChannel = function (req, res) {
    var channelName = req.body.channelName;
    if (utils.isEmpty(channelName)) {
        throw new errors.NotFound("channelName");
        return;
    }
    var peers = req.body.peers;
    if (utils.isEmpty(peers)) {
        throw new errors.NotFound("peers");
        return;
    }
    var orgName = req.orgName;
    if (utils.isEmpty(orgName)) {
        throw new errors.NotFound("orgName");
        return;
    }
    // on process exit, always disconnect the event hub
    var closeConnections = function(isSuccess) {
        if (isSuccess) {
            logger.debug('\n============ Join Channel is SUCCESS ============\n');
        } else {
            logger.debug('\n!!!!!!!! ERROR: Join Channel FAILED !!!!!!!!\n');
        }
        logger.debug('');
        for (var key in allEventhubs) {
            var eventhub = allEventhubs[key];
            if (eventhub && eventhub.isconnected()) {
                //logger.debug('Disconnecting the event hub');
                eventhub.disconnect();
            }
        }
    };
    //logger.debug('\n============ Join Channel ============\n')
    logger.info(util.format(
        'Calling peers in organization "%s" to join the channel', orgName));

    var client = helper.getClientForOrg(orgName);
    var channel = helper.getChannelForOrg(orgName);
    var eventhubs = [];
    return helper.getOrgAdmin(orgName).then((admin) => {
        logger.info(util.format('received member object for admin of the organization "%s": ', orgName));
        tx_id = client.newTransactionID();
        let request = {
            txId: tx_id
        };

        return channel.getGenesisBlock(request);
    }).then((genesis_block) => {
        tx_id = client.newTransactionID();
        var request = {
            targets: helper.newPeers(peers),
            txId: tx_id,
            block: genesis_block
        };

        for (let key in ORGS[orgName]) {
            if (ORGS[orgName].hasOwnProperty(key)) {
                if (key.indexOf('peer') === 0) {
                    let eh = client.newEventHub();

                    if (config.enableTLS) {
                        let data = fs.readFileSync(path.join(__dirname, ORGS[orgName][key][
                            'tls_cacerts'
                            ]));
                        eh.setPeerAddr(ORGS[orgName][key].events, {
                            pem: Buffer.from(data).toString(),
                            'ssl-target-name-override': ORGS[orgName][key]['server-hostname']
                        });
                    } else {
                        eh.setPeerAddr(ORGS[orgName][key].events);
                    }

                    eh.connect();
                    eventhubs.push(eh);
                    allEventhubs.push(eh);
                }
            }
        }

        var eventPromises = [];
        eventhubs.forEach((eh) => {
            let txPromise = new Promise((resolve, reject) => {
                let handle = setTimeout(reject, parseInt(config.eventWaitTime));
                eh.registerBlockEvent((block) => {
                    clearTimeout(handle);
                    // in real-world situations, a peer may have more than one channels so
                    // we must check that this block came from the channel we asked the peer to join
                    if (block.data.data.length === 1) {
                        // Config block must only contain one transaction
                        var channel_header = block.data.data[0].payload.header.channel_header;
                        if (channel_header.channel_id === channelName) {
                            resolve();
                        } else {
                            reject();
                        }
                    }
                }, (err) => {
                    reject(err);
                });
            });
            eventPromises.push(txPromise);
        });
        let sendPromise = channel.joinChannel(request);
        return Promise.all([sendPromise].concat(eventPromises));
    }, (err) => {
        logger.error('Failed to enroll user \'' + 'admin' + '\' due to error: ' +
        err.stack ? err.stack : err);
        throw new Error('Failed to enroll user \'' + 'admin' +
        '\' due to error: ' + err.stack ? err.stack : err);
    }).catch(err => {
        return err;
    }).then((results) => {
        logger.debug(util.format('Join Channel R E S P O N S E : %j', results));
        if (results && results[0] && results[0][0] && results[0][0].response && results[0][0]
                .response.status == 200) {
            logger.info(util.format(
                'Successfully joined peers in organization %s to the channel \'%s\'',
                orgName, channelName));
            closeConnections(true);
            // let response = {
            //     success: true,
            //     message: util.format(
            //         'Successfully joined peers in organization %s to the channel \'%s\'',
            //         orgName, channelName)
            // };
            return res.json(utils.getResponse(util.format(
                'Successfully joined peers in organization %s to the channel \'%s\'',
                orgName, channelName)));
        } else {
            logger.error(' Failed to join channel');
            closeConnections();
            return res.json(utils.getErrorMsg("Failed to join channel"))
        }
    }, (err) => {
        logger.error('Failed to join channel due to error: ' + err.stack ? err.stack :
            err);
        closeConnections();
        return res.json(utils.getErrorMsg("Failed to join channel"));
    });
};
exports.joinChannel = joinChannel;