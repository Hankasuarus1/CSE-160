// ColoredPoint.js (c) 2012 matsuda
// Vertex shader program
var VSHADER_SOURCE = `
  attribute vec4 a_Position;
  uniform float u_Size;
  uniform mat4 u_ModelMatrix;
  uniform mat4 u_GlobalRotateMatrix;
  void main() {
    gl_Position = u_GlobalRotateMatrix * u_ModelMatrix * a_Position;
    //gl_PointSize = 10.0;
    gl_PointSize = u_Size;
  }`

// Fragment shader program
var FSHADER_SOURCE = `
  precision mediump float;
  uniform vec4 u_FragColor;
  void main() {
    gl_FragColor = u_FragColor;
  }`

//Global Variables
let canvas;
let gl;
let a_Position;
let u_FragColor;
let u_Size;
let u_ModelMatrix;
let u_GlobalRotateMatrix;

function setupWebGL(){
  // Retrieve <canvas> element
  canvas = document.getElementById('webgl160');

  // Get the rendering context for WebGL
  //gl = getWebGLContext(canvas);
  gl = canvas.getContext("webgl", { preserveDrawingBuffer: true});
  if (!gl) {
    console.log('Failed to get the rendering context for WebGL');
    return;
  }
  gl.enable(gl.DEPTH_TEST);
}

function connectVariablesToGLSL() {
    // Initialize shaders
  if (!initShaders(gl, VSHADER_SOURCE, FSHADER_SOURCE)) {
    console.log('Failed to intialize shaders.');
    return;
  }

  // // Get the storage location of a_Position
  a_Position = gl.getAttribLocation(gl.program, 'a_Position');
  if (a_Position < 0) {
    console.log('Failed to get the storage location of a_Position');
    return;
  }

  // Get the storage location of u_FragColor
  u_FragColor = gl.getUniformLocation(gl.program, 'u_FragColor');
  if (!u_FragColor) {
    console.log('Failed to get the storage location of u_FragColor');
    return;
  }

  // Get the storage location of u_Size
  u_Size = gl.getUniformLocation(gl.program, 'u_Size');
  if (!u_Size) {
    console.log('Failed to get the storage location of u_Size');
    return;
  }

  u_ModelMatrix = gl.getUniformLocation(gl.program, 'u_ModelMatrix');
  if (!u_ModelMatrix) {
    console.log('Failed to get the storage location of u_ModelMatrix');
    return;
  }

  u_GlobalRotateMatrix = gl.getUniformLocation(gl.program, 'u_GlobalRotateMatrix');
  if (!u_GlobalRotateMatrix) {
    console.log('Failed to get the storage location of u_GlobalRotateMatrix');
    return;
  }

  var identityM = new Matrix4();
  gl.uniformMatrix4fv(u_ModelMatrix, false, identityM.elements);
}
// Constants
const POINT = 0;
const TRIANGLE = 1;
const CIRCLE = 2;

//Global Slider Variables
let g_selectedColor = [1.0,1.0,1.0,1.0];
let g_selectedSize = 5;
let g_selectedType = POINT;
let g_selectedSegments = 10;

let g_legAngle = 0;
let g_footAngle = 0;
let g_animation = false;
let g_specialAngle = 0;
let g_ctrlClickAnimation = false;
let g_ctrlClickStartTime = 0;
let g_ctrlClickDuration = 1.0;
let g_ctrlClickStartAngle = 0;

//mouse interaction variables
let g_globalAngleX = 0;  
let g_globalAngleY = 0;  
let g_mouseDown = false;
let g_lastMouseX = 0;
let g_lastMouseY = 0;

function addActionsForHtmlUI(){
  //Button Events
  document.getElementById('animationYellowOnButton').onclick = function() { g_animation = true; };
  document.getElementById('animationYellowOffButton').onclick = function() { g_animation = false; };
  //point [-0.07,-0.59], [x,-0.16]
  //triangle [x,0.065]
  //Camera Angle Slider Events
  document.getElementById('angleSlide').addEventListener('mousemove', function() { g_globalAngleY = this.value; renderAllShapes(); });
  document.getElementById('joint1Slide').addEventListener('mousemove', function() { g_footAngle = this.value; renderAllShapes(); });
  canvas.onmousedown = function(ev) {

    if (ev.ctrlKey) {
      g_ctrlClickAnimation = true;
      g_ctrlClickStartTime = g_seconds;
      g_ctrlClickStartAngle = g_globalAngleX;
      return;
    }
    g_mouseDown = true;
    g_lastMouseX = ev.clientX;
    g_lastMouseY = ev.clientY;
  };

  canvas.onmouseup = function(ev) {
    g_mouseDown = false;
  };

  canvas.onmousemove = function(ev) {
    if (!g_mouseDown) return;
    let dx = ev.clientX - g_lastMouseX;
    let dy = ev.clientY - g_lastMouseY;
    g_globalAngleY += dx * 0.5;
    g_globalAngleX += dy * 0.5;

    g_globalAngleX = Math.max(-90, Math.min(90, g_globalAngleX));

    g_lastMouseX = ev.clientX;
    g_lastMouseY = ev.clientY;
    renderScene();
  };

}
function main() {

  setupWebGL();
  connectVariablesToGLSL();

  addActionsForHtmlUI();
  
  // Register function (event handler) to be called on a mouse press
  // canvas.onmousedown = click;
  // //canvas.onmousemove = click;
  // canvas.onmousemove = function(ev) { if(ev.buttons == 1) {click(ev) } };
  // Specify the color for clearing <canvas>
  gl.clearColor(0.34, 0.49, 0.27, 1.0);

  // Clear <canvas>
  //gl.clear(gl.COLOR_BUFFER_BIT);
  renderScene();
  requestAnimationFrame(tick);
}

var g_startTime = performance.now()/1000.0;
var g_seconds = performance.now()/1000.0 - g_startTime;

function tick() {
  //console.log(performance.now());
  g_seconds = performance.now()/1000.0 - g_startTime;
  updateAnimationAngles();
  specialAnimation();
  renderAllShapes();
  requestAnimationFrame(tick);
}

function updateAnimationAngles() {
  if (g_animation) {
    g_legAngle = 10*Math.sin(2 * g_seconds);
  }
}

function specialAnimation() {
  if (!g_ctrlClickAnimation) return;

  let elapsed = g_seconds - g_ctrlClickStartTime;

  if (elapsed >= g_ctrlClickDuration) {
    g_ctrlClickAnimation = false;
    g_globalAngleX = g_ctrlClickStartAngle;
    g_legAngle = 0;
    return;
  }

  let progress = elapsed / g_ctrlClickDuration;

  g_globalAngleX = g_ctrlClickStartAngle + (progress * 360);
  g_legAngle = 45 * Math.sin(progress * Math.PI);
}
var g_shapesList = [];

// var g_points = [];  // The array for the position of a mouse press
// var g_colors = [];  // The array to store the color of a point
// var g_sizes = [];

function click(ev) {
  //Extract the event click and return it in WebGl coordinates
  let [x,y] = convertCoordinatesEventToGL(ev);

  let point;
  if (g_selectedType == POINT) {
    point = new Point();
  } else if (g_selectedType == TRIANGLE) {
    point = new Triangle();
  } else {
    point = new Circle();
  }
  point.position = [x,y];
  point.color = g_selectedColor.slice();
  point.size = g_selectedSize;
  if (g_selectedType == CIRCLE) {
    point.segments = g_selectedSegments;
  };
  g_shapesList.push(point);
  // Store the coordinates to g_points array
  // g_points.push([x, y]);
  // // Store the coordinates to g_points array
  // //g_colors.push(g_selectedColor);

  // g_colors.push(g_selectedColor.slice());

  // g_sizes.push(g_selectedSize);
  // if (x >= 0.0 && y >= 0.0) {      // First quadrant
  //   g_colors.push([1.0, 0.0, 0.0, 1.0]);  // Red
  // } else if (x < 0.0 && y < 0.0) { // Third quadrant
  //   g_colors.push([0.0, 1.0, 0.0, 1.0]);  // Green
  // } else {                         // Others
  //   g_colors.push([1.0, 1.0, 1.0, 1.0]);  // White
  // }

  renderAllShapes()
}

function convertCoordinatesEventToGL(ev) {
  var x = ev.clientX; // x coordinate of a mouse pointer
  var y = ev.clientY; // y coordinate of a mouse pointer
  var rect = ev.target.getBoundingClientRect();

  x = ((x - rect.left) - canvas.width/2)/(canvas.width/2);
  y = (canvas.height/2 - (y - rect.top))/(canvas.height/2);
  return([x,y])
}

function renderAllShapes(){
  // Clear <canvas>
  var startTime = performance.now();


  renderScene();

  var duration = performance.now() - startTime;
  sendTextToHTML(" ms: " + Math.floor(duration) + " fps: " + Math.floor(10000/duration)/10,"numdot");
}

function renderScene() {
  var globalRotMat = new Matrix4();
  globalRotMat.rotate(g_globalAngleY, 0, 1, 0);  // left/right
  globalRotMat.rotate(g_globalAngleX, 1, 0, 0);  // up/down
  gl.uniformMatrix4fv(u_GlobalRotateMatrix, false, globalRotMat.elements);
  gl.clear(gl.COLOR_BUFFER_BIT | gl.DEPTH_BUFFER_BIT);
  gl.clear(gl.COLOR_BUFFER_BIT);
    //Draw the body cube
  var bodyMatrix = new Matrix4();
  bodyMatrix.translate(-0.1, -0.3, 1);
  bodyMatrix.rotate( 0, 0, 0, 1);
  var bodyCoordinates = new Matrix4(bodyMatrix);
  bodyMatrix.scale(0.5, 0.5, 0.75);
  var body = new Cube();
  body.drawCube(bodyMatrix, [1.0,1.0,1.0,1.0]);
  
  var body2Matrix = new Matrix4();
  body2Matrix = bodyCoordinates;
  body2Matrix.translate(0.0, 0.0, -0.75);
  body2Matrix.rotate( 0, 0, 0, 1);
  body2Matrix.scale(0.5, 0.5, 0.1);
  var body2 = new Cube();
  body2.drawCube(body2Matrix, [0,0,0,1]);

  var tailMatrix = new Matrix4();
  var tailMatrix = bodyCoordinates;
  tailMatrix.translate(0.5, 0.7, 8);
  tailMatrix.scale(0.2, 0.2, 1);

  var tail = new Sphere();
  tail.segments = 12;  // optional: increase for smoother sphere
  tail.drawSphere(tailMatrix, [1, 1, 1, 1.0]);
  
  var faceMatrix = new Matrix4();
  faceMatrix = bodyCoordinates;
  faceMatrix.translate(-2, -3, -9.0001);
  faceCoordinates = new Matrix4(faceMatrix);
  faceMatrix.scale(4, 4, 2);
  var face = new Cube();
  face.drawCube(faceMatrix, [1.0,1.0,1.0,1.0]);

  var eyeMatrix = new Matrix4();
  eyeMatrix = faceCoordinates;
  eyeMatrix.translate(0.7, 2.3, -1.1);
  eyeMatrix.scale(1, 1, 1);
  var eye = new Cube();
  eye.drawCube(eyeMatrix, [0, 0, 0, 1.0]);

  var eye2Matrix = new Matrix4();
  eye2Matrix = faceCoordinates;
  eye2Matrix.translate(1.6, 0, -0.9);
  eye2Matrix.scale(1, 1, 0.1);
  var eye2 = new Cube();
  eye2.drawCube(eye2Matrix, [0, 0, 0, 1.0]);

  var noseMatrix = new Matrix4();
  noseMatrix = faceCoordinates;
  noseMatrix.translate(-1.55, -1.9, -0.9);
  noseMatrix.scale(2.5, 2, 10);
  var nose = new Cube();
  nose.drawCube(noseMatrix, [1, 1, 1, 1.0]);

  var snoutMatrix = new Matrix4();
  snoutMatrix = new Matrix4(faceCoordinates);
  snoutMatrix.translate(0.3, 0.3, -0.8);
  snoutMatrix.scale(0.4, 0.4, 0.5);
  var snout = new Cube();
  snout.drawCube(snoutMatrix, [0, 0, 0, 1.0]);

  var earMatrix = new Matrix4();
  earMatrix = faceCoordinates;
  earMatrix.translate(-0.3, 1.6, 0.4);
  earMatrix.rotate(15, 0, 0, 1);
  earMatrix.scale(0.65, 0.65, 0.5);
  var ear = new Cube();
  ear.drawCube(earMatrix, [0, 0, 0, 0]);

  var ear2Matrix = new Matrix4();
  ear2Matrix = faceCoordinates;
  ear2Matrix.translate(1.7, -0.2, 0);
  ear2Matrix.rotate(-30, 0, 0, 1);
  ear2Matrix.scale(1, 1, 1);
  var ear2 = new Cube();
  ear2.drawCube(ear2Matrix, [0, 0, 0, 0]);

  var legMatrix = new Matrix4();
  legMatrix.translate(0.124, -0.2, 0.4);
  legMatrix.scale(0.225, 0.4, 0.25);
  legMatrix.rotate(180, 0, 0, 1);
  legMatrix.rotate(g_legAngle, 1, 0, 1);
  var leg = new Cube();
  leg.drawCube(legMatrix, [0, 0, 0, 1.0]);

  var leg2Matrix = new Matrix4();
  leg2Matrix.translate(0.124, -0.2, 1);
  leg2Matrix.scale(0.225, 0.4, 0.25);
  leg2Matrix.rotate(180, 0, 0, 1);
  leg2Matrix.rotate(-g_legAngle, 1, 0, 1);
  var leg2 = new Cube();
  leg2.drawCube(leg2Matrix, [0, 0, 0, 1.0]);

  var leg3Matrix = new Matrix4();
  leg3Matrix.translate(0.40001, -0.2, 1);
  leg3Matrix.scale(0.225, 0.4, 0.25);
  leg3Matrix.rotate(180, 0, 0, 1);
  leg3Matrix.rotate(g_legAngle, 1, 0, 1);
  var leg3 = new Cube();
  leg3.drawCube(leg3Matrix, [0, 0, 0, 1.0]);

  var leg4Matrix = new Matrix4();
  leg4Matrix.translate(0.40001, -0.2, 0.4);
  leg4Matrix.scale(0.225, 0.4, 0.25);
  leg4Matrix.rotate(180, 0, 0, 1);
  leg4Matrix.rotate(-g_legAngle, 1, 0, 1);
  var leg4 = new Cube();
  leg4.drawCube(leg4Matrix, [0, 0, 0, 1.0]);

  var foot1Matrix = new Matrix4(legMatrix);
  foot1Matrix.translate(0, 1, 0);
  foot1Matrix.scale(1, 0.2, 1.2);
  foot1Matrix.rotate(g_footAngle, 1, 0, 0);
  var foot1 = new Cube();
  foot1.drawCube(foot1Matrix, [0.001, 0, 0, 1.0]);

  var foot2Matrix = new Matrix4(leg2Matrix);
  foot2Matrix.translate(0, 1, 0);
  foot2Matrix.scale(1, 0.2, 1.2);
  foot2Matrix.rotate(g_footAngle, 1, 0, 0);
  var foot2 = new Cube();
  foot2.drawCube(foot2Matrix, [0.001, 0, 0, 1.0]);

  var foot3Matrix = new Matrix4(leg3Matrix);
  foot3Matrix.translate(0, 1, 0);
  foot3Matrix.scale(1, 0.2, 1.2);
  foot3Matrix.rotate(g_footAngle, 1, 0, 0);
  var foot3 = new Cube();
  foot3.drawCube(foot3Matrix, [0.01, 0, 0, 1.0]);

  var foot4Matrix = new Matrix4(leg4Matrix);
  foot4Matrix.translate(0, 1, 0);
  foot4Matrix.scale(1, 0.2, 1.2);
  foot4Matrix.rotate(g_footAngle, 1, 0, 0);
  var foot4 = new Cube();
  foot4.drawCube(foot4Matrix, [0.01, 0, 0, 1.0]);
}

function sendTextToHTML(text, htmlID) {
  var htmlElm = document.getElementById(htmlID);
  if (!htmlElm) {
    console.log("Failed to get " + htmlID + " from HTML");
    return;
  }
  htmlElm.innerHTML = text;
}


