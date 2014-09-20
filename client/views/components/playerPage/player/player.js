// used to hold the current SoundManager2 sound object
//var currentSound = null;

// update the seek bar for the clients at intervals
var okToUpdate = true;
// how often to update the client seek bar
var seekBarUpdateInterval = 2000;

var updateSeekBarDisplay = function(percentage) {
  // update the progress bar
  $('.progress-bar').width((percentage * 100) + '%');
}

// to be able to access the template from inside soundmanager callbacks
var playerTemplateInstance;

// now we want all clients to get the same thing
var soundManagerOptions = {
  autoLoad: true,
  autoPlay: false,
  stream: true,
  //onload: function() {
    //var startingPosition;
    //Tracker.nonreactive(function() {
      //OJPlayer.loaded(true);
      //startingPosition = OJPlayer.getStartingPosition();
    //});
    //currentSound.setPosition(startingPosition);
    //currentSound.play();
    //currentSound.pause();
    //Session.set("loading", false);
  //},
  whileplaying: function() {
    updateSeekBarDisplay(this.position / this.duration);
    // update the position
    //if (okToUpdate) {
      //// make sure we don't update too often
      //okToUpdate = false;
      //var current;
      //Tracker.nonreactive(function() {
        //current = CurrentSong.findOne();
      //});
      //CurrentSong.update(current._id, {
        //$set: {
          //position: this.position,
        //}
      //});
      //// set a timeout to be able to update again in a few seconds
      //Meteor.setTimeout(function() {
        //okToUpdate = true;
      //}, seekBarUpdateInterval);
    //}
  },
  onfinish: function() {
    // destroy the song and remove it from CurrentSong
    console.log("song finished playing");
    console.log(playerTemplateInstance);
    this.destruct();
    OJPlayer.nextSong(playerTemplateInstance.data._id, playerTemplateInstance.data.paused);
    updateSeekBarDisplay(0);
  }
}

// initialize soundcloud api
//SC.initialize({
  //client_id: "dab79335daff5c0c3b601594af49d985"
//});

Template.player.helpers({
  mainPlayer: function() {
    return Meteor.connection._lastSessionId === Settings.findOne().playerId;
  },
  playingSong: function() {
    return CurrentSong.findOne();
  },
});

Template.player.created = function() {
  console.log("player created");
  var self = this;
  playerTemplateInstance = self;
}

Template.hostPlayer.created = function() {
  console.log("hostplayer template created");
  SC.whenStreamingReady(function() {
    console.log("streaming ready");
    Tracker.autorun(function() {
      console.log("autorun");
      // this should set up a reactive variable
      var uri = CurrentSong.findOne({}, {fields: {uri: 1}});
      console.log(uri);
      if (uri) {
        SC.stream(
          uri.uri, soundManagerOptions, function(sound) {
          console.log("streaming sound successful and created");
          OJPlayer.currentSound = sound;
        });
      }
    });
  });
}

Template.hostPlayer.helpers({
  //loadStreaming: function() {
    //if (!this.loaded && Session.equals("loading", false)) {
      // don't want the song loading multiple times
      //Session.set("loading", true);
    //console.log("loadstreaming called");
      //SC.stream(
        //this.uri, soundManagerOptions, function(sound) {
        //currentSound = sound;
      //});
    //}
  //},
  //playingSong: function() {
    //return CurrentSong.findOne();
  //},
  playPauseIcon: function() {
    //if (this.paused) {
      //if (_.isObject(currentSound) &&
          //this.loaded &&
          //currentSound.paused === false) {
        //currentSound.pause();
      //}
      //return "play";
    //} else {
      //if (_.isObject(currentSound) &&
          //this.loaded &&
          //currentSound.paused === true) {
        //currentSound.resume();
      //}
      //return "pause";
    //}
    //return "play";
  },
  playerDisabled: function() {
    //return this.loaded ? "" : "disabled";
    return "";
  },
});

Template.clientPlayer.helpers({
  playingSong: function() {
    return CurrentSong.findOne();
  },
  playPauseIcon: function() {
    return this.paused ? "play" : "pause";
  },
  playerDisabled: function() {
    //return this.loaded ? "" : "disabled";
    return "";
  },
  updateSeekBar: function() {
    updateSeekBarDisplay(this.position / this.duration);
  }
});

Template.hostPlayer.events({
  // use togglepause on this one (soundmanager2 library)
  "click .playpause, touchstart .playpause": function(event) {
    //event.preventDefault();
    //if (this.loaded === false) {
      //return;
    //}
    OJPlayer.currentSound.togglePause();
    var icon = $(".playpause > i");
    icon.toggleClass("fa-play");
    icon.toggleClass("fa-pause");
    //if ($(".playpause").has(".fa-play").length) {
      //CurrentSong.update(this._id, {
        //$set: {paused: false}
      //});
      //$(".fa-play").switchClass("fa-play", "fa-pause");
    //} else {
      //CurrentSong.update(this._id, {
        //$set: {paused: true}
      //});
      //$(".fa-pause").switchClass("fa-pause", "fa-play");
    //}
  },
  "touchend .playpause": function(event) {
    // click doubles as a touchend event, so prevent doubling up
    event.preventDefault();
  },
  "click .ff-next, touchstart .ff-next": function(event) {
    //event.preventDefault();
    //if (this.loaded === false) {
      //return;
    //}
    var self = this;
    console.log(self);
    OJPlayer.currentSound.destruct();
    OJPlayer.nextSong(self._id, this.paused);
    updateSeekBarDisplay(0);
  },
  "touchend .ff-next": function(event) {
    event.preventDefault();
  },
  "click .ff-ten, touchstart .ff-ten": function(event) {
    //event.preventDefault();
    //if (this.loaded === false) {
      //return;
    //}
    // skip ahead 10 seconds
    currentSound.setPosition(currentSound.position + 10000);
  },
  "touchend .ff-ten": function(event) {
    event.preventDefault();
  },
});

Template.clientPlayer.events({
  "click .playpause, touchstart .playpause": function(event) {
    event.preventDefault();
    if (this.loaded === false) {
      return;
    }
    if ($(".playpause").has(".fa-play").length) {
      CurrentSong.update(this._id, {
        $set: {paused: false}
      });
      $(".fa-play").switchClass("fa-play", "fa-pause");
    } else {
      CurrentSong.update(this._id, {
        $set: {paused: true}
      });
      $(".fa-pause").switchClass("fa-pause", "fa-play");
    }
  },
});

