class Cube {
  constructor() {
    this.type='cube';
    //this.position = [0.0,0.0,0.0];
    this.color = [1.0,1.0,1.0,1.0];
    //this.size = 5.0;
    //this.segments = 10;
    this.matrix = new Matrix4();
    this.textureNum = -1;
  }

  render() {
    this.drawCube(this.matrix, rgba);
  }

  drawCube(matrix, rgba) {
    gl.uniform1i(u_whichTexture, this.textureNum);
    gl.uniformMatrix4fv(u_ModelMatrix, false, matrix.elements);

    gl.uniform4f(
      u_FragColor,
      rgba[0],
      rgba[1],
      rgba[2],
      rgba[3]
    );

    var vertices = [
      0,0,0,  1,1,0,  1,0,0,
      0,0,0,  0,1,0,  1,1,0,

      0,0,-1,  1,0,-1,  1,1,-1,
      0,0,-1,  1,1,-1,  0,1,-1,

      0,0,0,  0,0,-1,  0,1,-1,
      0,0,0,  0,1,-1,  0,1,0,

      1,0,0,  1,1,0,  1,1,-1,
      1,0,0,  1,1,-1,  1,0,-1,

      0,1,0,  0,1,-1,  1,1,-1,
      0,1,0,  1,1,-1,  1,1,0,

      0,0,0,  1,0,0,  1,0,-1,
      0,0,0,  1,0,-1,  0,0,-1
    ];

    var uv = [
      0,0, 1,1, 1,0,
      0,0, 0,1, 1,1,

      0,0, 1,0, 1,1,
      0,0, 1,1, 0,1,

      0,0, 1,0, 1,1,
      0,0, 1,1, 0,1,

      0,0, 0,1, 1,1,
      0,0, 1,1, 1,0,

      0,0, 0,1, 1,1,
      0,0, 1,1, 1,0,

      0,0, 1,0, 1,1,
      0,0, 1,1, 0,1
    ];

    drawTriangle3DUV(vertices, uv);
  }
}
