// Google Calendar Events
const calendarEl = document.getElementById('fullcalendar');
if (calendarEl) {
  const apiKey = 'AIzaSyDTAx9201QV8pY3oI42yRxOrpo0LQ08FKU';
  const calendarId = '0b81213b0b68868f63461ad324b9a749e0e9a316b5a0a55458815570664c1046@group.calendar.google.com';
  const now = new Date().toISOString();
  const url = 'https://www.googleapis.com/calendar/v3/calendars/' +
    encodeURIComponent(calendarId) +
    '/events?key=' + apiKey +
    '&timeMin=' + now +
    '&orderBy=startTime&singleEvents=true&maxResults=50';

  fetch(url)
    .then(function(res) { return res.json(); })
    .then(function(data) {
      var events = data.items || [];
      var ul = document.createElement('ul');
      if (events.length === 0) {
        var li = document.createElement('li');
        li.textContent = 'No Upcoming Events';
        li.style.opacity = '0.6';
        ul.appendChild(li);
      } else {
        events.forEach(function(event) {
          var li = document.createElement('li');
          var startRaw = event.start.dateTime || event.start.date;
          var date;
          var allDay = event.start.date && !event.start.dateTime;
          if (allDay) {
            var parts = event.start.date.split('-');
            date = new Date(parts[0], parts[1] - 1, parts[2]);
          } else {
            date = new Date(startRaw);
          }
          var dateStr = date.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });
          if (!allDay) {
            dateStr += ', ' + date.toLocaleTimeString('en-US', { hour: 'numeric', minute: '2-digit' });
          }
          var html = '<span style="font-size:.75em;font-weight:600;text-transform:uppercase">' + dateStr + '</span><br>';
          var eventUrl = null;
          if (event.description) {
            var decoded = event.description.replace(/&amp;/g, '&').replace(/&lt;/g, '<').replace(/&gt;/g, '>').replace(/&quot;/g, '"');
            var urlMatch = decoded.match(/https?:\/\/[^\s<"']+/);
            if (urlMatch) {
              var raw = urlMatch[0];
              var qMatch = raw.match(/google\.com\/url\?q=([^&]+)/);
              eventUrl = qMatch ? decodeURIComponent(qMatch[1]) : raw;
            }
          }
          if (event.summary) {
            var title = event.summary.replace(/</g, '&lt;');
            var link = eventUrl || event.htmlLink;
            html += '<a href="' + link + '" target="_blank">' + title + '</a>';
          }
          if (event.location) {
            var locParts = event.location.split(',').map(function(s) { return s.trim(); });
            var venue = locParts[0];
            var cityState = '';
            if (locParts.length >= 4) {
              cityState = locParts[locParts.length - 3] + ', ' + locParts[locParts.length - 2].replace(/\s*\d{5}.*/, '');
            } else if (locParts.length === 3) {
              cityState = locParts[1] + ', ' + locParts[2].replace(/\s*\d{5}.*/, '');
            }
            var loc = venue;
            if (cityState) loc += ', ' + cityState;
            html += ' \u2014 <span style="font-size:.75em;font-weight:300">' + loc.replace(/</g, '&lt;') + '</span>';
          }
          if (event.description) {
            var stripped = event.description.replace(/<[^>]*>/g, '').replace(/https?:\/\/[^\s]+/g, '').trim();
            if (stripped) html += '<br><span style="font-size:.75em;font-weight:300">' + stripped.replace(/</g, '&lt;') + '</span>';
          }
          li.innerHTML = html;
          ul.appendChild(li);
        });
      }
      calendarEl.appendChild(ul);
    })
    .catch(function() {
      var ul = document.createElement('ul');
      var li = document.createElement('li');
      li.textContent = 'No Upcoming Events';
      li.style.opacity = '0.6';
      ul.appendChild(li);
      calendarEl.appendChild(ul);
    });
}

// DOM Bindings
const aboutButton = document.querySelector(".about");
const servicesButton = document.querySelector(".teaching");
const personalButton = document.querySelector(".personal");
const collaborationButton = document.querySelector(".collaboration");
const eventsButton = document.querySelector(".events");
const bespokeSonicWorldsLinks = Array.from(document.querySelectorAll(".bespoke-sonic-worlds"));
const musicLessonsLinks = Array.from(document.querySelectorAll(".music-lessons"));

const aboutCard = document.querySelector(".about-container");
const contactCard = document.querySelector(".contact-container");
const offersCard = document.querySelector(".offers-container");
const teachingCard = document.querySelector(".teaching-container");
const bespokeSonicWorldsCard = document.querySelector(".bespoke-sonic-worlds-container");
const musicLessonsCard = document.querySelector(".music-lessons-container");
const personalCard = document.querySelector(".personal-container");
const collaborationCard = document.querySelector(".collaboration-container");
const bookingCard = document.querySelector(".booking-container");
const eventsCard = document.querySelector(".events-container");

const defaultPageKey = "services";

const pageRegistry = {
  services: {
    button: servicesButton,
    path: "/services",
    sections: [offersCard, teachingCard],
    activeElements: [servicesButton],
  },
  events: {
    button: eventsButton,
    path: "/events",
    sections: [bookingCard, eventsCard],
    activeElements: [eventsButton],
  },
  about: {
    button: aboutButton,
    path: "/about",
    sections: [aboutCard, contactCard],
    activeElements: [aboutButton],
  },
  personal: {
    button: personalButton,
    path: "/personal",
    sections: [personalCard],
    activeElements: [personalButton],
  },
  collaboration: {
    button: collaborationButton,
    path: "/collaboration",
    sections: [collaborationCard],
    activeElements: [collaborationButton],
  },
  "bespoke-sonic-worlds": {
    path: "/bespoke-sonic-worlds",
    sections: [offersCard, bespokeSonicWorldsCard],
    activeElements: bespokeSonicWorldsLinks,
    triggerElements: bespokeSonicWorldsLinks,
  },
  "music-lessons": {
    path: "/music-lessons",
    sections: [offersCard, musicLessonsCard],
    activeElements: musicLessonsLinks,
    triggerElements: musicLessonsLinks,
  },
};

const highlightableElements = new Set();
Object.values(pageRegistry).forEach((config) => {
  (config.activeElements || []).forEach((element) => {
    if (element) {
      highlightableElements.add(element);
    }
  });
});

const pathToPageMap = { "/": defaultPageKey, "/index.html": defaultPageKey };
Object.entries(pageRegistry).forEach(([key, config]) => {
  const normalized = normalizePath(config.path);
  pathToPageMap[normalized] = key;
});

Object.entries(pageRegistry).forEach(([key, config]) => {
  const triggerElements = [];
  if (config.button) triggerElements.push(config.button);
  if (config.buttons) triggerElements.push(...config.buttons);
  if (config.triggerElements) triggerElements.push(...config.triggerElements);

  triggerElements.forEach((element) => {
    if (!element) return;
    element.addEventListener("click", (event) => {
      event.preventDefault();
      navigateToPage(key);
    });
  });
});

function navigateToPage(pageKey, options = {}) {
  const { updateHistory = true, replaceState = false } = options;
  const targetKey = pageRegistry[pageKey] ? pageKey : defaultPageKey;

  const sectionsToShow = new Set(
    (pageRegistry[targetKey].sections || []).filter(Boolean)
  );
  const allSections = new Set();
  Object.values(pageRegistry).forEach((config) => {
    (config.sections || []).forEach((section) => {
      if (section) allSections.add(section);
    });
  });
  allSections.forEach((section) => {
    section.classList.toggle("show", sectionsToShow.has(section));
  });

  if (contactCard) {
    contactCard.classList.toggle("show", targetKey === "about");
  }

  highlightableElements.forEach((element) => {
    element.classList.remove("showing");
  });

  (pageRegistry[targetKey].activeElements || []).forEach((element) => {
    if (element) {
      element.classList.add("showing");
    }
  });

  if (updateHistory) {
    const desiredPath = pageRegistry[targetKey].path;
    const normalizedCurrent = normalizePath(window.location.pathname);
    const normalizedDesired = normalizePath(desiredPath);
    if (replaceState) {
      window.history.replaceState({ page: targetKey }, "", desiredPath);
    } else if (normalizedCurrent !== normalizedDesired) {
      window.history.pushState({ page: targetKey }, "", desiredPath);
    }
  }

  // Reset scroll so each "page" loads at the top.
  window.scrollTo({ top: 0, left: 0, behavior: "auto" });
}

function normalizePath(pathname) {
  if (!pathname) return "/";
  if (pathname.length > 1 && pathname.endsWith("/")) {
    return pathname.slice(0, -1);
  }
  return pathname;
}

function getPageFromPath(pathname) {
  const normalized = normalizePath(pathname);
  return pathToPageMap[normalized] || defaultPageKey;
}

window.addEventListener("popstate", () => {
  const pageKey = getPageFromPath(window.location.pathname);
  navigateToPage(pageKey, { updateHistory: false });
});

const initialPage = getPageFromPath(window.location.pathname);
navigateToPage(initialPage, { replaceState: true });

// Generative Music Player

// Sampler Instrument

let SAMPLE_LIBRARY = {
    'Guitar': [
      { note: 'B',  octave: 2, file: 'Samples/Guitar/B2.mp3' },
      { note: 'D',  octave: 3, file: 'Samples/Guitar/D3.mp3' },
      { note: 'F#',  octave: 3, file: 'Samples/Guitar/F#3.mp3' },
      { note: 'G',  octave: 3, file: 'Samples/Guitar/G3.mp3' },
      { note: 'A',  octave: 3, file: 'Samples/Guitar/A3.mp3' },
      { note: 'B',  octave: 3, file: 'Samples/Guitar/B3.mp3' },
      { note: 'D',  octave: 4, file: 'Samples/Guitar/D4.mp3' }
    ],
    'Guitar Sustain': [
      { note: 'A',  octave: 4, file: 'Samples/Guitar Sustain/A4.mp3' },
      { note: 'C#',  octave: 5, file: 'Samples/Guitar Sustain/C#5.mp3' },
      { note: 'E',  octave: 5, file: 'Samples/Guitar Sustain/E5.mp3' },
      { note: 'G#',  octave: 5, file: 'Samples/Guitar Sustain/G#5.mp3' },
      { note: 'A',  octave: 5, file: 'Samples/Guitar Sustain/A5.mp3' }
    ],
    'Eno & Fripp': [
      { note: 'F#',  octave: 2, file: 'Samples/Eno & Fripp/F#2.mp3' },
      { note: 'C#',  octave: 3, file: 'Samples/Eno & Fripp/C#3.mp3' },
    ],
};

const OCTAVE = ['C', 'C#', 'D', 'D#', 'E', 'F', 'F#', 'G', 'G#', 'A', 'A#', 'B'];

let audioContext = new AudioContext();

function fetchSample(path) {
  return fetch(encodeURIComponent(path))
    .then(response => response.arrayBuffer())
    .then(arrayBuffer => audioContext.decodeAudioData(arrayBuffer));
}

function noteValue(note, octave) {
  return octave * 12 + OCTAVE.indexOf(note);
}

function getNoteDistance(note1, octave1, note2, octave2) {
  return noteValue(note1, octave1) - noteValue(note2, octave2);
}

function getNearestSample(sampleBank, note, octave) {
  let sortedBank = sampleBank.slice().sort((sampleA, sampleB) => {
    let distanceToA =
      Math.abs(getNoteDistance(note, octave, sampleA.note, sampleA.octave));
    let distanceToB =
      Math.abs(getNoteDistance(note, octave, sampleB.note, sampleB.octave));
    return distanceToA - distanceToB;
  });
  return sortedBank[0];
}

function flatToSharp(note) {
  switch (note) {
    case 'Bb': return 'A#';
    case 'Db': return 'C#';
    case 'Eb': return 'D#';
    case 'Gb': return 'F#';
    case 'Ab': return 'G#';
    default: return note;
  }
}

function getSample(instrument, noteAndOctave) {
  let [, requestedNote, requestedOctave] = /^(\w[b\#]?)(\d)$/.exec(noteAndOctave);
  requestedOctave = parseInt(requestedOctave, 10);
  requestedNote = flatToSharp(requestedNote);
  let sampleBank = SAMPLE_LIBRARY[instrument];
  let sample = getNearestSample(sampleBank, requestedNote, requestedOctave);
  let distance =
    getNoteDistance(requestedNote, requestedOctave, sample.note, sample.octave);
  return fetchSample(sample.file).then(audioBuffer => ({
    audioBuffer: audioBuffer,
    distance: distance
  }));
}

function playSample(instrument, note, delaySeconds = 0) {
    getSample(instrument, note).then(({audioBuffer, distance}) => {
      let playbackRate = Math.pow(2, distance / 12);
      let bufferSource = audioContext.createBufferSource();
      bufferSource.buffer = audioBuffer;
      bufferSource.playbackRate.value = playbackRate;
      bufferSource.connect(audioContext.destination);
      bufferSource.start(audioContext.currentTime + delaySeconds);
    });
  }

function startLoop(instrument, note, loopLengthSeconds, delaySeconds) {
    playSample(instrument, note, delaySeconds);
    setInterval(
      () => playSample(instrument, note, delaySeconds),
      loopLengthSeconds * 1000
    );
  }

let playedOnce = false;
// EVENT LISTENER
  let button = document.querySelector('button.play');
  button.addEventListener('click', function() {
    if(playedOnce == true) {
      return;
    } else {
              // Guitar Flute Sounds
              startLoop('Guitar Sustain', 'F4', 11.1, 0.0);
              startLoop('Guitar Sustain', 'Ab4', 10, 3.1);
              startLoop('Guitar Sustain', 'C5', 12.1, 5.6);
              startLoop('Guitar Sustain', 'Db5', 15.5, 9.6);
              startLoop('Guitar Sustain', 'Eb5', 17.3, 10.2);
              startLoop('Guitar Sustain', 'F5', 18.6, 11.1);
              startLoop('Guitar Sustain', 'Ab5', 23.1, 14.1);  
        
              // Eno & Fripp Low Padded Chords
              startLoop('Eno & Fripp', 'C#3', 30, 15.1);  
              startLoop('Eno & Fripp', 'F#2', 30, 25.1);

              // startLoop('Field Recordings', 'C4', 60, 0.0);


              playedOnce = true;
    }
  });

// PLAY/PAUSE
audioContext.suspend().then(function() {
  button.textContent = 'Play';
});

button.onclick = function() {
  if(audioContext.state === 'running') {
    audioContext.suspend().then(function() {
      button.textContent = 'Play';
    });
  } else if(audioContext.state === 'suspended') {
    audioContext.resume().then(function() {
      button.textContent = 'Pause';
    });
  }
}

// Playlist Player

const playIconSVG = '<svg width="14" height="14" viewBox="0 0 14 14" fill="white"><polygon points="3,1 12,7 3,13"/></svg>';
const pauseIconSVG = '<svg width="14" height="14" viewBox="0 0 14 14" fill="white"><rect x="2" y="1" width="4" height="12" rx="1"/><rect x="8" y="1" width="4" height="12" rx="1"/></svg>';
const transportPlaySVG = '<svg width="16" height="16" viewBox="0 0 16 16" fill="white"><polygon points="3,1 14,8 3,15"/></svg>';
const transportPauseSVG = '<svg width="16" height="16" viewBox="0 0 16 16" fill="white"><rect x="3" y="2" width="4" height="12" rx="1"/><rect x="9" y="2" width="4" height="12" rx="1"/></svg>';

const playlistAudio = new Audio();
let currentTrackSrc = null;
let activePlaylistBtn = null;

const transportBar = document.getElementById('transport-bar');
const transportPlayPause = document.getElementById('transport-play-pause');
const transportTrackName = document.getElementById('transport-track-name');
const playlistBtns = document.querySelectorAll('.playlist-play-btn');

function resetAllPlaylistBtns() {
  playlistBtns.forEach(btn => { btn.innerHTML = playIconSVG; });
  activePlaylistBtn = null;
}

function showTransport(trackName) {
  transportBar.classList.add('visible');
  document.body.classList.add('transport-visible');
  transportTrackName.textContent = trackName;
  transportPlayPause.innerHTML = transportPauseSVG;
}

function hideTransport() {
  transportBar.classList.remove('visible');
  document.body.classList.remove('transport-visible');
}

// Clicking track name triggers play button
document.querySelectorAll('.playlist-track-name').forEach(name => {
  name.addEventListener('click', () => {
    name.closest('.playlist-item').querySelector('.playlist-play-btn').click();
  });
});

playlistBtns.forEach(btn => {
  btn.addEventListener('click', () => {
    const src = btn.getAttribute('data-src');
    const trackName = btn.closest('.playlist-item').querySelector('.playlist-track-name').textContent;

    // Pause generative player if running
    if (audioContext.state === 'running') {
      audioContext.suspend().then(() => { button.textContent = 'Play'; });
    }

    if (currentTrackSrc === src && !playlistAudio.paused) {
      // Same track playing — pause it
      playlistAudio.pause();
      btn.innerHTML = playIconSVG;
      transportPlayPause.innerHTML = transportPlaySVG;
    } else if (currentTrackSrc === src && playlistAudio.paused) {
      // Same track paused — resume
      playlistAudio.play();
      btn.innerHTML = pauseIconSVG;
      transportPlayPause.innerHTML = transportPauseSVG;
    } else {
      // Different track or nothing playing
      resetAllPlaylistBtns();
      playlistAudio.src = src;
      currentTrackSrc = src;
      playlistAudio.play();
      btn.innerHTML = pauseIconSVG;
      activePlaylistBtn = btn;
      showTransport(trackName);
    }
  });
});

transportBar.addEventListener('click', () => {
  if (playlistAudio.paused) {
    playlistAudio.play();
    transportPlayPause.innerHTML = transportPauseSVG;
    if (activePlaylistBtn) activePlaylistBtn.innerHTML = pauseIconSVG;
  } else {
    playlistAudio.pause();
    transportPlayPause.innerHTML = transportPlaySVG;
    if (activePlaylistBtn) activePlaylistBtn.innerHTML = playIconSVG;
  }
});

playlistAudio.addEventListener('ended', () => {
  resetAllPlaylistBtns();
  hideTransport();
  currentTrackSrc = null;
});

// Spacebar to toggle playlist playback
document.addEventListener('keydown', (e) => {
  if (e.code === 'Space' && currentTrackSrc && e.target === document.body) {
    e.preventDefault();
    transportPlayPause.click();
  }
});

// Re-sync transport bar when returning from lock screen / tab switch
document.addEventListener('visibilitychange', () => {
  if (document.visibilityState === 'visible' && currentTrackSrc) {
    if (!playlistAudio.paused) {
      showTransport(transportTrackName.textContent);
      if (activePlaylistBtn) activePlaylistBtn.innerHTML = pauseIconSVG;
    } else {
      transportBar.classList.add('visible');
      document.body.classList.add('transport-visible');
      transportPlayPause.innerHTML = transportPlaySVG;
      if (activePlaylistBtn) activePlaylistBtn.innerHTML = playIconSVG;
    }
  }
});

// When generative Play button resumes, pause playlist
const origOnClick = button.onclick;
button.onclick = function() {
  if (audioContext.state === 'suspended') {
    // Generative player is resuming — pause playlist if playing
    if (!playlistAudio.paused) {
      playlistAudio.pause();
      resetAllPlaylistBtns();
      transportPlayPause.innerHTML = transportPlaySVG;
    }
  }
  origOnClick.call(this);
};
