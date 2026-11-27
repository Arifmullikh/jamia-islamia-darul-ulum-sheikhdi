/* App Logic: Native EN/BN Switcher, Theme View Transition, Role Matrix, Live Search, Drawers */
const ROLES = {
  en: [
    [
      { h: "Sign-In", items: ["Registered mobile number + 4–6 digit PIN", "Secured through Firebase Authentication", "PIN can be changed anytime in Settings"] },
      { h: "What You See", items: ["Your linked child's daily attendance and 30-day calendar", "Madrasah notices and published exam results", "Tuition and fee payment receipts", "Offline Quran, Hadith, Qibla, and prayer times"] },
      { h: "What Stays Private", items: ["Other families and students are completely hidden", "Attendance, marks, and fee ledgers are read-only", "No access to staff logs or office backups"] }
    ],
    [
      { h: "Sign-In", items: ["Office-issued email and password", "Limited strictly to assigned jamats", "Access can be paused instantly by the Muhtamim"] },
      { h: "What You Manage", items: ["Daily attendance for your assigned classes", "Paper fee receipt photos (if fee permission is enabled)", "Draft exam marks before publication and class routines", "Your own staff leave requests"] },
      { h: "What Stays Private", items: ["Unassigned classes and admin settings are hidden", "Published results and student monthly fees cannot be changed", "Full madrasah database exports remain admin-only"] }
    ],
    [
      { h: "Sign-In", items: ["Admin email and password via Firebase Auth", "Creates ustad and guardian accounts without losing session", "Sets individual permissions for each ustad"] },
      { h: "What You Manage", items: ["All jamats, students, attendance, notices, and fees", "Staff leave approvals, message history, and activity logs", "Local Excel (.xlsx) and JSON office backups", "Madrasah name, message templates, and grading rules"] },
      { h: "Built-In Safeguards", items: ["Raw user passwords and guardian PINs are never visible", "Backups automatically strip secret and token fields", "Deactivated staff cannot sign in or edit cloud records"] }
    ]
  ],
  bn: [
    [
      { h: "প্রবেশ পদ্ধতি", items: ["নিবন্ধিত মোবাইল নম্বর ও ৪–৬ সংখ্যার গোপন পিন", "Firebase Authentication-এর মাধ্যমে নিরাপদ যাচাই", "সেটিংস থেকে যেকোনো সময় পিন বদলানোর সুবিধা"] },
      { h: "যা দেখতে পাবেন", items: ["নিজের সন্তানের দৈনিক ও ৩০ দিনের হাজিরার হিসাব", "মাদরাসার জরুরি নোটিশ ও প্রকাশিত পরীক্ষার ফলাফল", "বেতন ও ফি পরিশোধের রসিদ ইতিহাস", "অফলাইন কুরআন, হাদিস, কিবলা ও নামাজের সময়"] },
      { h: "সীমাবদ্ধতা", items: ["অন্য কোনো ছাত্র বা পরিবারের তথ্য দেখা যায় না", "হাজিরা, নম্বর বা বেতনের হিসাব পরিবর্তন করা যায় না", "স্টাফ কাজের লগ বা অফিস ব্যাকআপে প্রবেশ নেই"] }
    ],
    [
      { h: "প্রবেশ পদ্ধতি", items: ["অফিস থেকে দেওয়া ইমেইল ও পাসওয়ার্ড", "শুধুমাত্র নির্ধারিত জামাতের মধ্যেই সীমাবদ্ধ", "মুহতামিম চাইলে যেকোনো সময় অ্যাক্সেস বন্ধ করতে পারেন"] },
      { h: "যা পরিচালনা করবেন", items: ["নিজ দায়িত্বের জামাতে দৈনিক হাজিরা গ্রহণ", "অনুমতি থাকলে ফি আদায় ও রসিদের ছবি সংরক্ষণ", "রেজাল্ট প্রকাশের আগে নম্বর এন্ট্রি ও ক্লাস রুটিন", "নিজের ছুটির আবেদন ও পেন্ডিং আবেদন বাতিল"] },
      { h: "সীমাবদ্ধতা", items: ["অন্য জামাত বা অ্যাডমিন সেটিংসে প্রবেশ করা যায় না", "প্রকাশিত পরীক্ষার নম্বর বা মাসিক বেতন বদলানো যায় না", "সম্পূর্ণ অফিস ব্যাকআপ ডাউনলোডের অনুমতি নেই"] }
    ],
    [
      { h: "প্রবেশ পদ্ধতি", items: ["ইমেইল ও পাসওয়ার্ডে মুহতামিম অ্যাকাউন্ট", "নিজের সেশন ঠিক রেখেই উস্তাদ ও অভিভাবক অ্যাকাউন্ট তৈরি", "প্রতিটি উস্তাদের কাজের সীমা আলাদাভাবে নির্ধারণ"] },
      { h: "যা পরিচালনা করবেন", items: ["সব জামাত, ছাত্র, হাজিরা, নোটিশ ও বেতন-ফি", "শিক্ষকদের ছুটি অনুমোদন, বার্তা লগ ও কাজের ইতিহাস", "Excel (.xlsx) ও JSON ফরম্যাটে লোকাল ব্যাকআপ", "মাদরাসার নাম, বার্তার ধরন ও ফলাফলের গ্রেড নিয়ম"] },
      { h: "অতিরিক্ত সুরক্ষা", items: ["কারও পাসওয়ার্ড বা অভিভাবকের পিন দেখা যায় না", "ব্যাকআপ ফাইলে কোনো পাসওয়ার্ড, পিন বা টোকেন থাকে না", "নিষ্ক্রিয় করা স্টাফ ক্লাউডে কোনো পরিবর্তন করতে পারেন না"] }
    ]
  ]
};

let currentLang = 'en';
let currentRole = 0;

window.activateScene = function (idx) {
  document.querySelectorAll('.chapter').forEach((el, i) => el.classList.toggle('active', i === idx));
  document.querySelectorAll('.scene').forEach((el, i) => el.classList.toggle('active', i === idx));
  document.querySelectorAll('.d-dot').forEach((el, i) => el.classList.toggle('active', i === idx));
};

function renderRoleCols() {
  const box = document.getElementById('roleCols');
  if (!box) return;
  const cols = ROLES[currentLang][currentRole];
  box.classList.add('swapping');
  setTimeout(() => {
    box.innerHTML = cols.map(c => `
      <div class="role-col">
        <h4>${c.h}</h4>
        <ul>${c.items.map(i => `<li>${i}</li>`).join('')}</ul>
      </div>
    `).join('');
    box.classList.remove('swapping');
  }, 130);
}

window.setRole = function (idx) {
  currentRole = idx;
  const glider = document.getElementById('roleGlider');
  if (glider) glider.style.transform = `translateX(${idx * 100}%)`;
  document.querySelectorAll('.seg-btn').forEach((b, i) => b.setAttribute('aria-selected', i === idx ? 'true' : 'false'));
  renderRoleCols();
};

window.toggleDrawer = function (btn) {
  const row = btn.closest('.perm-row');
  const open = row.getAttribute('data-open') === 'true';
  row.setAttribute('data-open', open ? 'false' : 'true');
};

window.setLang = function (next, save = true) {
  currentLang = next === 'bn' ? 'bn' : 'en';
  document.documentElement.lang = currentLang;
  document.body.classList.toggle('lang-bn', currentLang === 'bn');
  const bEn = document.getElementById('btnEn');
  const bBn = document.getElementById('btnBn');
  if (bEn) bEn.setAttribute('aria-pressed', currentLang === 'en');
  if (bBn) bBn.setAttribute('aria-pressed', currentLang === 'bn');

  document.querySelectorAll('[data-en][data-bn]').forEach(el => {
    el.textContent = el.dataset[currentLang];
  });
  document.querySelectorAll('[data-lang]').forEach(el => {
    el.hidden = el.getAttribute('data-lang') !== currentLang;
  });

  const sf = document.getElementById('searchField');
  if (sf) {
    sf.placeholder = currentLang === 'bn'
      ? 'নীতিমালার ভেতরে খুঁজুন (যেমন: ক্যামেরা, লোকেশন, অভিভাবক, ডিলিট)...'
      : 'Search the full policy (e.g., camera, location, guardian, deletion)...';
  }

  renderRoleCols();
  if (typeof window.runSearch === 'function') window.runSearch();
  if (typeof window.updateTocBar === 'function') setTimeout(window.updateTocBar, 50);
  if (typeof ScrollTrigger !== 'undefined') setTimeout(() => ScrollTrigger.refresh(), 100);
  if (save) { try { localStorage.setItem('sheikhdi_lang', currentLang); } catch (_) {} }
};

function applyTheme(t, save = true) {
  const theme = t === 'light' ? 'light' : 'dark';
  document.documentElement.setAttribute('data-theme', theme);
  const sw = document.getElementById('themeSwitch');
  if (sw) sw.setAttribute('aria-pressed', theme === 'dark' ? 'true' : 'false');
  const m = document.querySelector('meta[name="theme-color"]');
  if (m) m.setAttribute('content', theme === 'dark' ? '#030407' : '#fbfbfd');
  window.dispatchEvent(new CustomEvent('sheikhdi-theme-change', { detail: theme }));
  if (save) { try { localStorage.setItem('sheikhdi_theme', theme); } catch (_) {} }
}

const themeSwitch = document.getElementById('themeSwitch');
if (themeSwitch) {
  themeSwitch.addEventListener('click', (e) => {
    const next = document.documentElement.getAttribute('data-theme') === 'dark' ? 'light' : 'dark';
    const r = e.currentTarget.getBoundingClientRect();
    document.documentElement.style.setProperty('--vt-x', `${r.left + r.width / 2}px`);
    document.documentElement.style.setProperty('--vt-y', `${r.top + r.height / 2}px`);
    if (document.startViewTransition && !window.matchMedia('(prefers-reduced-motion: reduce)').matches) {
      document.startViewTransition(() => applyTheme(next));
    } else {
      applyTheme(next);
    }
  });
}

/* Search */
const searchField = document.getElementById('searchField');
const searchBadge = document.getElementById('searchBadge');
const searchClear = document.getElementById('searchClear');

window.runSearch = function () {
  if (!searchField) return;
  const q = searchField.value.trim().toLowerCase();
  const articles = Array.from(document.querySelectorAll('#policyBody .policy-article'));
  let count = 0;
  articles.forEach(a => {
    const hit = !q || a.textContent.toLowerCase().includes(q);
    a.classList.toggle('hidden-search', !hit);
    if (hit) count++;
  });
  if (searchClear) searchClear.classList.toggle('show', q.length > 0);
  const nm = document.getElementById('noMatch');
  if (nm) nm.style.display = (q.length > 0 && count === 0) ? 'block' : 'none';
  if (searchBadge) {
    if (q.length > 0) {
      searchBadge.textContent = currentLang === 'bn' ? `${count}টি অংশ` : `${count} match${count === 1 ? '' : 'es'}`;
      searchBadge.classList.add('show');
    } else {
      searchBadge.classList.remove('show');
    }
  }
};

window.clearSearch = function () {
  if (!searchField) return;
  searchField.value = '';
  window.runSearch();
  searchField.focus();
};

if (searchField) {
  searchField.addEventListener('input', window.runSearch);
  document.addEventListener('keydown', (e) => {
    if (e.key === '/' && document.activeElement !== searchField) { e.preventDefault(); searchField.focus(); }
    else if (e.key === 'Escape' && document.activeElement === searchField) { window.clearSearch(); searchField.blur(); }
  });
}

/* Toast & Copy */
let toastTimer = null;
window.copyText = function (txt, label) {
  if (navigator.clipboard && navigator.clipboard.writeText) {
    navigator.clipboard.writeText(txt).then(() => {
      const t = document.getElementById('toast');
      if (!t) return;
      const shown = label || (txt.length > 48 ? (currentLang === 'bn' ? 'আবেদনের বার্তা' : 'request text') : txt);
      t.textContent = (currentLang === 'bn' ? 'কপি হয়েছে: ' : 'Copied: ') + shown;
      t.classList.add('show');
      clearTimeout(toastTimer);
      toastTimer = setTimeout(() => t.classList.remove('show'), 2200);
    }).catch(() => {});
  }
};

(function boot() {
  const params = new URLSearchParams(window.location.search);
  let t = 'dark', l = 'en';
  try {
    t = localStorage.getItem('sheikhdi_theme') || 'dark';
    l = params.get('lang') || localStorage.getItem('sheikhdi_lang') || 'en';
  } catch (_) {}
  applyTheme(t, false);
  window.setLang(l, false);
})();
