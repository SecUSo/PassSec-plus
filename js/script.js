jQuery(function($){
    $('body').on('mouseenter', 'input', function(e) {
        var o = this;
        if ( o.type == "password") {
            chrome.extension.sendRequest('show', function(r) {
                var uri = $.url.parse(o.href),
                    position,
                    text = '<span id="passSecURL">Sie besuchen eine Seite des Betreibers: <span id="passSecDomain">' + extractDomain(uri.host) + '</span>.</span>';
                    position = {
                        at: 'left bottom',
                        my: 'top left',
                        target: 'this',
                        viewport: $(window),
                        adjust: {
                          mouse: false
                        }
                    }

                var id = 'passSec_' + $.fn.qtip.nextid;
                // Show the qtip
                $(o).qtip({
                    overwrite: false,
                    content:  {
                      text: text
                  },
                    show: {
                        event: e.type,
                        ready: true,
                        solo: true
                    },
                    hide: {
                        fixed: true,
                        delay: 1000
                    },
                    position: position,
                    style: {
                      classes: 'passSecTooltip',
                      width: 900
                    },
                    events: {
                      render: function(event, api) {
                        //var iframe = $('iframe', this)[0];
                        //var tooltip = $(this);
                        container = $('<p id="passSecSecurityStatus">This is a sample text.</p>').appendTo(api.elements.content);
                        console.log(api.elements.content.html());
                      },
                      hide: function(event, api) {
                        //console.log("hide");
                      }
                    }
                }, e);
            })
        }
    }).on('mouseleave', 'a', function(e){
        $(this).qtip('destroy');
    })
});

function extractDomain(domain){
  var split = domain.split(".");
  if(split.length > 2) domain = split[split.length-2]+"."+split[split.length-1];
  return domain;
};
