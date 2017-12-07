package main

import "github.com/hyperledger/fabric/core/chaincode/shim"
import (
	pb "github.com/hyperledger/fabric/protos/peer"
	"fmt"
	"encoding/json"
)

/**
 * 订单
 */
type Order struct {
	orderNo     string  //订单编号
	createDate  string  //下单日期
	productName string  //产品名称
	brand       string  //产品品牌
	price       float64 //单价
	amount      float64 //数量
	unit        string  //计量单位
	total       float64 //总价
	payDate     string  //付款时间
	payStatus   int64   //付款状态

	shipDate   string  //发货时间
	shipAmount float64 //发货数量
	batchNo    string  //批次号

	receiveDate    string  //收货时间
	receivedAmount float64 //实际收货数量

	buyerName string //买家名称
	category  string //产品种类
}

func (t *PeopleChainCode) order(stub shim.ChaincodeStubInterface, args []string) pb.Response {
	if len(args) == 0 {
		return shim.Error("参数不能为空")
	}
	var role Role
	var order Order           //订单
	var data string = args[0] //json数据结构
	var bytes = []byte(data)  //转换为byte数组
	var err error             //定义错误对象

	//解码数据
	err = json.Unmarshal(bytes, &order)
	if err != nil {
		return shim.Error("Parse Error" + err.Error())
	}
	//验证数据的合法性
	if len(order.buyerName) == 0 {
		return shim.Error("BuyerName Can't Be Empty")
	}

	if len(role.Password) == 0 {
		return shim.Error("Password Can't Be Empty")
	}
	if role.Type != 1 && role.Type != 2 && role.Type != 3 && role.Type != 4 {
		return shim.Error("Type Must Be One Of '1,2,3,4'")
	}
	compositeKey, _ := stub.CreateCompositeKey("role", []string{role.UserName})
	fmt.Printf("compositeKey = %s", compositeKey)
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
