package main

import (
	"github.com/hyperledger/fabric/core/chaincode/shim"
	pb "github.com/hyperledger/fabric/protos/peer"
	"encoding/json"
)

/**
 * 用户角色
 */
type Role struct {
	ID       string //ID
	UserName string //用户名
	Password string //密码
	Phone    string //手机号
	Type     int64  //类型 1：admin,2：农场,3：加工商，4：经销商
}

/**
 * 用户注册
 */
func (t *PeopleChainCode) register(stub shim.ChaincodeStubInterface, args []string) pb.Response {
	if len(args) == 0 {
		return shim.Error("参数不能为空")
	}
	var role Role             //角色
	var data string = args[0] //json数据结构
	var bytes = []byte(data)  //转换为byte数组
	var err error             //定义错误对象

	//解码数据
	err = json.Unmarshal(bytes, &role)
	if err != nil {
		return shim.Error("Parse Error" + err.Error())
	}
	//验证数据的合法性
	if len(role.UserName) == 0 {
		return shim.Error("UserName Can't Be Empty")
	}
	if len(role.Password) == 0 {
		return shim.Error("Password Can't Be Empty")
	}
	if role.Type != 1 && role.Type != 2 && role.Type != 3 && role.Type != 4 {
		return shim.Error("Type Must Be One Of '1,2,3,4'")
	}
	compositeKey, _ := stub.CreateCompositeKey("role", []string{role.UserName})
	//验证用户名是否存在
	bytes, err = stub.GetState(compositeKey)
	if err != nil {
		return shim.Error("Get State Error For Key " + compositeKey)
	}
	if bytes != nil {
		return shim.Error("UserName " + role.UserName + " Has exist")
	}
	err = stub.PutState(compositeKey, []byte(data))
	if err != nil {
		return shim.Error("Put State Error For key " + compositeKey)
	}
	return shim.Success(nil)
}

/**
 * 登录
 */
func (t *PeopleChainCode) login(stub shim.ChaincodeStubInterface, args []string) pb.Response {
	if len(args) == 0 {
		return shim.Error("参数不能为空")
	}

	var role Role
	var data string = args[0] //json数据结构
	var bytes = []byte(data)
	var err error
	var m map[string]string

	err = json.Unmarshal(bytes, &m)
	if err != nil {
		return shim.Error("Parse Error " + err.Error())
	}
	var userName = m["UserName"]
	var password = m["Password"]
	//验证数据的合法性
	if len(userName) == 0 {
		return shim.Error("UserName Can't Be Empty")
	}
	if len(password) == 0 {
		return shim.Error("Password Can't Be Empty")
	}
	//验证用户是否存在
	compositeKey, _ := stub.CreateCompositeKey("role", []string{userName})

	bytes, err = stub.GetState(compositeKey)
	if err != nil {
		return shim.Error("Get State Error For Key " + compositeKey)
	}
	if bytes == nil {
		return shim.Error("UserName Is Not Exist")
	}
	err = json.Unmarshal(bytes, &role)
	if err != nil {
		return shim.Error("Parse Error")
	}
	//验证密码的正确性
	if password != role.Password {
		return shim.Error("Password Is Not Matched")
	}
	return shim.Success(nil)
}
