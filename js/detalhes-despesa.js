import { showNotification } from "./functions-generics.js";
import { pagarDespesa, deletarDespesa, readDespesa } from "./despesas.js";

/**
 * Lógica para Visualização Detalhada e Ações de Despesa
 */

document.addEventListener("DOMContentLoaded", () => {
  const modalDetalhes = document.getElementById("modal-detalhes");
  const closeDetailsModal = document.getElementById("close-details-modal");

  // Elementos de exibição
  const detailUuid = document.getElementById("detail-uuid");
  const detailName = document.getElementById("detail-name");
  const detailValue = document.getElementById("detail-value");
  const detailCategory = document.getElementById("detail-category");
  const detailStatus = document.getElementById("detail-status");
  const detailDate = document.getElementById("detail-date");

  // Botões de ação
  const btnDelete = document.getElementById("btn-delete-expense");
  const btnEdit = document.getElementById("btn-edit-expense");
  const btnPay = document.getElementById("btn-pay-expense");

  let currentExpenseData = null;

  // Função para abrir o modal de detalhes
  window.openExpenseDetails = (expenseData) => {
    currentExpenseData = expenseData;

    // No seu backend, o ID parece ser o UUID
    detailUuid.innerText = expenseData.id || "N/A";
    detailName.innerText = expenseData.name;
    detailValue.innerText = `R$ ${parseFloat(expenseData.value).toLocaleString("pt-BR", { minimumFractionDigits: 2 })}`;
    detailCategory.innerText = expenseData.categoria;
    detailStatus.innerText = expenseData.state === "pago" ? "Pago" : "Pendente";
    
    // Formata data de vencimento
    const dateObj = new Date(expenseData.maturity);
    detailDate.innerText = dateObj.toLocaleDateString("pt-BR");

    // Mostrar/esconder botão de pagar baseado no status
    btnPay.style.display = expenseData.state === "pago" ? "none" : "block";

    modalDetalhes.classList.add("active");
  };

  // Fechar modal
  const closeModal = () => {
    modalDetalhes.classList.remove("active");
  };

  if (closeDetailsModal)
    closeDetailsModal.addEventListener("click", closeModal);

  // Ação: Deletar
  btnDelete.addEventListener("click", async () => {
    if (confirm(`Tem certeza que deseja deletar a despesa "${currentExpenseData.name}"?`)) {
      await deletarDespesa(currentExpenseData.id);
      closeModal();
    }
  });

  // Ação: Editar (Abre o modal de criação preenchido)
  btnEdit.addEventListener("click", () => {
    closeModal();
    const modalGasto = document.getElementById("modal-gasto");
    const form = document.getElementById("expense-form");

    // Preencher formulário
    document.getElementById("expense-id").value = currentExpenseData.id;
    document.getElementById("name").value = currentExpenseData.name;
    document.getElementById("value").value = currentExpenseData.value;
    
    // Formata data para o input date (YYYY-MM-DD)
    const date = new Date(currentExpenseData.maturity);
    const formattedDate = date.toISOString().split('T')[0];
    document.getElementById("date").value = formattedDate;
    
    document.getElementById("categoria").value = currentExpenseData.categoria;

    document.getElementById("modal-title").innerText = "Atualizar Despesa";
    modalGasto.classList.add("active");
  });

  // Ação: Pagar
  btnPay.addEventListener("click", async () => {
    await pagarDespesa(currentExpenseData.id);
    closeModal();
  });
});
