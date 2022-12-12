import "./styles.css";

const videoElem = document.getElementById("video");
const startElem = document.getElementById("start");
const stopElem = document.getElementById("stop");
let canvas = document.getElementById("canvas");
let output = document.getElementById("output");
let isCaptureOn = false;

// Options for getDisplayMedia()

const displayMediaOptions = {
  video: {
    cursor: "always",
  },
  audio: false,
};

// Set event listeners for the start and stop buttons
startElem.addEventListener(
  "click",
  (evt) => {
    startCapture();
  },
  false
);

stopElem.addEventListener(
  "click",
  (evt) => {
    stopCapture();
  },
  false
);

function dumpOptionsInfo() {
  const videoTrack = videoElem.srcObject.getVideoTracks()[0];
}

async function startCapture() {
  try {
    videoElem.srcObject = await navigator.mediaDevices.getDisplayMedia(
      displayMediaOptions
    );
    dumpOptionsInfo();
    isCaptureOn = true;
  } catch (err) {
    console.error(`Error: ${err}`);
  }
}

const width = 1200; // We will scale the photo width to this
let height = 0; // This will be computed based on the input stream
let streaming = false;

let previousPhoto = null;

videoElem.addEventListener(
  "canplay",
  (ev) => {
    if (!streaming) {
      height = videoElem.videoHeight / (videoElem.videoWidth / width);

      // Firefox currently has a bug where the height can't be read from
      // the video, so we will make assumptions if this happens.

      if (isNaN(height)) {
        height = width / (4 / 3);
      }

      videoElem.setAttribute("width", width);
      videoElem.setAttribute("height", height);
      canvas.setAttribute("width", width);
      canvas.setAttribute("height", height);
      // previousPhoto = new ImageData(width, height);
      streaming = true;
    }
  },
  false
);

videoElem.requestVideoFrameCallback(takeManyPicture);

function takepicture() {
  const context = canvas.getContext("2d");
  if (width && height) {
    canvas.width = width;
    canvas.height = height;
    context.drawImage(videoElem, 0, 0, width, height);

    const data = canvas.toDataURL("image/png");
    photo.setAttribute("src", data);
  } else {
    // clearphoto();
  }
}

function takeManyPicture() {
  const context = canvas.getContext("2d");
  if (width && height) {
    canvas.width = width;
    canvas.height = height;
    context.drawImage(videoElem, 0, 0, width, height);

    const data = context.getImageData(0, 0, width, height);
    if (previousPhoto == null) {
      previousPhoto = new ImageData(data.width, data.height);
    }
    // console.log(data.width, data.height);
    // console.log(width, height);
    // console.log(previousPhoto.size);
    const diff = pixelmatch(
      data.data,
      previousPhoto.data,
      null,
      data.width,
      data.height,
      { threshold: 0.1 }
    );
    previousPhoto = data;
    console.log("diff", diff);
    if (diff > 400) {
      const src = canvas.toDataURL("image/png");
      let photo = document.createElement("IMG");
      photo.setAttribute("src", src);
      output.appendChild(photo);
    }
  } else {
    // clearphoto();
  }
  videoElem.requestVideoFrameCallback(takeManyPicture);
}

function stopCapture(evt) {
  isCaptureOn = false;
  // takepicture();
  let tracks = videoElem.srcObject.getTracks();

  tracks.forEach((track) => track.stop());
  videoElem.srcObject = null;
}
function clearphoto() {
  const context = canvas.getContext("2d");
  context.fillStyle = "#AAA";
  context.fillRect(0, 0, canvas.width, canvas.height);

  const data = canvas.toDataURL("image/png");
  photo.setAttribute("src", data);
}
