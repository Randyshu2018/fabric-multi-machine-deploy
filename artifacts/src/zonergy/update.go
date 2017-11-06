package main

import (
	"github.com/hyperledger/fabric/core/chaincode/shim"
	pb "github.com/hyperledger/fabric/protos/peer"
)

func (t *PeopleChainCode) update(stub shim.ChaincodeStubInterface, args []string) pb.Response {
	//输入参数校验
	if len(args) != 3 {
		return shim.Error("输入参数数量应=3！")
	}

	var tableName string = args[0] //表名
	var id string = args[1]        //数据表简单主键
	var argStr string = args[2]    //json字符串
	bytes := []byte(argStr)        //存入链中的内容
	var err error

	//拼接为复合主键
	//key = tableName + "-" + id
	compositeKey, _ := stub.CreateCompositeKey(tableName, []string{id})

	byteTmp, err2 := stub.GetState(compositeKey)
	if err2 != nil {
		return shim.Error("{\"Error\":\"Failed to get state for " + compositeKey + "\"}")
	}
	if byteTmp != nil {
		return shim.Error("{\"Error\":\"data has exist\"}")
	}
	//将json数据写入区块链
	err = stub.PutState(compositeKey, bytes)
	if err != nil {
		return shim.Error(err.Error())
	}

	return shim.Success(nil)

}
