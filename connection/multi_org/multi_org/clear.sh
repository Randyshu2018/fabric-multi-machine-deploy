#!/usr/bin/env bash

#delete business network cards
composer card delete -n PeerAdmin@byfn-network-org1

composer card delete -n PeerAdmin@byfn-network-org1-only

composer card delete -n PeerAdmin@byfn-network-org2

composer card delete -n PeerAdmin@byfn-network-org2-only

#remove card material
rm -rf *.card

#remove identity
rm -rf alice
rm -rf bob