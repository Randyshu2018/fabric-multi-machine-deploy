#!/usr/bin/env bash

#创建business network card
./create-business-network-card.sh
#导入business network card
./import-business-network-card.sh
#安装hypelredger runtime
./install-hyperledger-runtime.sh
#请求身份证书
./request-identity.sh
#初始化hyperledger runtime
./start-business-network.sh
#创建可访问chaincode的business network card
./create-access-business-network-card.sh
#导入可访问的business network card
./import-user-business-network-card.sh