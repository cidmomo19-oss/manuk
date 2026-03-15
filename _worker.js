export default {
  async fetch(request, env, ctx) {
    const url = new URL(request.url);

    // ==========================================
    // 1. API BUAT LINK (Tanpa Password)
    // ==========================================
    if (request.method === "POST" && url.pathname === "/api/create") {
      try {
        const body = await request.json();
        
        if (!body.url) {
            return new Response("URL Kosong", { status: 400 });
        }

        // Generate 6 Digit PIN acak
        const pin = Math.floor(100000 + Math.random() * 900000).toString();
        
        // Simpan ke KV (Nama binding harus: LINK_DB)
        await env.LINK_DB.put(pin, body.url);

        return new Response(JSON.stringify({ pin: pin }), {
          headers: { 'Content-Type': 'application/json' }
        });
      } catch (err) {
        return new Response("Error processing request", { status: 500 });
      }
    }

    // ==========================================
    // 2. API CEK PIN + CACHE 1 BULAN
    // ==========================================
    if (request.method === "GET" && url.pathname.startsWith("/api/get/")) {
      const pin = url.pathname.split("/").pop();
      
      const cacheUrl = new URL(request.url);
      const cacheKey = new Request(cacheUrl.toString(), request);
      const cache = caches.default;

      let response = await cache.match(cacheKey);

      if (!response) {
        const targetUrl = await env.LINK_DB.get(pin);

        if (!targetUrl) {
          return new Response(JSON.stringify({ error: "Not Found" }), { 
            status: 404, headers: { 'Content-Type': 'application/json' }
          });
        }

        // Simpan ke cache 1 Bulan
        response = new Response(JSON.stringify({ url: targetUrl }), {
          headers: {
            'Content-Type': 'application/json',
            'Cache-Control': 'public, max-age=2592000'
          }
        });

        ctx.waitUntil(cache.put(cacheKey, response.clone()));
      }

      return response;
    }

    // ==========================================
    // 3. DEFAULT: TAMPILKAN INDEX.HTML
    // ==========================================
    return env.ASSETS.fetch(request);
  }
};
