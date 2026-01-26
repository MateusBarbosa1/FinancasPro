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

    // Adiciona evento de clique para abrir detalhes (exceto se clicar no botão pagar)
    item.addEventListener("click", (e) => {
      if (e.target.classList.contains("complete-btn")) return;
      if (window.openExpenseDetails) {
        window.openExpenseDetails(d);
      }
    });

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
      btnPagar.addEventListener("click", (e) => {
        e.stopPropagation(); // Evita abrir o modal ao clicar no botão
        pagarDespesa(d.id);
      });

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
export async function readDespesa() {
  try {
    const despesas = await fetchApi(
      "https://gestor-financas-api.onrender.com:3000/despesas/read",
      "GET",
      undefined,
      "include",
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
export async function pagarDespesa(id) {
  try {
    await fetchApi(
      `https://gestor-financas-api.onrender.com:3000/despesas/update/${id}`,
      "PATCH",
      {
        state: "pago",
      },
    );

    showNotification("Despesa paga com sucesso!", "success");
    readDespesa(); // Recarrega a lista sem dar reload na página
  } catch {
    showNotification("Erro ao pagar despesa!", "error");
  }
}

// ===========================
// Deletar despesa
// ===========================
export async function deletarDespesa(id) {
  try {
    await fetchApi(
      `https://gestor-financas-api.onrender.com:3000/despesas/delete/${id}`,
      "DELETE",
      undefined,
      "include",
    );
    showNotification("Despesa deletada com sucesso!", "success");
    readDespesa();
  } catch {
    showNotification("Erro ao deletar despesa!", "error");
  }
}

// ===========================
// Criar/Atualizar despesa (modal)
// ===========================
function createDespesa() {
  const modal = document.getElementById("modal-gasto");
  if (!modal) return;

  const form = modal.querySelector(".modal-form");
  const openModalBtn = document.getElementById("open-modal");
  if (!form || !openModalBtn) return;

  // Abrir modal para criação
  openModalBtn.addEventListener("click", (e) => {
    e.preventDefault();
    form.reset();
    document.getElementById("expense-id").value = "";
    document.getElementById("modal-title").innerText = "Nova Despesa";
    modal.classList.add("active");
  });

  // Fechar modal
  modal.querySelectorAll(".close-modal, .btn-cancel").forEach((btn) => {
    btn.addEventListener("click", (e) => {
      e.preventDefault();
      modal.classList.remove("active");
    });
  });

  // Submit do formulário
  form.addEventListener("submit", async (e) => {
    e.preventDefault();

    const id = form.elements["id"].value;
    const despesa = {
      name: form.elements["name"].value,
      value: parseFloat(form.elements["value"].value),
      maturity: form.elements["date"].value,
      categoria: form.elements["categoria"].value,
    };

    try {
      if (id) {
        // Atualizar
        await fetchApi(
          `https://gestor-financas-api.onrender.com:3000/despesas/update/${id}`,
          "PATCH",
          despesa,
          "include",
        );
        showNotification("Despesa atualizada com sucesso!", "success");
        window.location.reload();
      } else {
        // Criar
        await fetchApi(
          "https://gestor-financas-api.onrender.com:3000/despesas/create",
          "POST",
          despesa,
          "include",
        );
        showNotification("Despesa criada com sucesso!", "success");
      }

      form.reset();
      modal.classList.remove("active");
      readDespesa();
    } catch {
      showNotification(
        id ? "Erro ao atualizar despesa" : "Erro ao criar despesa",
        "error",
      );
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
      "https://gestor-financas-api.onrender.com:3000/objetivos/read",
      "GET",
      undefined,
      "include",
    );

    // Limpa opções extras mas mantém as fixas
    const optionsFixas = [
      "alimentacao",
      "moradia",
      "transporte",
      "lazer",
      "outros",
    ];
    Array.from(select.options).forEach((opt) => {
      if (!optionsFixas.includes(opt.value)) select.removeChild(opt);
    });

    objetivos.forEach((obj) => {
      const option = document.createElement("option");
      option.value = `${obj.name}`;
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
