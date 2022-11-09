import { DynamoDBClient } from "@aws-sdk/client-dynamodb";
import * as dotenv from "dotenv";
dotenv.config();

const REGION = "us-west-1";

const accessKeyId = process.env["AWS_ACCESS_KEY_ID"];
const secretAccessKey = process.env["AWS_SECRET_ACCESS_KEY"];

if (!accessKeyId) {
  throw new Error(".env missing value");
}

if (!secretAccessKey) {
  throw new Error(".env missing value");
}

export const ddbClient = new DynamoDBClient({
  region: REGION,
  credentials: {
    accessKeyId,
    secretAccessKey,
  },
});
