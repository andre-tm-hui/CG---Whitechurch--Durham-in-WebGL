/*
1. Figure out panning/drag to rotate using a cube
2. Figure out importing models
3. Figure out lighting
*/

var VSHADER_SOURCE;
var FSHADER_SOURCE;
var canvas;
var gl;

var modelMatrix = new Matrix4;
var boxMatrix = new Matrix4;
var viewMatrix = new Matrix4;
var projMatrix = new Matrix4;
var normalMatrix = new Matrix4;

var u_ModelMatrix;
var u_ViewMatrix;
var u_ProjMatrix;
var u_NormalMatrix;
var u_LightColor;
var u_AmbientLight;
var u_LightDirection;
var u_StreetLightColor;
var u_StreetLightPosition;
var u_StreetLightDirection;
var u_StreetLightInnerLimit;
var u_StreetLightOuterLimit;

var state = {
	ui: {
		dragging: false,
		mouse: {
			lastX: -1,
			lastY: -1,
		},
		pressedKeys: {},
		lastScroll: 0,
		followLight: true,
		streetLight: true,
	},
	animation: {},
	app: {
		eye: {
			xAngle: -0.25 * Math.PI,
			yAngle: 0.2 * Math.PI,
			distance: 20,
		},
		lookAt: {
			x: -1.3,
			y: -1,
			z: 0,
		}
	},
	door: {
		angle: 0,
		xOffset: 0,
		zOffset: 0,
		opening: true,
		animate: false,
	},
	dumpster: {
		angle: 0,
		yOffset: 0,
		zOffset: 0,
		opening: true,
		animate: false,
	},
};

var carState = {
	animate: true,
	x: 4.8,
	z: 1.5,
	angle: -352,
	checkpoint: 1,
	xPassed: false,
	zPassed: false,
	wheelAngle: 0,
	checkpoints: {
		1: {
			x: 4.8,
			z: 1.5,
			angle: -330.255,
			targetAngle: -352,
		},
		2: {
			x: 5.5,
			z: -2.5,
			angle: -352,
			targetAngle: 0,
		},
		3: {
			x: 5.5,
			z: -3.1,
			angle: 0,
			targetAngle: -26.565,
		},
		4: {
			x: 5.25,
			z: -3.6,
			angle: -26.565,
			targetAngle: -56.310,
		},
		5: {
			x: 4.8,
			z: -3.9,
			angle: -56.310,
			targetAngle: -76.430,
		},
		6: {
			x: -3.9,
			z: -6.0,
			angle: -76.430,
			targetAngle: -85.914,
		},
		7: {
			x: -4.6,
			z: -6.05,
			angle: -85.914,
			targetAngle: -147.995,
		},
		8: {
			x: -5.0,
			z: -5.8,
			angle: -147.995,
			targetAngle: -161.565,
		},
		9: {
			x: -5.2,
			z: -5.2,
			angle: -161.565,
			targetAngle: -167.093,
		},
		10: {
			x: -6.85,
			z: 2.2,
			angle: -167.093,
			targetAngle: -180,
		},
		11: {
			x: -6.85,
			z: 2.8,
			angle: -180,
			targetAngle: -210.256,
		},
		12: {
			x: -6.5,
			z: 3.4,
			angle: -210.256,
			targetAngle: -246.801,
		},
		13: {
			x: -5.8,
			z: 3.7,
			angle: -246.801,
			targetAngle: -263.581,
		},
		14: {
			x: -1.8,
			z: 4.15,
			angle: -263.581,
			targetAngle: -280.713,
		},
		15: {
			x: 1.9,
			z: 3.45,
			angle: -280.713,
			targetAngle: -292.620,
		},
		16: {
			x: 3.7,
			z: 2.7,
			angle: -292.620,
			targetAngle: -305.538,
		},
		17: {
			x: 4.4,
			z: 2.2,
			angle: -305.538,
			targetAngle: -330.255,
		},
	},
}

var pointLights = [
	{x: 0.2, y: 2.5, z: 3.0},
	{x: -3.95, y: 2.5, z: -4.55},
	{x: -5.9, y: 2.5, z: 1.1},
	{x: 4.45, y: 2.5, z: -1.45},
]

var objectsToDraw = []

function load() {
	loadTextResource('./shader.vs.glsl', function (vsErr, vs) {
		if (vsErr) {
			console.log(vsErr);
		} else {
			VSHADER_SOURCE = String(vs);
			loadTextResource('./shader.fs.glsl', function (fsErr, fs) {
				if (fsErr) {
					console.log(fsErr);
				} else {
					FSHADER_SOURCE = String(fs);
					loadModels();
				}
			});
		}
	});
}

function loadModels() {
	loadJSONResource('./wChurch.json', function (modelErr, model) {
		if (modelErr) {
			console.log(modelErr);
		} else {
			loadImage('./wChurchUV.png', function (imgErr, img) {
				if (imgErr) {
					console.log(imgErr);
				} else {
					objectsToDraw.push({model: model, img: img});
					loadJSONResource('./pavement.json', function (modelErr, model) {
						if (modelErr) {
							console.log(modelErr);
						} else {
							loadImage('./pavement.png', function (imgErr, img) {
								if (imgErr) {
									console.log(imgErr);
								} else {
									objectsToDraw.push({model: model, img: img});
									loadJSONResource('./road.json', function (modelErr, model) {
										if (modelErr) {
											console.log(modelErr);
										} else {
											loadImage('./road.png', function (imgErr, img) {
												if (imgErr) {
													console.log(imgErr);
												} else {
													objectsToDraw.push({model: model, img: img});
													loadJSONResource('./car.json', function (modelErr, model) {
														if (modelErr) {
															console.log(modelErr);
														} else {
															loadImage('./car.png', function (imgErr, img) {
																if (imgErr) {
																	console.log(imgErr);
																} else {
																	objectsToDraw.push({model: model, img: img});
																	loadJSONResource('./wheel.json', function (modelErr, model) {
																		if (modelErr) {
																			console.log(modelErr);
																		} else {
																			loadImage('./wheel.png', function (imgErr, img) {
																				if (imgErr) {
																					console.log(imgErr);
																				} else {
																					objectsToDraw.push({model: model, img: img});
																					loadJSONResource('./streetlight.json', function (modelErr, model) {
																						if (modelErr) {
																							console.log(modelErr);
																						} else {
																							loadImage('./streetlight.png', function (imgErr, img) {
																								if (imgErr) {
																									console.log(imgErr);
																								} else {
																									objectsToDraw.push({model: model, img: img});
																									loadTextures();
																								}
																							});
																						}
																					});
																				}
																			});
																		}
																	});
																}
															});
														}
													});
												}
											});
										}
									});
								}
							});
						}
					});
				}
			});
		}
	});
}

function loadTextures() {
	loadImage('./door.png', function (imgErr, img) {
		if (imgErr) {
			console.log(imgErr);
		} else {
			objectsToDraw.push({img: img});
			loadImage('./dumpster.png', function (imgErr, img) {
				if (imgErr) {
					console.log(imgErr);
				} else {
					objectsToDraw.push({img: img});
					main();
				}
			});
		}
	});
}

function main() {
	canvas = document.getElementById('webgl');
	gl = getWebGLContext(canvas);

	if (!initShaders(gl, VSHADER_SOURCE, FSHADER_SOURCE)) {
		console.log('Shaders failure');
		return;
	}

	gl.clearColor(0.0, 0.0, 0.03, 1.0);
	gl.clear(gl.COLOR_BUFFER_BIT | gl.DEPTH_BUFFER_BIT);
	gl.enable(gl.DEPTH_TEST);
	gl.enable(gl.CULL_FACE);
	gl.frontFace(gl.CCW);
	gl.cullFace(gl.BACK);

	u_ModelMatrix = gl.getUniformLocation(gl.program, 'u_ModelMatrix');
	u_ViewMatrix = gl.getUniformLocation(gl.program, 'u_ViewMatrix');
	u_ProjMatrix = gl.getUniformLocation(gl.program, 'u_ProjMatrix');
	u_NormalMatrix = gl.getUniformLocation(gl.program, 'u_NormalMatrix');
	u_LightColor = gl.getUniformLocation(gl.program, 'u_LightColor');
	u_StreetLightDirection = gl.getUniformLocation(gl.program, 'u_StreetLightDirection');
	u_LightDirection = gl.getUniformLocation(gl.program, 'u_LightDirection');
	u_StreetLightPosition = gl.getUniformLocation(gl.program, 'u_StreetLightPosition');
	u_StreetLightColor = gl.getUniformLocation(gl.program, 'u_StreetLightColor');
	u_AmbientLight = gl.getUniformLocation(gl.program, 'u_AmbientLight');
	u_StreetLightInnerLimit = gl.getUniformLocation(gl.program, 'u_StreetLightInnerLimit');
	u_StreetLightOuterLimit = gl.getUniformLocation(gl.program, 'u_StreetLightOuterLimit');

	gl.uniform3f(u_LightColor, 0.4, 0.4, 0.4);
	gl.uniform3f(u_AmbientLight, 0.1, 0.1, 0.1);
	gl.uniform3f(u_StreetLightColor, 0.7, 0.6, 0.6);
	gl.uniform1f(u_StreetLightInnerLimit, Math.cos(20*Math.PI/180));
	gl.uniform1f(u_StreetLightOuterLimit, Math.cos(45*Math.PI/180));
	gl.uniform3f(u_StreetLightDirection, 0, -50, 0);

	var lightPositions = []
	for (i = 0; i < 4; i++) {
		u_StreetLightPosition = gl.getUniformLocation(gl.program, "u_StreetLightPosition[" + i.toString() + "]");
		gl.uniform3f(u_StreetLightPosition, pointLights[i].x, pointLights[i].y, pointLights[i].z);
	}

	projMatrix.setPerspective(30, canvas.width/canvas.height, 1, 100);
	
	gl.uniformMatrix4fv(u_ProjMatrix, false, projMatrix.elements);

	initTextures();
	initCallbacks();
	animate();
}

function initTextures() {
	for (var i = 0; i < objectsToDraw.length; i ++) {
		var texture = gl.createTexture();
		gl.bindTexture(gl.TEXTURE_2D, texture);
	    gl.pixelStorei(gl.UNPACK_FLIP_Y_WEBGL, true);
	    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_S, gl.CLAMP_TO_EDGE);
	    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_T, gl.CLAMP_TO_EDGE);
	    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.LINEAR);
	    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MAG_FILTER, gl.LINEAR);
	    gl.texImage2D(
			gl.TEXTURE_2D, 0, gl.RGBA, gl.RGBA,
			gl.UNSIGNED_BYTE,
			objectsToDraw[i].img
	    );
	  	objectsToDraw[i].texture = texture;
	  	gl.bindTexture(gl.TEXTURE_2D, null);
	}
}

function initVertexBuffers(i) {
	var vertices = new Float32Array(objectsToDraw[i].model.meshes[0].vertices);
	var texCoords = new Float32Array(objectsToDraw[i].model.meshes[0].texturecoords[0]);
	var normals = new Float32Array(objectsToDraw[i].model.meshes[0].normals);
	var indices = new Uint16Array([].concat.apply([], objectsToDraw[i].model.meshes[0].faces));

	if(!initArrayBuffer('a_Position', vertices, 3, gl.FLOAT)) return -1;
	if(!initArrayBuffer('a_Normal', normals, 3, gl.FLOAT)) return -1;
	if(!initArrayBuffer('a_TexCoord', texCoords, 2, gl.FLOAT)) return -1;

	var indexBuffer = gl.createBuffer();
	gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, indexBuffer);
	gl.bufferData(gl.ELEMENT_ARRAY_BUFFER, indices, gl.STATIC_DRAW);

  	return indices.length;
}

function initBoxVertexBuffers() {
	var vertices = new Float32Array([   // Coordinates
	     0.5, 0.5, 0.5,  -0.5, 0.5, 0.5,  -0.5,-0.5, 0.5,   0.5,-0.5, 0.5, // v0-v1-v2-v3 front
	     0.5, 0.5, 0.5,   0.5,-0.5, 0.5,   0.5,-0.5,-0.5,   0.5, 0.5,-0.5, // v0-v3-v4-v5 right
	     0.5, 0.5, 0.5,   0.5, 0.5,-0.5,  -0.5, 0.5,-0.5,  -0.5, 0.5, 0.5, // v0-v5-v6-v1 up
	    -0.5, 0.5, 0.5,  -0.5, 0.5,-0.5,  -0.5,-0.5,-0.5,  -0.5,-0.5, 0.5, // v1-v6-v7-v2 left
	    -0.5,-0.5,-0.5,   0.5,-0.5,-0.5,   0.5,-0.5, 0.5,  -0.5,-0.5, 0.5, // v7-v4-v3-v2 down
	     0.5,-0.5,-0.5,  -0.5,-0.5,-0.5,  -0.5, 0.5,-0.5,   0.5, 0.5,-0.5  // v4-v7-v6-v5 back
  	]);

  	var normals = new Float32Array([    // Normal
	    0.0, 0.0, 1.0,   0.0, 0.0, 1.0,   0.0, 0.0, 1.0,   0.0, 0.0, 1.0,  // v0-v1-v2-v3 front
	    1.0, 0.0, 0.0,   1.0, 0.0, 0.0,   1.0, 0.0, 0.0,   1.0, 0.0, 0.0,  // v0-v3-v4-v5 right
	    0.0, 1.0, 0.0,   0.0, 1.0, 0.0,   0.0, 1.0, 0.0,   0.0, 1.0, 0.0,  // v0-v5-v6-v1 up
	    -1.0, 0.0, 0.0,  -1.0, 0.0, 0.0,  -1.0, 0.0, 0.0,  -1.0, 0.0, 0.0,  // v1-v6-v7-v2 left
	    0.0,-1.0, 0.0,   0.0,-1.0, 0.0,   0.0,-1.0, 0.0,   0.0,-1.0, 0.0,  // v7-v4-v3-v2 down
	    0.0, 0.0,-1.0,   0.0, 0.0,-1.0,   0.0, 0.0,-1.0,   0.0, 0.0,-1.0   // v4-v7-v6-v5 back
  	]);

  	var indices = new Uint16Array([
	     0, 1, 2,   0, 2, 3,    // front
	     4, 5, 6,   4, 6, 7,    // right
	     8, 9,10,   8,10,11,    // up
	    12,13,14,  12,14,15,    // left
	    16,17,18,  16,18,19,    // down
	    20,21,22,  20,22,23     // back
 	]);

  	if (!initArrayBuffer('a_Position', vertices, 3, gl.FLOAT)) return -1;
  	if (!initArrayBuffer('a_Normal', normals, 3, gl.FLOAT)) return -1;

  	var indexBuffer = gl.createBuffer();
  	if (!indexBuffer) {
    	console.log('Failed to create the buffer object');
    	return false;
  	}

  	gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, indexBuffer);
  	gl.bufferData(gl.ELEMENT_ARRAY_BUFFER, indices, gl.STATIC_DRAW);

  	return indices.length;
}

function initArrayBuffer(attribute, data, num, type) {
	var buffer = gl.createBuffer();
	gl.bindBuffer(gl.ARRAY_BUFFER, buffer);
	gl.bufferData(gl.ARRAY_BUFFER, data, gl.STATIC_DRAW);
	var a_attribute = gl.getAttribLocation(gl.program, attribute);
	if (a_attribute < 0) {
		console.log('Failed to get ' + attribute + ' location');
		return false;
	}
	gl.vertexAttribPointer(a_attribute, num, type, false, 0, 0);
	gl.enableVertexAttribArray(a_attribute);
	gl.bindBuffer(gl.ARRAY_BUFFER, null);
	return true;
}

function view() {
	viewMatrix = new Matrix4;
	var xyz = getViewXYZ();
	viewMatrix.setLookAt(xyz[0], xyz[1], xyz[2], state.app.lookAt.x, state.app.lookAt.y, state.app.lookAt.z, 0, 1, 0);
	if (state.ui.followLight) {
		gl.uniform3f(u_LightDirection, xyz[0], xyz[1], xyz[2]);
	}
	gl.uniformMatrix4fv(u_ViewMatrix, false, viewMatrix.elements);
}

function drawModels() {
	drawModel(0, 0, 0, 0, -90, 0, 0, 1, 1.5, 1);
	drawModel(1, 0.5, -1.38, -1.1, -90, 0, 166, 1, 0.9, 1);
	drawModel(2, 0.75, -1.48, -1.2, -90, 0, 166, 1.35, 1.35, 1.2);
	drawModel(5, 0, -1, 2.7, -90, 0, -75, 0.07, 0.07, 0.28);
	drawModel(5, -3.8, -1, -4.4, -90, 0, 125, 0.07, 0.07, 0.28);
	drawModel(5, -5.5, -1, 1.1, -90, 0, 180, 0.07, 0.07, 0.28);
	drawModel(5, 4.2, -1, -1.5, -90, 0, -12, 0.07, 0.07, 0.28);

	//static car
	drawModel(3, -0.3, -0.9, -3.1, 0, 90, 0, 0.265, 0.265, 0.265);
	drawModel(4, 0.02, -1.14, -2.25, 0, 90, 0, 0.23, 0.23, 0.23);
	drawModel(4, 0.02, -1.14, -3.97, 0, 90, 0, 0.23, 0.23, 0.23);
	drawModel(4, -0.62, -1.14, -2.25, 0, 90, 0, 0.23, 0.23, 0.23);
	drawModel(4, -0.62, -1.14, -3.97, 0, 90, 0, 0.23, 0.23, 0.23);

	//driving car
	drawModel(3, carState.x, -1.0, carState.z, 0, 90 - carState.angle, 0, 0.265, 0.265, 0.265);
	drawWheel(0.32, 0.85, 90 - carState.angle);
	drawWheel(0.32, -0.87, 90 - carState.angle);
	drawWheel(-0.32, 0.85, 90 - carState.angle);
	drawWheel(-0.32, -0.87, 90 - carState.angle);
}

function drawModel(i, xt, yt, zt, xr, yr, zr, xs, ys, zs) {
	var n = initVertexBuffers(i);
	if (n < 0) {
		console.log('Failed to initialize vertex buffers');
		return;
	}

	modelMatrix.setTranslate(xt, yt, zt);
	modelMatrix.rotate(xr, 1, 0, 0);
	modelMatrix.rotate(yr, 0, 1, 0);
	modelMatrix.rotate(zr, 0, 0, 1);
	modelMatrix.scale(xs, ys, zs);
	
	gl.uniformMatrix4fv(u_ModelMatrix, false, modelMatrix.elements);
	normalMatrix.setInverseOf(modelMatrix);
	normalMatrix.transpose();
	gl.uniformMatrix4fv(u_NormalMatrix, false, normalMatrix.elements);

	gl.activeTexture(gl.TEXTURE0);
	gl.bindTexture(gl.TEXTURE_2D, objectsToDraw[i].texture);
	
	gl.drawElements(gl.TRIANGLES, n, gl.UNSIGNED_SHORT, 0);
}

function drawWheel(xt, zt, yr) {
	var n = initVertexBuffers(4);
	if (n < 0) {
		console.log('Failed to initialize vertex buffers');
		return;
	}

	modelMatrix.setTranslate(carState.x, -1.24, carState.z);
	modelMatrix.rotate(yr, 0, 1, 0);
	modelMatrix.translate(zt, 0, xt);
	modelMatrix.rotate(-carState.wheelAngle, 0, 0, 1);
	modelMatrix.scale(0.23, 0.23, 0.23);

	gl.uniformMatrix4fv(u_ModelMatrix, false, modelMatrix.elements);
	normalMatrix.setInverseOf(modelMatrix);
	normalMatrix.transpose();
	gl.uniformMatrix4fv(u_NormalMatrix, false, normalMatrix.elements);

	gl.activeTexture(gl.TEXTURE0);
	gl.bindTexture(gl.TEXTURE_2D, objectsToDraw[4].texture);
	
	gl.drawElements(gl.TRIANGLES, n, gl.UNSIGNED_SHORT, 0);
}

var matrixStack = [];
function pushMatrix(m) {
	var m2 = new Matrix4(m);
	matrixStack.push(m2);
}

function popMatrix() {
	return matrixStack.pop();
}

function drawBoxes() {
	var n = initBoxVertexBuffers();
	if (n < 0) {
		console.log('Failed to initialize box');
		return;
	}

	modelMatrix.setTranslate(0, 0, 0);
	modelMatrix.setRotate(0, 1, 1, 1);

	//door
	gl.activeTexture(gl.TEXTURE0);
	gl.bindTexture(gl.TEXTURE_2D, objectsToDraw[6].texture);
	pushMatrix(modelMatrix);
		modelMatrix.translate(-2.49 - state.door.xOffset, -1.03, 1.25 - state.door.zOffset);
		modelMatrix.rotate(0 + state.door.angle, 0, 1, 0);
		modelMatrix.scale(0.37, 0.9, 0.05);
		drawBox(n);
	modelMatrix = popMatrix();

	//dumpster
	gl.activeTexture(gl.TEXTURE0); //back
	gl.bindTexture(gl.TEXTURE_2D, objectsToDraw[7].texture);
	pushMatrix(modelMatrix);
		modelMatrix.translate(-1.7, -1.03, -1.9);
		modelMatrix.scale(1.2, 0.6, 0.1);
		drawBox(n);
	modelMatrix = popMatrix();

	pushMatrix(modelMatrix); //front
		modelMatrix.translate(-1.7, -1.03, -2.3);
		modelMatrix.scale(1.2, 0.6, 0.1);
		drawBox(n);
	modelMatrix = popMatrix();

	pushMatrix(modelMatrix); //bottom
		modelMatrix.translate(-1.7, -1.23, -2.1);
		modelMatrix.scale(1.2, 0.1, 0.4);
		drawBox(n);
	modelMatrix = popMatrix();

	pushMatrix(modelMatrix); //left
		modelMatrix.translate(-1.15, -1.03, -2.1);
		modelMatrix.scale(0.1, 0.6, 0.4);
		drawBox(n);
	modelMatrix = popMatrix();

	pushMatrix(modelMatrix); //right
		modelMatrix.translate(-2.25, -1.03, -2.1);
		modelMatrix.scale(0.1, 0.6, 0.4);
		drawBox(n);
	modelMatrix = popMatrix();

	pushMatrix(modelMatrix); //top
		modelMatrix.translate(-1.7, -0.7 + state.dumpster.yOffset, -2.1 + state.dumpster.zOffset);
		modelMatrix.rotate(state.dumpster.angle, 1, 0, 0);
		modelMatrix.scale(1.25, 0.1, 0.55);
		drawBox(n);
	modelMatrix = popMatrix();
}

function drawBox(n) {
	pushMatrix(modelMatrix);
		gl.uniformMatrix4fv(u_ModelMatrix, false, modelMatrix.elements);
		normalMatrix.setInverseOf(modelMatrix);
		normalMatrix.transpose();
		gl.uniformMatrix4fv(u_NormalMatrix, false, normalMatrix.elements);
		gl.drawElements(gl.TRIANGLES, n, gl.UNSIGNED_SHORT, 0);
	modelMatrix = popMatrix();
}

function draw() {
	gl.clear(gl.COLOR_BUFFER_BIT | gl.DEPTH_BUFFER_BIT);
	view();
	drawModels();
	drawBoxes();
}




//
// Animating moving objects
//
function animate() {
	state.animation.tick = function() {
		updateState();
		draw();
		requestAnimationFrame(state.animation.tick);
		if (state.door.animate) {door();}
		if (state.dumpster.animate) {dumpster();}
		if (carState.animate) {car();}
	};
	state.animation.tick();
}

function door() {
	if (state.door.angle <= -140) {
		state.door.opening = false;
		state.door.animate = false;
	} else if (state.door.angle >= 0) {
		state.door.opening = true;
		state.door.animate = false;
	}
	if (state.door.opening) {
		state.door.angle -= 1;
	} else {
		state.door.angle += 1;
	}


	var theta = state.door.angle * Math.PI / 360;
	var hyp = 0.6 * Math.sin(theta/2);
	state.door.xOffset = hyp * Math.sin(theta);
	state.door.zOffset = hyp * Math.cos(theta);
}

function dumpster() {
	if (state.dumpster.angle <= 0) {
		state.dumpster.opening = true;
		state.dumpster.animate = false;
	} else if (state.dumpster.angle >= 60) {
		state.dumpster.opening = false;
		state.dumpster.animate = false;
	}
	if (state.dumpster.opening) {
		state.dumpster.angle += 1;
	} else {
		state.dumpster.angle -= 1;
	}

	var theta = state.dumpster.angle * Math.PI / 360;
	var hyp = 0.9 * Math.sin(theta/2);
	state.dumpster.zOffset = hyp * Math.sin(theta);
	state.dumpster.yOffset = hyp * Math.cos(theta);
}

function car() {
	var speed = 0.15;
	var i = carState.checkpoint;
	var j;
	if (i == 17) {
		j = 1;
	} else {
		j = i + 1;
	}
	var dirVec = [carState.checkpoints[j].x - carState.checkpoints[i].x, carState.checkpoints[j].z - carState.checkpoints[i].z];
	var sumOfSqs = (dirVec[0]*dirVec[0]) + (dirVec[1]*dirVec[1]);
	var unitVec = [(dirVec[0]/Math.sqrt(sumOfSqs)), (dirVec[1]/Math.sqrt(sumOfSqs))];

	var xMin = carState.x;
	var xMax = carState.x + speed * unitVec[0];
	if (xMin > xMax) {
		xMax = carState.x;
		xMin = carState.x + speed * unitVec[0];
	}

	var zMin = carState.z;
	var zMax = carState.z + speed * unitVec[1];
	if (zMin > zMax) {
		zMax = carState.z;
		zMin = carState.z + speed * unitVec[1];
	}

	if (carState.checkpoints[j].x >= xMin && carState.checkpoints[j].x <= xMax) {
		carState.xPassed = true;
	}
	if (carState.checkpoints[j].z >= zMin && carState.checkpoints[j].z <= zMax) {
		carState.zPassed = true;
	}

	if (carState.xPassed && carState.zPassed) {
		carState.xPassed = false;
		carState.zPassed = false;
		carState.x = carState.checkpoints[j].x;
		carState.z = carState.checkpoints[j].z;
		carState.checkpoint = j;
		//carState.angle = carState.checkpoints[j].targetAngle;
	} else {
		carState.x += speed*unitVec[0];
		carState.z += speed*unitVec[1];
	}

	carState.angle -= 6;
	carState.wheelAngle += 12;
	if (carState.checkpoints[j].angle == 0) {
		if (carState.angle <= -360) {
			carState.angle == 0;
		}
	} else {
		if (carState.angle%360 < carState.checkpoints[i].targetAngle) {
			carState.angle = carState.checkpoints[i].targetAngle;
		}
	}
}





//
//	Look/Camera functions;
//
function initCallbacks() {
	document.onkeydown = keydown;
	document.onkeyup = keyup;
	canvas.onmousedown = mousedown;
	canvas.onmouseup = mouseup;
	canvas.onmousemove = mousemove;
	canvas.onwheel = onwheel;
}

function updateState() {
	speed = 0.07;
	if (state.ui.pressedKeys[38]) { //up
		state.app.eye.distance -= speed;
	} else if (state.ui.pressedKeys[40]) { //down
		state.app.eye.distance += speed;
	} else if (state.ui.pressedKeys[68]) { //D
		state.door.animate = true;
	} else if (state.ui.pressedKeys[84]) { //T
		state.dumpster.animate = true;
	} else if (state.ui.pressedKeys[82]) { //R
		state.app.lookAt.x = -1.3;
		state.app.lookAt.y = -1;
		state.app.lookAt.z = 0;
		state.app.eye.xAngle = 0;
		state.app.eye.yAngle = 0;
	}
}

function keydown(event) {
	state.ui.pressedKeys[event.keyCode] = true;
	if (event.keyCode == 32) { //Spacebar
		carState.animate = !carState.animate;
	} else if (event.keyCode == 76) { //L
		state.ui.followLight = !state.ui.followLight;
	} else if (event.keyCode == 83) { //S
		if (state.ui.streetLight) {
			gl.uniform3f(u_StreetLightColor, 0, 0, 0);
		} else {
			gl.uniform3f(u_StreetLightColor, 0.7, 0.6, 0.6);
		}
		state.ui.streetLight = !state.ui.streetLight;
	}
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
		if (!state.ui.pressedKeys[17]){
			var factor = 0.005;
			var dx = factor * (x - state.ui.mouse.lastX);
			var dy = factor * (y - state.ui.mouse.lastY);
			state.app.eye.xAngle = (state.app.eye.xAngle - dx) % (2*Math.PI);
			if (state.app.eye.xAngle < 0) {
				state.app.eye.xAngle += 2 * Math.PI;
			}
			state.app.eye.yAngle = (state.app.eye.yAngle + dy) % (2*Math.PI);
			if (state.app.eye.yAngle > Math.PI/2) {
				state.app.eye.yAngle = Math.PI/2;
			} else if (state.app.eye.yAngle < -Math.PI/2) {
				state.app.eye.yAngle = -Math.PI/2;
			}
		} else {
			var factor = 0.00001;
			var dx = factor * (x - state.ui.mouse.lastX);
			var dy = factor * (y - state.ui.mouse.lastY) * 1000;
			if (state.app.eye.yAngle < 0) {
				dx = -dx;
			}
			var xyz = getViewXYZ();
			var ijk = dragVector();

			state.app.lookAt.x -= dx * (ijk[0]^2/(ijk[0]^2+ijk[2]^2));
			state.app.lookAt.y += dy;
			state.app.lookAt.z -= dx * (ijk[2]^2/(ijk[0]^2+ijk[2]^2));

			if (state.app.lookAt.x < -7.5) {
				state.app.lookAt.x = -7.5;
			} else if (state.app.lookAt.x > 7.5) {
				state.app.lookAt.x = 7.5;
			}
			if (state.app.lookAt.y < -5) {
				state.app.lookAt.y = -5;
			} else if (state.app.lookAt.y > 5) {
				state.app.lookAt.y = 5;
			}
			if (state.app.lookAt.z < -7.5) {
				state.app.lookAt.z = -7.5;
			} else if (state.app.lookAt.z > 7.5) {
				state.app.lookAt.z = 7.5;
			}
		}
	}
	state.ui.mouse.lastX = x;
	state.ui.mouse.lastY = y;
}

function onwheel(event) {
	state.app.eye.distance += event.deltaY/100;
}

function getViewXYZ() {
	var y = state.app.eye.distance*Math.sin(state.app.eye.yAngle) + state.app.lookAt.y;
	var h = state.app.eye.distance*Math.cos(state.app.eye.yAngle);
	var x = h*Math.sin(state.app.eye.xAngle) + state.app.lookAt.x;
	var z = h*Math.cos(state.app.eye.xAngle) + state.app.lookAt.z;
	return [x, y, z];
}

function dragVector() {
	var xyz = getViewXYZ();
	var u = [state.app.lookAt.x - xyz[0], state.app.lookAt.y - xyz[1], state.app.lookAt.z - xyz[2]];
	if (u[1] == 0) {
		var v = [state.app.lookAt.x - xyz[0], state.app.lookAt.z - xyz[2], 0];
		var ijk = [u[1]*v[2]-u[2]*v[1], u[0]*v[2]-u[2]*v[0], u[0]*v[1]-u[1]*v[0]];
	} else {
		var vy = (u[0]*u[0] + u[2]*u[2])/(-u[1]);
		var v = [state.app.lookAt.x - xyz[0], vy, state.app.lookAt.z - xyz[2]];
		var ijk = [u[1]*v[2]-u[2]*v[1], -(u[0]*v[2]-u[2]*v[0]), u[0]*v[1]-u[1]*v[0]];
	}
	return ijk;
}