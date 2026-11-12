import { bearerToken, handle, readJson } from "@/lib/server/handler";
import { applyForLoan } from "@/lib/server/mock-backend";

export async function POST(req: Request) {
  return handle(async () => applyForLoan(bearerToken(req), await readJson(req)), 201);
}
