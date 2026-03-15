export default {
  async fetch(request, env, ctx) {
    const url = new URL(request.url);

    // ==========================================
    // 1. API BUAT LINK (DENGAN PENGECEKAN DUPLIKAT)
    // ==========================================
    if (request.method === "POST" && url.pathname === "/api/create") {
      try {
        const body = await request.json();
        const { url: targetUrl, password } = body;

        if (!targetUrl || !password) {
            return new Response("URL dan Password wajib diisi", { status: 400 });
        }

        // =======================================
        // TAMBAHAN: CEK DULU APAKAH PASSWORD SUDAH ADA
        // =======================================
        const existingLink = await env.LINK_DB.get(password);
        if (existingLink !== null) {
            // Jika ada, kirim status 409 Conflict (artinya konflik/bentrok)
            return new Response("Password sudah terpakai.", { status: 409 });
        }
        // =======================================

        // Jika aman, baru simpan ke KV
        await env.LINK_DB.put(password, targetUrl);

        return new Response(JSON.stringify({ password: password }), {
          headers: { 'Content-Type': 'application/json' }
        });
      } catch (err) {
        return new Response("Error processing request", { status: 500 });
      }
    }

    // API GET (Tidak ada perubahan)
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

    // Default: Tampilkan HTML
    return env.ASSETS.fetch(request);
  }
};
