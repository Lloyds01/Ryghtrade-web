import { handle, readJson } from "@/lib/server/handler";
import { verifyOtp } from "@/lib/server/mock-backend";

export async function POST(req: Request) {
  return handle(async () => verifyOtp(await readJson(req)));
}
