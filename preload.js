const { contextBridge } = require('electron');
const fs = require('fs').promises;
const XLSX = require('xlsx');

console.log('[PRELOAD] carregado');

contextBridge.exposeInMainWorld('excelControl', {
  
  lerLoginNFSE: async () => {
    const fileBuffer = await fs.readFile('G:\\Meu Drive\\PLANILHAS_ACESSO\\DADOS_LOGIN.xlsx');
    const workbook = XLSX.read(fileBuffer, { type: 'buffer' });
    const workSheet = workbook.Sheets["LOGIN_NFSE_GOV"];
    const data = XLSX.utils.sheet_to_json(workSheet, {
      defval: '',
      raw: false
    });
    return data;
  },
  cadastrarLoginNFSE: async (emitente) =>{
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
});