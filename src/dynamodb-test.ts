import { ListTablesCommand } from "@aws-sdk/client-dynamodb";
import { ddbClient } from "./dynamodb-client";

(async () => {
  const command = new ListTablesCommand({});
  try {
    const results = await ddbClient.send(command);
    console.log(results.TableNames?.join("/n"));
  } catch (err) {
    console.error(err);
  }
})();
