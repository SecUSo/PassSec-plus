jQuery(function($){
    $('body').on('mouseenter', 'input', function(e) {
        var o = this;
        if ( o.type == "password") {
            chrome.extension.sendRequest('show', function(r) {
                var uri = $.url.parse(o.href),
                    position,
                    text = '<a href="'+uri.source+'" id="torpedoHref">' + uri.source.replace(uri.host, '<span style="color:#0033cc">' + extractDomain(uri.host) + '</span>') + '</a>';
                    position = {
                        at: 'left bottom',
                        my: 'top left',
                        target: 'this',
                        viewport: $(window),
                        adjust: {
                          mouse: false
                        }
                    }
                // Is the target a new window?
                //if ( $(o).attr('target') == '_blank' ) text = '<i class="fa fa-external-link-square" style="padding-right: 5px;"></i>' + text;

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
                        delay: 1500
                    },
                    position: position,
                    style: { classes: 'torpedoTooltip' },
                    events: {
                      render: function(event, api) {
                        //var iframe = $('iframe', this)[0];
                        //var tooltip = $(this);
                        container = $('<p id="torpedoSecurityStatus">This URL is not yet known to PassSec.</p>').appendTo(api.elements.content);
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
