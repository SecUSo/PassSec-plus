var passSec = passSec || {};
passSec.sslCheckResult = "DNS";
passSec.security = "http";

/**
*   get security status of website
*/
function getSecurityStatus(){
  chrome.runtime.sendMessage({name:"getStorage"},function(r){
    console.log(r.sslCheckEnabled);
    if(r.sslCheckEnabled == "false"){
      console.log(passSec.url);
      if(passSec.url.startsWith("https")){
        passSec.security = "https";
      }
      else passSec.security ="http";
    }
    else{
      getSSLStatus();
    }
  });
};

/**
*   get answer for request to ssllabs api
*/
function getSSLStatus(){
  chrome.runtime.sendMessage({name: "sslCheck", url: passSec.url},function(r){
    //console.log(r);
    var result = JSON.parse(r);
    //console.log(result.status);
    var repeatSSLCheck = setInterval(sendRequest(), 2000);
    passSec.sslCheckResult = result.status;
    if(passSec.sslCheckResult == "READY"){
      clearInterval(repeatSSLCheck);
      //console.log(result.endpoints[0]);
    }
  });
  chrome.runtime.sendMessage({name: "sslcheck", url: passSec.url},function(r){
    var result = JSON.parse(r);
    //console.log(result.endpoints[0].statusMessage);
    passSec.sslCheckResult = result.status;
  });
}
