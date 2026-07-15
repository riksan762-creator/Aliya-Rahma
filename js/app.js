/* ============================================================
   AR — shared store (localStorage) + shopfront logic
   Keys: ar_products, ar_orders, ar_cart, ar_customer
   ============================================================ */

const AR = {
  fmt(n){ return 'Rp ' + Number(n).toLocaleString('id-ID'); },

  seedProducts(){
    return [
      { id:'p1', name:'Pashmina Diamond Italiano', cat:'Pashmina', price:85000, oldPrice:110000, stock:24, desc:'Pashmina bahan diamond italiano, adem, jatuh sempurna, cocok untuk harian maupun acara formal.', img:'', color:'#5C7A96', isNew:true },
      { id:'p2', name:'Bergo Instan Syar\'i Rossa', cat:'Bergo', price:65000, oldPrice:0, stock:40, desc:'Bergo instan dua layer, praktis dipakai tanpa peniti, nyaman untuk aktivitas sehari-hari.', img:'', color:'#B8654F', isNew:false },
      { id:'p3', name:'Segiempat Voal Premium Motif', cat:'Segiempat', price:72000, oldPrice:0, stock:31, desc:'Hijab segiempat voal premium dengan motif eksklusif AR, ringan dan tidak menerawang.', img:'', color:'#A98552', isNew:true },
      { id:'p4', name:'Couple Set Ceruty Sabyan', cat:'Couple', price:145000, oldPrice:175000, stock:12, desc:'Set couple hijab & dalaman ceruty, satu paket serasi untuk momen spesial berdua.', img:'', color:'#3F5A73', isNew:false },
      { id:'p5', name:'Pashmina Ceruty Babydoll', cat:'Pashmina', price:78000, oldPrice:0, stock:19, desc:'Ceruty babydoll dengan jatuhan lembut, favorit untuk gaya sehari-hari yang effortless.', img:'', color:'#8E6B6E', isNew:false },
      { id:'p6', name:'Bergo Anak Motif Bunga', cat:'Kids', price:45000, oldPrice:0, stock:27, desc:'Bergo anak bahan lembut dan adem, motif bunga ceria, aman untuk kulit sensitif anak.', img:'', color:'#C8A97E', isNew:false },
      { id:'p7', name:'Segiempat Sarimbit Keluarga', cat:'Sarimbit', price:98000, oldPrice:0, stock:15, desc:'Motif sarimbit yang bisa dipadukan seluruh keluarga untuk momen kebersamaan.', img:'', color:'#6E5A6E', isNew:true },
      { id:'p8', name:'Pashmina Plisket Anti Ribet', cat:'Pashmina', price:69000, oldPrice:89000, stock:33, desc:'Pashmina plisket siap pakai, tinggal lilit tanpa perlu bentuk ulang.', img:'', color:'#7A8B6F', isNew:false },
    ];
  },

  getProducts(){
    let p = JSON.parse(localStorage.getItem('ar_products') || 'null');
    if(!p){ p = this.seedProducts(); localStorage.setItem('ar_products', JSON.stringify(p)); }
    return p;
  },
  saveProducts(p){ localStorage.setItem('ar_products', JSON.stringify(p)); },

  getOrders(){ return JSON.parse(localStorage.getItem('ar_orders') || '[]'); },
  saveOrders(o){ localStorage.setItem('ar_orders', JSON.stringify(o)); },

  getCart(){ return JSON.parse(localStorage.getItem('ar_cart') || '[]'); },
  saveCart(c){ localStorage.setItem('ar_cart', JSON.stringify(c)); this.updateCartBadge(); },

  addToCart(id, qty=1){
    const cart = this.getCart();
    const line = cart.find(l => l.id === id);
    if(line){ line.qty += qty; } else { cart.push({ id, qty }); }
    this.saveCart(cart);
    this.toast('Ditambahkan ke keranjang');
  },
  updateCartBadge(){
    const count = this.getCart().reduce((s,l)=>s+l.qty,0);
    document.querySelectorAll('[data-cart-count]').forEach(el=>{
      el.textContent = count;
      el.style.display = count > 0 ? 'flex' : 'none';
    });
  },

  toast(msg){
    let t = document.querySelector('.toast');
    if(!t){ t = document.createElement('div'); t.className='toast'; document.body.appendChild(t); }
    t.textContent = msg;
    t.classList.add('show');
    clearTimeout(this._toastTimer);
    this._toastTimer = setTimeout(()=>t.classList.remove('show'), 2200);
  },

  productThumb(p){
    if(p.img){ return `<img src="${p.img}" alt="${p.name}">`; }
    return `<div class="placeholder" style="width:100%;height:100%;background:linear-gradient(150deg, ${p.color} 0%, #2A1F2D 140%); display:flex; align-items:center; justify-content:center; color:#fff;">${p.name.split(' ').slice(0,2).join(' ')}</div>`;
  },

  cardHTML(p){
    return `
    <div class="pcard">
      <a href="product.html?id=${p.id}" class="thumb">
        ${p.isNew ? '<span class="badge-new">Baru</span>' : ''}
        ${this.productThumb(p)}
      </a>
      <div class="body">
        <span class="cat">${p.cat}</span>
        <h3><a href="product.html?id=${p.id}">${p.name}</a></h3>
        <div class="price">${this.fmt(p.price)} ${p.oldPrice ? `<span class="old">${this.fmt(p.oldPrice)}</span>`:''}</div>
        <div class="row">
          <button class="btn btn-primary btn-sm btn-block" onclick="AR.addToCart('${p.id}');event.stopPropagation();">Tambah</button>
          <a href="product.html?id=${p.id}" class="btn btn-outline btn-sm">Lihat</a>
        </div>
      </div>
    </div>`;
  },

  renderGrid(target, list){
    const el = document.querySelector(target);
    if(!el) return;
    if(!list.length){ el.innerHTML = `<div class="empty-state" style="grid-column:1/-1;"><div class="glyph">🧕</div><p>Belum ada produk di kategori ini.</p></div>`; return; }
    el.innerHTML = list.map(p => this.cardHTML(p)).join('');
  },

  initHeader(){
    this.updateCartBadge();
    const burger = document.querySelector('.burger');
    const links = document.querySelector('.nav-links');
    if(burger && links){
      burger.addEventListener('click', ()=>{
        links.style.display = links.style.display === 'flex' ? 'none' : 'flex';
        links.style.cssText += 'position:absolute;top:100%;left:0;right:0;flex-direction:column;background:#FFFDF9;padding:16px 24px;border-bottom:1px solid var(--line);gap:14px;';
      });
    }
  }
};

document.addEventListener('DOMContentLoaded', ()=> AR.initHeader());
