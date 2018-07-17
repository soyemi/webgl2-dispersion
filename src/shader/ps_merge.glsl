#version 300 es
precision highp float;
in vec2 vUV;
uniform sampler2D uSampler;
uniform sampler2D uSampler1;

uniform float uLerp;

out vec3 fragColor;
void main(){

    vec3 colf = texture(uSampler,vUV).rgb;
    vec3 col = texture(uSampler1,vUV).rgb;
    
    fragColor = mix(col,colf,uLerp);
}


