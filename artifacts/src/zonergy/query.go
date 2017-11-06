package main

import (
	"github.com/hyperledger/fabric/core/chaincode/shim"
	pb "github.com/hyperledger/fabric/protos/peer"
)

// query callback representing the query of a chaincode
func (t *PeopleChainCode) query(stub shim.ChaincodeStubInterface, args []string) pb.Response {
	var err error

	if len(args) != 2 {
		return shim.Error("输入参数数量应=2！")
	}

	var table string = args[0] //表名
	var key string = args[1]   //主键
	var objByte []byte         //存入链中的内容

	//复合主键
	compositeKey, _ := stub.CreateCompositeKey(table, []string{key})

	objByte, err = stub.GetState(compositeKey)
	if err != nil {
		jsonResp := "{\"Error\":\"Failed to get state for " + compositeKey + "\"}"
		return shim.Error(jsonResp)
	}

	if objByte == nil {
		jsonResp := "{\"Error\":\"Nil context for " + key + "\"}"
		return shim.Error(jsonResp)
	}

	return shim.Success(objByte)
}
