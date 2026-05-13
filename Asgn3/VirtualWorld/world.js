// ColoredPoint.js (c) 2012 matsuda
// Vertex shader program
var VSHADER_SOURCE = `
  attribute vec4 a_Position;
  uniform float u_Size;
  attribute vec2 a_UV;
  varying vec2 v_UV;
  uniform mat4 u_ModelMatrix;
  uniform mat4 u_GlobalRotateMatrix;
  uniform mat4 u_ViewMatrix;
  uniform mat4 u_ProjectionMatrix;
  void main() {
    gl_Position = u_ProjectionMatrix * u_ViewMatrix * u_GlobalRotateMatrix * u_ModelMatrix * a_Position;
    v_UV = a_UV;
    gl_PointSize = u_Size;
  }`

// Fragment shader program
var FSHADER_SOURCE = `
  precision mediump float;
  varying vec2 v_UV;
  uniform vec4 u_FragColor;
  uniform sampler2D u_Sampler0;
  uniform sampler2D u_Sampler1;
  uniform int u_whichTexture;
  void main() {
    if (u_whichTexture == -2) {
      gl_FragColor = u_FragColor;                         // use color
    } else if (u_whichTexture == -1) {
      gl_FragColor = vec4(v_UV, 1.0, 1.0);                // use UV debug color
    } else if (u_whichTexture == 0) {
      gl_FragColor = texture2D(u_Sampler0, v_UV);         //use texture0
    } else if (u_whichTexture == 1) {
      gl_FragColor = texture2D(u_Sampler1, v_UV);         //use texture1
    } else {
      gl_FragColor = vec4(1,0.2,0.2,1.0);                 // Error, put redish color
    }
  }`

//Global Variables
let canvas;
let gl;
let a_Position;
let a_UV;
let u_FragColor;
let u_Size;
let u_ModelMatrix;
let u_GlobalRotateMatrix;
let u_ViewMatrix;
let u_ProjectionMatrix;
let u_Sampler0;
let u_Sampler1;
let u_whichTexture;

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

  a_UV = gl.getAttribLocation(gl.program, 'a_UV');
  if (a_UV < 0) {
    console.log('Failed to get the storage location of a_UV');
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

  u_ViewMatrix = gl.getUniformLocation(gl.program, 'u_ViewMatrix');
  if (!u_ViewMatrix) {
    console.log('Failed to get the storage location of u_ViewMatrix');
    return;
  }

  u_ProjectionMatrix = gl.getUniformLocation(gl.program, 'u_ProjectionMatrix');
  if (!u_ProjectionMatrix) {
    console.log('Failed to get the storage location of u_ProjectionMatrix');
    return;
  }

  u_Sampler0 = gl.getUniformLocation(gl.program, 'u_Sampler0');
  if (!u_Sampler0) {
    console.log('Failed to get the storage location of u_Sampler0');
    return false;
  }

  u_Sampler1 = gl.getUniformLocation(gl.program, 'u_Sampler1');
  if (!u_Sampler1) {
    console.log('Failed to get the storage location of u_Sampler1');
    return false;
  }

  u_whichTexture = gl.getUniformLocation(gl.program, 'u_whichTexture');
  if (!u_whichTexture) {
    console.log('Failed to get the storage location of u_whichTexture');
    return false;
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
let g_camera;

var g_map = [
  [2,2,2,2,2,2,2,2,2,2,2,2,2,2,2,2,2,2,2,2,2,2,2,2,2,2,2,2,2,2,2,2],
  [2,0,0,0,0,0,0,0,2,0,0,0,0,0,0,0,2,0,0,0,0,0,0,0,2,0,0,0,0,0,0,2],
  [2,0,2,2,2,2,2,0,2,0,2,2,2,2,2,0,2,0,2,2,2,2,2,0,2,0,2,2,2,2,0,2],
  [2,0,2,0,0,0,2,0,0,0,2,0,0,0,2,0,0,0,2,0,0,0,2,0,0,0,2,0,0,2,0,2],
  [2,0,2,0,2,0,2,2,2,0,2,0,2,0,2,2,2,0,2,0,2,0,2,2,2,0,2,0,2,2,0,2],
  [2,0,0,0,2,0,0,0,2,0,0,0,2,0,0,0,2,0,0,0,2,0,0,0,2,0,0,0,0,0,0,2],
  [2,2,2,0,2,2,2,0,2,2,2,0,2,2,2,0,2,2,2,0,2,2,2,0,2,2,2,2,2,2,0,2],
  [2,0,0,0,0,0,2,0,0,0,0,0,0,0,2,0,0,0,0,0,0,0,2,0,0,0,0,0,0,2,0,2],
  [2,0,2,2,2,0,2,2,2,2,2,2,2,0,2,2,2,2,2,2,2,0,2,2,2,2,2,2,0,2,0,2],
  [2,0,2,0,0,0,0,0,0,0,2,0,0,0,0,0,0,0,2,0,0,0,0,0,0,0,2,0,0,0,0,2],
  [2,0,2,0,2,2,2,2,2,0,2,0,2,2,2,2,2,0,2,0,2,2,2,2,2,0,2,2,2,2,0,2],
  [2,0,0,0,2,0,0,0,2,0,0,0,2,0,0,0,2,0,0,0,2,0,0,0,2,0,0,0,0,0,0,2],
  [2,2,2,0,2,0,2,0,2,2,2,0,2,0,2,0,2,2,2,0,2,0,2,0,2,2,2,0,2,2,2,2],
  [2,0,0,0,0,0,2,0,0,0,0,0,0,0,2,0,0,0,0,0,0,0,2,0,0,0,0,0,0,0,0,2],
  [2,0,2,2,2,2,2,2,2,2,2,2,2,0,2,2,2,2,2,2,2,0,2,2,2,2,2,2,2,2,0,2],
  [2,0,0,0,0,0,0,0,0,0,0,0,2,0,0,0,0,0,0,0,2,0,0,0,0,0,0,0,0,2,0,2],
  [2,2,2,2,2,2,2,2,2,2,2,0,2,2,2,0,0,0,2,0,2,2,2,2,2,2,2,2,0,2,0,0],
  [2,0,0,0,0,0,0,0,0,0,2,0,0,0,2,0,0,0,2,0,0,0,0,0,0,0,0,2,0,0,0,2],
  [2,0,2,2,2,2,2,2,2,0,2,2,2,0,2,2,2,0,2,2,2,2,2,2,2,2,0,2,2,2,0,2],
  [2,0,0,0,0,0,0,0,2,0,0,0,2,0,0,0,2,0,0,0,0,0,0,0,0,2,0,0,0,2,0,2],
  [2,2,2,2,2,2,2,0,2,2,2,0,2,2,2,0,2,2,2,2,2,2,2,2,0,2,2,2,0,2,0,2],
  [2,0,0,0,0,0,2,0,0,0,0,0,0,0,2,0,0,0,0,0,0,0,0,2,0,0,0,2,0,0,0,2],
  [2,0,2,2,2,0,2,2,2,2,2,2,2,0,2,2,2,2,2,2,2,2,0,2,2,2,0,2,2,2,0,2],
  [2,0,0,0,2,0,0,0,0,0,0,0,2,0,0,0,0,0,0,0,0,2,0,0,0,2,0,0,0,0,0,2],
  [2,2,2,0,2,2,2,2,2,2,2,0,2,2,2,2,2,2,2,2,0,2,2,2,0,2,2,2,2,2,0,2],
  [2,0,0,0,0,0,0,0,0,0,2,0,0,0,0,0,0,0,0,2,0,0,0,2,0,0,0,0,0,2,0,2],
  [2,0,2,2,2,2,2,2,2,0,2,2,2,2,2,2,2,2,0,2,2,2,0,2,2,2,2,2,0,2,0,2],
  [2,0,0,0,0,0,0,0,2,0,0,0,0,0,0,0,0,2,0,0,0,2,0,0,0,0,0,2,0,0,0,2],
  [2,2,2,2,2,2,2,0,2,2,2,2,2,2,2,2,0,2,2,2,0,2,2,2,2,2,0,2,2,2,0,2],
  [2,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,2],
  [2,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,2],
  [2,2,2,2,2,2,2,2,2,2,2,2,2,2,2,2,2,2,2,2,2,2,2,2,2,2,2,2,2,2,2,2],
];


function addActionsForHtmlUI(){

  canvas.onmousedown = function(ev) {

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

function initTextures() {


  var dirtImage = new Image();
  var gravelImage = new Image();
  if (!dirtImage || !gravelImage) {
    console.log('Failed to create the image object');
    return false;
  }
  dirtImage.onload = function() { sendImageToTEXTURE0(dirtImage); };
  dirtImage.src = 'dirt.jpg';
  gravelImage.onload = function() { sendImageToTEXTURE1(gravelImage); };
  gravelImage.src = 'gravel.jpg';

  return true;
}

function sendImageToTEXTURE0(image) {
  var texture = gl.createTexture();
  if (!texture) {
    console.log('Failed to create the texture object');
    return false;
  }
  gl.pixelStorei(gl.UNPACK_FLIP_Y_WEBGL, 1); // Flip the image's y axis
  gl.activeTexture(gl.TEXTURE0);
  gl.bindTexture(gl.TEXTURE_2D, texture);
  gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.LINEAR);
  gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGBA, gl.RGBA, gl.UNSIGNED_BYTE, image);
  gl.uniform1i(u_Sampler0, 0);

  console.log("Dirt Texture loaded successfully.");

}

function sendImageToTEXTURE1(image) {
  var texture = gl.createTexture();
  if (!texture) {
    console.log('Failed to create the texture object');
    return false;
  }
  gl.pixelStorei(gl.UNPACK_FLIP_Y_WEBGL, 1); // Flip the image's y axis
  gl.activeTexture(gl.TEXTURE1);
  gl.bindTexture(gl.TEXTURE_2D, texture);
  gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.LINEAR);
  gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGBA, gl.RGBA, gl.UNSIGNED_BYTE, image);
  gl.uniform1i(u_Sampler1, 1);

  console.log("Gravel Texture loaded successfully.");

}

function keydown(ev) {
  if (ev.key == 'w') {
    g_camera.forward();
  } else if (ev.key == 's') {
    g_camera.back();
  } else if (ev.key == 'a') {
    g_camera.left();
  } else if (ev.key == 'd') {
    g_camera.right();
  } else if (ev.key == 'q') {
    g_camera.panLeft();
  } else if (ev.key == 'e') {
    g_camera.panRight();
  } else if (ev.key == 'f') {
    addBlockInFront();
    return;
  } else if (ev.key == 'r') {
    removeBlock();
    return;
  }

  renderScene();
}

function drawMap() {
  for (var x = 0; x < 32; x++) {
    for (var y = 0; y < 32; y++) {
      var height = g_map[x][y];

      for (var h = 0; h < height; h++) {
        var body = new Matrix4();
        body.translate(x - 16, h - 0.75, y - 16);

        var bodyCube = new Cube();

        if (h == 0) {
          bodyCube.textureNum = 1;
        } else {
          bodyCube.textureNum = 0;
        }

        bodyCube.drawCube(body, [1, 1, 1, 1]);
      }
    }
  }
}

function getBlockInFrontOfCamera() {
  var f = new Vector3(g_camera.at.elements);
  f.sub(g_camera.eye);
  f.normalize();

  var frontX = g_camera.eye.elements[0] + f.elements[0] * 2;
  var frontZ = g_camera.eye.elements[2] + f.elements[2] * 2;

  var mapX = Math.floor(frontX + 16);
  var mapY = Math.floor(frontZ + 16);

  if (mapX < 0 || mapX >= 32 || mapY < 0 || mapY >= 32) {
    return null;
  }

  return [mapX, mapY];
}

function addBlockInFront() {
  var mapPos = getBlockInFrontOfCamera();

  var x = mapPos[0];
  var y = mapPos[1];

  if (mapPos == null) {
    return;
  }
  
  var x = mapPos[0]; 
  var y = mapPos[1];

  g_map[x][y] = g_map[x][y] + 1;

  renderScene();
}

function removeBlock() {
  var mapPos = getBlockInFrontOfCamera();

  if (mapPos == null) {
    return;
  }

  var x = mapPos[0];
  var y = mapPos[1];

  if (g_map[x][y] > 0) {
    g_map[x][y] = g_map[x][y] - 1;
  }

  renderScene();
}


function main() {

  setupWebGL();
  connectVariablesToGLSL();

  addActionsForHtmlUI();
  g_camera = new Camera();
  document.onkeydown = keydown;

  canvas.onmousedown = function(ev) {
    g_mouseDown = true;
    g_lastMouseX = ev.clientX;
    g_lastMouseY = ev.clientY;
  };

canvas.onmouseup = function(ev) {
    g_mouseDown = false;
};

canvas.onmousemove = function(ev) {
  if (g_mouseDown) {
    var dx = ev.clientX - g_lastMouseX;
    var dy = ev.clientY - g_lastMouseY;

    if (dx < 0) {
      g_camera.panLeft();
    } else if (dx > 0) {
      g_camera.panRight();
    }

    if (dy < 0) {
      g_camera.panUp();
    } else if (dy > 0) {
      g_camera.panDown();
    }

    g_lastMouseX = ev.clientX;
    g_lastMouseY = ev.clientY;
    renderScene();
  }
};  


  initTextures();

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
  renderAllShapes();
  requestAnimationFrame(tick);
}


var g_shapesList = [];

// var g_points = [];  // The array for the position of a mouse press
// var g_colors = [];  // The array to store the color of a point
// var g_sizes = [];

function convertCoordinatesEventToGL(ev) {
  var x = ev.clientX; // x coordinate of a mouse pointer
  var y = ev.clientY; // y coordinate of a mouse pointer
  var rect = ev.target.getBoundingClientRect();

  x = ((x - rect.left) - canvas.width/2)/(canvas.width/2);
  y = (canvas.height/2 - (y - rect.top))/(canvas.height/2);
  return([x,y])
}

var g_eye = [0,0,3];
var g_at = [0,0,-100];
var g_up = [0,1,0];

let g_cameraSpeed = 0.2;

function renderAllShapes(){
  // Clear <canvas>
  var startTime = performance.now();


  renderScene();

  var duration = performance.now() - startTime;
  sendTextToHTML(" ms: " + Math.floor(duration) + " fps: " + Math.floor(10000/duration)/10,"numdot");
}

function renderScene() {


  var projMat = new Matrix4();
  projMat.setPerspective(50, 1*canvas.width/canvas.height, 0.1, 100);
  gl.uniformMatrix4fv(u_ProjectionMatrix, false, projMat.elements);

  var viewMat = g_camera.getViewMatrix();
  gl.uniformMatrix4fv(u_ViewMatrix, false, viewMat.elements);


  var globalRotMat = new Matrix4();
  globalRotMat.rotate(g_globalAngleY, 0, 1, 0);  // left/right
  globalRotMat.rotate(g_globalAngleX, 1, 0, 0);  // up/down
  gl.uniformMatrix4fv(u_GlobalRotateMatrix, false, globalRotMat.elements);
  gl.clear(gl.COLOR_BUFFER_BIT | gl.DEPTH_BUFFER_BIT);
  gl.clear(gl.COLOR_BUFFER_BIT);
  //Draw the body cube

  //ground plane
  var ground = new Matrix4();
  ground.translate(-50, -0.75, 50);
  ground.scale(100, 0.1, 100);
  var groundCube = new Cube();
  groundCube.textureNum = -2;
  groundCube.drawCube(ground, [0.34, 0.49, 0.27, 1.0]);

  //skybox
  var skybox = new Matrix4();
  skybox.translate(-50, -50, 50);
  skybox.scale(100, 100, 100);
  var skyboxCube = new Cube();
  skyboxCube.textureNum = -2;
  skyboxCube.drawCube(skybox, [0.5, 0.8, 1.0, 1.0]);

  drawMap();
}

function sendTextToHTML(text, htmlID) {
  var htmlElm = document.getElementById(htmlID);
  if (!htmlElm) {
    console.log("Failed to get " + htmlID + " from HTML");
    return;
  }
  htmlElm.innerHTML = text;
}


