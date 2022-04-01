class PassSecTimer {
  constructor(timerName, time, timerIntervall, dialogIDsArr) {
    this.name = timerName;
    this.time = time;
    this.timerIntervall = timerIntervall;
    this.dialogIDs = dialogIDsArr;
  }

  decreaseTimer(elementToDisplayTimer, inputField, elementsToDisableWhenTimerIsActivated, isDialog) {
    this.showTime(elementToDisplayTimer, this.time);
    if (this.time <= 0) {
      this.timerIntervall.clear();
      if (isDialog) {
        enableDialogButtons(elementsToDisableWhenTimerIsActivated);
      } else {
        $(inputField).trigger(timerIsZeroEvent);
      }
    } else {
      --this.time;
    }
  }

  showTime() {
    try {
      this.dialogIDs.forEach(dialogID => $("#" + dialogID).find("#passSecTimer")[0].textContent = chrome.i18n.getMessage("verbleibendeZeit", "" + this.time));
    } catch (e) {
      console.log("Error: " + e);
    }
  }


  countdown(elementToDisplayTimer, inputField, elementsToDisableWhenTimerIsActivated, isDialog) {
    if (this.time == 0) {
      this.showTime(elementToDisplayTimer);
      if (isDialog) {
        enableDialogButtons(elementsToDisableWhenTimerIsActivated);
      } else {
        enableElements(elementsToDisableWhenTimerIsActivated);
      }
    } else {
      if (isDialog) {
        disableDialogButtons(elementsToDisableWhenTimerIsActivated);
      } else {
        disableElements(elementsToDisableWhenTimerIsActivated);
      }
    }
    this.showTime(elementToDisplayTimer, this.time);

    if (this.time > 0) {
      this.time--;
    }

    function getDecreaseTimerFunc(timer) {
      return function () {
        timer.decreaseTimer(elementToDisplayTimer, inputField, elementsToDisableWhenTimerIsActivated, isDialog)
      }
    }
    if (this.timerIntervall == null) {
      var timerIntervall = this.Interval(getDecreaseTimerFunc(this), 1000);
      this.timerIntervall = timerIntervall;
    }
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

  determineNameOfTimer(fieldType, websiteProtocol, websiteDomain, formProtocol, formDomain) {
    if (fieldType == "password") {
      return "passwordFieldTimer";
    } else if (websiteDomain != formDomain) {
      return "differentDomainsTimer";
    } else if (websiteProtocol != formProtocol) {
      return "differentProtocolTimer";
    }
    // No anomaly
    return "timer";
  },



  startCountdown(timerName, elementToDisplayTimer, inputField, elementsToDisableWhenTimerIsActivated, isDialog, qtipID) {
    chrome.storage.local.get("timer", function (storage) {
      let timer = passSecTimer.getTimer(timerName);
      if (timer == null) {
        timer = new PassSecTimer(timerName, storage.timer, null, [qtipID]);
        passSecTimer.timerArr.push(timer);
      }
      timer.countdown(elementToDisplayTimer, inputField, elementsToDisableWhenTimerIsActivated, isDialog);
    });
  },
};
