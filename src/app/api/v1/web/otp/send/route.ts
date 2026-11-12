import { handle, readJson } from "@/lib/server/handler";
import { sendOtp } from "@/lib/server/mock-backend";

export async function POST(req: Request) {
  return handle(async () => sendOtp(await readJson(req)));
}
