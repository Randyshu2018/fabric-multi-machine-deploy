#!/usr/bin/env bash
#CREATE CHANNEL NEED Consortium MEMBER ADMIN RIGHT
export FABRIC_CFG_PATH=/etc/hyperledger/fabric

export CHANNEL_NAME=mychannel

export CORE_PEER_LOGGINGLEVEL=DEBUG #输出日志级别

export CORE_PEER_LOCALMSPID=Org1MSP #所属组织MSP的ID

export CORE_PEER_TLS_ENABLED=false

export FABRIC_CFG_PATH=/etc/hyperledger/fabric
export CORE_PEER_LOGGINGLEVEL=DEBUG #输出日志级别
export CORE_PEER_ID=peer0.org1.example.com #peer的ID
export CORE_PEER_ADDRESS=peer0.org1.example.com:7051 #服务地址
export CORE_PEER_GOSSIP_USELEADERELECTION=true #是否自动选举代表节点
export CORE_PEER_GOSSIP_ORGLEADER=false #是否作为组织代表节点从Ordering服务拉取区块
export CORE_PEER_LOCALMSPID=Org1MSP #所属组织MSP的ID
export CORE_PEER_MSPCONFIGPATH=/etc/hyperledger/fabric/artifacts/channel/crypto-config/peerOrganizations/org1.example.com/peers/peer0.org1.example.com/msp  #msp文件所在的相对路径
export CORE_VM_ENDPOINT=unix:///var/run/docker.sock #Docker服务地址
export CORE_VM_DOCKER_HOSTCONFIG_NETWORKMODE=host #链码容器使用的网络模式

export CORE_PEER_TLS_ENABLE=false #是否允许TLS
export CORE_PEER_TLS_CERT_FILE=/etc/hyperledger/fabric/artifacts/channel/crypto-config/peerOrganizations/org1.example.com/peers/peer0.org1.example.com/tls/server.key #TLS开启时指定的签名私钥
export CORE_PEER_TLS_KEY_FILE=/etc/hyperledger/fabric/artifacts/channel/crypto-config/peerOrganizations/org1.example.com/peers/peer0.org1.example.com/tls/server.crt #TLS开启时指定身份证书位置
export CORE_PEER_TLS_ROOTCERT=[/etc/hyperledger/fabric/artifacts/channel/crypto-config/peerOrganizations/org1.example.com/peers/peer0.org1.example.com/tls/ca.crt]      #TLS开启时指定信任的跟CA证书位置


export CORE_PEER_MSPCONFIGPATH=/etc/hyperledger/fabric/artifacts/channel/crypto-config/peerOrganizations/org1.example.com/users/Admin@org1.example.com/msp  #msp文件所在的相对路径

peer chaincode invoke \
-o 127.0.0.1:7050 \
-C mychannel \
-n zonergy \
-c '{"Args":["update","2","randy","111"]}'

#--cafile /etc/hyperledger/fabric/artifacts/channel/crypto-config/ordererOrganizations/example.com/orderers/orderer.example.com/msp/tlscacerts/tlsca.example.com-cert.pem

