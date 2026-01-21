/**
 * Sistema de Notificações para Autenticação
 */

import { showNotification, fetchApi } from "./functions-generics.js";

// Lógica de Login e Cadastro
document.addEventListener("DOMContentLoaded", () => {
  const loginForm = document.getElementById("login-form");
  const registerForm = document.getElementById("register-form");

  if (loginForm) {
    loginForm.addEventListener("submit", async (e) => {
      e.preventDefault();
      const email = document.getElementById("email");
      const password = document.getElementById("password");

      try {
        const data = {
          email: email.value,
          password: password.value,
        };
        await fetchApi(
          "http://localhost:3000/auth/login",
          "POST",
          data,
          "include",
        );
        showNotification("Login realizado com sucesso!", "success");
        setTimeout(() => {
          window.location.href = "home.html";
        }, 500);
      } catch (error) {
        email.value = "";
        password.value = "";
        showNotification("Email ou senha incorreta!", "error");
      }
    });
  }

  if (registerForm) {
    registerForm.addEventListener("submit", async (e) => {
      e.preventDefault();
      const name = document.getElementById("name").value;
      const email = document.getElementById("email").value;
      const password = document.getElementById("password").value;
      const confirmPassword = document.getElementById("confirm-password").value;

      if (password !== confirmPassword) {
        showNotification("As senhas não coincidem!", "error");
        return;
      }

      try {
        const data = {
          name: name,
          email: email,
          password: password,
        };
        await fetchApi(
          "http://localhost:3000/auth/cadastro",
          "POST",
          data,
          "include",
        );
        showNotification("Conta criada com sucesso!", "success");
        setTimeout(() => {
          window.location.href = "home.html";
        }, 100);
      } catch (error) {
        showNotification("Erro ao criar a conta!", "error");
      }
    });
  }
});
