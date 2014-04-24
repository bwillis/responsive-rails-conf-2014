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

  var schedule = document.getElementById("schedule");
  var header = document.createElement('h2');
  header.innerText = "Schedule";
  schedule.appendChild(header);

  // 3) iterate and render the view
  Object.keys(talksByDayAndStartTime).forEach(function (date) {

    var dayContainer = simpleElement("div", "day", null);

    appendSimpleElement(dayContainer, "header", "", date);

    schedule.appendChild(dayContainer);

    var talksByTime = talksByDayAndStartTime[date];
    Object.keys(talksByTime).forEach(function (time) {

      var timeContainer = simpleElement("section", "timeslot", null);

      appendSimpleElement(timeContainer, "h3", "start-time", time);

      dayContainer.appendChild(timeContainer);

      var talks = talksByTime[time];
      for (var i = 0; i < talks.length; i++) {
        talk = talks[i];
        var talkContainer = document.createElement('div');

        if(talks.length == 1) {
          talkContainer.className = "sole-talk";
          appendSimpleElement(talkContainer, "h4", "title", talk.title);
          appendSimpleElement(talkContainer, "p", "speaker", talk.speaker);
          appendSimpleElement(talkContainer, "p", "room", talk.room);
        }else{
          talkContainer.className = "talk";
          appendSimpleElement(talkContainer, "h4", "title", talk.title);
          appendSimpleElement(talkContainer, "p", "speaker", talk.speaker);
          appendSimpleElement(talkContainer, "p", "room", talk.room);
          appendSimpleElement(talkContainer, "p", "abstract", talk.abstract);
          appendSimpleElement(talkContainer, "p", "time-range", talk.startTime + ' - ' + talk.stopTime);
          appendSimpleElement(talkContainer, "p", "speaker-description", talk.bio);
          appendSimpleElement(talkContainer, "p", "track", talk.category);
        }

        timeContainer.appendChild(talkContainer);
      }
    });
  })

};

function appendSimpleElement(target, tagName, className, text) {
  if(text !== undefined && text != null) {
    target.appendChild(simpleElement(tagName, className, text));
  }
}

function simpleElement(tagName, className, text) {
  var element = document.createElement(tagName);
  element.className = className;
  if (text !== undefined && text != null) {
    element.innerText = text;
  }
  return element;
}

function Talk(title, room, date, startTime, endTime, speaker, bio, timeOrder, category) {
  this.title = title;
  this.room = room;
  this.date = date;
  this.startTime = startTime;
  this.endTime = endTime;
  this.timeOrder = timeOrder;
  this.category = category;
  this.speaker = speaker;
  this.bio = bio;

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
    json.bio,
    json.timeOrder,
    json.category
  );
};
