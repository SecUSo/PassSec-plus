class PassSecTimer {
  constructor(timerName, time, timerIntervall) {
    this.name = timerName;
    this.time = time;
    this.timerIntervall = timerIntervall;
  }

  decreaseTimer(tooltip, element) {
    this.showTime(tooltip, this.time);
    if (this.time == 0) {
      clearInterval(this.timerIntervall.id());
      $(element).prop("disabled", false);
      $(element).focus();
      $(tooltip.find("#passSecButtonClose")[0]).prop("disabled", false);
      $(tooltip.find("#passSecButtonException")[0]).prop("disabled", false);
    } else {
      --this.time;
    }
  }

  showTime(tooltip) {
    try {
      tooltip.find("#passSecTimer")[0].textContent = chrome.i18n.getMessage("verbleibendeZeit", "" + this.time)
    } catch (e) { }
  }


  countdown(tooltip, element) {
    if (this.time == 0) {
      this.showTime(tooltip);
      $(element).prop("disabled", false);
      $(tooltip.find("#passSecButtonClose")[0]).prop("disabled", false);
      $(tooltip.find("#passSecButtonException")[0]).prop("disabled", false);
      return;
    } else {
      $(element).prop("disabled", true);
      $(tooltip.find("#passSecButtonClose")[0]).prop("disabled", true);
      $(tooltip.find("#passSecButtonException")[0]).prop("disabled", true);
    }

    this.showTime(tooltip, this.time);

    if (this.time > 0) {
      this.time--;
    }

    function getDecreaseTimerFunc(timer) {
      return function () {
        timer.decreaseTimer(tooltip, element)
      }
    }

    var timerIntervall = this.Interval(getDecreaseTimerFunc(this), 1000);
    this.timerIntervall = timerIntervall;
  }

  Interval(callback, freq) {
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
  }
}


var passSecTimer = {
  timerArr: [],

  getTimer(timerName) {
    for (let timer of this.timerArr) {
      if (timer.name == timerName) {
        return timer;
      }
    }
    return null;
  },

  getTimerName(status) {
    var timerName = "";
    switch (status) {
      case "<Password_Field>":
        timerName = "passwordFieldTimer";
        break;
      case "<Different_Domains>":
        timerName = "differentDomainsTimer";
        break;
      case "<Different_Protocols>":
        timerName = "differentProtocolTimer";
        break;
      case "<No_Anomaly>":
        timerName = "timer";
        break;
    }
    return timerName;
  },

  determineTypeOfTimer(fieldType, websiteProtocol, websiteDomain, formProtocol, formDomain) {
    if (fieldType == "password") {
      return "<Password_Field>"
    } else if (websiteDomain != formDomain) {
      return "<Different_Domains>";
    } else if (websiteProtocol != formProtocol) {
      return "<Different_Protocols>";
    }
    return "<No_Anomaly>";
  },

  startCountdown(status, tooltip, element) {
    chrome.storage.local.get("timer", function (storage) {
      let timerName = passSecTimer.getTimerName(status);
      let timer = passSecTimer.getTimer(timerName);
      if (timer == null) {
        timer = new PassSecTimer(timerName, storage.timer, null);
        passSecTimer.timerArr.push(timer);
      }
      timer.countdown(tooltip, element);
    });
  },
};
