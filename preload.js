const { contextBridge } = require('electron');
const fs = require('fs').promises;
const XLSX = require('xlsx');
const puppeteer  = require('puppeteer');


console.log('[PRELOAD] carregado');

 async function lerLoginNFSE(){
    const fileBuffer = await fs.readFile('G:\\Meu Drive\\PLANILHAS_ACESSO\\DADOS_LOGIN.xlsx');
    const workbook = XLSX.read(fileBuffer, { type: 'buffer' });
    const workSheet = workbook.Sheets["LOGIN_NFSE_GOV"];
    const data = XLSX.utils.sheet_to_json(workSheet, {
      defval: '',
      raw: false
    });
    return data;
  }

    async function cadastrarLoginNFSE(emitente){
    const fileBuffer = await fs.readFile('G:\\Meu Drive\\PLANILHAS_ACESSO\\DADOS_LOGIN.xlsx');
    const workbook = XLSX.read(fileBuffer, { type: 'buffer' });
    const workSheet = workbook.Sheets["LOGIN_NFSE_GOV"];
    const data = XLSX.utils.sheet_to_json(workSheet, {
      defval: '',
      raw: false
    }); 
    data.push(emitente); // emitente deve ser um objeto

  const dadosAtualizados = XLSX.utils.json_to_sheet(data);
  workbook.Sheets["LOGIN_NFSE_GOV"] = dadosAtualizados;

  await XLSX.writeFile(workbook,'G:\\Meu Drive\\PLANILHAS_ACESSO\\DADOS_LOGIN.xlsx');

  return true;  
  }
  // o que acontece aqui é que no HTML está com os inputs desabilitados, então tive que realizar uma manobra para habilitar via JS para clica-lo"
  async function ativarBotao(_selector, page){
  await page.evaluate((selector) => {
        const input = document.querySelector(selector);
        if (input) {
        input.disabled = false;        // habilita
        input.checked = true;          // marca
        input.dispatchEvent(new Event('change', { bubbles: true })); // dispara evento
      }
    }, _selector);
  };


async function waitModal(page){
  await page.waitForFunction(() => {
    const modal = document.querySelector('#modalLoading');
  return modal && modal.style.display === 'none';
});}
  async function selectCodMun(_selector, { value, text } = {}, page) {
  // 1. Espera o select ter opções
  await page.waitForFunction((selector) => {
    const select = document.querySelector(selector);
    return select && select.options.length > 0;
  }, {}, _selector);

  // 2. Lógica de seleção
  await page.evaluate((selector, value, text) => {
    const select = document.querySelector(selector);
    if (!select) return;

    const options = Array.from(select.options);

    let option = null;

    // 🔥 REGRA 1: se só tiver uma opção
    if (options.length === 1) {
      option = options[0];
    } 
    // 🔥 REGRA 2: se tiver várias, tenta pelo value
    else if (value) {
      option = options.find(o => o.value === value);
    } 
    // 🔥 REGRA 3: fallback pelo texto
    if (!option && text) {
      option = options.find(o => o.text.includes(text));
    }

    // 🔥 aplica seleção
    if (option) {
      select.value = option.value;

      select.dispatchEvent(new Event('change', { bubbles: true }));

      if (window.jQuery) {
        window.jQuery(select).trigger("chosen:updated");
      }
    }
  }, _selector, value, text);
  await waitModal(page);
}
  
  async function ativarDropDown(selector, page, pesquisa, isCode){

    await page.waitForSelector(`${selector} + .select2`, );
    // 1. Clica no select2 para abrir o dropdown do Local de Prestação
    await page.click(`${selector} + .select2`); 
    // obs: normalmente o select2 gera um span logo após o select original
    // 2. Aguarda o input de busca ficar disponível
    await page.waitForSelector('.select2-search__field', { visible: true });
    if(pesquisa != '' || pesquisa != null){
    // 3. Digita o texto que você quer pesquisar
    if(isCode){
    await page.type('.select2-search__field', pesquisa);
    await AguardarLista();
    // 5. Clica no primeiro resultado (ou no que você quiser)
    await page.click('.select2-results__option');
    }
    else{ 
      if(pesquisa === "São Paulo/SP"){
              await page.type('.select2-search__field', "São Paulo");
              await AguardarLista();

              for(i=0; i<3; i++){
              await page.keyboard.press("ArrowDown");
              }
              await page.keyboard.press("Enter");
            }
      else if(pesquisa === "Guaxupé/MG"){
        await page.type('.select2-search__field', "Guaxupé");
          await AguardarLista();
          await page.keyboard.press("Enter");
      }
      else{
        await page.type('.select2-search__field', pesquisa);
        await AguardarLista();
        // 5. Clica no primeiro resultado (ou no que você quiser)
        await page.click('.select2-results__option');
      }
    }


    async function AguardarLista(){
    // 4. Aguarda a lista de resultados carregar
    await page.waitForSelector('.select2-results__option', { visible: true });
      // como estamos buscando o primeiro resultado e o primeiro que aparece é Buscando, temos que colocar esse wait para esperar a atualização.
    await page.waitForFunction(() => {
      const options = [...document.querySelectorAll('.select2-results__option')];
      return options.some(opt => opt.textContent.trim() !== 'Buscando...');
    }); 
  }}}

  async function botaoAvancar(page){
    page.evaluate(async () =>{
      const avancarBtn = document.querySelector('body > div.container.container-body > form > div.comandos > button');
      await avancarBtn.click();
    })};
  async function emitirNFSE(dados){
    // tratando dados.
    const data = await lerLoginNFSE();
    const result = await data.find(linha =>  linha.nome.trim() === dados.nomeEmitente.trim());
    console.log(dados);
    console.log("//////////RESULT////////");
    console.log(result);



    //iniciando navegador com puppeter
    const browser = await puppeteer.launch({

    executablePath: `C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe`,
    headless: false});
    const page = await browser.newPage();
      // 
    page.setDefaultTimeout(30000);
    
    //abrindo navegador e definindo responsividade da tela.
    await page.goto('https://www.nfse.gov.br/EmissorNacional/Login?ReturnUrl=%2fEmissorNacional');
    //await page.goto('https://www.producaorestrita.nfse.gov.br/EmissorNacional/');
    await page.setViewport({width: 1366, height: 768});

    //escolhendo seletores
    await page.type("#Inscricao", result.cnpj);
    await page.type("#Senha", result.senha);

    // clicando botão entrar
    await page.locator(".btn-primary").click();

    // esperando botão aparecer para clicar
    const btnNovaNFSE = await page.waitForSelector('.btnAcesso');
    await btnNovaNFSE.click();

    await page.waitForSelector("#pnlInfoIBSCBS");

     // selecionar opção do IBS
     if(dados.IBSeCBS){
        await ativarBotao('.radio-options .radiobutton.inline input[name="PreencherInfoIBSCBS"][value="1"]', page);
     } else{
      await ativarBotao('.radio-options .radiobutton.inline input[name="PreencherInfoIBSCBS"][value="0"]', page);
     }
    

    //formatando data para NFSE
    const hoje = new Date();
    const dia = String(hoje.getDate()).padStart(2, '0');
    const mes = String(hoje.getMonth() + 1).padStart(2, '0');
    const ano = hoje.getFullYear();

    const dataFormatada = `${dia}/${mes}/${ano}`;

    //inserindo data na NFSE e pressionando o Tab
    await page.waitForSelector('#DataCompetencia');
    await page.locator("#DataCompetencia").fill(dataFormatada);
    await page.keyboard.press("Tab");

     // verificar quando o cliente é simples ou não.
      if(result.regimeApuracao == "SIMPLES"){
        await page.evaluate(() => {
        const option = document.querySelector('#SimplesNacional_RegimeApuracaoTributosSN option[value="1"]');
        if (option) {
          // Atribui a propriedade selected como true
          option.selected = true;
          // Dispara o evento de mudança, caso o formulário precise processar a escolha
          option.parentElement.dispatchEvent(new Event('change', { bubbles: true }));
        }
      });}

    // selecionando opção do destinatario
    await ativarBotao('.radio-options .radiobutton.inline input[id="Tomador_LocalDomicilio"][value="1"]', page);

    // escrevendo CNPJ tomador e pressionando o tab
    await page.locator("#Tomador_Inscricao").fill(dados.cnpjDest.toString() != '' ? dados.cnpjDest.toString() :result.cnpjDest);
    await page.keyboard.press("Tab");
    //esperar o botão
    await page.waitForSelector('#btnAvancar');

    if(dados.regimeApuracao != 'MEI'){
      // é compra governamental?
    if(dados.CompraGovernamental == "Sim"){
        await ativarBotao('.radio-options .radiobutton.inline input[name="EhCompraGovernamental"][value="1"]', page);
     } else{
      await ativarBotao('.radio-options .radiobutton.inline input[name="EhCompraGovernamental"][value="0"]', page);
     }
     // destinatário é o próprio adquirente?
    if(dados.destinatarioAdquirente){
        await ativarBotao('.radio-options .radiobutton.inline input[name="DestinatarioEhOAdquirente"][value="1"]', page);
     } else{
      await ativarBotao('.radio-options .radiobutton.inline input[name="DestinatarioEhOAdquirente"][value="0"]', page);
     }
    }
    
    // clicando botão avançar
    page.evaluate(() => {
      /* setTimeout dentro do evaluate porque ele funciona dentro do browser. se colocarmos do lado de fora, o timeout funciona no Node.Js, fznd o puppeteer pular */
      setTimeout(()=> {
      const btn = document.getElementById('btnAvancar');
      if (btn) btn.click();
    }, 2000)})

    //inserindo município
    await ativarDropDown('#LocalPrestacao_CodigoMunicipioPrestacao', page, result.localServico,false);
    // inserindo codigo do servico
    await ativarDropDown('#ServicoPrestado_CodigoTributacaoNacional', page,  dados.codServicoNac.toString() != '' ? dados.codServicoNac.toString() : result.codServicoNac, true );

    await waitModal(page)
    
    if(dados.IBSeCBS){
      try {
          // Tenta executar a seleção do código municipal
           await selectCodMun("#ServicoPrestado_CodigoComplementarMunicipal", {value: dados.codServicoMun}, page);
        } catch (error) {
          // Se der qualquer erro/exceção aqui dentro, o bot cai neste bloco:
          console.log("[Aviso] Erro ao selecionar o código municipal, mas continuando o fluxo...", error.message);
        }
      // escolhendo a opção NÂO
      await ativarBotao('#ServicoPrestado_HaExportacaoImunidadeNaoIncidencia', page);

      // nbs
      await selectCodMun("#ServicoPrestado_CodigoNBS", {value: "113012000"}, page);
      //CIO
      await selectCodMun("#ServicoPrestado_CodigoIndOp", {value: "100401"}, page);
      }


      // escolhendo a opção NÂO
      await ativarBotao('#ServicoPrestado_HaExportacaoImunidadeNaoIncidencia', page);
      
      

     
    // escrevendo descrição
    await page.waitForSelector("#ServicoPrestado_Descricao");
    await page.type("#ServicoPrestado_Descricao", dados.descricao.toString() != '' ? dados.descricao.toString() : result.descricao);

  

    //condicional para códigos de COI
    if(dados.codServico == "070201")
    {
      await page.waitForSelector(`.radiobutton label input[type="radio"]`);
      await page.evaluate(()=>{
        const el = document.querySelector("#Obra_TipoInformacao");
        el.style.display = "block";
        el.click();
      })
      await page.locator('label:has(input[name="Obra.TipoInformacao"][value="1"])')
      await page.click('label:has(input[name="Obra.TipoInformacao"][value="1"])');
      await page.locator('#Obra_CodigoObra').fill("COI");
    }

    //clicando botão Avançar *escrevi uma função para não duplicar código*
    botaoAvancar(page);

    // inserindo valor total da NFSE
    await page.waitForSelector('#Valores_ValorServico');
    await page.locator('#Valores_ValorServico').fill(dados.valorTotal.toString());
    await page.keyboard.press('Tab');



    if(result.regimeApuracao == "LUCRO PRESUMIDO"){
      await selectCodMun("#ISSQN_RegimeEspecial",{value: "6"}, page);
      await selectCodMun("#TributacaoFederal_PISCofins_SituacaoTributaria" ,{value: "1"}, page);

      // formatando valor total
      await page.locator('#TributacaoFederal_PISCofins_BaseDeCalculo').fill(dados.valorTotal.toLocaleString('pt-BR', {
      minimumFractionDigits: 2,
      maximumFractionDigits: 2,
      useGrouping: false
      }));
      await page.locator('#TributacaoFederal_PISCofins_AliquotaPIS').fill('0,65');
      await page.locator('#TributacaoFederal_PISCofins_AliquotaCOFINS').fill('3,00');
        
      await selectCodMun("#TributacaoFederal_PISCofins_TipoRetencao" ,{value: "0"}, page);
      await ativarBotao('.radio-options .radiobutton.inline input[id="ValorTributos_TipoValorTributos"][value="2"]', page);
            
    } else if(result.regimeApuracao == "SIMPLES"){
      await ativarBotao('#ISSQN_HaRetencao[value="0"]', page);
      await page.evaluate(() => {
        const option = document.querySelector('#ISSQN_HaRetencao[value="0"]');
        if (option) {
          // Atribui a propriedade selected como true
          option.checked = true;
          // Dispara o evento de mudança, caso o formulário precise processar a escolha
          option.parentElement.dispatchEvent(new Event('change', { bubbles: true }));
        }});

      await selectCodMun("#TributacaoFederal_PISCofins_SituacaoTributaria" ,{value: "0"}, page);
      await selectCodMun("#TributacaoFederal_PISCofins_TipoRetencao" ,{value: "0"}, page)
      await ativarBotao('.radio-options .radiobutton.inline input[id="ValorTributos_TipoValorTributos"][value="4"]', page);

       await page.evaluate(() => {
        const option = document.querySelector('#ValorTributos_TipoValorTributos[value="4"]');
        if (option) {
          // Atribui a propriedade selected como true
          option.checked = true;
          // Dispara o evento de mudança, caso o formulário precise processar a escolha
          option.parentElement.dispatchEvent(new Event('change', { bubbles: true }));
        }});

      await ativarBotao('#pnlValorAliquotaSN', page);   
      await page.type("#ValorTributos_AliquotaSN", result.aliquotaSimples.toLocaleString('pt-BR', {
      minimumFractionDigits: 2,
      maximumFractionDigits: 2,
      useGrouping: false
      }));
    }

    if(dados.IBSeCBS){
      // ibs e cbs
      await selectCodMun("#ValorTributos_CodigoSituacaoTributaria", {value: "000"}, page);
      await waitModal(page);
      await selectCodMun("#ValorTributos_CodigoClassificacaoTributaria", {value: "000001"}, page);
      }
      
      await page.locator(".btn.btn-lg.btn-primary.direita.has-spin").click();  
      await page.waitForSelector(".pnlCollapse.emissao-calculos");


    // avançando para confirmar dados
    botaoAvancar(page);

    // confirmando emissaoNFSE
    // await page.waitForSelector("#btnProsseguir");
    // await page.locator("#btnProsseguir").click();
 }
contextBridge.exposeInMainWorld('excelControl', {
  lerLoginNFSE,
  cadastrarLoginNFSE,
  emitirNFSE
});