chrome.runtime.sendMessage({name: "getStorage"}, function (r) {
    if (r.firstRun === "true") {
        // the next run wont be the first run
        chrome.runtime.sendMessage({name: "setStorage", item: "firstRun", value: "false"}, function (res) {});

        // change the secure-image to a random one
        let image = Math.floor(Math.random() * 10);
        if (image < 10) {
            chrome.runtime.sendMessage({name: "setStorage", item: "secureImage", value: image + 1}, function (res) {});
            chrome.runtime.sendMessage({name: "setStorage", item: "secureEVImage", value: image + 1}, function (res) {});
        }
        // TODO: open the options window at the first run
        //chrome.runtime.openOptionsPage();
    } else {
        if (r.checkExceptionAuto) {
            chrome.runtime.sendMessage({name: "setStorage", item: "starts", value: r.starts + 1}, function (res) {});
        }
    }
});
