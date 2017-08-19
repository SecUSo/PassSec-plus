var passSec = passSec || {};
passSec.url = "";
passSec.domain = "";

jQuery(function($){
  $('input[type=password]').each(function(i){processInput(this)});
  $('input[type=search]').each(function(j){processInput(this)});
  $('body').on('mouseenter', 'input', function(e) {
    var o = this;
    if ( o.type == "password" || o.type == "search") {
      passSec.url = document.location.href;
      passSec.domain = extractDomain(document.location.host);
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

function extractDomain(domain){
  var split = domain.split(".");
  if(split.length > 2) domain = split[split.length-2]+"."+split[split.length-1];
  return domain;
};
