'use strict';
let utils = require('./utils');
let errors = require('./errors');
let helper = require('./helper');
let logger = helper.getLogger('api');

let default_msg = "Query successfully!";

let channels = function (req, res) {
    logger.debug('================ GET CHANNELLIST ======================');
    var channels = helper.getAllChannels();
    var channelList = [];
    for (let org in channels) {
        var channel = channels[org];
        var jsonObj = {};
        jsonObj.name = channel._name;
        channelList.push(jsonObj);
    }
    res.json(utils.getResponse(default_msg, 200, channelList));
}


let peers = function (req, res) {
    logger.debug('================ GET PEERS ======================');

    var channelName = req.body.channelName;
    if (utils.isEmpty(channelName)) {
        throw new errors.NotFound("channelName");
        return;
    }
    var channel = helper.getChannelByName(channelName);
    if (!channel) {
        throw new errors.NotFound("channel for name " + channelName);
        return;
    }
    var peers = [];

    for (let key in channel) {
        if (key.indexOf("_anchor_peers") == -1 && key.indexOf("_peers") > -1) {
            for (var i = 0; i < channel[key].length; i++) {
                if (peers.indexOf(channel[key][i]) == -1) {
                    var json = {};
                    json.name = channel[key][i]._options.name;
                    json.url = channel[key][i]._url;
                    peers.push(json);
                }
            }
        }
    }
    res.send(utils.getResponse(default_msg, 200, peers));
};

exports.channels = channels;
exports.peers = peers;