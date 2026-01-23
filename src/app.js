/* Spendify Mobile — ensure login view disappears after successful sign-in
   - Hides the login container (display:none) after login or signup
   - Restores it when logging out
   - Keeps previous fixes (login by email or display name)
*/

(() => {
  // --- Elements ---
  const sidebar = document.getElementById('sidebar');
  const overlay = document.getElementById('overlay');
  const burgerBtn = document.getElementById('burgerBtn');
  const navButtons = Array.from(document.querySelectorAll('.nav-btn'));
  const tabButtons = Array.from(document.querySelectorAll('.tab-btn'));
  const pageTitle = document.getElementById('pageTitle');
  const pageSubtitle = document.getElementById('pageSubtitle');
  const userNameEl = document.getElementById('userName');
  const sidebarUser = document.getElementById('sidebarUser');
  const sidebarEmail = document.getElementById('sidebarEmail');

  // Views
  const loginView = document.getElementById('loginView');
  const signupCard = document.getElementById('signupCard');
  const loginForm = document.getElementById('loginForm');
  const signupForm = document.getElementById('signupForm');
  const appView = document.getElementById('appView');
  const screens = Array.from(document.querySelectorAll('.screen'));

  // Login
  const loginEmail = document.getElementById('loginEmail');
  const loginPassword = document.getElementById('loginPassword');
  const errEmail = document.getElementById('errEmail');
  const errPassword = document.getElementById('errPassword');
  const remember = document.getElementById('remember');
  const showSignup = document.getElementById('showSignup');
  const cancelSignup = document.getElementById('cancelSignup');

  // Signup
  const signupName = document.getElementById('signupName');
  const signupEmail = document.getElementById('signupEmail');
  const signupPassword = document.getElementById('signupPassword');
  const errName = document.getElementById('errName');
  const errSignupEmail = document.getElementById('errSignupEmail');
  const errSignupPassword = document.getElementById('errSignupPassword');

  // App controls
  const logoutBtn = document.getElementById('logoutBtn');
  const demoDataBtn = document.getElementById('demoData');

  // Dashboard
  const balanceEl = document.getElementById('balance');
  const incomeEl = document.getElementById('income');
  const expenseEl = document.getElementById('expense');
  const recentList = document.getElementById('recentList');

  // Add form
  const addScreen = document.getElementById('add');
  const txnForm = document.getElementById('txnForm');
  const typeBtns = Array.from(document.querySelectorAll('.type-btn'));
  const descriptionInput = document.getElementById('description');
  const amountInput = document.getElementById('amount');
  const categorySelect = document.getElementById('category');
  const dateInput = document.getElementById('date');
  const editingIdEl = document.getElementById('editingId');
  const errDesc = document.getElementById('errDesc');
  const errAmt = document.getElementById('errAmt');
  const errCat = document.getElementById('errCat');
  const errDate = document.getElementById('errDate');
  const cancelTxn = document.getElementById('cancelTxn');

  // History
  const historyList = document.getElementById('historyList');
  const searchInput = document.getElementById('search');
  const filterCategory = document.getElementById('filterCategory');

  // Categories
  const catList = document.getElementById('catList');

  // Settings
  const profileName = document.getElementById('profileName');
  const saveSettings = document.getElementById('saveSettings');
  const exportBtn = document.getElementById('exportBtn');
  const clearBtn = document.getElementById('clearBtn');

  // Storage keys & state
  const ACCOUNTS_KEY = 'spendify_accounts_v1';
  const SESSION_KEY = 'spendify_session_v1';
  const TXNS_KEY = 'spendify_txns_v3';
  const PROFILE_KEY = 'spendify_profile_v1';

  let accounts = {};
  let session = null;
  let txns = [];
  let profile = { name: '', currency: 'LKR' };

  // --- Utilities ---
  function uid(){ return Date.now().toString(36) + Math.random().toString(36).slice(2,8); }
  function pseudoHash(str){ let h=0; for(let i=0;i<str.length;i++) h=(h<<5)-h+str.charCodeAt(i); return String(h>>>0); }
  function validateEmail(v){ return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(v); }
  function recentDate(offset=0){ const d=new Date(); d.setDate(d.getDate()+offset); return d.toISOString().slice(0,10); }
  function formatLKR(v){ const s = Number(v).toLocaleString('en-LK',{minimumFractionDigits:2,maximumFractionDigits:2}); return `LKR ${s}`; }

  // --- Storage helpers ---
  function loadAccounts(){ try { accounts = JSON.parse(localStorage.getItem(ACCOUNTS_KEY)) || {}; } catch(e){ accounts = {}; } }
  function saveAccounts(){ localStorage.setItem(ACCOUNTS_KEY, JSON.stringify(accounts)); }

  function loadSession(){ try{ session = JSON.parse(localStorage.getItem(SESSION_KEY)) || null; } catch(e){ session = null; } }
  function saveSession(){ session ? localStorage.setItem(SESSION_KEY, JSON.stringify(session)) : localStorage.removeItem(SESSION_KEY); }

  function currentUserKey(){ return session ? session.email : '__guest__'; }

  function loadTxns(){ try { const all = JSON.parse(localStorage.getItem(TXNS_KEY)) || {}; txns = all[currentUserKey()] || []; } catch(e){ txns = []; } }
  function saveTxns(){ try { const all = JSON.parse(localStorage.getItem(TXNS_KEY)) || {}; all[currentUserKey()] = txns; localStorage.setItem(TXNS_KEY, JSON.stringify(all)); } catch(e) {} }

  function loadProfile(){ try { const all = JSON.parse(localStorage.getItem(PROFILE_KEY)) || {}; profile = all[currentUserKey()] || { name:'', currency: 'LKR' }; } catch(e){ profile = { name:'', currency:'LKR' }; } }
  function saveProfile(){ try { const all = JSON.parse(localStorage.getItem(PROFILE_KEY)) || {}; all[currentUserKey()] = profile; localStorage.setItem(PROFILE_KEY, JSON.stringify(all)); } catch(e){} }

  // --- UI helpers for hiding/showing login container properly ---
  function hideLoginContainer() {
    // remove from layout completely so it doesn't overlay app
    loginView.style.display = 'none';
    loginView.setAttribute('aria-hidden', 'true');
    signupCard.classList.add('hidden'); // ensure signup also hidden
  }
  function showLoginContainer() {
    loginView.style.display = ''; // revert to stylesheet
    loginView.setAttribute('aria-hidden', 'false');
    signupCard.classList.add('hidden');
  }

  // --- UI: burger menu ---
  function openMenu(){ sidebar.setAttribute('aria-hidden','false'); overlay.classList.remove('hidden'); burgerBtn.setAttribute('aria-expanded','true'); }
  function closeMenu(){ sidebar.setAttribute('aria-hidden','true'); overlay.classList.add('hidden'); burgerBtn.setAttribute('aria-expanded','false'); }
  burgerBtn.addEventListener('click', ()=> { sidebar.getAttribute('aria-hidden') === 'true' ? openMenu() : closeMenu(); });
  overlay.addEventListener('click', closeMenu);

  // --- App routing (mobile screens) ---
  function showScreen(id){
    screens.forEach(s => s.classList.add('hidden'));
    const el = document.getElementById(id);
    if(el) el.classList.remove('hidden');
    const map = { dashboard:['Dashboard','Overview'], add:['Add','Quick add'], history:['History','Your transactions'], categories:['Categories','Insights'], settings:['Settings','Profile'], about:['Help','About'] };
    const t = map[id] || ['Spendify',''];
    pageTitle.textContent = t[0]; pageSubtitle.textContent = t[1];
    closeMenu();
  }
  navButtons.forEach(b => b.addEventListener('click', ()=> showScreen(b.dataset.route)));
  tabButtons.forEach(b => b.addEventListener('click', ()=> showScreen(b.dataset.route)));

  // ---------------------------
  // Authentication: login/signup
  // ---------------------------
  function showLogin(){ showLoginContainer(); appView.classList.add('hidden'); }
  function showApp(){ hideLoginContainer(); appView.classList.remove('hidden'); showScreen('dashboard'); }

  showSignup.addEventListener('click', ()=> signupCard.classList.remove('hidden'));
  cancelSignup.addEventListener('click', ()=> signupCard.classList.add('hidden'));

  // Ensure demo account exists
  function ensureDemo(){
    loadAccounts();
    const demo = 'demo@local';
    if(!accounts[demo]){
      accounts[demo] = { name: 'Demo User', email: demo, passwordHash: pseudoHash('password') };
      saveAccounts();
      try {
        const all = JSON.parse(localStorage.getItem(TXNS_KEY)) || {};
        all[demo] = [
          { id: uid(), description: 'Salary', amount: 200000, type: 'income', category: 'Salary', date: recentDate(-10) },
          { id: uid(), description: 'Grocery', amount: 7300, type: 'expense', category: 'Food', date: recentDate(-8) }
        ];
        localStorage.setItem(TXNS_KEY, JSON.stringify(all));
        const allp = JSON.parse(localStorage.getItem(PROFILE_KEY)) || {};
        allp[demo] = { name: 'Demo User', currency: 'LKR' };
        localStorage.setItem(PROFILE_KEY, JSON.stringify(allp));
      } catch(e){ /* ignore */ }
    }
  }

  signupForm.addEventListener('submit', (e)=>{
    e.preventDefault();
    errName.textContent = ''; errSignupEmail.textContent = ''; errSignupPassword.textContent = '';
    const name = (signupName.value || '').trim();
    const emailRaw = (signupEmail.value || '').trim();
    const email = emailRaw.toLowerCase();
    const pwd = signupPassword.value || '';
    let ok = true;
    if(!name){ errName.textContent = 'Enter your name'; ok = false; }
    if(!validateEmail(email)){ errSignupEmail.textContent = 'Enter a valid email'; ok = false; }
    if(pwd.length < 6){ errSignupPassword.textContent = 'Password must be 6+ chars'; ok = false; }
    if(!ok) return;

    loadAccounts();
    if(accounts[email]){ errSignupEmail.textContent = 'Account already exists'; return; }

    accounts[email] = { name, email, passwordHash: pseudoHash(pwd) };
    saveAccounts();

    // auto-login: hide login container completely
    session = { email }; saveSession();
    txns = []; saveTxns();
    profile = { name, currency: 'LKR' }; saveProfile();
    applyProfileToUI();
    showApp(); // Hides login container and shows appView
    refreshAll();
  });

  // LOGIN: accept email or display name
  loginForm.addEventListener('submit', (e)=>{
    e.preventDefault();
    errEmail.textContent = ''; errPassword.textContent = '';
    const identifierRaw = (loginEmail.value || '').trim();
    const pwd = loginPassword.value || '';

    if(!identifierRaw){ errEmail.textContent = 'Enter email or name'; return; }
    if(pwd.length < 6){ errPassword.textContent = 'Password must be 6+ chars'; return; }

    loadAccounts(); // ensure latest

    // Determine email from identifier: either direct email or find by name
    let emailKey = null;
    if(identifierRaw.includes('@')){
      const candidate = identifierRaw.toLowerCase();
      if(!validateEmail(candidate)){ errEmail.textContent = 'Enter a valid email'; return; }
      emailKey = candidate;
    } else {
      // search accounts by name (case-insensitive)
      const nameLower = identifierRaw.toLowerCase();
      const match = Object.values(accounts).find(a => (a.name || '').toLowerCase() === nameLower);
      if(match) emailKey = match.email;
      else {
        const partial = Object.values(accounts).find(a => (a.name || '').toLowerCase().startsWith(nameLower));
        if(partial) emailKey = partial.email;
      }
    }

    if(!emailKey || !accounts[emailKey]){
      errEmail.textContent = 'No account found for that email or name';
      return;
    }

    const acc = accounts[emailKey];
    if(acc.passwordHash !== pseudoHash(pwd)){
      errPassword.textContent = 'Incorrect password';
      return;
    }

    // success: hide login container and show app
    session = { email: emailKey };
    if(remember.checked) localStorage.setItem('spendify_remember', '1'); else localStorage.removeItem('spendify_remember');
    saveSession();

    loadTxns(); loadProfile(); applyProfileToUI(); showApp(); refreshAll();
  });

  // Logout
  logoutBtn.addEventListener('click', ()=>{
    session = null;
    saveSession();
    txns = [];
    profile = { name:'', currency:'LKR' };
    // show login container again
    showLogin();
  });

  demoDataBtn.addEventListener('click', ()=>{
    if(!session){ alert('Sign in to add demo items.'); return; }
    if(!confirm('Append demo transactions?')) return;
    const demo = [
      { id: uid(), description: 'Cafe', amount: 560, type: 'expense', category: 'Food', date: recentDate(-2) },
      { id: uid(), description: 'Freelance', amount: 48000, type: 'income', category: 'Salary', date: recentDate(-7) }
    ];
    txns = txns.concat(demo);
    saveTxns(); refreshAll();
  });

  // ---------------------------
  // Transactions & UI refresh
  // ---------------------------
  function loadTxnsForUser(){ loadTxns(); loadProfile(); }

  function refreshAll(){
    loadTxns(); loadProfile(); applyProfileToUI(); renderTotals(); renderRecent(); populateCategoriesFilter(); renderHistory(); renderCategoryInsights(); animateDonutSafe();
  }

  function renderTotals(){
    const income = txns.filter(t=>t.type==='income').reduce((s,t)=>s+Number(t.amount),0);
    const expense = txns.filter(t=>t.type==='expense').reduce((s,t)=>s+Number(t.amount),0);
    const balance = income - expense;
    animateNumber(balanceEl, balance); animateNumber(incomeEl, income); animateNumber(expenseEl, expense);
  }

  function animateNumber(el, target){
    const start = parseFloat((el.dataset._value && Number(el.dataset._value)) || 0);
    const end = Number(target);
    el.dataset._value = String(end);
    const duration = 700;
    const startTime = performance.now();
    function tick(now){
      const t = Math.min(1,(now - startTime)/duration);
      const eased = 1 - Math.pow(1 - t, 3);
      const val = start + (end - start) * eased;
      el.textContent = formatLKR(val.toFixed(2));
      if(t < 1) requestAnimationFrame(tick);
      else { el.classList.add('highlight'); setTimeout(()=>el.classList.remove('highlight'),300); }
    }
    requestAnimationFrame(tick);
  }

  function renderRecent(){
    recentList.innerHTML = '';
    const list = txns.slice().sort((a,b)=> new Date(b.date) - new Date(a.date)).slice(0,5);
    if(list.length===0){ recentList.innerHTML = '<li class="muted">No transactions yet</li>'; return; }
    list.forEach(t=>{
      const li = document.createElement('li'); li.className='txn-item';
      li.innerHTML = `<div class="txn-left"><div class="txn-icon">${emojiFor(t.category)}</div>
        <div><div class="bold">${t.description}</div><div class="muted small">${t.category} • ${t.date}</div></div></div>
        <div class="amount ${t.type==='income'?'income':'expense'}">${t.type==='expense'?'-':''}${formatLKR(t.amount)}</div>`;
      recentList.appendChild(li);
    });
  }

  function emojiFor(c){ const map={Salary:'💰',Food:'🍽️',Transport:'🚗',Rent:'🏠',Utilities:'🔌',Entertainment:'🎮',Health:'🩺',Other:'🔖'}; return map[c]||'🧾'; }

  // Add / edit transactions
  txnForm.addEventListener('submit', (e)=>{
    e.preventDefault();
    errDesc.textContent=''; errAmt.textContent=''; errCat.textContent=''; errDate.textContent='';
    const desc = (descriptionInput.value||'').trim();
    const amt = parseFloat(amountInput.value);
    const cat = (categorySelect.value||'').trim();
    const date = dateInput.value || recentDate(0);
    if(!desc){ errDesc.textContent='Enter a description'; return; }
    if(!amt || isNaN(amt) || amt<=0){ errAmt.textContent='Enter amount > 0'; return; }
    if(!cat){ errCat.textContent='Pick a category'; return; }
    const type = (typeBtns.find(b=>b.classList.contains('active'))||{dataset:{val:'expense'}}).dataset.val;
    const editing = editingIdEl.value;
    if(editing){
      const idx = txns.findIndex(t=>t.id===editing);
      if(idx>=0) txns[idx] = { id: editing, description: desc, amount: amt, category: cat, date, type };
    } else {
      txns.push({ id: uid(), description: desc, amount: amt, category: cat, date, type });
    }
    saveTxns();
    txnForm.reset(); editingIdEl.value=''; typeBtns.forEach(b=>b.classList.toggle('active', b.dataset.val==='expense'));
    showScreen('dashboard'); refreshAll();
  });

  typeBtns.forEach(b=>b.addEventListener('click', ()=> { typeBtns.forEach(x=>x.classList.remove('active')); b.classList.add('active'); }));
  cancelTxn.addEventListener('click', ()=> { txnForm.reset(); editingIdEl.value=''; typeBtns.forEach(b=>b.classList.toggle('active', b.dataset.val==='expense')); showScreen('dashboard'); });

  // History & categories
  function populateCategoriesFilter(){
    const set = new Set(txns.map(t=>t.category).filter(Boolean));
    filterCategory.innerHTML = '<option value="">All</option>';
    set.forEach(c=>{ const opt=document.createElement('option'); opt.value=c; opt.textContent=c; filterCategory.appendChild(opt); });
  }
  function renderHistory(){
    historyList.innerHTML='';
    const q = (searchInput.value||'').trim().toLowerCase();
    const cat = filterCategory.value;
    let list = txns.slice().sort((a,b)=> new Date(b.date)-new Date(a.date));
    if(cat) list = list.filter(t=>t.category===cat);
    if(q) list = list.filter(t=>(t.description+' '+t.category).toLowerCase().includes(q));
    if(list.length===0){ historyList.innerHTML='<li class="muted">No transactions</li>'; return; }
    list.forEach(t=>{
      const li=document.createElement('li'); li.className='txn-item';
      li.innerHTML=`<div class="txn-left"><div class="txn-icon">${emojiFor(t.category)}</div><div><div class="bold">${t.description}</div><div class="muted small">${t.category} • ${t.date}</div></div></div>
        <div style="display:flex;gap:8px;align-items:center"><div class="amount">${t.type==='expense'?'-':''}${formatLKR(t.amount)}</div>
        <button class="btn edit" data-id="${t.id}">✏️</button><button class="btn ghost del" data-id="${t.id}">🗑️</button></div>`;
      historyList.appendChild(li);
    });
  }
  historyList.addEventListener('click', (e)=> {
    const ed = e.target.closest('.edit'), del = e.target.closest('.del');
    if(ed){ const id = ed.dataset.id; startEditTxn(id); }
    if(del){ const id = del.dataset.id; if(confirm('Delete?')){ txns = txns.filter(t=>t.id!==id); saveTxns(); refreshAll(); } }
  });
  searchInput.addEventListener('input', renderHistory);
  filterCategory.addEventListener('change', renderHistory);

  function startEditTxn(id){
    const t = txns.find(x=>x.id===id); if(!t) return;
    showScreen('add'); editingIdEl.value = t.id; descriptionInput.value = t.description; amountInput.value = t.amount; categorySelect.value = t.category; dateInput.value = t.date;
    typeBtns.forEach(b=>b.classList.toggle('active', b.dataset.val===t.type));
  }

  function renderCategoryInsights(){
    const map = {};
    txns.forEach(t=>{ const k = t.category||'Other'; if(!map[k]) map[k]=0; if(t.type==='expense') map[k]+=Number(t.amount); });
    const entries = Object.entries(map).sort((a,b)=>b[1]-a[1]);
    catList.innerHTML='';
    if(entries.length===0){ catList.innerHTML='<li class="muted">No data yet</li>'; return; }
    entries.forEach(([k,v])=>{ const li=document.createElement('li'); li.className='txn-item'; li.innerHTML=`<div>${emojiFor(k)} ${k}</div><div class="muted">${formatLKR(v)}</div>`; catList.appendChild(li); });
  }

  // Settings
  saveSettings && saveSettings.addEventListener('click', ()=> {
    if(!session) return alert('Sign in first');
    profile.name = (profileName.value||'').trim() || profile.name || (accounts[session.email] && accounts[session.email].name) || 'You';
    saveProfile(); applyProfileToUI(); alert('Saved');
  });

  exportBtn && exportBtn.addEventListener('click', ()=> {
    if(!session) return alert('Sign in first');
    const payload = { profile, txns }; const blob = new Blob([JSON.stringify(payload, null, 2)], { type:'application/json' });
    const url = URL.createObjectURL(blob); const a = document.createElement('a'); a.href=url; a.download='spendify-export.json'; a.click(); URL.revokeObjectURL(url);
  });

  clearBtn && clearBtn.addEventListener('click', ()=> { if(!session) return alert('Sign in first'); if(!confirm('Clear ALL transactions?')) return; txns=[]; saveTxns(); refreshAll(); });

  // profile UI
  function applyProfileToUI(){
    if(session){
      const display = profile.name || (accounts[session.email] && accounts[session.email].name) || 'You';
      userNameEl.textContent = display; sidebarUser.textContent = display; sidebarEmail.textContent = session.email;
      profileName.value = profile.name || (accounts[session.email] && accounts[session.email].name) || '';
    } else {
      userNameEl.textContent = 'You'; sidebarUser.textContent = 'You'; sidebarEmail.textContent = 'guest';
    }
  }

  function animateDonutSafe(){ try { /* no-op placeholder */ } catch(e){} }

  // --- Init & auto-login ---
  function loadInitial(){
    ensureDemo();
    loadAccounts();
    loadSession();
    if(session && accounts[session.email]){
      loadTxns(); loadProfile(); applyProfileToUI(); hideLoginContainer(); appView.classList.remove('hidden'); refreshAll();
    } else {
      if(localStorage.getItem('spendify_remember') && accounts['demo@local']){
        session = { email:'demo@local' }; saveSession(); loadTxns(); loadProfile(); applyProfileToUI(); hideLoginContainer(); appView.classList.remove('hidden'); refreshAll();
      } else {
        showLoginContainer(); appView.classList.add('hidden');
      }
    }
    dateInput.value = new Date().toISOString().slice(0,10);
  }

  document.addEventListener('DOMContentLoaded', loadInitial);

  // Expose debug
  window._spendify = { accounts, loadAccounts, saveAccounts, session, txns, refreshAll };
})();