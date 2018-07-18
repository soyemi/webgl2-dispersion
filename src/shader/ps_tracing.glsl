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


vec2 RandomDir(){
    float r =random(vUV+uTime) * 3.1415926 *2.0;
    return vec2(sin(r),cos(r));
}

const vec2 pPos = vec2(0.5,0.5);
const vec2 pDir = vec2(-1.0,0.0);

const float MAX_DIST = 100000.0;


float intersectplane(vec2 pos,vec2 dir,vec2 planePoint,vec2 planeNor){

    vec2 nor = normalize(planeNor);
    vec2 rd = planePoint - pos;
    float ndotd = dot(rd,nor);

    float len = abs(ndotd);
    float ndott = dot(dir,-nor);

    float t = len / ndott;
    return t;
}

float intersectCircle(inout vec2 ppos,inout vec2 pdir,vec2 cpos,float cradius){
    vec2 rd = cpos - ppos;
    pdir = normalize(pdir);

    float rddotd = dot(pdir,rd);
    float rdlen2 = dot(rd,rd);

    float d = rdlen2 - rddotd*rddotd;

    float cradius2 = cradius * cradius;
    if(d > cradius2){
        return MAX_DIST;
    }

    float t = rddotd - sqrt(cradius2 - d);

    ppos += t * pdir;
    pdir = normalize(ppos - cpos);
    return t;
    
}

vec3 traceRay(vec2 rpos,vec2 rdir){

    float tmin = MAX_DIST;

    float tv = 0.0;

    //c1
    vec2 tpos = rpos;
    vec2 tdir = rdir;
    
    float t = intersectCircle(tpos,tdir,vec2(0.5),0.1);
    if(t < tmin){
        tmin = t;
        tv = 1.0;
    }

    //c2
    tpos = rpos;
    tdir = rdir;
    t = intersectCircle(tpos,tdir,vec2(0.7,0.3),0.05);
    if(t < tmin){
        tmin = t;
        tv = 1.0;
    }

    return vec3(tv);
}



void main(){

    vec3 col = traceRay(vUV,RandomDir());
    fragColor = col;
}





