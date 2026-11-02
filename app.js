const P=[
 {id:1,n:'Vestido Aurora',c:'Vestidos',p:2450,col:'#B0345C',cn:'Rosa',s:{S:4,M:3,L:2},i:'dress',d:'Vestido midi de caída suave, ideal para cenas y eventos.'},
 {id:2,n:'Blusa Marfil',c:'Blusas',p:1250,col:'#8E7AA8',cn:'Lila',s:{S:5,M:5,L:3,XL:1},i:'top',d:'Blusa ligera de manga corta, fácil de combinar.'},
 {id:3,n:'Pantalón Lino',c:'Pantalones',p:1890,col:'#5E8C7B',cn:'Verde',s:{S:3,M:4,L:4,XL:2},i:'pants',d:'Pantalón de lino fresco, corte recto y cintura alta.'},
 {id:4,n:'Vestido Brisa',c:'Vestidos',p:2790,col:'#D1788F',cn:'Rosa',s:{S:0,M:0,L:0},i:'dress',d:'Vestido largo con vuelo. Agotado por ahora.'},
 {id:5,n:'Blusa Coral',c:'Blusas',p:1390,col:'#C9824F',cn:'Naranja',s:{S:2,M:6,L:4},i:'top',d:'Blusa de tela fluida con cuello en V.'},
 {id:6,n:'Pantalón Sastre',c:'Pantalones',p:2150,col:'#4A4E7A',cn:'Azul',s:{S:2,M:3,L:3,XL:0},i:'pants',d:'Pantalón de corte sastre para oficina o salida formal.'}
];
const IC={
 dress:'<svg viewBox="0 0 64 64" fill="none" stroke="currentColor" stroke-width="3" stroke-linejoin="round"><path d="M24 6l8 8 8-8 3 14-6 8 10 30H17l10-30-6-8z"/></svg>',
 top:'<svg viewBox="0 0 64 64" fill="none" stroke="currentColor" stroke-width="3" stroke-linejoin="round"><path d="M22 8l10 6 10-6 16 12-8 10-6-4v28H20V26l-6 4-8-10z"/></svg>',
 pants:'<svg viewBox="0 0 64 64" fill="none" stroke="currentColor" stroke-width="3" stroke-linejoin="round"><path d="M18 6h28l4 52H36L32 26l-4 32H14z"/></svg>'
};
const IVA=0.18, ESTADOS=['Pendiente','Pagado','En preparación','Enviado','Entregado'];
let cart=[],user=null,orders=[],stk={},view='home',mode='login',lastOrder=null;
let F={q:'',cat:'Todas',talla:'',color:'',orden:''};
const $=s=>document.querySelector(s);
const RD=n=>'RD$'+n.toLocaleString('es-DO');
const esc=s=>String(s).replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
const J=(k,d)=>{try{return JSON.parse(localStorage.getItem(k))??d}catch(e){return d}};
const W=(k,v)=>{try{localStorage.setItem(k,JSON.stringify(v))}catch(e){}};
function load(){cart=J('rv_cart',[]);user=J('rv_user',null);orders=J('rv_orders',[]);stk=J('rv_stock',{})}
function save(){W('rv_cart',cart);W('rv_user',user);W('rv_orders',orders);W('rv_stock',stk)}
const prod=id=>P.find(p=>p.id==id);
const stock=(id,t)=>stk[id+'-'+t]??prod(id).s[t]??0;
const total=p=>Object.keys(p.s).reduce((a,t)=>a+stock(p.id,t),0);
const cartQty=(id,t)=>(cart.find(i=>i.id==id&&i.t===t)||{q:0}).q;
function toast(m){const t=$('#toast');t.textContent=m;t.classList.add('on');clearTimeout(toast.h);toast.h=setTimeout(()=>t.classList.remove('on'),2000)}
async function hash(s){try{const b=await crypto.subtle.digest('SHA-256',new TextEncoder().encode(s));return [...new Uint8Array(b)].map(x=>x.toString(16).padStart(2,'0')).join('')}catch(e){return btoa(unescape(encodeURIComponent(s)))}}
const sizeOpts=p=>Object.keys(p.s).map(t=>{const n=stock(p.id,t);return `<option value="${t}" ${n?'':'disabled'}>${t}${n?'':' (agotada)'}</option>`}).join('');

function card(p){const out=total(p)===0;
return `<article class="card"><div class="thumb" style="background:${p.col}">${IC[p.i]}${out?'<span class="tag">Agotado</span>':''}</div>
<div class="cb"><button class="ttl" data-det="${p.id}">${p.n}</button><div class="meta">${p.c} · ${p.cn}</div><div class="price">${RD(p.p)}</div>
<div class="row"><select aria-label="Talla de ${p.n}" id="t${p.id}" ${out?'disabled':''}>${sizeOpts(p)}</select>
<button class="btn" data-add="${p.id}" ${out?'disabled':''}>${out?'Agotado':'Agregar'}</button></div></div></article>`}

const FAQ=[['¿Cómo compro?','Elige tu talla, agrega al carrito, inicia sesión y confirma tus datos de entrega.'],
['¿Cómo pago?','Puedes elegir tarjeta, transferencia o pago contra entrega. En esta versión el pago es simulado.'],
['¿Puedo cancelar un pedido?','Sí, mientras no haya sido enviado, desde "Mis pedidos".'],
['¿Cambios y devoluciones?','Esta política se definirá con la tienda en una próxima versión.']];

function home(){return `<section class="hero"><div><h1>Ropa que se queda contigo.</h1>
<p>Vestidos, blusas y pantalones con tallas y precios claros. Elige, agrega al carrito y compra desde cualquier lugar.</p>
<button class="btn" data-go="catalog">Ver catálogo</button> <button class="btn ghost" data-go="${user?'orders':'login'}">${user?'Mis pedidos':'Crear cuenta'}</button></div>
<div class="hero-art" aria-hidden="true">${IC.dress}</div></section>
<section class="sec"><h2>Novedades</h2><p class="sub">Una selección de la colección actual.</p><div class="grid">${P.slice(0,3).map(card).join('')}</div></section>
<section class="perks"><div><b>Precios y tallas claros</b><span>Ves la disponibilidad real antes de comprar.</span></div>
<div><b>Compra a cualquier hora</b><span>La tienda está abierta las 24 horas.</span></div>
<div><b>Sigue tu pedido</b><span>Consulta el estado de tus compras en "Mis pedidos".</span></div></section>
<section class="faq"><h2 style="font-size:2rem;margin-bottom:.6rem">Preguntas frecuentes</h2>${FAQ.map(f=>`<details><summary>${f[0]}</summary><p>${f[1]}</p></details>`).join('')}</section>`}

function catalog(){const cs=['Todas',...new Set(P.map(p=>p.c))],cols=[...new Set(P.map(p=>p.cn))],ts=['S','M','L','XL'];
return `<section class="sec" style="padding-top:2.5rem"><h2>Catálogo</h2><p class="sub">Busca y filtra por categoría, talla, color o precio.</p>
<div class="bar"><input id="q" type="search" placeholder="Buscar prenda…" aria-label="Buscar prenda" value="${esc(F.q)}">
<select id="ft" aria-label="Talla"><option value="">Todas las tallas</option>${ts.map(t=>`<option ${F.talla===t?'selected':''}>${t}</option>`).join('')}</select>
<select id="fc" aria-label="Color"><option value="">Todos los colores</option>${cols.map(t=>`<option ${F.color===t?'selected':''}>${t}</option>`).join('')}</select>
<select id="fo" aria-label="Ordenar"><option value="">Ordenar por</option><option value="asc" ${F.orden==='asc'?'selected':''}>Precio: menor a mayor</option><option value="desc" ${F.orden==='desc'?'selected':''}>Precio: mayor a menor</option></select></div>
<div class="chips">${cs.map(c=>`<button class="chip" data-cat="${c}" aria-pressed="${c===F.cat}">${c}</button>`).join('')}</div>
<p class="cnt" id="cnt"></p><div class="grid" id="grid"></div></section>`}

function drawGrid(){let l=P.filter(p=>(F.cat==='Todas'||p.c===F.cat)&&(!F.color||p.cn===F.color)&&(!F.talla||(p.s[F.talla]!==undefined&&stock(p.id,F.talla)>0))&&(!F.q||(p.n+' '+p.c).toLowerCase().includes(F.q.toLowerCase())));
 if(F.orden)l.sort((a,b)=>F.orden==='asc'?a.p-b.p:b.p-a.p);
 $('#cnt').textContent=l.length+(l.length===1?' prenda':' prendas');
 $('#grid').innerHTML=l.length?l.map(card).join(''):'<p class="empty" style="grid-column:1/-1">No encontramos prendas con esos filtros.</p>'}

function detail(id){const p=prod(id),out=total(p)===0;
 $('#dlg').innerHTML=`<button class="x" data-close aria-label="Cerrar">×</button><div class="dg"><div class="thumb" style="background:${p.col}">${IC[p.i]}</div>
<div class="tx"><h3 style="font-size:1.9rem">${p.n}</h3><div class="meta">${p.c} · Color ${p.cn}</div><div class="price">${RD(p.p)}</div><p style="margin:0">${p.d}</p>
<div class="meta">Disponibles: ${Object.keys(p.s).map(t=>t+' ('+stock(p.id,t)+')').join(' · ')}</div>
<div class="row"><select aria-label="Talla" id="dt" ${out?'disabled':''}>${sizeOpts(p)}</select><button class="btn" data-addd="${p.id}" ${out?'disabled':''}>${out?'Agotado':'Agregar'}</button></div></div></div>`;
 $('#dlg').showModal()}

function login(){const reg=mode==='reg';
return `<div class="box"><h2>${reg?'Crear cuenta':'Iniciar sesión'}</h2>
<div class="tabs"><button class="chip" data-mode="login" aria-pressed="${!reg}">Ya tengo cuenta</button><button class="chip" data-mode="reg" aria-pressed="${reg}">Soy nuevo</button></div>
<form id="f" novalidate>${reg?'<label for="nm">Nombre</label><input id="nm" autocomplete="name">':''}
<label for="em">Correo</label><input id="em" type="email" autocomplete="email">
<label for="pw">Contraseña</label><input id="pw" type="password" autocomplete="${reg?'new-password':'current-password'}">
<p class="err" id="err" role="alert"></p><button class="btn" style="width:100%;margin-top:.5rem">${reg?'Crear cuenta':'Entrar'}</button></form></div>`}

const sub=()=>cart.reduce((a,i)=>a+prod(i.id).p*i.q,0);
function cartV(){
if(!cart.length)return `<div class="empty"><h2>Tu carrito está vacío</h2><p>Agrega prendas desde el catálogo para verlas aquí.</p><button class="btn" data-go="catalog">Ir al catálogo</button></div>`;
const s=sub(),tax=Math.round(s*IVA);
return `<h2 style="font-size:2.2rem;margin-top:2.5rem">Carrito</h2><div class="cart"><div>${cart.map((i,k)=>{const p=prod(i.id);return `<div class="item"><div class="thumb" style="background:${p.col}">${IC[p.i]}</div>
<div><b>${p.n}</b><div class="meta">Talla ${i.t} · ${RD(p.p)}</div><div class="qty"><button data-q="${k}" data-d="-1" aria-label="Quitar una unidad">−</button><span>${i.q}</span><button data-q="${k}" data-d="1" aria-label="Agregar una unidad">+</button></div></div>
<div><b>${RD(p.p*i.q)}</b><button class="rm" data-rm="${k}">Quitar</button></div></div>`}).join('')}</div>
<aside class="sum"><h3 style="font-size:1.5rem;margin-bottom:.5rem">Resumen</h3><div><span>Subtotal</span><span>${RD(s)}</span></div><div><span>ITBIS (18 %)</span><span>${RD(tax)}</span></div>
<div class="tot"><span>Total</span><span>${RD(s+tax)}</span></div>
<button class="btn" style="width:100%;margin-top:1rem" data-pay>Continuar al pago</button></aside></div>`}

function checkout(){const s=sub(),tax=Math.round(s*IVA);
return `<h2 style="font-size:2.2rem;margin-top:2.5rem">Datos de entrega y pago</h2><div class="co"><form id="fc2" novalidate><div class="fg">
<div class="full"><label for="cn">Nombre completo</label><input id="cn" value="${esc(user.name)}" autocomplete="name"></div>
<div><label for="ct">Teléfono</label><input id="ct" type="tel" autocomplete="tel" placeholder="809-000-0000"></div>
<div><label for="cc">Ciudad</label><input id="cc" autocomplete="address-level2" placeholder="Santo Domingo"></div>
<div class="full"><label for="cd">Dirección de entrega</label><input id="cd" autocomplete="street-address"></div></div>
<label>Método de pago</label><div class="pay"><label><input type="radio" name="mp" value="Tarjeta" checked> Tarjeta</label><label><input type="radio" name="mp" value="Transferencia"> Transferencia</label><label><input type="radio" name="mp" value="Contra entrega"> Contra entrega</label></div>
<p class="meta">Pago simulado: no se solicitan ni se guardan datos de tarjeta.</p><p class="err" id="err" role="alert"></p>
<button class="btn" style="margin-top:.5rem">Confirmar pedido</button></form>
<aside class="sum"><h3 style="font-size:1.5rem;margin-bottom:.5rem">Tu pedido</h3>${cart.map(i=>`<div><span>${i.q} × ${prod(i.id).n} (${i.t})</span><span>${RD(prod(i.id).p*i.q)}</span></div>`).join('')}
<div><span>ITBIS (18 %)</span><span>${RD(tax)}</span></div><div class="tot"><span>Total</span><span>${RD(s+tax)}</span></div></aside></div>`}

function done(){return `<div class="ok"><h2>¡Gracias por tu compra!</h2><p>Tu pedido fue registrado.</p><div class="num">${lastOrder.num}</div><p class="meta">Guarda este número para consultar el estado.</p>
<button class="btn" data-go="orders">Ver mis pedidos</button> <button class="btn ghost" data-go="catalog">Seguir comprando</button></div>`}

function ordersV(){const mine=orders.filter(o=>o.email===user.email).reverse();
return `<h2 style="font-size:2.2rem;margin-top:2.5rem">Mis pedidos</h2>`+(mine.length?mine.map(o=>`<div class="ord"><div class="oh"><b>${o.num}</b><span class="meta">${o.fecha} · ${o.pago}</span><span class="st ${o.estado}">${o.estado}</span></div>
<ul class="ol">${o.items.map(i=>`<li>${i.q} × ${esc(i.n)} (talla ${i.t})</li>`).join('')}</ul>
<div class="oh"><b>Total ${RD(o.total)}</b><span>${ESTADOS.indexOf(o.estado)>=0&&o.estado!=='Entregado'?`<button class="btn ghost" data-adv="${o.num}">Avanzar estado (demo)</button> `:''}${ESTADOS.indexOf(o.estado)>=0&&ESTADOS.indexOf(o.estado)<3?`<button class="lk" data-can="${o.num}">Cancelar</button>`:''}</span></div></div>`).join(''):`<div class="empty"><p>Aún no tienes pedidos.</p><button class="btn" data-go="catalog">Ir al catálogo</button></div>`)}

function render(){
 const v={home,catalog,login,cart:cartV,checkout,done,orders:ordersV}[view]();$('#app').innerHTML=v;
 if(view==='catalog')drawGrid();
 $('#count').textContent=cart.reduce((a,i)=>a+i.q,0);
 $('#userbox').innerHTML=user?`<button class="lk" data-go="orders">Mis pedidos</button><span class="meta">Hola, ${esc(user.name)}</span> <button class="lk" data-out>Salir</button>`:`<button class="lk" data-go="login">Iniciar sesión</button>`;
 const f=$('#f');if(f)f.addEventListener('submit',submit);
 const f2=$('#fc2');if(f2)f2.addEventListener('submit',placeOrder);
}
function go(v){if((v==='orders'||v==='checkout')&&!user){toast('Inicia sesión para continuar');v='login'}if(v==='checkout'&&!cart.length)v='cart';view=v;render();window.scrollTo(0,0)}

async function submit(e){e.preventDefault();const em=$('#em').value.trim().toLowerCase(),pw=$('#pw').value,er=$('#err');
 if(!/^\S+@\S+\.\S+$/.test(em))return er.textContent='Escribe un correo válido, por ejemplo nombre@correo.com.';
 if(pw.length<6)return er.textContent='La contraseña debe tener al menos 6 caracteres.';
 const us=J('rv_users',[]),h=await hash(pw);
 if(mode==='reg'){const nm=$('#nm').value.trim();
  if(!nm)return er.textContent='Escribe tu nombre.';
  if(us.some(u=>u.em===em))return er.textContent='Ese correo ya tiene una cuenta. Inicia sesión.';
  us.push({nm,em,pw:h});W('rv_users',us);user={name:nm,email:em};
 }else{const u=us.find(u=>u.em===em&&u.pw===h);
  if(!u)return er.textContent='Correo o contraseña incorrectos. Revisa los datos o crea una cuenta.';user={name:u.nm,email:em}}
 save();toast('Sesión iniciada');go(cart.length?'cart':'home')}

function placeOrder(e){e.preventDefault();const er=$('#err');
 const nm=$('#cn').value.trim(),tel=$('#ct').value.trim(),ci=$('#cc').value.trim(),di=$('#cd').value.trim();
 if(!nm||!ci||!di)return er.textContent='Completa nombre, ciudad y dirección de entrega.';
 if(!/^[\d\s()+-]{7,}$/.test(tel))return er.textContent='Escribe un teléfono válido.';
 for(const i of cart){if(i.q>stock(i.id,i.t))return er.textContent=`Ya no hay suficiente stock de ${prod(i.id).n} (talla ${i.t}). Ajusta tu carrito.`}
 const seq=J('rv_seq',0)+1;W('rv_seq',seq);
 const s=sub(),o={num:'RV-'+String(seq).padStart(5,'0'),email:user.email,fecha:new Date().toLocaleDateString('es-DO'),pago:document.querySelector('input[name=mp]:checked').value,
  dir:di+', '+ci,tel,total:s+Math.round(s*IVA),estado:'Pendiente',items:cart.map(i=>({id:i.id,t:i.t,q:i.q,n:prod(i.id).n}))};
 cart.forEach(i=>stk[i.id+'-'+i.t]=stock(i.id,i.t)-i.q);
 orders.push(o);lastOrder=o;cart=[];save();go('done')}

document.addEventListener('input',e=>{const id=e.target.id;
 if(id==='q'){F.q=e.target.value;drawGrid()}});
document.addEventListener('change',e=>{const id=e.target.id;
 if(id==='ft'){F.talla=e.target.value;drawGrid()}
 if(id==='fc'){F.color=e.target.value;drawGrid()}
 if(id==='fo'){F.orden=e.target.value;drawGrid()}});
function addToCart(id,t){const p=prod(id);if(!t)return;
 if(cartQty(id,t)+1>stock(id,t))return toast('No hay más unidades en talla '+t);
 const f=cart.find(i=>i.id==id&&i.t===t);f?f.q++:cart.push({id:+id,t,q:1});save();$('#count').textContent=cart.reduce((a,i)=>a+i.q,0);toast(p.n+' (talla '+t+') agregado')}
document.addEventListener('click',e=>{const t=e.target.closest('button');if(!t)return;const d=t.dataset;
 if(d.go)return go(d.go);
 if(d.cat){F.cat=d.cat;return render()}
 if(d.mode){mode=d.mode;return render()}
 if(d.det)return detail(d.det);
 if(d.close!==undefined)return $('#dlg').close();
 if(d.add)return addToCart(d.add,document.getElementById('t'+d.add).value);
 if(d.addd){addToCart(d.addd,$('#dt').value);return $('#dlg').close()}
 if(d.q!==undefined){const i=cart[d.q];if(+d.d>0&&i.q+1>stock(i.id,i.t))return toast('No hay más unidades en talla '+i.t);i.q+=+d.d;if(i.q<1)cart.splice(d.q,1);save();return render()}
 if(d.rm!==undefined){cart.splice(d.rm,1);save();return render()}
 if(d.out!==undefined){user=null;save();toast('Sesión cerrada');return go('home')}
 if(d.pay!==undefined)return go('checkout');
 if(d.adv){const o=orders.find(x=>x.num===d.adv);o.estado=ESTADOS[ESTADOS.indexOf(o.estado)+1];save();return render()}
 if(d.can){const o=orders.find(x=>x.num===d.can);o.items.forEach(i=>stk[i.id+'-'+i.t]=stock(i.id,i.t)+i.q);o.estado='Cancelado';save();toast('Pedido cancelado');return render()}
});
$('#dlg').addEventListener('click',e=>{if(e.target.id==='dlg')e.target.close()});
load();render();
