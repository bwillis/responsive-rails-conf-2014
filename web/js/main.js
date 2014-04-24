window.onload = function () {

  // 1) translate data into objects
  var talks = [];
  for(var i=0; i<getData().length; i++) {
    talks.push(jsonToTalk(getData()[i]));
  }

  // 2) collect the data into a more usable form for display
  var talksByDayAndStartTime = {};
  for(var i=0; i<talks.length; i++){
    var date = talks[i].date;
    var startTime = talks[i].startTime;
    if(talksByDayAndStartTime[date] === undefined){
      talksByDayAndStartTime[date] = {};
    }
    if(talksByDayAndStartTime[date][startTime] === undefined) {
      talksByDayAndStartTime[date][startTime] = [];
    }
    talksByDayAndStartTime[date][startTime].push(talks[i]);
  }

  // 3) iterate and render the view
  Object.keys(talksByDayAndStartTime).forEach(function (date) {
    console.log("=============");
    var talksByTime = talksByDayAndStartTime[date];
    console.log(date);
    Object.keys(talksByTime).forEach(function (time) {
      console.log(time);
      var talks = talksByTime[time];
      for (var i = 0; i < talks.length; i++) {
        talk = talks[i];
        console.log(talk.title);
      }
    });
  })

};

function Talk(title, room, date, startTime, endTime, speaker, timeOrder, category) {
  this.title = title;
  this.room = room;
  this.date = date;
  this.startTime = startTime;
  this.endTime = endTime;
  this.timeOrder = timeOrder;
  this.category = category;
  this.speaker = speaker;

  this.hasSpeaker = function () {
    return this.speaker != undefined && this.speaker != null;
  };

  this.getCategory = function () {
    return {
      'crafting_track': "Crafting Code"
    }[this.category];
  };
};

function jsonToTalk(json) {
  return new Talk(
    json.title,
    json.room,
    json.date,
    json.startTime,
    json.endTime,
    json.speaker,
    json.timeOrder,
    json.category
  );
};
