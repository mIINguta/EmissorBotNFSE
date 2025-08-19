const { contextBridge } = require('electron');
const fs = require('fs').promises;
const XLSX = require('xlsx');
const  puppeteer  = require('puppeteer');


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

    async function  cadastrarLoginNFSE(emitente){
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

  XLSX.writeFile(workbook,'G:\\Meu Drive\\PLANILHAS_ACESSO\\DADOS_LOGIN.xlsx');

  console.log("Ok!")
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


  async function ativarDropDown(selector, page, pesquisa){
    
    await page.waitForSelector(`${selector} + .select2`);
    // 1. Clica no select2 para abrir o dropdown do Local de Prestação
    await page.click(`${selector} + .select2`); 
    // obs: normalmente o select2 gera um span logo após o select original
    // 2. Aguarda o input de busca ficar disponível
    await page.waitForSelector('.select2-search__field', { visible: true });
    if(pesquisa != '' || pesquisa != null){
    // 3. Digita o texto que você quer pesquisar
    await page.type('.select2-search__field', pesquisa);
    // 4. Aguarda a lista de resultados carregar
    await page.waitForSelector('.select2-results__option', { visible: true });
      // como estamos buscando o primeiro resultado e o primeiro que aparece é Buscando, temos que colocar esse wait para esperar a atualização.
    await page.waitForFunction(() => {
      const options = [...document.querySelectorAll('.select2-results__option')];
      return options.some(opt => opt.textContent.trim() !== 'Buscando...');
    });
    // 5. Clica no primeiro resultado (ou no que você quiser)
    await page.click('.select2-results__option');
  }}

  async function emitirNFSE(dados){
    // tratando dados.
    const data = await lerLoginNFSE();
    const result = await data.find(linha =>  linha.nome.trim() === dados[0].nomeEmitente.trim());
    console.log(result);

    //iniciando navegador com puppeter
    const browser = await puppeteer.launch({

    executablePath: `C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe`,
    headless: false});
    const page = await browser.newPage();
      // 
    page.setDefaultTimeout(60000);
    
    //abrindo navegador e definindo responsividade da tela.
    await page.goto('https://www.nfse.gov.br/EmissorNacional/Login?ReturnUrl=%2fEmissorNacional');
    await page.setViewport({width: 1366, height: 768});

    //escolhendo seletores
    await page.type("#Inscricao", result.cnpj);
    await page.type("#Senha", result.senha);

    // clicando botão entrar
    await page.locator(".btn-primary").click();

    // esperando botão aparecer para clicar
    const btnNovaNFSE = await page.waitForSelector('.btnAcesso');
    await btnNovaNFSE.click();
    
    //formatando data para NFSE
    const hoje = new Date();
    const dia = String(hoje.getDate()).padStart(2, '0');
    const mes = String(hoje.getMonth() + 1).padStart(2, '0');
    const ano = hoje.getFullYear();

    const dataFormatada = `${dia}/${mes}/${ano}`;

    //inserindo data na NFSE e pressionando o Tab
    await page.locator("#DataCompetencia").fill(dataFormatada);
    await page.keyboard.press("Tab");

    // selecionando opção do destinatario
    await ativarBotao('.radio-options .radiobutton.inline input[id="Tomador_LocalDomicilio"][value="1"]', page);

    // escrevendo CNPJ tomador e pressionando o tab
    await page.locator("#Tomador_Inscricao").fill(result.cnpjDest);
    await page.keyboard.press("Tab");
    //esperar o botão
    await page.waitForSelector('#btnAvancar');

    // clicando botão avançar
    page.evaluate(() => {
      /* setTimeout dentro do evaluate porque ele funciona dentro do browser. se colocarmos do lado de fora, o timeout funciona no Node.Js, fznd o puppeteer pular */
      setTimeout(()=> {
      const btn = document.getElementById('btnAvancar');
      if (btn) btn.click();
    }, 2000)})

    //inserindo município
    await ativarDropDown('#LocalPrestacao_CodigoMunicipioPrestacao', page, "Rio de Janeiro");
    // inserindo codigo do servico
    await ativarDropDown('#ServicoPrestado_CodigoTributacaoNacional', page, result.codServico);

    // escolhendo a opção NÂO
    await ativarBotao('#ServicoPrestado_HaExportacaoImunidadeNaoIncidencia', page)
    
    // escrevendo descrição
    await page.waitForSelector("#ServicoPrestado_Descricao");
    await page.type("#ServicoPrestado_Descricao", result.descricao != '' ? result.descricao : dados.descricao);

   

    
}

contextBridge.exposeInMainWorld('excelControl', {
  lerLoginNFSE,
  cadastrarLoginNFSE,
  emitirNFSE

});