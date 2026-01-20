import { showNotification, fetchApi } from "./functions-generics.js";

// ===========================
// Formata valor em Real (BRL)
// ===========================
function formatBRL(valor) {
  const numero = Number(valor) || 0;
  return numero.toLocaleString("pt-BR", {
    style: "currency",
    currency: "BRL",
  });
}

// ===========================
// Atualiza totais no topo
// ===========================
function atualizarTotais(pendente, pago) {
  const badgePendente = document.querySelector(
    ".expense-section.future .badge",
  );
  const badgePago = document.querySelector(".expense-section.paid .badge");

  if (badgePendente) badgePendente.textContent = formatBRL(pendente);
  if (badgePago) badgePago.textContent = formatBRL(pago);
}

// ===========================
// Calcula totais das despesas
// ===========================
function calcularTotais(despesas) {
  let totalPendente = 0;
  let totalPago = 0;

  despesas.forEach((d) => {
    const valor = Number(d.value) || 0;

    if (d.state === "pendente") totalPendente += valor;
    else if (d.state === "pago") totalPago += valor;
  });

  atualizarTotais(totalPendente, totalPago);
}

// ===========================
// Renderiza despesas
// ===========================
function renderDespesas(despesas) {
  const container = document.querySelector(".expense-list");
  const containerPaid = document.querySelector(".paid-expense");

  if (!container || !containerPaid) return;

  container.innerHTML = "";
  containerPaid.innerHTML = "";

  despesas.forEach((d) => {
    const item = document.createElement("div");
    item.classList.add("expense-item");

    const dateObj = new Date(d.maturity);
    const dia = String(dateObj.getDate()).padStart(2, "0");
    const mes = String(dateObj.getMonth() + 1).padStart(2, "0");

    if (d.state === "pendente") {
      item.innerHTML = `
        <div class="expense-info">
          <h4>${d.name}</h4>
          <span>Vence em ${dia}/${mes}</span>
        </div>
        <div class="expense-action">
          <p class="expense-value">- ${formatBRL(d.value)}</p>
          <button class="complete-btn" type="button">Pagar</button>
        </div>
      `;

      const btnPagar = item.querySelector(".complete-btn");
      btnPagar.addEventListener("click", () => pagarDespesa(d.id));

      container.appendChild(item);
    }

    if (d.state === "pago") {
      item.innerHTML = `
        <div class="expense-info">
          <h4>${d.name}</h4>
          <span>Pago em ${dia}/${mes}</span>
        </div>
        <div class="expense-action">
          <p class="expense-value">- ${formatBRL(d.value)}</p>
          <span class="status-icon success">✓</span>
        </div>
      `;

      containerPaid.appendChild(item);
    }
  });
}

// ===========================
// Lê despesas
// ===========================
async function readDespesa() {
  try {
    const despesas = await fetchApi(
      "http://localhost:3000/despesas/read",
      "GET",
    );
    renderDespesas(despesas);
    calcularTotais(despesas);
  } catch {
    showNotification("Erro ao buscar despesas", "error");
  }
}

// ===========================
// Pagar despesa
// ===========================
async function pagarDespesa(id) {
  try {
    await fetchApi(`http://localhost:3000/despesas/update/${id}`, "PATCH", {
      state: "pago",
    });

    showNotification("Despesa paga com sucesso!", "success");
    readDespesa();
  } catch {
    showNotification("Erro ao pagar despesa!", "error");
  }
}

// ===========================
// Criar despesa (modal)
// ===========================
function createDespesa() {
  const modal = document.getElementById("modal-gasto");
  if (!modal) return;

  const form = modal.querySelector(".modal-form");
  const openModalBtn = document.getElementById("open-modal");
  if (!form || !openModalBtn) return;

  // Abrir modal
  openModalBtn.addEventListener("click", (e) => {
    e.preventDefault();
    modal.classList.add("active");
  });

  // Fechar modal
  modal.querySelectorAll(".close-modal, .btn-cancel").forEach((btn) => {
    btn.addEventListener("click", (e) => {
      e.preventDefault();
      modal.classList.remove("active");
    });
  });

  // Submit do formulário (usando form.elements)
  form.addEventListener("submit", async (e) => {
    e.preventDefault();

    const despesa = {
      name: form.elements["name"].value,
      value: parseFloat(form.elements["value"].value),
      maturity: form.elements["date"].value,
      categoria: form.elements["categoria"].value,
    };

    try {
      await fetchApi("http://localhost:3000/despesas/create", "POST", despesa);

      showNotification("Despesa criada com sucesso!", "success");
      form.reset();
      modal.classList.remove("active");
      readDespesa();
    } catch {
      showNotification("Erro ao criar despesa", "error");
      modal.classList.remove("active");
    }
  });
}
// ===========================
// Adiciona objetivos no select de categoria
// ===========================
export async function adicionarObjetivosNoSelect() {
  const select = document.getElementById("categoria");
  if (!select) return;

  try {
    const objetivos = await fetchApi(
      "http://localhost:3000/objetivos/read",
      "GET",
    );

    objetivos.forEach((obj) => {
      const option = document.createElement("option");
      option.value = `${obj.name}`; // valor único
      option.textContent = obj.name;
      select.appendChild(option);
    });
  } catch (err) {
    console.error("Erro ao carregar objetivos:", err);
  }
}

// ===========================
// Inicialização
// ===========================
document.addEventListener("DOMContentLoaded", () => {
  readDespesa();
  createDespesa();
  adicionarObjetivosNoSelect();
});
