// do some stuff on first run
browser.runtime.onInstalled.addListener(function (details) {
    if (details.reason === "install") {
        // init storage
        browser.storage.local.set(PassSec);
        // change the secure-image to a random one
        let image = Math.floor(Math.random() * 10) + 1;
        browser.storage.local.set({secureImage: image});
        // open options page
        browser.runtime.openOptionsPage();
    }
});

// count browser starts and do exceptions checking if corresponding option is set
browser.storage.local.get("checkExceptionsAfter20Starts").then(function (item) {
    let check = item.checkExceptionsAfter20Starts;
    if (check.doCheck) {
        let starts = check.count + 1;
        if (starts === 20) {
            // reset counter
            browser.storage.local.set({checkExceptionsAfter20Starts: {doCheck: true, count: 0}});
            // check exceptions
            // TODO
        } else {
            // increase counter
            browser.storage.local.set({checkExceptionsAfter20Starts: {doCheck: true, count: starts}});
        }
    }
});