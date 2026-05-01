class Cube {
  constructor() {
    this.type='cube';
    //this.position = [0.0,0.0,0.0];
    this.color = [1.0,1.0,1.0,1.0];
    //this.size = 5.0;
    //this.segments = 10;
    this.matrix = new Matrix4();
  }

  render() {
    this.drawCube(this.matrix, rgba);
  }

  drawCube(matrix, rgba) {
    gl.uniformMatrix4fv(u_ModelMatrix, false, matrix.elements);

    const faces = [
      { verts: [
          [0,0,0,  1,1,0,  1,0,0],
          [0,0,0,  0,1,0,  1,1,0],
        ], brightness: 1.0 },  // Front  (z = 0)
      { verts: [
          [0,0,-1,  1,0,-1,  1,1,-1],
          [0,0,-1,  1,1,-1,  0,1,-1],
        ], brightness: 0.9 },  // Back   (z = -1)
      { verts: [
          [0,0, 0,  0,0,-1,  0,1,-1],
          [0,0, 0,  0,1,-1,  0,1, 0],
        ], brightness: 0.8 },  // Left   (x = 0)
      { verts: [
          [1,0,0,  1,1,0,  1,1,-1],
          [1,0,0,  1,1,-1,  1,0,-1],
        ], brightness: 0.7 },  // Right  (x = 1)
      { verts: [
          [0,1, 0,  0,1,-1,  1,1,-1],
          [0,1, 0,  1,1,-1,  1,1, 0],
        ], brightness: 0.7 },  // Top    (y = 1)
      { verts: [
          [0,0,0,  1,0,0,  1,0,-1],
          [0,0,0,  1,0,-1,  0,0,-1],
        ], brightness: 0.6 },  // Bottom (y = 0)
    ];

    for (const face of faces) {
      gl.uniform4f(
        u_FragColor,
        rgba[0] * face.brightness,
        rgba[1] * face.brightness,
        rgba[2] * face.brightness,
        rgba[3]
      );
      for (const tri of face.verts) {
        drawTriangle3D(tri);
      }
    }
  }
}
