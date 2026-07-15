/* ============================================================
   AR Admin — auth, product CRUD (with image upload), orders, stats
   ============================================================ */

const ADMIN_USER = { username:'admin', password:'ar12345' };

const Admin = {
  isAuthed(){ return sessionStorage.getItem('ar_admin_auth') === '1'; },
  login(u,p){
    if(u === ADMIN_USER.username && p === ADMIN_USER.password){
      sessionStorage.setItem('ar_admin_auth','1'); return true;
    }
    return false;
  },
  logout(){ sessionStorage.removeItem('ar_admin_auth'); location.href = 'admin.html'; },
  guard(){ if(!this.isAuthed()){ this.showLogin(); } else { this.showApp(); } },

  showLogin(){
    document.getElementById('loginScreen').style.display='flex';
    document.getElementById('appScreen').style.display='none';
  },
  showApp(){
    document.getElementById('loginScreen').style.display='none';
    document.getElementById('appScreen').style.display='grid';
    this.renderDashboard();
    this.renderProductTable();
    this.renderOrderTable();
  },

  switchTab(tab){
    document.querySelectorAll('.admin-side nav a').forEach(a=>a.classList.toggle('active', a.dataset.tab===tab));
    document.querySelectorAll('.tab-panel').forEach(p=>p.style.display = p.id === 'tab-'+tab ? 'block' : 'none');
  },

  /* ---------- Dashboard ---------- */
  renderDashboard(){
    const products = AR.getProducts();
    const orders = AR.getOrders();
    const revenue = orders.filter(o=>o.status!=='Batal').reduce((s,o)=>s+o.total,0);
    const pending = orders.filter(o=>o.status==='Pending').length;
    document.getElementById('statProducts').textContent = products.length;
    document.getElementById('statOrders').textContent = orders.length;
    document.getElementById('statRevenue').textContent = AR.fmt(revenue);
    document.getElementById('statPending').textContent = pending;
  },

  /* ---------- Products ---------- */
  renderProductTable(){
    const products = AR.getProducts();
    const tbody = document.getElementById('productTbody');
    if(!products.length){ tbody.innerHTML = `<tr><td colspan="6" style="text-align:center;padding:30px;">Belum ada produk.</td></tr>`; return; }
    tbody.innerHTML = products.map(p => `
      <tr class="row-photo">
        <td>${p.img ? `<img src="${p.img}">` : `<div style="width:44px;height:52px;border-radius:2px;background:${p.color}"></div>`}</td>
        <td><strong>${p.name}</strong></td>
        <td>${p.cat}</td>
        <td>${AR.fmt(p.price)}</td>
        <td>${p.stock}</td>
        <td>
          <button class="btn btn-ghost btn-sm" onclick="Admin.openProductModal('${p.id}')">Edit</button>
          <button class="btn btn-danger btn-sm" onclick="Admin.deleteProduct('${p.id}')">Hapus</button>
        </td>
      </tr>`).join('');
  },

  openProductModal(id){
    const products = AR.getProducts();
    const p = id ? products.find(x=>x.id===id) : { id:'', name:'', cat:'Pashmina', price:'', oldPrice:'', stock:'', desc:'', img:'', color:'#5C7A96', isNew:false };
    document.getElementById('modalTitle').textContent = id ? 'Edit Produk' : 'Tambah Produk';
    document.getElementById('f_id').value = p.id;
    document.getElementById('f_name').value = p.name;
    document.getElementById('f_cat').value = p.cat;
    document.getElementById('f_price').value = p.price;
    document.getElementById('f_oldprice').value = p.oldPrice || '';
    document.getElementById('f_stock').value = p.stock;
    document.getElementById('f_desc').value = p.desc || '';
    document.getElementById('f_isnew').checked = !!p.isNew;
    document.getElementById('imgPreview').src = p.img || '';
    document.getElementById('imgPreview').style.display = p.img ? 'block' : 'none';
    document.getElementById('f_img_data').value = p.img || '';
    document.getElementById('productModal').classList.add('open');
  },
  closeProductModal(){ document.getElementById('productModal').classList.remove('open'); },

  handleImageUpload(input){
    const file = input.files[0];
    if(!file) return;
    const reader = new FileReader();
    reader.onload = e => {
      document.getElementById('imgPreview').src = e.target.result;
      document.getElementById('imgPreview').style.display = 'block';
      document.getElementById('f_img_data').value = e.target.result;
    };
    reader.readAsDataURL(file);
  },

  saveProduct(e){
    e.preventDefault();
    const products = AR.getProducts();
    const id = document.getElementById('f_id').value || 'p' + Date.now();
    const data = {
      id,
      name: document.getElementById('f_name').value.trim(),
      cat: document.getElementById('f_cat').value,
      price: Number(document.getElementById('f_price').value) || 0,
      oldPrice: Number(document.getElementById('f_oldprice').value) || 0,
      stock: Number(document.getElementById('f_stock').value) || 0,
      desc: document.getElementById('f_desc').value.trim(),
      img: document.getElementById('f_img_data').value,
      color: '#5C7A96',
      isNew: document.getElementById('f_isnew').checked,
    };
    const idx = products.findIndex(p=>p.id===id);
    if(idx>-1){ data.color = products[idx].color; products[idx] = data; } else { products.push(data); }
    AR.saveProducts(products);
    this.closeProductModal();
    this.renderProductTable();
    this.renderDashboard();
    AR.toast('Produk tersimpan');
  },

  deleteProduct(id){
    if(!confirm('Hapus produk ini?')) return;
    const products = AR.getProducts().filter(p=>p.id!==id);
    AR.saveProducts(products);
    this.renderProductTable();
    this.renderDashboard();
    AR.toast('Produk dihapus');
  },

  /* ---------- Orders ---------- */
  renderOrderTable(){
    const orders = AR.getOrders().slice().reverse();
    const tbody = document.getElementById('orderTbody');
    if(!orders.length){ tbody.innerHTML = `<tr><td colspan="6" style="text-align:center;padding:30px;">Belum ada pesanan.</td></tr>`; return; }
    tbody.innerHTML = orders.map(o => `
      <tr>
        <td><strong>#${o.id}</strong><br><span style="color:var(--ink-soft);font-size:11px;">${o.date}</span></td>
        <td>${o.name}<br><span style="color:var(--ink-soft);font-size:11px;">${o.phone}</span></td>
        <td>${o.items.length} item</td>
        <td>${AR.fmt(o.total)}</td>
        <td><span class="status-pill status-${o.status.toLowerCase()}">${o.status}</span></td>
        <td>
          <select onchange="Admin.updateOrderStatus('${o.id}', this.value)" style="padding:7px 8px;font-size:12px;">
            ${['Pending','Diproses','Dikirim','Selesai','Batal'].map(s=>`<option value="${s}" ${s===o.status?'selected':''}>${s}</option>`).join('')}
          </select>
        </td>
      </tr>`).join('');
  },

  updateOrderStatus(id, status){
    const orders = AR.getOrders();
    const o = orders.find(x=>x.id===id);
    if(o){ o.status = status; AR.saveOrders(orders); this.renderDashboard(); this.renderOrderTable(); AR.toast('Status pesanan diperbarui'); }
  }
};
