import { apiOk, requireApiUser } from "@/lib/api-route";

export async function GET() {
  const user = await requireApiUser();
  if (user instanceof Response) {
    return user;
  }

  return apiOk(user);
}
