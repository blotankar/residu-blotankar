import { getCattle } from "./routes/cattle";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Methods": "GET, POST, PUT, DELETE, OPTIONS",
  "Access-Control-Allow-Headers": "Content-Type, Authorization",
};

const server = Bun.serve({
  port: 3000,

  async fetch(req) {
    const url = new URL(req.url);

    // Handle browser CORS preflight requests
    if (req.method === "OPTIONS") {
      return new Response(null, {
        status: 204,
        headers: corsHeaders,
      });
    }

    // GET /api/cattle
    if (req.method === "GET" && url.pathname === "/api/cattle") {
      try {
        const cattle = await getCattle();

        return Response.json(cattle, {
          headers: corsHeaders,
        });
      } catch (error) {
        console.error("Failed to fetch cattle:", error);

        return Response.json(
          { error: "Failed to fetch cattle" },
          {
            status: 500,
            headers: corsHeaders,
          },
        );
      }
    }

    return Response.json(
      { error: "Route not found" },
      {
        status: 404,
        headers: corsHeaders,
      },
    );
  },
});

console.log(
  `ResiduGuard backend running at http://localhost:${server.port}`,
);