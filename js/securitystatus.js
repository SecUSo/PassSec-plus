var passSec = passSec || {};
passSec.sslCheckResult = "DNS";
/**
*   get answer for request to ssllabs api
*/
function getSecurityStatus(){
  var sslCheckEnabled = false;
  if(!sslCheckEnabled){
    if(passSec.url.startsWith("https")){
      return "https";
    }
    else return "http";
  }
  chrome.runtime.sendMessage({name: "sslcheck", url: passSec.url},function(r){
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
};

function sendRequest(){
  chrome.runtime.sendMessage({name: "sslcheck", url: passSec.url},function(r){
    var result = JSON.parse(r);
    //console.log(result.endpoints[0].statusMessage);
    passSec.sslCheckResult = result.status;
  });
}
