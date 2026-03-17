export default {
  async fetch(request, env, ctx) {
    const url = new URL(request.url);

    // ==========================================
    // 1. API BUAT LINK (DENGAN KUNCI RAHASIA)
    // ==========================================
    if (request.method === "POST" && url.pathname === "/api/create") {
      try {
        const body = await request.json();
        
        // --- SECURITY: KUNCI RAHASIA ADMIN ---
        // Ganti 'kunci-rahasia-bawok-123' dengan password admin pilihanmu
        const ADMIN_SECRET_KEY = "kunci-rahasia-bawok-123"; 

        if (body.adminKey !== ADMIN_SECRET_KEY) {
            return new Response("Unauthorized", { status: 401 });
        }
        // -------------------------------------

        const { url: targetUrl, password } = body;
        if (!targetUrl || !password) {
            return new Response("Invalid Data", { status: 400 });
        }

        const existingLink = await env.LINK_DB.get(password);
        if (existingLink !== null) {
            return new Response("Duplicate", { status: 409 });
        }

        await env.LINK_DB.put(password, targetUrl);

        return new Response(JSON.stringify({ password: password }), {
          headers: { 'Content-Type': 'application/json' }
        });
      } catch (err) {
        return new Response("Error", { status: 500 });
      }
    }

    // API GET (Sama seperti sebelumnya)
    if (request.method === "GET" && url.pathname.startsWith("/api/get/")) {
      const password = url.pathname.split("/").pop();
      const cache = caches.default;
      const cacheKey = new Request(new URL(request.url), request);
      let response = await cache.match(cacheKey);

      if (!response) {
        const targetUrl = await env.LINK_DB.get(password);
        if (!targetUrl) {
          return new Response(JSON.stringify({ error: "Not Found" }), { status: 404, headers: { 'Content-Type': 'application/json' }});
        }
        response = new Response(JSON.stringify({ url: targetUrl }), {
          headers: { 'Content-Type': 'application/json', 'Cache-Control': 'public, max-age=2592000' }
        });
        ctx.waitUntil(cache.put(cacheKey, response.clone()));
      }
      return response;
    }

    return env.ASSETS.fetch(request);
  }
};
