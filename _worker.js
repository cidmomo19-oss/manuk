export default {
  async fetch(request, env, ctx) {
    const url = new URL(request.url);

    // =========================================================
    // KODE RAHASIA LU
    // =========================================================
    const URL_ADMIN = "/masuk-bawok-99"; 
    const KUNCI_API = "bawok-rahasia-77"; 
    // =========================================================

    // 1. MUNCULKAN HALAMAN ADMIN (DESAIN MODERN)
    if (request.method === "GET" && url.pathname === URL_ADMIN) {
      const adminHTML = `
      <!DOCTYPE html>
      <html lang="id">
      <head>
          <meta charset="UTF-8"><meta name="viewport" content="width=device-width, initial-scale=1.0, maximum-scale=1.0, user-scalable=no">
          <title>Panel Pengelola</title>
          <link rel="preconnect" href="https://fonts.googleapis.com">
          <link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
          <link href="https://fonts.googleapis.com/css2?family=Inter:wght@400;500&family=Outfit:wght@600;700&display=swap" rel="stylesheet">
          <style>
              * { box-sizing: border-box; outline: none; }
              body { font-family: 'Inter', sans-serif; background: #f6f8fa; background-image: radial-gradient(circle at 50% 0%, #ffffff 0%, transparent 70%); color: #0f172a; display: flex; justify-content: center; align-items: center; min-height: 100vh; margin: 0; padding: 20px; }
              
              .card { background: #ffffff; padding: 40px 32px; border-radius: 28px; box-shadow: 0 20px 40px -10px rgba(0,0,0,0.05); width: 100%; max-width: 400px; text-align: center; border: 1px solid rgba(226, 232, 240, 0.8); }
              
              .icon-admin { width: 56px; height: 56px; background: #0f172a; border-radius: 18px; display: inline-flex; align-items: center; justify-content: center; margin-bottom: 20px; box-shadow: 0 10px 20px -5px rgba(15, 23, 42, 0.3); color: #fff; }
              
              h2 { font-family: 'Outfit', sans-serif; margin: 0 0 24px 0; font-size: 24px; color: #0f172a; letter-spacing: -0.5px; }
              
              input { width: 100%; background: #f1f5f9; border: 2px solid transparent; border-radius: 16px; padding: 14px 20px; font-size: 15px; font-family: inherit; color: #0f172a; font-weight: 500; transition: all 0.2s; margin-bottom: 16px; }
              input::placeholder { color: #94a3b8; font-weight: 400; }
              input:focus { background: #ffffff; border-color: #cbd5e1; box-shadow: 0 0 0 4px rgba(226, 232, 240, 0.5); }
              
              button { width: 100%; background: #0f172a; color: #ffffff; border: none; border-radius: 16px; padding: 15px; font-size: 15px; font-weight: 600; cursor: pointer; transition: all 0.2s; margin-top: 8px; }
              button:hover { background: #334155; }
              button:active { transform: scale(0.98); }
              button:disabled { background: #cbd5e1; cursor: not-allowed; }
              
              .res-box { margin-top: 24px; padding: 20px; background: #f0fdf4; border: 1px solid #bbf7d0; border-radius: 16px; display: none; text-align: left; animation: fadeIn 0.3s ease; }
              .res-box .badge { display: inline-block; background: #22c55e; color: #fff; font-size: 12px; font-weight: 600; padding: 4px 10px; border-radius: 99px; margin-bottom: 12px; }
              .res-box p { margin: 8px 0; font-size: 14px; color: #166534; }
              .res-box a { color: #15803d; font-weight: 600; word-break: break-all; text-decoration: none; border-bottom: 1px dashed #15803d; }
              .res-box span { color: #dc2626; font-weight: 600; background: #fee2e2; padding: 2px 8px; border-radius: 6px; }
              
              @keyframes fadeIn { from { opacity: 0; transform: translateY(10px); } to { opacity: 1; transform: translateY(0); } }
          </style>
      </head>
      <body>
          <div class="card">
              <div class="icon-admin">
                  <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                      <rect x="3" y="11" width="18" height="11" rx="2" ry="2"></rect><path d="M7 11V7a5 5 0 0 1 10 0v4"></path>
                  </svg>
              </div>
              <h2>Panel Pengelola</h2>
              
              <input type="password" id="key" placeholder="Kunci API Administrator">
              <input type="url" id="url" placeholder="URL Asli (Target Tujuan)">
              <input type="text" id="pass" placeholder="Kata Kunci / Password Custom">
              
              <button onclick="save()" id="btn">Generate Link Baru</button>
              
              <div id="resBox" class="res-box">
                  <div class="badge">Berhasil Dibuat!</div>
                  <p>Link: <a href="#" id="resLink" target="_blank"></a></p>
                  <p>Kata Kunci: <span id="resPass"></span></p>
              </div>
          </div>
          
          <script>
              async function save() {
                  const key = document.getElementById("key").value.trim();
                  const url = document.getElementById("url").value.trim();
                  const pass = document.getElementById("pass").value.trim();
                  const btn = document.getElementById("btn");
                  const resBox = document.getElementById("resBox");
                  
                  if(!key || !url || !pass) return alert("Harap isi semua kolom!");
                  
                  btn.innerText = "Memproses..."; btn.disabled = true; resBox.style.display = "none";
                  
                  try {
                      const req = await fetch('/api/create', { 
                          method: 'POST', 
                          headers: {'Content-Type': 'application/json'}, 
                          body: JSON.stringify({adminKey: key, url: url, password: pass}) 
                      });
                      
                      if(req.ok) { 
                          const data = await req.json();
                          document.getElementById("resLink").href = data.link;
                          document.getElementById("resLink").innerText = data.link;
                          document.getElementById("resPass").innerText = data.password;
                          resBox.style.display = "block";
                          
                          document.getElementById("url").value = ""; 
                          document.getElementById("pass").value = ""; 
                      }
                      else if(req.status === 401) alert("Akses Ditolak: Kunci API Salah!");
                      else alert("Terjadi kesalahan sistem saat menyimpan data!");
                  } catch(e) { alert("Error Jaringan!"); }
                  
                  btn.innerText = "Generate Link Baru"; btn.disabled = false;
              }
          </script>
      </body></html>
      `;
      return new Response(adminHTML, { headers: { "Content-Type": "text/html" } });
    }

    // 2. API BUAT LINK BARU
    if (request.method === "POST" && url.pathname === "/api/create") {
      try {
        const body = await request.json();
        if (body.adminKey !== KUNCI_API) return new Response("Akses Ditolak", { status: 401 });

        const { url: targetUrl, password } = body;
        if (!targetUrl || !password) return new Response("Data Kurang", { status: 400 });

        const randomId = Math.random().toString(36).substring(2, 8);
        const dbData = { url: targetUrl, password: password };
        await env.LINK_DB.put(randomId, JSON.stringify(dbData));

        const finalLink = `${url.origin}/?id=${randomId}`;

        return new Response(JSON.stringify({ 
            id: randomId, 
            password: password, 
            link: finalLink,
            status: "success" 
        }), { headers: { 'Content-Type': 'application/json' } });

      } catch (e) { return new Response("Error", { status: 500 }); }
    }

    // 3. API GET / CEK LINK UNTUK USER
    if (request.method === "GET" && url.pathname.startsWith("/api/get/")) {
      const parts = url.pathname.split("/");
      const reqId = parts[3];
      const reqPass = decodeURIComponent(parts[4] || "");
      
      const headerAntiCache = {
        'Content-Type': 'application/json', 
        'Cache-Control': 'no-store, no-cache, must-revalidate, proxy-revalidate, max-age=0',
        'Pragma': 'no-cache',
        'Expires': '0',
        'Access-Control-Allow-Origin': '*'
      };

      if (!reqId || !reqPass) {
          return new Response(JSON.stringify({ error: "Data tidak lengkap" }), { status: 400, headers: headerAntiCache });
      }

      const rawData = await env.LINK_DB.get(reqId);
      if (!rawData) {
          return new Response(JSON.stringify({ error: "Link tidak valid / kadaluarsa" }), { status: 404, headers: headerAntiCache });
      }

      const data = JSON.parse(rawData);
      if (data.password !== reqPass) {
          return new Response(JSON.stringify({ error: "Password salah" }), { status: 401, headers: headerAntiCache });
      }

      return new Response(JSON.stringify({ url: data.url }), { headers: headerAntiCache });
    }

    // 4. SELAIN DI ATAS, TAMPILKAN HALAMAN UTAMA (index.html)
    return env.ASSETS.fetch(request);
  }
};
