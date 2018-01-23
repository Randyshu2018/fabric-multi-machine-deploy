#!/bin/bash

# Author: Randy
# Email:243093190@qq.com

# Hyperledger Fabric installation
# Hyperledger Fabric Version 1.0.0
# Date: 2018/01/19
# OS: Ubuntu 16.04 x64

# TIPS:
# 1.npm accelerate
# npm install --registry=https://registry.npm.taobao.org

# echo print with color
function echoColor()
{
	echo -e "\033[35;1m$1\033[0m"
}

# update os
function updateOS()
{
	echoColor "Updating system to newest version"

	sudo apt-get update -y --fix-missing
	sudo apt-get upgrade -y --fix-missing
	sudo apt-get autoremove -y
	sudo apt-get clean
	sudo apt-get install -f -y

	echo
}

# install docker precondition
function installPreDependence()
{
	echoColor "-----------------------------------------------------------------"
	echoColor "Start install dependency items, please wait......."

	echoColor "Start Install python and python-pip"
	apt-get install -y python
	apt-get install -y python-pip

	echoColor "Start Install git"
	apt-get install -y git

	echoColor "Start Install curl"
	apt-get install curl

	echoColor "Finish installed dependency items."
	echoColor "-----------------------------------------------------------------"
}

# install Golang-go
function installGolang()
{

    if [ -z ${GOROOT} ];then
        echo "Golang has not install yet"
    else
        go version
        return;
    fi
    echo
	echoColor "-----------------------------------------------------------------"
	echoColor "Start install Golang,please wait......."

	echo
	echoColor "Download Golang package and unpack it"
	sudo curl -O https://storage.googleapis.com/golang/go1.8.3.linux-amd64.tar.gz
	tar -xvf go1.8.3.linux-amd64.tar.gz

    echo
	echoColor "Move it to /usr/local/go"
	mv go /usr/local/go

	echoColor "Create GOPATH"
	mkdir -p /opt/goworkpace/bin
	mkdir -p /opt/goworkpace/src
	mkdir -p /opt/goworkpace/pkg

	echo
	echoColor "Set golang environment"
	echo >> /etc/profile
    echo "#set golang env" >> /etc/profile

    echo "export GOROOT=/usr/local/go" >> /etc/profile
    echo "export GOPATH=/opt/goworkspace" >> /etc/profile
    echo "export PATH=$PATH:$GOPATH/bin:$GOPATH/bin" >> /etc/profile
    source /etc/profile

	go version
	echo

	echo
	echoColor "Finish install Golang "
	echoColor "-----------------------------------------------------------------"
}

# install Node.js Runtime and NPM
function installNode()
{

    echo
	echoColor "-----------------------------------------------------------------"
	echoColor "Start install Node,please wait......."

    echo
	echoColor "Download Node package and unpack it"
	sudo curl -O https://nodejs.org/dist/v6.9.5/node-v6.9.5-linux-x64.tar.xz
    xz -d node-v6.9.5-linux-x64.tar.xz
    tar -xvf node-v6.9.5-linux-x64.tar

    echo
	echoColor "Move it to /usr/local/node"
	mv node-v6.9.5-linux-x64 /usr/local/node

	echo
	echoColor "Set node environment"
	echo >> /etc/profile
    echo "#set node env" >> /etc/profile

    echo "export PATH=$PATH:/usr/local/node/bin" >> /etc/profile
    source /etc/profile

	echoColor "Download npm"
	sudo apt-get install -y npm

	node -v

	echo
	echoColor "Finish install Node"
	echoColor "-----------------------------------------------------------------"

}


# install docker
function installDocker()
{
	echo
	echoColor "-----------------------------------------------------------------"
	echoColor "Start install docker,please wait......."

	echoColor "Install docker and start service"
	sudo apt-get install -y docker.io

    echoColor "Set accelerate registry-mirrors"
	sudo mkdir -p /etc/docker
    sudo tee /etc/docker/daemon.json <<-'EOF'
{
  "registry-mirrors": ["https://rl4uepop.mirror.aliyuncs.com"]
}
EOF
  sudo systemctl daemon-reload
  sudo systemctl restart docker

	echo
	echoColor "2.Install docker-compose(version should greater than 1.8.0)"
	sudo apt-get install -y docker-compose
	docker-compose -v

	echoColor "Finish install docker and docker-compose!"
	echoColor "-----------------------------------------------------------------"
	echo
}

function downloadFabricImages(){
  echoColor "-----------------------------------------------------------------"
  echoColor "Start download fabric images, please wait......"
  #Set ARCH variable i.e ppc64le,s390x,x86_64,i386
  ARCH=`uname -m`

  local FABRIC_TAG="${ARCH}-1.0.0"

  echo ${FABRIC_TAG}
  for IMAGES in peer orderer ca couchdb ccenv javaenv kafka tools zookeeper; do
      echo "==> FABRIC IMAGE: $IMAGES"
      echo
      docker pull hyperledger/fabric-${IMAGES}:${FABRIC_TAG}
      docker tag hyperledger/fabric-${IMAGES}:${FABRIC_TAG} hyperledger/fabric-${IMAGES}
  done
  echo "==> List out hyperledger docker images"
  docker images | grep hyperledger*
}

# Download golang tools
function downloadGolangTools()
{
	echo
	echoColor "-----------------------------------------------------------------"
	echoColor "Start download some tools for golang debug, please wait......"

	sudo go get github.com/golang/protobuf/protoc-gen-go
	sudo go get github.com/golang/lint/golint
	sudo go get github.com/kardianos/govendor
	sudo go get github.com/onsi/ginkgo/ginkgo
	sudo go get github.com/axw/gocov/...
	sudo go get github.com/client9/misspell/cmd/misspell
	sudo go get github.com/AlekSi/gocov-xm
	sudo go get golang.org/x/tools/cmd/goimports

	echoColor "Finish download."
	echoColor "-----------------------------------------------------------------"
	echo
}


echoColor " ____    _____      _      ____    _____ "
echoColor "/ ___|  |_   _|    / \    |  _ \  |_   _|"
echoColor "\___ \    | |     / _ \   | |_) |   | |  "
echoColor " ___) |   | |    / ___ \  |  _ <    | |  "
echoColor "|____/    |_|   /_/   \_\ |_| \_\   |_|  "

updateOS
installPreDependence
installGolang
installNode
installDocker
downloadFabricImages

echoColor " _____   _   _   ____   "
echoColor "| ____| | \ | | |  _ \  "
echoColor "|  _|   |  \| | | | | | "
echoColor "| |___  | |\  | | |_| | "
echoColor "|_____| |_| \_| |____/  "
