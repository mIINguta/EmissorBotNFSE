window.addEventListener('DOMContentLoaded', () => {
  const cadastrar = document.getElementById("cadastrar-btn");
  const emitir = document.getElementById("emitir-btn");
  const conteinerBot = document.querySelector(".conteiner-bot");

  let listaEmitentes = [
    { nome: '', cnpj: '', cpf: '', senha: '', cnpjDest: '', codServico: '', descricao: '', localServico: '', regimeApuracao: '', NBS: '', CIO: '', IBS: '', CBS: '',destinatarioAdquirente: '', compraGovernamental: ''}
  ];
  let dadosNFSE = [
    {
      cnpjDest: '',
      codServico: '',
      descricao: '',
      valorTotal: '',
      regimeApuracao: '',
      NBS: '',
      CIO: '',
      destinatarioAdquirente: '',
      compraGovernamental: '',
      IBSeCBS: false,
      IBS: '',
      CBS: '',
    }
  ]
  let IBSeCBS = false;
  let IBS = "";
  let CBS = "";

  emitir.addEventListener("click", async () => {
    if (!window.excelControl) {
      console.error('excelControl não disponível!');
      return;
    }
    const data = await window.excelControl.lerLoginNFSE();
    console.log(data);

    conteinerBot.innerHTML = `
    <h1> Dados de Emissão para NFSE</h1>
      <section class="sec2">
          <section class="sec-dados-nota">
            <div class="div-select-emitentes"> </div>
            <div class="div-dados-emissao">
            <textarea name="dados-cadastro" id="text-data" class="text-data"></textarea></div>
          </section>
          <section class="sec-dados-imp">
          <div>
          <p> Preencher Dados de IBS e CBS?  <input class="check-ibs-cbs" type="checkbox" value="yes"/></p>
           <div class="div-dados-ibs"></div>
          </section>
      </section>
        <button id="enviardados-btn" class="btn">Enviar</button>
        <button id="voltar-btn" class="btn">Voltar</button>
    `;

    const divEmitentes = document.querySelector(".div-select-emitentes");
    divEmitentes.innerHTML = `
      <select id="emitentes" name="emitentes">
        ${data.map(emitente => `
          <option id="nome-emitente" value="${emitente.nome}">${emitente.nome}</option>
        `).join('')}
      </select>
    `;

    const CheckIBSeCBS = document.querySelector(".check-ibs-cbs");
    const divIBSeCBS = document.querySelector(".div-dados-ibs");

     CheckIBSeCBS.addEventListener('change', function (){
      if(CheckIBSeCBS.checked){
        IBSeCBS = true;
            divIBSeCBS.innerHTML = `
              <h2> Alíquotas </h2>
                <p>IBS</p><input class="input-ibs" type="text"></input> 
                <p>CBS</p> <input class="input-cbs" type="text"></input> 
              `;
      }else {
        IBSeCBS = false;
        divIBSeCBS.innerHTML = '';
    }})
        
      


    setTimeout(() => {
      let textData = document.getElementById("text-data");
      let btnEmitirNFSE = document.getElementById("enviardados-btn");
      let voltarBtn = document.getElementById("voltar-btn");
      let selectEmitentes = document.getElementById("emitentes");

      // criei uma lógica para mostrar quais dados ja temos para a emissão da NFSE com base no cadastro do login
      if (textData && data.length > 0) {
      let emitente = data[0];
      textData.value = 
      `CNPJ DESTINATARIO: ${emitente.cnpjDest}
      \nDESCRICAO: ${emitente.descricao}
      \nVALOR TOTAL:
      \nCÓDIGO DE SERVIÇO: ${emitente.codServico}
      \nVALOR TOTAL:
      \nCÓDIGO DE SERVIÇO NACIONAL: ${emitente.codServicoNac}
      \nCÓDIGO DE SERVIÇO MUNICIPAL: ${emitente.codServicoMun} 
      \nCompra Governamental?: ${emitente.compraGovernamental} 
      \nDestinatário Adquirente: ${emitente.destinatarioAdquirente}` 
      ;}
      // Atualiza quando mudar o select
      selectEmitentes.addEventListener("change", () => {
      let emitenteSelecionado = data.find(e => e.nome === selectEmitentes.value);
      if (emitenteSelecionado) {
        textData.value = `CNPJ DESTINATARIO: ${emitenteSelecionado.cnpjDest}\nLOCAL DO SERVIÇO: ${emitenteSelecionado.localServico}\nDESCRICAO: ${emitenteSelecionado.descricao}\nVALOR TOTAL:\nCÓDIGO DE SERVIÇO NACIONAL: ${emitenteSelecionado.codServicoNac}\nCÓDIGO DE SERVIÇO MUNICIPAL: ${emitenteSelecionado.codServicoMun}\nCompra Governamental?: ${emitenteSelecionado.compraGovernamental}\nDestinatário Adquirente: ${emitenteSelecionado.destinatarioAdquirente}`;
      }
    }); 

      btnEmitirNFSE.addEventListener('click', ()=>{
          const texto = textData.value;
          const linhas = texto.trim().split('\n');
          const valores = linhas.map(linha => linha.match(/^.*?:\s*(.*)$/)[1]);
          const emitentes = document.getElementById("emitentes").value;
          IBS = document.querySelector('.input-ibs')?.value || "";
          CBS = document.querySelector('.input-cbs')?.value || "";

          dadosNFSE = {
            nomeEmitente: emitentes,
            cnpjDest: valores[0],
            localServico: valores[1],
            descricao: valores[2],
            valorTotal: valores[3],
            codServicoNac: valores[4],
            codServicoMun: valores[5],
            IBSeCBS: IBSeCBS,
            //IBS: IBS,
            //CBS: CBS,
            compraGovernamental: valores[6],
            destinatarioAdquirente: valores[7]
            }

        window.excelControl.emitirNFSE(dadosNFSE);
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
        textData.value = "CNPJ:\nEmitente:\nCPF:\nSenha:\nCNPJ Destinatario:\nCódigo de Serviço Nacional:\nCódigo de Serviço Municipal:\nDescrição:\nLocal Serviço:";
      }
      btnCadastrarEmitente.addEventListener('click', async ()=>{
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
          codServicoNac: valores[5],
          codServicoMun: valores[6],
          descricao: valores[7],
          localServico: valores[8],
        }];

        var result = await window.excelControl.cadastrarLoginNFSE(listaEmitentes[0]);
        if(result){
          window.alert("Os dados foram salvos!");
          console.log(result);
          window.location.reload();
        }else
          window.alert("Algo de errado aconteceu!");
        })

      voltarBtn.addEventListener('click', () => window.location.reload());
    }, 0);
  });  
});  


  
