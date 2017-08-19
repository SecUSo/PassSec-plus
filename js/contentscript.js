var passSec = passSec || {};
passSec.url = "";
passSec.domain = "";

jQuery(function($){
  passSec.url = document.location.href;
  passSec.domain = extractDomain(document.location.host);
  getSecurityStatus();

  processInputs();
  $('body').on('mouseenter', 'input', function(e) {
    var o = this;
    if ( o.type == "password" || o.type == "search") {
      // Show the qtip
      $(o).qtip({
        overwrite: true,
        suppress: true,
        content:  {
          text: getTexts(),
          button: true
        },
        show: {
          event: e.type,
          ready: true,
          solo: true
        },
        hide: {
          fixed: true,
          hide: 'mouseleave',
          delay: 1000
        },
        position: {
          at: 'left bottom',
          my: 'top left',
          target: 'event',
          viewport: $(window),
          adjust: {
            mouse: false,
            method: 'flipinvert flipinvert',
            scroll: false
          }
        },
        style: { classes: 'passSecTooltip' },
        events: {
          render: function(event, api) {
            //passSec.api = api;
            //passSec.tooltip = api.elements.content;
          }
        }
      }, e);
    }
  }).on('mouseleave', 'a', function(e){
    $(this).qtip('destroy');
  })
});
