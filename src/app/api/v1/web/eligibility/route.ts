import { bearerToken, handle } from "@/lib/server/handler";
import { checkEligibility } from "@/lib/server/mock-backend";

export async function POST(req: Request) {
  return handle(() => checkEligibility(bearerToken(req)));
}
