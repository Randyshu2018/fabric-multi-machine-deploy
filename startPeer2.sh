#!/bin/bash
#
# Copyright IBM Corp. All Rights Reserved.
#
# SPDX-License-Identifier: Apache-2.0
#


function startPeer2() {
	echo

        #teardown the network and clean the containers and intermediate images
	cd artifacts

	#Cleanup the material
	rm -rf /tmp/hfc-test-kvs_peerOrg* $HOME/.hfc-key-store/ /tmp/fabric-client-kvs_peerOrg*

	#Start the network
	docker-compose -f docker-compose-peer2-couchdb.yaml up -d
	cd -
	echo
}

startPeer2
