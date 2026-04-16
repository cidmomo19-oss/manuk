export default {
  async fetch(request, env, ctx) {
    const url = new URL(request.url);

    // =========================================================
    // KODE RAHASIA LU
    // =========================================================
    const URL_ADMIN = "/masuk-bawok-99"; 
    const KUNCI_API = "bawok-rahasia-77"; 
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
              .box { text-align: center; width: 340px; padding: 20px; border: 1px solid #333; }
              input { width: 100%; border: none; border-bottom: 2px solid #555; background: transparent; color: #fff; font-size: 16px; padding: 10px 0; margin: 15px 0; outline: none; text-align: center; font-family: inherit; }
              input:focus { border-bottom-color: #2ecc71; }
              button { background: #2ecc71; color: #000; border: none; padding: 12px; font-size: 16px; width: 100%; cursor: pointer; font-weight: bold; margin-top: 10px; font-family: inherit;}
              button:hover { background: #27ae60; }
              .result-box { margin-top: 20px; font-size: 14px; text-align: left; background: #111; padding: 10px; border-left: 3px solid #2ecc71; display: none; word-break: break-all;}
              .result-box a { color: #3498db; text-decoration: none; }
          </style>
      </head>
      <body>
          <div class="box">
              <h2>ADMIN PANEL</h2>
              <input type="password" id="key" placeholder="KUNCI API">
              <input type="url" id="url" placeholder="URL ASLI (Target)">
              <input type="text" id="pass" placeholder="PASSWORD CUSTOM">
              <button onclick="save()" id="btn">BUAT LINK BARU</button>
              
              <div id="resBox" class="result-box">
                  <span style="color:#2ecc71; font-weight:bold;">SUKSES!</span><br><br>
                  Link: <a href="#" id="resLink" target="_blank"></a><br><br>
                  Pass: <span id="resPass" style="color:#e74c3c;"></span>
              </div>
          </div>
          <script>
              async function save() {
                  const key = document.getElementById("key").value;
                  const url = document.getElementById("url").value;
                  const pass = document.getElementById("pass").value;
                  const btn = document.getElementById("btn");
                  const resBox = document.getElementById("resBox");
                  
                  if(!key || !url || !pass) return alert("Isi semua bro!");
                  
                  btn.innerText = "LOADING..."; btn.disabled = true; resBox.style.display = "none";
                  
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
                      else if(req.status === 401) alert("Kunci API Salah!");
                      else alert("Gagal Simpan!");
                  } catch(e) { alert("Error!"); }
                  btn.innerText = "BUAT LINK BARU"; btn.disabled = false;
              }
          </script>
      </body></html>
      `;
      return new Response(adminHTML, { headers: { "Content-Type": "text/html" } });
    }

    // 2. API BUAT LINK BARU (Generate Random ID)
    if (request.method === "POST" && url.pathname === "/api/create") {
      try {
        const body = await request.json();
        if (body.adminKey !== KUNCI_API) return new Response("Akses Ditolak", { status: 401 });

        const { url: targetUrl, password } = body;
        if (!targetUrl || !password) return new Response("Data Kurang", { status: 400 });

        // Generate Random ID (6 Karakter alfanumerik)
        const randomId = Math.random().toString(36).substring(2, 8);
        
        // Simpan ke KV: Kunci = ID, Value = Object (Password + Target)
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

    // 3. API GET / CEK LINK UNTUK USER (/api/get/ID/PASSWORD)
    if (request.method === "GET" && url.pathname.startsWith("/api/get/")) {
      const parts = url.pathname.split("/"); // ['', 'api', 'get', 'ID', 'PASSWORD']
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

      // Ambil data dari KV berdasarkan ID
      const rawData = await env.LINK_DB.get(reqId);
      if (!rawData) {
          return new Response(JSON.stringify({ error: "Link tidak valid / kadaluarsa" }), { status: 404, headers: headerAntiCache });
      }

      // Parsing JSON dan Cocokkan Password
      const data = JSON.parse(rawData);
      if (data.password !== reqPass) {
          return new Response(JSON.stringify({ error: "Password salah" }), { status: 401, headers: headerAntiCache });
      }

      // Sukses! Kembalikan URL aslinya
      return new Response(JSON.stringify({ url: data.url }), { headers: headerAntiCache });
    }

    // 4. SELAIN DI ATAS, TAMPILKAN HALAMAN UTAMA (index.html)
    return env.ASSETS.fetch(request);
  }
};
