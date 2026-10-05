const P=[
 {id:1,n:'Vestido Aurora',c:'Vestidos',p:2450,col:'#B0345C',t:['S','M','L'],i:'dress'},
 {id:2,n:'Blusa Marfil',c:'Blusas',p:1250,col:'#8E7AA8',t:['S','M','L','XL'],i:'top'},
 {id:3,n:'Pantalón Lino',c:'Pantalones',p:1890,col:'#5E8C7B',t:['S','M','L','XL'],i:'pants'},
 {id:4,n:'Vestido Brisa',c:'Vestidos',p:2790,col:'#D1788F',t:['S','M','L'],i:'dress'},
 {id:5,n:'Blusa Coral',c:'Blusas',p:1390,col:'#C9824F',t:['S','M','L'],i:'top'},
 {id:6,n:'Pantalón Sastre',c:'Pantalones',p:2150,col:'#4A4E7A',t:['S','M','L','XL'],i:'pants'}
];
const IC={
 dress:'<svg viewBox="0 0 64 64" fill="none" stroke="currentColor" stroke-width="3" stroke-linejoin="round"><path d="M24 6l8 8 8-8 3 14-6 8 10 30H17l10-30-6-8z"/></svg>',
 top:'<svg viewBox="0 0 64 64" fill="none" stroke="currentColor" stroke-width="3" stroke-linejoin="round"><path d="M22 8l10 6 10-6 16 12-8 10-6-4v28H20V26l-6 4-8-10z"/></svg>',
 pants:'<svg viewBox="0 0 64 64" fill="none" stroke="currentColor" stroke-width="3" stroke-linejoin="round"><path d="M18 6h28l4 52H36L32 26l-4 32H14z"/></svg>'
};
const IVA=0.18;
let cart=[],user=null,cat='Todas',view='home',mode='login';
const $=s=>document.querySelector(s);
const RD=n=>'RD$'+n.toLocaleString('es-DO');
// Almacenamiento (simulado, solo en este navegador)
function load(){try{cart=JSON.parse(localStorage.getItem('rv_cart')||'[]');user=JSON.parse(localStorage.getItem('rv_user')||'null')}catch(e){cart=[];user=null}}
function save(){try{localStorage.setItem('rv_cart',JSON.stringify(cart));localStorage.setItem('rv_user',JSON.stringify(user))}catch(e){}}
function users(){try{return JSON.parse(localStorage.getItem('rv_users')||'[]')}catch(e){return[]}}
function saveUsers(u){try{localStorage.setItem('rv_users',JSON.stringify(u))}catch(e){}}
function toast(m){const t=$('#toast');t.textContent=m;t.classList.add('on');clearTimeout(toast.h);toast.h=setTimeout(()=>t.classList.remove('on'),1800)}
function esc(s){return String(s).replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]))}

function card(p){return `<article class="card"><div class="thumb" style="background:${p.col}">${IC[p.i]}</div>
<div class="cb"><h3>${p.n}</h3><div class="meta">${p.c}</div><div class="price">${RD(p.p)}</div>
<div class="row"><select aria-label="Talla de ${p.n}" id="t${p.id}">${p.t.map(x=>`<option>${x}</option>`).join('')}</select>
<button class="btn" data-add="${p.id}">Agregar al carrito</button></div></div></article>`}

function home(){return `<section class="hero"><div><h1>Ropa que se queda contigo.</h1>
<p>Vestidos, blusas y pantalones con tallas y precios claros. Elige, agrega al carrito y compra desde cualquier lugar.</p>
<button class="btn" data-go="catalog">Ver catálogo</button> <button class="btn ghost" data-go="${user?'cart':'login'}">${user?'Ir al carrito':'Crear cuenta'}</button></div>
<div class="hero-art" aria-hidden="true">${IC.dress}</div></section>
<section class="sec"><h2>Novedades</h2><p class="sub">Una selección de la colección actual.</p><div class="grid">${P.slice(0,3).map(card).join('')}</div></section>
<section class="perks"><div><b>Precios y tallas claros</b><span>Ves lo que hay disponible antes de comprar.</span></div>
<div><b>Compra a cualquier hora</b><span>La tienda está abierta las 24 horas.</span></div>
<div><b>Sigue tu pedido</b><span>Consulta el estado de tus compras (próximamente).</span></div></section>`}

function catalog(){const cs=['Todas',...new Set(P.map(p=>p.c))];
return `<section class="sec" style="padding-top:2.5rem"><h2>Catálogo</h2><p class="sub">Filtra por categoría y elige tu talla.</p>
<div class="chips">${cs.map(c=>`<button class="chip" data-cat="${c}" aria-pressed="${c===cat}">${c}</button>`).join('')}</div>
<div class="grid">${P.filter(p=>cat==='Todas'||p.c===cat).map(card).join('')}</div></section>`}

function login(){const reg=mode==='reg';
return `<div class="box"><h2>${reg?'Crear cuenta':'Iniciar sesión'}</h2>
<div class="tabs"><button class="chip" data-mode="login" aria-pressed="${!reg}">Ya tengo cuenta</button><button class="chip" data-mode="reg" aria-pressed="${reg}">Soy nuevo</button></div>
<form id="f" novalidate>${reg?'<label for="nm">Nombre</label><input id="nm" autocomplete="name">':''}
<label for="em">Correo</label><input id="em" type="email" autocomplete="email">
<label for="pw">Contraseña</label><input id="pw" type="password" autocomplete="${reg?'new-password':'current-password'}">
<p class="err" id="err" role="alert"></p><button class="btn" style="width:100%;margin-top:.5rem">${reg?'Crear cuenta':'Entrar'}</button></form></div>`}

function cartV(){
if(!cart.length)return `<div class="empty"><h2>Tu carrito está vacío</h2><p>Agrega prendas desde el catálogo para verlas aquí.</p><button class="btn" data-go="catalog">Ir al catálogo</button></div>`;
const sub=cart.reduce((a,i)=>a+i.p*i.q,0),tax=Math.round(sub*IVA);
return `<h2 style="font-size:2.2rem;margin-top:2.5rem">Carrito</h2><div class="cart"><div>${cart.map((i,k)=>{const p=P.find(x=>x.id===i.id);return `<div class="item"><div class="thumb" style="background:${p.col}">${IC[p.i]}</div>
<div><b>${p.n}</b><div class="meta">Talla ${i.t} · ${RD(i.p)}</div><div class="qty"><button data-q="${k}" data-d="-1" aria-label="Quitar una unidad">−</button><span>${i.q}</span><button data-q="${k}" data-d="1" aria-label="Agregar una unidad">+</button></div></div>
<div><b>${RD(i.p*i.q)}</b><button class="rm" data-rm="${k}">Quitar</button></div></div>`}).join('')}</div>
<aside class="sum"><h3 style="font-size:1.5rem;margin-bottom:.5rem">Resumen</h3><div><span>Subtotal</span><span>${RD(sub)}</span></div><div><span>ITBIS (18 %)</span><span>${RD(tax)}</span></div>
<div class="tot"><span>Total</span><span>${RD(sub+tax)}</span></div>
<button class="btn" style="width:100%;margin-top:1rem" data-pay>Continuar al pago</button>
<p class="meta" style="margin:.7rem 0 0">El pago en línea se agregará en la próxima versión.</p></aside></div>`}

function render(){
 const v={home,catalog,login,cart:cartV}[view]();$('#app').innerHTML=v;
 $('#count').textContent=cart.reduce((a,i)=>a+i.q,0);
 $('#userbox').innerHTML=user?`<span class="meta">Hola, ${esc(user.name)}</span> <button class="lk" data-out>Salir</button>`:`<button class="lk" data-go="login">Iniciar sesión</button>`;
 const f=$('#f');if(f)f.addEventListener('submit',submit);
}
function go(v){view=v;render();window.scrollTo(0,0)}
function submit(e){e.preventDefault();const em=$('#em').value.trim().toLowerCase(),pw=$('#pw').value,er=$('#err');
 if(!/^\S+@\S+\.\S+$/.test(em))return er.textContent='Escribe un correo válido, por ejemplo nombre@correo.com.';
 if(pw.length<6)return er.textContent='La contraseña debe tener al menos 6 caracteres.';
 const us=users();
 if(mode==='reg'){const nm=$('#nm').value.trim();
  if(!nm)return er.textContent='Escribe tu nombre.';
  if(us.some(u=>u.em===em))return er.textContent='Ese correo ya tiene una cuenta. Inicia sesión.';
  us.push({nm,em,pw:btoa(unescape(encodeURIComponent(pw)))});saveUsers(us);user={name:nm,email:em};
 }else{const u=us.find(u=>u.em===em&&u.pw===btoa(unescape(encodeURIComponent(pw))));
  if(!u)return er.textContent='Correo o contraseña incorrectos. Revisa los datos o crea una cuenta.';user={name:u.nm,email:em}}
 save();toast('Sesión iniciada');go(cart.length?'cart':'home')}

document.addEventListener('click',e=>{const t=e.target.closest('button');if(!t)return;const d=t.dataset;
 if(d.go)return go(d.go);
 if(d.cat){cat=d.cat;return render()}
 if(d.mode){mode=d.mode;return render()}
 if(d.add){const p=P.find(x=>x.id==d.add),tl=document.getElementById('t'+p.id).value,f=cart.find(i=>i.id===p.id&&i.t===tl);
  f?f.q++:cart.push({id:p.id,t:tl,p:p.p,q:1});save();$('#count').textContent=cart.reduce((a,i)=>a+i.q,0);return toast(p.n+' (talla '+tl+') agregado')}
 if(d.q!==undefined){const i=cart[d.q];i.q+=+d.d;if(i.q<1)cart.splice(d.q,1);save();return render()}
 if(d.rm!==undefined){cart.splice(d.rm,1);save();return render()}
 if(d.out!==undefined){user=null;save();toast('Sesión cerrada');return go('home')}
 if(d.pay!==undefined){if(!user){toast('Inicia sesión para continuar');return go('login')}toast('El pago llega en la v2')}
});
load();render();
