document.addEventListener('DOMContentLoaded', () => {
  // 1. Mobile Menu (Burger Toggle)
  const burger = document.getElementById('burger');
  const header = document.getElementById('header');
  
  if (burger && header) {
    burger.addEventListener('click', () => {
      const isOpen = header.classList.contains('is-open');
      header.classList.toggle('is-open');
      burger.setAttribute('aria-expanded', !isOpen);
    });
  }

  // 2. Scroll Progress Bar
  const progressBar = document.getElementById('progress');
  if (progressBar) {
    window.addEventListener('scroll', () => {
      const winScroll = document.body.scrollTop || document.documentElement.scrollTop;
      const height = document.documentElement.scrollHeight - document.documentElement.clientHeight;
      const scrolled = winScroll / height;
      progressBar.style.transform = `scaleX(${scrolled})`;
    }, { passive: true });
  }

  const tabDriver = document.getElementById('tab-driver');
  const tabBiz = document.getElementById('tab-biz');
  const panelDriver = document.getElementById('panel-driver');
  const panelBiz = document.getElementById('panel-biz');

  if (tabDriver && tabBiz && panelDriver && panelBiz) {
    tabDriver.addEventListener('click', () => {
      tabDriver.classList.add('is-active');
      tabBiz.classList.remove('is-active');
      tabDriver.setAttribute('aria-selected', 'true');
      tabBiz.setAttribute('aria-selected', 'false');
      panelDriver.removeAttribute('hidden');
      panelBiz.setAttribute('hidden', '');
    });

    tabBiz.addEventListener('click', () => {
      tabBiz.classList.add('is-active');
      tabDriver.classList.remove('is-active');
      tabBiz.setAttribute('aria-selected', 'true');
      tabDriver.setAttribute('aria-selected', 'false');
      panelBiz.removeAttribute('hidden');
      panelDriver.setAttribute('hidden', '');
    });
  }

  const cookieBanner = document.getElementById('cookie-banner');
  const btnAccept = document.getElementById('cookie-accept');
  const btnDecline = document.getElementById('cookie-decline');

  if (cookieBanner && !localStorage.getItem('rsi_cookie_consent')) {
    cookieBanner.removeAttribute('hidden');
  }

  const closeBanner = (status) => {
    localStorage.setItem('rsi_cookie_consent', status);
    cookieBanner.classList.add('is-hiding');
    setTimeout(() => {
      cookieBanner.setAttribute('hidden', '');
    }, 400); 
  };

  if (btnAccept) {
    btnAccept.addEventListener('click', () => closeBanner('accepted'));
  }

  if (btnDecline) {
    btnDecline.addEventListener('click', () => closeBanner('declined'));
  }
});
