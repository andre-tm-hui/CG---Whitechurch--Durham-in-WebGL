var vs_src;
var fs_src;
var models = [];
var imgs = [];

var modelMatrix = new Matrix4();
var viewMatrix = new Matrix4();
var projMatrix = new Matrix4();
var g_normalMatrix = new Matrix4();

var angle_step = 3.0;
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
			vs_src = vs;
			loadFShaders();
		}
	});
}

var state = {
    gl: null,
    program: null,
    ui: {
      	dragging: false,
      	mouse: {
        	lastX: -1,
        	lastY: -1,
      	},
      	pressedKeys: {},
    },
    animation: {},
    app: {
      	angle: {
        	x: 0,
        	y: 0,
      	},
      	eye: {
        	x:2.,
        	y:2.,
        	z:7.,
      	},
    },
};

function loadFShaders() {
	loadTextResource('./shader.fs.glsl', function (fsErr, fs) {
		if (fsErr) {
			console.log(fsErr);
		} else {
			fs_src = fs;
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
		main();
	});
}

function main():
	state.canvas = document.getElementById('webgl');
	state.gl = getWebGLContext(state.canvas);
	if (!state.gl) {
		console.log('Failed to get the rendering context for WebGL');
		return;
	}

	/*if (!initShaders(state.gl, vs_src, fs_src)) {
		console.log('Failed to initialize shaders.');
		return;
	}*/

	initCallbacks();
	initShaders();
	initGL();
	initLighting();
	state.gl.clear(state.gl.COLOR_BUFFER_BIT | state.gl.DEPTH_BUFFER_BIT);

	var u_ViewMatrix = state.gl.getUniformLocation(state.program, 'u_ViewMatrix');
	var u_ProjMatrix = state.gl.getUniformLocation(state.program, 'u_ProjMatrix');
	viewMatrix.setLookAt(0, 0, 15, 0, 0, -100, 0, 1, 0);
	projMatrix.setPerspective(30, state.canvas.width/state.canvas.height, 1, 100);
	state.gl.uniformMatrix4fv(u_ViewMatrix, false, viewMatrix.elements);
	state.gl.uniformMatrix4fv(u_ProjMatrix, false, projMatrix.elements);

	animate();
}

function initShaders() {
	var vertexShader = state.gl.createShader(state.gl.VERTEX_SHADER);
	var fragmentShader = state.gl.createShader(state.gl.FRAGMENT_SHADER);

	state.gl.shaderSource(vertexShader, vs_src);
	state.gl.shaderSource(fragmentShader, fs_src);

	state.gl.compileShader(vertexShader);
	state.gl.compileShader(vertexShader);

	if (!state.gl.getShaderParameter(vertexShader, state.gl.COMPILE_STATUS)) {
		console.error('ERROR compiling vertex shader!', state.gl.getShaderInfoLog(vertexShader));
		return;
	}

	state.gl.compileShader(fragmentShader);
	if (!state.gl.getShaderParameter(vertexShader, state.gl.COMPILE_STATUS)) {
		console.error('ERROR compiling fragment shader!', state.gl.getShaderInfoLog(fragmentShader));
		return;
	}

	state.program = state.gl.createProgram();
	state.gl.attachShader(state.program, vertexShader);
	state.gl.attachShader(state.program, fragmentShader);
	state.gl.linkProgram(state.program);

	if (!state.gl.getProgramParameter(state.program, state.gl.LINK_STATUS)) {
		console.error('ERROR linking program!', state.gl.getProgramInfoLog(program));
		return;
	}
	state.gl.validateProgram(state.program);
	if(!state.gl.getProgramParameter(state.program, state.gl.VALIDATE_STATUS)) {
		console.error('ERROR validating program!', state.gl.getProgramInfoLog(program));
		return;
	}
	state.gl.useProgram(state.program);
}

function initGL() {
	state.gl.clearColor(1.0, 1.0, 1.0, 1.0);
	state.gl.enable(state.gl.DEPTH_TEST);
	state.gl.enable(state.gl.CULL_FACE);
	state.gl.frontFace(state.gl.CCW);
	state.gl.cullFace(state.gl.BACK);
}

function initLighting() {
	var u_LightColor = state.gl.getUniformLocation(state.program, 'u_LightColor');
	var u_LightPosition = state.gl.getUniformLocation(state.program, 'u_LightPosition');
	var u_AmbientLight = state.gl.getUniformLocation(state.program, 'u_AmbientLight');

	state.gl.uniform3f(u_LightColor, 1.0, 1.0, 1.0);
	state.gl.uniform3f(u_LightPosition, 0.0, 3.0, 4.0);
	state.gl.uniform3f(u_AmbientLight, 0.2, 0.2, 0.2);
}

function initVertexBuffers(i) {
	/*var vertices = new Float32Array(models[i].meshes[0].vertices);
	var normals = new Float32Array(models[i].meshes[0].normals);
	var indices = new Uint8Array([].concat.apply([], models[i].meshes[0].faces));*/

	var vertices = new Float32Array([   // Coordinates
	     0.5, 0.5, 0.5,  -0.5, 0.5, 0.5,  -0.5,-0.5, 0.5,   0.5,-0.5, 0.5, // v0-v1-v2-v3 front
	     0.5, 0.5, 0.5,   0.5,-0.5, 0.5,   0.5,-0.5,-0.5,   0.5, 0.5,-0.5, // v0-v3-v4-v5 right
	     0.5, 0.5, 0.5,   0.5, 0.5,-0.5,  -0.5, 0.5,-0.5,  -0.5, 0.5, 0.5, // v0-v5-v6-v1 up
	    -0.5, 0.5, 0.5,  -0.5, 0.5,-0.5,  -0.5,-0.5,-0.5,  -0.5,-0.5, 0.5, // v1-v6-v7-v2 left
	    -0.5,-0.5,-0.5,   0.5,-0.5,-0.5,   0.5,-0.5, 0.5,  -0.5,-0.5, 0.5, // v7-v4-v3-v2 down
	     0.5,-0.5,-0.5,  -0.5,-0.5,-0.5,  -0.5, 0.5,-0.5,   0.5, 0.5,-0.5  // v4-v7-v6-v5 back
	]);


	var colors = new Float32Array([    // Colors
	    1, 0, 0,   1, 0, 0,   1, 0, 0,  1, 0, 0,     // v0-v1-v2-v3 front
	    1, 0, 0,   1, 0, 0,   1, 0, 0,  1, 0, 0,     // v0-v3-v4-v5 right
	    1, 0, 0,   1, 0, 0,   1, 0, 0,  1, 0, 0,     // v0-v5-v6-v1 up
	    1, 0, 0,   1, 0, 0,   1, 0, 0,  1, 0, 0,     // v1-v6-v7-v2 left
	    1, 0, 0,   1, 0, 0,   1, 0, 0,  1, 0, 0,     // v7-v4-v3-v2 down
	    1, 0, 0,   1, 0, 0,   1, 0, 0,  1, 0, 0　    // v4-v7-v6-v5 back
	]);


	var normals = new Float32Array([    // Normal
	    0.0, 0.0, 1.0,   0.0, 0.0, 1.0,   0.0, 0.0, 1.0,   0.0, 0.0, 1.0,  // v0-v1-v2-v3 front
	    1.0, 0.0, 0.0,   1.0, 0.0, 0.0,   1.0, 0.0, 0.0,   1.0, 0.0, 0.0,  // v0-v3-v4-v5 right
	    0.0, 1.0, 0.0,   0.0, 1.0, 0.0,   0.0, 1.0, 0.0,   0.0, 1.0, 0.0,  // v0-v5-v6-v1 up
	   -1.0, 0.0, 0.0,  -1.0, 0.0, 0.0,  -1.0, 0.0, 0.0,  -1.0, 0.0, 0.0,  // v1-v6-v7-v2 left
	    0.0,-1.0, 0.0,   0.0,-1.0, 0.0,   0.0,-1.0, 0.0,   0.0,-1.0, 0.0,  // v7-v4-v3-v2 down
	    0.0, 0.0,-1.0,   0.0, 0.0,-1.0,   0.0, 0.0,-1.0,   0.0, 0.0,-1.0   // v4-v7-v6-v5 back
	]);


	  // Indices of the vertices
	var indices = new Uint8Array([
	     0, 1, 2,   0, 2, 3,    // front
	     4, 5, 6,   4, 6, 7,    // right
	     8, 9,10,   8,10,11,    // up
	    12,13,14,  12,14,15,    // left
	    16,17,18,  16,18,19,    // down
	    20,21,22,  20,22,23     // back
	 ]);

	if (!initArrayBuffer('a_Position', vertices, 3, state.gl.FLOAT)) return -1;
  	if (!initArrayBuffer('a_Color', colors, 3, state.gl.FLOAT)) return -1;
 	if (!initArrayBuffer('a_Normal', normals, 3, state.gl.FLOAT)) return -1;

 	var indexBuffer = state.gl.createBuffer();
 	if (!indexBuffer) {
 		console.log('Failed to create buffer obj');
 		return false;
 	}

 	state.gl.bindBuffer(state.gl.ELEMENT_ARRAY_BUFFER, indexBuffer);
 	state.gl.bufferData(state.gl.ELEMENT_ARRAY_BUFFER, indices, state.gl.STATIC_DRAW)

 	return indices.length;
}

function initArrayBuffer(attribute, data, num, type) {
	var buffer = state.gl.createBuffer();
	if (!buffer) {
		console.log('Failed to create buffer obj');
		return false;
	}

	state.gl.bindBuffer(state.gl.ARRAY_BUFFER, buffer);
	state.gl.bufferData(state.gl.ARRAY_BUFFER, data, state.gl.STATIC_DRAW);

	var a_attribute = state.gl.getAttribLocation(state.program, attribute);
	if (a_attribute < 0) {
		console.log('Failed to get storage location of ' + attribute);
		return false;
	}
	state.gl.vertexAttribPointer(a_attribute, num, type, false, 0, 0);
	state.gl.enableVertexAttribArray(a_attribute);
	state.gl.bindBuffer(state.gl.ARRAY_BUFFER, null);

	return true;
}

function initCallbacks() {
	document.onkeydown = keydown;
	document.onkeyup = keyup;
	state.canvas.onmousedown = mousedown;
	state.canvas.onmouseup = mouseup;
	state.canvas.onmousemove = mousemove;
}

function animate() {
	state.animation.tick = function () {
		updateState();
		draw();
		requestAnimationFrame(state.animation.tick);
	};
	state.animation.tick();
}

function updateState() {
	var speed = 0.2;
	if (state.ui.pressedKeys[37]) {
		state.app.eye.x += speed;
	} else if (state.ui.pressedKeys[39]) {
		state.app.eye.x -= speed;
	} else if (state.ui.pressedKeys[40]) {
		state.app.eye.y += speed;
	} else if (state.ui.pressedKeys[38]) {
		state.app.eye.y -= speed;
	}
}

function draw() {
	var u_ModelMatrix = state.gl.getUniformLocation(state.program, 'u_ModelMatrix');
	var u_NormalMatrix = state.gl.getUniformLocation(state.program, 'u_NormalMatrix');

	state.gl.clear(state.gl.COLOR_BUFFER_BIT | state.gl.DEPTH_BUFFER_BIT);

	var n = initVertexBuffers(0);
	if (n < 0) {
		console.log('Failed to set vertex info');
		return;
	}

	modelMatrix.setTranslate(0, 0, 0);
	modelMatrix.rotate(state.app.eye.y, 0, 1, 0);
	modelMatrix.rotate(state.app.eye.x, 1, 0, 0);

	state.gl.uniformMatrix4fv(u_ModelMatrix, false, modelMatrix.elements);
	g_normalMatrix.setInverseOf(modelMatrix);
	g_normalMatrix.transpose();
	state.gl.uniformMatrix4fv(u_NormalMatrix, false, g_normalMatrix.elements);
	state.gl.drawElements(state.gl.TRIANGLES, n, state.gl.UNSIGNED_BYTE, 0);
}

function keydown(event) {
	state.ui.pressedKeys[event.keyCode] = true;
}

function keyup(event) {
	state.ui.pressedKeys[event.keyCode] = false;
}

function mousedown(event) {
	var x = event.clientX;
	var y = event.clientY;
	var rect = event.target.getBoundingClientRect();

	if (rect.left <= x && rect.right > x && rect.top <= y && rect.bottom > y) {
		state.ui.mouse.lastX = x;
		state.ui.mouse.lastY = y;
		state.ui.dragging = true;
	}
}

function mouseup(event) {
	state.ui.dragging = false;
}

function mousemove(event) {
	var x = event.clientX;
	var y = event.clientY;
	if (state.ui.dragging) {
		var factor = 10/state.canvas.height;
		var dx = factor * (x - state.ui.mouse.lastX);
		var dy = factor * (y - state.ui.mouse.lastY);

		state.app.angle.x = state.app.angle.x + dy;
		state.app.angle.y = state.app.angle.y + dx;
	}

	state.ui.mouse.lastX = x;
	state.ui.mouse.lastY = y;
}