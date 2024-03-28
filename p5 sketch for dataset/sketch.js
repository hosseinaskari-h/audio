/*




  ██████  ▒█████   █    ██  ███▄    █ ▓█████▄     ██▓███   ▒█████   ██▀███  ▄▄▄█████▓ ██▀███   ▄▄▄       ██▓▄▄▄█████▓
▒██    ▒ ▒██▒  ██▒ ██  ▓██▒ ██ ▀█   █ ▒██▀ ██▌   ▓██░  ██▒▒██▒  ██▒▓██ ▒ ██▒▓  ██▒ ▓▒▓██ ▒ ██▒▒████▄    ▓██▒▓  ██▒ ▓▒
░ ▓██▄   ▒██░  ██▒▓██  ▒██░▓██  ▀█ ██▒░██   █▌   ▓██░ ██▓▒▒██░  ██▒▓██ ░▄█ ▒▒ ▓██░ ▒░▓██ ░▄█ ▒▒██  ▀█▄  ▒██▒▒ ▓██░ ▒░
  ▒   ██▒▒██   ██░▓▓█  ░██░▓██▒  ▐▌██▒░▓█▄   ▌   ▒██▄█▓▒ ▒▒██   ██░▒██▀▀█▄  ░ ▓██▓ ░ ▒██▀▀█▄  ░██▄▄▄▄██ ░██░░ ▓██▓ ░ 
▒██████▒▒░ ████▓▒░▒▒█████▓ ▒██░   ▓██░░▒████▓    ▒██▒ ░  ░░ ████▓▒░░██▓ ▒██▒  ▒██▒ ░ ░██▓ ▒██▒ ▓█   ▓██▒░██░  ▒██▒ ░ 
▒ ▒▓▒ ▒ ░░ ▒░▒░▒░ ░▒▓▒ ▒ ▒ ░ ▒░   ▒ ▒  ▒▒▓  ▒    ▒▓▒░ ░  ░░ ▒░▒░▒░ ░ ▒▓ ░▒▓░  ▒ ░░   ░ ▒▓ ░▒▓░ ▒▒   ▓▒█░░▓    ▒ ░░   
░ ░▒  ░ ░  ░ ▒ ▒░ ░░▒░ ░ ░ ░ ░░   ░ ▒░ ░ ▒  ▒    ░▒ ░       ░ ▒ ▒░   ░▒ ░ ▒░    ░      ░▒ ░ ▒░  ▒   ▒▒ ░ ▒ ░    ░    
░  ░  ░  ░ ░ ░ ▒   ░░░ ░ ░    ░   ░ ░  ░ ░  ░    ░░       ░ ░ ░ ▒    ░░   ░   ░        ░░   ░   ░   ▒    ▒ ░  ░      
      ░      ░ ░     ░              ░    ░                    ░ ░     ░                 ░           ░  ░ ░           
                                       ░                                                                             




*/
let video;
let oscillators = [];
let numOscillators = 4; 
let gridSize = 2; 
let soundRecorder, soundFile;
let recordButton, saveButton;
let isRecordingState = false; 

function setup() {
    createCanvas(640, 480);
    video = createCapture(VIDEO);
    video.size(640 / gridSize, 480 / gridSize);
    video.hide();

    // Initialize oscillators
    for (let i = 0; i < numOscillators; i++) {
        let osc = new p5.Oscillator('sine');
        osc.freq(440 + i * 100); //  frequency setup for distinction
        osc.start();
        osc.amp(0.1); // Reduce volume to mix multiple oscillators
        oscillators.push(osc);
    }
    soundRecorder = new p5.SoundRecorder();
    soundFile = new p5.SoundFile();
    recordButton = createButton('Record 1 Second');
    recordButton.mousePressed(startRecording);
    saveButton = createButton('Save');
    saveButton.mousePressed(saveRecording);
}

function startRecording() {
    if (!isRecordingState) {
        soundRecorder.record(soundFile);
        isRecordingState = true; 
        // Automatically stop recording after 1 second
        setTimeout(function() {
            soundRecorder.stop(); 
            isRecordingState = false; // Update the state to indicate recording has stopped
            recordButton.html('Record 1 Second');
        }, 1000); // 1000 milliseconds = 1 second
        recordButton.html('Recording...');
    }
}


function draw() {
    background(0);
    video.loadPixels();

    let regionWidth = video.width / sqrt(numOscillators);
    let regionHeight = video.height / sqrt(numOscillators);

    for (let i = 0; i < sqrt(numOscillators); i++) {
        for (let j = 0; j < sqrt(numOscillators); j++) {
            let index = i * sqrt(numOscillators) + j;
            let avgBrightness = calculateRegionAverage(i * regionWidth, j * regionHeight, regionWidth, regionHeight);
            let freq = map(avgBrightness, 0, 255, 200, 800); // Map average brightness to frequency
            oscillators[index].freq(freq);
        }
    }
}

function calculateRegionAverage(x, y, w, h) {
    let totalBrightness = 0;
    let count = 0;
    for (let i = x; i < x + w; i++) {
        for (let j = y; j < y + h; j++) {
            let index = (i + j * video.width) * 4;
            let r = video.pixels[index];
            let g = video.pixels[index + 1];
            let b = video.pixels[index + 2];
            totalBrightness += (r + g + b) / 3;
            count++;
        }
    }
    return totalBrightness / count;
}



function saveRecording() {
    if (soundFile.getBlob()) {
        saveSound(soundFile, 'test.wav'); // Save the sound file
    }
}