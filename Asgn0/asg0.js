// DrawTriangle.js (c) 2012 matsuda
var canvas;
var ctx;

function main() {  
  // Retrieve <canvas> element
  canvas = document.getElementById('example');  
  if (!canvas) { 
    console.log('Failed to retrieve the <canvas> element');
    return false; 
  } 

  // Get the rendering context for 2DCG
  ctx = canvas.getContext('2d');

}
function drawVector(v, color) {
  ctx.strokeStyle = color;
  ctx.beginPath();
  ctx.moveTo(200, 200);
  ctx.lineTo(
    200 + v.elements[0] * 20,
    200 - v.elements[1] * 20
  );
  ctx.stroke();
}

function handleDrawEvent() {
  var x1 = parseFloat(document.getElementById('x1Input').value);
  var y1 = parseFloat(document.getElementById('y1Input').value);
  var x2 = parseFloat(document.getElementById('x2Input').value);
  var y2 = parseFloat(document.getElementById('y2Input').value);
  var scalar = parseFloat(document.getElementById('scalarInput').value);
  var operation = document.getElementById('operationSelect').value;
  ctx.clearRect(0, 0, canvas.width, canvas.height);
  var v1 = new Vector3([x1, y1, 0]);
  var v2 = new Vector3([x2, y2, 0]);
  drawVector(v1, 'red');
  drawVector(v2, 'blue');

  if (operation === 'add') {
    var v3 = new Vector3([x1, y1, 0]);
    v3.add(v2);
    drawVector(v3, 'green');

  } else if (operation === 'sub') {
    var v3 = new Vector3([x1, y1, 0]);
    v3.sub(v2);
    drawVector(v3, 'green');

  } else if (operation === 'mul') {
    var v3 = new Vector3([x1, y1, 0]);
    var v4 = new Vector3([x2, y2, 0]);
    v3.mul(scalar);
    v4.mul(scalar);
    drawVector(v3, 'green');
    drawVector(v4, 'green');

  } else if (operation === 'div') {
    var v3 = new Vector3([x1, y1, 0]);
    var v4 = new Vector3([x2, y2, 0]);
    v3.div(scalar);
    v4.div(scalar);
    drawVector(v3, 'green');
    drawVector(v4, 'green');

  } else if (operation === 'magnitude') {
    console.log("Magnitude of v1: " + v1.magnitude());
    console.log("Magnitude of v2: " + v2.magnitude());

  } else if (operation === 'normalize') {
    var v3 = v1.normalize();
    var v4 = v2.normalize();
    drawVector(v3, 'green');
    drawVector(v4, 'green');
    console.log("Magnitude of v3: " + v3.magnitude());
    console.log("Magnitude of v4: " + v4.magnitude());

  } else if (operation === 'angleBetween') {
  var angle = angleBetween(v1, v2);
  console.log("Angle between v1 and v2: " + angle + " degrees");

  } else if (operation === 'area') {
    var area = areaTriangle(v1, v2);
    console.log("Area of the triangle: " + area);
    
  }
}

function angleBetween(v1, v2) {
  var dot = Vector3.dot(v1, v2);
  var mag1 = v1.magnitude();
  var mag2 = v2.magnitude();
  var cosAlpha = dot / (mag1 * mag2);
  var angle = Math.acos(cosAlpha) * (180 / Math.PI);
  return angle;
}

function areaTriangle(v1, v2) {
    var cross = Vector3.cross(v1, v2);
    var area = cross.magnitude() / 2;
    return area;
}
