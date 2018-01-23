#!/usr/bin/env bash

composer network start -c PeerAdmin@byfn-network-org1 -l DEBUG -a tutorial-network.bna -o endorsementPolicyFile=endorsement-policy.json -A alice -C alice/admin-pub.pem -A bob -C bob/admin-pub.pem
