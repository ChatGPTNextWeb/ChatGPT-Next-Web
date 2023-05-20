import zBotServiceClient from "./ZBotServiceClient";

// 经测试, 这两个方法都是异步的
console.log("\nTest2");
var res2 = zBotServiceClient
  .getHealth()
  .then((status) => {
    console.log("status2=", status);
  })
  .catch((error) => {
    console.error("access db failed", error);
  });
console.log("res2 is:", res2);

console.log("\nTest3");
var res3 = zBotServiceClient
  .getHealthAsync()
  .then((status) => {
    console.log("status3=", status);
  })
  .catch((error) => {
    console.error("access db failed", error);
  });
console.log("res3 is:", res3);

// console.log("\nTest4");
// let res41 : any;
// var res4 = zBotServiceClient.getUserInfo(4).then((item) => { console.log("item=", item); res41 = item }).catch((error) => { console.error("access db failed", error); });
// console.log("res41 is:", res41);    // undefined since this is an async call
