class Point{
    constructor(public x : number, public y : number){}
}

class Triangle {
    borderColor: Color;
    fillColor: Color;
    constructor(public p0: Point, public p1: Point, public p2: Point){
        this.borderColor = Color.white;
        this.fillColor   = Color.black;
    }
}

class Color {
    constructor(public r: number,
                public g: number,
                public b: number) {
    }
    static scale(k: number, v: Color) { return new Color(k * v.r, k * v.g, k * v.b); }
    static plus(v1: Color, v2: Color) { return new Color(v1.r + v2.r, v1.g + v2.g, v1.b + v2.b); }
    static times(v1: Color, v2: Color) { return new Color(v1.r * v2.r, v1.g * v2.g, v1.b * v2.b); }
    static white = new Color(1.0, 1.0, 1.0);
    static grey = new Color(0.5, 0.5, 0.5);
    static black = new Color(0.0, 0.0, 0.0);
    static background = Color.black;
    static defaultColor = Color.black;
    static toDrawingColor(c: Color) {
        var legalize = d => d > 1 ? 1 : d;
        return {
            r: Math.floor(legalize(c.r) * 255),
            g: Math.floor(legalize(c.g) * 255),
            b: Math.floor(legalize(c.b) * 255)
        }
    }
    static toHtmlColor(o: Color){
        var c = Color.toDrawingColor(o);
        return "rgb(" + String(c.r) + ", " + String(c.g) + ", " + String(c.b) + ")";
    }
}

function getRandomColor(){
    return new Color( Math.random(), Math.random(), Math.random());
}

function getRandomNumber (min, max) {
    return Math.random() * (max - min) + min;
}

function getRandomPoint () {
    
    var x = getRandomNumber(0,128);
    var y = getRandomNumber(0,128);

    if (x > y){
        return new Point(y,x);
    }else{
        return new Point(x,y);
    }
}


function getRandomTriangle () {
    
    var p0 = getRandomPoint ();
    var p1 = getRandomPoint ();
    var p2 = getRandomPoint ();

    var triangle = new Triangle(p0,p1,p2)

    triangle.fillColor   = getRandomColor();
    triangle.borderColor = getRandomColor();

    return triangle;

}

function getSymmetries(tr : Triangle){
    
    var collection  = [ new Triangle(new Point(-tr.p0.x,tr.p0.y),new Point(-tr.p1.x,tr.p1.y),new Point(-tr.p2.x,tr.p2.y)),
            new Triangle(new Point(tr.p0.x,-tr.p0.y),new Point(tr.p1.x,-tr.p1.y),new Point(tr.p2.x,-tr.p2.y)),
            new Triangle(new Point(-tr.p0.x,-tr.p0.y),new Point(-tr.p1.x,-tr.p1.y),new Point(-tr.p2.x,-tr.p2.y)),
            new Triangle(new Point(-tr.p0.y,tr.p0.x),new Point(-tr.p1.y,tr.p1.x),new Point(-tr.p2.y,tr.p2.x)),
            new Triangle(new Point(-tr.p0.y,-tr.p0.x),new Point(-tr.p1.y,-tr.p1.x),new Point(-tr.p2.y,-tr.p2.x)),
            new Triangle(new Point(tr.p0.y,tr.p0.x),new Point(tr.p1.y,tr.p1.x),new Point(tr.p2.y,tr.p2.x)),
            new Triangle(new Point(tr.p0.y,-tr.p0.x),new Point(tr.p1.y,-tr.p1.x),new Point(tr.p2.y,-tr.p2.x))];

    for(var i in collection){
        var t = collection[i];
        t.fillColor = tr.fillColor;
        t.borderColor = tr.borderColor;
        
    }

    return collection;
}

function generateTriangles(q : number){
    var triangles  = [];
    for(var i = 0; i < q; i++){
        triangles.push(getRandomTriangle());
    }
    return triangles;
}

var requestAnimFrame: (callback: () => void) => void = (function(){ 
  return window.requestAnimationFrame || 
  (<any>window).webkitRequestAnimationFrame || 
  (<any>window).mozRequestAnimationFrame || 
  (<any>window).oRequestAnimationFrame || 
  window.msRequestAnimationFrame || 
  function(callback){ 
      window.setTimeout(callback, 1000 / 60, new Date().getTime()); 
  }; 
})(); 

function phi(a : number){
    
    var dice =  Math.random();

    if(dice>0.5){
        return a + 0.1;
    }
    return a - 0.1;
}

class Kaleidoscope{

    private ctx : CanvasRenderingContext2D;
    private triangles: Triangle[];

    active : bool;

    constructor(ctx){ 
        this.ctx = ctx;
        this.active = false;
    }

    private drawTriangle(ctx, tr : Triangle){
        
        ctx.beginPath();

        ctx.fillStyle   = Color.toHtmlColor(tr.fillColor);
        ctx.strokeStyle = Color.toHtmlColor(tr.borderColor);
        
        ctx.moveTo(tr.p0.x + 128, tr.p0.y + 128); 
        ctx.lineTo(tr.p1.x + 128, tr.p1.y + 128);
        ctx.lineTo(tr.p2.x + 128, tr.p2.y + 128);
        ctx.lineTo(tr.p0.x + 128, tr.p0.y + 128);

        ctx.fill();
        ctx.stroke();
        ctx.closePath();
    }

    init(q : number){
        this.triangles  = generateTriangles(q);
        this.ctx.lineWidth  = 1;
    }

    render(){
        this.ctx.clearRect(0,0,256,256);
        for (var i in this.triangles){
            
            var tr = this.triangles[i];

            this.drawTriangle(this.ctx,tr);

            var syms = getSymmetries(tr);

            for(var t in syms){
                this.drawTriangle(this.ctx,syms[t]);
            }
        }

    }

    private transformPoint(p : Point){

        var lambda = 0.5;
        var angle = getRandomNumber(0,2*Math.PI);
        var v = new Point(lambda*Math.cos(angle),lambda*Math.sin(angle));
        var r = new Point(p.x + v.x, p.y + v. y);

        if (r.x > r.y){
            return new Point(r.y,r.x);
        }
        return r;
    }

    private transformColor(c : Color){
        return new Color(phi(c.r),phi(c.g),phi(c.b));
    }

    private transformTriangle(tr : Triangle){
        
        //we need to tranform each point slightly
        tr.p0 = this.transformPoint(tr.p0);
        tr.p1 = this.transformPoint(tr.p1);
        tr.p2 = this.transformPoint(tr.p2);

        tr.borderColor = this.transformColor(tr.borderColor);
        tr.fillColor = this.transformColor(tr.fillColor);
    }

    transform(){
        for (var i in this.triangles){
            var tr = this.triangles[i];
            this.transformTriangle(tr);
        }
    }

    //loop(){
    //    if(this.active){ 
    //        this.render();
    //        this.transform();
    //        requestAnimFrame(function() { this.loop(); });
    //    }
    //};

}

function exec() {

    var canv = <HTMLCanvasElement>document.createElement("canvas");
    
    canv.width = 256;
    canv.height = 256;

    document.getElementById("kal").appendChild(canv);

    var ctx = canv.getContext("2d");
    
    var kaleidoscope = new Kaleidoscope(ctx);
    kaleidoscope.init(40);
    kaleidoscope.render();

    //function loop(){
    //    kaleidoscope.render();
    //    kaleidoscope.transform();
    //    requestAnimFrame(function() { loop(); });
    //};

    function loop(){
        if(kaleidoscope.active){ 
            kaleidoscope.render();
            kaleidoscope.transform();
            requestAnimFrame(function() { loop(); });
        }
    };

    var resetButton = document.createElement("button");
    resetButton.innerHTML = "reset"
    resetButton.id = "reset_btn";

    var startButton = document.createElement("button");
    startButton.innerHTML = "start"
    startButton.id = "start_btn";

    var stopButton  = document.createElement("button");
    stopButton.innerHTML = "stop"
    stopButton.id = "stop_btn";
    stopButton.disabled = true;

    function reset(){
        kaleidoscope.init(40);
        kaleidoscope.render();
    };
    function start(){ 
        kaleidoscope.active = true;
        resetButton.disabled = true;
        startButton.disabled = true;
        stopButton.disabled = false;
        loop(); 
    };
    function stop(){
        resetButton.disabled = false;
        startButton.disabled = false;
        stopButton.disabled = true;
        kaleidoscope.active = false;
    };

    resetButton.onclick = reset;
    startButton.onclick = start;
    stopButton.onclick = stop;
    
    document.getElementById("ctrl").appendChild(resetButton);
    document.getElementById("ctrl").appendChild(startButton);
    document.getElementById("ctrl").appendChild(stopButton);

}

window.onload = exec;