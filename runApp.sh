#!/bin/bash
#
# Copyright IBM Corp. All Rights Reserved.
#
# SPDX-License-Identifier: Apache-2.0
#

function dkcl(){
        CONTAINER_IDS=$(docker ps -aq)
	echo
        if [ -z "$CONTAINER_IDS" -o "$CONTAINER_IDS" = " " ]; then
                echo "========== No containers available for deletion =========="
        else
                docker rm -f $CONTAINER_IDS
        fi
	echo
}

function dkrm(){
        DOCKER_IMAGE_IDS=$(docker images | grep "dev\|none\|test-vp\|peer[0-9]-" | awk '{print $3}')
	echo
        if [ -z "$DOCKER_IMAGE_IDS" -o "$DOCKER_IMAGE_IDS" = " " ]; then
		echo "========== No images available for deletion ==========="
        else
                docker rmi -f $DOCKER_IMAGE_IDS
        fi
	echo
}

function restartNetwork() {
	echo

        #teardown the network and clean the containers and intermediate images
	cd artifacts
	docker-compose down
	dkcl
	dkrm

	#Cleanup the material
	rm -rf /tmp/hfc-test-kvs_peerOrg* $HOME/.hfc-key-store/ /tmp/fabric-client-kvs_peerOrg*

	#Start the network
	docker-compose up -d
	cd -
	echo
}

function installNodeModules() {
	echo
	if [ -d node_modules ]; then
		echo "============== node modules installed already ============="
	else
		echo "============== Installing node modules ============="
		npm install
	fi
	echo
}

function startNetwork(){
    cd artifacts

    #Start the network
	docker-compose -f docker-compose-ca.yaml up -d

	docker-compose -f docker-orderer-kafka.yaml up -d

	docker-compose -f docker-compose-peer1-couchdb.yaml up -d

	docker-compose -f docker-compose-peer2-couchdb.yaml up -d

    cd -
}

function cleanNetwork() {
	echo

	dkcl
	dkrm

	#Cleanup the material
	rm -rf /tmp/hfc-test-kvs_peerOrg* $HOME/.hfc-key-store/ /tmp/fabric-client-kvs_peerOrg*

}

#清理fabric网络
cleanNetwork
#读取TLS配置
export ENABLE_TLS=$(cat config.json | jq ".enableTLS" )
echo "ENABLE_TLS:"${ENABLE_TLS}
#清理fabric数据
rm -rf mount
#启动fabric网络
startNetwork
#安装node依赖
installNodeModules
#杀掉node进程&启动node服务
ps -e|grep node|awk '{print $1}' | xargs -n1 kill -9
nohup node server.js  > server.log 2>&1 &
sleep 5
#初始化fabric运行网络
./script/initByPost.sh

./connection/multi_org/clear.sh

#./connection/multi_org/run.sh
