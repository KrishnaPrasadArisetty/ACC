const trmPassport = 'https://sul7gblv4265.solihull.jlrint.com';
const trm3dSpace = 'https://sul7gblv4265.solihull.jlrint.com/3dspace';
const username = 'karisett';
const password = 'Jaguar123';

const https = require('https');
const url = require('url');

const parsedUrl = url.parse(trmPassport);
const dspaceparsedUrl = url.parse(trm3dSpace);

async function getLoginTicket() {
  const options = {
    method: 'GET',
    hostname: parsedUrl.hostname,
    path: '/3dpassport/login?action=get_auth_params',
    rejectUnauthorized: false,
    headers: { 'Content-Type': 'application/json' }
  };
  const response = await callWeb(options, '',"");
  return (response.lt);
}

async function login(ticket) {
  const payload = `lt=${ticket}&username=${username}&password=${password}`;
  const options = {
    method: 'POST',
    hostname: parsedUrl.hostname,
    path: '/3dpassport/login?service=' + trm3dSpace + '?tenant=onPromise',
    rejectUnauthorized: false,
    headers: { 'Content-Type': 'application/x-www-form-urlencoded;charset=UTF-8' },
  };
  const response = await callWeb(options, payload,"Login");
  return response;
}

async function getInfo() {
  const payload = {
    "Type_Pattern": "iPLMSSARequirement",
    "Name_Pattern": "req-430138048-00010266",
    "Revision_Pattern": "*",
    "Owner_Pattern": "",
    "Vault_Pattern": "",
    "Object_Where": "",
    "Expand_Type": "0",
    "Object_Selects": ""
  };
  const options = {
    method: 'POST',
    hostname: parsedUrl.hostname,
    path: '/3dspace/resources/ADKWebservicesModeler/Objects',
    rejectUnauthorized: false,
    headers: { 'Content-Type': 'application/json' }
  };
  const response = await callWeb(options, JSON.stringify(payload),"nnnnnn");
  return (response);
}

main();

async function main() {
  try {
    const loginTicket = await getLoginTicket();
    console.log('Login Ticket:', loginTicket);
    const response = await login(loginTicket);
    console.log('Login Response:', response);
    //const Info = await getInfo();
    //console.log('Info---4444444->>>>', Info);
    
  } catch (error) {
    console.error('Error:', error);
  }
 
}

function callWeb(options, payload,Login) {  
  
  console.log('payload--22222-->>>>'+payload);
  return new Promise((resolve, reject) => {
    const req = https.request(options, res => {
      let data = '';
      res.on('data', chunk => {         
        data += chunk; });
      res.on('end', () => {
        if (res.statusCode === 200) {
          try {
            if (Login=="Login") {
              resolve(data);

            }else {
              const jsonData = JSON.parse(data);
              resolve(jsonData);

            }
          } catch (error) {
            reject(error);
          }
        } else {
          reject("Error "+res.statusCode);
        }
      });
    });

    req.on('error', error => { reject(error); });
    req.write(payload);
    req.end();
  });
}



