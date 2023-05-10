export async function sentSms(phone: string) {
  return fetch("api/server/auth/sms", {
    //请求的服务器地址
    body: JSON.stringify({ phoneNumber: phone }), //第二种请求数据的方法json
    method: "POST", //请求方法
    headers: {
      "Content-Type": "application/json", //第二种请求头编写方式json
    },
  })
    .then((res) => res.json())
    .then((res) => {
      console.log(1111111, res);
      //
    });
}

export async function userLogin(data: {
  phoneNumber: string;
  smsCode: string;
}) {
  return fetch("api/server/auth", {
    //请求的服务器地址
    body: JSON.stringify(data), //第二种请求数据的方法json
    method: "POST", //请求方法
    headers: {
      "Content-Type": "application/json", //第二种请求头编写方式json
    },
  })
    .then((res) => res.json())
    .then((res) => {
      console.log(1111111, res);
      //
      return res;
    });
}

export async function vipPay(amount: number) {
  return fetch("api/server/recharge/wechat/native", {
    //请求的服务器地址
    body: JSON.stringify({ amount }), //第二种请求数据的方法json
    method: "POST", //请求方法
    headers: {
      "Content-Type": "application/json", //第二种请求头编写方式json
    },
  })
    .then((res) => res.json())
    .then((res) => {
      console.log(1111111, res);
      //
      return res;
    });
}

export async function getOrderStatus(orderNo: string) {
  return fetch(`api/server/recharge/payment/status?orderNo=${orderNo}`, {
    method: "GET", //请求方法
  })
    .then((res) => res.json())
    .then((res) => {
      console.log(1111111, res);
      //
      return res;
    });
}
