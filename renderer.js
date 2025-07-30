window.addEventListener('DOMContentLoaded', () => {
  const cadastrar = document.getElementById("cadastrar-btn");
  const emitir = document.getElementById("emitir-btn");
  const conteinerBot = document.querySelector(".conteiner-bot");

  let listaEmitentes = [
    { nome: '', cnpj: '', cpf: '', senha: '' }
  ];

  emitir.addEventListener("click", async () => {
    if (!window.excelControl) {
      console.error('excelControl não disponível!');
      return;
    }
    const data = await window.excelControl.lerLoginNFSE();
  
    console.log(data[0].NOME);


    conteinerBot.innerHTML = `
      <section class="sec2">
        <h1> Dados de Emissão para NFSE</h1>
        <div class="div-select-emitentes"></div>
        <div class="div-dados-emissao">
          <textarea name="dados-cadastro" id="text-data" class="text-data"></textarea>
        </div>
        <button id="enviardados-btn" class="btn">Enviar</button>
      </section>
    `;

    const divEmitentes = document.querySelector(".div-select-emitentes");
    divEmitentes.innerHTML = `
      <select id="emitentes" name="emitentes">
        ${data.map(emitente => `
          <option value="${emitente.NOME}">${emitente.NOME}</option>
        `).join('')}
      </select>
    `;
  });

  cadastrar.addEventListener("click", () => {
    conteinerBot.innerHTML = `
      <section class="sec2">
        <h1> Dados de Cadastro para Emissões</h1>
        <div>
          <textarea name="dados-cadastro" id="text-data" class="text-data"></textarea>
        </div>
        <button id="cadastrardados-btn" class="btn">Enviar</button>
      </section>
    `;

    // Espera o DOM atualizar
    setTimeout(() => {
      const textData = document.getElementById("text-data");
      if (textData) {
        textData.value = "Nome do Emissor:\nCPF:\nSenha: ";
      }
    }, 0);
  });
});