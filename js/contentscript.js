var passSec = passSec || {};
passSec.url = "";
passSec.domain = "";
passSec.api;
passSec.tooltip;
passSec.target;

jQuery(function ($) {
    chrome.runtime.sendMessage({"name": 'TLD'}, function (tld) {
        passSec.url = document.location.href;
        passSec.domain = extractDomain(document.location.host, tld);

        chrome.runtime.sendMessage({name: "getStorage"}, function (r) {
            getSecurityStatus(r);
            processInputs(r);

            $('body').on('focus', 'input', function (e) {
                var o = this;
                if ((o.type == "password" || o.type == "search") && !o.classList.contains("passSecNoTooltip")) {
                    passSec.target = this;
                    // Show the qtip
                    $(o).qtip({
                        overwrite: true,
                        suppress: true,
                        content: {
                            text: getTexts()
                        },
                        show: {
                            event: e.type,
                            ready: true,
                            solo: true,
                            delay: 0
                        },
                        hide: {
                            fixed: true,
                            event: 'unfocus'
                        },
                        position: {
                            at: 'left bottom',
                            my: 'top left',
                            viewport: true,
                            adjust: {
                                method: 'shift none',
                                scroll: false
                            }
                        },
                        style: {
                            tip: false,
                            classes: 'passSecTooltip',
                            widget: true,
                            def: false
                        },
                        events: {
                            render: function (event, api) {
                                passSec.api = api;
                                passSec.tooltip = api.elements.content;
                                processTooltip();
                            }
                        }
                    }, e);
                }
            })
        });
    });
});
