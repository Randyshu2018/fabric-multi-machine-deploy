let helper = require('./helper');
let utils = require('./utils');

var stompServer = require('../websocketserver').stomp();

exports.registerBlockEvent = function (req, res) {
    helper.getOrgAdmin("org1").then(admin => {
        let client = helper.getClientForOrg("org1");
        let eh = client.newEventHub();
        eh.setPeerAddr("grpc://localhost:7053");
        let block_registration_number = eh.registerBlockEvent(
            (block) => {
                var first_tx = block.data.data[0]; // get the first transaction
                var header = first_tx.payload.header; // the "header" object contains metadata of the transaction
                var channel_id = header.channel_header.channel_id;
                // if ("mychannel" !== channel_id) return;
                console.log("reveived a block .........");
                // do useful processing of the block
                stompServer.send('/test', {}, 'received a block');
            },
            (err) => {
                console.log('Oh snap!');
            }
        );
        eh.connect();
        res.json(utils.getResponse("register block listener successfully!", 200, block_registration_number));
    })

};

