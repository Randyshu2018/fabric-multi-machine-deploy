#!/bin/bash
ARCH=x86_64
BASE_IMAGE_RELEASE=0.3.1
PROJECT_VERSION=1.0.0

function buildPeer() {
cd /opt/goworkspace/src/github.com/hyperledger/fabric
LD_FLAGS="-X github.com/hyperledger/fabric/common/metadata.Version=${PROJECT_VERSION} \
          -X github.com/hyperledger/fabric/common/metadata.BaseVersion=${BASE_IMAGE_VERSION} \
          -X github.com/hyperledger/fabric/common/metadata.BaseDockerLabel=org.hyperledger.fabric \
          -X github.com/hyperledger/fabric/common/metadata.DockerNamespace=hyperledger \
          -X github.com/hyperledger/fabric/common/metadata.BaseDockerNamespace=hyperledger \"
CGO_CFLAGS = " go install -ldflags "$LD_FLAGS -linkmode external -extldflags '-static -lpthread' " \
github.com/hyperledger/fabric/peer
}

function buildCryptoTool(){
    CGO_CFLAGS=" " \
    go install -tags "" \
    -ldflags = " -X github.com/hyperledger/fabric/common/tools/cryptogen/metadata.Version=${PROJECT_VERSION}" \
    github.com/hyperledger/fabric/common/tools/cryptogen
}
buildPeer
buildCryptoTool