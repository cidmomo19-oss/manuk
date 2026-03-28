export default {
  async fetch(request, env, ctx) {
    const url = new URL(request.url);

    // =========================================================
    // KODE RAHASIA LU (GANTI SESUAI SELERA)
    // =========================================================
    const URL_ADMIN = "/masuk-bawok-99"; // <-- URL Pintu Masuk
    const KUNCI_API = "bawok-rahasia-77"; // <-- Password API
    // =========================================================

    // 1. MUNCULKAN HALAMAN ADMIN
    if (request.method === "GET" && url.pathname === URL_ADMIN) {
      const adminHTML = `
      <!DOCTYPE html>
      <html lang="id">
      <head>
          <meta charset="UTF-8"><meta name="viewport" content="width=device-width, initial-scale=1.0">
          <title>Admin Panel</title>
          <style>
              body { font-family: "Courier New", monospace; background: #000; color: #fff; display: flex; justify-content: center; align-items: center; height: 100vh; margin: 0; }
              .box { text-align: center; width: 320px; padding: 20px; border: 1px solid #333; }
              input { width: 100%; border: none; border-bottom: 2px solid #555; background: transparent; color: #fff; font-size: 18px; padding: 10px 0; margin: 15px 0; outline: none; text-align: center; font-family: inherit; }
              input:focus { border-bottom-color: #2ecc71; }
              button { background: #2ecc71; color: #000; border: none; padding: 12px; font-size: 16px; width: 100%; cursor: pointer; font-weight: bold; margin-top: 10px; font-family: inherit;}
              button:hover { background: #27ae60; }
          </style>
      </head>
      <body>
          <div class="box">
              <h2>ADMIN PANEL</h2>
              <input type="password" id="key" placeholder="KUNCI API">
              <input type="url" id="url" placeholder="URL ASLI (Target)">
              <input type="text" id="pass" placeholder="PASSWORD CUSTOM">
              <button onclick="save()" id="btn">GENERATE / UPDATE</button>
              <p id="res" style="color:#2ecc71; font-size: 16px; margin-top: 20px;"></p>
          </div>
          <script>
              async function save() {
                  const key = document.getElementById("key").value, url = document.getElementById("url").value, pass = document.getElementById("pass").value, btn = document.getElementById("btn"), res = document.getElementById("res");
                  if(!key || !url || !pass) return alert("Isi semua bro!");
                  btn.innerText = "LOADING..."; btn.disabled = true; res.innerText = "";
                  try {
                      const req = await fetch('/api/create', { method: 'POST', headers: {'Content-Type': 'application/json'}, body: JSON.stringify({adminKey: key, url: url, password: pass}) });
                      if(req.ok) { 
                          res.innerText = "Sukses Simpan: " + pass; 
                          document.getElementById("url").value = ""; 
                          document.getElementById("pass").value = ""; 
                      }
                      else if(req.status === 401) alert("Kunci API Salah!");
                      else alert("Gagal Simpan!");
                  } catch(e) { alert("Error!"); }
                  btn.innerText = "GENERATE / UPDATE"; btn.disabled = false;
              }
          </script>
      </body></html>
      `;
      return new Response(adminHTML, { headers: { "Content-Type": "text/html" } });
    }

    // 2. API BUAT / UPDATE LINK 
    if (request.method === "POST" && url.pathname === "/api/create") {
      try {
        const body = await request.json();
        if (body.adminKey !== KUNCI_API) return new Response("Akses Ditolak", { status: 401 });

        const { url: targetUrl, password } = body;
        if (!targetUrl || !password) return new Response("Data Kurang", { status: 400 });

        // Simpan langsung ke KV Database (Otomatis overwrite kalau udah ada)
        await env.LINK_DB.put(password, targetUrl);
        return new Response(JSON.stringify({ password, status: "success" }), { headers: { 'Content-Type': 'application/json' } });
      } catch (e) { return new Response("Error", { status: 500 }); }
    }

    // 3. API GET LINK UNTUK USER (ANTI CACHE 100%)
    if (request.method === "GET" && url.pathname.startsWith("/api/get/")) {
      const pin = url.pathname.split("/").pop();
      
      // Ambil data langsung dari Database KV
      const target = await env.LINK_DB.get(pin);
      if (!target) return new Response(JSON.stringify({ error: 1 }), { status: 404 });

      // HEADER KHUSUS: Paksa browser & server jgn pernah nge-cache ini
      return new Response(JSON.stringify({ url: target }), {
        headers: { 
          'Content-Type': 'application/json', 
          'Cache-Control': 'no-store, no-cache, must-revalidate, proxy-revalidate, max-age=0',
          'Pragma': 'no-cache',
          'Expires': '0',
          'Access-Control-Allow-Origin': '*'
        }
      });
    }

    // 4. SELAIN DI ATAS, TAMPILKAN HALAMAN UTAMA (index.html)
    return env.ASSETS.fetch(request);
  }
};
