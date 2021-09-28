attribute vec3 a_Position;
attribute vec2 a_TexCoord;
attribute vec4 a_Normal;

uniform mat4 u_ModelMatrix;
uniform mat4 u_ViewMatrix;
uniform mat4 u_ProjMatrix;
uniform mat4 u_NormalMatrix;

varying vec2 v_TexCoord;
varying vec3 v_Normal;
varying vec3 v_Position;

void main() {
	v_TexCoord = a_TexCoord;
	v_Normal = normalize(vec3(u_NormalMatrix * a_Normal));
	v_Position = vec3(u_ModelMatrix * vec4(a_Position, 1.0));
	gl_Position = u_ProjMatrix * u_ViewMatrix * u_ModelMatrix * vec4(a_Position, 1.0);
}
