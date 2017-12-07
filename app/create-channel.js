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
var fs = require('fs');
var path = require('path');
var helper = require('./helper.js');
var logger = helper.getLogger('Create-Channel');

var utils = require('./utils');
var errors = require('./errors');


/**
 * Attempt to send a request to the orderer with the sendCreateChain method
 */
module.exports.createChannel = function (req, res) {
    logger.debug('\n====== Creating Channel ======\n');
    var channelName = req.body.channelName;
    if (utils.isEmpty(channelName)) {
        throw new errors.NotFound("channelName");
        return;
    }

    var channelConfigPath = req.body.channelConfigPath;
    if (utils.isEmpty(channelConfigPath)) {
        throw new errors.NotFound("channelConfigPath");
    }

    var orgName = req.orgName;
    if (utils.isEmpty(orgName)) {
        throw new errors.NotFound("orgName");
    }

    var client = helper.getClientForOrg(orgName);
	var channel = helper.getChannelForOrg(orgName);

	// read in the envelope for the channel config raw bytes
	var envelope = fs.readFileSync(path.join(__dirname, channelConfigPath));
	// extract the channel config bytes from the envelope to be signed
	var channelConfig = client.extractChannelConfig(envelope);

	//Acting as a client in the given organization provided with "orgName" param
	return helper.getOrgAdmin(orgName).then((admin) => {
        logger.debug(util.format('Successfully acquired admin user for the organization "%s"', orgName));
        // sign the channel config bytes as "endorsement", this is required by
        // the orderer's channel creation policy
        let signature = client.signChannelConfig(channelConfig);

        let request = {
            config: channelConfig,
            signatures: [signature],
            name: channelName,
            orderer: channel.getOrderers()[0],
            txId: client.newTransactionID()
        };

        // send to orderer
        return client.createChannel(request);
    }).catch(function (err) {
        logger.error('Failed to initialize the channel: ' + err.stack ? err.stack : err);
        return utils.getResponse('Failed to initialize the channel: ' + err.stack ? err.stack : err, 500);
	}).then((response) => {
		logger.debug(' response ::%j', response);
		if (response && response.status === 'SUCCESS') {
			logger.debug('Successfully created the channel.');
            return res.json(utils.getResponse('Channel \'' + channelName + '\' created Successfully'));
		} else {
            logger.error('\n!!!!!!!!! Failed to create the channel \'' + channelName + '\' !!!!!!!!!\n\n');
            return res.json(utils.getErrorMsg('Failed to create the channel \'' + channelName + '\''));
        }
    }).catch(function (err) {
        logger.error('Failed to initialize the channel: ' + err.stack ? err.stack : err);
        return res.json(utils.getErrorMsg('Failed to create the channel \'' + channelName + '\''));
    })
};

