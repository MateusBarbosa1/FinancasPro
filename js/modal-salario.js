/**
 * Sistema de Notificações para o Dashboard
 */
const notificationContainer = document.createElement("div");
notificationContainer.id = "notification-container";
document.body.appendChild(notificationContainer);

function showNotification(message, type = "success") {
  const notification = document.createElement("div");
  notification.className = `notification ${type}`;
  const icon = type === "success" ? "✓" : "✕";

  notification.innerHTML = `
        <span class="notification-icon">${icon}</span>
        <span class="notification-message">${message}</span>
    `;

  notificationContainer.appendChild(notification);

  setTimeout(() => {
    notification.classList.add("fade-out");
    setTimeout(() => {
      notification.remove();
    }, 500);
  }, 3000);
}

// Lógica do Modal de Salário
document.addEventListener("DOMContentLoaded", () => {
  const btnSalaryReceived = document.getElementById("btn-salary-received");
  const modalSalario = document.getElementById("modal-salario");
  const closeSalaryModal = document.getElementById("close-salary-modal-btn");
  const cancelSalary = document.getElementById("cancel-salary");
  const salaryForm = document.getElementById("salary-form");
  const salaryDateInput = document.getElementById("salary-date");

  // Definir data atual como padrão no input de data
  if (salaryDateInput) {
    const today = new Date().toISOString().split("T")[0];
    salaryDateInput.value = today;
  }

  if (btnSalaryReceived) {
    btnSalaryReceived.addEventListener("click", () => {
      modalSalario.classList.add("active");
    });
  }

  const closeModal = () => {
    modalSalario.classList.remove("active");
  };

  if (closeSalaryModal) closeSalaryModal.addEventListener("click", closeModal);
  if (cancelSalary) cancelSalary.addEventListener("click", closeModal);

  if (salaryForm) {
    salaryForm.addEventListener("submit", async (e) => {
      e.preventDefault();
      const valor = document.getElementById("salary-value").value;
      const data = salaryDateInput.value;

      await fetch(
        "https://gestor-financas-api.onrender.com:3000/usuarios/update",
        {
          method: "PATCH",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ salario: valor }),
          credentials: "include",
        },
      );

      showNotification(
        `Salário de R$ ${valor} adicionado com sucesso!`,
        "success",
      );
      closeModal();
      window.location.reload();
    });
  }
});
