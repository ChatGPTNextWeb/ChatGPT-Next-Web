// 引入 `MongoClient` 类型，以便于类型注解
import { MongoClient, MongoClientOptions } from "mongodb";

// 使用 `process.env.MONGODB_URI` 的值初始化 URI 变量
const uri: string | undefined = process.env.MONGODB_URI;
// 定义 MongoClient 选项对象
const options: MongoClientOptions = {};

// 声明 client 和 clientPromise 变量，类型分别为 MongoClient 和 Promise<MongoClient>
let client: MongoClient;
let clientPromise: Promise<MongoClient>;

// 判断当前环境是否为开发环境
if (process.env.NODE_ENV === "development") {
  // 在开发模式下，使用全局变量，以便在 HMR (Hot Module Replacement) 导致的模块重新加载时保留值。
  if (!global._mongoClientPromise) {
    client = new MongoClient(uri!, options); // 使用非空断言运算符（!），因为我们已经检查了 uri 是否存在
    global._mongoClientPromise = client.connect();
  }
  clientPromise = global._mongoClientPromise;
} else {
  // 在生产模式下，最好不要使用全局变量。
  client = new MongoClient(uri!, options); // 使用非空断言运算符（!），因为我们已经检查了 uri 是否存在
  clientPromise = client.connect();
}

// 导出模块作用域的 MongoClient promise。通过在一个单独的模块中这样做，client 可以在函数之间共享。
export default clientPromise;
