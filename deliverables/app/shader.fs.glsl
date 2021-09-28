#ifdef GL_ES
precision mediump float;
#endif

varying vec2 v_TexCoord;
varying vec3 v_Position;
varying vec3 v_Normal;

uniform vec3 u_StreetLightPosition[4];
uniform vec3 u_LightDirection;
uniform vec3 u_AmbientLight;
uniform vec3 u_StreetLightColor;
uniform vec3 u_LightColor;
uniform vec3 u_StreetLightDirection;
uniform float u_StreetLightInnerLimit;
uniform float u_StreetLightOuterLimit;

uniform sampler2D sampler;

void main() {
	vec3 normal = normalize(v_Normal);
	vec4 texelColor = texture2D(sampler, v_TexCoord);
	vec3 diffuse = max(dot(normalize(u_LightDirection), normal), 0.0) * u_LightColor;
	vec3 ambient = u_AmbientLight * texelColor.rgb;
	for(int i = 0; i < 4; i++){
		vec3 lightDirection = normalize(u_StreetLightPosition[i] - v_Position);
		float dotFromDirection = dot(lightDirection, -normalize(u_StreetLightDirection));
		float limitRange = u_StreetLightInnerLimit - u_StreetLightOuterLimit;
		float inLight = clamp((dotFromDirection - u_StreetLightOuterLimit) / limitRange, 0.0, 1.0);
		diffuse += inLight * dot(normal, lightDirection) * u_StreetLightColor;

	}
	gl_FragColor = vec4((diffuse * texelColor.rgb) + ambient, texelColor.a);
}
