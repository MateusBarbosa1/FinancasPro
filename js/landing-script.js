document.addEventListener("DOMContentLoaded", () => {
  const loader = document.getElementById("loader-overlay");

  async function checkServerAndRedirect() {
    try {
      const res = await fetch(
        "https://gestor-financas-api.onrender.com/api/heath",
      );

      if (res.ok) {
        // Backend pronto → esconde loader e redireciona
        loader.style.display = "none";
      } else {
        throw new Error("Servidor não pronto");
      }
    } catch (error) {
      console.log("Servidor ainda carregando...");
      setTimeout(checkServerAndRedirect, 3000); // tenta de novo
    }
  }

  checkServerAndRedirect();

  // Scroll suave
  document.querySelectorAll('a[href^="#"]').forEach((anchor) => {
    anchor.addEventListener("click", function (e) {
      e.preventDefault();
      document.querySelector(this.getAttribute("href")).scrollIntoView({
        behavior: "smooth",
      });
    });
  });
});
