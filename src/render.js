const videoElement = document.querySelector("video");
const videoSelectBtn = document.getElementById("videoSelectBtn");

const startBtn = document.getElementById("startBtn");
startBtn.onclick = (e) => {
  mediaRecorder.start();
  startBtn.classList.add("is-danger");
  startBtn.innerText = "Recording";
};
const stopBtn = document.getElementById("stopBtn");

stopBtn.onclick = (e) => {
  mediaRecorder.stop();
  startBtn.classList.remove("is-danger");
  startBtn.innerText = "Start";
};
const { remote, desktopCapturer } = require("electron");

const { dialog, Menu } = remote;

const getVideoSources = async () => {
  const inputSources = await desktopCapturer.getSources({
    types: ["window", "screen"],
  });
  const videoOptionsMenu = Menu.buildFromTemplate(
    inputSources.map((source) => {
      return {
        label: source.name,
        click: () => selectSource(source),
      };
    })
  );
  videoOptionsMenu.popup();
};
videoSelectBtn.onclick = getVideoSources;
let mediaRecorder;
const recordedChunks = [];
const selectSource = async (source) => {
  videoSelectBtn.innerText = source.name;
  const constraints = {
    audio: false,
    video: {
      mandatory: {
        chromeMediaSource: "desktop",
        chromeMediaSourceId: source.id,
      },
    },
  };
  const stream = await navigator.mediaDevices.getUserMedia(constraints);
  videoElement.srcObject = stream;
  videoElement.play();
  const options = { mimeType: "video/webm; codecs=vp9" };
  mediaRecorder = new MediaRecorder(stream, options);
  mediaRecorder.ondataavailable = handleDataAvailable;
  mediaRecorder.onstop = handleStop;
};
const handleDataAvailable = (e) => {
  console.log("video data available");
  recordedChunks.push(e.data);
};
const { writeFile } = require("fs");
const handleStop = async (e) => {
  const blob = new Blob(recordedChunks, {
    type: "video/webm; codecs=vp9",
  });
  const buffer = Buffer.from(await blob.arrayBuffer());
  const { filePath } = await dialog.showSaveDialog({
    buttonLabel: "Save video",
    defaultPath: `vid-${Date.now()}.webm`,
  });
  if (filePath) {
    writeFile(filePath, buffer, () => console.log("video saved successfully!"));
  }
};
