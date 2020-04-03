const { desktopCapturer, remote } = require('electron');
const { Menu, dialog } = remote;
const { writeFile } = require('fs');

let mediaRecorder;
const recordedChunks = [];

// DOM elements
const videoElement = document.querySelector('video');
const videoSelectBtn = document.querySelectorAll('.videoSelectBtn');
videoSelectBtn.forEach(btn => btn.addEventListener('click', getVideoSources));

const startBtn = document.querySelector('#startBtn');
startBtn.onclick = e => {
  mediaRecorder.start();
  stopBtn.disabled = null;

  startBtn.classList.add('is-danger');
};

const stopBtn = document.querySelector('#stopBtn');
stopBtn.onclick = e => {
  mediaRecorder.stop();

  startBtn.classList.remove('is-danger');
};

async function getVideoSources() {
  const inputSources = await desktopCapturer.getSources({
    types: ['window', 'screen']
  });

  const videoOptionsMenu = Menu.buildFromTemplate(
    inputSources.map(source => {
      return {
        label: source.name,
        click: () => selectSource(source)
      }
    })
  );

  videoOptionsMenu.popup();
}

// change VideoSource window to record
async function selectSource(source) {
  document.querySelector('#video-container .videoSelectBtn').style.display = 'none';
  startBtn.disabled = null;

  videoSelectBtn.innerText = source.name;

  const constraints = {
    audio: false,
    video: {
      mandatory: {
        chromeMediaSource: 'desktop',
        chromeMediaSourceId: source.id
      }
    }
  };

  // create a stream
  const stream = await navigator.mediaDevices.getUserMedia(constraints);

  // Preview the source in a video element
  videoElement.srcObject = stream;
  videoElement.play();

  // Create the Media Recorder
  const options = {
    mimeType: 'video/webm; codec=vp9'
  };
  mediaRecorder = new MediaRecorder(stream, options);

  // Register Event Handlers
  mediaRecorder.on
  mediaRecorder.ondataavailable = handleDataAvailable;
  mediaRecorder.onstop = handleStop;
}

function handleDataAvailable(e) {
  console.log('video data available');
  recordedChunks.push(e.data);
}

// saves the video file on stop
async function handleStop(e) {
  const blob = new Blob(recordedChunks, {
    type: 'video/webm; codecs=vp9'
  });

  const buffer = Buffer.from(await blob.arrayBuffer());
  const {
    filePath
  } = await dialog.showSaveDialog({
    buttonLabel: 'Save video',
    defaultPath: `vid-${Date.now()}.webm`
  });

  writeFile(filePath, buffer, () => console.log('video saved successfully!'));
}
