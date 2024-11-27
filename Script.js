const fetch = require('node-fetch');

const https = require('https');
const url = require('url');


// Define username, password, and other necessary constants
const trmPassport = 'https://sul7gblv4265.solihull.jlrint.com';
const trm3dSpace = 'https://sul7gblv4265.solihull.jlrint.com/3dspace';
const username = 'karisett';
const password = 'Jaguar123';


function getReadyFetchInstance() {
  return new Promise(async (resolve, reject) => {
    const myHeaders = new Headers();
    myHeaders.append("Accept", "application/json");
    const requestOptions = {
      method: "GET",
      headers: myHeaders,
      redirect: "follow",
      credentials: "include",
      agent: new https.Agent({
        rejectUnauthorized: false
      })
    };

    try {
      let response = await fetchWithCredentials(trmPassport+'/3dpassport/login?action=get_auth_params', requestOptions);
      let body = await response.json();
      let ltTicket = body.lt;
      console.log(ltTicket);
      resolve(ltTicket);
    } catch (error) {
      console.error(error);
      reject(error);
    }
  });
}

getReadyFetchInstance();

async function fetchWithCredentials(url, options) {
  return fetch(url, options);
}