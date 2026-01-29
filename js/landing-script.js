document.addEventListener("DOMContentLoaded", () => {
  const loader = document.getElementById("loader-overlay");

  async function checkServerAndRedirect() {
    try {
      const response = await fetch(
        "https://gestor-financas-api.onrender.com/auth/me",
        {
          credentials: "include",
        },
      );

      setTimeout(() => {
        loader.classList.add("fade-out");
        if (response.ok) {
          window.location.href = "home.html";
        }
      }, 2000);
    } catch (error) {
      console.log("Servidor ainda carregando...");
      setTimeout(checkServerAndRedirect, 3000);
    }
  }

  checkServerAndRedirect();

  document.querySelectorAll('a[href^="#"]').forEach((anchor) => {
    anchor.addEventListener("click", function (e) {
      e.preventDefault();
      document.querySelector(this.getAttribute("href")).scrollIntoView({
        behavior: "smooth",
      });
    });
  });
});
