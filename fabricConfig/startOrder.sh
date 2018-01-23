#!/usr/bin/env bash
#export FABRIC_CFG_PATH=/etc/hyperledger/fabric
export ORDERER_GENERAL_LOGLEVEL=DEBUG #输出日志级别
export ORDERER_GENERAL_LISTENADDRESS=0.0.0.0 #服务监听地址
export ORDERER_GENERAL_LISTENPORT=7050 #服务监听端口
export ORDERER_GENERAL_GENESISMETHOD=file #初始区块的提供方式
export ORDERER_GENERAL_GENESISFILE=/etc/hyperledger/fabric/artifacts/channel/genesis.block #初始区块文件路径
export ORDERER_GENERAL_LOCALMSPID=OrdererMSP #MSP的Id
export ORDERER_GENERAL_LOCALMSPDIR=/etc/hyperledger/fabric/artifacts/channel/crypto-config/ordererOrganizations/example.com/orderers/orderer.example.com/msp/ #MSP文件路径
export ORDERER_GENERAL_LEDGERTYPE=file #账本类型
export ORDERER_GENERAL_BATCH_TIMEOUT=10s #出块最大间隔时间
export ORDERER_GENERAL_MAXMESSAGECOUNT=10 #一个块中包含的最大交易数
export ORDERER_GENERAL_TLS_ENABLE=false #是否允许TLS
export ORDERER_GENERAL_TLS_PRIVATEKEY=/etc/hyperledger/fabric/artifacts/channel/crypto-config/ordererOrganizations/example.com/orderers/orderer.example.com/tls/server.key #TLS开启时指定的签名私钥
export ORDERER_GENERAL_TLS_CERTIFICATE=/etc/hyperledger/fabric/artifacts/channel/crypto-config/ordererOrganizations/example.com/orderers/orderer.example.com/tls/server.crt #TLS开启时指定身份证书位置
export ORDERER_GENERAL_TLS_ROOTCAS=[/etc/hyperledger/fabric/artifacts/channel/crypto-config/ordererOrganizations/example.com/orderers/orderer.example.com/tls/ca.crt]      #TLS开启时指定信任的跟CA证书位置
env
orderer start