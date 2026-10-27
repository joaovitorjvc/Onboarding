// Script compartilhado por todas as páginas.

// Checklist da página inicial: alterna o estado e guarda o progresso no navegador.
const CHECKLIST_KEY = 'nuagehub-checklist';

function loadChecklist() {
  try {
    return JSON.parse(localStorage.getItem(CHECKLIST_KEY)) || {};
  } catch {
    return {};
  }
}

function saveChecklist(state) {
  try {
    localStorage.setItem(CHECKLIST_KEY, JSON.stringify(state));
  } catch {
    // Armazenamento indisponível (aba anônima, bloqueado): segue sem persistir.
  }
}

function setDone(item, done) {
  item.classList.toggle('done', done);
  item.setAttribute('aria-checked', String(done));
}

function initChecklist() {
  const items = document.querySelectorAll('.check-item[data-id]');
  if (!items.length) return;

  const state = loadChecklist();

  items.forEach((item) => {
    const id = item.dataset.id;
    if (id in state) setDone(item, state[id]);

    const toggle = () => {
      const done = !item.classList.contains('done');
      setDone(item, done);
      state[id] = done;
      saveChecklist(state);
    };

    item.addEventListener('click', toggle);
    item.addEventListener('keydown', (event) => {
      if (event.key === 'Enter' || event.key === ' ') {
        event.preventDefault();
        toggle();
      }
    });
  });
}

initChecklist();
lucide.createIcons();
