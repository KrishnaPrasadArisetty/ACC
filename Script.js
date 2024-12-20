import fetch from 'node-fetch';
import makeFetchCookie from 'fetch-cookie';
import https from 'https';
import config from './config.json' assert { type: 'json' };
import Excel from 'exceljs';
import JSONStream from 'JSONStream';

const env = config[config.Current_env];

const TRM_PASSPORT = env.TRMpassport;
const FIND_OBJECTS_PATH = env.findObjectsPath;

const fetchCookie = makeFetchCookie(fetch);

async function getLTToken() {
  const requestOptions = {
    method: 'GET',
    headers: {
      Accept: 'application/json',
    },
    redirect: 'follow',
    credentials: 'include',
    rejectUnauthorized: false,
    agent: new https.Agent({ rejectUnauthorized: false }),
  };

  const response = await fetchCookie(TRM_PASSPORT + env.ltTockenPath, requestOptions,new https.Agent({rejectUnauthorized: false,}));
  const body = await response.json();
  console.log("Login Ticket------->"+body.lt);
  return body.lt;
}

async function login() {
  const ltToken = await getLTToken();

  const requestOptions = {
    method: 'POST',
    headers: {
      'Content-Type': 'application/x-www-form-urlencoded;charset=UTF-8',
    },
    body: `lt=${ltToken}&username=${env.username}&password=${env.password}`,
    redirect: 'follow',
    rejectUnauthorized: false,
    agent: new https.Agent({ rejectUnauthorized: false }),
  };

  const response = await fetchCookie(TRM_PASSPORT + env.loginPath, requestOptions);
  const body = await response.text();
  console.log("body--Login----->"+body);
}

async function searchObjects() {
  const searchCriteria = {
    Type_Pattern: 'iPLMSSARequirement',
    Name_Pattern: 'req-*',
    Revision_Pattern: '*',
    Owner_Pattern: '',
    Vault_Pattern: '',
    Object_Where: '',
    Expand_Type: '',
    Object_Selects: 'attribute[Content Data]',
  };

  const requestOptions = {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(searchCriteria),
    redirect: 'follow',
    credentials: 'include',
    rejectUnauthorized: false,
    agent: new https.Agent({ rejectUnauthorized: false }),
  };
  
  const workbook = new Excel.Workbook();
  const worksheet = workbook.addWorksheet('Image_Error');
  worksheet.addRow(["Id", "Name", "Revision"]);
  const response = await fetchCookie(env.TRMspace + FIND_OBJECTS_PATH, requestOptions);
  const dataStream = response.body.pipe(JSONStream.parse('*')); 

  dataStream.on('data', (item) => {
    console.log("Processing------->"+item.name);
    const contentData = item['attribute[Content Data]'];
    if (contentData.includes('src="https:')) {
      worksheet.addRow([item.id, item.name, item.revision]);
    }
  });
  
  dataStream.on('error', (error) => {
    console.error('Error processing data stream:', error);
  });

  dataStream.on('end', () => {
    worksheet.addRow(['Total No of Requirements with Errors', worksheet.rowCount - 1]);    
    workbook.xlsx.writeFile('Image_Errors.xlsx');
  });
}

async function mainModule() {
  try {
    await login();
    await searchObjects();
  } catch (error) {
    console.error(error);
  }
}

mainModule();
