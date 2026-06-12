// MediW Public Pages — Common JS

// Theme toggle (persist to localStorage)
(function(){
  const saved = localStorage.getItem('mediw-theme');
  if (saved) document.documentElement.setAttribute('data-theme', saved);
})();

function toggleTheme(){
  const cur = document.documentElement.getAttribute('data-theme') || 'dark';
  const next = cur === 'dark' ? 'light' : 'dark';
  document.documentElement.setAttribute('data-theme', next);
  localStorage.setItem('mediw-theme', next);
}

// FAQ accordion
document.addEventListener('click', (e) => {
  const q = e.target.closest('.faq-q');
  if (!q) return;
  q.parentElement.classList.toggle('open');
});
