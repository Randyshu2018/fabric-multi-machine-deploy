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
let utils = require('./utils');
let invoke = require('./invoke-transaction');

var invokeChaincodeBatch = function (req, res) {
    let args = req.body.args;
    let table_name = args[0];
    let jsonArr = args[1];
    var promises = [];
    let ret = [];
    let channelName = req.body.channelName;
    let chaincodeName = req.body.chaincodeName;
    let peersUrls = req.body.peersUrls;
    let functionName = req.body.functionName;
    // let args = req.body.args;
    let username = req.userName;
    let orgName = req.orgName;
    for (let i = 0; i < jsonArr.length; i++) {
        let tmpArgs = [];
        tmpArgs[0] = table_name + "";
        tmpArgs[1] = jsonArr[i].id + "";
        tmpArgs[2] = jsonArr[i] + "";
        req.body.args = tmpArgs;
        console.log("===>" + tmpArgs);
        let invokePromise = invoke.invokeChaincode(peersUrls, channelName, chaincodeName, functionName, tmpArgs, username, orgName).then(message => {
            ret.push(message);
            return;
        });
        promises.push(invokePromise);
    }
    Promise.all(promises).then(message => {
        res.json(ret);
        return;
    }).catch(err => {
        res.json(utils.getErrorMsg(err.message));
        return;
    });
};

exports.invokeChaincodeBatch = invokeChaincodeBatch;
