document.addEventListener("DOMContentLoaded", async () => {
  const res = await fetch("http://localhost:3000/usuarios/read/unique", {
    credentials: "include",
  });
  const data = await res.json();

  const usuarioNameDOM = document.querySelector(".user-info span");
  const usuarioName = data.nome.split(" ")[0];

  const usuarioSalarioDOM = document.querySelector(".salary > .value");
  const usuarioSalario = data.salario;

  let saldoAtual = data.salario;
  let gastosTotais = 0;

  const saldoAtualDOM = document.querySelector(".balance > .value");
  const gastosTotaisDOM = document.querySelector(".expenses > .value");

  const despesasREQ = await fetch("http://localhost:3000/despesas/read", {
    credentials: "include",
  });
  const despesas = await despesasREQ.json();
  despesas.forEach((d) => {
    if (d.state == "pago") {
      saldoAtual -= Number(d.value);
      gastosTotais += Number(d.value);
    }
  });

  const porcentagemGastosDOM = document.querySelector(".expenses .progress");
  const porcentagemGastos = (gastosTotais * 100) / data.salario;

  usuarioNameDOM.innerText = `Olá, ${usuarioName}`;
  usuarioSalarioDOM.innerText = `R$ ${usuarioSalario}`;
  saldoAtualDOM.innerText = `R$ ${saldoAtual}`;
  gastosTotaisDOM.innerText = `R$ ${gastosTotais}`;
  porcentagemGastosDOM.style.width = `${porcentagemGastos}%`;
});
