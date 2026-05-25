class Sphere {
  constructor() {
    this.type='sphere';
    //this.position = [0.0,0.0,0.0];
    this.color = [1.0,1.0,1.0,1.0];
    //this.size = 5.0;
    //this.segments = 10;
    this.matrix = new Matrix4();
    this.textureNum = -1;
  }

  render() {
    this.drawSphere(this.matrix, rgba);
  }

  drawSphere(matrix, rgba) {
    gl.uniform1i(u_whichTexture, this.textureNum);
    gl.uniformMatrix4fv(u_ModelMatrix, false, matrix.elements);

    gl.uniform4f(
      u_FragColor,
      rgba[0],
      rgba[1],
      rgba[2],
      rgba[3]
    );

    var latitudeBands = 30;
    var longitudeBands = 30;
    var radius = 0.5;

    var vertices = [];
    var normals = [];
    var uv = [];
    var indices = [];

    for (var latNumber = 0; latNumber <= latitudeBands; latNumber++) {
      var theta = latNumber * Math.PI / latitudeBands;
      var sinTheta = Math.sin(theta);
      var cosTheta = Math.cos(theta);

      for (var longNumber = 0; longNumber <= longitudeBands; longNumber++) {
        var phi = longNumber * 2 * Math.PI / longitudeBands;
        var sinPhi = Math.sin(phi);
        var cosPhi = Math.cos(phi);

        var x = cosPhi * sinTheta;
        var y = cosTheta;
        var z = sinPhi * sinTheta;

        uv.push(longNumber / longitudeBands);
        uv.push(1 - latNumber / latitudeBands);

        normals.push(x);
        normals.push(y);
        normals.push(z);

        vertices.push(radius * x);
        vertices.push(radius * y);
        vertices.push(radius * z);
      }
    }

    for (var latNumber = 0; latNumber < latitudeBands; latNumber++) {
      for (var longNumber = 0; longNumber < longitudeBands; longNumber++) {
        var first = (latNumber * (longitudeBands + 1)) + longNumber;
        var second = first + longitudeBands + 1;

        indices.push(first);
        indices.push(second);
        indices.push(first + 1);

        indices.push(second);
        indices.push(second + 1);
        indices.push(first + 1);
      }
    }

    var sphereVertices = [];
    var sphereUV = [];
    var sphereNormals = [];

    for (var i = 0; i < indices.length; i++) {
      var index = indices[i];
      sphereVertices.push(vertices[3 * index]);
      sphereVertices.push(vertices[3 * index + 1]);
      sphereVertices.push(vertices[3 * index + 2]);

      sphereNormals.push(normals[3 * index]);
      sphereNormals.push(normals[3 * index + 1]);
      sphereNormals.push(normals[3 * index + 2]);

      sphereUV.push(uv[2 * index]);
      sphereUV.push(uv[2 * index + 1]);
    }

    drawTriangle3DUVNormal(sphereVertices, sphereUV, sphereNormals);
  }
}
