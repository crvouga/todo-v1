import * as dotenv from "dotenv";
import path from "path";
import { Db, MongoClient } from "mongodb";

export const getMongoDbClient = async (
  impl: "durable" | "in-memory"
): Promise<Db> => {
  switch (impl) {
    case "durable":
      return getMongoDbClientDurable();
    case "in-memory":
      return getMongoDbClientInMemory();
  }
};

const getMongoDbClientInMemory = async (): Promise<Db> => {
  const client = new MongoClient("mongodb://localhost:27017");
  await client.connect();
  const db = client.db("todo");
  return db;
};

const getMongoDbClientDurable = (): Db => {
  const envPath = path.resolve(__dirname, "..", "..", ".env");
  dotenv.config({ path: envPath });

  const MONGOHOST = process.env["MONGOHOST"];
  const MONGOPASSWORD = process.env["MONGOPASSWORD"];
  const MONGOPORT = process.env["MONGOPORT"];
  const MONGOUSER = process.env["MONGOUSER"];
  const MONGO_URL = process.env["MONGO_URL"];

  if (!MONGOHOST || !MONGOPASSWORD || !MONGOPORT || !MONGOUSER || !MONGO_URL) {
    throw new Error(`missing mongodb env var: ${envPath}`);
  }

  const productionURI = `mongodb://${MONGOUSER}:${MONGOPASSWORD}@${MONGOHOST}:${MONGOPORT}`;

  const productionMongodbClient = new MongoClient(productionURI);

  productionMongodbClient
    .connect()
    .then(() => {
      console.log("connected to production mongodb");
    })
    .catch(() => {
      console.log("failed to connect to production mongodb");
    });

  const productionDb = productionMongodbClient.db("todo");
  return productionDb;
};
