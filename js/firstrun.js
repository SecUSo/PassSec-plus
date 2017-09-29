browser.runtime.sendMessage({name: "getStorage"}).then(function (r) {
    if (r.firstRun === "true") {
        // the next run wont be the first run
        browser.runtime.sendMessage({name: "setStorage", item: "firstRun", value: "false"});

        // change the secure-image to a random one
        let image = Math.floor(Math.random() * 10);
        if (image < 10) {
            browser.runtime.sendMessage({name: "setStorage", item: "secureImage", value: image + 1});
            browser.runtime.sendMessage({name: "setStorage", item: "secureEVImage", value: image + 1});
        }
        // TODO: open the options window at the first run
        //chrome.runtime.openOptionsPage();
    } else {
        if (r.checkExceptionAuto) {
            browser.runtime.sendMessage({name: "setStorage", item: "starts", value: r.starts + 1});
        }
    }
});
