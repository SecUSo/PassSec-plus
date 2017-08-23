changes = [];

$(document).ready(function() {
  $('.tabs .tab-links a').on('click', function(e)  {
    var currentAttrValue = $(this).attr('href');
    // Show/Hide Tabs
    $('.tabs ' + currentAttrValue).show().fadeIn(400).siblings().hide();

    // Change/remove current tab to active
    $(this).parent('li').addClass('active').siblings().removeClass('active');
    e.preventDefault();
  });
  $('li').on("click", function(e){
    $("#redirectList").hide();
    $("#exceptionList").hide();
  });

  $("#redirectList").hide();
  $("#exceptionList").hide();

  addTexts();
  init();
  addEvents();
});

/**
* set texts of options page
*/
function addTexts(){
  // Title
  $("#options").html(chrome.i18n.getMessage("settingsTitle"));
  $("#title").html(chrome.i18n.getMessage("settingsTitle"));

  // General tab
  $("#general").html(chrome.i18n.getMessage("tab1"));
  $("#appearance").html(chrome.i18n.getMessage("appearance"));
  $("#appearanceSecure").html(chrome.i18n.getMessage("appearanceSecure"));
  $("#appearanceNotSecure").html(chrome.i18n.getMessage("appearanceNotSecure"));
  $("#changeIconText").html(chrome.i18n.getMessage("changeIconText"));
  $("#changeIconButton").html(chrome.i18n.getMessage("changeIconButton"));

  // Redirections tab
  $("#tab2").html(chrome.i18n.getMessage("tab2"));
  $("#recommendedRedirections").html(chrome.i18n.getMessage("recommendedRedirections"));
  $("#recommendedRedirectionsInfo").html(chrome.i18n.getMessage("addRedirectionList"));
  $("#addRecommendedRedirections").html(chrome.i18n.getMessage("addRecommendedRedirections"));
  $("#httpsRedirects").html(chrome.i18n.getMessage("httpsRedirections"));
  $("#showRedirects").html(chrome.i18n.getMessage("showHttpsRedirections"));
  $("#clearRedirectionList").html(chrome.i18n.getMessage("emptyList"));

  // Exceptions tab
  $("#tab3").html(chrome.i18n.getMessage("tab3"));
  $("#websiteExceptions").html(chrome.i18n.getMessage("websiteExceptions"));
  $("#showWebsiteExceptions").html(chrome.i18n.getMessage("showWebsiteExceptions"));
  $("#clearExceptionList").html(chrome.i18n.getMessage("emptyList"));
  $("#checkExceptions").html(chrome.i18n.getMessage("checkExceptions"));
  $("#checkAfter20").html(chrome.i18n.getMessage("checkExceptions20Starts"));
  $("#checkAfter20").attr("title", chrome.i18n.getMessage("checkExceptions20StartsTooltip"));

  // Field tab
  $("#tab4").html(chrome.i18n.getMessage("tab4"));
  $("#fieldTypes").html(chrome.i18n.getMessage("fieldTypes"));
  $("#passwordField").html(chrome.i18n.getMessage("passwordField"));
  $("#paymentField").html(chrome.i18n.getMessage("paymentField"));
  $("#personalField").html(chrome.i18n.getMessage("personalField"));
  $("#searchField").html(chrome.i18n.getMessage("searchField"));
  $("#httpsSecurity").html(chrome.i18n.getMessage("httpsSecurity"));
  $("#classifySafe").html(chrome.i18n.getMessage("brokenHttps"));
  $("#brokenHTTPSDescription").html(chrome.i18n.getMessage("brokenHTTPSDescription"));
/*
  // Additional buttons
  $("#saveChanges").html(chrome.i18n.getMessage("saveChanges"));
  $("#revertChanges").html(chrome.i18n.getMessage("revertChanges"));
  $("#defaultSettings").html(chrome.i18n.getMessage("defaultSettings"));

  // Lists
  $("#trustedListTitle").html(chrome.i18n.getMessage("trustedList"));
  $("#userListTitle").html(chrome.i18n.getMessage("userList"));
  */
}

/**
* initialize the options page
*/
function init(){

  // init changes for "revert changes" button
  changes = [];

  // General tab
  setImage();
  /*
  // Redirections tab
  $("#trustedListActivated").prop("checked",window.localStorage.getItem(Torpedo.trustedListActivated.label) == "true");
  $("#showTrustedDomains").prop("disabled",window.localStorage.getItem(Torpedo.trustedListActivated.label) == "false");
*/
  // Exceptions tab

  // Additional buttons
  $("#statusSettings").html("");
/*
  // Additional lists
  if(document.getElementById("trustedList")) fillTrustedList();
  if(document.getElementById("userList")) fillUserList();
  $("#errorAddUserDefined").html("");
  */
}

/**
*   filling the options page elements with functionalities
*/
function addEvents(){
  // Timer tab
  $("#changeIconButton").click(function(e) {
    var imgNum = window.localStorage.getItem("secureImage");
    save("secureImage",imgNum);
    save("secureEVImage",imgNum);
    imgNum = parseInt(imgNum);
    imgNum = imgNum < 10 ? imgNum+1 : 1;
    window.localStorage.setItem("secureImage", ""+imgNum);
    window.localStorage.setItem("secureEVImage", ""+imgNum);
    setImage();
  });
  /*
  $("#timerInput").on('change', function(e) {
    save(Torpedo.timer.label, window.localStorage.getItem(Torpedo.timer.label));
    var timer = $(this).val();
    window.localStorage.setItem(Torpedo.timer.label, timer);
    if(timer == 0) $("#timerCheckbox").prop("checked",false);
    else $("#timerCheckbox").prop("checked",true);
  });
  $("#trustedTimerCheckbox").on('change', function(e) {
    save(Torpedo.trustedTimerActivated.label, window.localStorage.getItem(Torpedo.trustedTimerActivated.label));
    var checked = $(this).prop("checked");
    window.localStorage.setItem(Torpedo.trustedTimerActivated.label, checked);
  });
  $("#userTimerCheckbox").on('change', function(e) {
    save(Torpedo.userTimerActivated.label, window.localStorage.getItem(Torpedo.userTimerActivated.label));
    var checked = $(this).prop("checked");
    window.localStorage.setItem(Torpedo.userTimerActivated.label, checked);
  });

  // Domains tab
  $("#trustedListActivated").on('change', function(e) {
    save(Torpedo.trustedListActivated.label, window.localStorage.getItem(Torpedo.trustedListActivated.label));
    var checked = $(this).prop("checked");
    window.localStorage.setItem(Torpedo.trustedListActivated.label, checked);
    if(!checked) $("#showTrustedDomains").prop("disabled",true);
    else $("#showTrustedDomains").prop("disabled",false);
  });
  $("#showTrustedDomains").on('click', function(e)  {
    $("#userList").hide();
    $("#trustedList").toggle();
  });
  $("#addUserDefined").on('click', function(e)  {
    addUserDefined();
  });
  $("#editUserDefined").on('click', function(e)  {
    $("#trustedList").hide();
    $("#userList").toggle();
  });

  // Referrer tab
  $("#clearReferrer").on('click', function(e)  {
    save(Torpedo.referrerPart1.label, window.localStorage.getItem(Torpedo.referrerPart1.label));
    save(Torpedo.referrerPart2.label, window.localStorage.getItem(Torpedo.referrerPart2.label));
    var table = document.getElementById("referrerList");
    table.getElementsByTagName("tbody")[0].innerHTML = table.rows[0].innerHTML;
    var arr1 = [];
    var arr2 = [];
    window.localStorage.setItem(Torpedo.referrerPart1.label, JSON.stringify(arr1));
    window.localStorage.setItem(Torpedo.referrerPart2.label, JSON.stringify(arr2));
    init();
  });
  $("#addDefaultReferrer").on('click',function(e){
    save(Torpedo.referrerPart1.label, window.localStorage.getItem(Torpedo.referrerPart1.label));
    save(Torpedo.referrerPart2.label, window.localStorage.getItem(Torpedo.referrerPart2.label));
    var arr1 = [];
    try{
      arr1 = JSON.parse(window.localStorage.getItem(Torpedo.referrerPart1.label));
    }catch(err){}
    var arr2 = [];
    try{
      arr2 = JSON.parse(window.localStorage.getItem(Torpedo.referrerPart2.label));
    }catch(err){}
    var index1 = arr1.indexOf("https://deref-gmx.net/mail/client/");
    var index2 = arr1.indexOf("https://deref-web-02.de/mail/client/");
    var containsDefault = false;
    if(index1 > -1 && index2 > -1){
      containsDefault = arr2[index1] == "/dereferrer/?redirectUrl=" && arr2[index2] == "/dereferrer/?redirectUrl=";
    }
    if(!containsDefault){
      if(index1 == -1){
        arr1.push("https://deref-gmx.net/mail/client/");
        arr2.push("/dereferrer/?redirectUrl=");
      }
      if(index2 == -1){
        arr1.push("https://deref-web-02.de/mail/client/");
        arr2.push("/dereferrer/?redirectUrl=");
      }
      window.localStorage.setItem(Torpedo.referrerPart1.label,JSON.stringify(arr1));
      window.localStorage.setItem(Torpedo.referrerPart2.label,JSON.stringify(arr2));
      fillReferrerList();
    }
    document.getElementById("addDefaultReferrer").disabled = true;
  });

  $("#addReferrer").on('click', function(e) {
    addReferrer();
    init();
  });
  $("#insertRandom").on('click', function(e)  {
    $("#referrerInput").val($("#referrerInput").val()+"[...]");
  });

  // Additional buttons
  $("#saveChanges").on('click', function(e)  {
    changes = [];
    $("#statusSettings").html(chrome.i18n.getMessage("savedChanges"));
  });
  $("#revertChanges").on('click', function(e)  {
    var i = 0;
    for(i=0;i<changes.length;i++){
      if(!changes[i]) break;
      window.localStorage.setItem(changes[i][0],changes[i][1]);
    }
    init();
    $("#statusSettings").html(chrome.i18n.getMessage("reversedChanges"));
  });
  $("#defaultSettings").on('click', function(e)  {
    window.localStorage.setItem(Torpedo.onceClickedDomains.label,"");
    window.localStorage.setItem(Torpedo.userDefinedDomains.label,"");
    window.localStorage.setItem(Torpedo.timer.label,2);
    window.localStorage.setItem(Torpedo.trustedTimerActivated.label,false);
    window.localStorage.setItem(Torpedo.userTimerActivated.label,false);
    window.localStorage.setItem(Torpedo.trustedListActivated.label,true);
    var arr1 = ["https://deref-gmx.net/mail/client/","https://deref-web-02.de/mail/client/"];
    var arr2 = ["/dereferrer/?redirectUrl=","/dereferrer/?redirectUrl="];
    window.localStorage.setItem(Torpedo.referrerPart1.label,JSON.stringify(arr1));
    window.localStorage.setItem(Torpedo.referrerPart2.label,JSON.stringify(arr2));
    init();
    $("#statusSettings").html(chrome.i18n.getMessage("defaultSettingsRestored"));
  });
  */
}

function setImage(){
  var imgAddr = chrome.extension.getURL("skin/check/gruen/gr_icon"+window.localStorage.getItem("secureImage")+".png");
  $("#secureInputType").css("background-image","url('"+imgAddr+"')");
  $("#notSecureInputType").css("background-image", "url('"+chrome.extension.getURL("skin/yellow_triangle.png")+"')");
  $("#iconImg").attr("src",imgAddr);
}
function save(list,value){
  var i = 0;
  for(i=0;i<changes.length;i++){
    if(changes[i][0] == list){
      return;
    }
  }
  changes.push([list,value]);
}
/**
* adding all entries to the list of referrers
*/
function fillReferrerList(){
  var table = document.getElementById("referrerList");
  table.getElementsByTagName("tbody")[0].innerHTML = table.rows[0].innerHTML;
  var arr1 = [];
  try{
    arr1 = JSON.parse(window.localStorage.getItem(Torpedo.referrerPart1.label));
  }catch(err){}
  var arr2 = [];
  try{
    arr2 = JSON.parse(window.localStorage.getItem(Torpedo.referrerPart2.label));
  }catch(err){}
  for(i=0; i<arr1.length;i++){
    if(arr1[i].length > 0){
      var row = table.insertRow(table.rows.length);
      var cell = row.insertCell(0);
      var placeholder = arr2[i]? "<span style='color:blue;'> [...] </span>" : "";
      $(cell).html('<div><button id="row'+i+'" style="margin-right:10px;color:red">X</button><span>'+arr1[i]+placeholder+arr2[i]+"</span></div>");

      $("#row"+i).on("click",function(e){
        save(Torpedo.referrerPart1.label, window.localStorage.getItem(Torpedo.referrerPart1.label));
        save(Torpedo.referrerPart2.label, window.localStorage.getItem(Torpedo.referrerPart2.label));
        var split = $(this).next().html().split('<span style="color:blue;"> [...] </span>');
        var index = $(this).attr("id").replace("row","");
        $(this).parent().parent().parent().remove();
        if(!split[1]) split[1] = "";
        var arr1 = [];
        try{
          arr1 = JSON.parse(window.localStorage.getItem(Torpedo.referrerPart1.label));
        }catch(err){}
        var arr2 = [];
        try{
          arr2 = JSON.parse(window.localStorage.getItem(Torpedo.referrerPart2.label));
        }catch(err){}
        arr1.splice(index, 1);
        arr2.splice(index, 1);
        window.localStorage.setItem(Torpedo.referrerPart1.label, JSON.stringify(arr1));
        window.localStorage.setItem(Torpedo.referrerPart2.label, JSON.stringify(arr2));
        init();
      });
    }
  }
}

/**
* adding all entries to the list of trusted domains
*/
function fillTrustedList(){
  var i = 0;
  var table = document.getElementById("trustedList");
  table.getElementsByTagName("tbody")[0].innerHTML = table.rows[0].innerHTML;
  for(i=0; i<torpedo.trustedDomains.length;i++){
    var row = table.insertRow(table.rows.length);
    var cell = row.insertCell(0);
    $(cell).html(torpedo.trustedDomains[i]);
  }
}

/**
* adding all entries to the list of user defined domains
*/
function fillUserList(){
  var userDomains = [];
  try{
    userDomains = JSON.parse(window.localStorage.getItem(Torpedo.userDefinedDomains.label));
  }catch(err){}
  var table = document.getElementById("userList");
  table.getElementsByTagName("tbody")[0].innerHTML = table.rows[0].innerHTML;
  for(i=0; i<userDomains.length;i++){
    var row = table.insertRow(table.rows.length);
    var cell = row.insertCell(0);
    $(cell).html('<div><button id="user'+i+'" name="'+userDomains[i]+'" style="margin-right:10px;color:red">X</button><span>'+userDomains[i]+'</span></div>');
    $("#user"+i).on("click",function(e){
      save(Torpedo.userDefinedDomains.label, window.localStorage.getItem(Torpedo.userDefinedDomains.label));
      var element = $(this).next().html();
      var index = $(this).attr("id").replace("user","");
      $(this).parent().parent().parent().remove();
      var arr = [];
      try{
        arr = JSON.parse(window.localStorage.getItem(Torpedo.userDefinedDomains.label));
      }catch(err){}
      arr.splice(index, 1);
      window.localStorage.setItem(Torpedo.userDefinedDomains.label,JSON.stringify(arr));
    });
  }
}

/**
* adding one entry to the list of user defined domains
*/
function addUserDefined(){
  save(Torpedo.userDefinedDomains.label, window.localStorage.getItem(Torpedo.userDefinedDomains.label));
  var table = document.getElementById("userList");
  var input = $("#userDefinedInput").val().replace(" ","");
  $("#errorAddUserDefined").html("");

  try{
    const href = new URL(input);
    input = extractDomain(href.hostname);
  }catch(e){
    $("#errorAddUserDefined").html(chrome.i18n.getMessage("nonValidUrl"));
    return;
  }
  if(torpedo.trustedDomains.indexOf(input)>-1 && window.localStorage.getItem(Torpedo.trustedListActivated.label) == "true"){
    $("#errorAddUserDefined").html(chrome.i18n.getMessage("alreadyInTrustedUrls"));
    return;
  }
  var arr = [];
  try{
    arr = JSON.parse(window.localStorage.getItem(Torpedo.userDefinedDomains.label));
  }catch(err){}
  if(arr.indexOf(input)>-1){
    $("#errorAddUserDefined").html(chrome.i18n.getMessage("alreadyInUserDefinedDomains"));
    return;
  }
  $("#userDefinedInput").val("");
  arr.push(input);
  window.localStorage.setItem(Torpedo.userDefinedDomains.label, JSON.stringify(arr));

  var row = table.insertRow(table.rows.length);
  var cell = row.insertCell(0);
  $(cell).html('<div><button id="user'+table.rows.length+'" name="'+input+'" style="margin-right:10px;color:red">X</button><span>'+input+"</span></div>");
  $("#userDefinedInput").val("");
  init();
}

/**
* adding one entry to the list of referrers
*/
function addReferrer(){
  save(Torpedo.referrerPart1.label, window.localStorage.getItem(Torpedo.referrerPart1.label));
  save(Torpedo.referrerPart2.label, window.localStorage.getItem(Torpedo.referrerPart2.label));
  var table = document.getElementById("referrerList");
  var input = $("#referrerInput").val().replace(" ","").split("[...]");

  var arr1 = [];
  try{
    arr1 = JSON.parse(window.localStorage.getItem(Torpedo.referrerPart1.label));
  }catch(err){}
  var arr2 = [];
  try{
    arr2 = JSON.parse(window.localStorage.getItem(Torpedo.referrerPart2.label));
  }catch(err){}

  if(arr1.indexOf(input[0])>-1 && ((!input[1] && !arr2[arr1.indexOf(input[0])]) || (input[1] && arr2.indexOf(input[1])>-1))){
    $("#errorAddReferrer").html(chrome.i18n.getMessage("alreadyInReferrerList"));
    return;
  }
  var row = table.insertRow(table.rows.length);
  var cell = row.insertCell(0);
  if(input[1] == undefined) input[1] = "";
  var placeholder = input[1]? "<span style='color:blue'> [...] </span>" : "";
  $(cell).html('<div><button id="row'+table.rows.length+'" name="'+input[0]+','+input[1]+'" style="margin-right:10px;color:red">X</button><span>'+input[0]+placeholder+input[1]+"</span></div>");
  arr1.push(input[0]);
  arr2.push(input[1]);
  window.localStorage.setItem(Torpedo.referrerPart1.label, JSON.stringify(arr1));
  window.localStorage.setItem(Torpedo.referrerPart2.label, JSON.stringify(arr2));
  $("#referrerInput").val("");
  init();
}
