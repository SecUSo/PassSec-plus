var passSec = passSec || {};

/**
* fill tooltip with text
*/
function getTexts(){
  var text =  '<span id="passSecWarning" class="http-warning"></span>'+
              '<hr class="http-warning">' +
              '<span id="passSecURL">'+chrome.i18n.getMessage("domainInfo")+'<span id="passSecDomain">'+passSec.domain+'</span>.</span>'+
              '<span id="passSecVerify">'+chrome.i18n.getMessage("verifyDomain")+'</span>'+
              '<div id="passSecPhishing" class="phish-warning">'+
                  '<img id="passSecPhishingImage" src='+chrome.extension.getURL("skin/red_triangle.png")+'>'+
                  '<p id="passSecPhishingText">'+chrome.i18n.getMessage("phishWarning")+'</p>'+
              '</div>'+
              '<div id="passSecConsequence" class="http-warning">'+
                  '<img id="passSecConsequenceImage" src='+chrome.extension.getURL("skin/consequence.png")+'>'+
                  '<p id="passSecConsequenceText"></p>'+
              '</div>'+
              '<div id="passSecRecommendation" class="http-warning littleText">'+
                  '<img id="passSecRecommendationImage" src='+chrome.extension.getURL("skin/recommendation.png")+'>'+
                  '<p id="passSecRecommendationText">'+chrome.i18n.getMessage("recommendationHttps")+'</p>'+
              '</div>'+
              '<div id="passSecInfo" class="http-warning littleText">'+
                  '<img id="passSecInfoImage" src='+chrome.extension.getURL("skin/more_info.png")+'>'+
                  '<p id="passSecInfoText">'+chrome.i18n.getMessage("moreInfo")+'</p>'+
              '</div>'+
              '<div id="passSecButtons>">'+
                '<button id="passSecButton0" class="http-warning" type="button" hidden>'+ "bla" + ' </button>' +
                '<button id="passSecButtonException" type="button"></button>' +
                '<button id="passSecButtonClose" type="button">'+ chrome.i18n.getMessage("OK") +' </button>'+
              '</div>';
  return text;
};

/**
* fill tooltip items with functionality
*/
function processTooltip(){
  var t = passSec.tooltip;
  $(t.find("#passSecButtonClose")[0]).click(function(event){passSec.api.toggle(false);});
  $(t.find("#passSecRecommendationText")[0]).removeClass("passSecClickable");
  $(t.find("#passSecButtonException")[0]).css("background-color", "white !important");
  $(t.find("#passSecRecommendationText")[0]).unbind();
  switch(passSec.security){
    case "https":
      $(t.find("#passSecPhishing")).hide();
      //$(t.find(".http-warning")).hide();
      $(t.find("#passSecButtonException")[0]).html(chrome.i18n.getMessage("exceptionHTTP"));
      $(t.find("#passSecButtonException")[0]).css("background-color", "red !important");
      $(t.find("#passSecButtonException")[0]).click(function(event){
        // TODO: add method that returns all possible targets
        $('input[type=password]').removeClass( "passSec-https" ).addClass( "passSec-httpsEV" );
        $('input[type=search]').removeClass( "passSec-https" ).addClass( "passSec-httpsEV" );
        passSec.security = "httpsEV";
        processTooltip();
      });
      $(t.find("#passSecRecommendationText")[0]).addClass("passSecClickable");
      $(t.find("#passSecRecommendationText")[0]).click(function(e){
        if($(this).html() == chrome.i18n.getMessage("recommendationHttps")){
          $(this).html(chrome.i18n.getMessage("MoreRecommendationsHttps"));
        }
        else {
          $(this).html(chrome.i18n.getMessage("recommendationHttps"));
        }
      });
      getFieldText("Https");
      break;
    case "http":
      $(t.find("#passSecPhishing")).hide();
      $(t.find(".http-warning")).show();
      $(t.find("#passSecButtonException")[0]).html(chrome.i18n.getMessage("exceptionHTTP"));
      $(t.find("#passSecButtonException")[0]).css("background-color", "red !important");
      $(t.find("#passSecButtonException")[0]).click(function(event){
        $('input[type=password]').removeClass( "passSec-http" ).addClass( "passSec-httpsEV" );
        $('input[type=search]').removeClass( "passSec-http" ).addClass( "passSec-httpsEV" );
        passSec.security = "httpsEV";
        processTooltip();
      });
      getFieldText("Http");
      break;
    case "phish":
      $(t.find(".http-warning")).show();
      $(t.find("#passSecPhishing")).show();
      break;
    case "httpsEV":
      $(t.find("#passSecButtonException")[0]).html(chrome.i18n.getMessage("exceptionHTTPS"));
      $(t.find("#passSecPhishing")).hide();
      $(t.find(".http-warning")).hide();
      $(t.find("#passSecButtonException")[0]).click(function(event){
        // TODO: for all input fields on the page
        $(passSec.target).addClass("passSecNoTooltip");
        $('.qtip').each(function(){
          $(this).data('qtip').destroy();
        });
      });
      break;
  }
};

/**
* fill the tooltip with texts corresponding to a certain fieldType
* @param protocol: "Http" or "Https" // TODO: phish, httpsEV for later version
*/
function getFieldText(protocol){
  var fieldType = passSec.target.type; // fieldType: "login", "payment", "personal", "search"
  console.log(fieldType + "is field type");
  console.log(protocol + "is protocol");
  // TODO: missing: payment, personal
  var t = passSec.tooltip;
  $(t.find("#passSecWarning")[0]).html(chrome.i18n.getMessage(fieldType+"Warning"));
  $(t.find("#passSecConsequenceText")[0]).html(chrome.i18n.getMessage(fieldType+"Consequence"+protocol));
  if(protocol == "Http"){
    $(t.find("#passSecRecommendationText")[0]).html(chrome.i18n.getMessage(fieldType+"Recommendation"+protocol));
  }
  else {
    $(t.find("#passSecRecommendationText")[0]).html(chrome.i18n.getMessage("recommendationHttps"));
  }
  $(t.find("#passSecInfoText")[0]).click(function(e){
    if($(this).html() == chrome.i18n.getMessage("moreInfo")){
      $(this).html(chrome.i18n.getMessage(fieldType+"Info"+protocol));
    }
    else {
      $(this).html(chrome.i18n.getMessage("moreInfo"));
    }
  });
};

function extractDomain(url,tld){
  var split = url.split(".");
  if(split.length > 2) url = split[split.length-2] + "." + split[split.length-1];

  var arr = tld.split("\n").filter(function(value) { return value != "" && !value.startsWith("//") && value.split(".").length >= 3  });
  if(arr.toString().indexOf(url) > -1){
    var arr2 = tld.split("\n").filter(function(value) { return value != "" && !value.startsWith("//") && value.indexOf(url) > -1  });
    var temp = "bla";
    if(split.length >= 3) temp = split[split.length-3] + "." + split[split.length-2] + "." + split[split.length-1];
    if(arr2.indexOf(temp) > -1 || (arr2.indexOf("*."+url) > -1 && arr2.indexOf("!"+temp) == -1)) return temp;
  }
  return url;
};
