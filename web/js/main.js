window.onload = function () {

  // 1) translate data into objects
  var talks = [];
  for(var i=0; i<getData().length; i++) {
    if(getData()[i].title) {
      talks.push(jsonToTalk(getData()[i]));
    }
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
    if(!isDateToday(date)) {
      dayContainer.className = dayContainer.className + ' hidden';
    }

    var header = appendSimpleElement(dayContainer, "header", "", date);

    header.onclick = function(){
      if(dayContainer.className.match('hidden')) {
        dayContainer.className = dayContainer.className.replace(' hidden', '');
      } else {
        dayContainer.className = dayContainer.className + ' hidden';
      }
    };

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
          appendSimpleElement(talkContainer, "p", "time-range", talk.startTime + ' - ' + talk.endTime);
          appendSimpleElement(talkContainer, "p", "speaker-description", talk.bio);
          appendSimpleElement(talkContainer, "p", "track", talk.getCategory());
        }

        if (i + 1 < talks.length) {
          talkContainer.appendChild(document.createElement("hr"));
        }

        timeContainer.appendChild(talkContainer);
      }
    });
  })

};

function appendSimpleElement(target, tagName, className, text) {
  if(text !== undefined && text != null) {
    var el = simpleElement(tagName, className, text);
    target.appendChild(el);
    return el;
  }
  return null;
}

function simpleElement(tagName, className, text) {
  var element = document.createElement(tagName);
  element.className = className;
  if (text !== undefined && text != null) {
    element.innerHTML = text;
  }
  return element;
}

function isDateToday(stringDate) {
  var now = new Date();
  if(now.getMonth() != 3 || now.getFullYear() != 2014) {
    return false;
  }
  return stringDate.match(now.getDate()) != null;
}

function Talk(title, room, date, startTime, endTime, speaker, abstract, bio, category) {
  this.title = title;
  this.room = room;
  this.date = date;
  this.startTime = startTime;
  this.endTime = endTime;
  this.category = category;
  this.speaker = speaker;
  this.abstract = abstract;
  this.bio = bio;

  this.getCategory = function () {
    return {
      'crafting_track': "Crafting Code",
      'big_track': "Big Rails",
      'sponsored_track': "Sponsored Session",
      'workshop_track': "Workshop",
      'growing_track': "Growing Talent",
      'live_track': "Live Coding",
      'distributed_track': "Distributed",
      'crafting_track': "Crafting Code",
      'learning_track': "Learning from Designers",
      'testing_track': "Testing",
      'beyond_track': "Beyond ERB",
      'play_track': "Play Nicely",
      'novice_track': "Novice"
    }[this.category];
  };
};

function jsonToTalk(json) {
  return new Talk(
    json.title,
    json.location,
    json.day,
    json.begining_time,
    json.end_time,
    json.speaker,
    json.abstract,
    json.bio,
    json.session_type
  );
};
