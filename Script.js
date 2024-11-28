//const fetchCookie = require('fetch-cookie')(require('node-fetch'));

function getReadyFetchInstance() {
  return new Promise(async (resolve, reject) => {
      const fetchCookie = makeFetchCookie(fetch);
      const myHeaders = new Headers();
      myHeaders.append("Accept", "application/json");

      const requestOptions = {
          method: "GET",
          headers: myHeaders,
          redirect: "follow",
          credentials: "include"
      };

      let response = await fetchCookie(`https://sul7gblv4265.solihull.jlrint.com/3dpassport/login?action=get_auth_params`, requestOptions)

      let body = await response.json();
      let ltTicket = body.lt;

      const myHeaders1 = new Headers();
      myHeaders1.append("Content-Type", "application/x-www-form-urlencoded;charset=UTF-8");

      const raw = "lt=" + ltTicket + "&username=gsaman&password=XXXX";

      
      resolve(fetchCookie);

  })
};

console.log(getReadyFetchInstance());