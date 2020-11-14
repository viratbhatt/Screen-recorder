
//buttons

const videoElement = document.querySelector('video');
const startBtn = document.getElementById('startBtn');
const videoSelectBtn = document.getElementById('videoSelectBtn');
videoSelectBtn.onclick = getVideoSources;
startBtn.onclick = e => {
    var element = videoSelectBtn;
    if(element == "Choose a Video Source")
    {
        console.log(element);
    }
    mediaRecorder.start();
    startBtn.classList.add('is-danger');
    startBtn.innerText = 'Recording';
};

const stopBtn = document.getElementById('stopBtn');
stopBtn.onclick = e => {
    mediaRecorder.stop();
    startBtn.classList.remove('is-danger');
    startBtn.innerText = 'Start';
};


const { desktopCapturer, remote} = require('electron');
const { Menu } = remote;
const { dialog } = remote;
 //electron js inbuilt module to record screen capture

async function getVideoSources() {
    const inputSources = await desktopCapturer.getSources({
      types: ['window', 'screen']
    });
  
    const videoOptionsMenu = Menu.buildFromTemplate(
      inputSources.map(source => {
        return {
          label: source.name,
          click: () => selectSource(source)
        };
      })
    );
    videoOptionsMenu.popup();
}
let mediaRecorder;
const recordedChunks = [];

async function selectSource(source) {
    videoSelectBtn.innerHTML=source.name;

    const constraints = {
        audio: false,
        video: {
            mandatory:{
                chromeMediaSource: 'desktop',
                chromeMediaSourceId: source.id
            }
        }

    };

    const stream = await navigator.mediaDevices.getUserMedia(constraints);

    videoElement.srcObject = stream;
    videoElement.play();
    // creating the media Recorder

    const options = { mimeType: 'video/webm; codecs=vp9'};
    mediaRecorder  = new MediaRecorder(stream, options);

    //register Event Handlers
    mediaRecorder.ondataavailable = handleDataAvailable;
    mediaRecorder.onstop = handleStop;
}
//capture all recorded chunks
function handleDataAvailable(e){
    console.log('video data available');
    recordedChunks.push(e.data);
}
const { writeFile } = require('fs');
async function handleStop(e){
    const blob = new Blob(recordedChunks, {
        type: 'video/webm; codecs=vp9'
    });

    const buffer = Buffer.from(await blob.arrayBuffer());

    const { filePath } = await dialog.showSaveDialog({

        buttonLabel: 'Save video',
        defaultPath: `vid-${Date.now()}.webm`
    });

    console.log(filePath);
    if(filePath){
        writeFile(filePath, buffer, () => console.log('video saved Successfully!'));
    }
}
