#version 300 es
precision highp float;
in vec2 vUV;

uniform float uTime;

out vec3 fragColor;


float random(vec2 co){
    float a = 12.9898, b = 78.233, c = 43758.5453;
	float dt = dot(co.xy, vec2(a, b));
	dt = mod(dt,3.14);
	return fract(sin(dt) *c);
}

void main(){

    float r = random(vUV+uTime);
    fragColor = vec3(r,0,0);
}


