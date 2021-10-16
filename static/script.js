// Our input frames will come from here.
const videoElement = document.getElementsByClassName('input_video')[0];
const canvasElement = document.getElementsByClassName('output_canvas')[0];
const controlsElement = document.getElementsByClassName('control-panel')[0];
const canvasCtx = canvasElement.getContext('2d');
var t = 0
var count = 0
let brain;
var donecounter=0
let state = 'waiting';
let targetLabel;
var det = ['a','b','a','done']
var og_det = ['a','b','a','done']
var to_show = ['Stand','Squat', 'Stand',"done"]
var number_step = 8
var now_perform = 0
var flag1 = 0
var f1,f2,f3,f4 =0
var start_over_counter = 0
document.addEventListener('keydown', (event) => {
  if(event.key == 's'){
    brain.saveData();
  }else{
    targetLabel = event.key;
  console.log(targetLabel);
    setTimeout(function(){
      console.log('collecting');
      state = 'collecting';
      setTimeout(function(){
        console.log('not collecting');
        state = 'waiting';
      }, 10000);
  }, 10000);
  
  }
  
});

let options = {
  input: 34,
  outputs : 4,
  task: 'classification',
  debug: true
}

brain = ml5.neuralNetwork(options);
const modelInfo = {
  model: 'static/model3/model.json',
  metadata: 'static/model3/model_meta.json',
  weights: 'static/model3/model.weights.bin',
};
brain.load(modelInfo, brainLoaded);


function brainLoaded(){
  console.log('pose classification ready!');  
  classifyPose();
}

function classifyPose(){
  if(t.poseLandmarks === undefined || t == 0){
    console.log('algo')
    setTimeout(classifyPose, 100);
  }
  else{
    let inputs = []
    for(let i=0;i<t.poseLandmarks.length;i++){
      let x = t.poseLandmarks[i].x; 
      let y = t.poseLandmarks[i].y;
      inputs.push(x);
      inputs.push(y);
    }
  brain.classify(inputs, gotResult);
  }
}

function gotResult(error, results){

  let predicted = results[0].label

  if (det[det.indexOf(predicted)]=='done'){
    donecounter=donecounter+1
    if(donecounter == 10){
      console.log('Done')
    }
  }

  if (predicted==det[count] && det[count+1] != 'done'){
    now_perform =  ' '+to_show[count+1]
  }
  else if(predicted==det[count+1]||det[count+1]=='done'){
    count = count+1
  }
  else if(det[count]=='done'){
    now_perform = "Done!"
    flag1 = 1
  }
  else if ((predicted !=det[count] || predicted!=det[count+1]|| det[count] !='done' || det[count+1] !='done') && count!=det.length-1){
    now_perform = "start from Intial postion"
    count = 0
    console.log("start from Intial postion")
  }

  else {
    
  }
  flag = 0
  
    if (('done'!=det[det.indexOf(predicted)+1])&& (donecounter<9 )&& flag1 ==0 ){
      classifyPose();
    }
    else{
      now_perform = "DONE!"
    }
    //console.log(count,det[count+1],to_show[count])
    
  }
  
  


function dataReady(){
  brain.normalizeData();
  brain.train({epochs: 50}, finished);
}

function finished(){
  console.log('model trained');
  brain.save();
}


// We'll add this to our control panel later, but we'll save it here so we can
// call tick() each time the graph runs.
const fpsControl = new FPS();

// Optimization: Turn off animated spinner after its hiding animation is done.
const spinner = document.querySelector('.loading');
spinner.ontransitionend = () => {
  spinner.style.display = 'none';
};

function onResults(results) {
  t = results;
  if(state == 'collecting'){
    let inputs = []
    for(let i=0;i<t.poseLandmarks.length;i++){
      let x = t.poseLandmarks[i].x;   //t.poseLandmarks[0].x
      let y = t.poseLandmarks[i].y;
      inputs.push(x);
      inputs.push(y);
    }
    let target = [targetLabel];
  
    brain.addData(inputs, target);  
  }



  // Hide the spinner.
  document.body.classList.add('loaded');

  // Update the frame rate.
  fpsControl.tick();

  // Draw the overlays.
  canvasCtx.save();
  canvasCtx.clearRect(0, 0, canvasElement.width, canvasElement.height);


  canvasCtx.drawImage(
      results.image, 0, 0, canvasElement.width, canvasElement.height);
  drawConnectors(
      canvasCtx, results.poseLandmarks, POSE_CONNECTIONS,
      {color: '#00FF00'});
  drawLandmarks(
      canvasCtx, results.poseLandmarks,
      {color: '#00FF00', fillColor: '#FF0000', lineWidth: 4, radius: 10});    
      canvasCtx.font = "100px Arial";      
      canvasCtx.fillStyle = 'red'
    canvasCtx.fillText(now_perform, 100,75)
  canvasCtx.restore();
}




const pose = new Pose({locateFile: (file) => {
  return `https://cdn.jsdelivr.net/npm/@mediapipe/pose@0.1/${file}`;
}});

pose.onResults(onResults);



/**
 * Instantiate a camera. We'll feed each frame we receive into the solution.
 */
const camera = new Camera(videoElement, {
  onFrame: async () => {
    await pose.send({image: videoElement});
  },
  width: 1280,
  height: 720
});
camera.start();

// Present a control panel through which the user can manipulate the solution
// options.
new ControlPanel(controlsElement, {
      selfieMode: true,
      upperBodyOnly: false,
      smoothLandmarks: true,
      minDetectionConfidence: 0.5,
      minTrackingConfidence: 0.5
    })
    .add([
      new StaticText({title: ' '}),
      fpsControl,
      new Toggle({title: 'Selfie Mode', field: 'selfieMode'}),
      new Toggle({title: 'Upper-body Only', field: 'upperBodyOnly'}),
      new Toggle({title: 'Smooth Landmarks', field: 'smoothLandmarks'}),
      new Slider({
        title: 'Min Detection Confidence',
        field: 'minDetectionConfidence',
        range: [0, 1],
        step: 0.01
      }),
      new Slider({
        title: 'Min Tracking Confidence',
        field: 'minTrackingConfidence',
        range: [0, 1],
        step: 0.01
      }),
    ])
    .on(options => {
      videoElement.classList.toggle('selfie', options.selfieMode);
      pose.setOptions(options);
    });

    