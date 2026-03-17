export default {
  async fetch(request, env, ctx) {
    const url = new URL(request.url);

    // --- API BUAT LINK (ADMIN) ---
    if (request.method === "POST" && url.pathname === "/api/create") {
      try {
        const body = await request.json();
        
        // GANTI PASSWORD API INI (Bebas)
        const KUNCI_API_ADMIN = "bawok-rahasia-77"; 

        if (body.adminKey !== KUNCI_API_ADMIN) {
          return new Response("Akses Ditolak", { status: 401 });
        }

        const { url: targetUrl, password } = body;
        if (!targetUrl || !password) return new Response("Data Kurang", { status: 400 });

        const ada = await env.LINK_DB.get(password);
        if (ada !== null) return new Response("Duplikat", { status: 409 });

        await env.LINK_DB.put(password, targetUrl);
        return new Response(JSON.stringify({ password }), { headers: { 'Content-Type': 'application/json' } });
      } catch (e) { return new Response("Error", { status: 500 }); }
    }

    // --- API CEK PASSWORD (USER) ---
    if (request.method === "GET" && url.pathname.startsWith("/api/get/")) {
      const pin = url.pathname.split("/").pop();
      const cache = caches.default;
      const cacheKey = new Request(url.toString(), request);
      let response = await cache.match(cacheKey);

      if (!response) {
        const target = await env.LINK_DB.get(pin);
        if (!target) return new Response(JSON.stringify({ error: 1 }), { status: 404 });

        response = new Response(JSON.stringify({ url: target }), {
          headers: { 'Content-Type': 'application/json', 'Cache-Control': 'public, max-age=2592000' }
        });
        ctx.waitUntil(cache.put(cacheKey, response.clone()));
      }
      return response;
    }

    return env.ASSETS.fetch(request);
  }
};
