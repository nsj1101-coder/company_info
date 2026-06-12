/* ============================================================
   MEDI-W Admin v03 — Common JavaScript
   ============================================================ */

document.addEventListener('DOMContentLoaded', () => {
  initSidebar();
  initNotification();
  initCheckboxes();
  initTabs();
  initToggles();
  initModals();
  initPanels();
  requestAnimationFrame(() => document.documentElement.classList.remove('preload'));
});

/* === Sidebar Collapse/Expand === */
function initSidebar() {
  const sidebar = document.getElementById('sidebar');
  const toggleBtn = document.getElementById('sidebarToggle');
  if (!sidebar || !toggleBtn) return;

  // Restore state
  if (localStorage.getItem('sidebar-collapsed') === 'true') {
    sidebar.classList.add('collapsed');
    document.body.classList.add('sidebar-collapsed');
    document.documentElement.classList.add('sidebar-collapsed');
  }

  toggleBtn.addEventListener('click', () => {
    const on = sidebar.classList.toggle('collapsed');
    document.body.classList.toggle('sidebar-collapsed', on);
    document.documentElement.classList.toggle('sidebar-collapsed', on);
    localStorage.setItem('sidebar-collapsed', on);
  });
}

/* === Notification Dropdown === */
function initNotification() {
  const bellBtn = document.querySelector('.bell-btn');
  const dropdown = document.querySelector('.noti-dropdown');
  if (!bellBtn || !dropdown) return;

  bellBtn.addEventListener('click', (e) => {
    e.stopPropagation();
    dropdown.classList.toggle('open');
  });

  document.addEventListener('click', (e) => {
    if (!dropdown.contains(e.target) && !bellBtn.contains(e.target)) {
      dropdown.classList.remove('open');
    }
  });

  // Mark all read
  const readAllBtn = dropdown.querySelector('.noti-read-all');
  if (readAllBtn) {
    readAllBtn.addEventListener('click', () => {
      dropdown.querySelectorAll('.noti-item').forEach(item => {
        item.classList.remove('unread');
        item.classList.add('read');
      });
      const dot = document.querySelector('.bell-dot');
      if (dot) dot.style.display = 'none';
    });
  }
}

/* === Checkbox Select All / Deselect All === */
function initCheckboxes() {
  document.querySelectorAll('.custom-checkbox[data-role="all"]').forEach(allCb => {
    const group = allCb.dataset.group;
    const items = document.querySelectorAll(`.custom-checkbox[data-group="${group}"][data-role="item"]`);

    allCb.addEventListener('click', () => {
      const willCheck = !allCb.classList.contains('checked');
      allCb.classList.toggle('checked', willCheck);
      items.forEach(item => item.classList.toggle('checked', willCheck));
      updateRowSelection(group);
    });

    items.forEach(item => {
      item.addEventListener('click', () => {
        item.classList.toggle('checked');
        const allChecked = [...items].every(i => i.classList.contains('checked'));
        allCb.classList.toggle('checked', allChecked);
        updateRowSelection(group);
      });
    });
  });
}

function updateRowSelection(group) {
  document.querySelectorAll(`.custom-checkbox[data-group="${group}"][data-role="item"]`).forEach(cb => {
    const row = cb.closest('tr');
    if (row) row.classList.toggle('selected', cb.classList.contains('checked'));
    const card = cb.closest('.pt-card, .hs-card');
    if (card) card.classList.toggle('selected', cb.classList.contains('checked'));
  });
}

/* === Tab Switching === */
function initTabs() {
  document.querySelectorAll('.tab-bar').forEach(bar => {
    bar.querySelectorAll('.tab-item').forEach(tab => {
      tab.addEventListener('click', () => {
        bar.querySelectorAll('.tab-item').forEach(t => t.classList.remove('active'));
        tab.classList.add('active');

        const target = tab.dataset.tab;
        if (target) {
          const parent = bar.closest('[data-tab-container]') || bar.parentElement;
          parent.querySelectorAll('[data-tab-panel]').forEach(panel => {
            panel.style.display = panel.dataset.tabPanel === target ? '' : 'none';
          });
        }
      });
    });
  });

  // Sub-nav tabs
  document.querySelectorAll('.sub-nav').forEach(nav => {
    nav.querySelectorAll('.sub-nav-item').forEach(item => {
      item.addEventListener('click', () => {
        nav.querySelectorAll('.sub-nav-item').forEach(i => i.classList.remove('active'));
        item.classList.add('active');

        const target = item.dataset.tab;
        if (target) {
          document.querySelectorAll('[data-tab-panel]').forEach(panel => {
            panel.style.display = panel.dataset.tabPanel === target ? '' : 'none';
          });
        }
      });
    });
  });
}

/* === Toggle Switches === */
function initToggles() {
  document.querySelectorAll('.toggle-switch').forEach(toggle => {
    toggle.addEventListener('click', () => {
      toggle.classList.toggle('active');
    });
  });
}

/* === Modals === */
function initModals() {
  // Close on backdrop click
  document.querySelectorAll('.modal-overlay').forEach(overlay => {
    overlay.addEventListener('click', (e) => {
      if (e.target === overlay) closeModal(overlay.id);
    });
  });
}

window.openModal = function(id) {
  const modal = document.getElementById(id);
  if (modal) modal.classList.add('open');
};

window.showSuccess = function(title, desc) {
  const modal = document.getElementById('successModal');
  if (!modal) return;
  const t = modal.querySelector('.modal-title');
  const d = modal.querySelector('.modal-desc');
  if (t && title) t.textContent = title;
  if (d) d.textContent = desc || '';
  const actions = modal.querySelector('.modal-actions');
  if (actions) actions.innerHTML = '<button class="btn btn-primary" style="flex:1" onclick="closeModal(\'successModal\')">확인</button>';
  modal.classList.add('open');
};

window.closeModal = function(id) {
  const modal = document.getElementById(id);
  if (modal) modal.classList.remove('open');
};

/* === Slide Panels === */
function initPanels() {
  // Close on backdrop click
  document.querySelectorAll('.slide-panel-backdrop').forEach(bd => {
    bd.addEventListener('click', () => {
      const name = bd.id.replace('Backdrop', '');
      closePanel(name);
    });
  });
}

window.openPanel = function(name) {
  const panel = document.getElementById(name + 'Panel');
  const backdrop = document.getElementById(name + 'Backdrop');
  if (panel) panel.classList.add('open');
  if (backdrop) backdrop.classList.add('open');
};

window.closePanel = function(name) {
  const panel = document.getElementById(name + 'Panel');
  const backdrop = document.getElementById(name + 'Backdrop');
  if (panel) panel.classList.remove('open');
  if (backdrop) backdrop.classList.remove('open');
};

/* === Logout === */
window.doLogout = function() {
  closeModal('logoutModal');
  window.location.href = 'login.html';
};

/* === Page Navigation Helper === */
window.navigateTo = function(url) {
  window.location.href = url;
};
