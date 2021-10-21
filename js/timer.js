
function initTimer() {
  chrome.storage.local.get("timer", function (storage) {
    passSecTimer.time = storage.timer;
  });
}

initTimer();

var passSecTimer = {

  time: 0,
  timerIntervall: null,

  /**
    * assert time to tooltip text
    */
  showTime: function (tooltip, time) {
    try {
      tooltip.find("#passSecTimer")[0].textContent = chrome.i18n.getMessage("verbleibendeZeit", "" + time)
    } catch (e) { }
  },

  countdown: function (tooltip, element) {
    if (passSecTimer.time == 0) {
      passSecTimer.showTime(tooltip, passSecTimer.time);
      $(element).prop("disabled", false);
      $(passSec.tooltip.find("#passSecButtonClose")[0]).prop("disabled", false);
        $(passSec.tooltip.find("#passSecButtonException")[0]).prop("disabled", false);
      return;
    }

    passSecTimer.showTime(tooltip, passSecTimer.time);
    if (passSecTimer.time > 0) passSecTimer.time--;
    this.timerIntervall = this.Interval(function () {
      passSecTimer.showTime(tooltip, passSecTimer.time);
      if (passSecTimer.time == 0) {
        clearInterval(passSecTimer.timerIntervall.id());
        $(element).prop("disabled", false);
        $(element).focus();
        $(passSec.tooltip.find("#passSecButtonClose")[0]).prop("disabled", false);
        $(passSec.tooltip.find("#passSecButtonException")[0]).prop("disabled", false);
      } else {
        --passSecTimer.time;
      }
    }, 1000);
  },


  Interval: function (callback, freq) {
    var args = arguments,
      callbacks = [callback],
      paused = false;

    var id = setInterval(function () {
      if (paused) return;
      var len = callbacks.length,
        i = len;
      while (i--) callbacks[len - 1 - i].apply(this.Interval, Array.prototype.slice.call(args, 2, args.length));
    }, freq);

    return {
      id: function () {
        return id;
      },
      add: function (cb) {
        callbacks.push(cb);
      },
      clear: function () {
        if (id === null) return;
        clearInterval(id);
        id = null;
      },
      pause: function () {
        paused = true;
      },
      resume: function () {
        paused = false;
      }
    };
  },

  getTimer: function () {
    return this.time;
  },

  setTimer: function (time) {
    time = this.time;
  },
};