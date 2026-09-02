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
        // Nothing coming up: hide the whole "Upcoming" block rather than
        // announce an absence, so the page leads with the work instead.
        hideUpcomingBlock();
        return;
      } else {
        events.forEach(function(event) {
          var li = document.createElement('li');
          var startRaw = event.start.dateTime || event.start.date;
          var endRaw = event.end.dateTime || event.end.date;
          var startDate, endDate;
          var allDay = event.start.date && !event.start.dateTime;
          
          if (allDay) {
            var startParts = event.start.date.split('-');
            startDate = new Date(startParts[0], startParts[1] - 1, startParts[2]);
            var endParts = event.end.date.split('-');
            endDate = new Date(endParts[0], endParts[1] - 1, endParts[2]);
            // For all-day events, end.date is exclusive, so subtract 1 day to get the actual end date
            endDate.setDate(endDate.getDate() - 1);
          } else {
            startDate = new Date(startRaw);
            endDate = new Date(endRaw);
          }
          
          var dateStr;
          var isMultiDay = (allDay && startDate.getTime() !== endDate.getTime()) || 
                           (!allDay && startDate.toDateString() !== endDate.toDateString());
          
          if (isMultiDay) {
            // Multi-day event
            var startStr = startDate.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
            var endStr = endDate.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });
            
            if (startDate.getFullYear() === endDate.getFullYear()) {
              dateStr = startStr + ' - ' + endStr;
            } else {
              startStr = startDate.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });
              dateStr = startStr + ' - ' + endStr;
            }
            
            if (!allDay) {
              dateStr += ', ' + startDate.toLocaleTimeString('en-US', { hour: 'numeric', minute: '2-digit' }) + 
                        ' - ' + endDate.toLocaleTimeString('en-US', { hour: 'numeric', minute: '2-digit' });
            }
          } else {
            // Single day event
            dateStr = startDate.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });
            if (!allDay) {
              dateStr += ', ' + startDate.toLocaleTimeString('en-US', { hour: 'numeric', minute: '2-digit' });
            }
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
      // If the calendar can't be reached, hide the block too — better a
      // clean page than an error or a false "nothing coming up".
      hideUpcomingBlock();
    });

  // Hides the "UPCOMING EVENTS" heading along with its (empty) list.
  function hideUpcomingBlock() {
    var block = calendarEl.parentElement;
    if (block) { block.style.display = 'none'; }
  }
}

// DOM Bindings
const aboutButton = document.querySelector(".about");
const servicesButton = document.querySelector(".teaching");
const projectsButton = document.querySelector(".projects");
const personalButton = document.querySelector(".personal");
const collaborationButton = document.querySelector(".collaboration");
const eventsButton = document.querySelector(".events");
const aboutLinks = Array.from(document.querySelectorAll(".about"));
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
const projectsCard = document.querySelector(".projects-container");
const listenCard = document.querySelector(".listen-container");
const listenWelcomeCard = document.querySelector(".listen-welcome-container");
const loopCard = document.querySelector(".loop-container");
const listenLinks = Array.from(document.querySelectorAll(".listen-link"));
const pageSections = Array.from(document.querySelectorAll(".page-section"));

const defaultPageKey = "services";

const pageRegistry = {
  services: {
    button: servicesButton,
    path: "/services",
    title: "Stu Pender — Being Sound",
    sections: [offersCard, teachingCard],
    activeElements: [servicesButton],
  },
  projects: {
    button: projectsButton,
    path: "/projects",
    sections: [projectsCard],
    activeElements: [projectsButton],
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
    activeElements: aboutLinks,
    triggerElements: aboutLinks,
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
    path: "/bespoke-sound",
    title: "Bespoke Sound | Being Sound Studio",
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
  // The freebie landing page. No nav link points here (yet) — it's reached
  // directly, e.g. from a link or the QR code we'll generate later.
  // Shows the offers bar above it, like the other service pages, so people
  // can keep moving between Bespoke Sound, Music Lessons, and the gift.
  listen: {
    path: "/listen",
    title: "Listen | Being Sound Studio",
    sections: [offersCard, listenCard],
    activeElements: listenLinks,
    triggerElements: listenLinks,
  },
  // The QR-code target. Printed on cards, so this path must never change.
  loop: {
    path: "/loop",
    title: "Stay in the loop | Being Sound Studio",
    sections: [loopCard],
  },
  // The hidden thank-you page. `noindex: true` keeps it out of search results
  // (see the robots-meta handling in navigateToPage below).
  "listen-welcome": {
    path: "/listen/welcome",
    title: "Your soundscape | Being Sound Studio",
    sections: [listenWelcomeCard],
    noindex: true,
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

// A single <meta name="robots"> tag we reuse to keep certain pages (like the
// hidden welcome page) out of search results. We create it once if it's missing.
// This is needed because every route shares one HTML document, so a static tag
// in <head> would (un)index the whole site rather than one page.
const robotsMeta =
  document.querySelector('meta[name="robots"]') ||
  document.head.appendChild(
    Object.assign(document.createElement("meta"), { name: "robots" })
  );

function navigateToPage(pageKey, options = {}) {
  const { updateHistory = true, replaceState = false } = options;
  const targetKey = pageRegistry[pageKey] ? pageKey : defaultPageKey;

  // Keep noindex pages out of search; let every other page be indexed normally.
  robotsMeta.content = pageRegistry[targetKey].noindex
    ? "noindex, nofollow"
    : "index, follow";

  const sectionsToShow = new Set(
    (pageRegistry[targetKey].sections || []).filter(Boolean)
  );
  pageSections.forEach((section) => {
    section.classList.toggle("show", sectionsToShow.has(section));
  });

  document.title = pageRegistry[targetKey].title || "Stu Pender — Being Sound";

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

  // Background videos only autoplay if they're visible when the page loads,
  // and these sections start hidden — so start the one on the page we just
  // opened, and pause the others to save battery.
  document.querySelectorAll(".section-video").forEach(function (video) {
    var onShownPage = video.closest(".page-section.show");
    if (onShownPage) {
      var attempt = video.play();
      // Browsers return a promise here and reject it if they refuse; the
      // page looks fine either way, so we just swallow the refusal.
      if (attempt && attempt.catch) { attempt.catch(function () {}); }
    } else {
      video.pause();
    }
  });

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

// ============================================================
//  Background halves (the glass pages)
//  Each dark page names one photograph in its HTML. Here we make a
//  second copy of it so the image continues underneath the translucent
//  panel instead of stopping at its edge. Doing it here — rather than
//  writing the <img> twice in the HTML — keeps one image per page as
//  the single thing to change.
//
//  A page can show a DIFFERENT image under the glass by adding
//  data-under="images/whatever.jpg" to its <img>. (The About page does
//  this: a plain sky sits under the glass so the portrait isn't repeated.)
//
//  The copy is decorative, so it's hidden from screen readers.
// ============================================================
document
  .querySelectorAll(
    ".teaching-container > .section-pic," +
      ".about-container > .section-pic," +
      ".bespoke-sonic-worlds-container > .section-pic," +
      ".music-lessons-container > .section-pic," +
      ".listen-container > .section-pic," +
      ".listen-welcome-container > .section-pic," +
      ".loop-container > .section-pic," +
      ".events-container > .section-pic"
  )
  .forEach(function (image) {
    var mirror = image.cloneNode();
    mirror.classList.remove("section-pic");
    mirror.classList.add("section-pic-mirror");
    if (image.dataset.under) {
      mirror.src = image.dataset.under;
    }
    mirror.setAttribute("alt", "");
    mirror.setAttribute("aria-hidden", "true");
    image.parentNode.insertBefore(mirror, image.nextSibling);
    // The photograph is floated so the copy sets beside it and then runs
    // full width once it clears. A float only affects content that comes
    // after it, and these images are authored after their text block, so
    // the image moves to the top of the section here.
    image.parentNode.insertBefore(image, image.parentNode.firstChild);
  });

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

const queuePlaySVG = '<svg width="11" height="11" viewBox="0 0 14 14" fill="white"><polygon points="3,1 12,7 3,13"/></svg>';
const queuePauseSVG = '<svg width="11" height="11" viewBox="0 0 14 14" fill="white"><rect x="2" y="1" width="4" height="12" rx="1"/><rect x="8" y="1" width="4" height="12" rx="1"/></svg>';
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
const transportQueueToggle = document.getElementById('transport-queue-toggle');
const transportQueue = document.getElementById('transport-queue');
const playlistBtns = document.querySelectorAll('.playlist-play-btn');

function resetAllPlaylistBtns() {
  playlistBtns.forEach(btn => { btn.innerHTML = playIconSVG; });
  activePlaylistBtn = null;
}

// Which page the playing track was started from, so clicking its title in
// the bar can take you back there. Set whenever playback starts.
let transportSourcePage = null;

function showTransport(trackName, triggerBtn) {
  transportBar.classList.add('visible');
  document.body.classList.add('transport-visible');

  // Work out which page this track lives on by finding the section it sits
  // in, then the registry entry that lists that section.
  const section = triggerBtn && triggerBtn.closest('.page-section');
  const entry = section && Object.entries(pageRegistry)
    .find(([, config]) => (config.sections || []).includes(section));
  transportSourcePage = entry ? entry[0] : null;
  transportTrackName.classList.toggle('is-linked', !!transportSourcePage);
  // Keep the wrapper itself — it's what stacks the title above the meta.
  transportTrackName.replaceChildren(buildTrackLabel(trackName, 'transport-track-label'));
  transportPlayPause.innerHTML = transportPauseSVG;

  // Show the artwork of whatever is playing. If a track has none, hide the
  // slot rather than leaving a broken picture.
  const transportArt = document.getElementById('transport-art');
  if (transportArt) {
    const item = triggerBtn && triggerBtn.closest('.playlist-item');
    const art = item ? artworkFor(item) : null;
    if (art) {
      transportArt.src = art;
      transportArt.style.display = '';
    } else {
      transportArt.removeAttribute('src');
      transportArt.style.display = 'none';
    }
  }

  if (triggerBtn) {
    buildQueue(triggerBtn);
  }
  // The queue stays shut until someone opens it — the bar already shows
  // what's playing, and a panel springing open is a lot to throw at you
  // just for pressing play.
  closeQueue();
}

// Track names are written as "Title — Artist — Album" (that's the order
// they're shown in, so there's nothing to remember). Split off the first
// part as the title; whatever follows becomes the quieter second line, the
// same way the album cards show a title with smaller grey text beneath.
function splitTrackName(name) {
  const parts = String(name).split(' — ');
  return {
    title: parts.shift(),
    meta: parts.join(' — ')
  };
}

// Builds the two-line label used by both the bar and the queue, so they
// can't drift apart.
function buildTrackLabel(name, className) {
  const parts = splitTrackName(name);

  const wrap = document.createElement('span');
  wrap.className = className;

  const title = document.createElement('span');
  title.className = 'track-title';
  title.textContent = parts.title;
  wrap.appendChild(title);

  if (parts.meta) {
    const meta = document.createElement('span');
    meta.className = 'track-meta';
    meta.textContent = parts.meta;
    wrap.appendChild(meta);
  }

  return wrap;
}

// Where a track's artwork comes from, in order of preference:
//   1. data-art on the track itself
//   2. data-art on the playlist it belongs to (one image for a whole set)
//   3. the album card's own picture, when the track sits in a card
// Returns null if there's no picture to be had, and the layout copes.
function artworkFor(item) {
  if (item.dataset.art) return item.dataset.art;

  const playlist = item.closest('ul.playlist');
  if (playlist && playlist.dataset.art) return playlist.dataset.art;

  const card = item.closest('.album-card');
  const image = card && card.querySelector('.album-card-image img');
  return image ? image.getAttribute('src') : null;
}

function buildQueue(triggerBtn) {
  if (!triggerBtn) return;
  transportQueue.innerHTML = '';
  const playlist = triggerBtn.closest('ul.playlist');
  if (!playlist) return;
  const items = playlist.querySelectorAll('.playlist-item');
  items.forEach(item => {
    const btn = item.querySelector('.playlist-play-btn');
    const name = item.getAttribute('data-transport-name') || item.querySelector('.playlist-track-name').textContent;
    const src = btn.getAttribute('data-src');
    const art = artworkFor(item);

    // Each queue entry is built like a list row — artwork, then title — so
    // the queue, the page lists and the bar all read the same way.
    const li = document.createElement('li');
    li.setAttribute('data-src', src);

    if (art) {
      const thumb = document.createElement('span');
      thumb.className = 'transport-queue-thumb';

      const image = document.createElement('img');
      image.className = 'transport-queue-art';
      image.src = art;
      image.alt = '';
      image.setAttribute('aria-hidden', 'true');
      thumb.appendChild(image);

      // The badge over the artwork: play on hover, pause on the track
      // that's currently sounding — exactly how the cards behave.
      const badge = document.createElement('span');
      badge.className = 'transport-queue-play';
      thumb.appendChild(badge);

      li.appendChild(thumb);
    }

    li.appendChild(buildTrackLabel(name, 'transport-queue-name'));

    if (src === currentTrackSrc) li.classList.add('active');
    li.addEventListener('click', (e) => {
      e.stopPropagation();
      btn.click();
      closeQueue();
    });
    transportQueue.appendChild(li);
  });
}

function updateQueueActive() {
  transportQueue.querySelectorAll('li').forEach(li => {
    const isCurrent = li.getAttribute('data-src') === currentTrackSrc;
    li.classList.toggle('active', isCurrent);

    // The current row shows pause while it's sounding (and play if it's
    // been paused); every other row shows play, revealed on hover.
    const badge = li.querySelector('.transport-queue-play');
    if (badge) {
      const showPause = isCurrent && !playlistAudio.paused;
      badge.innerHTML = showPause ? queuePauseSVG : queuePlaySVG;
    }
  });
}

function closeQueue() {
  transportQueue.classList.remove('open');
  transportQueueToggle.classList.remove('open');
}

function hideTransport() {
  transportBar.classList.remove('visible');
  document.body.classList.remove('transport-visible');
  closeQueue();
}

const cardPlaySVG = '<svg width="16" height="16" viewBox="0 0 16 16" fill="white"><polygon points="3,1 14,8 3,15"/></svg>';
const cardPauseSVG = '<svg width="16" height="16" viewBox="0 0 16 16" fill="white"><rect x="3" y="2" width="4" height="12" rx="1"/><rect x="9" y="2" width="4" height="12" rx="1"/></svg>';

function updateCardStates() {
  document.querySelectorAll('.album-card').forEach(card => {
    const playlist = card.querySelector('ul.playlist');
    if (!playlist) return;
    const srcs = Array.from(playlist.querySelectorAll('.playlist-play-btn')).map(b => b.getAttribute('data-src'));
    const isPlaying = currentTrackSrc && srcs.includes(currentTrackSrc) && !playlistAudio.paused;
    const isPaused = currentTrackSrc && srcs.includes(currentTrackSrc) && playlistAudio.paused;
    const playBtn = card.querySelector('.album-card-play');
    if (!playBtn) return;
    if (isPlaying) {
      card.classList.add('playing');
      playBtn.innerHTML = cardPauseSVG;
    } else if (isPaused) {
      card.classList.add('playing');
      playBtn.innerHTML = cardPlaySVG;
    } else {
      card.classList.remove('playing');
      playBtn.innerHTML = cardPlaySVG;
    }
  });
}

// Remove play button from cards that link externally (no local playlist).
// A card that is itself a track (list view, where the row IS the item rather
// than holding a nested playlist) keeps its button — it has something to play.
document.querySelectorAll('.album-card').forEach(card => {
  const holdsAPlaylist = !!card.querySelector('ul.playlist');
  const isATrackItself = card.classList.contains('playlist-item');
  if (!holdsAPlaylist && !isATrackItself) {
    const playBtn = card.querySelector('.album-card-play');
    if (playBtn) playBtn.remove();
    card.classList.add('album-card-external');
  }
});

// Clicking album card triggers first track or toggles play/pause
document.querySelectorAll('.album-card-image').forEach(img => {
  img.addEventListener('click', () => {
    const card = img.closest('.album-card');
    const playlist = card.querySelector('ul.playlist');
    if (!playlist) return;
    const srcs = Array.from(playlist.querySelectorAll('.playlist-play-btn')).map(b => b.getAttribute('data-src'));
    if (currentTrackSrc && srcs.includes(currentTrackSrc)) {
      // This album is active — toggle play/pause via transport
      transportLeft.click();
      updateCardStates();
      return;
    }
    const firstBtn = card.querySelector('.playlist-play-btn');
    if (firstBtn) firstBtn.click();
  });
});

// Clicking track name triggers play button
document.querySelectorAll('.playlist-track-name').forEach(name => {
  name.addEventListener('click', () => {
    name.closest('.playlist-item').querySelector('.playlist-play-btn').click();
  });
});

playlistBtns.forEach(btn => {
  btn.addEventListener('click', () => {
    const src = btn.getAttribute('data-src');
    const item = btn.closest('.playlist-item');
    const trackName = item.getAttribute('data-transport-name') || item.querySelector('.playlist-track-name').textContent;

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
      showTransport(trackName, btn);
    }
    updateQueueActive();
    updateCardStates();
  });
});

const transportLeft = document.getElementById('transport-left');
const transportRight = document.getElementById('transport-right');

transportLeft.addEventListener('click', () => {
  if (playlistAudio.paused) {
    playlistAudio.play();
    transportPlayPause.innerHTML = transportPauseSVG;
    if (activePlaylistBtn) activePlaylistBtn.innerHTML = pauseIconSVG;
  } else {
    playlistAudio.pause();
    transportPlayPause.innerHTML = transportPlaySVG;
    if (activePlaylistBtn) activePlaylistBtn.innerHTML = playIconSVG;
  }
  updateCardStates();
});

// The badge follows the audio itself rather than the click. Starting
// playback is asynchronous — `paused` is still true for a moment after
// play() is called — so updating on the click would leave the badge a step
// behind. These two events fire when playback really starts and stops.
['play', 'pause'].forEach((eventName) => {
  playlistAudio.addEventListener(eventName, updateQueueActive);
});

transportRight.addEventListener('click', () => {
  transportQueue.classList.toggle('open');
  transportQueueToggle.classList.toggle('open');
});

// --- Previous / next ---
// These reuse the queue the transport bar already builds, so they follow the
// same order as the list you started from. Clicking a queue entry is what
// actually plays a track, so we just click the neighbouring one.
const transportPrev = document.getElementById('transport-prev');
const transportNext = document.getElementById('transport-next');

function stepTrack(offset) {
  const items = Array.from(transportQueue.querySelectorAll('li'));
  if (!items.length) return;
  const index = items.findIndex(li => li.getAttribute('data-src') === currentTrackSrc);
  if (index < 0) return;
  const target = items[index + offset];
  if (target) target.click();
}

// stopPropagation matters here: these sit inside the left-hand area, which
// itself toggles play/pause when clicked. Without it, skipping a track would
// also pause it.
if (transportPrev) {
  transportPrev.addEventListener('click', (event) => {
    event.stopPropagation();
    stepTrack(-1);
  });
}

if (transportNext) {
  transportNext.addEventListener('click', (event) => {
    event.stopPropagation();
    stepTrack(1);
  });
}

// --- Volume ---
// Same reasoning: the slider lives inside the right-hand area, which opens
// the queue when clicked, so its events must not travel upward.
const transportVolume = document.getElementById('transport-volume');

if (transportVolume) {
  playlistAudio.volume = parseFloat(transportVolume.value);

  // CSS can't read an input's value, so we hand it the percentage to fill.
  function paintVolumeFill() {
    transportVolume.style.setProperty(
      '--volume-fill',
      (parseFloat(transportVolume.value) * 100) + '%'
    );
  }
  paintVolumeFill();

  transportVolume.addEventListener('input', (event) => {
    event.stopPropagation();
    playlistAudio.volume = parseFloat(transportVolume.value);
    paintVolumeFill();
  });

  ['click', 'mousedown', 'touchstart'].forEach((name) => {
    transportVolume.addEventListener(name, (event) => event.stopPropagation());
  });
}

transportQueue.addEventListener('click', (e) => {
  e.stopPropagation();
});

document.addEventListener('click', (e) => {
  // The queue is a sibling of the bar rather than a child (so its blur can
  // reach the page), so both have to be checked here.
  if (!transportBar.contains(e.target) && !transportQueue.contains(e.target)) {
    closeQueue();
  }
});

playlistAudio.addEventListener('ended', () => {
  // Advance to next track in queue
  const queueItems = Array.from(transportQueue.querySelectorAll('li'));
  const currentIndex = queueItems.findIndex(li => li.getAttribute('data-src') === currentTrackSrc);
  if (currentIndex >= 0 && currentIndex < queueItems.length - 1) {
    // Play next track
    queueItems[currentIndex + 1].click();
  } else {
    // End of queue — stop playback
    resetAllPlaylistBtns();
    hideTransport();
    currentTrackSrc = null;
    updateCardStates();
  }
});

// Spacebar to toggle playlist playback
document.addEventListener('keydown', (e) => {
  if (e.code === 'Space' && currentTrackSrc && e.target === document.body) {
    e.preventDefault();
    transportLeft.click();
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
    updateCardStates();
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

// ============================================================
//  Keyboard control for the player
//  Space plays and pauses; the left and right arrows step between
//  tracks. Only while something is actually loaded, and never while
//  someone is typing — otherwise a space in the email field would
//  pause the music instead of typing a space.
// ============================================================
document.addEventListener('keydown', (event) => {
  // Ignore anything typed into a field, or with a modifier held.
  const target = event.target;
  const isTyping =
    target &&
    (target.matches('input, textarea, select') || target.isContentEditable);
  if (isTyping || event.metaKey || event.ctrlKey || event.altKey) return;

  // Nothing to control until a track has been chosen.
  if (!currentTrackSrc) return;

  if (event.code === 'Space') {
    // Space would otherwise scroll the page.
    event.preventDefault();
    if (playlistAudio.paused) {
      playlistAudio.play();
      transportPlayPause.innerHTML = transportPauseSVG;
      if (activePlaylistBtn) activePlaylistBtn.innerHTML = pauseIconSVG;
    } else {
      playlistAudio.pause();
      transportPlayPause.innerHTML = transportPlaySVG;
      if (activePlaylistBtn) activePlaylistBtn.innerHTML = playIconSVG;
    }
    updateCardStates();
  } else if (event.code === 'ArrowRight') {
    event.preventDefault();
    stepTrack(1);
  } else if (event.code === 'ArrowLeft') {
    event.preventDefault();
    stepTrack(-1);
  }
});


// ============================================================
//  Playback position
//  Fills the hairline at the bottom of the bar as the track plays.
//  'timeupdate' fires a few times a second while playing.
// ============================================================
const transportProgressPlayed = document.getElementById('transport-progress-played');

if (transportProgressPlayed) {
  function paintProgress() {
    const total = playlistAudio.duration;
    // duration is NaN until the file's metadata has loaded.
    const fraction = total ? playlistAudio.currentTime / total : 0;
    transportProgressPlayed.style.width = (fraction * 100) + '%';
  }

  playlistAudio.addEventListener('timeupdate', paintProgress);
  // Reset the line the moment a different track is loaded.
  playlistAudio.addEventListener('loadedmetadata', paintProgress);
  playlistAudio.addEventListener('emptied', paintProgress);
}


// ============================================================
//  The track title leads back to where it came from
//  Clicking it returns to the page the track was played from —
//  the way a music app takes you back to the album.
// ============================================================
transportTrackName.addEventListener('click', (event) => {
  if (!transportSourcePage) return;
  // The bar's left half toggles play/pause when clicked, so this click must
  // not carry on up to it.
  event.stopPropagation();
  navigateToPage(transportSourcePage);
});
