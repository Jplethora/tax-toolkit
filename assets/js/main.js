document.addEventListener('DOMContentLoaded', function() {
  const headerEl = document.getElementById('site-header');
  const footerEl = document.getElementById('site-footer');
  if(headerEl) fetch('partials/header.html').then(r=>r.text()).then(h=>{headerEl.innerHTML=h; const t=document.getElementById('mobileToggle'); const m=document.getElementById('mobileMenu'); if(t) t.onclick=()=>m.classList.toggle('active');});
  if(footerEl) fetch('partials/footer.html').then(r=>r.text()).then(h=>footerEl.innerHTML=h);
});