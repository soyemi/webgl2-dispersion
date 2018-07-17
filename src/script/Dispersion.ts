
import { GLContext,GLProgram} from 'wglut';

export class Dispersion{

    private glctx: GLContext;

    constructor(canvas:HTMLCanvasElement){

        this.glctx = GLContext.createFromCanvas(canvas);
        if(this.glctx == null) return;

        this.onInitGL();
        this.onAnimationFrame(0);
    }

    private onAnimationFrame(ts:number){
        this.onFrame(ts);
        requestAnimationFrame(this.onAnimationFrame.bind(this));
    }

    private onInitGL(){

    }

    private onFrame(ts:number){
    }

}