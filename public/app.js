const entity = document.body.dataset.entity;
const idField = document.body.dataset.idField;

const form = document.getElementById('crudForm');
const tableBody = document.getElementById('tableBody');
const searchInput = document.getElementById('searchInput');
const btnSearch = document.getElementById('btnSearch');
const btnClear = document.getElementById('btnClear');
const formTitle = document.getElementById('formTitle');
const hiddenId = document.getElementById('editId');

async function loadRelatedOptions() {
  if (entity === 'checkin') {
    const quartoSelect = form.querySelector('[name="id_quarto"]');
    if (!quartoSelect) return;

    const res = await fetch('/api/quartos');
    const quartos = await res.json();

    quartoSelect.innerHTML = '<option value="">Selecione um quarto</option>';
    quartos.forEach((quarto) => {
      const option = document.createElement('option');
      option.value = quarto.id_quarto;
      option.textContent = `#${quarto.id_quarto} - Quarto ${quarto.numero_quarto} (${quarto.status_quarto})`;
      quartoSelect.appendChild(option);
    });
    return;
  }

  if (entity === 'checkout') {
    const checkinSelect = form.querySelector('[name="id_checkin"]');
    if (!checkinSelect) return;

    const res = await fetch('/api/checkin');
    const checkins = await res.json();

    checkinSelect.innerHTML = '<option value="">Selecione um check-in</option>';
    checkins.forEach((checkin) => {
      const option = document.createElement('option');
      option.value = checkin.id_checkin;
      option.textContent = `#${checkin.id_checkin} - ${checkin.hospede_nome}`;
      checkinSelect.appendChild(option);
    });
  }
}

async function fetchRows(search = '') {
  const url = search ? `/api/${entity}?search=${encodeURIComponent(search)}` : `/api/${entity}`;
  const res = await fetch(url);
  const data = await res.json();
  renderRows(data);
}

function renderRows(rows) {
  tableBody.innerHTML = '';

  rows.forEach((row) => {
    const tr = document.createElement('tr');

    Object.keys(row).forEach((key) => {
      const td = document.createElement('td');
      td.textContent = row[key] ?? '';
      tr.appendChild(td);
    });

    const actionsTd = document.createElement('td');
    actionsTd.className = 'actions';
    actionsTd.innerHTML = `
      <button class="btn-secondary" data-action="edit">Editar</button>
      <button class="btn-danger" data-action="delete">Excluir</button>
    `;

    actionsTd.querySelector('[data-action="edit"]').addEventListener('click', () => fillForm(row));
    actionsTd.querySelector('[data-action="delete"]').addEventListener('click', () => deleteRow(row[idField]));

    tr.appendChild(actionsTd);
    tableBody.appendChild(tr);
  });
}

function fillForm(row) {
  hiddenId.value = row[idField];
  formTitle.textContent = `Editar registro #${row[idField]}`;

  Array.from(form.elements).forEach((el) => {
    if (el.name && row[el.name] !== undefined) {
      el.value = row[el.name] ?? '';
    }
  });
}

async function deleteRow(id) {
  if (!confirm('Deseja realmente excluir este registro?')) return;

  await fetch(`/api/${entity}/${id}`, { method: 'DELETE' });
  await fetchRows(searchInput.value.trim());
}

form.addEventListener('submit', async (e) => {
  e.preventDefault();

  const formData = new FormData(form);
  const payload = {};

  formData.forEach((value, key) => {
    if (key !== 'editId') payload[key] = value === '' ? null : value;
  });

  const editingId = hiddenId.value;
  const method = editingId ? 'PUT' : 'POST';
  const url = editingId ? `/api/${entity}/${editingId}` : `/api/${entity}`;

  await fetch(url, {
    method,
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(payload)
  });

  form.reset();
  hiddenId.value = '';
  formTitle.textContent = 'Novo cadastro';
  await fetchRows(searchInput.value.trim());
});

btnSearch.addEventListener('click', () => fetchRows(searchInput.value.trim()));
btnClear.addEventListener('click', () => {
  searchInput.value = '';
  fetchRows();
});

loadRelatedOptions();
fetchRows();
