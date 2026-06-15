// ---- DATA STORE ----
let state = {
  orders: [],
  clients: [],
  transactions: [
    {id:1,type:'in',desc:'Venda — Kit Dia das Mães',val:180,date:'2026-06-01'},
    {id:2,type:'in',desc:'Venda — Caixa Personalizada',val:120,date:'2026-06-02'},
    {id:3,type:'out',desc:'Compra papel especial',val:45,date:'2026-06-03'},
    {id:4,type:'in',desc:'Sinal — Pedido aniversário',val:80,date:'2026-06-04'},
    {id:5,type:'out',desc:'Fita cetim e laços',val:30,date:'2026-06-05'},
  ],
  currentPage: 'dashboard',
  orderFilter: 'all',
  editingOrder: null,
  calYear: 2026,
  calMonth: 5
};

// ---- SAMPLE PRODUCTS ----
const PRODUCTS = [
  {id:1,name:'Caixa Personalizada',cat:'Caixas',emoji:'📦',cost:35,price:120,time:'2-3 dias'},
  {id:2,name:'Kit Dia das Mães',cat:'Kits',emoji:'🌸',cost:60,price:180,time:'3-4 dias'},
  {id:3,name:'Flor Felpuda',cat:'Flores',emoji:'🌺',cost:20,price:65,time:'1-2 dias'},
  {id:4,name:'Porta-Joias Romântico',cat:'Kits',emoji:'💍',cost:45,price:150,time:'2-3 dias'},
  {id:5,name:'Cartão Personalizado',cat:'Papelaria',emoji:'💌',cost:5,price:25,time:'1 dia'},
  {id:6,name:'Kit Namorados',cat:'Kits',emoji:'❤️',cost:80,price:250,time:'4-5 dias'},
  {id:7,name:'Tag Presente',cat:'Papelaria',emoji:'🏷️',cost:2,price:10,time:'1 dia'},
  {id:8,name:'Sacola Decorada',cat:'Caixas',emoji:'🛍️',cost:15,price:45,time:'1 dia'},
];

const PORTFOLIO = [
  {emoji:'📦',title:'Kit Namorados Rosa',cat:'Kits',date:'Mai 2026'},
  {emoji:'🌸',title:'Caixa Dia das Mães',cat:'Caixas',date:'Mai 2026'},
  {emoji:'💌',title:'Cartão Aniversário',cat:'Papelaria',date:'Abr 2026'},
  {emoji:'🌺',title:'Buquê Felpudo Lilás',cat:'Flores',date:'Abr 2026'},
  {emoji:'🎁',title:'Kit Presentes Especiais',cat:'Kits',date:'Mar 2026'},
  {emoji:'💍',title:'Porta-joias Premium',cat:'Kits',date:'Mar 2026'},
  {emoji:'🛍️',title:'Sacola Personalizada',cat:'Caixas',date:'Fev 2026'},
  {emoji:'🏷️',title:'Tags Românticas',cat:'Papelaria',date:'Fev 2026'},
];

const SPECIAL_DATES = [
  {emoji:'❤️',name:'Dia dos Namorados',date:'12 de Junho',daysLeft:4,suggestions:'Kits românticos, caixas coração, cartões'},
  {emoji:'👩',name:'Dia das Mães',date:'2º Dom de Maio',daysLeft:338,suggestions:'Flores felpudas, kits especiais, porta-joias'},
  {emoji:'👨',name:'Dia dos Pais',date:'2º Dom de Agosto',daysLeft:65,suggestions:'Caixas personalizadas, kits, cartões'},
  {emoji:'🎄',name:'Natal',date:'25 de Dezembro',daysLeft:200,suggestions:'Kits natalinos, caixas decoradas, tags'},
  {emoji:'🎉',name:'Ano Novo',date:'31 de Dezembro',daysLeft:206,suggestions:'Kits celebração, cartões personalizados'},
  {emoji:'📚',name:'Volta às Aulas',date:'Fevereiro',daysLeft:260,suggestions:'Papelaria, tags escolares, kits'},
];

// ---- PERSIST ----
function save(){localStorage.setItem('tataah_state', JSON.stringify({orders:state.orders, clients:state.clients, transactions:state.transactions}))}
function load(){
  const s = localStorage.getItem('tataah_state');
  if(s){const d=JSON.parse(s);state.orders=d.orders||[];state.clients=d.clients||[];state.transactions=d.transactions||state.transactions;}
}

// ---- NAVIGATION ----
const pageConfig = {
  dashboard:{title:'Dashboard',sub:'Visão geral do negócio',btn:'Novo Pedido',action:'pedido'},
  pedidos:{title:'Gestão de Pedidos',sub:'Acompanhe cada encomenda',btn:'Novo Pedido',action:'pedido'},
  clientes:{title:'Clientes',sub:'Sua base de clientes especiais',btn:'Novo Cliente',action:'cliente'},
  produtos:{title:'Catálogo de Produtos',sub:'Seus produtos e serviços',btn:'Novo Produto',action:'produto'},
  financeiro:{title:'Financeiro',sub:'Controle de entradas e saídas',btn:'Nova Transação',action:'transacao'},
  precificacao:{title:'Calculadora de Preços',sub:'Calcule o preço justo dos seus produtos',btn:'Salvar Cálculo',action:''},
  agenda:{title:'Agenda de Produção',sub:'Seus pedidos no calendário',btn:'Novo Pedido',action:'pedido'},
  datas:{title:'Datas Comemorativas',sub:'Planeje suas campanhas com antecedência',btn:'',action:''},
  portfolio:{title:'Portfólio',sub:'Seus trabalhos realizados',btn:'',action:''},
};
function showPage(p){
  document.querySelectorAll('.page').forEach(el=>el.classList.remove('active'));
  document.querySelectorAll('.nav-item').forEach(el=>el.classList.remove('active'));
  document.getElementById('page-'+p).classList.add('active');
  document.querySelectorAll('.nav-item').forEach(el=>{if(el.getAttribute('onclick')&&el.getAttribute('onclick').includes("'"+p+"'"))el.classList.add('active')});
  const cfg = pageConfig[p]||{};
  document.getElementById('page-title').textContent = cfg.title||p;
  document.getElementById('page-subtitle').textContent = cfg.sub||'';
  const btn = document.getElementById('main-action-btn');
  if(cfg.btn){btn.style.display='flex';btn.innerHTML='<i class="ti ti-plus"></i> '+cfg.btn;btn.onclick=()=>openMainModal(cfg.action);}
  else{btn.style.display='none';}
  state.currentPage = p;
  if(p==='pedidos')renderOrders();
  if(p==='clientes')renderClients();
  if(p==='produtos')renderProducts();
  if(p==='financeiro')renderTransactions();
  if(p==='agenda')renderCalendar();
  if(p==='datas')renderDates();
  if(p==='portfolio')renderPortfolio();
  if(p==='dashboard')updateDashboard();
}
function openMainModal(type){
  if(!type||type==='pedido')openModal('modal-pedido');
  else if(type==='cliente')openModal('modal-cliente');
  else if(type==='transacao')openModal('modal-transacao');
}
function openModal(id){document.getElementById(id).classList.add('open')}
function closeModal(id){document.getElementById(id).classList.remove('open')}

// ---- ORDERS ----
function saveOrder(){
  const nome = document.getElementById('f-nome').value.trim();
  const tel = document.getElementById('f-tel').value.trim();
  const produto = document.getElementById('f-produto').value.trim();
  const valor = parseFloat(document.getElementById('f-valor').value)||0;
  const dataPedido = document.getElementById('f-data-pedido').value;
  const dataEntrega = document.getElementById('f-data-entrega').value;
  const status = document.getElementById('f-status').value;
  const pagamento = document.getElementById('f-pagamento').value;
  const obs = document.getElementById('f-obs').value;
  if(!nome||!produto){showToast('⚠️ Preencha nome e produto!');return;}
  if(state.editingOrder!==null){
    state.orders[state.editingOrder]={...state.orders[state.editingOrder],nome,tel,produto,valor,dataPedido,dataEntrega,status,pagamento,obs};
    state.editingOrder=null;
  } else {
    const id = 'TAT-'+(state.orders.length+1).toString().padStart(3,'0');
    state.orders.push({id,nome,tel,produto,valor,dataPedido,dataEntrega,status,pagamento,obs});
    if(!state.clients.find(c=>c.nome===nome)){
      state.clients.push({id:Date.now(),nome,tel,instagram:'',nasc:'',datas:''});
    }
  }
  save();
  closeModal('modal-pedido');
  clearOrderForm();
  renderOrders();
  updateDashboard();
  showToast('✨ Pedido salvo com sucesso!');
}
function clearOrderForm(){['f-nome','f-tel','f-produto','f-valor','f-data-pedido','f-data-entrega','f-obs'].forEach(id=>document.getElementById(id).value='');document.getElementById('f-status').value='Orçamento';}

const STATUS_COLS = ['Orçamento','Aprovado','Produção','Pronto','Entregue'];
const STATUS_BADGE = {Orçamento:'badge-orcamento',Aprovado:'badge-aprovado','Produção':'badge-producao',Pronto:'badge-pronto',Entregue:'badge-entregue'};
let orderFilterVal = 'all';
function filterOrders(v){orderFilterVal=v;renderOrders();}
function renderOrders(){
  const search = (document.getElementById('order-search')||{}).value||'';
  const board = document.getElementById('kanban-board');
  let filtered = state.orders.filter(o=>!search||(o.nome+o.produto).toLowerCase().includes(search.toLowerCase()));
  if(orderFilterVal!=='all')filtered=filtered.filter(o=>o.status===orderFilterVal);
  board.innerHTML = STATUS_COLS.map(col=>{
    const cards = filtered.filter(o=>o.status===col);
    return `<div class="kanban-col">
      <div class="kanban-col-title">${col}<span class="kanban-count">${cards.length}</span></div>
      ${cards.length===0?`<div style="font-size:12px;color:var(--text-soft);text-align:center;padding:20px 0">Nenhum pedido</div>`:''}
      ${cards.map(o=>`<div class="kanban-card" onclick="editOrder('${o.id}')">
        <div class="kanban-card-id">#${o.id}</div>
        <div class="kanban-card-name">${o.nome}</div>
        <div class="kanban-card-product">${o.produto}</div>
        <div class="kanban-card-footer">
          <span class="kanban-card-date">${o.dataEntrega?formatDate(o.dataEntrega):'Sem data'}</span>
          <span class="kanban-card-value">R$ ${o.valor.toFixed(2)}</span>
        </div>
      </div>`).join('')}
    </div>`;
  }).join('');
}
function editOrder(id){
  const idx = state.orders.findIndex(o=>o.id===id);
  if(idx<0)return;
  const o = state.orders[idx];
  state.editingOrder=idx;
  document.getElementById('f-nome').value=o.nome;
  document.getElementById('f-tel').value=o.tel;
  document.getElementById('f-produto').value=o.produto;
  document.getElementById('f-valor').value=o.valor;
  document.getElementById('f-data-pedido').value=o.dataPedido;
  document.getElementById('f-data-entrega').value=o.dataEntrega;
  document.getElementById('f-status').value=o.status;
  document.getElementById('f-pagamento').value=o.pagamento||'Pix';
  document.getElementById('f-obs').value=o.obs;
  document.getElementById('modal-pedido-title').textContent='Editar Pedido 🦋';
  openModal('modal-pedido');
}
function formatDate(d){if(!d)return'';const p=d.split('-');return`${p[2]}/${p[1]}`;}

// ---- CLIENTS ----
function saveClient(){
  const nome=document.getElementById('c-nome').value.trim();
  const tel=document.getElementById('c-tel').value.trim();
  const instagram=document.getElementById('c-insta').value.trim();
  const nasc=document.getElementById('c-nasc').value;
  const datas=document.getElementById('c-datas').value.trim();
  if(!nome){showToast('⚠️ Preencha o nome!');return;}
  state.clients.push({id:Date.now(),nome,tel,instagram,nasc,datas,compras:0});
  save();
  closeModal('modal-cliente');
  ['c-nome','c-tel','c-insta','c-nasc','c-datas'].forEach(id=>document.getElementById(id).value='');
  renderClients();
  updateDashboard();
  showToast('🌸 Cliente cadastrado!');
}
function renderClients(){
  const search=(document.getElementById('client-search')||{}).value||'';
  const grid=document.getElementById('clients-grid');
  let list=state.clients.filter(c=>!search||c.nome.toLowerCase().includes(search.toLowerCase()));
  if(list.length===0){grid.innerHTML=`<div style="grid-column:1/-1;text-align:center;padding:40px;color:var(--text-soft)"><div style="font-size:40px;margin-bottom:12px">🌸</div><p>Nenhum cliente cadastrado ainda</p><button class="btn btn-primary" style="margin-top:12px" onclick="openModal('modal-cliente')"><i class="ti ti-plus"></i> Adicionar Cliente</button></div>`;return;}
  grid.innerHTML=list.map(c=>{
    const initials=c.nome.split(' ').map(w=>w[0]).join('').substring(0,2).toUpperCase();
    const orders=state.orders.filter(o=>o.nome===c.nome);
    const total=orders.reduce((s,o)=>s+o.valor,0);
    return`<div class="client-card">
      <div class="client-avatar">${initials}</div>
      <div class="client-name">${c.nome}</div>
      <div class="client-phone">${c.tel||'Sem telefone'}</div>
      <div class="client-stats">
        <div class="client-stat"><div class="client-stat-val">${orders.length}</div><div class="client-stat-lbl">Pedidos</div></div>
        <div class="client-stat"><div class="client-stat-val">R$${Math.round(total)}</div><div class="client-stat-lbl">Total gasto</div></div>
        ${c.instagram?`<div class="client-stat"><div class="client-stat-val" style="font-size:12px">${c.instagram}</div><div class="client-stat-lbl">Instagram</div></div>`:''}
      </div>
    </div>`;
  }).join('');
}

// ---- PRODUCTS ----
let productFilter='all';
function filterProducts(f){productFilter=f;renderProducts();}
function renderProducts(){
  const grid=document.getElementById('products-grid');
  const list=productFilter==='all'?PRODUCTS:PRODUCTS.filter(p=>p.cat===productFilter);
  grid.innerHTML=list.map(p=>`<div class="product-card">
    <div class="product-thumb" style="background:var(--rose-pearl)">${p.emoji}</div>
    <div class="product-body">
      <div class="product-name">${p.name}</div>
      <div class="product-cat">${p.cat}</div>
      <div class="product-prices">
        <span class="product-cost">Custo R$${p.cost}</span>
        <span class="product-price">R$ ${p.price}</span>
      </div>
      <div style="font-size:11px;color:var(--text-soft);margin-top:6px">⏱ ${p.time}</div>
    </div>
  </div>`).join('');
}

// ---- FINANCEIRO ----
function openAddTransaction(){openModal('modal-transacao');}
function saveTransaction(){
  const tipo=document.getElementById('t-tipo').value;
  const val=parseFloat(document.getElementById('t-valor').value)||0;
  const desc=document.getElementById('t-desc').value.trim();
  if(!desc||!val){showToast('⚠️ Preencha todos os campos!');return;}
  state.transactions.unshift({id:Date.now(),type:tipo,desc,val,date:new Date().toISOString().slice(0,10)});
  save();
  closeModal('modal-transacao');
  document.getElementById('t-valor').value='';
  document.getElementById('t-desc').value='';
  renderTransactions();
  showToast('💰 Transação salva!');
}
function renderTransactions(){
  const list=document.getElementById('transactions-list');
  let totalIn=0,totalOut=0;
  state.transactions.forEach(t=>{if(t.type==='in')totalIn+=t.val;else totalOut+=t.val;});
  document.getElementById('fin-in').textContent='R$ '+totalIn.toLocaleString('pt-BR',{minimumFractionDigits:2});
  document.getElementById('fin-out').textContent='R$ '+totalOut.toLocaleString('pt-BR',{minimumFractionDigits:2});
  document.getElementById('fin-profit').textContent='R$ '+(totalIn-totalOut).toLocaleString('pt-BR',{minimumFractionDigits:2});
  list.innerHTML=state.transactions.slice(0,15).map(t=>`<div class="trans-row">
    <div class="trans-icon ${t.type}"><i class="ti ti-${t.type==='in'?'arrow-down':'arrow-up'}"></i></div>
    <div><div class="trans-desc">${t.desc}</div><div style="font-size:11px;color:var(--text-soft)">${formatDate(t.date)}</div></div>
    <div></div>
    <div class="trans-val ${t.type}">${t.type==='in'?'+':'-'} R$ ${t.val.toFixed(2)}</div>
  </div>`).join('');
}

// ---- PRICING ----
function calcPrice(){
  const papel=parseFloat(document.getElementById('p-papel').value)||0;
  const impressao=parseFloat(document.getElementById('p-impressao').value)||0;
  const fita=parseFloat(document.getElementById('p-fita').value)||0;
  const embalagem=parseFloat(document.getElementById('p-embalagem').value)||0;
  const mdo=parseFloat(document.getElementById('p-mdo').value)||0;
  const horas=parseFloat(document.getElementById('p-horas').value)||0;
  const margem=parseFloat(document.getElementById('p-margem').value)||0;
  const materiais=papel+impressao+fita+embalagem;
  const trabalho=mdo*horas;
  const custo=materiais+trabalho;
  const lucro=custo*(margem/100);
  const final=custo+lucro;
  document.getElementById('pr-materiais').textContent='R$ '+materiais.toFixed(2);
  document.getElementById('pr-mdo').textContent='R$ '+trabalho.toFixed(2);
  document.getElementById('pr-custo').textContent='R$ '+custo.toFixed(2);
  document.getElementById('pr-lucro').textContent='R$ '+lucro.toFixed(2);
  document.getElementById('pr-final').innerHTML='<strong>R$ '+final.toFixed(2)+'</strong>';
  document.getElementById('price-result').textContent='R$ '+final.toFixed(2);
}

// ---- CALENDAR ----
const MONTHS=['Janeiro','Fevereiro','Março','Abril','Maio','Junho','Julho','Agosto','Setembro','Outubro','Novembro','Dezembro'];
const DAYS=['Dom','Seg','Ter','Qua','Qui','Sex','Sáb'];
function changeMonth(d){state.calMonth+=d;if(state.calMonth>11){state.calMonth=0;state.calYear++;}if(state.calMonth<0){state.calMonth=11;state.calYear--;}renderCalendar();}
function renderCalendar(){
  document.getElementById('cal-month-title').textContent=MONTHS[state.calMonth]+' '+state.calYear;
  const first=new Date(state.calYear,state.calMonth,1).getDay();
  const days=new Date(state.calYear,state.calMonth+1,0).getDate();
  const today=new Date();
  const grid=document.getElementById('cal-grid');
  let html=DAYS.map(d=>`<div class="cal-day-name">${d}</div>`).join('');
  for(let i=0;i<first;i++)html+=`<div class="cal-day other-month"><div class="cal-day-num">&nbsp;</div></div>`;
  for(let d=1;d<=days;d++){
    const isToday=today.getDate()===d&&today.getMonth()===state.calMonth&&today.getFullYear()===state.calYear;
    const dateStr=state.calYear+'-'+(state.calMonth+1).toString().padStart(2,'0')+'-'+d.toString().padStart(2,'0');
    const dayOrders=state.orders.filter(o=>o.dataEntrega===dateStr);
    let events='';
    if(d===12&&state.calMonth===5)events+=`<div class="cal-event date">❤️ Dia Namorados</div>`;
    dayOrders.forEach(o=>events+=`<div class="cal-event delivery">📦 ${o.nome.split(' ')[0]}</div>`);
    html+=`<div class="cal-day${isToday?' today':''}"><div class="cal-day-num">${d}</div>${events}</div>`;
  }
  grid.innerHTML=html;
}

// ---- DATES ----
function renderDates(){
  const grid=document.getElementById('dates-grid');
  grid.innerHTML=SPECIAL_DATES.map(d=>`<div class="date-card">
    <div class="date-emoji">${d.emoji}</div>
    <div class="date-name">${d.name}</div>
    <div class="date-when">📅 ${d.date}</div>
    <div class="date-countdown">${d.daysLeft} dias</div>
    <div class="date-suggestion">💡 ${d.suggestions}</div>
  </div>`).join('');
}

// ---- PORTFOLIO ----
function renderPortfolio(){
  const grid=document.getElementById('portfolio-grid');
  grid.innerHTML=PORTFOLIO.map(p=>`<div class="product-card">
    <div class="product-thumb" style="background:var(--rose-pearl)">${p.emoji}</div>
    <div class="product-body">
      <div class="product-name">${p.title}</div>
      <div class="product-cat">${p.cat}</div>
      <div style="font-size:12px;color:var(--text-soft);margin-top:6px">📅 ${p.date}</div>
    </div>
  </div>`).join('');
}

// ---- DASHBOARD ----
function updateDashboard(){
  const active=state.orders.filter(o=>o.status!=='Entregue');
  document.getElementById('dash-andamento').textContent=active.length;
  const week=state.orders.filter(o=>{
    if(!o.dataEntrega)return false;
    const d=new Date(o.dataEntrega);const now=new Date();
    return(d-now)/(1000*60*60*24)<=7&&(d-now)>=0;
  });
  document.getElementById('dash-semana').textContent=week.length;
  document.getElementById('dash-clientes').textContent=state.clients.length;
}

// ---- TOAST ----
function showToast(msg){const t=document.getElementById('toast');t.textContent=msg;t.classList.add('show');setTimeout(()=>t.classList.remove('show'),2800);}

// ---- CHARTS ----
function initCharts(){
  const fatCtx=document.getElementById('fatChart').getContext('2d');
  new Chart(fatCtx,{type:'line',data:{
    labels:['Jan','Fev','Mar','Abr','Mai','Jun'],
    datasets:[{
      label:'Faturamento',
      data:[1800,2200,2600,2900,3250,3840],
      borderColor:'#F7B6B6',backgroundColor:'rgba(247,182,182,0.1)',
      borderWidth:2.5,pointBackgroundColor:'#F7B6B6',pointRadius:4,tension:.4,fill:true
    }]
  },options:{responsive:true,plugins:{legend:{display:false}},scales:{x:{grid:{display:false},ticks:{font:{size:11},color:'#B89089'}},y:{grid:{color:'rgba(247,182,182,0.15)'},ticks:{font:{size:11},color:'#B89089',callback:v=>'R$'+v}}}}});

  const catCtx=document.getElementById('catChart').getContext('2d');
  new Chart(catCtx,{type:'doughnut',data:{
    labels:['Caixas','Kits','Flores','Papelaria'],
    datasets:[{data:[35,28,22,15],backgroundColor:['#F7B6B6','#FADDD6','#C8A69A','#EDD89A'],borderWidth:0,hoverOffset:6}]
  },options:{responsive:true,cutout:'68%',plugins:{legend:{position:'bottom',labels:{font:{size:11},color:'#8A6358',boxWidth:12,padding:10}}}}});
}

// ---- INIT ----
window.addEventListener('DOMContentLoaded',()=>{
  load();
  updateDashboard();
  setTimeout(initCharts,100);
  calcPrice();
  document.querySelectorAll('.modal-overlay').forEach(m=>{
    m.addEventListener('click',e=>{if(e.target===m)m.classList.remove('open');});
  });
});