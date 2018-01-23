#!/bin/bash

jq --version > /dev/null 2>&1
if [ $? -ne 0 ]; then
	echo "Please Install 'jq' https://stedolan.github.io/jq/ to execute this script"
	echo
	exit 1
fi
starttime=$(date +%s)

echo "POST request Enroll on Org1  ..."
echo
ORG1_TOKEN=$(curl -s -X POST \
  http://localhost:4000/users \
  -H "content-type: application/x-www-form-urlencoded" \
  -d 'userName=Jim&orgName=org1')
echo $ORG1_TOKEN
ORG1_TOKEN=$(echo $ORG1_TOKEN | jq ".data" | sed "s/\"//g")
echo
echo "ORG1 token is $ORG1_TOKEN"
echo



echo "POST Install chaincode on Org2"
echo
curl -s -X POST \
  http://localhost:4000/installChaincode \
  -H "authorization: Bearer $ORG1_TOKEN" \
  -H "content-type: application/json" \
  -d '{
	"peers": ["localhost:7051"],
	"chaincodeName":"marbles02",
	"chaincodePath":"marbles02",
	"chaincodeVersion":"v0"
}'
echo
echo


echo "POST instantiate chaincode on peer of Org1"
echo
curl -s -X POST \
  http://localhost:4000/instantiateChaincode \
  -H "authorization: Bearer $ORG1_TOKEN" \
  -H "content-type: application/json" \
  -d '{
	"chaincodeName":"marbles02",
	"chaincodeVersion":"v0",
	"functionName":"init",
	"args":[]
}'
echo
echo


echo "Total execution time : $(($(date +%s)-starttime)) secs ..."
