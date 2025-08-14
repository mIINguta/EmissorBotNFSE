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

    await page.goto('https://www.nfse.gov.br/EmissorNacional/Login?ReturnUrl=%2fEmissorNacional');
    await page.setViewport({width: 1366, height: 768});

  }

contextBridge.exposeInMainWorld('excelControl', {
  lerLoginNFSE,
  cadastrarLoginNFSE,
  emitirNFSE

});