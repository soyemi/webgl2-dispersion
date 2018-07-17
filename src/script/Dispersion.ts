
import { GLContext,GLProgram} from 'wglut';
import { GLSL_VS_DEFAULT, GLSL_PS_DEFAULT, GLSL_PS_TRACING, GLSL_PS_MERGE } from './ShaderLib';

export class Dispersion{

    private glctx: GLContext;
    private m_programDef: GLProgram;
    private m_programTracing:GLProgram;
    private m_programMerge:GLProgram;

    private m_vao : WebGLVertexArrayObject;

    private m_fb : WebGLFramebuffer;

    private m_rtx1: WebGLTexture;
    private m_rtx2: WebGLTexture;
    private m_rtxF:WebGLTexture;

    private m_canvasW :number;
    private m_cavnasH :number;

    constructor(canvas:HTMLCanvasElement){

        this.glctx = GLContext.createFromCanvas(canvas);
        if(this.glctx == null) return;

        this.m_canvasW = canvas.width;
        this.m_cavnasH = canvas.height;

        this.onInitGL();
        this.onAnimationFrame(0);
    }

    private onAnimationFrame(ts:number){
        this.onFrame(ts);
        requestAnimationFrame(this.onAnimationFrame.bind(this));
    }

    private onInitGL(){
        let glctx = this.glctx;
        let gl = glctx.gl;

        let ext = gl.getExtension('EXT_color_buffer_float');
        let extf = gl.getExtension('OES_texture_float_linear');

        this.m_programDef = glctx.createProgram(GLSL_VS_DEFAULT,GLSL_PS_DEFAULT);
        this.m_programTracing = glctx.createProgram(GLSL_VS_DEFAULT,GLSL_PS_TRACING);
        this.m_programMerge = glctx.createProgram(GLSL_VS_DEFAULT,GLSL_PS_MERGE);

        let vao = gl.createVertexArray();
        gl.bindVertexArray(vao);
        
        let vbuffer = gl.createBuffer();
        gl.bindBuffer(gl.ARRAY_BUFFER,vbuffer);
        let vdata = [
            0.0,0.0,0.0,1.0,1.0,1.0,1.0,0.0
        ];
        gl.bufferData(gl.ARRAY_BUFFER,new Float32Array(vdata),gl.STATIC_DRAW);
        let ibuffer =gl.createBuffer();
        let idata = [0,1,2,0,2,3];
        gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER,ibuffer);
        gl.bufferData(gl.ELEMENT_ARRAY_BUFFER,new Uint16Array(idata),gl.STATIC_DRAW);

        let aposition = this.m_programDef['aPosition'];
        gl.enableVertexAttribArray(aposition);
        gl.vertexAttribPointer(aposition,2,gl.FLOAT,false,0,0);
        let auv = this.m_programDef['aUV'];
        gl.enableVertexAttribArray(auv);
        gl.vertexAttribPointer(auv,2,gl.FLOAT,false,0,0);

        gl.bindVertexArray(null);
        this.m_vao = vao;

        let fb = gl.createFramebuffer();
        gl.bindFramebuffer(gl.FRAMEBUFFER, fb);
        this.m_fb = fb;

        this.m_rtx1 = glctx.createTexture(gl.RG32F,this.m_canvasW,this.m_cavnasH,true,false);
        this.m_rtx2 = glctx.createTexture(gl.RG32F,this.m_canvasW,this.m_cavnasH,true,false);
        this.m_rtxF = glctx.createTexture(gl.RG32F,this.m_canvasW,this.m_cavnasH,true,false);

        gl.viewport(0,0,this.m_canvasW,this.m_cavnasH);

        gl.bindVertexArray(this.m_vao);

    }



    private DrawTexture(tex:WebGLTexture | null,program:GLProgram){

        let gl = this.glctx.gl;

        let vao = this.m_vao;
        gl.bindVertexArray(vao);

        gl.useProgram(program.Program);

        if(tex != null){
            gl.activeTexture(gl.TEXTURE0);
            gl.bindTexture(gl.TEXTURE_2D,tex);
            let usampler0 = program['uSampler'];
            gl.uniform1i(usampler0,0);
        }
        

        gl.drawElements(gl.TRIANGLES,6,gl.UNSIGNED_SHORT,0);
    }

    private DebugTex(tex:WebGLTexture){
        let gl = this.glctx.gl;
        gl.bindFramebuffer(gl.FRAMEBUFFER,null);
        this.DrawTexture(tex,this.m_programDef);
    }


    private m_samples :number = 1;
    private onFrame(ts:number){
        let gl = this.glctx.gl;
        let vao = this.m_vao;
    
        let rtx1 = this.m_rtx1;
        let rtx2 = this.m_rtx2;
        let rtxF = this.m_rtxF;

        let time = ts / 1000.0;


        //Path tracing
        gl.bindFramebuffer(gl.FRAMEBUFFER,this.m_fb);
        gl.framebufferTexture2D(gl.FRAMEBUFFER,gl.COLOR_ATTACHMENT0,gl.TEXTURE_2D,rtx1,0);

        gl.bindVertexArray(vao);

        let pTracing = this.m_programTracing;
        gl.useProgram(pTracing.Program);

        let utime = pTracing['uTime'];
        gl.uniform1f(utime,time);
        gl.drawElements(gl.TRIANGLES,6,gl.UNSIGNED_SHORT,0);

        //Merge
        gl.framebufferTexture2D(gl.FRAMEBUFFER,gl.COLOR_ATTACHMENT0,gl.TEXTURE_2D,rtxF,0);

        let pMerge = this.m_programMerge;
        gl.useProgram(pMerge.Program);

        let samples = this.m_samples;
        let ulerp:number = (samples -1.0) / samples;

        gl.uniform1f(pMerge['uLerp'],ulerp);
        this.m_samples +=1;
        
        gl.activeTexture(gl.TEXTURE0);
        gl.bindTexture(gl.TEXTURE_2D,this.m_rtx2);
        let usampler0 = pMerge['uSampler'];
        gl.uniform1i(usampler0,0);

        gl.activeTexture(gl.TEXTURE1);
        gl.bindTexture(gl.TEXTURE_2D,this.m_rtx1);
        let usampler1 = pMerge['uSampler1'];
        gl.uniform1i(usampler1,1);
        gl.drawElements(gl.TRIANGLES,6,gl.UNSIGNED_SHORT,0);  
        
        
        //Render to Canvas
        gl.bindFramebuffer(gl.FRAMEBUFFER,null);
        this.DrawTexture(this.m_rtxF,this.m_programDef);

        //swap
        this.m_rtx2 = rtxF;
        this.m_rtxF = rtx2;

        
    }

}