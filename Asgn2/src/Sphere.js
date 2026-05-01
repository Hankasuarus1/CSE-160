class Sphere {
  constructor() {
    this.type = 'sphere';
    this.color = [1.0, 1.0, 1.0, 1.0];
    this.matrix = new Matrix4();
    this.segments = 10;
  }

  render() {
    this.drawSphere(this.matrix, this.color);
  }

  drawSphere(matrix, rgba) {
    gl.uniformMatrix4fv(u_ModelMatrix, false, matrix.elements);

    const rings    = this.segments;
    const segments = this.segments;

    for (let ring = 0; ring < rings; ring++) {
      let phi1 = (ring / rings) * Math.PI;
      let phi2 = ((ring + 1) / rings) * Math.PI;

      // shade rings from top to bottom for depth effect
      let brightness = 0.6 + 0.4 * Math.sin(phi1);
      gl.uniform4f(u_FragColor,
        rgba[0] * brightness,
        rgba[1] * brightness,
        rgba[2] * brightness,
        rgba[3]
      );

      for (let seg = 0; seg < segments; seg++) {
        let theta1 = (seg / segments) * 2 * Math.PI;
        let theta2 = ((seg + 1) / segments) * 2 * Math.PI;

        let p1 = [Math.sin(phi1)*Math.cos(theta1), Math.cos(phi1), Math.sin(phi1)*Math.sin(theta1)];
        let p2 = [Math.sin(phi1)*Math.cos(theta2), Math.cos(phi1), Math.sin(phi1)*Math.sin(theta2)];
        let p3 = [Math.sin(phi2)*Math.cos(theta1), Math.cos(phi2), Math.sin(phi2)*Math.sin(theta1)];
        let p4 = [Math.sin(phi2)*Math.cos(theta2), Math.cos(phi2), Math.sin(phi2)*Math.sin(theta2)];

        drawTriangle3D([...p1, ...p2, ...p3]);
        drawTriangle3D([...p2, ...p4, ...p3]);
      }
    }
  }
}