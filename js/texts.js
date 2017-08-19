var passSec = passSec || {};

/**
* fill tooltip with text
*/
function getTexts(){
  var text =  '<span id="passSecWarning" class="http-warning">'+ chrome.i18n.getMessage("insecureWarning","data") +'</span>'+
              '<hr>' +
              '<span id="passSecURL">'+chrome.i18n.getMessage("domainInfo")+'<span id="passSecDomain">'+passSec.domain+'</span>.</span>'+
              '<span id="passSecVerify">'+chrome.i18n.getMessage("verifyDomain")+'</span>'+
              '<p id="passSecPhishingText" class="phishing-warning">'+
                  '<img id="passSecPhishingImage" src='+chrome.extension.getURL("skin/red_triangle.png")+'>'+
              '</p>'+
              '<div id="passSecConsequence" class="http-warning">'+
                  '<img id="passSecConsequenceImage" src='+chrome.extension.getURL("skin/consequence.png")+'>'+
                  '<p id="passSecConsequenceText">'+chrome.i18n.getMessage("searchConsequenceHttps")+'</p>'+
              '</div>'+
              '<div id="passSecRecommendation" class="http-warning">'+
                  '<img id="passSecRecommendationImage" src='+chrome.extension.getURL("skin/recommendation.png")+'>'+
                  '<p id="passSecRecommendationText">'+chrome.i18n.getMessage("searchRecommendationHttps")+'</p>'+
              '</div>'+
              '<div id="passSecInfo" class="http-warning">'+
                  '<img id="passSecInfoImage" src='+chrome.extension.getURL("skin/more_info.png")+'>'+
                  '<p id="passSecInfoText">'+chrome.i18n.getMessage("moreInfo")+'</p>'+
              '</div>'+
              '<div id="passSecButtons>">'+
                '<button id="passSecButton1" type="button">'+ "Exception" + ' </button>' +
                '<button id="passSecButton2" type="button">'+ chrome.i18n.getMessage("OK") +' </button>'+
              '</div>';

  console.log(text);
  return text;
};


function extractDomain(domain){
  var split = domain.split(".");
  if(split.length > 2) domain = split[split.length-2]+"."+split[split.length-1];
  return domain;
};
