import { bearerToken, handle } from "@/lib/server/handler";
import { getAccountOptions } from "@/lib/server/mock-backend";

export async function GET(req: Request) {
  return handle(() => getAccountOptions(bearerToken(req)));
}
