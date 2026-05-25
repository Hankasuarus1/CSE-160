// Model.js - simple OBJ model loader for the current Lighting project.
// This file assumes global WebGL state and attributes from lighting.js.

class Model {
  constructor(filePath) {
    this.filePath = filePath;
    this.color = [1.0, 1.0, 1.0, 1.0];
    this.matrix = new Matrix4();
    this.matrix.translate(-2.5, 2.5, -6.0);
    this.matrix.rotate(-30, 0, 0, 1);
    this.matrix.rotate(30, 0, 1, 0);
    this.matrix.rotate(-10, 1, 0, 0);
    this.matrix.scale(0.6, 0.6, 0.6);
    this.isFullyLoaded = false;
    this.vertexCount = 0;
    this.textureNum = -2;

    this.vertexBuffer = gl.createBuffer();
    this.normalBuffer = gl.createBuffer();
    this.uvBuffer = gl.createBuffer();

    this.loadOBJ(this.filePath);
  }

  async loadOBJ(path) {
    try {
      const response = await fetch(path);
      if (!response.ok) throw new Error(`Could not load file "${path}"`);
      const text = await response.text();
      this.parseOBJ(text);
      this.initBuffers();
      this.isFullyLoaded = true;
    } catch (e) {
      console.log(`Model load error: ${e}`);
    }
  }

  parseOBJ(fileContent) {
    const lines = fileContent.split(/\r?\n/);
    const tempVertices = [];
    const tempUVs = [];
    const tempNormals = [];
    const vertices = [];
    const normals = [];
    const uvs = [];

    const addVertex = token => {
      const parts = token.split('/');
      const vi = parseInt(parts[0], 10) - 1;
      const ti = parts[1] ? parseInt(parts[1], 10) - 1 : -1;
      const ni = parts[2] ? parseInt(parts[2], 10) - 1 : -1;

      if (vi < 0 || vi >= tempVertices.length) return;
      vertices.push(...tempVertices[vi]);

      if (ti >= 0 && ti < tempUVs.length) {
        uvs.push(...tempUVs[ti]);
      } else {
        uvs.push(0.0, 0.0);
      }

      if (ni >= 0 && ni < tempNormals.length) {
        normals.push(...tempNormals[ni]);
      } else {
        normals.push(0.0, 0.0, 0.0);
      }
    };

    for (const rawLine of lines) {
      const line = rawLine.trim();
      if (!line || line.startsWith('#')) continue;

      const parts = line.split(/\s+/);
      const type = parts[0];

      if (type === 'v') {
        tempVertices.push([parseFloat(parts[1]), parseFloat(parts[2]), parseFloat(parts[3])]);
      } else if (type === 'vt') {
        tempUVs.push([parseFloat(parts[1]), parseFloat(parts[2])]);
      } else if (type === 'vn') {
        tempNormals.push([parseFloat(parts[1]), parseFloat(parts[2]), parseFloat(parts[3])]);
      } else if (type === 'f') {
        const faceVerts = parts.slice(1);
        if (faceVerts.length < 3) continue;

        for (let i = 1; i < faceVerts.length - 1; i++) {
          addVertex(faceVerts[0]);
          addVertex(faceVerts[i]);
          addVertex(faceVerts[i + 1]);
        }
      }
    }

    this.vertices = new Float32Array(vertices);
    this.uvs = new Float32Array(uvs);
    this.normals = new Float32Array(normals);
    this.vertexCount = this.vertices.length / 3;

    if (this.normals.length === 0 || this.normals.every(n => n === 0)) {
      this.computeNormals();
    }
  }

  computeNormals() {
    const normals = new Float32Array(this.vertexCount * 3);
    for (let i = 0; i < this.vertexCount; i += 3) {
      const i0 = i * 3;
      const i1 = i0 + 3;
      const i2 = i0 + 6;

      const v0 = [this.vertices[i0], this.vertices[i0 + 1], this.vertices[i0 + 2]];
      const v1 = [this.vertices[i1], this.vertices[i1 + 1], this.vertices[i1 + 2]];
      const v2 = [this.vertices[i2], this.vertices[i2 + 1], this.vertices[i2 + 2]];

      const ux = v1[0] - v0[0];
      const uy = v1[1] - v0[1];
      const uz = v1[2] - v0[2];
      const vx = v2[0] - v0[0];
      const vy = v2[1] - v0[1];
      const vz = v2[2] - v0[2];

      const nx = uy * vz - uz * vy;
      const ny = uz * vx - ux * vz;
      const nz = ux * vy - uy * vx;
      const length = Math.sqrt(nx * nx + ny * ny + nz * nz) || 1;

      const nnx = nx / length;
      const nny = ny / length;
      const nnz = nz / length;

      normals[i0] = nnx;
      normals[i0 + 1] = nny;
      normals[i0 + 2] = nnz;
      normals[i1] = nnx;
      normals[i1 + 1] = nny;
      normals[i1 + 2] = nnz;
      normals[i2] = nnx;
      normals[i2 + 1] = nny;
      normals[i2 + 2] = nnz;
    }

    this.normals = normals;
  }

  initBuffers() {
    gl.bindBuffer(gl.ARRAY_BUFFER, this.vertexBuffer);
    gl.bufferData(gl.ARRAY_BUFFER, this.vertices, gl.STATIC_DRAW);

    gl.bindBuffer(gl.ARRAY_BUFFER, this.uvBuffer);
    gl.bufferData(gl.ARRAY_BUFFER, this.uvs, gl.STATIC_DRAW);

    gl.bindBuffer(gl.ARRAY_BUFFER, this.normalBuffer);
    gl.bufferData(gl.ARRAY_BUFFER, this.normals, gl.STATIC_DRAW);
  }

  render() {
    if (!this.isFullyLoaded) return;

    gl.uniform1i(u_whichTexture, this.textureNum);
    gl.uniform4fv(u_FragColor, this.color);

    gl.bindBuffer(gl.ARRAY_BUFFER, this.vertexBuffer);
    gl.vertexAttribPointer(a_Position, 3, gl.FLOAT, false, 0, 0);
    gl.enableVertexAttribArray(a_Position);

    gl.bindBuffer(gl.ARRAY_BUFFER, this.uvBuffer);
    gl.vertexAttribPointer(a_UV, 2, gl.FLOAT, false, 0, 0);
    gl.enableVertexAttribArray(a_UV);

    gl.bindBuffer(gl.ARRAY_BUFFER, this.normalBuffer);
    gl.vertexAttribPointer(a_Normal, 3, gl.FLOAT, false, 0, 0);
    gl.enableVertexAttribArray(a_Normal);

    gl.uniformMatrix4fv(u_ModelMatrix, false, this.matrix.elements);

    gl.drawArrays(gl.TRIANGLES, 0, this.vertexCount);
  }
}
