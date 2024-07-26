// moved from default preferences, as only 1 background script allowed in MV3
let PassSec = {
    secureImage: 1,
    redirects: [],
    timer: 3,
    trustedListActivated: true,
    trustedDomains: [
        "kit.edu",
        "secuso.org",
        "amazon.com",
        "amazon.de",
        "aliexpress.com",
        "bahn.de",
        "bild.de",
        "bing.com",
        "blogspot.com",
        "booking.com",
        "chip.de",
        "deutsche-bank.de",
        "dhl.de",
        "ebay.de",
        "ebay-kleinanzeigen.de",
        "facebook.com",
        "fandom.com",
        "gmx.net",
        "google.com",
        "google.de",
        "google.ru",
        "idealo.de",
        "imdb.com",
        "immobilienscout24.de",
        "instagram.com",
        "live.com",
        "mail.ru",
        "microsoft.com",
        "mobile.de",
        "netflix.com",
        "ok.ru",
        "otto.de",
        "paypal.com",
        "postbank.de",
        "reddit.com",
        "shop-apotheke.com",
        "spiegel.de",
        "telekom.com",
        "t-online.de",
        "twitch.tv",
        "vk.com",
        "web.de",
        "wetter.com",
        "wikipedia.org",
        "yahoo.com",
        "yandex.ru",
        "youtube.com",
        "adobe.com",
        "apple.com",
        "baidu.com",
        "chase.com",
        "cnn.com",
        "craigslist.org",
        "dropbox.com",
        "ebay.com",
        "espn.com",
        "force.com",
        "imdb.com",
        "imgur.com",
        "indeed.com",
        "jd.com",
        "linkedin.com",
        "login.tmall.com",
        "msn.com",
        "myshopify.com",
        "nytimes.com",
        "office.com",
        "qq.com",
        "salesforce.com",
        "sohu.com",
        "spotify.com",
        "stackoverflow.com",
        "taobao.com",
        "tmall.com",
        "tumblr.com",
        "twitter.com",
        "walmart.com",
        "wellsfargo.com",
        "yelp.com",
        "zillow.com",
        "1822direkt.de",
        "bbbank.de",
        "berliner-sparkasse.de",
        "blsk.de",
        "bordesholmer-sparkasse.de",
        "bw-bank.de",
        "comdirect.de",
        "commerzbank.de",
        "consorsbank.de",
        "dkb.de",
        "dovoba.de",
        "erzgebirgssparkasse.de",
        "fidor.de",
        "foerde-sparkasse.de",
        "frankfurter-sparkasse.de",
        "harzsparkasse.de",
        "haspa.de",
        "herner-sparkasse.de",
        "ing.com",
        "kasseler-sparkasse.de",
        "kreissparkasse-ahrweiler.de",
        "kreissparkasse-diepholz.de",
        "kreissparkasse-duesseldorf.de",
        "kreissparkasse-eichsfeld.de",
        "kreissparkasse-euskirchen.de",
        "kreissparkasse-gotha.de",
        "kreissparkasse-heinsberg.de",
        "kreissparkasse-kelheim.de",
        "kreissparkasse-nordhausen.de",
        "kreissparkasse-ravensburg.de",
        "kreissparkasse-schwalm-eder.de",
        "ksk-anhalt-bitterfeld.de",
        "ksk-bautzen.de",
        "ksk-bc.de",
        "ksk-bersenbrueck.de",
        "ksk-birkenfeld.de",
        "ksk-boerde.de",
        "ksk-es.de",
        "ksk-fds.de",
        "ksk-gelnhausen.de",
        "ksk-gp.de",
        "ksk-heidenheim.de",
        "ksk-koeln.de",
        "ksk-kusel.de",
        "ksk-limburg.de",
        "ksk-mbteg.de",
        "ksk-melle.de",
        "ksk-ostalb.de",
        "ksk-ratzeburg.de",
        "ksk-reutlingen.de",
        "ksk-saale-orla.de",
        "ksk-saarlouis.de",
        "ksk-saarpfalz.de",
        "ksk-schluechtern.de",
        "ksk-sigmaringen.de",
        "ksk-soltau.de",
        "ksk-stade.de",
        "ksk-steinfurt.de",
        "ksk-stendal.de",
        "ksk-syke.de",
        "ksk-tuebingen.de",
        "ksk-tut.de",
        "ksk-verden.de",
        "ksk-vulkaneifel.de",
        "ksk-walsrode.de",
        "ksk-weilburg.de",
        "kskbb.de",
        "kskbitburg-pruem.de",
        "kskgg.de",
        "kskhalle.de",
        "ksklb.de",
        "kskmayen.de",
        "kskmse.de",
        "kskrh.de",
        "kskwd.de",
        "kskwn.de",
        "kskwnd.de",
        "ksn-northeim.de",
        "kyffhaeusersparkasse.de",
        "lzo.com",
        "mbs.de",
        "mueritz-sparkasse.de",
        "naspa.de",
        "nispa.de",
        "norisbank.de",
        "nospa.de",
        "olb.de",
        "ospa.de",
        "ostsaechsische-sparkasse-dresden.de",
        "postbank.de",
        "rhoen-rennsteig-sparkasse.de",
        "s-jena.de",
        "s-kukc.de",
        "s-mil.de",
        "s-os.de",
        "saalesparkasse.de",
        "salzlandsparkasse.de",
        "sk-westerwald-sieg.de",
        "skmb.de",
        "sls-direkt.de",
        "sms-hm.de",
        "sparda-b.de",
        "sparda-bank-hamburg.de",
        "sparda-bw.de",
        "sparda-hessen.de",
        "sparda-m.de",
        "sparda-sw.de",
        "sparda-west.de",
        "sparkasse-aachen.de",
        "sparkasse-adl.de",
        "sparkasse-alk.de",
        "sparkasse-allgaeu.de",
        "sparkasse-altenburgerland.de",
        "sparkasse-am-niederrhein.de",
        "sparkasse-amberg-sulzbach.de",
        "sparkasse-ansbach.de",
        "sparkasse-arnsberg-sundern.de",
        "sparkasse-aurich-norden.de",
        "sparkasse-badneustadt.de",
        "sparkasse-bamberg.de",
        "sparkasse-battenberg.de",
        "sparkasse-bayreuth.de",
        "sparkasse-beckum.de",
        "sparkasse-bensheim.de",
        "sparkasse-bgl.de",
        "sparkasse-bielefeld.de",
        "sparkasse-bochum.de",
        "sparkasse-bodensee.de",
        "sparkasse-bonndorf-stuehlingen.de",
        "sparkasse-bottrop.de",
        "sparkasse-bremen.de",
        "sparkasse-burbach-neunkirchen.de",
        "sparkasse-cgw.de",
        "sparkasse-co-lif.de",
        "sparkasse-dachau.de",
        "sparkasse-darmstadt.de",
        "sparkasse-delbrueck.de",
        "sparkasse-dessau.de",
        "sparkasse-dieburg.de",
        "sparkasse-dillenburg.de",
        "sparkasse-doebeln.de",
        "sparkasse-donauwoerth.de",
        "sparkasse-donnersberg.de",
        "sparkasse-dortmund.de",
        "sparkasse-duderstadt.de",
        "sparkasse-dueren.de",
        "sparkasse-duisburg.de",
        "sparkasse-einbeck.de",
        "sparkasse-elmshorn.de",
        "sparkasse-emden.de",
        "sparkasse-emh.de",
        "sparkasse-emsland.de",
        "sparkasse-engo.de",
        "sparkasse-erlangen.de",
        "sparkasse-essen.de",
        "sparkasse-ffb.de",
        "sparkasse-forchheim.de",
        "sparkasse-freiburg.de",
        "sparkasse-freising.de",
        "sparkasse-fuerth.de",
        "sparkasse-fulda.de",
        "sparkasse-garmisch.de",
        "sparkasse-gelsenkirchen.de",
        "sparkasse-gera-greiz.de",
        "sparkasse-geseke.de",
        "sparkasse-giessen.de",
        "sparkasse-gladbeck.de",
        "sparkasse-gm.de",
        "sparkasse-goch.de",
        "sparkasse-gruenberg.de",
        "sparkasse-guenzburg-krumbach.de",
        "sparkasse-guetersloh-rietberg.de",
        "sparkasse-gunzenhausen.de",
        "sparkasse-gw.de",
        "sparkasse-hagenherdecke.de",
        "sparkasse-hamm.de",
        "sparkasse-hanau.de",
        "sparkasse-hannover.de",
        "sparkasse-hattingen.de",
        "sparkasse-hegau-bodensee.de",
        "sparkasse-heidelberg.de",
        "sparkasse-heilbronn.de",
        "sparkasse-herford.de",
        "sparkasse-hgp.de",
        "sparkasse-hildburghausen.de",
        "sparkasse-hochfranken.de",
        "sparkasse-hochrhein.de",
        "sparkasse-hochsauerland.de",
        "sparkasse-hochschwarzwald.de",
        "sparkasse-hoexter.de",
        "sparkasse-holstein.de",
        "sparkasse-hrv.de",
        "sparkasse-iserlohn.de",
        "sparkasse-karlsruhe.de",
        "sparkasse-kaufbeuren.de",
        "sparkasse-kehl.de",
        "sparkasse-kinzigtal.de",
        "sparkasse-kl.de",
        "sparkasse-koblenz.de",
        "sparkasse-koelnbonn.de",
        "sparkasse-kraichgau.de",
        "sparkasse-krefeld.de",
        "sparkasse-landsberg.de",
        "sparkasse-landshut.de",
        "sparkasse-langenfeld.de",
        "sparkasse-leerwittmund.de",
        "sparkasse-leipzig.de",
        "sparkasse-lemgo.de",
        "sparkasse-lev.de",
        "sparkasse-lippstadt.de",
        "sparkasse-loerrach.de",
        "sparkasse-luedenscheid.de",
        "sparkasse-lueneburg.de",
        "sparkasse-magdeburg.de",
        "sparkasse-mainfranken.de",
        "sparkasse-markgraeflerland.de",
        "sparkasse-mecklenburg-schwerin.de",
        "sparkasse-meissen.de",
        "sparkasse-minden-luebbecke.de",
        "sparkasse-mittelfranken-sued.de",
        "sparkasse-mittelsachsen.de",
        "sparkasse-mittelthueringen.de",
        "sparkasse-mitten-im-sauerland.de",
        "sparkasse-moenchengladbach.de",
        "sparkasse-mol.de",
        "sparkasse-moosburg.de",
        "sparkasse-msh.de",
        "sparkasse-muelheim-ruhr.de",
        "sparkasse-muensterland-ost.de",
        "sparkasse-nea.de",
        "sparkasse-neckartal-odenwald.de",
        "sparkasse-neu-ulm-illertissen.de",
        "sparkasse-neuburg-rain.de",
        "sparkasse-neumarkt.de",
        "sparkasse-neunkirchen.de",
        "sparkasse-neuss.de",
        "sparkasse-neuwied.de",
        "sparkasse-niederbayern-mitte.de",
        "sparkasse-niederlausitz.de",
        "sparkasse-nienburg.de",
        "sparkasse-nordhorn.de",
        "sparkasse-nuernberg.de",
        "sparkasse-oberhessen.de",
        "sparkasse-oberland.de",
        "sparkasse-oberlausitz-niederschlesien.de",
        "sparkasse-oberpfalz-nord.de",
        "sparkasse-odenwaldkreis.de",
        "sparkasse-offenbach.de",
        "sparkasse-offenburg.de",
        "sparkasse-olpe.de",
        "sparkasse-opr.de",
        "sparkasse-osnabrueck.de",
        "sparkasse-osterode.de",
        "sparkasse-paderborn-detmold.de",
        "sparkasse-passau.de",
        "sparkasse-pfaffenhofen.de",
        "sparkasse-pforzheim-calw.de",
        "sparkasse-pm.de",
        "sparkasse-prignitz.de",
        "sparkasse-radevormwald.de",
        "sparkasse-re.de",
        "sparkasse-regen-viechtach.de",
        "sparkasse-regensburg.de",
        "sparkasse-rhein-haardt.de",
        "sparkasse-rhein-maas.de",
        "sparkasse-rhein-nahe.de",
        "sparkasse-rhein-neckar-nord.de",
        "sparkasse-rheine.de",
        "sparkasse-rottal-inn.de",
        "sparkasse-rottweil.de",
        "sparkasse-saalfeld-rudolstadt.de",
        "sparkasse-saarbruecken.de",
        "sparkasse-schwandorf.de",
        "sparkasse-schwedt.de",
        "sparkasse-schwelm.de",
        "sparkasse-schwerte.de",
        "sparkasse-sha.de",
        "sparkasse-siegen.de",
        "sparkasse-soestwerl.de",
        "sparkasse-solingen.de",
        "sparkasse-spree-neisse.de",
        "sparkasse-st-blasien.de",
        "sparkasse-stade-altes-land.de",
        "sparkasse-starkenburg.de",
        "sparkasse-staufen-breisach.de",
        "sparkasse-suedpfalz.de",
        "sparkasse-suedwestpfalz.de",
        "sparkasse-sw-has.de",
        "sparkasse-tauberfranken.de",
        "sparkasse-trier.de",
        "sparkasse-uecker-randow.de",
        "sparkasse-uelzen-luechow-dannenberg.de",
        "sparkasse-ulm.de",
        "sparkasse-unnakamen.de",
        "sparkasse-unstrut-hainich.de",
        "sparkasse-vogtland.de",
        "sparkasse-vorderpfalz.de",
        "sparkasse-wa-fkb.de",
        "sparkasse-wasserburg.de",
        "sparkasse-wedel.de",
        "sparkasse-wermelskirchen.de",
        "sparkasse-werra-meissner.de",
        "sparkasse-westmuensterland.de",
        "sparkasse-wetzlar.de",
        "sparkasse-wiesental.de",
        "sparkasse-wilhelmshaven.de",
        "sparkasse-witten.de",
        "sparkasse-wittenberg.de",
        "sparkasse-wittgenstein.de",
        "sparkasse-wolfach.de",
        "sparkasse-worms-alzey-ried.de",
        "sparkasse-wuppertal.de",
        "sparkasse-zollernalb.de",
        "sparkassedeggendorf.de",
        "sparkassemerzig-wadern.de",
        "spaw.de",
        "spk-aic-sob.de",
        "spk-arnstadt-ilmenau.de",
        "spk-aschaffenburg.de",
        "spk-barnim.de",
        "spk-bbg.de",
        "spk-bergkamen-boenen.de",
        "spk-buehl.de",
        "spk-burgenlandkreis.de",
        "spk-cham.de",
        "spk-chemnitz.de",
        "spk-dlg-noe.de",
        "spk-elbe-elster.de",
        "spk-frg.de",
        "spk-goettingen.de",
        "spk-hef.de",
        "spk-hohenlohekreis.de",
        "spk-in-ei.de",
        "spk-kg.de",
        "spk-laubach-hungen.de",
        "spk-luebeck.de",
        "spk-mecklenburg-nordwest.de",
        "spk-mecklenburg-strelitz.de",
        "spk-mittelholstein.de",
        "spk-mk.de",
        "spk-mm-li-mn.de",
        "spk-muldental.de",
        "spk-nbdm.de",
        "spk-rastatt-gernsbach.de",
        "spk-reichenau.de",
        "spk-ro-aib.de",
        "spk-row-ohz.de",
        "spk-salem.de",
        "spk-schaumburg.de",
        "spk-scheessel.de",
        "spk-suedholstein.de",
        "spk-swb.de",
        "spk-ts.de",
        "spk-uckermark.de",
        "spk-vorpommern.de",
        "spk-westholstein.de",
        "spk-zwickau.de",
        "spkam.de",
        "spkbopw.de",
        "spked.de",
        "spkeo.de",
        "spkhb.de",
        "spkhw.de",
        "spkkm.de",
        "spkson.de",
        "spktw.de",
        "ssk-bad-pyrmont.de",
        "ssk-cuxhaven.de",
        "ssk-wunstorf.de",
        "sska.de",
        "sskborken.de",
        "sskduesseldorf.de",
        "sskm.de",
        "stadt-sparkasse-haan.de",
        "stadtsparkasse-barsinghausen.de",
        "stadtsparkasse-bocholt.de",
        "stadtsparkasse-burgdorf.de",
        "stadtsparkasse-grebenstein.de",
        "stadtsparkasse-haltern.de",
        "stadtsparkasse-lengerich.de",
        "stadtsparkasse-oberhausen.de",
        "stadtsparkasse-rahden.de",
        "stadtsparkasse-remscheid.de",
        "stadtsparkasse-schwalmstadt.de",
        "stadtsparkasse-versmold.de",
        "targobank.de",
        "taunussparkasse.de",
        "vspk-neustadt.de",
        "wartburg-sparkasse.de",
        "wespa.de",
    ],
    userTrustedDomains: [],
    userExceptions: [],
    exceptions: [],
    passwordField: true,
    personalField: false,
    paymentField: true,
    searchField: false,
    checkExceptionsAfter20Starts: { doCheck: false, count: 0 }
};

// used as a switch activating/disabling saved redirects
// let redirectsActive = true;
// list of top level domains for domain extraction
// let tldList = null;
// queue of content scripts (as [host, tabId, frameId]) waiting for domain extraction
// let domainExtractionQueue = [];

// initialize storage
chrome.storage.local.get(null, function (items) {
    let storageKeys = Object.keys(items);
    // init storage with all options that are not present
    let newOptions = {};
    Object.keys(PassSec).forEach(function (key) {
        if (!storageKeys.includes(key)) {
            if (key === "secureImage") {
                // set a random secure-image instead of the default one
                newOptions[key] = Math.floor(Math.random() * 10) + 1;
            } else {
                newOptions[key] = PassSec[key];
            }
        }
    });
    if (Object.keys(newOptions).length > 0)
        chrome.storage.local.set(newOptions, function () {
            if (storageKeys.length === 0)
                // storage was empty -> first run of this WebExtensions version (install or update)
                chrome.runtime.openOptionsPage();
        });
});

// set correct browser action icon on startup, because Chrome sometimes switches the set default_icon
// to the last used one, which can produce undesired behaviour: browser action icon was red when
// closing the browser -> active redirecting, but red icon on next startup
chrome.action.setIcon({ path: "skin/redirectActive.png" });

// handle left-click on browser action icon
/* chrome.browserAction.onClicked.addListener(function (tab) {
    redirectsActive = !redirectsActive;
    if (redirectsActive) {
        chrome.browserAction.setIcon({ path: "skin/redirectActive.png" });
        chrome.browserAction.setTitle({ title: chrome.i18n.getMessage("browserActionRedirectActive") });
    } else {
        chrome.browserAction.setIcon({ path: "skin/redirectInactive.png" });
        chrome.browserAction.setTitle({ title: chrome.i18n.getMessage("browserActionRedirectInactive") });
    }
    manageRedirectHandler();
});*/

/*
Compares versionToCompare with version
returns true if version is higher/newer than versionToCompare
*/
function isNewerVersion(versionToCompare, version) {
    let versionToCompareParts = versionToCompare.split('.');
    let versionParts = version.split('.');

    while (versionToCompareParts.length < versionParts.length) versionToCompareParts.push("0");
    while (versionParts.length < versionToCompareParts.length) versionParts.push("0");

    for (var i = 0; i < versionParts.length; i++) {
        const a = parseInt(versionParts[i]);
        const b = parseInt(versionToCompareParts[i]);
        if (a > b) return true
        if (a < b) return false
    }
    return false
}

function transferOfTrustworthyDomainsSetByUser() {
    chrome.storage.local.get(null, function (storageObj) {
        let prevExceptionsSetByUserArr = storageObj["exceptions"];
        let newExceptionSetByUserArr = [];
        if ("userTrustedDomains" in storageObj)
            newExceptionSetByUserArr = storageObj["userTrustedDomains"];
        let httpsExceptionsArr = prevExceptionsSetByUserArr.filter(exception => (exception.split("passSec-")[1]) == "https" || (exception.split("passSec-")[1]) == "all");
        let exceptionHttpsDomainsArr = httpsExceptionsArr.map(exception => exception.split("passSec-")[0]);
        let userTrustedDomainsArr = Array.from(new Set(newExceptionSetByUserArr.concat(exceptionHttpsDomainsArr)));
        chrome.storage.local.set({ userTrustedDomains: userTrustedDomainsArr });
    });
}

chrome.runtime.onInstalled.addListener(function (details) {
    if (details.reason == "update") {
        let prevVersion = details.previousVersion;
        if (!isNewerVersion("3.3", prevVersion)) {
            transferOfTrustworthyDomainsSetByUser();
        }
        // update list of trusted domains set by developer
        let updatedTrustedDomains = PassSec.trustedDomains;
        chrome.storage.local.set({ trustedDomains: updatedTrustedDomains });
    }
    chrome.contextMenus.create({
        id: 'options',
        contexts: ["action"],
        title: chrome.i18n.getMessage("options") + " (PassSec+)"
    });

    // add listener for context menu and check for id
    chrome.contextMenus.onClicked.addListener(function (info, tab) {
        const { menuItemId } = info
        if (menuItemId === 'options') {
            chrome.runtime.openOptionsPage();
        }

    });

});



// listen for messages from content script
chrome.runtime.onMessage.addListener(function (message, sender, sendResponse) {
    switch (message.type) {
        case "doRedirect":
            manageRedirectHandler();
            // this is only to directly execute a redirect when the user clicked the 'Secure Mode' button
            chrome.tabs.update({ url: message.httpsURL });
            break;
        case "checkHttpsAvailable":
            let httpsUrl = message.httpsURL.replace("http://", "https://");
            const fetchPromise = fetch(httpsUrl, { method: "HEAD" });

            fetchPromise.then(response => {
                var httpsAvailable = response.status >= 200 && response.status <= 299 && response.url.startsWith("https");
                // if there is an open tooltip while httpsAvailable switches to true, trigger focus event to reopen tooltip with correct content
                if (httpsAvailable === true)
                    sendResponse(true);
                //$(':focus').focus();
            }).catch((error) => {
                console.log("Info: no https available")
            });
            return true;
        case "manageRedirectHandler":
            manageRedirectHandler();
            break;
        case "domain":
            let domain = extractDomain(message.host);
            sendResponse({ domain: domain });
            return true;
        case "TLD": {
            const fetchPromise = fetch("https://publicsuffix.org/list/public_suffix_list.dat", {
                headers: {
                    'X-Requested-With': 'XMLHttpRequest'
                }
            });
            fetchPromise.then(response => {
                sendResponse(response);
            });
            return true;
        }
    }
});

// initial setup of the redirect handler
manageRedirectHandler();

/**
 * Adds or removes declarativeNetRequest rules to handle redirects set by the user
 * This function has to be executed each time the list of redirects changed
 */
function manageRedirectHandler() {
    chrome.storage.local.get("redirects", function (item) {
        redirectDomains = [];
        item.redirects.forEach(function (listElements) {
            // get domain out of direct pattern in form of "http://*." + domain + "/*"
            var domain = listElements.substring(9, listElements.length - 2);
            redirectDomains.push(domain);
        });

        const newRules = [];
        if (redirectDomains.length > 0) {
            newRules.push({
                id: 1,
                condition: {
                    regexFilter: "^http://([^?]+)",
                    requestDomains: redirectDomains,
                    resourceTypes: [
                        "main_frame"
                    ]
                },
                action: {
                    type: "redirect",
                    redirect: {
                        // replaces http with https by inserting the first part in parenthesis of the regex filter \\1
                        regexSubstitution: "https://\\1"
                    }
                }
            });

        }
        chrome.declarativeNetRequest.getDynamicRules(previousRules => {
            const previousRuleIds = previousRules.map(rule => rule.id);
            chrome.declarativeNetRequest.updateDynamicRules({
                removeRuleIds: previousRuleIds,
                addRules: newRules
            });
        });
    });

}