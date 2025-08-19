window.addEventListener('DOMContentLoaded', () => {
  const cadastrar = document.getElementById("cadastrar-btn");
  const emitir = document.getElementById("emitir-btn");
  const conteinerBot = document.querySelector(".conteiner-bot");

  let listaEmitentes = [
    { nome: '', cnpj: '', cpf: '', senha: '', cnpjDest: '', codServico: '', descricao: '', localServico: '' }
  ];
  let dadosNFSE = [
    {
      cnpjDestinatario: '',
      codServico: '',
      descricao: '',
      valorTotal: ''
    }
  ]

  emitir.addEventListener("click", async () => {
    if (!window.excelControl) {
      console.error('excelControl não disponível!');
      return;
    }
    const data = await window.excelControl.lerLoginNFSE();

    conteinerBot.innerHTML = `
      <section class="sec2">
        <h1> Dados de Emissão para NFSE</h1>
        <div class="div-select-emitentes"></div>
        <div class="div-dados-emissao">
          <textarea name="dados-cadastro" id="text-data" class="text-data"></textarea>
        </div>
        <button id="enviardados-btn" class="btn">Enviar</button>
        <button id="voltar-btn" class="btn">Voltar</button>
      </section>
    `;

    const divEmitentes = document.querySelector(".div-select-emitentes");
    divEmitentes.innerHTML = `
      <select id="emitentes" name="emitentes">
        ${data.map(emitente => `
          <option id="nome-emitente" value="${emitente.nome}">${emitente.nome}</option>
        `).join('')}
      </select>
    `;

     setTimeout(() => {
      let textData = document.getElementById("text-data");
      let btnEmitirNFSE = document.getElementById("enviardados-btn");
      let voltarBtn = document.getElementById("voltar-btn");
      if (textData) {
        textData.value = "CNPJ DESTINATARIO: \nDESCRICAO: \nVALOR TOTAL:";
      }
      
      btnEmitirNFSE.addEventListener('click', ()=>{
          const texto = textData.value;
          const linhas = texto.trim().split('\n');
          const valores = linhas.map(linha => linha.match(/^.*?:\s*(.*)$/)[1]);
          const emitentes = document.getElementById("emitentes").value;

          dadosNFSE = [{
            nomeEmitente: emitentes,
            cnpjDestinatario: valores[0],
            descricao: valores[1],
            valorTotal: valores[2],
      }]

        window.excelControl.emitirNFSE(dadosNFSE[0]);
        })

      voltarBtn.addEventListener('click', () => window.location.reload());
    }, 0);
      

  });

  cadastrar.addEventListener("click", () => {
    conteinerBot.innerHTML = `
      <section class="sec2">
        <h1> Dados de Cadastro para Emissões</h1>
        <div>
          <textarea name="dados-cadastro" id="text-data" class="text-data"></textarea>
        </div>
        <button id="cadastrardados-btn" class="btn">Enviar</button>
        <button id="voltar-btn" class="btn">Voltar</button>
      </section>
    `;

    // Espera o DOM atualizar
    setTimeout(() => {
      let textData = document.getElementById("text-data");
      let btnCadastrarEmitente = document.getElementById("cadastrardados-btn");
      let voltarBtn = document.getElementById("voltar-btn");
      if (textData) {
        textData.value = "CNPJ:\nEmitente:\nCPF:\nSenha:\nCNPJ Destinatario:\nCódigo de Serviço:\nDescrição:\nLocal Serviço:";
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
          senha: valores[3],
          cnpjDest: valores[4],
          codServico: valores[5],
          descricao: valores[6],
          localServico: valores[7]}];

        var result = window.excelControl.cadastrarLoginNFSE(listaEmitentes[0]);
        if(result){
          window.alert("Os dados foram salvos!")
          window.location.reload();
        }else
          window.alert("Algo de errado aconteceu!");
        })

      voltarBtn.addEventListener('click', () => window.location.reload());
    }, 0);
  });  
});  


  
