export default {
  async fetch(request, env, ctx) {
    const url = new URL(request.url);
    const path = url.pathname.split("/").filter(Boolean);

    // =========================================================
    // KONFIGURASI ADMIN (Ganti kalau mau)
    // =========================================================
    const URL_ADMIN = "/masuk-bawok-99"; 
    const KUNCI_API = "bawok-rahasia-77"; 
    // =========================================================

    // 1. HALAMAN ADMIN
    if (request.method === "GET" && url.pathname === URL_ADMIN) {
      return new Response(getAdminHTML(URL_ADMIN), { headers: { "Content-Type": "text/html" } });
    }

    // 2. API: BUAT LINK BARU
    if (request.method === "POST" && url.pathname === "/api/create") {
      try {
        const body = await request.json();
        if (body.adminKey !== KUNCI_API) return new Response("Unauthorized", { status: 401 });

        const { targetUrl, password, customId } = body;
        const id = customId || Math.random().toString(36).substring(2, 8); 

        // Simpan ke KV: Key=ID, Value=JSON(url & password)
        const data = { url: targetUrl, password: password };
        await env.LINK_DB.put(`ID_${id}`, JSON.stringify(data));

        return new Response(JSON.stringify({ id, status: "success" }), { headers: { 'Content-Type': 'application/json' } });
      } catch (e) { return new Response("Error", { status: 500 }); }
    }

    // 3. API: VERIFIKASI PASSWORD
    if (request.method === "POST" && url.pathname === "/api/verify-pass") {
      try {
        const { id, password } = await request.json();
        
        // Fitur Hardcode CUY (Opsional)
        if (id === "CUY" && password === "CUY") {
          return new Response(JSON.stringify({ success: true }), { status: 200 });
        }

        const raw = await env.LINK_DB.get(`ID_${id}`);
        if (!raw) return new Response(JSON.stringify({ success: false, msg: "ID Tidak Ditemukan" }), { status: 404 });

        const data = JSON.parse(raw);
        if (data.password === password) {
          return new Response(JSON.stringify({ success: true }), { status: 200 });
        }
        return new Response(JSON.stringify({ success: false, msg: "Password Salah" }), { status: 401 });
      } catch (e) { return new Response("Error", { status: 500 }); }
    }

    // 4. API: AMBIL URL ASLI (Setelah Tugas Selesai)
    if (request.method === "GET" && url.pathname.startsWith("/api/get-link/")) {
      const id = path[path.length - 1];
      
      if (id === "CUY") {
        return new Response(JSON.stringify({ url: "https://pokoco.co/v?id=5ukF172rO" }), { 
          headers: { 'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*' } 
        });
      }

      const raw = await env.LINK_DB.get(`ID_${id}`);
      if (!raw) return new Response("Not Found", { status: 404 });
      
      const data = JSON.parse(raw);
      return new Response(JSON.stringify({ url: data.url }), { 
        headers: { 'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*' } 
      });
    }

    // 5. ROUTING HALAMAN
    // Jika user buka domain.com/sesuatu -> arahkan ke index.html
    if (path.length === 1 && !path[0].includes(".") && path[0] !== "verify.html") {
      return env.ASSETS.fetch(new Request(url.origin + "/index.html", request));
    }

    return env.ASSETS.fetch(request);
  }
};

function getAdminHTML(path) {
  return `
  <!DOCTYPE html>
  <html lang="id">
  <head>
      <meta charset="UTF-8"><meta name="viewport" content="width=device-width, initial-scale=1.0">
      <title>Admin Panel</title>
      <style>
          body { font-family: "Courier New", monospace; background: #000; color: #fff; display: flex; justify-content: center; align-items: center; min-height: 100vh; margin: 0; }
          .box { text-align: center; width: 90%; max-width: 400px; padding: 20px; border: 1px solid #333; background: #0a0a0a; border-radius: 8px; }
          h2 { color: #2ecc71; letter-spacing: 2px; }
          input { width: 100%; border: none; border-bottom: 2px solid #333; background: transparent; color: #fff; font-size: 16px; padding: 12px 0; margin: 10px 0; outline: none; text-align: center; font-family: inherit; transition: 0.3s; }
          input:focus { border-bottom-color: #2ecc71; }
          button { background: #2ecc71; color: #000; border: none; padding: 15px; font-size: 16px; width: 100%; cursor: pointer; font-weight: bold; margin-top: 20px; font-family: inherit; border-radius: 4px; }
          #res { margin-top: 25px; word-break: break-all; padding: 15px; border: 1px dashed #2ecc71; display: none; background: rgba(46, 204, 113, 0.1); }
          a { color: #fff; text-decoration: underline; }
      </style>
  </head>
  <body>
      <div class="box">
          <h2>ADMIN PANEL</h2>
          <input type="password" id="key" placeholder="KUNCI API">
          <input type="url" id="url" placeholder="URL TARGET (Original)">
          <input type="text" id="pass" placeholder="PASSWORD UNTUK LINK INI">
          <input type="text" id="cid" placeholder="CUSTOM ID (Boleh Kosong)">
          <button onclick="save()" id="btn">GENERATE LINK</button>
          <div id="res" id="resBox"></div>
      </div>
      <script>
          async function save() {
              const key = document.getElementById("key").value, 
                    url = document.getElementById("url").value, 
                    pass = document.getElementById("pass").value,
                    cid = document.getElementById("cid").value,
                    res = document.getElementById("res"),
                    btn = document.getElementById("btn");

              if(!key || !url || !pass) return alert("Wajib isi Kunci API, URL, dan Password!");
              
              btn.innerText = "SEDANG MEMBUAT..."; btn.disabled = true;
              try {
                  const req = await fetch('/api/create', { 
                    method: 'POST', 
                    body: JSON.stringify({adminKey: key, targetUrl: url, password: pass, customId: cid}) 
                  });
                  const data = await req.json();
                  if(req.ok) { 
                      const finalUrl = window.location.origin + "/" + data.id;
                      res.style.display = "block";
                      res.innerHTML = "<strong>BERHASIL!</strong><br><br>Link Kamu:<br><a href='"+finalUrl+"' target='_blank'>"+finalUrl+"</a><br><br>Password: " + pass;
                  } else { alert("Gagal! Kunci API mungkin salah."); }
              } catch(e) { alert("Terjadi kesalahan sistem."); }
              btn.innerText = "GENERATE LINK"; btn.disabled = false;
          }
      </script>
  </body></html>`;
}
