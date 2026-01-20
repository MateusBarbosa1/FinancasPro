// ===========================
// Função genérica para API
// ===========================
export async function fetchApi(url, method, data, credentials) {
  try {
    const options = {
      method,
      headers: { "Content-Type": "application/json" },
    };

    if (credentials) {
      options.credentials = credentials;
    }
    if (data) {
      options.body = JSON.stringify(data);
    }

    const res = await fetch(url, options);

    if (!res.ok) {
      throw new Error("Erro na requisição");
    }

    return res.json();
  } catch (err) {
    console.error("Erro na API:", err);
    throw err;
  }
}

/**
 * Sistema de Notificações
 */
const notificationContainer = document.createElement("div");
notificationContainer.id = "notification-container";
document.body.appendChild(notificationContainer);

export function showNotification(message, type = "success") {
  const notification = document.createElement("div");
  notification.className = `notification ${type}`;

  const icon = type === "success" ? "✓" : "✕";

  notification.innerHTML = `
        <span class="notification-icon">${icon}</span>
        <span class="notification-message">${message}</span>
    `;

  notificationContainer.appendChild(notification);

  // Remover após 3 segundos
  setTimeout(() => {
    notification.classList.add("fade-out");
    setTimeout(() => {
      notification.remove();
    }, 500);
  }, 3000);
}
