import fetch from 'node-fetch';
import makeFetchCookie from 'fetch-cookie'
import https from 'https';
import config from './config.json' assert { type: 'json' };
import Excel from 'exceljs';

const env = config[config.Current_env];
const workbook = new Excel.Workbook();
const worksheet = workbook.addWorksheet('Image_Error');
//worksheet.addRow("Id,Name,Revision");
worksheet.addRow(["Id", "Name", "Revision"]);

const fetchCookie = makeFetchCookie(fetch);
const agent = new https.Agent({
  rejectUnauthorized: false,
});
async function getReadyFetchInstance() {
  return new Promise(async (resolve, reject) => {
      
      const myHeaders = new Headers();
      
      myHeaders.append("Accept", "application/json");

      const requestOptions = {
          method: "GET",
          headers: myHeaders,
          redirect: "follow",
          credentials: "include",
          rejectUnauthorized: false,
          agent,
      };

      let response = await fetchCookie(env.TRMpassport+env.ltTockenPath, requestOptions,new https.Agent({
        rejectUnauthorized: false,
      }))

      let body = await response.json();
      let ltTicket = body.lt;
      console.log("---->"+ltTicket);

      const myHeaders1 = new Headers();
      myHeaders1.append("Content-Type", "application/x-www-form-urlencoded;charset=UTF-8");
      const raw = "lt=" + ltTicket + "&username="+env.username+"&password="+env.password;
      const requestOptions1 = {
          method: "POST",
          headers: myHeaders1,
          body: raw,
          redirect: "follow",
          rejectUnauthorized: false,
          agent,
      };

      let response1 = await fetchCookie(env.TRMpassport+env.loginPath, requestOptions1)
      let body1 = await response1.text();
      console.log("body1---->"+body1);
      const raw2 = {
        "Type_Pattern": "iPLMSSARequirement",
        "Name_Pattern": "req*",
        "Revision_Pattern": "*",
        "Owner_Pattern": "",
        "Vault_Pattern": "",
        "Object_Where": "",
        "Expand_Type": "",
        "Object_Selects": "attribute[Content Data]"
       }
      const myHeaders2 = new Headers();
      myHeaders2.append("Content-Type", "application/json");

      const requestOptions3 = {
        method: "POST",
        headers: myHeaders2,
        body: JSON.stringify(raw2),
        redirect: "follow",
        credentials: "include",
        rejectUnauthorized: false,
        agent,
      };

      let response2 = await fetchCookie(env.TRMspace+env.findObjectsPath, requestOptions3)
      let body2 = await response2.json();
      console.log("body2bbbb---->"+JSON.stringify(body2));
      resolve(body2);
  })
};



async function mainModule(){

  const findObjects = await getReadyFetchInstance();
  for (let i = 0; i < findObjects.length; i++) {
    const item = findObjects[i];
    let ObjectID = item.id;
    console.log("ObjectID---->"+ObjectID);
    let sContentData = item["attribute[Content Data]"];
    console.log("sContentData---->"+sContentData);
    if (sContentData.includes('src="https:')) {
      console.log("Krishna---->");
      worksheet.addRow([ObjectID, item.name, item.revision]);
      
    }
  }
  console.log("Krishna---->"+worksheet.rowCount);
  worksheet.addRow(["Total No of Requirements with Errors",worksheet.rowCount-1 ]);
  workbook.xlsx.writeFile('Image_Errors.xlsx');
}
mainModule();
