import { getCattle } from "./routes/cattle";
import { login, register } from "./routes/auth";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Methods":
    "GET, POST, PUT, DELETE, OPTIONS",
  "Access-Control-Allow-Headers":
    "Content-Type, Authorization",
};

const server = Bun.serve({
  port: 3000,

  async fetch(req) {
    const url = new URL(req.url);

    // CORS preflight
    if (req.method === "OPTIONS") {
      return new Response(null, {
        status: 204,
        headers: corsHeaders,
      });
    }

    // =========================
    // AUTH
    // =========================

    // POST /api/auth/register
    if (
      req.method === "POST" &&
      url.pathname === "/api/auth/register"
    ) {
      const response = await register(req);

      // Add CORS headers
      Object.entries(corsHeaders).forEach(
        ([key, value]) => {
          response.headers.set(key, value);
        },
      );

      return response;
    }

    // POST /api/auth/login
    if (
      req.method === "POST" &&
      url.pathname === "/api/auth/login"
    ) {
      const response = await login(req);

      // Add CORS headers
      Object.entries(corsHeaders).forEach(
        ([key, value]) => {
          response.headers.set(key, value);
        },
      );

      return response;
    }

    // =========================
    // CATTLE
    // =========================

    // GET /api/cattle
    if (
      req.method === "GET" &&
      url.pathname === "/api/cattle"
    ) {
      try {
        const cattle = await getCattle();

        return Response.json(cattle, {
          headers: corsHeaders,
        });
      } catch (error) {
        console.error(
          "Failed to fetch cattle:",
          error,
        );

        return Response.json(
          {
            error: "Failed to fetch cattle",
          },
          {
            status: 500,
            headers: corsHeaders,
          },
        );
      }
    }

    // =========================
    // NOT FOUND
    // =========================

    return Response.json(
      {
        error: "Route not found",
      },
      {
        status: 404,
        headers: corsHeaders,
      },
    );
  },
});

console.log(
  `🚀 ResiduGuard backend running at http://localhost:${server.port}`,
);