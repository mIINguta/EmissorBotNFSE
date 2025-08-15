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

    //inserindo data na NFSE
    await page.locator("#DataCompetencia").fill(dataFormatada);

    await page.keyboard.press("Tab");


    // selecionando opção do destinatario
    /* o que acontece aqui é que no HTML está com os inputs desabilitados, então tive que realizar uma manobra para habilitar via JS para clica-lo" */
await page.evaluate(() => {
  const input = document.querySelector('.radio-options .radiobutton.inline input[id="Tomador_LocalDomicilio"][value="1"]');
  if (input) {
    input.disabled = false;        // habilita
    input.checked = true;          // marca
    input.dispatchEvent(new Event('change', { bubbles: true })); // dispara evento
  }
});
    // escrevendo CNPJ tomador
    await page.locator("#Tomador_Inscricao").fill(result.cnpjDest);

    // clicando tab
    await page.keyboard.press("Tab");

    // clicando botão avançar
    await page.evaluate(() => {
    const btn = document.getElementById('btnAvancar');
    if (btn) btn.click();
});
    
  }

contextBridge.exposeInMainWorld('excelControl', {
  lerLoginNFSE,
  cadastrarLoginNFSE,
  emitirNFSE

});