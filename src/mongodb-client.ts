import * as dotenv from "dotenv";
import path from "path";
const envPath = path.resolve(__dirname, "..", ".env");
dotenv.config({ path: envPath });
import { MongoClient } from "mongodb";

const MONGOHOST = process.env["MONGOHOST"];
const MONGOPASSWORD = process.env["MONGOPASSWORD"];
const MONGOPORT = process.env["MONGOPORT"];
const MONGOUSER = process.env["MONGOUSER"];
const MONGO_URL = process.env["MONGO_URL"];

if (!MONGOHOST || !MONGOPASSWORD || !MONGOPORT || !MONGOUSER || !MONGO_URL) {
  throw new Error(`missing mongodb env var: ${envPath}`);
}

const productionURI = `mongodb://${MONGOUSER}:${MONGOPASSWORD}@${MONGOHOST}:${MONGOPORT}`;

const mongodbClient = new MongoClient(productionURI);

export const productionDb = mongodbClient.db("todo");
