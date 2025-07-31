window.addEventListener('DOMContentLoaded', () => {
  const cadastrar = document.getElementById("cadastrar-btn");
  const emitir = document.getElementById("emitir-btn");
  const conteinerBot = document.querySelector(".conteiner-bot");

  let listaEmitentes = [
    { nome: '', cnpj: '', cpf: '', senha: '' }
  ];

  function TratamentoDadosRGX(){
    
  }

  emitir.addEventListener("click", async () => {
    if (!window.excelControl) {
      console.error('excelControl não disponível!');
      return;
    }
    const data = await window.excelControl.lerLoginNFSE();
  
    console.log(data[0].nome);

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
          <option value="${emitente.nome}">${emitente.nome}</option>
        `).join('')}
      </select>
    `;

     setTimeout(() => {
      let textData = document.getElementById("text-data");
      if (textData) {
        textData.value = "CNPJ DESTINATARIO: \nDESCRICAO: \nVALOR TOTAL:";
      }}, 0);

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
      let textData = document.getElementById("text-data");
      let btnCadastrarEmitente = document.getElementById("cadastrardados-btn");
      if (textData) {
        textData.value = "CNPJ:\nEmitente:\nCPF:\nSenha: ";
      }
      btnCadastrarEmitente.addEventListener('click', ()=>{
        const texto = textData.value;
        const linhas = texto.trim().split('\n');
        const valores = linhas.map(linha => linha.match(/^.*?:\s*(.*)$/)[1]);
        
        //manipulando para os emitentes

        listaEmitentes=[{
          cnpj: valores[0],
          nome: valores[1],
          cpf: valores[2],
          senha: valores[3]}];

        window.excelControl.cadastrarLoginNFSE(listaEmitentes[0]);
      })
    }, 0);
  });  
});  


  
