/**
 * Copyright 2017 IBM All Rights Reserved.
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *    http://www.apache.org/licenses/LICENSE-2.0
 *
 *  Unless required by applicable law or agreed to in writing, software
 *  distributed under the License is distributed on an "AS IS" BASIS,
 *  WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 *  See the License for the specific language governing permissions and
 *  limitations under the License.
 */
'use strict';
var util = require('util');
let utils = require('./utils');
let errors = require('./errors');
var helper = require('./helper.js');
var logger = helper.getLogger('invoke-chaincode');

var invokeChaincode = function (peersUrls, channelName, chaincodeName, functionName, data, username, org, tableName) {
    // peersUrls, channelName, chaincodeName, fcn, args, username, org
    if (utils.isEmpty(peersUrls)) {
        throw new errors.NotFound("peersUrls");
        return;
    }
    if (utils.isEmpty(channelName)) {
        throw new errors.NotFound('channelName');
        return;
    }
    if (utils.isEmpty(chaincodeName)) {
        throw new errors.NotFound('chaincodeName');
        return;
    }
    if (utils.isEmpty(functionName)) {
        throw new errors.NotFound('functionName')
        return;
    }
    if (utils.isEmpty(data)) {
        throw new errors.NotFound('data')
        return;
    }
    let id;
    try {
        id = JSON.parse(JSON.stringify(data)).id;
        var jsonObject = {
            "Table": tableName,
            "Key": id.toString(),
            "Data": data,
            "Timestamp": Math.round(new Date().getTime() / 1000)
        };

        var args = [];
        args[2] = JSON.stringify(jsonObject);
        args[1] = id.toString();
        args[0] = tableName;
        logger.info(args);

    } catch (e) {
        throw new Error("data is not a json or data.id is not specify")
    }


	var client = helper.getClientForOrg(org);
	var channel = helper.getChannelForOrg(org);
	var targets = helper.newPeers(peersUrls);
	var tx_id = null;

	return helper.getRegisteredUsers(username, org).then((user) => {
		tx_id = client.newTransactionID();
		logger.debug(util.format('Sending transaction "%j"', tx_id));
		// send proposal to endorser
		console.log(JSON.stringify(args));
		var request = {
			targets: targets,
			chaincodeId: chaincodeName,
            fcn: functionName,
			args: args,
			chainId: channelName,
			txId: tx_id
		};
		return channel.sendTransactionProposal(request);
	}, (err) => {
		logger.error('Failed to enroll user \'' + username + '\'. ' + err);
		throw new Error('Failed to enroll user \'' + username + '\'. ' + err);
	}).then((results) => {
		var proposalResponses = results[0];
		var proposal = results[1];
		var all_good = true;
		for (var i in proposalResponses) {
			let one_good = false;
			if (proposalResponses && proposalResponses[0].response &&
				proposalResponses[0].response.status === 200) {
				one_good = true;
				logger.info('transaction proposal was good');
			} else {
				logger.error('transaction proposal was bad');
			}
			all_good = all_good & one_good;
		}
		if (all_good) {
			logger.debug(util.format(
				'Successfully sent Proposal and received ProposalResponse: Status - %s, message - "%s", metadata - "%s", endorsement signature: %s',
				proposalResponses[0].response.status, proposalResponses[0].response.message,
				proposalResponses[0].response.payload, proposalResponses[0].endorsement
				.signature));
			var request = {
				proposalResponses: proposalResponses,
				proposal: proposal
			};
			// set the transaction listener and set a timeout of 30sec
			// if the transaction did not get committed within the timeout period,
			// fail the test
			var transactionID = tx_id.getTransactionID();
			var eventPromises = [];

			var eventhubs = helper.newEventHubs(peersUrls, org);
			for (let key in eventhubs) {
				let eh = eventhubs[key];
				eh.connect();

				let txPromise = new Promise((resolve, reject) => {
					let handle = setTimeout(() => {
						eh.disconnect();
						reject();
					}, 30000);

					eh.registerTxEvent(transactionID, (tx, code) => {
						clearTimeout(handle);
						eh.unregisterTxEvent(transactionID);
						eh.disconnect();

						if (code !== 'VALID') {
							logger.error(
								'The balance transfer transaction was invalid, code = ' + code);
							reject();
						} else {
							logger.info(
								'The balance transfer transaction has been committed on peer ' +
								eh._ep._endpoint.addr);
							resolve();
						}
					});
				});
				eventPromises.push(txPromise);
			};
			var sendPromise = channel.sendTransaction(request);
			return Promise.all([sendPromise].concat(eventPromises)).then((results) => {
				logger.debug(' event promise all complete and testing complete');
				return results[0]; // the first returned value is from the 'sendPromise' which is from the 'sendTransaction()' call
			}).catch((err) => {
				logger.error(
					'Failed to send transaction and get notifications within the timeout period.'
				);
				return 'Failed to send transaction and get notifications within the timeout period.';
			});
		} else {
			logger.error(
				'Failed to send Proposal or receive valid response. Response null or status is not 200. exiting...'
			);
			return 'Failed to send Proposal or receive valid response. Response null or status is not 200. exiting...';
		}
	}, (err) => {
		logger.error('Failed to send proposal due to error: ' + err.stack ? err.stack :
			err);
		return 'Failed to send proposal due to error: ' + err.stack ? err.stack :
			err;
	}).then((response) => {
		if (response.status === 'SUCCESS') {
			logger.info('Successfully sent transaction to the orderer.');
            return utils.getResponse('Invoke successfully', 200, tx_id.getTransactionID());
		} else {
			logger.error('Failed to order the transaction. Error code: ' + response.status);
            return utils.getErrorMsg('Failed to order the transaction. Error code: ' + response.status);
		}
	}, (err) => {
		logger.error('Failed to send transaction due to error: ' + err.stack ? err
			.stack : err);
        return utils.getErrorMsg('Failed to send transaction due to error: ' + err.stack);
	});
};

module.exports.invokeChaincode = function (req, res) {
    let channelName = req.body.channelName;
    let chaincodeName = req.body.chaincodeName;
    let peersUrls = req.body.peersUrls;
    let functionName = req.body.functionName;
    let tableName = req.body.tableName || "default-table";
    let data = req.body.data;
    let username = req.userName;
    let orgName = req.orgName;
    invokeChaincode(peersUrls, channelName, chaincodeName, functionName, data, username, orgName, tableName).then(message => {
        return res.json(message);
    }).catch(err => {
        return res.json(err);
    })
}

