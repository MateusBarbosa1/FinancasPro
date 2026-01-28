import { showNotification, fetchApi } from "./functions-generics.js";

// ===========================
// Formata valor em Real
// ===========================
function formatBRL(valor) {
  const numero = Number(valor) || 0;

  return numero.toLocaleString("pt-BR", {
    style: "currency",
    currency: "BRL",
  });
}

// ===========================
// Renderiza objetivos
// ===========================
function renderObjetivos(objetivos) {
  const container = document.querySelector(".goals");
  if (!container) return;

  // Remove cards antigos (mantém o header)
  container.querySelectorAll(".goal-card").forEach((c) => c.remove());

  objetivos.forEach((o) => {
    const atual = Number(o.value) || 0;
    const total = Number(o.valueObjective) || 0;

    const percentual = total > 0 ? Math.min((atual / total) * 100, 100) : 0;

    const card = document.createElement("div");
    card.classList.add("goal-card");

    card.innerHTML = `
      <div class="goal-header">
        <h4>${o.name}</h4>
        <span>${percentual.toFixed(0)}%</span>
      </div>

      <div class="progress-bar">
        <div class="progress" style="width: ${percentual}%"></div>
      </div>

      <small>${formatBRL(atual)} / ${formatBRL(total)}</small>
    `;

    container.appendChild(card);
  });
}

// ===========================
// Ler objetivos
// ===========================
async function readObjetivos() {
  try {
    const objetivos = await fetchApi(
      "https://gestor-financas-api.onrender.com/objetivos/read",
      "GET",
      undefined,
      "include",
    );

    renderObjetivos(objetivos);
  } catch {
    showNotification("Erro ao buscar objetivos", "error");
  }
}

// ===========================
// Criar objetivo (modal)
// ===========================
function createObjetivo() {
  const modal = document.getElementById("modal-objetivo");
  const openBtn = document.getElementById("open-goal-modal");
  const closeBtn = document.querySelector(".close-goal-modal");
  const cancelBtn = document.getElementById("cancel-goal");
  const form = document.getElementById("goal-form");

  if (!modal || !openBtn || !form) return;

  // Abrir modal
  openBtn.addEventListener("click", (e) => {
    e.preventDefault();
    modal.classList.add("active");
  });

  // Fechar modal
  [closeBtn, cancelBtn].forEach((btn) => {
    if (!btn) return;
    btn.addEventListener("click", (e) => {
      e.preventDefault();
      modal.classList.remove("active");
    });
  });

  // Submit do formulário
  form.addEventListener("submit", async (e) => {
    e.preventDefault();

    const objetivo = {
      name: document.getElementById("goal-name").value,
      value: "0", // valor atual começa zerado
      valueObjective: document.getElementById("goal-value").value,
    };

    try {
      await fetchApi(
        "https://gestor-financas-api.onrender.com/objetivos/create",
        "POST",
        objetivo,
        "include",
      );

      showNotification("Objetivo criado com sucesso!", "success");
      form.reset();
      modal.classList.remove("active");
      window.location.reload();
    } catch {
      showNotification("Erro ao criar objetivo", "error");
      modal.classList.remove("active");
    }
  });
}

// ===========================
// Inicialização
// ===========================
document.addEventListener("DOMContentLoaded", () => {
  readObjetivos();
  createObjetivo();
});
