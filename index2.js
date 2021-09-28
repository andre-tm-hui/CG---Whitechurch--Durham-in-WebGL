var VSHADER_SOURCE;
var FSHADER_SOURCE;
var models = [];
var imgs = [];

var modelMatrix = new Matrix4();
var mvpMatrix = new Matrix4();
var viewMatrix = new Matrix4();
var projMatrix = new Matrix4();
var normalMatrix = new Matrix4();
var modelTexture;

var ANGLE_STEP = 1.0;
var g_xAngle = 0.0;
var g_yAngle = 0.0;

function main() {
	loadVShaders();
}

function loadVShaders() {
	loadTextResource('./shader.vs.glsl', function (vsErr, vs) {
		if (vsErr) {
			console.log(vsErr);
		} else {
			VSHADER_SOURCE = String(vs);
			loadFShaders();
		}
	});
}

function loadFShaders() {
	loadTextResource('./shader.fs.glsl', function (fsErr, fs) {
		if (fsErr) {
			console.log(fsErr);
		} else {
			FSHADER_SOURCE = String(fs);
			loadModels('./wChurch.json');
		}
	});
}

function loadModels(src) {
	console.log('loading models');
	loadJSONResource(src, function (modelErr, model) {
		if (modelErr) {
			console.log(modelErr);
		} else {
			models.push(model);
			loadImg('./wChurchUV.png');
		}
	});
}

function loadImg(src) {
	loadImage(src, function (imgErr, img) {
		imgs.push(img);
		//loadModels(src);
		startWebGL();
	});
}

function startWebGL() {
  var canvas = document.getElementById('webgl');
  var gl = getWebGLContext(canvas);
  if (!gl) {
    console.log('Failed to get the rendering context for WebGL');
    return;
  }

  if (!initShaders(gl, VSHADER_SOURCE, FSHADER_SOURCE)) {
    console.log('Failed to intialize shaders.');
    return;
  }

  // Set clear color and enable hidden surface removal
  gl.clearColor(0.0, 0.0, 0.0, 1.0);
  gl.enable(gl.DEPTH_TEST);

  // Clear color and depth buffer
  gl.clear(gl.COLOR_BUFFER_BIT | gl.DEPTH_BUFFER_BIT);

  // Get the storage locations of uniform attributes
  var u_ModelMatrix = gl.getUniformLocation(gl.program, 'u_ModelMatrix');
  var u_MvpMatrix = gl.getUniformLocation(gl.program, 'u_MvpMatrix');
  var u_NormalMatrix = gl.getUniformLocation(gl.program, 'u_NormalMatrix');


  // Calculate the view matrix and the projection matrix
  mvpMatrix.setPerspective(30, canvas.width/canvas.height, 1, 100);
  mvpMatrix.lookAt(6, 6, 14, 0, 0, 0, 0, 1, 0);
  
  // Pass the model, view, and projection matrix to the uniform variable respectively
  normalMatrix.setInverseOf(modelMatrix);
  normalMatrix.transpose();
  gl.uniformMatrix4fv(u_NormalMatrix, false, normalMatrix.elements);

  gl.clear(gl.COLOR_BUFFER_BIT | gl.DEPTH_BUFFER_BIT);

  document.onkeydown = function(ev){
    keydown(ev, gl, u_ModelMatrix, u_MvpMatrix);
  };

  draw(gl, u_ModelMatrix, u_MvpMatrix);
}

function keydown(ev, gl, u_ModelMatrix, u_MvpMatrix) {
  switch (ev.keyCode) {
    case 40: // Up arrow key -> the positive rotation of arm1 around the y-axis
      g_xAngle = (g_xAngle + ANGLE_STEP) % 360;
      break;
    case 38: // Down arrow key -> the negative rotation of arm1 around the y-axis
      g_xAngle = (g_xAngle - ANGLE_STEP) % 360;
      break;
    case 39: // Right arrow key -> the positive rotation of arm1 around the y-axis
      g_yAngle = (g_yAngle + ANGLE_STEP) % 360;
      break;
    case 37: // Left arrow key -> the negative rotation of arm1 around the y-axis
      g_yAngle = (g_yAngle - ANGLE_STEP) % 360;
      break;
    default: return; // Skip drawing at no effective action
  }

  // Draw the scene
  draw(gl, u_ModelMatrix, u_MvpMatrix);
}

function initVertexBuffers(gl, i) {
  // Create a cube
  //    v6----- v5
  //   /|      /|
  //  v1------v0|
  //  | |     | |
  //  | |v7---|-|v4
  //  |/      |/
  //  v2------v3
  var vertices = new Float32Array(models[i].meshes[0].vertices);


  var texCoords = new Float32Array(models[i].meshes[0].texturecoords[0]);


  var normals = new Float32Array(models[i].meshes[0].normals);


  // Indices of the vertices
  var indices = new Uint8Array([].concat.apply([], models[i].meshes[0].faces));


  // Write the vertex property to buffers (coordinates, colors and normals)
  if (!initArrayBuffer(gl, 'a_Position', vertices, 3, gl.FLOAT)) return -1;
  //if (!initArrayBuffer(gl, 'a_Color', colors, 3, gl.FLOAT)) return -1;
  if (!initArrayBuffer(gl, 'a_Normal', normals, 3, gl.FLOAT)) return -1;
  if (!initArrayBuffer(gl, 'a_TexCoord', texCoords, 2, gl.FLOAT)) return -1;

  // Write the indices to the buffer object
  var indexBuffer = gl.createBuffer();
  if (!indexBuffer) {
    console.log('Failed to create the buffer object');
    return false;
  }

  gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, indexBuffer);
  gl.bufferData(gl.ELEMENT_ARRAY_BUFFER, indices, gl.STATIC_DRAW);

  modelTexture = gl.createTexture();
  gl.bindTexture(gl.TEXTURE_2D, modelTexture);
  gl.pixelStorei(gl.UNPACK_FLIP_Y_WEBGL, true);
  gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_S, gl.CLAMP_TO_EDGE);
  gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_T, gl.CLAMP_TO_EDGE);
  gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.LINEAR);
  gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MAG_FILTER, gl.LINEAR);
  gl.texImage2D(
	gl.TEXTURE_2D, 0, gl.RGBA, gl.RGBA,
	gl.UNSIGNED_BYTE,
	imgs[i]
  );
  gl.bindTexture(gl.TEXTURE_2D, null);

  return indices.length;
}

function initArrayBuffer (gl, attribute, data, num, type) {
  // Create a buffer object
  var buffer = gl.createBuffer();
  if (!buffer) {
    console.log('Failed to create the buffer object');
    return false;
  }
  // Write date into the buffer object
  gl.bindBuffer(gl.ARRAY_BUFFER, buffer);
  gl.bufferData(gl.ARRAY_BUFFER, data, gl.STATIC_DRAW);
  // Assign the buffer object to the attribute variable
  var a_attribute = gl.getAttribLocation(gl.program, attribute);
  if (a_attribute < 0) {
    console.log('Failed to get the storage location of ' + attribute);
    return false;
  }
  gl.vertexAttribPointer(a_attribute, num, type, false, 0, 0);
  // Enable the assignment of the buffer object to the attribute variable
  gl.enableVertexAttribArray(a_attribute);

  gl.bindBuffer(gl.ARRAY_BUFFER, null);

  return true;
}

function draw(gl, u_ModelMatrix, u_MvpMatrix) {
	gl.clear(gl.COLOR_BUFFER_BIT | gl.DEPTH_BUFFER_BIT);
	var n = initVertexBuffers(gl, 0);
	modelMatrix.setTranslate(0, 0, 0);
	modelMatrix.rotate(g_yAngle, 0, 1, 0);
	modelMatrix.rotate(g_xAngle, 1, 0, 0);
	gl.uniformMatrix4fv(u_ModelMatrix, false, modelMatrix.elements);
	mvpMatrix.multiply(modelMatrix);
  	gl.uniformMatrix4fv(u_MvpMatrix, false, mvpMatrix.elements);
  	gl.bindTexture(gl.TEXTURE_2D, modelTexture);
  	gl.activeTexture(gl.TEXTURE0);
	gl.drawElements(gl.TRIANGLES, n, gl.UNSIGNED_BYTE, 0);

}