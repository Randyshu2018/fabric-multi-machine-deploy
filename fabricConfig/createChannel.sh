#!/usr/bin/env bash
#CREATE CHANNEL NEED Consortium MEMBER ADMIN RIGHT
export FABRIC_CFG_PATH=/etc/hyperledger/fabric

export CHANNEL_NAME=mychannel


export CORE_PEER_LOCALMSPID=Org1MSP #所属组织MSP的ID

export CORE_PEER_MSPCONFIGPATH=/etc/hyperledger/fabric/artifacts/channel/crypto-config/peerOrganizations/org1.example.com/users/Admin@org1.example.com/msp  #msp文件所在的相对路径


peer channel create \
-o orderer.example.com:7050 \
-c ${CHANNEL_NAME} \
-f /etc/hyperledger/fabric/artifacts/channel/mychannel.tx