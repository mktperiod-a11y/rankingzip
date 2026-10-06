import { getTrends } from "../../../lib/trends-server";

export const dynamic = "force-dynamic";

export async function GET() {
  return Response.json(await getTrends(), {
    headers: { "cache-control": "public, max-age=60, s-maxage=300, stale-while-revalidate=600" },
  });
}
