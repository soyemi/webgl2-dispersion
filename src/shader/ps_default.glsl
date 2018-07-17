#version 300 es
precision highp float;
in vec2 vUV;
uniform sampler2D uSampler;

out vec4 fragColor;
void main(){
    fragColor = texture(uSampler,vUV);
}
