//3456789_123456789_123456789_123456789_123456789_123456789_123456789_123456789_
// (JT: why the numbers? counts columns, helps me keep 80-char-wide listings)

// Tabs set to 2

/*=====================
  VBObox-Lib.js library: 
  ===================== 
Note that you don't really need 'VBObox' objects for any simple, 
    beginner-level WebGL/OpenGL programs: if all vertices contain exactly 
		the same attributes (e.g. position, color, surface normal), and use 
		the same shader program (e.g. same Vertex Shader and Fragment Shader), 
		then our textbook's simple 'example code' will suffice.
		  
***BUT*** that's rare -- most genuinely useful WebGL/OpenGL programs need 
		different sets of vertices with  different sets of attributes rendered 
		by different shader programs.  THUS a customized VBObox object for each 
		VBO/shader-program pair will help you remember and correctly implement ALL 
		the WebGL/GLSL steps required for a working multi-shader, multi-VBO program.
		
One 'VBObox' object contains all we need for WebGL/OpenGL to render on-screen a 
		set of shapes made from vertices stored in one Vertex Buffer Object (VBO), 
		as drawn by calls to one 'shader program' that runs on your computer's 
		Graphical Processing Unit(GPU), along with changes to values of that shader 
		program's one set of 'uniform' varibles.  
The 'shader program' consists of a Vertex Shader and a Fragment Shader written 
		in GLSL, compiled and linked and ready to execute as a Single-Instruction, 
		Multiple-Data (SIMD) parallel program executed simultaneously by multiple 
		'shader units' on the GPU.  The GPU runs one 'instance' of the Vertex 
		Shader for each vertex in every shape, and one 'instance' of the Fragment 
		Shader for every on-screen pixel covered by any part of any drawing 
		primitive defined by those vertices.
The 'VBO' consists of a 'buffer object' (a memory block reserved in the GPU),
		accessed by the shader program through its 'attribute' variables. Shader's
		'uniform' variable values also get retrieved from GPU memory, but their 
		values can't be changed while the shader program runs.  
		Each VBObox object stores its own 'uniform' values as vars in JavaScript; 
		its 'adjust()'	function computes newly-updated values for these uniform 
		vars and then transfers them to the GPU memory for use by shader program.
EVENTUALLY you should replace 'cuon-matrix-quat03.js' with the free, open-source
   'glmatrix.js' library for vectors, matrices & quaternions: Google it!
		This vector/matrix library is more complete, more widely-used, and runs
		faster than our textbook's 'cuon-matrix-quat03.js' library.  
		--------------------------------------------------------------
		I recommend you use glMatrix.js instead of cuon-matrix-quat03.js
		--------------------------------------------------------------
		for all future WebGL programs. 
You can CONVERT existing cuon-matrix-based programs to glmatrix.js in a very 
    gradual, sensible, testable way:
		--add the glmatrix.js library to an existing cuon-matrix-based program;
			(but don't call any of its functions yet).
		--comment out the glmatrix.js parts (if any) that cause conflicts or in	
			any way disrupt the operation of your program.
		--make just one small local change in your program; find a small, simple,
			easy-to-test portion of your program where you can replace a 
			cuon-matrix object or function call with a glmatrix function call.
			Test; make sure it works. Don't make too large a change: it's hard to fix!
		--Save a copy of this new program as your latest numbered version. Repeat
			the previous step: go on to the next small local change in your program
			and make another replacement of cuon-matrix use with glmatrix use. 
			Test it; make sure it works; save this as your next numbered version.
		--Continue this process until your program no longer uses any cuon-matrix
			library features at all, and no part of glmatrix is commented out.
			Remove cuon-matrix from your library, and now use only glmatrix.

	------------------------------------------------------------------
	VBObox -- A MESSY SET OF CUSTOMIZED OBJECTS--NOT REALLY A 'CLASS'
	------------------------------------------------------------------
As each 'VBObox' object can contain:
  -- a DIFFERENT GLSL shader program, 
  -- a DIFFERENT set of attributes that define a vertex for that shader program, 
  -- a DIFFERENT number of vertices to used to fill the VBOs in GPU memory, and 
  -- a DIFFERENT set of uniforms transferred to GPU memory for shader use.  
  THUS:
		I don't see any easy way to use the exact same object constructors and 
		prototypes for all VBObox objects.  Every additional VBObox objects may vary 
		substantially, so I recommend that you copy and re-name an existing VBObox 
		prototype object, and modify as needed, as shown here. 
		(e.g. to make the VBObox3 object, copy the VBObox2 constructor and 
		all its prototype functions, then modify their contents for VBObox3 
		activities.)

*/


//=============================================================================


var floatsPerVertex = 7;	// # of Float32Array elements used for each vertex

var vbobox1_floatsPerVertex = 7;	// # of Float32Array elements used for each vertex
									//4 (x,y,z,w)+3(r,g,b)
var vbobox2_floatsPerVertex=7;// # of Float32Array elements used for each vertex
//4 (x,y,z,w)+3(r,g,b)
//=============================================================================
//=============================================================================
function VBObox0() {
//=============================================================================
//=============================================================================
// CONSTRUCTOR for one re-usable 'VBObox0' object that holds all data and fcns
// needed to render vertices from one Vertex Buffer Object (VBO) using one 
// separate shader program (a vertex-shader & fragment-shader pair) and one
// set of 'uniform' variables.

// Constructor goal: 
// Create and set member vars that will ELIMINATE ALL LITERALS (numerical values 
// written into code) in all other VBObox functions. Keeping all these (initial)
// values here, in this one coonstrutor function, ensures we can change them 
// easily WITHOUT disrupting any other code, ever!
  
	this.VERT_SRC =	//--------------------- VERTEX SHADER source code 
  //'precision highp float;\n' +				// req'd in OpenGL ES if we use 'float'
  'uniform mat4 u_ModelMat0;\n' +
  'attribute vec4 a_Pos0;\n' +
  'attribute vec4 a_Colr0;\n' +
  'varying vec4 v_Colr0;\n' +
  'void main() {\n' +
  '  gl_Position = u_ModelMat0 * a_Pos0;\n' +
  //'  gl_PointSize = 10.0;\n' +
  '  v_Colr0 = a_Colr0;\n' +
  '}\n';

	this.FRAG_SRC = //---------------------- FRAGMENT SHADER source code 
//  '#ifdef GL_ES\n' +
'precision mediump float;\n' +
//  '#endif GL_ES\n' +
  'varying vec4 v_Colr0;\n' +
  'void main() {\n' +
  '  gl_FragColor = v_Colr0;\n' +
  '}\n';

  makeGroundGrid();
  makeAxes();

  var mySiz = (gndVerts.length+ myaxes.length);	
  var nn = mySiz / floatsPerVertex;
  console.log('nn is', nn, 'mySiz is', mySiz, 'floatsPerVertex is', floatsPerVertex);
  var colorShapes = new Float32Array(mySiz);

	gndStart=0;
    for(i=0,j=0; j< gndVerts.length; i++,j++) {
    colorShapes[i] = gndVerts[j];
    }
    axeStart = i;
    for(j=0; j< myaxes.length; i++,j++) {
    colorShapes[i] = myaxes[j];
    }


  
  this.vboContents =colorShapes; 

	this.FSIZE = this.vboContents.BYTES_PER_ELEMENT;

	this.vboStride = this.FSIZE*floatsPerVertex; 
	                              // (== # of bytes to store one complete vertex).
	                              // From any attrib in a given vertex in the VBO, 
	                              // move forward by 'vboStride' bytes to arrive 
	                              // at the same attrib for the next vertex. 

	            //----------------------Attribute sizes
  this.vboFcount_a_Pos0 =  4;    // # of floats in the VBO needed to store the
                                // attribute named a_Pos0. (4: x,y,z,w values)
  this.vboFcount_a_Colr0 = 3;   // # of floats for this attrib (r,g,b values) 
  console.assert((this.vboFcount_a_Pos0 +     // check the size of each and
                  this.vboFcount_a_Colr0) *   // every attribute in our VBO
                  this.FSIZE == this.vboStride, // for agreeement with'stride'
                  "Uh oh! VBObox0.vboStride disagrees with attribute-size values!");

              //----------------------Attribute offsets  
	this.vboOffset_a_Pos0 = 0;    // # of bytes from START of vbo to the START
	                              // of 1st a_Pos0 attrib value in vboContents[]
  this.vboOffset_a_Colr0 = this.vboFcount_a_Pos0 * this.FSIZE;    
                                // (4 floats * bytes/float) 
                                // # of bytes from START of vbo to the START
                                // of 1st a_Colr0 attrib value in vboContents[]
	            //-----------------------GPU memory locations:
	this.vboLoc;									// GPU Location for Vertex Buffer Object, 
	                              // returned by gl.createBuffer() function call
	this.shaderLoc;								// GPU Location for compiled Shader-program  
	                            	// set by compile/link of VERT_SRC and FRAG_SRC.
								          //------Attribute locations in our shaders:
	this.a_PosLoc;								// GPU location for 'a_Pos0' attribute
	this.a_ColrLoc;								// GPU location for 'a_Colr0' attribute

	            //---------------------- Uniform locations &values in our shaders
	this.g_modelMatrix = new Matrix4();	// Transforms CVV axes to model axes.
	this.g_modelMatLoc;							// GPU location for u_ModelMat uniform
}

VBObox0.prototype.init = function() {
//=============================================================================
// Prepare the GPU to use all vertices, GLSL shaders, attributes, & uniforms 
// kept in this VBObox. (This function usually called only once, within main()).
// Specifically:
// a) Create, compile, link our GLSL vertex- and fragment-shaders to form an 
//  executable 'program' stored and ready to use inside the GPU.  
// b) create a new VBO object in GPU memory and fill it by transferring in all
//  the vertex data held in our Float32array member 'VBOcontents'. 
// c) Find & save the GPU location of all our shaders' attribute-variables and 
//  uniform-variables (needed by switchToMe(), adjust(), draw(), reload(), etc.)
// -------------------
// CAREFUL!  before you can draw pictures using this VBObox contents, 
//  you must call this VBObox object's switchToMe() function too!
//--------------------
// a) Compile,link,upload shaders-----------------------------------------------
	this.shaderLoc = createProgram(gl, this.VERT_SRC, this.FRAG_SRC);
	if (!this.shaderLoc) {
    console.log(this.constructor.name + 
    						'.init() failed to create executable Shaders on the GPU. Bye!');
    return;
  }
// CUTE TRICK: let's print the NAME of this VBObox object: tells us which one!
//  else{console.log('You called: '+ this.constructor.name + '.init() fcn!');}

	gl.program = this.shaderLoc;		// (to match cuon-utils.js -- initShaders())

// b) Create VBO on GPU, fill it------------------------------------------------
	this.vboLoc = gl.createBuffer();	
  if (!this.vboLoc) {
    console.log(this.constructor.name + 
    						'.init() failed to create VBO in GPU. Bye!'); 
    return;
  }
  // Specify the purpose of our newly-created VBO on the GPU.  Your choices are:
  //	== "gl.ARRAY_BUFFER" : the VBO holds vertices, each made of attributes 
  // (positions, colors, normals, etc), or 
  //	== "gl.ELEMENT_ARRAY_BUFFER" : the VBO holds indices only; integer values 
  // that each select one vertex from a vertex array stored in another VBO.
  gl.bindBuffer(gl.ARRAY_BUFFER,	      // GLenum 'target' for this GPU buffer 
  								this.vboLoc);				  // the ID# the GPU uses for this buffer.


  gl.bufferData(gl.ARRAY_BUFFER, 			  // GLenum target(same as 'bindBuffer()')
 					 				this.vboContents, 		// JavaScript Float32Array
  							 	gl.STATIC_DRAW);			// Usage hint.

  this.a_PosLoc = gl.getAttribLocation(this.shaderLoc, 'a_Pos0');
  if(this.a_PosLoc < 0) {
    console.log(this.constructor.name + 
    						'.init() Failed to get GPU location of attribute a_Pos0');
    return -1;	// error exit.
  }
 	this.a_ColrLoc = gl.getAttribLocation(this.shaderLoc, 'a_Colr0');
  if(this.a_ColrLoc < 0) {
    console.log(this.constructor.name + 
    						'.init() failed to get the GPU location of attribute a_Colr0');
    return -1;	// error exit.
  }
  // c2) Find All Uniforms:-----------------------------------------------------
  //Get GPU storage location for each uniform var used in our shader programs: 
	this.g_modelMatLoc = gl.getUniformLocation(this.shaderLoc, 'u_ModelMat0');
  if (!this.g_modelMatLoc) { 
    console.log(this.constructor.name + 
    						'.init() failed to get GPU location for u_ModelMat1 uniform');
    return;
  }  
}

VBObox0.prototype.switchToMe = function() {
//==============================================================================
// Set GPU to use this VBObox's contents (VBO, shader, attributes, uniforms...)
//
// We only do this AFTER we called the init() function, which does the one-time-
// only setup tasks to put our VBObox contents into GPU memory.  !SURPRISE!
// even then, you are STILL not ready to draw our VBObox's contents onscreen!
// We must also first complete these steps:
//  a) tell the GPU to use our VBObox's shader program (already in GPU memory),
//  b) tell the GPU to use our VBObox's VBO  (already in GPU memory),
//  c) tell the GPU to connect the shader program's attributes to that VBO.

// a) select our shader program:
  gl.useProgram(this.shaderLoc);	
//		Each call to useProgram() selects a shader program from the GPU memory,
// but that's all -- it does nothing else!  Any previously used shader program's 
// connections to attributes and uniforms are now invalid, and thus we must now
// establish new connections between our shader program's attributes and the VBO
// we wish to use.  
  
// b) call bindBuffer to disconnect the GPU from its currently-bound VBO and
//  instead connect to our own already-created-&-filled VBO.  This new VBO can 
//    supply values to use as attributes in our newly-selected shader program:
	gl.bindBuffer(gl.ARRAY_BUFFER,	        // GLenum 'target' for this GPU buffer 
										this.vboLoc);			    // the ID# the GPU uses for our VBO.

// c) connect our newly-bound VBO to supply attribute variable values for each
// vertex to our SIMD shader program, using 'vertexAttribPointer()' function.
// this sets up data paths from VBO to our shader units:
  // 	Here's how to use the almost-identical OpenGL version of this function:
	//		http://www.opengl.org/sdk/docs/man/xhtml/glVertexAttribPointer.xml )
  gl.vertexAttribPointer(
		this.a_PosLoc,//index == ID# for the attribute var in your GLSL shader pgm;
		this.vboFcount_a_Pos0,// # of floats used by this attribute: 1,2,3 or 4?
		gl.FLOAT,			// type == what data type did we use for those numbers?
		false,				// isNormalized == are these fixed-point values that we need
									//									normalize before use? true or false
		this.vboStride,// Stride == #bytes we must skip in the VBO to move from the
		              // stored attrib for this vertex to the same stored attrib
		              //  for the next vertex in our VBO.  This is usually the 
									// number of bytes used to store one complete vertex.  If set 
									// to zero, the GPU gets attribute values sequentially from 
									// VBO, starting at 'Offset'.	
									// (Our vertex size in bytes: 4 floats for pos + 3 for color)
		this.vboOffset_a_Pos0);						
		              // Offset == how many bytes from START of buffer to the first
  								// value we will actually use?  (We start with position).
  gl.vertexAttribPointer(this.a_ColrLoc, this.vboFcount_a_Colr0, 
                        gl.FLOAT, false, 
                        this.vboStride, this.vboOffset_a_Colr0);
  							
// --Enable this assignment of each of these attributes to its' VBO source:
  gl.enableVertexAttribArray(this.a_PosLoc);
  gl.enableVertexAttribArray(this.a_ColrLoc);
}

VBObox0.prototype.isReady = function() {
//==============================================================================
// Returns 'true' if our WebGL rendering context ('gl') is ready to render using
// this objects VBO and shader program; else return false.
// see: https://developer.mozilla.org/en-US/docs/Web/API/WebGLRenderingContext/getParameter

var isOK = true;

  if(gl.getParameter(gl.CURRENT_PROGRAM) != this.shaderLoc)  {
    console.log(this.constructor.name + 
    						'.isReady() false: shader program at this.shaderLoc not in use!');
    isOK = false;
  }
  if(gl.getParameter(gl.ARRAY_BUFFER_BINDING) != this.vboLoc) {
      console.log(this.constructor.name + 
  						'.isReady() false: vbo at this.vboLoc not in use!');
    isOK = false;
  }
  return isOK;
}

VBObox0.prototype.adjust = function() {
//==============================================================================
// Update the GPU to newer, current values we now store for 'uniform' vars on 
// the GPU; and (if needed) update each attribute's stride and offset in VBO.

  // check: was WebGL context set to use our VBO & shader program?
  if(this.isReady()==false) {
        console.log('ERROR! before' + this.constructor.name + 
  						'.adjust() call you needed to call this.switchToMe()!!');
  }  
	// // Adjust values for our uniforms,
  // this.ModelMat.setRotate(g_angleNow0, 0, 0, 1);	  // rotate drawing axes,
  // this.ModelMat.translate(0.35, 0, 0);							// then translate them.
  // //  Transfer new uniforms' values to the GPU:-------------
  // // Send  new 'ModelMat' values to the GPU's 'u_ModelMat1' uniform: 
  // gl.uniformMatrix4fv(this.u_ModelMatLoc,	// GPU location of the uniform
  // 										false, 				// use matrix transpose instead?
  // 										this.ModelMat.elements);	// send data from Javascript.
  // // Adjust the attributes' stride and offset (if necessary)
  // // (use gl.vertexAttribPointer() calls and gl.enableVertexAttribArray() calls)
}

VBObox0.prototype.draw = function() {
//=============================================================================
// Render current VBObox contents.

  // check: was WebGL context set to use our VBO & shader program?
  if(this.isReady()==false) {
        console.log('ERROR! before' + this.constructor.name + 
  						'.draw() call you needed to call this.switchToMe()!!');
  }  
  // ----------------------------Draw the contents of the currently-bound VBO:
  // gl.drawArrays(gl.TRIANGLES, 	    // select the drawing primitive to draw,
  //                 // choices: gl.POINTS, gl.LINES, gl.LINE_STRIP, gl.LINE_LOOP, 
  //                 //          gl.TRIANGLES, gl.TRIANGLE_STRIP, ...
  // 								0, 								// location of 1st vertex to draw;
  // 								this.vboVerts);		// number of vertices to draw on-screen.
  
clrColr = new Float32Array(4);
clrColr = gl.getParameter(gl.COLOR_CLEAR_VALUE);
	// console.log("clear value:", clrColr);

// //method 1 to make z reverse
 gl.enable(gl.DEPTH_TEST); // enabled by default, but let's be SURE.
// gl.clearDepth(0.0); // each time we 'clear' our depth buffer, set all
//     // pixel depths to 0.0 (1.0 is DEFAULT)
// gl.depthFunc(gl.GREATER); // (gl.LESS is DEFAULT; reverse it!)

gl.viewport(g_canvas.width/8, g_canvas.height/8, g_canvas.width*3/4, g_canvas.height*3/4);
//set identity
this.g_modelMatrix.setIdentity();  
//setperspective
// perspective();
var vpAspect = g_canvas.width/2 /			// On-screen aspect ratio for
(g_canvas.height/2);	// this camera: width/height.
// this.g_modelMatrix.setPerspective(40, vpAspect, 1, 1000);	// near, far (always >0).
this.g_modelMatrix.setPerspective(35,vpAspect, 1, 30.0);



aimx=eyex+Math.cos(angle);
aimy=eyey+Math.sin(angle);
aimz=eyez+tilt;	

// console.log(aimx);
//set camera
//control camera
this.g_modelMatrix.lookAt(eyex,eyey,eyez,aimx,aimy,aimz,0,0,1);

pushMatrix(this.g_modelMatrix);     // SAVE world coord system;


this.Drawaxes();



// //draw pikachu 
// pushMatrix(this.g_modelMatrix);
// this.g_modelMatrix.translate(0.0,0,0.01);
// this.g_modelMatrix.translate(0,-2,0);
// this.g_modelMatrix.rotate(90,1,0,0);
// this.g_modelMatrix.rotate(180,0,1,0);

// // this.Drawpikachu();
// this.Drawcube();
// this.g_modelMatrix=popMatrix();


// //drawpokeball
// pushMatrix(this.g_modelMatrix);

// this.g_modelMatrix.rotate(90,0,0,1);
// this.g_modelMatrix.translate(1.5,1.5,0);
// this.g_modelMatrix.translate(0,0,0.3);
// this.g_modelMatrix.rotate(180,0,1,0);


// this.g_modelMatrix.rotate(-90,1,0,0);


// // this.g_modelMatrix.rotate(angle*180/Math.PI,0,1,0);
// // quatMatrix.setFromQuat(qTot.x, qTot.y, qTot.z, qTot.w);	// Quaternion-->Matrix
// // this.g_modelMatrix.concat(quatMatrix);	// apply that matrix.
// // Drawaxes();

// // this.g_modelMatrix.rotate(-angle*180/Math.PI,0,1,0);
// // this.g_modelMatrix.rotate(90,1,0,0);
// this.Drawaxes();
// this.g_modelMatrix.rotate(90,1,0,0);
// this.Drawpokeball();
// this.g_modelMatrix=popMatrix();

// //drawhourgalss
// pushMatrix(this.g_modelMatrix);
// this.g_modelMatrix.rotate(90,0,0,1);
// this.g_modelMatrix.translate(0,1.5,0);
// this.g_modelMatrix.translate(0,0,0.5);
// this.g_modelMatrix.rotate(180,0,1,0);
// this.Drawhourglass();
// this.g_modelMatrix=popMatrix();


// //drawhouse
// pushMatrix(this.g_modelMatrix);
// this.g_modelMatrix.translate(2.5,-1.5,0);
// this.g_modelMatrix.scale(3,3,2);
// this.g_modelMatrix.rotate(90,0,0,1);

// this.g_modelMatrix.translate(0,0,0);
// this.g_modelMatrix.rotate(180,0,1,0);
// this.Drawhouse();
// this.g_modelMatrix.translate(0.25,0.23,-0.8);
// this.g_modelMatrix.scale(3/4,3/4,3/4);
// this.Drawpokeball();
// this.g_modelMatrix=popMatrix();


// //draw ground 
this.Drawground();
}



VBObox0.prototype.Drawground=function(){
	pushMatrix(this.g_modelMatrix);  // SAVE world drawing coords.
	this.g_modelMatrix.scale(0.1, 0.1, 0.1);				// shrink by 10X:
	  // Drawing:
	  // Pass our current matrix to the vertex shaders:
	  gl.uniformMatrix4fv(this.g_modelMatLoc, false, this.g_modelMatrix.elements);
	gl.drawArrays(gl.LINES, 								// use this drawing primitive, and
		gndStart/floatsPerVertex,	// start at this vertex number, and
		gndVerts.length/floatsPerVertex);	// draw this many vertices.
	this.g_modelMatrix= popMatrix();//get to head	
}
VBObox0.prototype.Drawaxes=function(){
	pushMatrix(this.g_modelMatrix);  // SAVE world drawing coords.
	this.g_modelMatrix.scale(0.4, 0.4, 0.4);				// Make it smaller.
	  // Drawing:
	  // Pass our current matrix to the vertex shaders:
	  gl.uniformMatrix4fv(this.g_modelMatLoc, false, this.g_modelMatrix.elements);
	gl.drawArrays(gl.LINES, 								// use this drawing primitive, and
		axeStart/floatsPerVertex,	// start at this vertex number, and
		myaxes.length/floatsPerVertex);	// draw this many vertices.
	this.g_modelMatrix= popMatrix();//get to head	
}


VBObox0.prototype.reload = function() {
 //=============================================================================
 // Over-write current values in the GPU inside our already-created VBO: use 
 // gl.bufferSubData() call to re-transfer some or all of our Float32Array 
 // contents to our VBO without changing any GPU memory allocations.

  gl.bufferSubData(gl.ARRAY_BUFFER, 	// GLenum target(same as 'bindBuffer()')
                   0,                  // byte offset to where data replacement
                                       // begins in the VBO.
 					 				this.vboContents);   // the JS source-data array used to fill VBO
 

 }
/*
VBObox0.prototype.empty = function() {
//=============================================================================
// Remove/release all GPU resources used by this VBObox object, including any 
// shader programs, attributes, uniforms, textures, samplers or other claims on 
// GPU memory.  However, make sure this step is reversible by a call to 
// 'restoreMe()': be sure to retain all our Float32Array data, all values for 
// uniforms, all stride and offset values, etc.
//
//
// 		********   YOU WRITE THIS! ********
//
//
//
}

VBObox0.prototype.restore = function() {
//=============================================================================
// Replace/restore all GPU resources used by this VBObox object, including any 
// shader programs, attributes, uniforms, textures, samplers or other claims on 
// GPU memory.  Use our retained Float32Array data, all values for  uniforms, 
// all stride and offset values, etc.
//
//
// 		********   YOU WRITE THIS! ********
//
//
//
}
*/



function makeTet(){
	var c30 = Math.sqrt(0.75);					// == cos(30deg) == sqrt(3) / 2
	var sq2	= Math.sqrt(2.0);			
my_tetrahedron=new Float32Array([

	  //left side
	  -0.125, 0.15, -0.125, 1.00,	0,0,1, //2
	  -0.125, -0.10, -0.125, 1.00,  225/255, 151/255, 32/255, 	 //1
	  -0.125, 0.15, 0.125, 1.00,  1,0,0,	//3
	  -0.125, 0.15, 0.125, 1.00,   1,0,0,	//3
	  -0.125, -0.10, -0.125, 1.00, 225/255, 151/255, 32/255, 	 //1
	  -0.125, -0.10, 0.125, 1.00,   0,1,0,  //4
	  //base side
	  -0.125, -0.10, -0.125, 1.00,  225/255, 151/255, 32/255, 	 //1
	  -0.125, 0.15, -0.125, 1.00,	0,0,1,   //2
	  0.00, 0.00, 0.00, 1.00,	255/255, 226/255, 111/255,   //0
	  //front side
	  0.00, 0.00, 0.00, 1.00,	255/255, 226/255, 111/255,   //0
	  -0.125, 0.15, 0.125, 1.00,  1,0,0,	//3
	  -0.125, -0.10, 0.125, 1.00,     0,1,0,	  //4
	  //upper side
	  0.00, 0.00, 0.00, 1.00,	255/255, 226/255, 111/255,   //0
	  -0.125, 0.15, -0.125, 1.00,	0,0,1,    //2
	  -0.125, 0.15, 0.125, 1.00,   1,0,0,	//3
	  //lower side
	  -0.125, -0.10, -0.125, 1.00,   225/255, 151/255, 32/255, 	 //1
	  0.00, 0.00, 0.00, 1.00,	255/255, 226/255, 111/255,  //0
	  -0.125, -0.10, 0.125, 1.00,  0,1,0,	 //4
]);
}




function makeSpinningSphere() {
	//==============================================================================
	// Make a sphere from one OpenGL TRIANGLE_STRIP primitive.   Make ring-like 
	// equal-lattitude 'slices' of the sphere (bounded by planes of constant z), 
	// and connect them as a 'stepped spiral' design (see makeCylinder) to build the
	// sphere from one triangle strip.
	  var slices = 13;		// # of slices of the sphere along the z axis. >=3 req'd
												// (choose odd # or prime# to avoid accidental symmetry)
	  var sliceVerts	= 27;	// # of vertices around the top edge of the slice
												// (same number of vertices on bottom of slice, too)
	  var topColr = new Float32Array([0.0, 0.0, 0.0]);	// North Pole: light gray
	  var equColr = new Float32Array([0.0, 0.0, 0.0]);	// Equator:    bright green
	  var botColr = new Float32Array([0.9, 0.9, 0.9]);	// South Pole: brightest gray.
	  var sliceAngle = Math.PI/slices;	// lattitude angle spanned by one slice.
	
		// Create a (global) array to hold this sphere's vertices:
	  spinSphVerts = new Float32Array(  ((slices * 2* sliceVerts) -2) * floatsPerVertex);
											// # of vertices * # of elements needed to store them. 
											// each slice requires 2*sliceVerts vertices except 1st and
											// last ones, which require only 2*sliceVerts-1.
											
		// Create dome-shaped top slice of sphere at z=+1
		// s counts slices; v counts vertices; 
		// j counts array elements (vertices * elements per vertex)
		var cos0 = 0.0;					// sines,cosines of slice's top, bottom edge.
		var sin0 = 0.0;
		var cos1 = 0.0;
		var sin1 = 0.0;	
		var j = 0;							// initialize our array index
		var isLast = 0;
		var isFirst = 1;
		for(s=0; s<slices; s++) {	// for each slice of the sphere,
			// find sines & cosines for top and bottom of this slice
			if(s==0) {
				isFirst = 1;	// skip 1st vertex of 1st slice.
				cos0 = 1.0; 	// initialize: start at north pole.
				sin0 = 0.0;
			}
			else {					// otherwise, new top edge == old bottom edge
				isFirst = 0;	
				cos0 = cos1;
				sin0 = sin1;
			}								// & compute sine,cosine for new bottom edge.
			cos1 = Math.cos((s+1)*sliceAngle);
			sin1 = Math.sin((s+1)*sliceAngle);
			// go around the entire slice, generating TRIANGLE_STRIP verts
			// (Note we don't initialize j; grows with each new attrib,vertex, and slice)
			if(s==slices-1) isLast=1;	// skip last vertex of last slice.
			for(v=isFirst; v< 2*sliceVerts-isLast; v++, j+=floatsPerVertex) {	
				if(v%2==0)
				{				// put even# vertices at the the slice's top edge
								// (why PI and not 2*PI? because 0 <= v < 2*sliceVerts
								// and thus we can simplify cos(2*PI(v/2*sliceVerts))  
					spinSphVerts[j  ] = sin0 * Math.cos(Math.PI*(v)/sliceVerts); 	
					spinSphVerts[j+1] = sin0 * Math.sin(Math.PI*(v)/sliceVerts);	
					spinSphVerts[j+2] = cos0;		
					spinSphVerts[j+3] = 1.0;			
				}
				else { 	// put odd# vertices around the slice's lower edge;
								// x,y,z,w == cos(theta),sin(theta), 1.0, 1.0
								// 					theta = 2*PI*((v-1)/2)/capVerts = PI*(v-1)/capVerts
					spinSphVerts[j  ] = sin1 * Math.cos(Math.PI*(v-1)/sliceVerts);		// x
					spinSphVerts[j+1] = sin1 * Math.sin(Math.PI*(v-1)/sliceVerts);		// y
					spinSphVerts[j+2] = cos1;																				// z
					spinSphVerts[j+3] = 1.0;																				// w.		
				}
				// if(s==0) {	// finally, set some interesting colors for vertices:
				// 	spinSphVerts[j+4]=topColr[0]; 
				// 	spinSphVerts[j+5]=topColr[1]; 
				// 	spinSphVerts[j+6]=topColr[2];	
				// 	}
				// else if(s==slices-1) {
				// 	spinSphVerts[j+4]=botColr[0]; 
				// 	spinSphVerts[j+5]=botColr[1]; 
				// 	spinSphVerts[j+6]=botColr[2];	
				// }
				spinSphVerts[j+4]=topColr[0]; 
				spinSphVerts[j+5]=topColr[1]; 
				spinSphVerts[j+6]=topColr[2];	

			}
		}
	}











function makeGroundGrid() {
	//==============================================================================
	// Create a list of vertices that create a large grid of lines in the x,y plane
	// centered at x=y=z=0.  Draw this shape using the GL_LINES primitive.
	
		var xcount = 100;			// # of lines to draw in x,y to make the grid.
		var ycount = 100;		
		var xymax	= 50.0;			// grid size; extends to cover +/-xymax in x and y.
		 var xColr = new Float32Array([1.0, 1.0, 0.3]);	// bright yellow
		 var yColr = new Float32Array([0.5, 1.0, 0.5]);	// bright green.
		 
		// Create an (global) array to hold this ground-plane's vertices:
		gndVerts = new Float32Array(floatsPerVertex*2*(xcount+ycount));
							// draw a grid made of xcount+ycount lines; 2 vertices per line.
							
		var xgap = xymax/(xcount-1);		// HALF-spacing between lines in x,y;
		var ygap = xymax/(ycount-1);		// (why half? because v==(0line number/2))
		
		// First, step thru x values as we make vertical lines of constant-x:
		for(v=0, j=0; v<2*xcount; v++, j+= floatsPerVertex) {
			if(v%2==0) {	// put even-numbered vertices at (xnow, -xymax, 0)
				gndVerts[j  ] = -xymax + (v  )*xgap;	// x
				gndVerts[j+1] = -xymax;								// y
				gndVerts[j+2] = 0.0;									// z
				gndVerts[j+3] = 1.0;									// w.
			}
			else {				// put odd-numbered vertices at (xnow, +xymax, 0).
				gndVerts[j  ] = -xymax + (v-1)*xgap;	// x
				gndVerts[j+1] = xymax;								// y
				gndVerts[j+2] = 0.0;									// z
				gndVerts[j+3] = 1.0;									// w.
			}
			gndVerts[j+4] = xColr[0];			// red
			gndVerts[j+5] = xColr[1];			// grn
			gndVerts[j+6] = xColr[2];			// blu
		}
		// Second, step thru y values as wqe make horizontal lines of constant-y:
		// (don't re-initialize j--we're adding more vertices to the array)
		for(v=0; v<2*ycount; v++, j+= floatsPerVertex) {
			if(v%2==0) {		// put even-numbered vertices at (-xymax, ynow, 0)
				gndVerts[j  ] = -xymax;								// x
				gndVerts[j+1] = -xymax + (v  )*ygap;	// y
				gndVerts[j+2] = 0.0;									// z
				gndVerts[j+3] = 1.0;									// w.
			}
			else {					// put odd-numbered vertices at (+xymax, ynow, 0).
				gndVerts[j  ] = xymax;								// x
				gndVerts[j+1] = -xymax + (v-1)*ygap;	// y
				gndVerts[j+2] = 0.0;									// z
				gndVerts[j+3] = 1.0;									// w.
			}
			gndVerts[j+4] = yColr[0];			// red
			gndVerts[j+5] = yColr[1];			// grn
			gndVerts[j+6] = yColr[2];			// blu
		}
	}
function makeAxes(){

	myaxes=new Float32Array([
     	// Drawing Axes: Draw them using gl.LINES drawing primitive;
     	// +x axis RED; +y axis GREEN; +z axis BLUE; origin: GRAY
		 0.0,  0.0,  0.0, 1.0,		0.3,  0.3,  0.3,	// X axis line (origin: gray)
		 1.3,  0.0,  0.0, 1.0,		1.0,  0.3,  0.3,	// 						 (endpoint: red)
		 
		 0.0,  0.0,  0.0, 1.0,    0.3,  0.3,  0.3,	// Y axis line (origin: white)
		 0.0,  1.3,  0.0, 1.0,		0.3,  1.0,  0.3,	//						 (endpoint: green)

		 0.0,  0.0,  0.0, 1.0,		0.3,  0.3,  0.3,	// Z axis line (origin:white)
		 0.0,  0.0,  1.3, 1.0,		0.3,  0.3,  1.0,	//						 (endpoint: blue)
	]);
}

function makeCube(){
	var c30 = Math.sqrt(0.75);					// == cos(30deg) == sqrt(3) / 2
	var sq2	= Math.sqrt(2.0);			
my_cube=new Float32Array([
//my cube part I(36)
		   //upper side
		   0.0, 0.5, 0.0, 1.0,		0.0, 	0.0,	1.0,
		   0.0, 0.5, 0.5, 1.0,		0.0, 	0.0,	1.0,
		   0.5, 0.5, 0.0, 1.0,		250/255,214/255,29/255,
		   0.5, 0.5, 0.0, 1.0,		0.0, 	0.0,	1.0,
		   0.0, 0.5, 0.5, 1.0,		0.0, 	0.0,	1.0,
		   0.5, 0.5, 0.5, 1.0,		0.0, 	1.0,	1.0,
		   //base
			0.0,  0.0, 0.0, 1.0,		0.0, 	1.0,	1.0,
			0.5,  0.0, 0.0, 1.0,			0.0, 	1.0,	1.0,
			0.0, 0.0, 0.5, 1.0,	        0.0, 	0.0,	1.0,
			0.0, 0.0, 0.5, 1.0,  		0.0, 	1.0,	1.0,
			0.5,  0.0, 0.0, 1.0,		250/255,214/255,29/255,	
			0.5,  0.0, 0.5, 1.0,		1,0,0,
		   //left
		   0.0, 0.0, 0.0, 1.0,		0.0, 	0.0,	1.0,
		   0.0, 0.0, 0.5, 1.0,		0.0, 	1.0,	1.0,
		   0.0, 0.5, 0.0, 1.0,		0.0, 	0.2,	1.0,
		   0.0, 0.5, 0.0, 1.0,	    1.0, 	1.0,	0.0,
		   0.0, 0.0, 0.5, 1.0,		0.0, 	1.0,	1.0,
		   0.0, 0.5, 0.5, 1.0,		250/255,214/255,29/255,
		   //right
			0.5,  0.0, 0.0, 1.0,		250/255,4/255,29/255,
			0.5,  0.5, 0.0, 1.0,		20/255,214/255,29/255,
			0.5, 0.0, 0.5, 1.0,		50/255,24/255,29/255,
			0.5, 0.0, 0.5, 1.0,  		2/255,24/255,29/255,
			0.5,  0.5, 0.0, 1.0,		250/255,21/255,29/255,
			0.5,  0.5, 0.5, 1.0,		250/255,2/255,229/255,
		   //front
		   0.0, 0.5, 0.5, 1.0,		250/255,214/255,29/255,
		   0.0, 0.0, 0.5, 1.0,		250/255,214/255,219/255,
		   0.5, 0.5, 0.5, 1.0,		250/255,214/255,229/255,
		   0.5, 0.5, 0.5, 1.0,		220/255,214/255,249/255,
		   0.0, 0.0, 0.5, 1.0,		210/255,24/255,29/255,
		   0.5, 0.0, 0.5, 1.0,		20/255,22/255,29/255,
		   //back
			0.0,  0.5, 0.0, 1.0,		250/255,214/255,219/255,
			0.5,  0.5, 0.0, 1.0,		230/255,24/255,230/255,
			0.0, 0.0, 0.0, 1.0,		230/255,224/255,29/255,
			0.0, 0.0, 0.0, 1.0, 		220/255,244/255,22/255,
			0.5,  0.5, 0.0, 1.0,		220/255,224/255,211/255,
			0.5,  0.0, 0.50, 1.0,		210/255,224/255,220/255,


]);

}
function makePikachu(){
	var j=Math.PI/180;
	pikachu = new Float32Array([
		   //my cube part I(36)
		   //upper side
		   0.0, 0.5, 0.0, 1.0,		250/255,214/255,29/255,
		   0.0, 0.5, 0.5, 1.0,		250/255,214/255,29/255,
		   0.5, 0.5, 0.0, 1.0,		250/255,214/255,29/255,
		   0.5, 0.5, 0.0, 1.0,		250/255,214/255,29/255,
		   0.0, 0.5, 0.5, 1.0,		250/255,214/255,29/255,
		   0.5, 0.5, 0.5, 1.0,		250/255,214/255,29/255,
		   //base
			0.0,  0.0, 0.0, 1.0,		250/255,214/255,29/255,
			0.5,  0.0, 0.0, 1.0,		250/255,214/255,29/255,
			0.0, 0.0, 0.5, 1.0,		250/255,214/255,29/255,
			0.0, 0.0, 0.5, 1.0,  		250/255,214/255,29/255,
			0.5,  0.0, 0.0, 1.0,		250/255,214/255,29/255,	
			0.5,  0.0, 0.5, 1.0,		250/255,214/255,29/255,
		   //left
		   0.0, 0.0, 0.0, 1.0,		250/255,214/255,29/255,
		   0.0, 0.0, 0.5, 1.0,		250/255,214/255,29/255,
		   0.0, 0.5, 0.0, 1.0,		250/255,214/255,29/255,
		   0.0, 0.5, 0.0, 1.0,		250/255,214/255,29/255,
		   0.0, 0.0, 0.5, 1.0,		250/255,214/255,29/255,
		   0.0, 0.5, 0.5, 1.0,		250/255,214/255,29/255,
		   //right
			0.5,  0.0, 0.0, 1.0,		250/255,214/255,29/255,
			0.5,  0.5, 0.0, 1.0,		250/255,214/255,29/255,
			0.5, 0.0, 0.5, 1.0,		250/255,214/255,29/255,
			0.5, 0.0, 0.5, 1.0,  		250/255,214/255,29/255,
			0.5,  0.5, 0.0, 1.0,		250/255,214/255,29/255,
			0.5,  0.5, 0.5, 1.0,		250/255,214/255,29/255,
		   //front
		   0.0, 0.5, 0.5, 1.0,		250/255,214/255,29/255,
		   0.0, 0.0, 0.5, 1.0,		250/255,214/255,29/255,
		   0.5, 0.5, 0.5, 1.0,		250/255,214/255,29/255,
		   0.5, 0.5, 0.5, 1.0,		250/255,214/255,29/255,
		   0.0, 0.0, 0.5, 1.0,		250/255,214/255,29/255,
		   0.5, 0.0, 0.5, 1.0,		250/255,214/255,29/255,
		   //back
			0.0,  0.5, 0.0, 1.0,		250/255,214/255,29/255,
			0.5,  0.5, 0.0, 1.0,		250/255,214/255,29/255,
			0.0, 0.0, 0.0, 1.0,		250/255,214/255,29/255,
			0.0, 0.0, 0.0, 1.0, 		250/255,214/255,29/255,
			0.5,  0.5, 0.0, 1.0,		250/255,214/255,29/255,
			0.5,  0.0, 0.50, 1.0,		250/255,214/255,29/255,
			//left eyes(38)
			0.15, 0.3, 0.501, 1.0, 0,0,0,
			(Math.sin(j)+0.15*15)/15,(Math.cos(j)+0.3*15)/15, 0.501, 1.0,    0, 0, 0,
			(Math.sin(10*j)+0.15*15)/15,(Math.cos(10*j)+0.3*15)/15,0.501,1.0,    0, 0, 0,
			(Math.sin(20*j)+0.15*15)/15,(Math.cos(20*j)+0.3*15)/15,0.501,1.0,    0, 0, 0,
			(Math.sin(30*j)+0.15*15)/15,(Math.cos(30*j)+0.3*15)/15,0.501,1.0,    0, 0, 0,
			(Math.sin(40*j)+0.15*15)/15,(Math.cos(40*j)+0.3*15)/15,0.501,1.0,    0, 0, 0,
			(Math.sin(50*j)+0.15*15)/15,(Math.cos(50*j)+0.3*15)/15,0.501,1.0,    0, 0, 0,
			(Math.sin(60*j)+0.15*15)/15,(Math.cos(60*j)+0.3*15)/15,0.501,1.0,    0, 0, 0,
			(Math.sin(70*j)+0.15*15)/15,(Math.cos(70*j)+0.3*15)/15,0.501,1.0,    0, 0, 0,
			(Math.sin(80*j)+0.15*15)/15,(Math.cos(80*j)+0.3*15)/15,0.501,1.0,    0, 0, 0,
			(Math.sin(90*j)+0.15*15)/15,(Math.cos(90*j)+0.3*15)/15,0.501,1.0,    0, 0, 0,
			(Math.sin(100*j)+0.15*15)/15,(Math.cos(100*j)+0.3*15)/15,0.501,1.0,    0, 0, 0,
			(Math.sin(110*j)+0.15*15)/15,(Math.cos(110*j)+0.3*15)/15,0.501,1.0,    0, 0, 0,
			(Math.sin(120*j)+0.15*15)/15,(Math.cos(120*j)+0.3*15)/15,0.501,1.0,    0, 0, 0,
			(Math.sin(130*j)+0.15*15)/15,(Math.cos(130*j)+0.3*15)/15,0.501,1.0,    0, 0, 0,
			(Math.sin(140*j)+0.15*15)/15,(Math.cos(140*j)+0.3*15)/15,0.501,1.0,    0, 0, 0,
			(Math.sin(150*j)+0.15*15)/15,(Math.cos(150*j)+0.3*15)/15,0.501,1.0,    0, 0, 0,
			(Math.sin(160*j)+0.15*15)/15,(Math.cos(160*j)+0.3*15)/15,0.501,1.0,    0, 0, 0,
			(Math.sin(170*j)+0.15*15)/15,(Math.cos(170*j)+0.3*15)/15,0.501,1.0,    0, 0, 0,
			(Math.sin(180*j)+0.15*15)/15,(Math.cos(180*j)+0.3*15)/15,0.501,1.0,    0, 0, 0,
			(Math.sin(190*j)+0.15*15)/15,(Math.cos(190*j)+0.3*15)/15,0.501,1.0,    0, 0, 0,
			(Math.sin(200*j)+0.15*15)/15,(Math.cos(200*j)+0.3*15)/15,0.501,1.0,    0, 0, 0,
			(Math.sin(210*j)+0.15*15)/15,(Math.cos(210*j)+0.3*15)/15,0.501,1.0,    0, 0, 0,
			(Math.sin(220*j)+0.15*15)/15,(Math.cos(220*j)+0.3*15)/15,0.501,1.0,    0, 0, 0,
			(Math.sin(230*j)+0.15*15)/15,(Math.cos(230*j)+0.3*15)/15,0.501,1.0,    0, 0, 0,
			(Math.sin(240*j)+0.15*15)/15,(Math.cos(240*j)+0.3*15)/15,0.501,1.0,    0, 0, 0,
			(Math.sin(250*j)+0.15*15)/15,(Math.cos(250*j)+0.3*15)/15,0.501,1.0,    0, 0, 0,
			(Math.sin(260*j)+0.15*15)/15,(Math.cos(260*j)+0.3*15)/15,0.501,1.0,    0, 0, 0,
			(Math.sin(270*j)+0.15*15)/15,(Math.cos(270*j)+0.3*15)/15,0.501,1.0,    0, 0, 0,
			(Math.sin(280*j)+0.15*15)/15,(Math.cos(280*j)+0.3*15)/15,0.501,1.0,    0, 0, 0,
			(Math.sin(290*j)+0.15*15)/15,(Math.cos(290*j)+0.3*15)/15,0.501,1.0,    0, 0, 0,
			(Math.sin(300*j)+0.15*15)/15,(Math.cos(300*j)+0.3*15)/15,0.501,1.0,    0, 0, 0,
			(Math.sin(310*j)+0.15*15)/15,(Math.cos(310*j)+0.3*15)/15,0.501,1.0,    0, 0, 0,
			(Math.sin(320*j)+0.15*15)/15,(Math.cos(320*j)+0.3*15)/15,0.501,1.0,    0, 0, 0,
			(Math.sin(330*j)+0.15*15)/15,(Math.cos(330*j)+0.3*15)/15,0.501,1.0,    0, 0, 0,
			(Math.sin(340*j)+0.15*15)/15,(Math.cos(340*j)+0.3*15)/15,0.501,1.0,    0, 0, 0,
			(Math.sin(350*j)+0.15*15)/15,(Math.cos(350*j)+0.3*15)/15,0.501,1.0,    0, 0, 0,
			(Math.sin(361*j)+0.15*15)/15,(Math.cos(361*j)+0.3*15)/15,0.501,1.0,    0, 0, 0,
	  
			//left_eye_white(38)
			0.17, 0.32, 0.5011, 1.0, 1,1,1,
			(Math.sin(j)+0.17*22)/22,(Math.cos(j)+0.32*22)/22, 0.5011, 1.0,    1, 1, 1,
			(Math.sin(10*j)+0.17*22)/22,(Math.cos(10*j)+0.32*22)/22,0.5011,1.0,    1, 1, 1,
			(Math.sin(20*j)+0.17*22)/22,(Math.cos(20*j)+0.32*22)/22,0.5011,1.0,    1, 1, 1,
			(Math.sin(30*j)+0.17*22)/22,(Math.cos(30*j)+0.32*22)/22,0.5011,1.0,    1, 1, 1,
			(Math.sin(40*j)+0.17*22)/22,(Math.cos(40*j)+0.32*22)/22,0.5011,1.0,    1, 1, 1,
			(Math.sin(50*j)+0.17*22)/22,(Math.cos(50*j)+0.32*22)/22,0.5011,1.0,    1, 1, 1,
			(Math.sin(60*j)+0.17*22)/22,(Math.cos(60*j)+0.32*22)/22,0.5011,1.0,    1, 1, 1,
			(Math.sin(70*j)+0.17*22)/22,(Math.cos(70*j)+0.32*22)/22,0.5011,1.0,    1, 1, 1,
			(Math.sin(80*j)+0.17*22)/22,(Math.cos(80*j)+0.32*22)/22,0.5011,1.0,    1, 1, 1,
			(Math.sin(90*j)+0.17*22)/22,(Math.cos(90*j)+0.32*22)/22,0.5011,1.0,    1, 1, 1,
			(Math.sin(100*j)+0.17*22)/22,(Math.cos(100*j)+0.32*22)/22,0.5011,1.0,    1, 1, 1,
			(Math.sin(110*j)+0.17*22)/22,(Math.cos(110*j)+0.32*22)/22,0.5011,1.0,    1, 1, 1,
			(Math.sin(120*j)+0.17*22)/22,(Math.cos(120*j)+0.32*22)/22,0.5011,1.0,    1, 1, 1,
			(Math.sin(130*j)+0.17*22)/22,(Math.cos(130*j)+0.32*22)/22,0.5011,1.0,    1, 1, 1,
			(Math.sin(140*j)+0.17*22)/22,(Math.cos(140*j)+0.32*22)/22,0.5011,1.0,    1, 1, 1,
			(Math.sin(150*j)+0.17*22)/22,(Math.cos(150*j)+0.32*22)/22,0.5011,1.0,    1, 1, 1,
			(Math.sin(160*j)+0.17*22)/22,(Math.cos(160*j)+0.32*22)/22,0.5011,1.0,    1, 1, 1,
			(Math.sin(170*j)+0.17*22)/22,(Math.cos(170*j)+0.32*22)/22,0.5011,1.0,    1, 1, 1,
			(Math.sin(180*j)+0.17*22)/22,(Math.cos(180*j)+0.32*22)/22,0.5011,1.0,    1, 1, 1,
			(Math.sin(190*j)+0.17*22)/22,(Math.cos(190*j)+0.32*22)/22,0.5011,1.0,    1, 1, 1,
			(Math.sin(200*j)+0.17*22)/22,(Math.cos(200*j)+0.32*22)/22,0.5011,1.0,    1, 1, 1,
			(Math.sin(210*j)+0.17*22)/22,(Math.cos(210*j)+0.32*22)/22,0.5011,1.0,    1, 1, 1,
			(Math.sin(220*j)+0.17*22)/22,(Math.cos(220*j)+0.32*22)/22,0.5011,1.0,    1, 1, 1,
			(Math.sin(230*j)+0.17*22)/22,(Math.cos(230*j)+0.32*22)/22,0.5011,1.0,    1, 1, 1,
			(Math.sin(240*j)+0.17*22)/22,(Math.cos(240*j)+0.32*22)/22,0.5011,1.0,    1, 1, 1,
			(Math.sin(250*j)+0.17*22)/22,(Math.cos(250*j)+0.32*22)/22,0.5011,1.0,    1, 1, 1,
			(Math.sin(260*j)+0.17*22)/22,(Math.cos(260*j)+0.32*22)/22,0.5011,1.0,    1, 1, 1,
			(Math.sin(270*j)+0.17*22)/22,(Math.cos(270*j)+0.32*22)/22,0.5011,1.0,    1, 1, 1,
			(Math.sin(280*j)+0.17*22)/22,(Math.cos(280*j)+0.32*22)/22,0.5011,1.0,    1, 1, 1,
			(Math.sin(290*j)+0.17*22)/22,(Math.cos(290*j)+0.32*22)/22,0.5011,1.0,    1, 1, 1,
			(Math.sin(300*j)+0.17*22)/22,(Math.cos(300*j)+0.32*22)/22,0.5011,1.0,    1, 1, 1,
			(Math.sin(310*j)+0.17*22)/22,(Math.cos(310*j)+0.32*22)/22,0.5011,1.0,    1, 1, 1,
			(Math.sin(320*j)+0.17*22)/22,(Math.cos(320*j)+0.32*22)/22,0.5011,1.0,    1, 1, 1,
			(Math.sin(330*j)+0.17*22)/22,(Math.cos(330*j)+0.32*22)/22,0.5011,1.0,    1, 1, 1,
			(Math.sin(340*j)+0.17*22)/22,(Math.cos(340*j)+0.32*22)/22,0.5011,1.0,    1, 1, 1,
			(Math.sin(350*j)+0.17*22)/22,(Math.cos(350*j)+0.32*22)/22,0.5011,1.0,    1, 1, 1,
			(Math.sin(361*j)+0.17*22)/22,(Math.cos(361*j)+0.32*22)/22,0.5011,1.0,    1, 1, 1,
		  //right eyes(38)
		  0.35, 0.3, 0.501, 1.0, 0,0,0,
		  (Math.sin(j)+0.35*15)/15,(Math.cos(j)+0.3*15)/15, 0.501, 1.0,    0, 0, 0,
		  (Math.sin(10*j)+0.35*15)/15,(Math.cos(10*j)+0.3*15)/15,0.501,1.0,    0, 0, 0,
		  (Math.sin(20*j)+0.35*15)/15,(Math.cos(20*j)+0.3*15)/15,0.501,1.0,    0, 0, 0,
		  (Math.sin(30*j)+0.35*15)/15,(Math.cos(30*j)+0.3*15)/15,0.501,1.0,    0, 0, 0,
		  (Math.sin(40*j)+0.35*15)/15,(Math.cos(40*j)+0.3*15)/15,0.501,1.0,    0, 0, 0,
		  (Math.sin(50*j)+0.35*15)/15,(Math.cos(50*j)+0.3*15)/15,0.501,1.0,    0, 0, 0,
		  (Math.sin(60*j)+0.35*15)/15,(Math.cos(60*j)+0.3*15)/15,0.501,1.0,    0, 0, 0,
		  (Math.sin(70*j)+0.35*15)/15,(Math.cos(70*j)+0.3*15)/15,0.501,1.0,    0, 0, 0,
		  (Math.sin(80*j)+0.35*15)/15,(Math.cos(80*j)+0.3*15)/15,0.501,1.0,    0, 0, 0,
		  (Math.sin(90*j)+0.35*15)/15,(Math.cos(90*j)+0.3*15)/15,0.501,1.0,    0, 0, 0,
		  (Math.sin(100*j)+0.35*15)/15,(Math.cos(100*j)+0.3*15)/15,0.501,1.0,    0, 0, 0,
		  (Math.sin(110*j)+0.35*15)/15,(Math.cos(110*j)+0.3*15)/15,0.501,1.0,    0, 0, 0,
		  (Math.sin(120*j)+0.35*15)/15,(Math.cos(120*j)+0.3*15)/15,0.501,1.0,    0, 0, 0,
		  (Math.sin(130*j)+0.35*15)/15,(Math.cos(130*j)+0.3*15)/15,0.501,1.0,    0, 0, 0,
		  (Math.sin(140*j)+0.35*15)/15,(Math.cos(140*j)+0.3*15)/15,0.501,1.0,    0, 0, 0,
		  (Math.sin(150*j)+0.35*15)/15,(Math.cos(150*j)+0.3*15)/15,0.501,1.0,    0, 0, 0,
		  (Math.sin(160*j)+0.35*15)/15,(Math.cos(160*j)+0.3*15)/15,0.501,1.0,    0, 0, 0,
		  (Math.sin(170*j)+0.35*15)/15,(Math.cos(170*j)+0.3*15)/15,0.501,1.0,    0, 0, 0,
		  (Math.sin(180*j)+0.35*15)/15,(Math.cos(180*j)+0.3*15)/15,0.501,1.0,    0, 0, 0,
		  (Math.sin(190*j)+0.35*15)/15,(Math.cos(190*j)+0.3*15)/15,0.501,1.0,    0, 0, 0,
		  (Math.sin(200*j)+0.35*15)/15,(Math.cos(200*j)+0.3*15)/15,0.501,1.0,    0, 0, 0,
		  (Math.sin(210*j)+0.35*15)/15,(Math.cos(210*j)+0.3*15)/15,0.501,1.0,    0, 0, 0,
		  (Math.sin(220*j)+0.35*15)/15,(Math.cos(220*j)+0.3*15)/15,0.501,1.0,    0, 0, 0,
		  (Math.sin(230*j)+0.35*15)/15,(Math.cos(230*j)+0.3*15)/15,0.501,1.0,    0, 0, 0,
		  (Math.sin(240*j)+0.35*15)/15,(Math.cos(240*j)+0.3*15)/15,0.501,1.0,    0, 0, 0,
		  (Math.sin(250*j)+0.35*15)/15,(Math.cos(250*j)+0.3*15)/15,0.501,1.0,    0, 0, 0,
		  (Math.sin(260*j)+0.35*15)/15,(Math.cos(260*j)+0.3*15)/15,0.501,1.0,    0, 0, 0,
		  (Math.sin(270*j)+0.35*15)/15,(Math.cos(270*j)+0.3*15)/15,0.501,1.0,    0, 0, 0,
		  (Math.sin(280*j)+0.35*15)/15,(Math.cos(280*j)+0.3*15)/15,0.501,1.0,    0, 0, 0,
		  (Math.sin(290*j)+0.35*15)/15,(Math.cos(290*j)+0.3*15)/15,0.501,1.0,    0, 0, 0,
		  (Math.sin(300*j)+0.35*15)/15,(Math.cos(300*j)+0.3*15)/15,0.501,1.0,    0, 0, 0,
		  (Math.sin(310*j)+0.35*15)/15,(Math.cos(310*j)+0.3*15)/15,0.501,1.0,    0, 0, 0,
		  (Math.sin(320*j)+0.35*15)/15,(Math.cos(320*j)+0.3*15)/15,0.501,1.0,    0, 0, 0,
		  (Math.sin(330*j)+0.35*15)/15,(Math.cos(330*j)+0.3*15)/15,0.501,1.0,    0, 0, 0,
		  (Math.sin(340*j)+0.35*15)/15,(Math.cos(340*j)+0.3*15)/15,0.501,1.0,    0, 0, 0,
		  (Math.sin(350*j)+0.35*15)/15,(Math.cos(350*j)+0.3*15)/15,0.501,1.0,    0, 0, 0,
		  (Math.sin(361*j)+0.35*15)/15,(Math.cos(361*j)+0.3*15)/15,0.501,1.0,    0, 0, 0,
		  
		  //right_eye_white(38)
		  0.37, 0.32, 0.5011, 1.0, 1,1,1,
		  (Math.sin(j)+0.37*22)/22,(Math.cos(j)+0.32*22)/22, 0.5011, 1.0,    1, 1, 1,
		  (Math.sin(10*j)+0.37*22)/22,(Math.cos(10*j)+0.32*22)/22,0.5011,1.0,    1, 1, 1,
		  (Math.sin(20*j)+0.37*22)/22,(Math.cos(20*j)+0.32*22)/22,0.5011,1.0,    1, 1, 1,
		  (Math.sin(30*j)+0.37*22)/22,(Math.cos(30*j)+0.32*22)/22,0.5011,1.0,    1, 1, 1,
		  (Math.sin(40*j)+0.37*22)/22,(Math.cos(40*j)+0.32*22)/22,0.5011,1.0,    1, 1, 1,
		  (Math.sin(50*j)+0.37*22)/22,(Math.cos(50*j)+0.32*22)/22,0.5011,1.0,    1, 1, 1,
		  (Math.sin(60*j)+0.37*22)/22,(Math.cos(60*j)+0.32*22)/22,0.5011,1.0,    1, 1, 1,
		  (Math.sin(70*j)+0.37*22)/22,(Math.cos(70*j)+0.32*22)/22,0.5011,1.0,    1, 1, 1,
		  (Math.sin(80*j)+0.37*22)/22,(Math.cos(80*j)+0.32*22)/22,0.5011,1.0,    1, 1, 1,
		  (Math.sin(90*j)+0.37*22)/22,(Math.cos(90*j)+0.32*22)/22,0.5011,1.0,    1, 1, 1,
		  (Math.sin(100*j)+0.37*22)/22,(Math.cos(100*j)+0.32*22)/22,0.5011,1.0,    1, 1, 1,
		  (Math.sin(110*j)+0.37*22)/22,(Math.cos(110*j)+0.32*22)/22,0.5011,1.0,    1, 1, 1,
		  (Math.sin(120*j)+0.37*22)/22,(Math.cos(120*j)+0.32*22)/22,0.5011,1.0,    1, 1, 1,
		  (Math.sin(130*j)+0.37*22)/22,(Math.cos(130*j)+0.32*22)/22,0.5011,1.0,    1, 1, 1,
		  (Math.sin(140*j)+0.37*22)/22,(Math.cos(140*j)+0.32*22)/22,0.5011,1.0,    1, 1, 1,
		  (Math.sin(150*j)+0.37*22)/22,(Math.cos(150*j)+0.32*22)/22,0.5011,1.0,    1, 1, 1,
		  (Math.sin(160*j)+0.37*22)/22,(Math.cos(160*j)+0.32*22)/22,0.5011,1.0,    1, 1, 1,
		  (Math.sin(170*j)+0.37*22)/22,(Math.cos(170*j)+0.32*22)/22,0.5011,1.0,    1, 1, 1,
		  (Math.sin(180*j)+0.37*22)/22,(Math.cos(180*j)+0.32*22)/22,0.5011,1.0,    1, 1, 1,
		  (Math.sin(190*j)+0.37*22)/22,(Math.cos(190*j)+0.32*22)/22,0.5011,1.0,    1, 1, 1,
		  (Math.sin(200*j)+0.37*22)/22,(Math.cos(200*j)+0.32*22)/22,0.5011,1.0,    1, 1, 1,
		  (Math.sin(210*j)+0.37*22)/22,(Math.cos(210*j)+0.32*22)/22,0.5011,1.0,    1, 1, 1,
		  (Math.sin(220*j)+0.37*22)/22,(Math.cos(220*j)+0.32*22)/22,0.5011,1.0,    1, 1, 1,
		  (Math.sin(230*j)+0.37*22)/22,(Math.cos(230*j)+0.32*22)/22,0.5011,1.0,    1, 1, 1,
		  (Math.sin(240*j)+0.37*22)/22,(Math.cos(240*j)+0.32*22)/22,0.5011,1.0,    1, 1, 1,
		  (Math.sin(250*j)+0.37*22)/22,(Math.cos(250*j)+0.32*22)/22,0.5011,1.0,    1, 1, 1,
		  (Math.sin(260*j)+0.37*22)/22,(Math.cos(260*j)+0.32*22)/22,0.5011,1.0,    1, 1, 1,
		  (Math.sin(270*j)+0.37*22)/22,(Math.cos(270*j)+0.32*22)/22,0.5011,1.0,    1, 1, 1,
		  (Math.sin(280*j)+0.37*22)/22,(Math.cos(280*j)+0.32*22)/22,0.5011,1.0,    1, 1, 1,
		  (Math.sin(290*j)+0.37*22)/22,(Math.cos(290*j)+0.32*22)/22,0.5011,1.0,    1, 1, 1,
		  (Math.sin(300*j)+0.37*22)/22,(Math.cos(300*j)+0.32*22)/22,0.5011,1.0,    1, 1, 1,
		  (Math.sin(310*j)+0.37*22)/22,(Math.cos(310*j)+0.32*22)/22,0.5011,1.0,    1, 1, 1,
		  (Math.sin(320*j)+0.37*22)/22,(Math.cos(320*j)+0.32*22)/22,0.5011,1.0,    1, 1, 1,
		  (Math.sin(330*j)+0.37*22)/22,(Math.cos(330*j)+0.32*22)/22,0.5011,1.0,    1, 1, 1,
		  (Math.sin(340*j)+0.37*22)/22,(Math.cos(340*j)+0.32*22)/22,0.5011,1.0,    1, 1, 1,
		  (Math.sin(350*j)+0.37*22)/22,(Math.cos(350*j)+0.32*22)/22,0.5011,1.0,    1, 1, 1,
		  (Math.sin(361*j)+0.37*22)/22,(Math.cos(361*j)+0.32*22)/22,0.5011,1.0,    1, 1, 1,
		  //noses(38)
		  0.254, 0.235, 0.501, 1.0, 0,0,0,
		  (Math.sin(j)+0.254*75)/75,(Math.cos(j)+0.235*120)/120, 0.5011, 1.0,    0, 0, 0,
		  (Math.sin(10*j)+0.254*75)/75,(Math.cos(10*j)+0.235*120)/120,0.5011,1.0,    0, 0, 0,
		  (Math.sin(20*j)+0.254*75)/75,(Math.cos(20*j)+0.235*120)/120,0.5011,1.0,    0, 0, 0,
		  (Math.sin(30*j)+0.254*75)/75,(Math.cos(30*j)+0.235*120)/120,0.5011,1.0,    0, 0, 0,
		  (Math.sin(40*j)+0.254*75)/75,(Math.cos(40*j)+0.235*120)/120,0.5011,1.0,    0, 0, 0,
		  (Math.sin(50*j)+0.254*75)/75,(Math.cos(50*j)+0.235*120)/120,0.5011,1.0,    0, 0, 0,
		  (Math.sin(60*j)+0.254*75)/75,(Math.cos(60*j)+0.235*120)/120,0.5011,1.0,    0, 0, 0,
		  (Math.sin(70*j)+0.254*75)/75,(Math.cos(70*j)+0.235*120)/120,0.5011,1.0,    0, 0, 0,
		  (Math.sin(80*j)+0.254*75)/75,(Math.cos(80*j)+0.235*120)/120,0.5011,1.0,    0, 0, 0,
		  (Math.sin(90*j)+0.254*75)/75,(Math.cos(90*j)+0.235*120)/120,0.5011,1.0,    0, 0, 0,
		  (Math.sin(100*j)+0.254*75)/75,(Math.cos(100*j)+0.235*120)/120,0.5011,1.0,    0, 0, 0,
		  (Math.sin(110*j)+0.254*75)/75,(Math.cos(110*j)+0.235*120)/120,0.5011,1.0,    0, 0, 0,
		  (Math.sin(120*j)+0.254*75)/75,(Math.cos(120*j)+0.235*120)/120,0.5011,1.0,    0, 0, 0,
		  (Math.sin(130*j)+0.254*75)/75,(Math.cos(130*j)+0.235*120)/120,0.5011,1.0,    0, 0, 0,
		  (Math.sin(140*j)+0.254*75)/75,(Math.cos(140*j)+0.235*120)/120,0.5011,1.0,    0, 0, 0,
		  (Math.sin(150*j)+0.254*75)/75,(Math.cos(150*j)+0.235*120)/120,0.5011,1.0,    0, 0, 0,
		  (Math.sin(160*j)+0.254*75)/75,(Math.cos(160*j)+0.235*120)/120,0.5011,1.0,    0, 0, 0,
		  (Math.sin(170*j)+0.254*75)/75,(Math.cos(170*j)+0.235*120)/120,0.5011,1.0,    0, 0, 0,
		  (Math.sin(180*j)+0.254*75)/75,(Math.cos(180*j)+0.235*120)/120,0.5011,1.0,    0, 0, 0,
		  (Math.sin(190*j)+0.254*75)/75,(Math.cos(190*j)+0.235*120)/120,0.5011,1.0,    0, 0, 0,
		  (Math.sin(200*j)+0.254*75)/75,(Math.cos(200*j)+0.235*120)/120,0.5011,1.0,    0, 0, 0,
		  (Math.sin(210*j)+0.254*75)/75,(Math.cos(210*j)+0.235*120)/120,0.5011,1.0,    0, 0, 0,
		  (Math.sin(220*j)+0.254*75)/75,(Math.cos(220*j)+0.235*120)/120,0.5011,1.0,    0, 0, 0,
		  (Math.sin(230*j)+0.254*75)/75,(Math.cos(230*j)+0.235*120)/120,0.5011,1.0,    0, 0, 0,
		  (Math.sin(240*j)+0.254*75)/75,(Math.cos(240*j)+0.235*120)/120,0.5011,1.0,    0, 0, 0,
		  (Math.sin(250*j)+0.254*75)/75,(Math.cos(250*j)+0.235*120)/120,0.5011,1.0,    0, 0, 0,
		  (Math.sin(260*j)+0.254*75)/75,(Math.cos(260*j)+0.235*120)/120,0.5011,1.0,    0, 0, 0,
		  (Math.sin(270*j)+0.254*75)/75,(Math.cos(270*j)+0.235*120)/120,0.5011,1.0,    0, 0, 0,
		  (Math.sin(280*j)+0.254*75)/75,(Math.cos(280*j)+0.235*120)/120,0.5011,1.0,    0, 0, 0,
		  (Math.sin(290*j)+0.254*75)/75,(Math.cos(290*j)+0.235*120)/120,0.5011,1.0,    0, 0, 0,
		  (Math.sin(300*j)+0.254*75)/75,(Math.cos(300*j)+0.235*120)/120,0.5011,1.0,    0, 0, 0,
		  (Math.sin(310*j)+0.254*75)/75,(Math.cos(310*j)+0.235*120)/120,0.5011,1.0,    0, 0, 0,
		  (Math.sin(320*j)+0.254*75)/75,(Math.cos(320*j)+0.235*120)/120,0.5011,1.0,    0, 0, 0,
		  (Math.sin(330*j)+0.254*75)/75,(Math.cos(330*j)+0.235*120)/120,0.5011,1.0,    0, 0, 0,
		  (Math.sin(340*j)+0.254*75)/75,(Math.cos(340*j)+0.235*120)/120,0.5011,1.0,    0, 0, 0,
		  (Math.sin(350*j)+0.254*75)/75,(Math.cos(350*j)+0.235*120)/120,0.5011,1.0,    0, 0, 0,
		  (Math.sin(361*j)+0.254*75)/75,(Math.cos(361*j)+0.235*120)/120,0.5011,1.0,    0, 0, 0,
	  //left_Mouth(13)
	  (Math.sin(120*j)+0.20*15)/15,(Math.cos(120*j)+0.17*25)/25,0.501,1.0,    0, 0, 0,
	  (Math.sin(130*j)+0.20*15)/15,(Math.cos(130*j)+0.17*25)/25,0.501,1.0,    0, 0, 0,
	  (Math.sin(140*j)+0.20*15)/15,(Math.cos(140*j)+0.17*25)/25,0.501,1.0,    0, 0, 0,
	  (Math.sin(150*j)+0.20*15)/15,(Math.cos(150*j)+0.17*25)/25,0.501,1.0,    0, 0, 0,
	  (Math.sin(160*j)+0.20*15)/15,(Math.cos(160*j)+0.17*25)/25,0.501,1.0,    0, 0, 0,
	  (Math.sin(170*j)+0.20*15)/15,(Math.cos(170*j)+0.17*25)/25,0.501,1.0,    0, 0, 0,
	  (Math.sin(180*j)+0.20*15)/15,(Math.cos(180*j)+0.17*25)/25,0.501,1.0,    0, 0, 0,
	  (Math.sin(190*j)+0.20*15)/15,(Math.cos(190*j)+0.17*25)/25,0.501,1.0,    0, 0, 0,
	  (Math.sin(200*j)+0.20*15)/15,(Math.cos(200*j)+0.17*25)/25,0.501,1.0,    0, 0, 0,
	  (Math.sin(210*j)+0.20*15)/15,(Math.cos(210*j)+0.17*25)/25,0.501,1.0,    0, 0, 0,
	  (Math.sin(220*j)+0.20*15)/15,(Math.cos(220*j)+0.17*25)/25,0.501,1.0,    0, 0, 0,
	  (Math.sin(230*j)+0.20*15)/15,(Math.cos(230*j)+0.17*25)/25,0.501,1.0,    0, 0, 0,
	  (Math.sin(240*j)+0.20*15)/15,(Math.cos(240*j)+0.17*25)/25,0.501,1.0,    0, 0, 0,
	  
	  //right_Mouth(13)
	  (Math.sin(120*j)+0.31*15)/15,(Math.cos(120*j)+0.17*25)/25,0.501,1.0,    0, 0, 0,
	  (Math.sin(130*j)+0.31*15)/15,(Math.cos(130*j)+0.17*25)/25,0.501,1.0,    0, 0, 0,
	  (Math.sin(140*j)+0.31*15)/15,(Math.cos(140*j)+0.17*25)/25,0.501,1.0,    0, 0, 0,
	  (Math.sin(150*j)+0.31*15)/15,(Math.cos(150*j)+0.17*25)/25,0.501,1.0,    0, 0, 0,
	  (Math.sin(160*j)+0.31*15)/15,(Math.cos(160*j)+0.17*25)/25,0.501,1.0,    0, 0, 0,
	  (Math.sin(170*j)+0.31*15)/15,(Math.cos(170*j)+0.17*25)/25,0.501,1.0,    0, 0, 0,
	  (Math.sin(180*j)+0.31*15)/15,(Math.cos(180*j)+0.17*25)/25,0.501,1.0,    0, 0, 0,
	  (Math.sin(190*j)+0.31*15)/15,(Math.cos(190*j)+0.17*25)/25,0.501,1.0,    0, 0, 0,
	  (Math.sin(200*j)+0.31*15)/15,(Math.cos(200*j)+0.17*25)/25,0.501,1.0,    0, 0, 0,
	  (Math.sin(210*j)+0.31*15)/15,(Math.cos(210*j)+0.17*25)/25,0.501,1.0,    0, 0, 0,
	  (Math.sin(220*j)+0.31*15)/15,(Math.cos(220*j)+0.17*25)/25,0.501,1.0,    0, 0, 0,
	  (Math.sin(230*j)+0.31*15)/15,(Math.cos(230*j)+0.17*25)/25,0.501,1.0,    0, 0, 0,
	  (Math.sin(240*j)+0.31*15)/15,(Math.cos(240*j)+0.17*25)/25,0.501,1.0,    0, 0, 0,
	   
	  //left_ear_part1
	  //left side
	  -0.125, 0.15, -0.125, 1.00,	225/255, 151/255, 32/255, //2
	  -0.125, -0.10, -0.125, 1.00,  225/255, 151/255, 32/255, 	 //1
	  -0.125, 0.15, 0.125, 1.00,   255/255, 222/255, 0,	//3
	  -0.125, 0.15, 0.125, 1.00,   255/255, 222/255, 0,	//3
	  -0.125, -0.10, -0.125, 1.00, 225/255, 151/255, 32/255, 	 //1
	  -0.125, -0.10, 0.125, 1.00,   255/255, 222/255, 0,	  //4
	  
	  //base side
	  -0.125, -0.10, -0.125, 1.00,  225/255, 151/255, 32/255, 	 //1
	  -0.125, 0.15, -0.125, 1.00,	225/255, 151/255, 32/255,   //2
	  0.00, 0.00, 0.00, 1.00,	255/255, 226/255, 111/255,   //0
	  //front side
	  0.00, 0.00, 0.00, 1.00,	255/255, 226/255, 111/255,   //0
	  -0.125, 0.15, 0.125, 1.00,   255/255, 222/255, 0,	//3
	  -0.125, -0.10, 0.125, 1.00,    255/255, 222/255, 0,	  //4
	  //upper side
	  0.00, 0.00, 0.00, 1.00,	255/255, 226/255, 111/255,   //0
	  -0.125, 0.15, -0.125, 1.00,	225/255, 151/255, 32/255,    //2
	  -0.125, 0.15, 0.125, 1.00,   255/255, 222/255, 0,	//3
	  //lower side
	  -0.125, -0.10, -0.125, 1.00,   225/255, 151/255, 32/255, 	 //1
	  0.00, 0.00, 0.00, 1.00,	255/255, 226/255, 111/255,  //0
	  -0.125, -0.10, 0.125, 1.00,   255/255, 222/255, 0,	 //4
	  
	  
	  //left_ear_part2
	  //base side
	  0.125,0.25*Math.sqrt(6)/3,-0.125*Math.sqrt(3)/3,1.00,  245/255,233/255,126/255,//1
	  0.00, 0.00, 0.00, 1.00,  245/255,233/255,126/255,//3
	  -0.125, 0.25*Math.sqrt(6)/3, -0.125*Math.sqrt(3)/3, 1.00,  245/255,233/255,126/255,//2
	  
	  //right side
	  0.00, 0.00, 0.00, 1.00, 245/255,233/255,126/255,//3
	  0.125,0.25*Math.sqrt(6)/3,-0.125*Math.sqrt(3)/3,1.00,  245/255,233/255,126/255,//1
	  0,0.25*Math.sqrt(6)/3,0.25*Math.sqrt(3)/3,1.00,  245/255,233/255,126/255,//4
	  //left side
	  0,0.25*Math.sqrt(6)/3,0.25*Math.sqrt(3)/3,1.00,  245/255,233/255,126/255,//4
	  -0.125, 0.25*Math.sqrt(6)/3, -0.125*Math.sqrt(3)/3, 1.00,  245/255,233/255,126/255,//2
	  0.00, 0.00, 0.00, 1.00, 245/255,233/255,126/255,//3
	  //upper side
	  0.125,0.25*Math.sqrt(6)/3,-0.125*Math.sqrt(3)/3,1.00,  245/255,233/255,126/255,//1
	  -0.125, 0.25*Math.sqrt(6)/3, -0.125*Math.sqrt(3)/3, 1.00,  245/255,233/255,126/255,//2
	  0,0.25*Math.sqrt(6)/3,0.25*Math.sqrt(3)/3,1.00, 250/255,214/255,29/255,//4
	  
	  //left_ear_part3
	  //base side
	  0.125*0.25, 0.3, -0.25*0.125*Math.sqrt(3)/3, 1.00,   255/255, 222/255, 0,//7
	  0.125,0,-0.125*Math.sqrt(3)/3, 1.00,   225/255, 151/255, 32/255,//1
	  -0.125*0.25, 0.3, -0.25*0.125*Math.sqrt(3)/3, 1.00,  255/255, 222/255, 0,//5
	  -0.125*0.25, 0.3, -0.25*0.125*Math.sqrt(3)/3, 1.00,  255/255, 222/255, 0,//5
	  0.125,0,-0.125*Math.sqrt(3)/3, 1.00,   225/255, 151/255, 32/255,//1
	  -0.125, 0, -0.125*Math.sqrt(3)/3, 1.00,  225/255, 151/255, 32/255,//2
	  //lower side
	  0.125,0,-0.125*Math.sqrt(3)/3, 1.00,  250/255,214/255,29/255,//1
	  0,0,0.25*Math.sqrt(3)/3, 1.00,  250/255,214/255,29/255,//4
	  -0.125, 0, -0.125*Math.sqrt(3)/3, 1.00,  250/255,214/255,29/255,//2
	  //right side
	  -0.125*0.25, 0.3, -0.25*0.125*Math.sqrt(3)/3, 1.00,  250/255,214/255,29/255,//5
	  -0.125, 0, -0.125*Math.sqrt(3)/3, 1.00,  250/255,214/255,29/255,//2
	  0,0.3,0.25*0.25*Math.sqrt(3)/3, 1.00,  250/255,214/255,29/255,//6
	  0,0.3,0.25*0.25*Math.sqrt(3)/3, 1.00,  250/255,214/255,29/255,//6
	  -0.125, 0, -0.125*Math.sqrt(3)/3, 1.00,  250/255,214/255,29/255,//2
	  0,0,0.25*Math.sqrt(3)/3,1.00,  250/255,214/255,29/255,//4
	  //left side
	  0.125*0.25, 0.3, -0.25*0.125*Math.sqrt(3)/3, 1.00,   250/255,214/255,29/255,//7
	  0,0.3,0.25*0.25*Math.sqrt(3)/3, 1.00,  250/255,214/255,29/255,//6
	  0.125,0,-0.125*Math.sqrt(3)/3, 1.00,  250/255,214/255,29/255,//1
	  0.125,0,-0.125*Math.sqrt(3)/3, 1.00,  250/255,214/255,29/255,//1
	  0,0.3,0.25*0.25*Math.sqrt(3)/3, 1.00,  250/255,214/255,29/255,//6
	  0,0,0.25*Math.sqrt(3)/3, 1.00, 250/255,214/255,29/255,//4
	  //upper sider
	  0.125*0.25, 0.3, -0.25*0.125*Math.sqrt(3)/3, 1.00,   250/255,214/255,29/255,//7
	  -0.125*0.25, 0.3, -0.25*0.125*Math.sqrt(3)/3, 1.00,  250/255,214/255,29/255,//5
	  0,0.3,0.25*0.25*Math.sqrt(3)/3,1.00,  250/255,214/255,29/255,//6
	  
	  
	  
	  //left_ear_part4
	  //lower side
	  0.125*0.25, 0.0, -0.25*0.125*Math.sqrt(3)/3, 1.00,   0,0,0,//7
	  0,0.0,0.25*0.25*Math.sqrt(3)/3, 1.00,  0,0,0,//6
	  -0.125*0.25, 0.0, -0.25*0.125*Math.sqrt(3)/3, 1.00,  0,0,0,//5
	  //base side
	  
	  0.00, 0.10, 0.00, 1.00,   0,0,0,//3
	  0.125*0.25, 0.0, -0.25*0.125*Math.sqrt(3)/3, 1.00,   0,0,0,//7
	  -0.125*0.25, 0.0, -0.25*0.125*Math.sqrt(3)/3, 1.00,  0,0,0,//5
	  //left side
	  0.00, 0.10, 0.00, 1.00,   0,0,0,//3
	  -0.125*0.25, 0.0, -0.25*0.125*Math.sqrt(3)/3, 1.00,  0,0,0,//5
	  0,0.0,0.25*0.25*Math.sqrt(3)/3, 1.00,  0,0,0,//6
	  //right side
	  0.125*0.25, 0.0, -0.25*0.125*Math.sqrt(3)/3, 1.00,   0,0,0,//7
	  0.00, 0.10, 0.00, 1.00,   0,0,0,//3
	  0,0.0,0.25*0.25*Math.sqrt(3)/3, 1.00,  0,0,0,//6
	  
	  //right_ear_part1
	  //left side
	  0.125, 0.15, -0.125, 1.00,	225/255, 151/255, 32/255,   //2
	  0.125, 0.15, 0.125, 1.00,   255/255, 222/255, 0,		//3
	  0.125, -0.10, -0.125, 1.00, 225/255, 151/255, 32/255, 	 //1
	  0.125, -0.10, -0.125, 1.00,   225/255, 151/255, 32/255, 	 //1
	  0.125, 0.15, 0.125, 1.00,    255/255, 222/255, 0,		//3
	  0.125, -0.10, 0.125, 1.00,   255/255, 222/255, 0,	 //4
	  
	  //base side
	  0.125, 0.15, -0.125, 1.00,	225/255, 151/255, 32/255,  //2
	  0.125, -0.10, -0.125, 1.00,   225/255, 151/255, 32/255, 	 //1
	  0.00, 0.00, 0.00, 1.00,	255/255, 226/255, 111/255,  //0
	  //front side
	  0.125, 0.15, 0.125, 1.00,   255/255, 222/255, 0,		//3
	  0.00, 0.00, 0.00, 1.00,	255/255, 226/255, 111/255, //0
	  0.125, -0.10, 0.125, 1.00,    255/255, 222/255, 0,	 //4
	  //upper side
	  0.125, 0.15, -0.125, 1.00,	225/255, 151/255, 32/255,   //2
	  0.00, 0.00, 0.00, 1.00,	255/255, 226/255, 111/255,  //0
	  0.125, 0.15, 0.125, 1.00,    255/255, 222/255, 0,		//3
	  //lower side
	  0.125, -0.10, -0.125, 1.00,   255/255, 226/255, 111/255, //1
	  0.125, -0.10, 0.125, 1.00,   255/255, 222/255, 0,	 //4
	  0.00, 0.00, 0.00, 1.00,	255/255, 226/255, 111/255,  //0
	  
	  //leftBlush
	  0,0,0,1,  246/255, 45/255, 20/255,
	  Math.sin(-31*j),Math.cos(-31*j),0, 1.0,      246/255, 45/255, 20/255,
	  Math.sin(-30*j),Math.cos(-30*j),0, 1.0,      246/255, 45/255, 20/255,
	  Math.sin(-20*j),Math.cos(-20*j),0, 1.0,      246/255, 45/255, 20/255,
	  Math.sin(-10*j),Math.cos(-10*j),0, 1.0,      246/255, 45/255, 20/255,
	  Math.sin(-1*j),Math.cos(-1*j),0, 1.0,      246/255, 45/255, 20/255,
	  Math.sin(j),Math.cos(j), 0,  1.0,     246/255, 45/255, 20/255,
	  Math.sin(10*j),Math.cos(10*j),0, 1.0,      246/255, 45/255, 20/255,
	  Math.sin(20*j),Math.cos(20*j),0, 1.0,      246/255, 45/255, 20/255,
	  Math.sin(30*j),Math.cos(30*j),0, 1.0,      246/255, 45/255, 20/255,
	  Math.sin(40*j),Math.cos(40*j),0, 1.0,      246/255, 45/255, 20/255,
	  Math.sin(50*j),Math.cos(50*j),0, 1.0,      246/255, 45/255, 20/255,
	  Math.sin(60*j),Math.cos(60*j),0, 1.0,      246/255, 45/255, 20/255,
	  Math.sin(70*j),Math.cos(70*j),0, 1.0,      246/255, 45/255, 20/255,
	  Math.sin(80*j),Math.cos(80*j),0, 1.0,      246/255, 45/255, 20/255,
	  Math.sin(90*j),Math.cos(90*j),0, 1.0,      246/255, 45/255, 20/255,
	  Math.sin(100*j),Math.cos(100*j),0, 1.0,      246/255, 45/255, 20/255,
	  Math.sin(110*j),Math.cos(110*j),0, 1.0,      246/255, 45/255, 20/255,
	  Math.sin(120*j),Math.cos(120*j),0, 1.0,      246/255, 45/255, 20/255,
	  Math.sin(130*j),Math.cos(130*j),0, 1.0,      246/255, 45/255, 20/255,
	  Math.sin(140*j),Math.cos(140*j),0, 1.0,      246/255, 45/255, 20/255,
	  Math.sin(150*j),Math.cos(150*j),0, 1.0,      246/255, 45/255, 20/255,
	  Math.sin(160*j),Math.cos(160*j),0, 1.0,      246/255, 45/255, 20/255,
	  Math.sin(170*j),Math.cos(170*j),0, 1.0,      246/255, 45/255, 20/255,
	  Math.sin(180*j),Math.cos(180*j),0, 1.0,      246/255, 45/255, 20/255,
	  Math.sin(190*j),Math.cos(190*j),0, 1.0,      246/255, 45/255, 20/255,
	  Math.sin(200*j),Math.cos(200*j),0, 1.0,      246/255, 45/255, 20/255,
	  Math.sin(210*j),Math.cos(210*j),0, 1.0,      246/255, 45/255, 20/255,
	  Math.sin(211*j),Math.cos(211*j),0, 1.0,      246/255, 45/255, 20/255,
	  
	  //Triangle for left Blush
	  0.07*0.5, 0.00, 0.00, 1.00, 246/255, 45/255, 20/255,
	  0, 0.07*0.5*Math.sqrt(3), 0.00, 1.00, 246/255, 45/255, 20/255,
	  0, -0.07*0.5*Math.sqrt(3), 0.00, 1.00, 246/255, 45/255, 20/255,
	  
	  
	  //leftblush_left
	  0,0,-0.001,1,  246/255, 45/255, 20/255,
	  Math.sin(-1*j),Math.cos(-1*j),-0.001,1.0,     246/255, 45/255, 20/255,
	  Math.sin(1*j),Math.cos(1*j),-0.001,1.0,     246/255, 45/255, 20/255,
	  Math.sin(10*j),Math.cos(10*j),-0.001,1.0,     246/255, 45/255, 20/255,
	  Math.sin(20*j),Math.cos(20*j),-0.001,1.0,     246/255, 45/255, 20/255,
	  Math.sin(30*j),Math.cos(30*j),-0.001,1.0,     246/255, 45/255, 20/255,
	  Math.sin(40*j),Math.cos(40*j),-0.001,1.0,     246/255, 45/255, 20/255,
	  Math.sin(50*j),Math.cos(50*j),-0.001,1.0,     246/255, 45/255, 20/255,
	  Math.sin(60*j),Math.cos(60*j),-0.001,1.0,     246/255, 45/255, 20/255,
	  Math.sin(70*j),Math.cos(70*j),-0.001,1.0,     246/255, 45/255, 20/255,
	  Math.sin(80*j),Math.cos(80*j),-0.001,1.0,     246/255, 45/255, 20/255,
	  Math.sin(90*j),Math.cos(90*j),-0.001,1.0,     246/255, 45/255, 20/255,
	  Math.sin(100*j),Math.cos(100*j),-0.001,1.0,     246/255, 45/255, 20/255,
	  Math.sin(110*j),Math.cos(110*j),-0.001,1.0,     246/255, 45/255, 20/255,
	  Math.sin(120*j),Math.cos(120*j),-0.001,1.0,     246/255, 45/255, 20/255,
	  Math.sin(130*j),Math.cos(130*j),-0.001,1.0,     246/255, 45/255, 20/255,
	  Math.sin(140*j),Math.cos(140*j),-0.001,1.0,     246/255, 45/255, 20/255,
	  Math.sin(150*j),Math.cos(150*j),-0.001,1.0,     246/255, 45/255, 20/255,
	  Math.sin(160*j),Math.cos(160*j),-0.001,1.0,     246/255, 45/255, 20/255,
	  Math.sin(170*j),Math.cos(170*j),-0.001,1.0,     246/255, 45/255, 20/255,
	  Math.sin(180*j),Math.cos(180*j),-0.001,1.0,     246/255, 45/255, 20/255,
	  Math.sin(181*j),Math.cos(181*j),-0.001,1.0,     246/255, 45/255, 20/255,
	  //rightblush_left
	  0,0,0.001,1,  246/255, 45/255, 20/255,
	  Math.sin(-1*j),Math.cos(-1*j),0.001,1.0,     246/255, 45/255, 20/255,
	  Math.sin(1*j),Math.cos(1*j),0.001,1.0,     246/255, 45/255, 20/255,
	  Math.sin(10*j),Math.cos(10*j),0.001,1.0,     246/255, 45/255, 20/255,
	  Math.sin(20*j),Math.cos(20*j),0.001,1.0,     246/255, 45/255, 20/255,
	  Math.sin(30*j),Math.cos(30*j),0.001,1.0,     246/255, 45/255, 20/255,
	  Math.sin(40*j),Math.cos(40*j),0.001,1.0,     246/255, 45/255, 20/255,
	  Math.sin(50*j),Math.cos(50*j),0.001,1.0,     246/255, 45/255, 20/255,
	  Math.sin(60*j),Math.cos(60*j),0.001,1.0,     246/255, 45/255, 20/255,
	  Math.sin(70*j),Math.cos(70*j),0.001,1.0,     246/255, 45/255, 20/255,
	  Math.sin(80*j),Math.cos(80*j),0.001,1.0,     246/255, 45/255, 20/255,
	  Math.sin(90*j),Math.cos(90*j),0.001,1.0,     246/255, 45/255, 20/255,
	  Math.sin(100*j),Math.cos(100*j),0.001,1.0,     246/255, 45/255, 20/255,
	  Math.sin(110*j),Math.cos(110*j),0.001,1.0,     246/255, 45/255, 20/255,
	  Math.sin(120*j),Math.cos(120*j),0.001,1.0,     246/255, 45/255, 20/255,
	  Math.sin(130*j),Math.cos(130*j),0.001,1.0,     246/255, 45/255, 20/255,
	  Math.sin(140*j),Math.cos(140*j),0.001,1.0,     246/255, 45/255, 20/255,
	  Math.sin(150*j),Math.cos(150*j),0.001,1.0,     246/255, 45/255, 20/255,
	  Math.sin(160*j),Math.cos(160*j),0.001,1.0,     246/255, 45/255, 20/255,
	  Math.sin(170*j),Math.cos(170*j),0.001,1.0,     246/255, 45/255, 20/255,
	  Math.sin(180*j),Math.cos(180*j),0.001,1.0,     246/255, 45/255, 20/255,
	  Math.sin(181*j),Math.cos(181*j),0.001,1.0,     246/255, 45/255, 20/255,
	  
	  //eyebrown(22)
	  0,0,0.001,1,  104/255, 73/255, 44/255,
	  Math.sin(91*j),Math.cos(91*j),0.001,1.0,     104/255, 73/255, 44/255,
	  Math.sin(90*j),Math.cos(90*j),0.001,1.0,     104/255, 73/255, 44/255,
	  Math.sin(100*j),Math.cos(100*j),0.001,1.0,     104/255, 73/255, 44/255,
	  Math.sin(110*j),Math.cos(110*j),0.001,1.0,     104/255, 73/255, 44/255,
	  Math.sin(120*j),Math.cos(120*j),0.001,1.0,     104/255, 73/255, 44/255,
	  Math.sin(130*j),Math.cos(130*j),0.001,1.0,     104/255, 73/255, 44/255,
	  Math.sin(140*j),Math.cos(140*j),0.001,1.0,     104/255, 73/255, 44/255,
	  Math.sin(150*j),Math.cos(150*j),0.001,1.0,     104/255, 73/255, 44/255,
	  Math.sin(160*j),Math.cos(160*j),0.001,1.0,     104/255, 73/255, 44/255,
	  Math.sin(170*j),Math.cos(170*j),0.001,1.0,     104/255, 73/255, 44/255,
	  Math.sin(180*j),Math.cos(180*j),0.001,1.0,     104/255, 73/255, 44/255,
	  Math.sin(190*j),Math.cos(190*j),0.001,1.0,     104/255, 73/255, 44/255,
	  Math.sin(200*j),Math.cos(200*j),0.001,1.0,     104/255, 73/255, 44/255,
	  Math.sin(210*j),Math.cos(210*j),0.001,1.0,     104/255, 73/255, 44/255,
	  Math.sin(220*j),Math.cos(220*j),0.001,1.0,     104/255, 73/255, 44/255,
	  Math.sin(230*j),Math.cos(230*j),0.001,1.0,     104/255, 73/255, 44/255,
	  Math.sin(240*j),Math.cos(240*j),0.001,1.0,     104/255, 73/255, 44/255,
	  Math.sin(250*j),Math.cos(250*j),0.001,1.0,     104/255, 73/255, 44/255,
	  Math.sin(260*j),Math.cos(260*j),0.001,1.0,     104/255, 73/255, 44/255,
	  Math.sin(270*j),Math.cos(270*j),0.001,1.0,     104/255, 73/255, 44/255,
	  Math.sin(271*j),Math.cos(271*j),0.001,1.0,     104/255, 73/255, 44/255,
	  //tail_part_I 434//(16)
	  //front
	  0.025*Math.sqrt(15),0.1, 0.025, 1.0, 104/255, 73/255, 44/255,//2
	  0.0 , 0.0 , 0.0, 1.0,  104/255, 73/255, 44/255,//0
	  0.025*Math.sqrt(15), 0.0, 0.025, 1.0, 104/255, 73/255, 44/255,//1
	  //back
	  0.0 , 0.0 , 0.0, 1.0,  104/255, 73/255, 44/255,//0
	  0.025*Math.sqrt(15),0.1, -0.025, 1.0, 104/255, 73/255, 44/255,//3
	  0.025*Math.sqrt(15), 0.0, -0.025, 1.0, 104/255, 73/255, 44/255,//4
	  //upper
	  0.025*Math.sqrt(15),0.1, -0.025, 1.0, 104/255, 73/255, 44/255,//3
	  0.0 , 0.0 , 0.0, 1.0,  104/255, 73/255, 44/255,//0
	  0.025*Math.sqrt(15),0.1, 0.025, 1.0, 104/255, 73/255, 44/255,//2
	  //base
	  0.025*Math.sqrt(15), 0.0, -0.025, 1.0, 104/255, 73/255, 44/255,//4
	  0.025*Math.sqrt(15), 0.0, 0.025, 1.0, 104/255, 73/255, 44/255,//1
	  0.0 , 0.0 , 0.0, 1.0,  104/255, 73/255, 44/255,//0
	  //right
	  0.025*Math.sqrt(15),0.1, -0.025, 1.0, 104/255, 73/255, 44/255,//3
	  0.025*Math.sqrt(15),0.1, 0.025, 1.0, 104/255, 73/255, 44/255,//2
	  0.025*Math.sqrt(15), 0.0, 0.025, 1.0, 104/255, 73/255, 44/255,//1
	  0.025*Math.sqrt(15), 0.0, -0.025, 1.0, 104/255, 73/255, 44/255,//4
	  //tail_part_II(36)
	  //front
	  0.5*0.025*Math.sqrt(15), 1.5*0.1, 1.5*0.025,  1.0, 250/255, 214/255, 29/255,//4
	  0.0, 0.1, 0.025, 1.0, 250/255, 214/255, 29/255,//0
	  0.5*0.025*Math.sqrt(15), -0.05+0.5*0.1, 1.5*0.025, 1.0, 250/255, 214/255, 29/255,//5
	  0.5*0.025*Math.sqrt(15), -0.05+0.5*0.1, 1.5*0.025,  1.0, 250/255, 214/255, 29/255,//5
	  0.0, 0.1, 0.025, 1.0, 250/255, 214/255, 29/255,//0
	  0.0, -0.05, 0.025, 1.0, 250/255, 214/255, 29/255,//1
	  //back
	  0.0, -0.05, -0.025, 1.0, 250/255, 214/255, 29/255,//2
	  0.0, 0.1, -0.025, 1.0, 250/255, 214/255, 29/255,//3
	  0.5*0.025*Math.sqrt(15), -0.05+0.5*0.1, -1.5*0.025,  1.0, 250/255, 214/255, 29/255,//6
	  0.5*0.025*Math.sqrt(15), -0.05+0.5*0.1, -1.5*0.025,  1.0, 250/255, 214/255, 29/255,//6
	  0.0, 0.1, -0.025, 1.0, 250/255, 214/255, 29/255,//3
	  0.5*0.025*Math.sqrt(15), 1.5*0.1, -1.5*0.025,  1.0, 250/255, 214/255, 29/255,//7
	  //left
	  0.0, -0.05, 0.025, 1.0, 250/255, 214/255, 29/255,//1
	  0.0, 0.1, 0.025, 1.0, 250/255, 214/255, 29/255,//0
	  0.0, -0.05, -0.025, 1.0, 250/255, 214/255, 29/255,//2
	  0.0, -0.05, -0.025, 1.0, 250/255, 214/255, 29/255,//2
	  0.0, 0.1, 0.025, 1.0, 250/255, 214/255, 29/255,//0
	  0.0, 0.1, -0.025, 1.0, 250/255, 214/255, 29/255,//3
	  //right
	  0.5*0.025*Math.sqrt(15), 1.5*0.1, -1.5*0.025,  1.0, 250/255, 214/255, 29/255,//7
	  0.5*0.025*Math.sqrt(15), 1.5*0.1, 1.5*0.025,  1.0, 250/255, 214/255, 29/255,//4
	  0.5*0.025*Math.sqrt(15), -0.05+0.5*0.1, -1.5*0.025,  1.0, 250/255, 214/255, 29/255,//6
	  0.5*0.025*Math.sqrt(15), -0.05+0.5*0.1, -1.5*0.025,  1.0, 250/255, 214/255, 29/255,//6
	  0.5*0.025*Math.sqrt(15), 1.5*0.1, 1.5*0.025,  1.0, 250/255, 214/255, 29/255,//4
	  0.5*0.025*Math.sqrt(15), -0.05+0.5*0.1, 1.5*0.025, 1.0, 250/255, 214/255, 29/255,//5
	  
	  //upper
	  0.5*0.025*Math.sqrt(15), 1.5*0.1, -1.5*0.025, 1.0, 250/255, 214/255, 29/255,//7
	  0.0, 0.1, -0.025, 1.0, 250/255, 214/255, 29/255,//3
	  0.5*0.025*Math.sqrt(15), 1.5*0.1, 1.5*0.025, 1.0, 250/255, 214/255, 29/255,//4
	  0.5*0.025*Math.sqrt(15), 1.5*0.1, 1.5*0.025,  1.0, 250/255, 214/255, 29/255,//4
	  0.0, 0.1, -0.025, 1.0, 250/255, 214/255, 29/255,//3
	  0.0, 0.1, 0.025, 1.0, 250/255, 214/255, 29/255,//0
	  
	  //bottom
	  0.0, -0.05, 0.025, 1.0, 250/255, 214/255, 29/255,//1
	  0.0, -0.05, -0.025, 1.0, 250/255, 214/255, 29/255,//2
	  0.5*0.025*Math.sqrt(15), -0.05+0.5*0.1, 1.5*0.025, 1.0, 250/255, 214/255, 29/255,//5
	  0.5*0.025*Math.sqrt(15), -0.05+0.5*0.1, 1.5*0.025, 1.0, 250/255, 214/255, 29/255,//5
	  0.0, -0.05, -0.025, 1.0, 250/255, 214/255, 29/255,//2
	  0.5*0.025*Math.sqrt(15), -0.05+0.5*0.1, -1.5*0.025,  1.0, 250/255, 214/255, 29/255,//6
	  
	  //tail_part_III(36)
	  //front
	  1.5*0.025*Math.sqrt(15),0.15+0.2, 1.5*0.025, 1.0, 250/255, 214/255, 29/255,//4
	  0, 0.05, 1.5*0.025, 1.0, 250/255, 214/255, 29/255,//0
	  1.5*0.025*Math.sqrt(15),0.15, 1.5*0.025, 1.0, 250/255, 214/255, 29/255,//5
	  1.5*0.025*Math.sqrt(15),0.15, 1.5*0.025, 1.0, 250/255, 214/255, 29/255,//5
	  0, 0.05, 1.5*0.025, 1.0, 250/255, 214/255, 29/255,//0
	  0, -0.05+0.5*0.1, 1.5*0.025, 1.0, 250/255, 214/255, 29/255,//1
	  //back
	  0, -0.05+0.5*0.1, -1.5*0.025,  1.0, 250/255, 214/255, 29/255,//2
	  0, 0.05, -1.5*0.025, 1.0, 250/255, 214/255, 29/255,//3
	  1.5*0.025*Math.sqrt(15),0.15, -1.5*0.025, 1.0, 250/255, 214/255, 29/255,//6
	  1.5*0.025*Math.sqrt(15),0.15, -1.5*0.025, 1.0, 250/255, 214/255, 29/255,//6
	  0, 0.05, -1.5*0.025, 1.0, 250/255, 214/255, 29/255,//3
	  1.5*0.025*Math.sqrt(15),0.15+0.2, -1.5*0.025, 1.0, 250/255, 214/255, 29/255,//7
	  //left
	  0, -0.05+0.5*0.1, 1.5*0.025, 1.0, 250/255, 214/255, 29/255,//1
	  0, 0.05, 1.5*0.025, 1.0, 250/255, 214/255, 29/255,//0
	  0, -0.05+0.5*0.1, -1.5*0.025,  1.0, 250/255, 214/255, 29/255,//2
	  0, -0.05+0.5*0.1, -1.5*0.025,  1.0, 250/255, 214/255, 29/255,//2
	  0, 0.05, 1.5*0.025, 1.0, 250/255, 214/255, 29/255,//0
	  0, 0.05, -1.5*0.025, 1.0, 250/255, 214/255, 29/255,//3
	  //right
	  1.5*0.025*Math.sqrt(15),0.15+0.2, -1.5*0.025, 1.0, 250/255, 214/255, 29/255,//7
	  1.5*0.025*Math.sqrt(15),0.15+0.2, 1.5*0.025, 1.0, 250/255, 214/255, 29/255,//4
	  1.5*0.025*Math.sqrt(15),0.15, -1.5*0.025, 1.0, 250/255, 214/255, 29/255,//6
	  1.5*0.025*Math.sqrt(15),0.15, -1.5*0.025, 1.0, 250/255, 214/255, 29/255,//6
	  1.5*0.025*Math.sqrt(15),0.15+0.2, 1.5*0.025, 1.0, 250/255, 214/255, 29/255,//4
	  1.5*0.025*Math.sqrt(15),0.15, 1.5*0.025, 1.0, 250/255, 214/255, 29/255,//5
	  //upper
	  1.5*0.025*Math.sqrt(15),0.15+0.2, -1.5*0.025, 1.0, 250/255, 214/255, 29/255,//7
	  0, 0.05, -1.5*0.025, 1.0, 250/255, 214/255, 29/255,//3
	  1.5*0.025*Math.sqrt(15),0.15+0.2, 1.5*0.025, 1.0, 250/255, 214/255, 29/255,//4
	  1.5*0.025*Math.sqrt(15),0.15+0.2, 1.5*0.025, 1.0, 250/255, 214/255, 29/255,//4
	  0, 0.05, -1.5*0.025, 1.0, 250/255, 214/255, 29/255,//3
	  0, 0.05, 1.5*0.025, 1.0, 250/255, 214/255, 29/255,//0
	  //bottom
	  0, -0.05+0.5*0.1, 1.5*0.025, 1.0, 250/255, 214/255, 29/255,//1
	  0, -0.05+0.5*0.1, -1.5*0.025,  1.0, 250/255, 214/255, 29/255,//2
	  1.5*0.025*Math.sqrt(15),0.15, 1.5*0.025, 1.0, 250/255, 214/255, 29/255,//5
	  1.5*0.025*Math.sqrt(15),0.15, 1.5*0.025, 1.0, 250/255, 214/255, 29/255,//5
	  0, -0.05+0.5*0.1, -1.5*0.025,  1.0, 250/255, 214/255, 29/255,//2
	  1.5*0.025*Math.sqrt(15),0.15, -1.5*0.025, 1.0, 250/255, 214/255, 29/255,//6
	  
	  
	  //tail_part_IV(18)
	  
	  //
	  //front
	  0.2*Math.sqrt(3),0.15, 0,  1.0, 250/255, 214/255, 29/255,//4
	  0, 0.15+0.2, 1.5*0.025, 1.0, 250/255, 214/255, 29/255,//0
	  0.1*Math.sqrt(3),0.05, 0, 1.0,250/255, 214/255, 29/255, //5
	  0.1*Math.sqrt(3),0.05, 0, 1.0,250/255, 214/255, 29/255, //5
	  0, 0.15+0.2, 1.5*0.025, 1.0, 250/255, 214/255, 29/255,//0
	  0,0.15, 1.5*0.025, 1.0, 250/255, 214/255, 29/255,//1
	  //back
	  0, 0.15, -1.5*0.025, 1.0, 250/255, 214/255, 29/255,//2
	  0,0.15+0.2, -1.5*0.025, 1.0, 250/255, 214/255, 29/255,//3
	  0.1*Math.sqrt(3),0.05, 0, 1.0,250/255, 214/255, 29/255, //5
	  0.1*Math.sqrt(3),0.05, 0, 1.0,250/255, 214/255, 29/255, //5
	  0,0.15+0.2, -1.5*0.025, 1.0, 250/255, 214/255, 29/255,//3
	  0.2*Math.sqrt(3),0.15, 0,  1.0, 250/255, 214/255, 29/255,//4
	  //left
	  0, 0.15, 1.5*0.025, 1.0, 250/255, 214/255, 29/255,//1
	  0, 0.15+0.2, 1.5*0.025, 1.0, 250/255, 214/255, 29/255,//0
	  0, 0.15, -1.5*0.025, 1.0, 250/255, 214/255, 29/255,//2
	  0, 0.15, -1.5*0.025, 1.0, 250/255, 214/255, 29/255,//2
	  0, 0.15+0.2, 1.5*0.025, 1.0, 250/255, 214/255, 29/255,//0
	  0,0.15+0.2, -1.5*0.025, 1.0, 250/255, 214/255, 29/255,//3
	  //upper
	  0.2*Math.sqrt(3),0.15, 0,  1.0, 250/255, 214/255, 29/255,//4
	  0,0.15+0.2, -1.5*0.025, 1.0, 250/255, 214/255, 29/255,//3
	  0, 0.15+0.2, 1.5*0.025, 1.0, 250/255, 214/255, 29/255,//0
	  //bottom
	  0,0.15, 1.5*0.025, 1.0, 250/255, 214/255, 29/255,//1
	  0,0.15, -1.5*0.025, 1.0, 250/255, 214/255, 29/255,//2
	  0.1*Math.sqrt(3),0.05, 0, 1.0,250/255, 214/255, 29/255, //5
	  
		]);





}


function makeSphere() {
	//==============================================================================
	// Make a sphere from one OpenGL TRIANGLE_STRIP primitive.   Make ring-like 
	// equal-lattitude 'slices' of the sphere (bounded by planes of constant z), 
	// and connect them as a 'stepped spiral' design (see makeCylinder) to build the
	// sphere from one triangle strip.
	  var slices = 13;		// # of slices of the sphere along the z axis. >=3 req'd
												// (choose odd # or prime# to avoid accidental symmetry)
	  var sliceVerts	= 27;	// # of vertices around the top edge of the slice
												// (same number of vertices on bottom of slice, too)
	  var topColr = new Float32Array([1.0, 1.0, 1.0]);	// North Pole: light gray
	  var equColr = new Float32Array([1.0, 0.0, 0.0]);	// Equator:    bright green
	  var botColr = new Float32Array([1.0, 1.0, 1.0]);	// South Pole: brightest gray.
	  var sliceAngle = Math.PI/slices;	// lattitude angle spanned by one slice.
	
		// Create a (global) array to hold this sphere's vertices:
	  sphVerts = new Float32Array(  ((slices * 2* sliceVerts) -2) * floatsPerVertex);
											// # of vertices * # of elements needed to store them. 
											// each slice requires 2*sliceVerts vertices except 1st and
											// last ones, which require only 2*sliceVerts-1.
											
		// Create dome-shaped top slice of sphere at z=+1
		// s counts slices; v counts vertices; 
		// j counts array elements (vertices * elements per vertex)
		var cos0 = 0.0;					// sines,cosines of slice's top, bottom edge.
		var sin0 = 0.0;
		var cos1 = 0.0;
		var sin1 = 0.0;	
		var j = 0;							// initialize our array index
		var isLast = 0;
		var isFirst = 1;
		for(s=0; s<slices; s++) {	// for each slice of the sphere,
			// find sines & cosines for top and bottom of this slice
			if(s==0) {
				isFirst = 1;	// skip 1st vertex of 1st slice.
				cos0 = 1.0; 	// initialize: start at north pole.
				sin0 = 0.0;
			}
			else {					// otherwise, new top edge == old bottom edge
				isFirst = 0;	
				cos0 = cos1;
				sin0 = sin1;
			}								// & compute sine,cosine for new bottom edge.
			cos1 = Math.cos((s+1)*sliceAngle);
			sin1 = Math.sin((s+1)*sliceAngle);
			// go around the entire slice, generating TRIANGLE_STRIP verts
			// (Note we don't initialize j; grows with each new attrib,vertex, and slice)
			//if(s==slices-1) isLast=1;	// skip last vertex of last slice.
			for(v=isFirst; v< 2*sliceVerts-isLast; v++, j+=floatsPerVertex) {	
				if(v%2==0)
				{				// put even# vertices at the the slice's top edge
								// (why PI and not 2*PI? because 0 <= v < 2*sliceVerts
								// and thus we can simplify cos(2*PI(v/2*sliceVerts))  
					sphVerts[j  ] = sin0 * Math.cos(Math.PI*(v)/sliceVerts); 	
					sphVerts[j+1] = sin0 * Math.sin(Math.PI*(v)/sliceVerts);	
					sphVerts[j+2] = cos0;		
					sphVerts[j+3] = 1.0;			
				}
				else { 	// put odd# vertices around the slice's lower edge;
								// x,y,z,w == cos(theta),sin(theta), 1.0, 1.0
								// 					theta = 2*PI*((v-1)/2)/capVerts = PI*(v-1)/capVerts
					sphVerts[j  ] = sin1 * Math.cos(Math.PI*(v-1)/sliceVerts);		// x
					sphVerts[j+1] = sin1 * Math.sin(Math.PI*(v-1)/sliceVerts);		// y
					sphVerts[j+2] = cos1;																				// z
					sphVerts[j+3] = 1.0;																				// w.		
				}

				if(s<slices/2) {	// finally, set some interesting colors for vertices:
					sphVerts[j+4]=topColr[0]; 
					sphVerts[j+5]=topColr[1]; 
					sphVerts[j+6]=topColr[2];	
					}
				// else if(s==slices-1) {
				// 	sphVerts[j+4]=botColr[0]; 
				// 	sphVerts[j+5]=botColr[1]; 
				// 	sphVerts[j+6]=botColr[2];	
				// }
				else {
						sphVerts[j+4]= equColr[0];// Math.random()
						sphVerts[j+5]=equColr[1];//Math.random()
						sphVerts[j+6]=equColr[2];//Math.random()				
				}
			}
		}
	}

function makeCircle(){
	var j=Math.PI/180;
my_circle=new Float32Array([
	0.0, 0.0, 0.001, 1.0, 1, 1, 1,
	Math.sin(j),Math.cos(j), 0.001, 1.0,    1, 1, 1,
	Math.sin(10*j),Math.cos(10*j),0.001,1.0,    1, 1, 1,
	Math.sin(20*j),Math.cos(20*j),0.001,1.0,    1, 1, 1,
	Math.sin(30*j),Math.cos(30*j),0.001,1.0,    1, 1, 1,
	Math.sin(40*j),Math.cos(40*j),0.001,1.0,    1, 1, 1,
	Math.sin(50*j),Math.cos(50*j),0.001,1.0,    1, 1, 1,
	Math.sin(60*j),Math.cos(60*j),0.001,1.0,    1, 1, 1,
	Math.sin(70*j),Math.cos(70*j),0.001,1.0,    1, 1, 1,
	Math.sin(80*j),Math.cos(80*j),0.001,1.0,    1, 1, 1,
	Math.sin(90*j),Math.cos(90*j),0.001,1.0,    1, 1, 1,
	Math.sin(100*j),Math.cos(100*j),0.001,1.0,    1, 1, 1,
	Math.sin(110*j),Math.cos(110*j),0.001,1.0,    1, 1, 1,
	Math.sin(120*j),Math.cos(120*j),0.001,1.0,    1, 1, 1,
	Math.sin(130*j),Math.cos(130*j),0.001,1.0,    1, 1, 1,
	Math.sin(140*j),Math.cos(140*j),0.001,1.0,    1, 1, 1,
	Math.sin(150*j),Math.cos(150*j),0.001,1.0,    1, 1, 1,
	Math.sin(160*j),Math.cos(160*j),0.001,1.0,    1, 1, 1,
	Math.sin(170*j),Math.cos(170*j),0.001,1.0,    1, 1, 1,
	Math.sin(180*j),Math.cos(180*j),0.001,1.0,    1, 1, 1,
	Math.sin(190*j),Math.cos(190*j),0.001,1.0,    1, 1, 1,
	Math.sin(200*j),Math.cos(200*j),0.001,1.0,    1, 1, 1,
	Math.sin(210*j),Math.cos(210*j),0.001,1.0,    1, 1, 1,
	Math.sin(220*j),Math.cos(220*j),0.001,1.0,    1, 1, 1,
	Math.sin(230*j),Math.cos(230*j),0.001,1.0,    1, 1, 1,
	Math.sin(240*j),Math.cos(240*j),0.001,1.0,    1, 1, 1,
	Math.sin(250*j),Math.cos(250*j),0.001,1.0,    1, 1, 1,
	Math.sin(260*j),Math.cos(260*j),0.001,1.0,    1, 1, 1,
	Math.sin(270*j),Math.cos(270*j),0.001,1.0,    1, 1, 1,
	Math.sin(280*j),Math.cos(280*j),0.001,1.0,    1, 1, 1,
	Math.sin(290*j),Math.cos(290*j),0.001,1.0,    1, 1, 1,
	Math.sin(300*j),Math.cos(300*j),0.001,1.0,    1, 1, 1,
	Math.sin(310*j),Math.cos(310*j),0.001,1.0,    1, 1, 1,
	Math.sin(320*j),Math.cos(320*j),0.001,1.0,    1, 1, 1,
	Math.sin(330*j),Math.cos(330*j),0.001,1.0,    1, 1, 1,
	Math.sin(340*j),Math.cos(340*j),0.001,1.0,    1, 1, 1,
	Math.sin(350*j),Math.cos(350*j),0.001,1.0,    1, 1, 1,
	Math.sin(361*j),Math.cos(361*j),0.001,1.0,    1, 1, 1,
]);

}
function makeCircle2(){
	var j=Math.PI/180;
my_circle2=new Float32Array([
	Math.sin(j),Math.cos(j), 0.001, 1.0,    0, 0, 0,
	Math.sin(10*j),Math.cos(10*j),0.001,1.0,    0, 0, 0,
	Math.sin(20*j),Math.cos(20*j),0.001,1.0,    0, 0, 0,
	Math.sin(30*j),Math.cos(30*j),0.001,1.0,    0, 0, 0,
	Math.sin(40*j),Math.cos(40*j),0.001,1.0,    0, 0, 0,
	Math.sin(50*j),Math.cos(50*j),0.001,1.0,    0, 0, 0,
	Math.sin(60*j),Math.cos(60*j),0.001,1.0,    0, 0, 0,
	Math.sin(70*j),Math.cos(70*j),0.001,1.0,    0, 0, 0,
	Math.sin(80*j),Math.cos(80*j),0.001,1.0,    0, 0, 0,
	Math.sin(90*j),Math.cos(90*j),0.001,1.0,    0, 0, 0,
	Math.sin(100*j),Math.cos(100*j),0.001,1.0,    0, 0, 0,
	Math.sin(110*j),Math.cos(110*j),0.001,1.0,    0, 0, 0,
	Math.sin(120*j),Math.cos(120*j),0.001,1.0,    0, 0, 0,
	Math.sin(130*j),Math.cos(130*j),0.001,1.0,    0, 0, 0,
	Math.sin(140*j),Math.cos(140*j),0.001,1.0,    0, 0, 0,
	Math.sin(150*j),Math.cos(150*j),0.001,1.0,    0, 0, 0,
	Math.sin(160*j),Math.cos(160*j),0.001,1.0,    0, 0, 0,
	Math.sin(170*j),Math.cos(170*j),0.001,1.0,    0, 0, 0,
	Math.sin(180*j),Math.cos(180*j),0.001,1.0,    0, 0, 0,
	Math.sin(190*j),Math.cos(190*j),0.001,1.0,    0, 0, 0,
	Math.sin(200*j),Math.cos(200*j),0.001,1.0,    0, 0, 0,
	Math.sin(210*j),Math.cos(210*j),0.001,1.0,    0, 0, 0,
	Math.sin(220*j),Math.cos(220*j),0.001,1.0,    0, 0, 0,
	Math.sin(230*j),Math.cos(230*j),0.001,1.0,    0, 0, 0,
	Math.sin(240*j),Math.cos(240*j),0.001,1.0,    0, 0, 0,
	Math.sin(250*j),Math.cos(250*j),0.001,1.0,    0, 0, 0,
	Math.sin(260*j),Math.cos(260*j),0.001,1.0,    0, 0, 0,
	Math.sin(270*j),Math.cos(270*j),0.001,1.0,    0, 0, 0,
	Math.sin(280*j),Math.cos(280*j),0.001,1.0,    0, 0, 0,
	Math.sin(290*j),Math.cos(290*j),0.001,1.0,    0, 0, 0,
	Math.sin(300*j),Math.cos(300*j),0.001,1.0,    0, 0, 0,
	Math.sin(310*j),Math.cos(310*j),0.001,1.0,    0, 0, 0,
	Math.sin(320*j),Math.cos(320*j),0.001,1.0,    0, 0, 0,
	Math.sin(330*j),Math.cos(330*j),0.001,1.0,    0, 0, 0,
	Math.sin(340*j),Math.cos(340*j),0.001,1.0,    0, 0, 0,
	Math.sin(350*j),Math.cos(350*j),0.001,1.0,    0, 0, 0,
	Math.sin(361*j),Math.cos(361*j),0.001,1.0,    0, 0, 0,
]);

}

//=============================================================================
//=============================================================================
function VBObox1() {
	//=============================================================================
	//=============================================================================
	// CONSTRUCTOR for one re-usable 'VBObox1' object that holds all data and fcns
	// needed to render vertices from one Vertex Buffer Object (VBO) using one 
	// separate shader program (a vertex-shader & fragment-shader pair) and one
	// set of 'uniform' variables.
	
	// Constructor goal: 
	// Create and set member vars that will ELIMINATE ALL LITERALS (numerical values 
	// written into code) in all other VBObox functions. Keeping all these (initial)
	// values here, in this one coonstrutor function, ensures we can change them 
	// easily WITHOUT disrupting any other code, ever!
	  
		this.VERT_SRC =	//--------------------- VERTEX SHADER source code 
	  //'precision highp float;\n' +				// req'd in OpenGL ES if we use 'float'
	  //	  
	  'uniform mat4 u_projMatrix;\n' +	//projection_matrix
	  'uniform mat4 u_viewMatrix;\n' +	//view_matrix
	  'uniform mat4 u_ModelMatrix;\n' +	//u_ModelMatrix
	  'uniform mat4 u_NormalMatrix;\n' +
	  'uniform vec3 Ka;\n' +	    // Ambient reflection coefficient
	  'uniform vec3 Kd; \n' +		  // Diffuse reflection coefficient
	  'uniform vec3 Ks; \n' +		  // Specular reflection coefficient
	  'attribute vec4 a_Position;\n' +
	  'attribute vec3 a_Color;\n' +		//color
	  'attribute vec3 a_Normal;\n' +
	  'uniform float shininessVal;\n' + // Shininess
	//   'uniform vec3 eye_vector;\n' + // eye_vector
	  'uniform int light_status;\n' + // 
	  'uniform int phong_status;\n' + //
		// Material color
	//   'uniform vec3 ambientColor;\n' + 
      'uniform vec3 diffuseColor;\n' + 
	  'uniform vec3 specularColor;\n' + 

	  'uniform vec3 lightPos;\n' + // Light direction (in the world coordinate, normalized)
	  'varying vec4 v_Color;\n' +

	  'void main() {\n' +
	  	'if (light_status==1){\n'+
		 	 'if (phong_status==1){\n'+
	  		'vec4 vertPos4=  u_ModelMatrix * a_Position;\n' +
			'vec4 view_vertPos4= u_viewMatrix*u_ModelMatrix * a_Position;\n' +
			'vec3 view_vertPos= view_vertPos4.xyz ;\n' +
	 		 'vec3 vertPos= vertPos4.xyz ;\n' +
			'vec3 view_final_vertPos = view_vertPos/ view_vertPos4.w;\n' +
	 		 'vec4 transVec = u_NormalMatrix * vec4(a_Normal, 0.0);\n' +

	 		 'vec3 normVec = normalize(transVec.xyz);\n' + // N
	 		 'vec3 L=normalize(lightPos-vertPos);\n'+//L
			//  'float distance = length(lightPos - view_final_vertPos);\n'+//L
			//  'float Att = 1.0/distance;\n'+//L
	 		 'float lambertian = max(dot(normVec, L), 0.0);\n' +
	 		 'float specular = 0.0;\n' +

	 		 '	 if(lambertian > 0.0) {\n' +
	 		 '		vec3 R = reflect(-L, normVec);    \n' +  // Reflected light vector
	 		 '		vec3 V = normalize(-view_final_vertPos); \n' +// Vector to viewer
	 		 '		float specAngle = max(dot(R, V), 0.0);\n' +// Compute the specular term
	    		'		specular = pow(specAngle, shininessVal);\n' +
	   		 	'	  }\n' +
	 		 '  gl_Position =u_projMatrix* u_viewMatrix * vertPos4;\n' +
	 		 '  v_Color = vec4(Ka*a_Color+ \n' +
				'			 Kd*lambertian*diffuseColor+\n' +
				'	    Ks*specular*specularColor, 1.0 );\n' +
				'}else{\n'+


				'vec4 vertPos4=  u_ModelMatrix * a_Position;\n' +
				'vec4 view_vertPos4= u_viewMatrix*u_ModelMatrix * a_Position;\n' +
				'vec3 view_vertPos= view_vertPos4.xyz ;\n' +
				  'vec3 vertPos= vertPos4.xyz ;\n' +
				'vec3 view_final_vertPos = view_vertPos/ view_vertPos4.w;\n' +
				  'vec4 transVec = u_NormalMatrix * vec4(a_Normal, 0.0);\n' +
	
				  'vec3 normVec = normalize(transVec.xyz);\n' + // N
				  'vec3 L=normalize(lightPos-vertPos);\n'+//L
	
				  'float lambertian = max(dot(normVec, L), 0.0);\n' +
				  'float specular = 0.0;\n' +
	
				  '	 if(lambertian > 0.0) {\n' +
				  '		vec3 R = reflect(-L, normVec);    \n' +  // Reflected light vector
				  '		vec3 V = normalize(-view_final_vertPos); \n' +// Vector to viewer
				  '		vec3 H = normalize(L+V); \n' +// Vector to viewer
				  '		float specAngle = max(dot(normVec, H), 0.0);\n' +// Compute the specular term
					'		specular = pow(specAngle, shininessVal);\n' +
						'	  }\n' +
				  '  gl_Position =u_projMatrix* u_viewMatrix * vertPos4;\n' +
				  '  v_Color = vec4(Ka*a_Color+ \n' +
					'			 Kd*lambertian*diffuseColor+\n' +
					'	    Ks*specular*specularColor, 1.0 );\n' +
				  '}\n'+




	 	 	'}else{\n'+
		  	'  gl_Position =u_projMatrix* u_viewMatrix *u_ModelMatrix * a_Position;\n' +
			'  v_Color = vec4(0.0,0.0,0.0,1.0);\n' +
		 	 '}\n'+
	  '}\n';
	/*
	 // SQUARE dots:
		this.FRAG_SRC = //---------------------- FRAGMENT SHADER source code 
	  'precision mediump float;\n' +
	  'varying vec3 v_Colr1;\n' +
	  'void main() {\n' +
	  '  gl_FragColor = vec4(v_Colr1, 1.0);\n' +  
	  '}\n';
	*/
	/*
	 // ROUND FLAT dots:
		this.FRAG_SRC = //---------------------- FRAGMENT SHADER source code 
	  'precision mediump float;\n' +
	  'varying vec3 v_Colr1;\n' +
	  'void main() {\n' +
	  '  float dist = distance(gl_PointCoord, vec2(0.5, 0.5)); \n' + 
	  '  if(dist < 0.5) {\n' +
	  '    gl_FragColor = vec4(v_Colr1, 1.0);\n' +  
	  '    } else {discard;};' +
	  '}\n';
	*/
	 // SHADED, sphere-like dots:
		this.FRAG_SRC = //---------------------- FRAGMENT SHADER source code 
	  'precision mediump float;\n' +
	  'varying vec4 v_Color;\n' +
	  'void main() {\n' +
	  '  gl_FragColor = v_Color;\n' +
	  '}\n';


	makeTetforvbox1();
	makeCube();
	makeSpinningSphere()
	// makeTet()
	// makeSpinningSphere();
	var mySiz = (vbobox1_my_tetrahedron.length+my_cube.length+spinSphVerts.length);	
	var nn = mySiz / vbobox1_floatsPerVertex;
	console.log('nn is', nn, 'mySiz is', mySiz, 'floatsPerVertex is', floatsPerVertex);
	var colorShapes = new Float32Array(mySiz);


	vbox1_TetraStart=0;
    for(i=0,j=0; j< vbobox1_my_tetrahedron.length; i++,j++) {
    colorShapes[i] = vbobox1_my_tetrahedron[j];
    }
	vbox1_cubStart=i;
	for(j=0; j< my_cube.length; i++,j++) {
		colorShapes[i] = my_cube[j];
	}
	vbox1_spinSphStart=i;
	for(j=0; j< spinSphVerts.length; i++,j++) {
		colorShapes[i] = spinSphVerts[j];
	}


	var my_tetrahedron_normal=getnormalvector(vbobox1_my_tetrahedron,vbobox1_my_tetrahedron.length/vbobox1_floatsPerVertex);
    var my_cube_normal=getnormalvector(my_cube,my_cube.length/vbobox1_floatsPerVertex);
	var my_sphere_normal=new Float32Array(spinSphVerts.length*3/vbobox1_floatsPerVertex);
	for(e=0,p=0;p<my_sphere_normal.length;){
		my_sphere_normal[p]=spinSphVerts[e];
		my_sphere_normal[p+1]=spinSphVerts[e+1];
		my_sphere_normal[p+2]=spinSphVerts[e+2];
		e=e+7;
		p=p+3;
	}



	var mySiz2 = (my_tetrahedron_normal.length+my_cube_normal.length+my_sphere_normal.length);	
	var nn2 = mySiz2 / vbobox1_floatsPerVertex;
	console.log('nn is', nn2, 'mySiz is', mySiz2, 'floatsPerVertex is', floatsPerVertex);

	var colorShapes_normal = new Float32Array(mySiz2);
	vbox1_TetraStart_normal=0;
    for(g=0,h=0; h< my_tetrahedron_normal.length; g++,h++) {
		colorShapes_normal[g] = my_tetrahedron_normal[h];
    }	
	vbox1_CubeStart_normal=g;
    for(h=0; h< my_cube_normal.length; g++,h++) {
		colorShapes_normal[g] = my_cube_normal[h];
    }	
	vbox1_sphereStart_normal=g;
    for(h=0; h< my_sphere_normal.length; g++,h++) {
		colorShapes_normal[g] = my_sphere_normal[h];
    }	




	this.vboContents = colorShapes;
	this.vboContents2=colorShapes_normal;

	this.FSIZE = this.vboContents.BYTES_PER_ELEMENT;
									  // bytes req'd by 1 vboContents array element;
																	// (why? used to compute stride and offset 
																	// in bytes for vertexAttribPointer() calls)          
	this.vboStride = this.FSIZE*vbobox1_floatsPerVertex;     
									  // (== # of bytes to store one complete vertex).
									  // From any attrib in a given vertex in the VBO, 
									  // move forward by 'vboStride' bytes to arrive 
									  // at the same attrib for the next vertex.
									   
					//----------------------Attribute sizes
	  this.vboFcount_a_Pos1 =  4;    // # of floats in the VBO needed to store the
									// attribute named a_Pos1. (4: x,y,z,w values)
	  this.vboFcount_a_Colr1 = 3;   // # of floats for this attrib (r,g,b values)
	  this.vboFcount_a_normal1 = 3;  // # of floats for this attrib (just 3!)   
	//   console.assert((this.vboFcount_a_Pos1 +     // check the size of each and
	// 				  this.vboFcount_a_Colr1 +
	// 				  this.vboFcount_a_normal1) *   // every attribute in our VBO
	// 				  this.FSIZE == this.vboStride, // for agreeement with'stride'
	// 				  "Uh oh! VBObox1.vboStride disagrees with attribute-size values!");
					  
				  //----------------------Attribute offsets
		this.vboOffset_a_Pos1 = 0;    //# of bytes from START of vbo to the START
									  // of 1st a_Pos1 attrib value in vboContents[]
	  this.vboOffset_a_Colr1 = (this.vboFcount_a_Pos1) * this.FSIZE;  
									// == 4 floats * bytes/float
									//# of bytes from START of vbo to the START
									// of 1st a_Colr1 attrib value in vboContents[]
	  this.vboOffset_a_Normal1 =(this.vboFcount_a_Pos1 +
								this.vboFcount_a_Colr1) * this.FSIZE; 
									// == 7 floats * bytes/float
									// # of bytes from START of vbo to the START
									// of 1st a_PtSize attrib value in vboContents[]
	
					//-----------------------GPU memory locations:                                
		this.vboLoc;									// GPU Location for Vertex Buffer Object, 
									  // returned by gl.createBuffer() function call
		this.vboLoc2;


		this.shaderLoc;								// GPU Location for compiled Shader-program  
										// set by compile/link of VERT_SRC and FRAG_SRC.
											  //------Attribute locations in our shaders:
		this.a_Position;							  // GPU location: shader 'a_Pos1' attribute
		this.a_Color;							// GPU location: shader 'a_Colr1' attribute
		this.a_Normal;							// GPU location: shader 'a_PtSiz1' attribute
		
					//---------------------- Uniform locations &values in our shaders
		this.g_modelMatrix = new Matrix4();	// Transforms CVV axes to model axes.
		this.g_modelMatLoc;							// GPU location for u_ModelMat uniform

					//normalMatrix
		this.normalMatrix = new Matrix4();
		this.u_NormalMatrix;
				//viewMatrix
		this.g_viewMatrix= new Matrix4();
		this.g_viewMatLoc;
				//projectionMatrix
		this.g_projMatrix= new Matrix4();
		this.g_projMatLoc;

		this.Ka;
		this.Kd;
		this.Ks;
		this.shininessVal;
		this.ambientColor;
		this.diffuseColor;
		this.specularColor;

		this.light_status;
		this.phong_status;
	//lightDirection
		this.lightPos;
	//
		// // this.u_LightColor;
		// this.eye_vector;


	};
	
	
VBObox1.prototype.init = function() {
	//==============================================================================
	// Prepare the GPU to use all vertices, GLSL shaders, attributes, & uniforms 
	// kept in this VBObox. (This function usually called only once, within main()).
	// Specifically:
	// a) Create, compile, link our GLSL vertex- and fragment-shaders to form an 
	//  executable 'program' stored and ready to use inside the GPU.  
	// b) create a new VBO object in GPU memory and fill it by transferring in all
	//  the vertex data held in our Float32array member 'VBOcontents'. 
	// c) Find & save the GPU location of all our shaders' attribute-variables and 
	//  uniform-variables (needed by switchToMe(), adjust(), draw(), reload(), etc.)
	// -------------------
	// CAREFUL!  before you can draw pictures using this VBObox contents, 
	//  you must call this VBObox object's switchToMe() function too!
	//--------------------
	// a) Compile,link,upload shaders-----------------------------------------------
		this.shaderLoc = createProgram(gl, this.VERT_SRC, this.FRAG_SRC);
		if (!this.shaderLoc) {
		console.log(this.constructor.name + 
								'.init() failed to create executable Shaders on the GPU. Bye!');
		return;
	  }
	// CUTE TRICK: let's print the NAME of this VBObox object: tells us which one!
	//  else{console.log('You called: '+ this.constructor.name + '.init() fcn!');}
	
		gl.program = this.shaderLoc;		// (to match cuon-utils.js -- initShaders())
	
	// b) Create VBO on GPU, fill it------------------------------------------------
		this.vboLoc = gl.createBuffer();	
	  if (!this.vboLoc) {
		console.log(this.constructor.name + 
								'.init() failed to create VBO in GPU. Bye!'); 
		return;
	  }
	  // Specify the purpose of our newly-created VBO on the GPU.  Your choices are:
	  //	== "gl.ARRAY_BUFFER" : the VBO holds vertices, each made of attributes 
	  // (positions, colors, normals, etc), or 
	  //	== "gl.ELEMENT_ARRAY_BUFFER" : the VBO holds indices only; integer values 
	  // that each select one vertex from a vertex array stored in another VBO.
	  gl.bindBuffer(gl.ARRAY_BUFFER,	      // GLenum 'target' for this GPU buffer 
									  this.vboLoc);				  // the ID# the GPU uses for this buffer.
												  
	  // Fill the GPU's newly-created VBO object with the vertex data we stored in
	  //  our 'vboContents' member (JavaScript Float32Array object).
	  //  (Recall gl.bufferData() will evoke GPU's memory allocation & management: 
	  //	 use gl.bufferSubData() to modify VBO contents without changing VBO size)
	  gl.bufferData(gl.ARRAY_BUFFER, 			  // GLenum target(same as 'bindBuffer()')
										  this.vboContents, 		// JavaScript Float32Array
									   gl.STATIC_DRAW);			// Usage hint.  

	  this.vboLoc2=gl.createBuffer();
	  if (!this.vboLoc2) {
		console.log(this.constructor.name + 
								'.init() failed to create VBO in GPU. Bye!'); 
		return;
	  }
	  gl.bindBuffer(gl.ARRAY_BUFFER,this.vboLoc2);
	  gl.bufferData(gl.ARRAY_BUFFER, 			  // GLenum target(same as 'bindBuffer()')
	  this.vboContents2, 		// JavaScript Float32Array
   gl.STATIC_DRAW);			// Usage hint.  


	  //	The 'hint' helps GPU allocate its shared memory for best speed & efficiency
	  //	(see OpenGL ES specification for more info).  Your choices are:
	  //		--STATIC_DRAW is for vertex buffers rendered many times, but whose 
	  //				contents rarely or never change.
	  //		--DYNAMIC_DRAW is for vertex buffers rendered many times, but whose 
	  //				contents may change often as our program runs.
	  //		--STREAM_DRAW is for vertex buffers that are rendered a small number of 
	  // 			times and then discarded; for rapidly supplied & consumed VBOs.
	
	// c1) Find All Attributes:-----------------------------------------------------
	//  Find & save the GPU location of all our shaders' attribute-variables and 
	//  uniform-variables (for switchToMe(), adjust(), draw(), reload(), etc.)
	  this.a_Position = gl.getAttribLocation(this.shaderLoc, 'a_Position');
	  if(this.a_Position < 0) {
		console.log(this.constructor.name + 
								'.init() Failed to get GPU location of attribute a_Position');
		return -1;	// error exit.
	  }
		 this.a_Color = gl.getAttribLocation(this.shaderLoc, 'a_Color');
	  if(this.a_Colr1Loc < 0) {
		console.log(this.constructor.name + 
								'.init() failed to get the GPU location of attribute a_Color');
		return -1;	// error exit.
	  }
	  this.a_Normal = gl.getAttribLocation(this.shaderLoc, 'a_Normal');
	  if(this.a_Normal < 0) {
		console.log(this.constructor.name + 
								'.init() failed to get the GPU location of attribute a_Normal');
		  return -1;	// error exit.
	  }
	  // c2) Find All Uniforms:-----------------------------------------------------
	  //Get GPU storage location for each uniform var used in our shader programs: 
	 this.g_modelMatLoc = gl.getUniformLocation(this.shaderLoc, 'u_ModelMatrix');
	  if (!this.g_modelMatLoc) { 
		console.log(this.constructor.name + 
								'.init() failed to get GPU location for u_ModelMatrix uniform');
		return;
	  }

	  this.u_NormalMatrix = gl.getUniformLocation(gl.program, 'u_NormalMatrix');
	  if(!this.u_NormalMatrix) {
		  console.log('Failed to get GPU storage location for u_NormalMatrix');
		  return;
	  }


	//   this.u_LightColor = gl.getUniformLocation(gl.program, 'u_LightColor');
	  this.lightPos = gl.getUniformLocation(gl.program, 'lightPos');
	  if (!this.lightPos) { 
		console.log('Failed to get the storage location');
		return;
	  }
	  this.g_viewMatLoc = gl.getUniformLocation(gl.program, 'u_viewMatrix');
	  if (!this.g_viewMatLoc) { 
		console.log('Failed to get the storage location of g_viewMatLoc');
		return;
	  }
	  this.g_projMatLoc = gl.getUniformLocation(gl.program, 'u_projMatrix');
	  if (!this.g_projMatLoc) { 
		console.log('Failed to get the storage location of g_projMatLoc');
		return;
	  }

	//
	   this.Ka=gl.getUniformLocation(gl.program,'Ka');
	   this.Kd=gl.getUniformLocation(gl.program,'Kd');
	   this.Ks=gl.getUniformLocation(gl.program,'Ks');
	   this.light_status=gl.getUniformLocation(gl.program,'light_status');
	   this.phong_status=gl.getUniformLocation(gl.program,'phong_status');
	//    this.eye_vector=gl.getUniformLocation(gl.program,'eye_vector');
	   this.shininessVal=gl.getUniformLocation(gl.program,'shininessVal');
	   if (!this.Ka|| !this.Kd || !this.Ks|| !this.shininessVal|| !this.light_status) { 
		console.log('Failed to get the storage location of Ka||Kd||Ks||shininessVal');
		return;
	  }
	//materal
	// this.ambientColor=gl.getUniformLocation(gl.program,'ambientColor');
	this.diffuseColor=gl.getUniformLocation(gl.program,'diffuseColor');
	this.specularColor=gl.getUniformLocation(gl.program,'specularColor');









	}
	
	VBObox1.prototype.switchToMe = function () {
	//==============================================================================
	// Set GPU to use this VBObox's contents (VBO, shader, attributes, uniforms...)
	//
	// We only do this AFTER we called the init() function, which does the one-time-
	// only setup tasks to put our VBObox contents into GPU memory.  !SURPRISE!
	// even then, you are STILL not ready to draw our VBObox's contents onscreen!
	// We must also first complete these steps:
	//  a) tell the GPU to use our VBObox's shader program (already in GPU memory),
	//  b) tell the GPU to use our VBObox's VBO  (already in GPU memory),
	//  c) tell the GPU to connect the shader program's attributes to that VBO.
	
	// a) select our shader program:
	  gl.useProgram(this.shaderLoc);	
	//		Each call to useProgram() selects a shader program from the GPU memory,
	// but that's all -- it does nothing else!  Any previously used shader program's 
	// connections to attributes and uniforms are now invalid, and thus we must now
	// establish new connections between our shader program's attributes and the VBO
	// we wish to use.  
	  
	// Set the light direction (in the world coordinate)
	// gl.uniform3f(this.u_LightColor, 1.0, 1.0, 1.0);
	var lightPosition = new Vector3([lightx,lighty,lightz]);
	// lightPosition.normalize();     // Normalize
	gl.uniform3fv(this.lightPos, lightPosition.elements);
	console.log("lightPosition:",lightPosition);

	// my_Material=new Material(material_code);//blueplastic
	// // var my_ambientColor= my_Material.K_ambi.slice(0,3); 
	// var my_diffuseColor= my_Material.K_diff.slice(0,3) ; 
	// // var my_specularColor= my_Material.K_spec.slice(0,3) ;
	// var my_specularColor=my_Material.K_spec.slice(0,3);
	// var my_shininessVal=my_Material.K_shiny;

	// // console.log("Ka:",my_ambientColor);
	// console.log("Kd:",my_diffuseColor);
	// console.log("Ks",my_specularColor);
	// console.log("shininessVal",my_shininessVal);

	// //bind
	// // gl.uniform3fv(this.ambientColor, my_ambientColor);
	// gl.uniform3fv(this.diffuseColor, my_diffuseColor);
	// gl.uniform3fv(this.specularColor, my_specularColor);

	var my_Ka=light_Ambient;
	var my_Kd=light_Diffuse;
	var my_Ks=light_Specular;

	gl.uniform3fv(this.Ka,my_Ka);
	gl.uniform3fv(this.Kd,my_Kd);
	gl.uniform3fv(this.Ks,my_Ks);
	gl.uniform1i(this.light_status,my_light_status);
	gl.uniform1i(this.phong_status,my_phong_status);
	// temp_eye_array=[eyex,eyey,eyez]
	// gl.uniform3fv(this.eye_vector,temp_eye_array);

	

	// b) call bindBuffer to disconnect the GPU from its currently-bound VBO and
	//  instead connect to our own already-created-&-filled VBO.  This new VBO can 
	//    supply values to use as attributes in our newly-selected shader program:
		gl.bindBuffer(gl.ARRAY_BUFFER,	    // GLenum 'target' for this GPU buffer 
											this.vboLoc);			// the ID# the GPU uses for our VBO.
	
	// c) connect our newly-bound VBO to supply attribute variable values for each
	// vertex to our SIMD shader program, using 'vertexAttribPointer()' function.
	// this sets up data paths from VBO to our shader units:
	  // 	Here's how to use the almost-identical OpenGL version of this function:
		//		http://www.opengl.org/sdk/docs/man/xhtml/glVertexAttribPointer.xml )
	  gl.vertexAttribPointer(
			this.a_Position,//index == ID# for the attribute var in GLSL shader pgm;
			this.vboFcount_a_Pos1, // # of floats used by this attribute: 1,2,3 or 4?
			gl.FLOAT,		  // type == what data type did we use for those numbers?
			false,				// isNormalized == are these fixed-point values that we need
										//									normalize before use? true or false
			this.vboStride,// Stride == #bytes we must skip in the VBO to move from the
						  // stored attrib for this vertex to the same stored attrib
						  //  for the next vertex in our VBO.  This is usually the 
										// number of bytes used to store one complete vertex.  If set 
										// to zero, the GPU gets attribute values sequentially from 
										// VBO, starting at 'Offset'.	
										// (Our vertex size in bytes: 4 floats for pos + 3 for color)
			this.vboOffset_a_Pos1);						
						  // Offset == how many bytes from START of buffer to the first
									  // value we will actually use?  (we start with position).
	  gl.vertexAttribPointer(this.a_Color, this.vboFcount_a_Colr1,
							 gl.FLOAT, false, 
										 this.vboStride,  this.vboOffset_a_Colr1);


		//bind to another buffer
	 gl.bindBuffer(gl.ARRAY_BUFFER,	    // GLenum 'target' for this GPU buffer 
										 this.vboLoc2);			// the ID# the GPU uses for our VBO.


	  gl.vertexAttribPointer(this.a_Normal,this.vboFcount_a_normal1, 
							 gl.FLOAT, false, 
										   this.FSIZE*3,0);	
	  //-- Enable this assignment of the attribute to its' VBO source:
	  gl.enableVertexAttribArray(this.a_Position);
	  gl.enableVertexAttribArray(this.a_Color);
	  gl.enableVertexAttribArray(this.a_Normal);
	}
	
	VBObox1.prototype.isReady = function() {
	//==============================================================================
	// Returns 'true' if our WebGL rendering context ('gl') is ready to render using
	// this objects VBO and shader program; else return false.
	// see: https://developer.mozilla.org/en-US/docs/Web/API/WebGLRenderingContext/getParameter
	
	var isOK = true;
	
	  if(gl.getParameter(gl.CURRENT_PROGRAM) != this.shaderLoc)  {
		console.log(this.constructor.name + 
								'.isReady() false: shader program at this.shaderLoc not in use!');
		isOK = false;
	  }
	//   if(gl.getParameter(gl.ARRAY_BUFFER_BINDING) != this.vboLoc) {
	// 	  console.log(this.constructor.name + 
	// 						  '.isReady() false: vbo at this.vboLoc not in use!');
	// 	isOK = false;
	//   }
	  return isOK;
	}
	
	VBObox1.prototype.adjust = function() {
	//==============================================================================
	// Update the GPU to newer, current values we now store for 'uniform' vars on 
	// the GPU; and (if needed) update each attribute's stride and offset in VBO.
	
	  // check: was WebGL context set to use our VBO & shader program?
	  if(this.isReady()==false) {
			console.log('ERROR! before' + this.constructor.name + 
							  '.adjust() call you needed to call this.switchToMe()!!');
	  }


	}
	
	VBObox1.prototype.draw = function() {
	//=============================================================================
	// Send commands to GPU to select and render current VBObox contents.
	
	  // check: was WebGL context set to use our VBO & shader program?
	  if(this.isReady()==false) {
			console.log('ERROR! before' + this.constructor.name + 
							  '.draw() call you needed to call this.switchToMe()!!');
	  }
	
//   //  b) reverse the usage of the depth-buffer's stored values, like this:
//   gl.enable(gl.DEPTH_TEST); // enabled by default, but let's be SURE.
//   gl.clearDepth(0.0);       // each time we 'clear' our depth buffer, set all
//                             // pixel depths to 0.0  (1.0 is DEFAULT)
//   gl.depthFunc(gl.GREATER); // draw a pixel only if its depth value is GREATER
//                             // than the depth buffer's stored value.
//                             // (gl.LESS is DEFAULT; reverse it!)
//=====================================================================

	//setperspective
	var vpAspect = g_canvas.width/2 /			// On-screen aspect ratio for
	(g_canvas.height/2);	// this camera: width/height.
	// this.g_modelMatrix.setPerspective(40, vpAspect, 1, 1000);	// near, far (always >0).
	this.g_projMatrix.setPerspective(35,vpAspect, 1, 30.0);
	gl.uniformMatrix4fv(this.g_projMatLoc, false, this.g_projMatrix.elements);

	//setview
	aimx=eyex+Math.cos(angle);
	aimy=eyey+Math.sin(angle);
	aimz=eyez+tilt;	
	// console.log(aimx);
	//set camera
	//control camera
	this.g_viewMatrix.setLookAt(eyex,eyey,eyez,aimx,aimy,aimz,0,0,1);
	gl.uniformMatrix4fv(this.g_viewMatLoc, false, this.g_viewMatrix.elements);


	this.g_modelMatrix.setIdentity();  
	pushMatrix(this.g_modelMatrix);     // SAVE world coord system;
	this.vbobox1_DrawTetrahedron();
	this.g_modelMatrix=popMatrix();
	

//draw pikachu or draw Cube
pushMatrix(this.g_modelMatrix);
this.g_modelMatrix.translate(0.0,0,0.01);
this.g_modelMatrix.translate(0,-2,0);
this.g_modelMatrix.rotate(90,1,0,0);
this.g_modelMatrix.rotate(180,0,1,0);

// this.Drawpikachu();
this.Drawcube();
this.g_modelMatrix=popMatrix();



pushMatrix(this.g_modelMatrix);
this.g_modelMatrix.translate(1.0,1,-0.5);
this.DrawspinSphere()
this.g_modelMatrix=popMatrix();






// //draw spinning Sphere
// this.DrawspinSphere();



	}
	
	
	VBObox1.prototype.reload = function() {
	//=============================================================================
	// Over-write current values in the GPU for our already-created VBO: use 
	// gl.bufferSubData() call to re-transfer some or all of our Float32Array 
	// contents to our VBO without changing any GPU memory allocations.
	
	 gl.bufferSubData(gl.ARRAY_BUFFER, 	// GLenum target(same as 'bindBuffer()')
					  0,                  // byte offset to where data replacement
										  // begins in the VBO.
										  this.vboContents);   // the JS source-data array used to fill VBO
	}
	
	/*
	VBObox1.prototype.empty = function() {
	//=============================================================================
	// Remove/release all GPU resources used by this VBObox object, including any 
	// shader programs, attributes, uniforms, textures, samplers or other claims on 
	// GPU memory.  However, make sure this step is reversible by a call to 
	// 'restoreMe()': be sure to retain all our Float32Array data, all values for 
	// uniforms, all stride and offset values, etc.
	//
	//
	// 		********   YOU WRITE THIS! ********
	//
	//
	//
	}
	
	VBObox1.prototype.restore = function() {
	//=============================================================================
	// Replace/restore all GPU resources used by this VBObox object, including any 
	// shader programs, attributes, uniforms, textures, samplers or other claims on 
	// GPU memory.  Use our retained Float32Array data, all values for  uniforms, 
	// all stride and offset values, etc.
	//
	//
	// 		********   YOU WRITE THIS! ********
	//
	//
	//
	}
	*/
	

	function makeTetforvbox1(){
		var c30 = Math.sqrt(0.75);					// == cos(30deg) == sqrt(3) / 2
		var sq2	= Math.sqrt(2.0);						 
		// for surface normals:
		var sq23 = Math.sqrt(2.0/3.0)
		var sq29 = Math.sqrt(2.0/9.0)
		var sq89 = Math.sqrt(8.0/9.0)
		var thrd = 1.0/3.0;		

		vbobox1_my_tetrahedron = new Float32Array([
		  // Face 0: (right side).  Unit Normal Vector: N0 = (sq23, sq29, thrd)
			   // Node 0 (apex, +z axis; 			color--blue, 				surf normal (all verts):
					0.0,	 0.0, sq2, 1.0,			0.1745,   0.01175,  0.01175,		 
			   // Node 1 (base: lower rt; red)
						   c30, -0.5, 0.0, 1.0, 		0.1745,   0.01175,  0.01175,
			   // Node 2 (base: +y axis;  grn)
						   0.0,  1.0, 0.0, 1.0,  	0.1745,   0.01175,  0.01175,
		  // Face 1: (left side).		Unit Normal Vector: N1 = (-sq23, sq29, thrd)
				   // Node 0 (apex, +z axis;  blue)
							   0.0,	 0.0, sq2, 1.0,		0.1745,   0.01175,  0.01175,
			   // Node 2 (base: +y axis;  grn)
						   0.0,  1.0, 0.0, 1.0,  	0.1745,   0.01175,  0.01175,
			   // Node 3 (base:lower lft; white)
						  -c30, -0.5, 0.0, 1.0, 	0.1745,   0.01175,  0.01175, 
		  // Face 2: (lower side) 	Unit Normal Vector: N2 = (0.0, -sq89, thrd)
				   // Node 0 (apex, +z axis;  blue) 
							   0.0,	 0.0, sq2, 1.0,			0.1745,   0.01175,  0.01175,	
			  // Node 3 (base:lower lft; white)
						  -c30, -0.5, 0.0, 1.0, 		0.1745,   0.01175,  0.01175,	         																							//0.0, 0.0, 0.0, // Normals debug
			   // Node 1 (base: lower rt; red) 
						   c30, -0.5, 0.0, 1.0, 		0.1745,   0.01175,  0.01175,
		  // Face 3: (base side)  Unit Normal Vector: N2 = (0.0, 0.0, -1.0)
			  // Node 3 (base:lower lft; white)
						  -c30, -0.5, 0.0, 1.0, 		0.1745,   0.01175,  0.01175,
			  // Node 2 (base: +y axis;  grn)
						   0.0,  1.0, 0.0, 1.0,  		0.1745,   0.01175,  0.01175,	
			  // Node 1 (base: lower rt; red)
						   c30, -0.5, 0.0, 1.0, 	0.1745,   0.01175,  0.01175,
			   
			]);
	
	}



















	//=============================================================================
	//=============================================================================
	function VBObox2() {
		this.VERT_SRC =	//--------------------- VERTEX SHADER source code 
		//'precision highp float;\n' +				// req'd in OpenGL ES if we use 'float'
		//	  

	// 	'uniform float Ka;\n' +	    // Ambient reflection coefficient
	// 	'uniform float Kd; \n' +		  // Diffuse reflection coefficient
	// 	'uniform float Ks; \n' +		  // Specular reflection coefficient

	// 	'uniform float shininessVal;\n' + // Shininess
	//   //   'uniform vec3 eye_vector;\n' + // eye_vector
	// 	'uniform int light_status;\n' + // 
	// 	'uniform int phong_status;\n' + //
	// 	  // Material color
	//   //   'uniform vec3 ambientColor;\n' + 
	// 	'uniform vec3 diffuseColor;\n' + 
	// 	'uniform vec3 specularColor;\n' + 
  
	// 	'uniform vec3 lightPos;\n' + // Light direction (in the world coordinate, normalized)
	// 	'varying vec4 v_Color;\n' +
		'attribute vec4 a_Position;\n' +
		'attribute vec3 a_Color;\n' +		//color
		'attribute vec3 a_Normal;\n' +

		'uniform mat4 u_projMatrix;\n' +	//projection_matrix
		'uniform mat4 u_viewMatrix;\n' +	//view_matrix
		'uniform mat4 u_ModelMatrix;\n' +	//u_ModelMatrix
		'uniform mat4 u_NormalMatrix;\n' +

		'varying vec3 v_Color;\n' +
	 	'varying vec3 vertPos;\n' +//in world
		'varying vec3 view_final_vertPos;\n' +//in camera
		'varying vec4 transVec;\n' +
		'void main() {\n' +


				'vec4 vertPos4=  u_ModelMatrix * a_Position;\n' +
			  'vec4 view_vertPos4= u_viewMatrix*u_ModelMatrix * a_Position;\n' +
			  'vec3 view_vertPos= view_vertPos4.xyz ;\n' +
				'vertPos= vertPos4.xyz ;\n' +
			  'view_final_vertPos = view_vertPos/ view_vertPos4.w;\n' +
				'transVec = u_NormalMatrix * vec4(a_Normal, 0.0);\n' +
				 ' v_Color = a_Color;\n' +
		    	'  gl_Position =u_projMatrix* u_viewMatrix * vertPos4;\n' +

  


  


	  
			// 		'	 if(lambertian > 0.0) {\n' +
			// 		'		vec3 R = reflect(-L, normVec);    \n' +  // Reflected light vector
			// 		'		vec3 V = normalize(-view_final_vertPos); \n' +// Vector to viewer
			// 		'		vec3 H = normalize(L+V); \n' +// Vector to viewer
			// 		'		float specAngle = max(dot(normVec, H), 0.0);\n' +// Compute the specular term
			// 		  '		specular = pow(specAngle, shininessVal);\n' +
			// 			  '	  }\n' +
			// 		'  gl_Position =u_projMatrix* u_viewMatrix * vertPos4;\n' +
			// 		'  v_Color = vec4(Ka*a_Color+ \n' +
			// 		  '			 Kd*lambertian*diffuseColor+\n' +
			// 		  '	    Ks*specular*specularColor, 1.0 );\n' +
			// 		'}\n'+
  
  
  
  
			// 	'}else{\n'+
			// 	'  gl_Position =u_projMatrix* u_viewMatrix *u_ModelMatrix * a_Position;\n' +
			//   '  v_Color = vec4(a_Color,1.0);\n' +
			// 	'}\n'+
		'}\n';
	
	   // SHADED, sphere-like dots:
		  this.FRAG_SRC = //---------------------- FRAGMENT SHADER source code 
		'precision mediump float;\n' +
		'uniform vec3 Ka;\n' +	    // Ambient reflection coefficient
		'uniform vec3 Kd; \n' +		  // Diffuse reflection coefficient
		'uniform vec3 Ks; \n' +		  // Specular reflection coefficient

		'uniform float shininessVal;\n' + // Shininess
	  //   'uniform vec3 eye_vector;\n' + // eye_vector
		'uniform int light_status;\n' + // 
		'uniform int phong_status;\n' + //
		  // Material color
	  //   'uniform vec3 ambientColor;\n' + 
		'uniform vec3 diffuseColor;\n' + 
		'uniform vec3 specularColor;\n' + 
		
		'uniform vec3 lightPos;\n' + // Light direction (in the world coordinate, normalized)
		'varying vec3 v_Color;\n' +
		'varying vec3 vertPos;\n' +//in world
	    'varying vec3 view_final_vertPos;\n' +//in camera
	   'varying vec4 transVec;\n' +

		'void main() {\n' +
			'if (light_status==1){\n'+
				'if (phong_status==1){\n'+
			 	'vec3 normVec = normalize(transVec.xyz);\n' + // N
			 	'vec3 L=normalize(lightPos-vertPos);\n'+//L
				'float lambertian = max(dot(normVec, L), 0.0);\n' +
				'float specular = 0.0;\n' +
					 'if(lambertian > 0.0) {\n' +
							'vec3 R = reflect(-L, normVec);\n' +  // Reflected light vector
			 				'vec3 V = normalize(-view_final_vertPos); \n' +// Vector to viewer
							'float specAngle = max(dot(R, V), 0.0);\n' +// Compute the specular term
						    'specular = pow(specAngle, shininessVal);\n' +
									  '	  }\n' +
				'gl_FragColor = vec4(Ka*v_Color+ \n' +
			 		'Kd*lambertian*diffuseColor+\n' +
			 		'Ks*specular*specularColor, 1.0 );\n' +
				'}else{\n'+
				'vec3 normVec = normalize(transVec.xyz);\n' + // N
				'vec3 L=normalize(lightPos-vertPos);\n'+//L
			   'float lambertian = max(dot(normVec, L), 0.0);\n' +
			   'float specular = 0.0;\n' +
					'if(lambertian > 0.0) {\n' +
						   'vec3 R = reflect(-L, normVec);\n' +  // Reflected light vector
							'vec3 V = normalize(-view_final_vertPos); \n' +// Vector to viewer
							'vec3 H = normalize(L+V); \n' +// Vector to viewer
							'float specAngle = max(dot(normVec, H), 0.0);\n' +// Compute the specular term
						   'specular = pow(specAngle, shininessVal);\n' +
									 '	  }\n' +
			   'gl_FragColor = vec4(Ka*v_Color+ \n' +
					'Kd*lambertian*diffuseColor+\n' +
					'Ks*specular*specularColor, 1.0 );\n' +
				 		'}\n'+
			'}else{\n'+
			 '  gl_FragColor = vec4(0.0,0.0,0.0, 1.0);\n' + 
			'}\n'+

		'}\n';
	



	makePikachu();
	makeSpinningSphere();
	makeSphere();
	makeCircle();
	makeCircle2();
	makeTet()
	makeCube();
	  // makeSpinningSphere();
	  var mySiz = (pikachu.length+spinSphVerts.length+sphVerts.length+my_circle.length+my_circle2.length+my_tetrahedron.length+my_cube.length);	
	  var nn = mySiz / vbobox2_floatsPerVertex;
	  console.log('nn is', nn, 'mySiz is', mySiz, 'floatsPerVertex is', floatsPerVertex);
	  var colorShapes = new Float32Array(mySiz);
		

	  vbox_pikachuStart=0
	  for(q=0,w=0; w< pikachu.length; q++,w++) {
		colorShapes[q] = pikachu[w];
	  }
	  vbox2_spinSphStart=q;
	  for(w=0; w< spinSphVerts.length; q++,w++) {
		  colorShapes[q] = spinSphVerts[w];
	  }
	  vbox2_SphStart=q;
	  for(w=0; w< sphVerts.length; q++,w++) {
		colorShapes[q] = sphVerts[w];
		}
	  vbox2_cir1Start=q;
	  for(w=0; w< my_circle.length; q++,w++) {
		  colorShapes[q] = my_circle[w];
		  }
	  vbox2_cir2Start=q;
		  for(w=0; w< my_circle2.length; q++,w++) {
			  colorShapes[q] = my_circle2[w];
			  }
	  vbox2_tetStart=q;
		for(w=0; w< my_tetrahedron.length; q++,w++) {
				  colorShapes[q] = my_tetrahedron[w];
				  }
	  vbox2_cubStart =q;
		 for(w=0; w< my_cube.length; q++,w++) {
							colorShapes[q] = my_cube[w];
							}
				   
  
	//   var my_tetrahedron_normal=getnormalvector(vbobox1_my_tetrahedron,vbobox1_my_tetrahedron.length/vbobox1_floatsPerVertex);
	//   var my_cube_normal=getnormalvector(my_cube,my_cube.length/vbobox1_floatsPerVertex);


	  var my_pikachu_normal=getnormalvector(pikachu,pikachu.length/vbobox2_floatsPerVertex);
	  var my_sphere_normal=getnormalvector_Sphere(spinSphVerts,spinSphVerts.length/vbobox2_floatsPerVertex);
	  var my_pokeball_normal=getnormalvector_Sphere(sphVerts,sphVerts.length/vbobox2_floatsPerVertex);
	  var my_circle_normal=new Float32Array(my_circle.length*3/vbobox2_floatsPerVertex);
	  var my_circle2_normal=new Float32Array(my_circle2.length*3/vbobox2_floatsPerVertex);
	  var my_tetrahedron_normal=getnormalvector(my_tetrahedron,my_tetrahedron.length/vbobox2_floatsPerVertex);
	  var my_cube_normal=getnormalvector(my_cube,my_cube.length/vbobox2_floatsPerVertex);
	  for(st=0;st<my_circle_normal.length;){
		my_circle_normal[st]=0.0;
		my_circle_normal[st+1]=0.0;
		my_circle_normal[st+2]=1.0;
		st=st+3;
	  }
	  for(st2=0;st<my_circle2_normal.length;){
		my_circle2_normal[st2]=0.0;
		my_circle2_normal[st2+1]=0.0;
		my_circle2_normal[st2+2]=1.0;
		st=st+3;
	  }
  
	  var mySiz2 = (my_pikachu_normal.length+my_sphere_normal.length+my_pokeball_normal.length+my_circle_normal.length+my_circle2_normal.length+my_tetrahedron_normal.length);	
	  var nn2 = mySiz2 / vbobox2_floatsPerVertex;
	  console.log('nn is', nn2, 'mySiz is', mySiz2, 'floatsPerVertex is', floatsPerVertex);
  
	  var colorShapes_normal = new Float32Array(mySiz2);


	  vbox2_pikachuStart_normal=0;
	  for(g=0,h=0; h< my_pikachu_normal.length; g++,h++) {
		  colorShapes_normal[g] = my_pikachu_normal[h];
	  }	
	  vbox2_sphereStart_normal=g;
	  for(h=0; h< my_sphere_normal.length; g++,h++) {
		  colorShapes_normal[g] = my_sphere_normal[h];
	  }	
	  vbox2_pokeballStart_normal=g;
	  for(h=0; h< my_pokeball_normal.length; g++,h++) {
		  colorShapes_normal[g] = my_pokeball_normal[h];
	  }	
	  vbox2_pokeball2Start_normal=g;
	  for(h=0; h< my_circle_normal.length; g++,h++) {
		  colorShapes_normal[g] = my_circle_normal[h];
	  }	
	  vbox2_pokeball3Start_normal=g;
	  for(h=0; h< my_circle2_normal.length; g++,h++) {
		  colorShapes_normal[g] = my_circle2_normal[h];
	  }	
	  vbox2_my_tetrahedronl_normal=g;
	  for(h=0; h< my_tetrahedron_normal.length; g++,h++) {
		  colorShapes_normal[g] = my_tetrahedron_normal[h];
	  }	
	  vbox2_my_cube_normal=g;
	  for(h=0; h< my_cube_normal.length; g++,h++) {
		  colorShapes_normal[g] = my_cube_normal[h];
	  }	
	  
  
  
  
  
	  this.vboContents = colorShapes;
	  this.vboContents2=colorShapes_normal;
	  
	  this.FSIZE = this.vboContents.BYTES_PER_ELEMENT;
										// bytes req'd by 1 vboContents array element;
																	  // (why? used to compute stride and offset 
																	  // in bytes for vertexAttribPointer() calls)          
	  this.vboStride = this.FSIZE*vbobox2_floatsPerVertex;     
	  this.vbobytes=this.FSIZE*mySiz;
										// (== # of bytes to store one complete vertex).
										// From any attrib in a given vertex in the VBO, 
										// move forward by 'vboStride' bytes to arrive 
										// at the same attrib for the next vertex.
										 
					  //----------------------Attribute sizes
		this.vboFcount_a_Pos1 =  4;    // # of floats in the VBO needed to store the
									  // attribute named a_Pos1. (4: x,y,z,w values)
		this.vboFcount_a_Colr1 = 3;   // # of floats for this attrib (r,g,b values)
		this.vboFcount_a_normal1 = 3;  // # of floats for this attrib (just 3!)   
	  //   console.assert((this.vboFcount_a_Pos1 +     // check the size of each and
	  // 				  this.vboFcount_a_Colr1 +
	  // 				  this.vboFcount_a_normal1) *   // every attribute in our VBO
	  // 				  this.FSIZE == this.vboStride, // for agreeement with'stride'
	  // 				  "Uh oh! VBObox1.vboStride disagrees with attribute-size values!");
						
					//----------------------Attribute offsets
		  this.vboOffset_a_Pos1 = 0;    //# of bytes from START of vbo to the START
										// of 1st a_Pos1 attrib value in vboContents[]
		this.vboOffset_a_Colr1 = (this.vboFcount_a_Pos1) * this.FSIZE;  
									  // == 4 floats * bytes/float
									  //# of bytes from START of vbo to the START
									  // of 1st a_Colr1 attrib value in vboContents[]
		this.vboOffset_a_Normal1 =(this.vboFcount_a_Pos1 +
								  this.vboFcount_a_Colr1) * this.FSIZE; 
									  // == 7 floats * bytes/float
									  // # of bytes from START of vbo to the START
									  // of 1st a_PtSize attrib value in vboContents[]
	  
					  //-----------------------GPU memory locations:                                
		  this.vboLoc;									// GPU Location for Vertex Buffer Object, 
										// returned by gl.createBuffer() function call
		  this.vboLoc2;
  
  
		  this.shaderLoc;								// GPU Location for compiled Shader-program  
										  // set by compile/link of VERT_SRC and FRAG_SRC.
												//------Attribute locations in our shaders:
		  this.a_Position;							  // GPU location: shader 'a_Pos1' attribute
		  this.a_Color;							// GPU location: shader 'a_Colr1' attribute
		  this.a_Normal;							// GPU location: shader 'a_PtSiz1' attribute
		  
					  //---------------------- Uniform locations &values in our shaders
		  this.g_modelMatrix = new Matrix4();	// Transforms CVV axes to model axes.
		  this.g_modelMatLoc;							// GPU location for u_ModelMat uniform
  
					  //normalMatrix
		  this.normalMatrix = new Matrix4();
		  this.u_NormalMatrix;
				  //viewMatrix
		  this.g_viewMatrix= new Matrix4();
		  this.g_viewMatLoc;
				  //projectionMatrix
		  this.g_projMatrix= new Matrix4();
		  this.g_projMatLoc;
  
		  this.Ka;
		  this.Kd;
		  this.Ks;
		  this.shininessVal;
		  this.ambientColor;
		  this.diffuseColor;
		  this.specularColor;
  
		  this.light_status;
		  this.phong_status;
	  //lightDirection
		  this.lightPos;
	  //
		  // // this.u_LightColor;
		  // this.eye_vector;
	};
	
	
	VBObox2.prototype.init = function() {
		//==============================================================================
	// Prepare the GPU to use all vertices, GLSL shaders, attributes, & uniforms 
	// kept in this VBObox. (This function usually called only once, within main()).
	// Specifically:
	// a) Create, compile, link our GLSL vertex- and fragment-shaders to form an 
	//  executable 'program' stored and ready to use inside the GPU.  
	// b) create a new VBO object in GPU memory and fill it by transferring in all
	//  the vertex data held in our Float32array member 'VBOcontents'. 
	// c) Find & save the GPU location of all our shaders' attribute-variables and 
	//  uniform-variables (needed by switchToMe(), adjust(), draw(), reload(), etc.)
	// -------------------
	// CAREFUL!  before you can draw pictures using this VBObox contents, 
	//  you must call this VBObox object's switchToMe() function too!
	//--------------------
	// a) Compile,link,upload shaders-----------------------------------------------
	this.shaderLoc = createProgram(gl, this.VERT_SRC, this.FRAG_SRC);
	if (!this.shaderLoc) {
	console.log(this.constructor.name + 
							'.init() failed to create executable Shaders on the GPU. Bye!');
	return;
  }
// CUTE TRICK: let's print the NAME of this VBObox object: tells us which one!
//  else{console.log('You called: '+ this.constructor.name + '.init() fcn!');}

	gl.program = this.shaderLoc;		// (to match cuon-utils.js -- initShaders())

// b) Create VBO on GPU, fill it------------------------------------------------
	this.vboLoc = gl.createBuffer();	
  if (!this.vboLoc) {
	console.log(this.constructor.name + 
							'.init() failed to create VBO in GPU. Bye!'); 
	return;
  }
  // Specify the purpose of our newly-created VBO on the GPU.  Your choices are:
  //	== "gl.ARRAY_BUFFER" : the VBO holds vertices, each made of attributes 
  // (positions, colors, normals, etc), or 
  //	== "gl.ELEMENT_ARRAY_BUFFER" : the VBO holds indices only; integer values 
  // that each select one vertex from a vertex array stored in another VBO.
  gl.bindBuffer(gl.ARRAY_BUFFER,	      // GLenum 'target' for this GPU buffer 
								  this.vboLoc);				  // the ID# the GPU uses for this buffer.
											  
  // Fill the GPU's newly-created VBO object with the vertex data we stored in
  //  our 'vboContents' member (JavaScript Float32Array object).
  //  (Recall gl.bufferData() will evoke GPU's memory allocation & management: 
  //	 use gl.bufferSubData() to modify VBO contents without changing VBO size)
  gl.bufferData(gl.ARRAY_BUFFER, 			  // GLenum target(same as 'bindBuffer()')
									  this.vboContents, 		// JavaScript Float32Array
								   gl.STATIC_DRAW);			// Usage hint.  

  this.vboLoc2=gl.createBuffer();
  if (!this.vboLoc2) {
	console.log(this.constructor.name + 
							'.init() failed to create VBO in GPU. Bye!'); 
	return;
  }
  gl.bindBuffer(gl.ARRAY_BUFFER,this.vboLoc2);
  gl.bufferData(gl.ARRAY_BUFFER, 			  // GLenum target(same as 'bindBuffer()')
  this.vboContents2, 		// JavaScript Float32Array
gl.STATIC_DRAW);			// Usage hint.  

  this.a_Position = gl.getAttribLocation(this.shaderLoc, 'a_Position');
  if(this.a_Position < 0) {
	console.log(this.constructor.name + 
							'.init() Failed to get GPU location of attribute a_Position');
	return -1;	// error exit.
  }
	 this.a_Color = gl.getAttribLocation(this.shaderLoc, 'a_Color');
  if(this.a_Colr1Loc < 0) {
	console.log(this.constructor.name + 
							'.init() failed to get the GPU location of attribute a_Color');
	return -1;	// error exit.
  }
  this.a_Normal = gl.getAttribLocation(this.shaderLoc, 'a_Normal');
  if(this.a_Normal < 0) {
	console.log(this.constructor.name + 
							'.init() failed to get the GPU location of attribute a_Normal');
	  return -1;	// error exit.
  }
  // c2) Find All Uniforms:-----------------------------------------------------
  //Get GPU storage location for each uniform var used in our shader programs: 
 this.g_modelMatLoc = gl.getUniformLocation(this.shaderLoc, 'u_ModelMatrix');
  if (!this.g_modelMatLoc) { 
	console.log(this.constructor.name + 
							'.init() failed to get GPU location for u_ModelMatrix uniform');
	return;
  }

  this.u_NormalMatrix = gl.getUniformLocation(gl.program, 'u_NormalMatrix');
  if(!this.u_NormalMatrix) {
	  console.log('Failed to get GPU storage location for u_NormalMatrix');
	  return;
  }


//   this.u_LightColor = gl.getUniformLocation(gl.program, 'u_LightColor');
  this.lightPos = gl.getUniformLocation(gl.program, 'lightPos');
  if (!this.lightPos) { 
	console.log('Failed to get the storage location');
	return;
  }
  this.g_viewMatLoc = gl.getUniformLocation(gl.program, 'u_viewMatrix');
  if (!this.g_viewMatLoc) { 
	console.log('Failed to get the storage location of g_viewMatLoc');
	return;
  }
  this.g_projMatLoc = gl.getUniformLocation(gl.program, 'u_projMatrix');
  if (!this.g_projMatLoc) { 
	console.log('Failed to get the storage location of g_projMatLoc');
	return;
  }

//
   this.Ka=gl.getUniformLocation(gl.program,'Ka');
   this.Kd=gl.getUniformLocation(gl.program,'Kd');
   this.Ks=gl.getUniformLocation(gl.program,'Ks');
   this.light_status=gl.getUniformLocation(gl.program,'light_status');
   this.phong_status=gl.getUniformLocation(gl.program,'phong_status');
//    this.eye_vector=gl.getUniformLocation(gl.program,'eye_vector');
   this.shininessVal=gl.getUniformLocation(gl.program,'shininessVal');
   if (!this.Ka|| !this.Kd || !this.Ks|| !this.shininessVal|| !this.light_status) { 
	console.log('Failed to get the storage location of Ka||Kd||Ks||shininessVal');
	return;
  }
//materal
// this.ambientColor=gl.getUniformLocation(gl.program,'ambientColor');
this.diffuseColor=gl.getUniformLocation(gl.program,'diffuseColor');
this.specularColor=gl.getUniformLocation(gl.program,'specularColor');

	}
	
	VBObox2.prototype.switchToMe = function() {
	//==============================================================================
	// Set GPU to use this VBObox's contents (VBO, shader, attributes, uniforms...)
	//
	// We only do this AFTER we called the init() function, which does the one-time-
	// only setup tasks to put our VBObox contents into GPU memory.  !SURPRISE!
	// even then, you are STILL not ready to draw our VBObox's contents onscreen!
	// We must also first complete these steps:
	//  a) tell the GPU to use our VBObox's shader program (already in GPU memory),
	//  b) tell the GPU to use our VBObox's VBO  (already in GPU memory),
	//  c) tell the GPU to connect the shader program's attributes to that VBO.
	
	// a) select our shader program:
	gl.useProgram(this.shaderLoc);	
	//		Each call to useProgram() selects a shader program from the GPU memory,
	// but that's all -- it does nothing else!  Any previously used shader program's 
	// connections to attributes and uniforms are now invalid, and thus we must now
	// establish new connections between our shader program's attributes and the VBO
	// we wish to use.  
	  
	// Set the light direction (in the world coordinate)
	// gl.uniform3f(this.u_LightColor, 1.0, 1.0, 1.0);
	var lightPosition = new Vector3([lightx,lighty,lightz]);
	// lightPosition.normalize();     // Normalize
	gl.uniform3fv(this.lightPos, lightPosition.elements);
	console.log("lightPosition:",lightPosition);

	// my_Material=new Material(material_code);//blueplastic
	// // var my_ambientColor= my_Material.K_ambi.slice(0,3); 
	// var my_diffuseColor= my_Material.K_diff.slice(0,3) ; 
	// // var my_specularColor= my_Material.K_spec.slice(0,3) ;
	// var my_specularColor=my_Material.K_spec.slice(0,3);
	// var my_shininessVal=my_Material.K_shiny;

	// // console.log("Ka:",my_ambientColor);
	// console.log("Kd:",my_diffuseColor);
	// console.log("Ks",my_specularColor);
	// console.log("shininessVal",my_shininessVal);

	// //bind
	// // gl.uniform3fv(this.ambientColor, my_ambientColor);
	// gl.uniform3fv(this.diffuseColor, my_diffuseColor);
	// gl.uniform3fv(this.specularColor, my_specularColor);

	var my_Ka=light_Ambient;
	var my_Kd=light_Diffuse;
	var my_Ks=light_Specular;

	gl.uniform3fv(this.Ka,my_Ka);
	gl.uniform3fv(this.Kd,my_Kd);
	gl.uniform3fv(this.Ks,my_Ks);
	gl.uniform1i(this.light_status,my_light_status);
	gl.uniform1i(this.phong_status,my_phong_status2);
	// temp_eye_array=[eyex,eyey,eyez]
	// gl.uniform3fv(this.eye_vector,temp_eye_array);

	

	// b) call bindBuffer to disconnect the GPU from its currently-bound VBO and
	//  instead connect to our own already-created-&-filled VBO.  This new VBO can 
	//    supply values to use as attributes in our newly-selected shader program:
		gl.bindBuffer(gl.ARRAY_BUFFER,	    // GLenum 'target' for this GPU buffer 
											this.vboLoc);			// the ID# the GPU uses for our VBO.
	
	// c) connect our newly-bound VBO to supply attribute variable values for each
	// vertex to our SIMD shader program, using 'vertexAttribPointer()' function.
	// this sets up data paths from VBO to our shader units:
	  // 	Here's how to use the almost-identical OpenGL version of this function:
		//		http://www.opengl.org/sdk/docs/man/xhtml/glVertexAttribPointer.xml )
	  gl.vertexAttribPointer(
			this.a_Position,//index == ID# for the attribute var in GLSL shader pgm;
			this.vboFcount_a_Pos1, // # of floats used by this attribute: 1,2,3 or 4?
			gl.FLOAT,		  // type == what data type did we use for those numbers?
			false,				// isNormalized == are these fixed-point values that we need
										//									normalize before use? true or false
			this.vboStride,// Stride == #bytes we must skip in the VBO to move from the
						  // stored attrib for this vertex to the same stored attrib
						  //  for the next vertex in our VBO.  This is usually the 
										// number of bytes used to store one complete vertex.  If set 
										// to zero, the GPU gets attribute values sequentially from 
										// VBO, starting at 'Offset'.	
										// (Our vertex size in bytes: 4 floats for pos + 3 for color)
			this.vboOffset_a_Pos1);						
						  // Offset == how many bytes from START of buffer to the first
									  // value we will actually use?  (we start with position).
	  gl.vertexAttribPointer(this.a_Color, this.vboFcount_a_Colr1,
							 gl.FLOAT, false, 
										 this.vboStride,  this.vboOffset_a_Colr1);


		//bind to another buffer
	 gl.bindBuffer(gl.ARRAY_BUFFER,	    // GLenum 'target' for this GPU buffer 
										 this.vboLoc2);			// the ID# the GPU uses for our VBO.


	  gl.vertexAttribPointer(this.a_Normal,this.vboFcount_a_normal1, 
							 gl.FLOAT, false, 
										   this.FSIZE*3,0);	
	  //-- Enable this assignment of the attribute to its' VBO source:
	  gl.enableVertexAttribArray(this.a_Position);
	  gl.enableVertexAttribArray(this.a_Color);
	  gl.enableVertexAttribArray(this.a_Normal);

	}
	
	VBObox2.prototype.isReady = function() {
	//==============================================================================
	// Returns 'true' if our WebGL rendering context ('gl') is ready to render using
	// this objects VBO and shader program; else return false.
	// see: https://developer.mozilla.org/en-US/docs/Web/API/WebGLRenderingContext/getParameter
	
	var isOK = true;
	  if(gl.getParameter(gl.CURRENT_PROGRAM) != this.shaderLoc)  {
		console.log(this.constructor.name + 
								'.isReady() false: shader program at this.shaderLoc not in use!');
		isOK = false;
	  }
	//   if(gl.getParameter(gl.ARRAY_BUFFER_BINDING) != this.vboLoc) {
	// 	  console.log(this.constructor.name + 
	// 						  '.isReady() false: vbo at this.vboLoc not in use!');
	// 	isOK = false;
	//   }
	  return isOK;
	}
	
	VBObox2.prototype.adjust = function() {
	//=============================================================================
	// Update the GPU to newer, current values we now store for 'uniform' vars on 
	// the GPU; and (if needed) update the VBO's contents, and (if needed) each 
	// attribute's stride and offset in VBO.
	
	  // check: was WebGL context set to use our VBO & shader program?
	  if(this.isReady()==false) {
			console.log('ERROR! before' + this.constructor.name + 
							  '.adjust() call you needed to call this.switchToMe()!!');
	  }

	  // Transfer new VBOcontents to GPU-------------------------------------------- 
	//   this.reload();
	}
	
VBObox2.prototype.draw = function() {
	//=============================================================================
	// Render current VBObox contents.
	  // check: was WebGL context set to use our VBO & shader program?
	  if(this.isReady()==false) {
			console.log('ERROR! before' + this.constructor.name + 
							  '.draw() call you needed to call this.switchToMe()!!');
	  }

//=============================================================================
	// Send commands to GPU to select and render current VBObox contents.
	
	  // check: was WebGL context set to use our VBO & shader program?
	  if(this.isReady()==false) {
			console.log('ERROR! before' + this.constructor.name + 
							  '.draw() call you needed to call this.switchToMe()!!');
	  }
	
//   //  b) reverse the usage of the depth-buffer's stored values, like this:
//   gl.enable(gl.DEPTH_TEST); // enabled by default, but let's be SURE.
//   gl.clearDepth(0.0);       // each time we 'clear' our depth buffer, set all
//                             // pixel depths to 0.0  (1.0 is DEFAULT)
//   gl.depthFunc(gl.GREATER); // draw a pixel only if its depth value is GREATER
//                             // than the depth buffer's stored value.
//                             // (gl.LESS is DEFAULT; reverse it!)
//=====================================================================

	//setperspective
	var vpAspect = g_canvas.width/2 /			// On-screen aspect ratio for
	(g_canvas.height/2);	// this camera: width/height.
	// this.g_modelMatrix.setPerspective(40, vpAspect, 1, 1000);	// near, far (always >0).
	this.g_projMatrix.setPerspective(35,vpAspect, 1, 30.0);
	gl.uniformMatrix4fv(this.g_projMatLoc, false, this.g_projMatrix.elements);

	//setview
	aimx=eyex+Math.cos(angle);
	aimy=eyey+Math.sin(angle);
	aimz=eyez+tilt;	
	// console.log(aimx);
	//set camera
	//control camera
	this.g_viewMatrix.setLookAt(eyex,eyey,eyez,aimx,aimy,aimz,0,0,1);
	gl.uniformMatrix4fv(this.g_viewMatLoc, false, this.g_viewMatrix.elements);


	this.g_modelMatrix.setIdentity();  
	// pushMatrix(this.g_modelMatrix);     // SAVE world coord system;
	// this.vbobox1_DrawTetrahedron();
	// this.g_modelMatrix=popMatrix();
	
//draw pikachu 
pushMatrix(this.g_modelMatrix);
this.g_modelMatrix.translate(0.0,0,0.01);
this.g_modelMatrix.translate(2,-2,0);
this.g_modelMatrix.rotate(90,1,0,0);
this.g_modelMatrix.rotate(180,0,1,0);

this.Drawpikachu();
// this.Drawcube();
this.g_modelMatrix=popMatrix();


//draw pikachu 
pushMatrix(this.g_modelMatrix);
this.g_modelMatrix.translate(0.0,0,0.01);
this.g_modelMatrix.translate(1.0,0,0.0);
this.g_modelMatrix.rotate(90,1,0,0);
//control world coordinate
// g_modelMatrix.translate(movepace,0,0);
// g_modelMatrix.translate(0,0,movepaceud);
this.g_modelMatrix.translate(0.25,0.25,0.25);
//model's middle is in(1.25,-0.25,1.26)



this.g_modelMatrix.rotate(-90,0,1,0);
this.g_modelMatrix.rotate(angle*180/Math.PI,0,1,0);


quatMatrix.setFromQuat(qTot.x, qTot.y, qTot.z, qTot.w);	// Quaternion-->Matrix
this.g_modelMatrix.concat(quatMatrix);	// apply that matrix.
this.g_modelMatrix.rotate(-angle*180/Math.PI,0,1,0);
//this.Drawaxes();
this.g_modelMatrix.rotate(90,0,1,0);

this.g_modelMatrix.translate(-0.25,-0.25,-0.25);

this.Drawpikachu();
this.g_modelMatrix=popMatrix();



//draw pikachu 
pushMatrix(this.g_modelMatrix);
this.g_modelMatrix.translate(0.0,0,0.01);
this.g_modelMatrix.translate(2,2,0);
this.g_modelMatrix.rotate(-g_angle01,0,0,1);
this.g_modelMatrix.rotate(90,1,0,0);
this.g_modelMatrix.rotate(90,0,1,0);
this.g_modelMatrix.translate(1,0,0);
this.Drawpikachu();
// this.Drawcube();
this.g_modelMatrix=popMatrix();



//drawpokeball
pushMatrix(this.g_modelMatrix);
this.g_modelMatrix.rotate(90,0,0,1);
this.g_modelMatrix.translate(2,2,0.3);
this.g_modelMatrix.rotate(180,0,1,0);
this.g_modelMatrix.rotate(-90,1,0,0);
// g_modelMatrix.rotate(angle*180/Math.PI,0,1,0);
// quatMatrix.setFromQuat(qTot.x, qTot.y, qTot.z, qTot.w);	// Quaternion-->Matrix
// g_modelMatrix.concat(quatMatrix);	// apply that matrix.
// Drawaxes();

// g_modelMatrix.rotate(-angle*180/Math.PI,0,1,0);
// g_modelMatrix.rotate(90,1,0,0);
// Drawaxes();
this.g_modelMatrix.rotate(90,1,0,0);
this.Drawpokeball();
this.g_modelMatrix=popMatrix();

//drawhourgalss
pushMatrix(this.g_modelMatrix);
this.g_modelMatrix.rotate(90,0,0,1);
this.g_modelMatrix.translate(1.5,0,0);
this.g_modelMatrix.translate(0,0,0.5);
this.g_modelMatrix.rotate(180,0,1,0);
this.Drawhourglass();
this.g_modelMatrix=popMatrix();


//drawhouse
pushMatrix(this.g_modelMatrix);
this.g_modelMatrix.translate(2.5,-3,0);
this.g_modelMatrix.scale(3,3,3);
this.g_modelMatrix.rotate(90,0,0,1);

this.g_modelMatrix.translate(0,0,0);
this.g_modelMatrix.rotate(180,0,1,0);
this.Drawhouse();
this.g_modelMatrix.translate(0.15,0.15,-0.65);
this.g_modelMatrix.scale(0.5,0.5,0.5);
this.g_modelMatrix.rotate(g_angle01,0,0,1);
this.Drawpokeball();
this.g_modelMatrix=popMatrix();


pushMatrix(this.g_modelMatrix);
this.g_modelMatrix.translate(1.0,1,-0.5);
this.DrawspinSphere()
this.g_modelMatrix=popMatrix();



	}
	
	VBObox2.prototype.reload = function() {
	//=============================================================================
	// Over-write current values in the GPU for our already-created VBO: use 
	// gl.bufferSubData() call to re-transfer some or all of our Float32Array 
	// 'vboContents' to our VBO, but without changing any GPU memory allocations.
												  
	 gl.bufferSubData(gl.ARRAY_BUFFER, 	// GLenum target(same as 'bindBuffer()')
					  0,                  // byte offset to where data replacement
										  // begins in the VBO.
										  this.vboContents);   // the JS source-data array used to fill VBO

    gl.bufferSubData(gl.ARRAY_BUFFER, 	// GLenum target(same as 'bindBuffer()')
								this.vbobytes,                  // byte offset to where data replacement
															  // begins in the VBO.
															  this.vboContents2);   // the JS source-data array used to fill VBO

	
	}
	/*
	VBObox2.prototype.empty = function() {
	//=============================================================================
	// Remove/release all GPU resources used by this VBObox object, including any 
	// shader programs, attributes, uniforms, textures, samplers or other claims on 
	// GPU memory.  However, make sure this step is reversible by a call to 
	// 'restoreMe()': be sure to retain all our Float32Array data, all values for 
	// uniforms, all stride and offset values, etc.
	//
	//
	// 		********   YOU WRITE THIS! ********
	//
	//
	//
	}
	
	VBObox2.prototype.restore = function() {
	//=============================================================================
	// Replace/restore all GPU resources used by this VBObox object, including any 
	// shader programs, attributes, uniforms, textures, samplers or other claims on 
	// GPU memory.  Use our retained Float32Array data, all values for  uniforms, 
	// all stride and offset values, etc.
	//
	//
	// 		********   YOU WRITE THIS! ********
	//
	//
	//
	}
	*/
	
	//=============================================================================
	//=============================================================================
	//=============================================================================
	



VBObox1.prototype.DrawHead = function(){
	//draw pikachu's face
	pushMatrix(this.g_modelMatrix);
		
	  //this.g_modelMatrix.scale(1.0,1.0,1.0);
	  this.g_modelMatrix.scale(1.0,1.0,1.0);
	  gl.uniformMatrix4fv(this.g_modelMatLoc,false, this.g_modelMatrix.elements);
	  gl.drawArrays(gl.TRIANGLES,0,36);
	this.g_modelMatrix=popMatrix();
	}
VBObox1.prototype.Drawlefteyes=function(){
		//draw pikachu's eyes
		pushMatrix(this.g_modelMatrix);
		this.g_modelMatrix.scale(1.0,1.0,1.0);
		gl.uniformMatrix4fv(this.g_modelMatLoc,false, this.g_modelMatrix.elements);
		gl.drawArrays(gl.TRIANGLE_FAN,36,38);
		this.g_modelMatrix=popMatrix();
	
		
	}
VBObox1.prototype.Drawlefteyes_white=function(){
		//draw left eyes white
		pushMatrix(this.g_modelMatrix);
		this.g_modelMatrix.scale(1.0,1.0,1.0);
		
		gl.drawArrays(gl.TRIANGLE_FAN,74,38);
		this.g_modelMatrix=popMatrix();
	
			
	}
VBObox1.prototype.Drawrighteyes=function(){
		//draw right eyes
		pushMatrix(this.g_modelMatrix);
		this.g_modelMatrix.scale(1.0,1.0,1.0);
			gl.uniformMatrix4fv(this.g_modelMatLoc,false, this.g_modelMatrix.elements);
			gl.drawArrays(gl.TRIANGLE_FAN,112,38);
		this.g_modelMatrix=popMatrix();
	
		
		}
VBObox1.prototype.Drawrighteyes_white=function(){
		
		  //draw right eyes white
		  pushMatrix(this.g_modelMatrix);
		  this.g_modelMatrix.scale(1.0,1.0,1.0);
		  gl.uniformMatrix4fv(this.g_modelMatLoc,false, this.g_modelMatrix.elements);
		  gl.drawArrays(gl.TRIANGLE_FAN,150,38);
		this.g_modelMatrix=popMatrix();
	
		
		}
VBObox1.prototype.Drawnose=function(){
		//draw nose
		pushMatrix(this.g_modelMatrix);
		this.g_modelMatrix.scale(1.0,1.0,1.0);
		gl.uniformMatrix4fv(this.g_modelMatLoc,false, this.g_modelMatrix.elements);
		gl.drawArrays(gl.TRIANGLE_FAN,188,38);
		this.g_modelMatrix=popMatrix();
	
		
		}
VBObox1.prototype.Drawleftmouth=function(){
		
		//draw left mouth
		pushMatrix(this.g_modelMatrix);
		this.g_modelMatrix.scale(1.0,1.0,1.0);
		gl.uniformMatrix4fv(this.g_modelMatLoc,false, this.g_modelMatrix.elements);
		gl.drawArrays(gl.LINE_STRIP,226,13);
		this.g_modelMatrix=popMatrix();
	
		
		}
VBObox1.prototype.Drawrightmouth=function(){
		//draw right mouth
		pushMatrix(this.g_modelMatrix);
		this.g_modelMatrix.scale(1.0,1.0,1.0);
	
		gl.uniformMatrix4fv(this.g_modelMatLoc,false, this.g_modelMatrix.elements);
		gl.drawArrays(gl.LINE_STRIP,239,13);
		this.g_modelMatrix=popMatrix();
	
		
	}
VBObox1.prototype.Drawleftearpart1=function(){
		pushMatrix(this.g_modelMatrix);	
		this.g_modelMatrix.translate(0.0,0.5,0.25);// -toward back，+ toward front，only after set identity's scale(1,1,-1)
		this.g_modelMatrix.rotate(-30,0,0,1);
		this.g_modelMatrix.rotate(-g_angle03, 0, 0, 1); 
		pushMatrix(this.g_modelMatrix);
	
	
		this.g_modelMatrix.scale(0.4,0.4,0.4);	
		gl.uniformMatrix4fv(this.g_modelMatLoc, false, this.g_modelMatrix.elements);
	
	
		gl.drawArrays(gl.TRIANGLES, 252, 18);
		this.g_modelMatrix=popMatrix();
	}
	
	
VBObox1.prototype.Drawleftearpart2=function(){
		
		pushMatrix(this.g_modelMatrix);
		this.g_modelMatrix.rotate(90,0,0,1);
		this.g_modelMatrix.translate(0,0.125*0.4,0);
		this.g_modelMatrix.rotate(-g_angle04, 0, 0, 1);
		pushMatrix(this.g_modelMatrix);
		this.g_modelMatrix.scale(0.25,0.25,0.25);		
		gl.uniformMatrix4fv(this.g_modelMatLoc, false, this.g_modelMatrix.elements);
	
	
		gl.drawArrays(gl.TRIANGLES, 270, 12);
		this.g_modelMatrix=popMatrix();
			
	}
VBObox1.prototype.Drawleftearpart3=function(){
		pushMatrix(this.g_modelMatrix);
		this.g_modelMatrix.translate(0,0.25*0.25*Math.sqrt(6)/3,0);
		pushMatrix(this.g_modelMatrix);
	
		this.g_modelMatrix.scale(1.0,1.0,1.0);			
		gl.uniformMatrix4fv(this.g_modelMatLoc, false, this.g_modelMatrix.elements);
	
	
		gl.drawArrays(gl.TRIANGLES, 282,24);
		this.g_modelMatrix= popMatrix();	
	}
VBObox1.prototype.Drawleftearpart4=function(){
		pushMatrix(this.g_modelMatrix);
		this.g_modelMatrix.translate(0,0.3,0);
		pushMatrix(this.g_modelMatrix);
	
		this.g_modelMatrix.scale(1.0,1.0,1.0);	
		gl.uniformMatrix4fv(this.g_modelMatLoc, false, this.g_modelMatrix.elements);
	
	
		gl.drawArrays(gl.TRIANGLES, 306,12);
		popMatrix();
		popMatrix();
		popMatrix();
		popMatrix();
		this.g_modelMatrix= popMatrix();//get to head	
	}
	
	
VBObox1.prototype.Drawrightearpart1=function(){
		pushMatrix(this.g_modelMatrix);	
		this.g_modelMatrix.translate(0.5,0.5,0.25); // -toward back，+ toward front，only after set identity's scale(1,1,-1)
	
		this.g_modelMatrix.rotate(30,0,0,1);
		this.g_modelMatrix.rotate(g_angle05, 0, 0, 1); 
		pushMatrix(this.g_modelMatrix);
	
	
		this.g_modelMatrix.scale(0.4,0.4,0.4);	
		gl.uniformMatrix4fv(this.g_modelMatLoc, false, this.g_modelMatrix.elements);
	
	
		gl.drawArrays(gl.TRIANGLES, 318, 18);
		this.g_modelMatrix=popMatrix();
	}
	
	
	
VBObox1.prototype.Drawrightearpart2=function(){
		
		pushMatrix(this.g_modelMatrix);
		this.g_modelMatrix.rotate(-90,0,0,1);
		this.g_modelMatrix.translate(0,0.125*0.4,0);
		this.g_modelMatrix.rotate(g_angle06, 0, 0, 1);
		pushMatrix(this.g_modelMatrix);
		this.g_modelMatrix.scale(0.25,0.25,0.25);		
		gl.uniformMatrix4fv(this.g_modelMatLoc, false, this.g_modelMatrix.elements);
	
	
		gl.drawArrays(gl.TRIANGLES, 270, 12);//re call it is the same
		this.g_modelMatrix=popMatrix();
			
	}
VBObox1.prototype.Drawrightearpart3=function(){
		pushMatrix(this.g_modelMatrix);
		this.g_modelMatrix.translate(0,0.25*0.25*Math.sqrt(6)/3,0);
		pushMatrix(this.g_modelMatrix);
	
		this.g_modelMatrix.scale(1.0,1.0,1.0);	
		gl.uniformMatrix4fv(this.g_modelMatLoc, false, this.g_modelMatrix.elements);
	
	
		gl.drawArrays(gl.TRIANGLES, 282,24);//re call it is the same
		this.g_modelMatrix= popMatrix();	
	}
VBObox1.prototype.Drawrightearpart4=function(){
		pushMatrix(this.g_modelMatrix);
		this.g_modelMatrix.translate(0,0.3,0);
		pushMatrix(this.g_modelMatrix);
	
		this.g_modelMatrix.scale(1.0,1.0,1.0);		
		gl.uniformMatrix4fv(this.g_modelMatLoc, false, this.g_modelMatrix.elements);
	
	
		gl.drawArrays(gl.TRIANGLES, 306,12);//re call it is the same
		popMatrix();
		popMatrix();
		popMatrix();
		popMatrix();
		this.g_modelMatrix= popMatrix();//get to head	
	}
	
VBObox1.prototype.DrawleftBlush=function(){
		pushMatrix(this.g_modelMatrix);
		this.g_modelMatrix.translate(0.07*0.5,0.12,0.5011);
		this.g_modelMatrix.scale(0.07,0.07,1.0);
			gl.uniformMatrix4fv(this.g_modelMatLoc,false, this.g_modelMatrix.elements);
			gl.drawArrays(gl.TRIANGLE_FAN,336,29);
		
		this.g_modelMatrix=popMatrix();
	
		pushMatrix(this.g_modelMatrix);
	
		this.g_modelMatrix.translate(0.0, 0.12, 0.5011);
		gl.uniformMatrix4fv(this.g_modelMatLoc,false, this.g_modelMatrix.elements);
		gl.drawArrays(gl.TRIANGLES,365,3);
		this.g_modelMatrix=popMatrix();
	}
VBObox1.prototype.DrawrightBlush=function(){
		pushMatrix(this.g_modelMatrix);
		this.g_modelMatrix.translate(0.5-0.07*0.5,0.12,0.5011);
		this.g_modelMatrix.scale(0.07,0.07,1.0);
		this.g_modelMatrix.scale(-1,1,1);
			gl.uniformMatrix4fv(this.g_modelMatLoc,false, this.g_modelMatrix.elements);
			gl.drawArrays(gl.TRIANGLE_FAN,336,29);
		
		this.g_modelMatrix=popMatrix();
	
		pushMatrix(this.g_modelMatrix);
		this.g_modelMatrix.translate(0.5, 0.12, 0.5011);
		this.g_modelMatrix.scale(-1,1,1);
		gl.uniformMatrix4fv(this.g_modelMatLoc,false, this.g_modelMatrix.elements);
		gl.drawArrays(gl.TRIANGLES,365,3);
		this.g_modelMatrix=popMatrix();
	
	}
	//Blush in the left side
VBObox1.prototype.DrawleftBlush_left=function(){
		pushMatrix(this.g_modelMatrix);
		this.g_modelMatrix.translate(0, 0.12, 0.50);
		this.g_modelMatrix.rotate(90,0,1,0);
		this.g_modelMatrix.translate(-0.002, 0.0, 0);
		this.g_modelMatrix.scale(0.025,0.061,1);
		gl.uniformMatrix4fv(this.g_modelMatLoc,false, this.g_modelMatrix.elements);
		gl.drawArrays(gl.TRIANGLE_FAN,368,22);
		this.g_modelMatrix=popMatrix();
	
	
	}
	
	//blush in the right side
VBObox1.prototype.DrawrightBlush_left=function(){
		pushMatrix(this.g_modelMatrix);
		this.g_modelMatrix.translate(0.5, 0.12, 0.50);
		this.g_modelMatrix.rotate(90,0,1,0);
		this.g_modelMatrix.translate(-0.002, 0.0, 0);
		this.g_modelMatrix.scale(0.025,0.061,1);
		gl.uniformMatrix4fv(this.g_modelMatLoc,false, this.g_modelMatrix.elements);
		gl.drawArrays(gl.TRIANGLE_FAN,390,22);
		this.g_modelMatrix=popMatrix();
	}
VBObox1.prototype.Drawlefteye_brown=function(){
		pushMatrix(this.g_modelMatrix);
		this.g_modelMatrix.translate(0.15, 0.26, 0.5012);
		this.g_modelMatrix.scale(0.050,0.025,1);
		gl.uniformMatrix4fv(this.g_modelMatLoc,false, this.g_modelMatrix.elements);
		gl.drawArrays(gl.TRIANGLE_FAN,412,22);
		this.g_modelMatrix=popMatrix();
	
	}
VBObox1.prototype.Drawrighteye_brown=function(){
		pushMatrix(this.g_modelMatrix);
		this.g_modelMatrix.translate(0.35, 0.26, 0.5012);
		this.g_modelMatrix.scale(0.050,0.025,1);
		gl.uniformMatrix4fv(this.g_modelMatLoc,false, this.g_modelMatrix.elements);
		gl.drawArrays(gl.TRIANGLE_FAN,412,22);
		this.g_modelMatrix=popMatrix();
	}
VBObox1.prototype.Drawtailpart1=function(){
		pushMatrix(this.g_modelMatrix);	
		this.g_modelMatrix.translate(0.225,0.05,-0.01);// 
		this.g_modelMatrix.rotate(90,0,1,0);
		this.g_modelMatrix.rotate(-g_angle07, 0, 0, 1); 
		pushMatrix(this.g_modelMatrix);
		gl.uniformMatrix4fv(this.g_modelMatLoc, false, this.g_modelMatrix.elements);
	
		gl.drawArrays(gl.TRIANGLES, 434, 16);
		this.g_modelMatrix=popMatrix();
	}
	VBObox1.prototype.Drawtailpart2=function(){
	
		pushMatrix(this.g_modelMatrix);
		this.g_modelMatrix.translate(0.025*Math.sqrt(15),0,0);
		pushMatrix(this.g_modelMatrix);		
		gl.uniformMatrix4fv(this.g_modelMatLoc, false, this.g_modelMatrix.elements);
	
	
		gl.drawArrays(gl.TRIANGLES, 450, 36);//re call it is the same
		this.g_modelMatrix=popMatrix();
	
	}
VBObox1.prototype.Drawtailpart3=function(){
		pushMatrix(this.g_modelMatrix);
		this.g_modelMatrix.translate(0.5*0.025*Math.sqrt(15),0,0);
		pushMatrix(this.g_modelMatrix);
	
		gl.uniformMatrix4fv(this.g_modelMatLoc, false, this.g_modelMatrix.elements);
	
	
		gl.drawArrays(gl.TRIANGLES, 486, 36);//re call it is the same
		this.g_modelMatrix= popMatrix();	
	}
VBObox1.prototype.Drawtailpart4=function(){
		pushMatrix(this.g_modelMatrix);
		this.g_modelMatrix.translate(1.5*0.025*Math.sqrt(15),0,0);
		pushMatrix(this.g_modelMatrix);	
		gl.uniformMatrix4fv(this.g_modelMatLoc, false, this.g_modelMatrix.elements);
	
		gl.drawArrays(gl.TRIANGLES, 522, 18);//re call it is the same
		popMatrix();
		popMatrix();
		popMatrix();
		popMatrix();
		this.g_modelMatrix= popMatrix();//get to head	
	}
VBObox1.prototype.Drawground=function(){
		pushMatrix(this.g_modelMatrix);  // SAVE world drawing coords.
		this.g_modelMatrix.scale(0.1, 0.1, 0.1);				// shrink by 10X:
		  // Drawing:
		  // Pass our current matrix to the vertex shaders:
		  gl.uniformMatrix4fv(this.g_modelMatLoc, false, this.g_modelMatrix.elements);
		gl.drawArrays(gl.LINES, 								// use this drawing primitive, and
			gndStart/floatsPerVertex,	// start at this vertex number, and
			gndVerts.length/floatsPerVertex);	// draw this many vertices.
		this.g_modelMatrix= popMatrix();//get to head	
	}

VBObox1.prototype.Drawaxes=function(){
		pushMatrix(this.g_modelMatrix);  // SAVE world drawing coords.
		this.g_modelMatrix.scale(0.4, 0.4, 0.4);				// Make it smaller.
		  // Drawing:
		  // Pass our current matrix to the vertex shaders:
		  gl.uniformMatrix4fv(this.g_modelMatLoc, false, this.g_modelMatrix.elements);
		gl.drawArrays(gl.LINES, 								// use this drawing primitive, and
			axeStart/floatsPerVertex,	// start at this vertex number, and
			myaxes.length/floatsPerVertex);	// draw this many vertices.
		this.g_modelMatrix= popMatrix();//get to head	
	}
VBObox1.prototype.Drawsphere=function(){
		pushMatrix(this.g_modelMatrix);  // SAVE world drawing coords.
		this.g_modelMatrix.scale(0.3, 0.3, 0.3);				// Make it smaller.
		  // Drawing:
		  // Pass our current matrix to the vertex shaders:
		  gl.uniformMatrix4fv(this.g_modelMatLoc, false, this.g_modelMatrix.elements);
		  gl.drawArrays(gl.TRIANGLE_STRIP,				// use this drawing primitive, and
			sphStart/floatsPerVertex,	// start at this vertex number, and 
			sphVerts.length/floatsPerVertex);	// draw this many vertices.
		this.g_modelMatrix= popMatrix();//get to head	
	}
VBObox1.prototype.Drawpokeball_partI=function(){
		pushMatrix(this.g_modelMatrix);  // SAVE world drawing coords.
		this.g_modelMatrix.scale(0.3, 0.3, 0.3);				// Make it smaller.
		  // Drawing:
		  // Pass our current matrix to the vertex shaders:
		  gl.uniformMatrix4fv(this.g_modelMatLoc, false, this.g_modelMatrix.elements);
		  gl.drawArrays(gl.TRIANGLE_STRIP,				// use this drawing primitive, and
			sphStart/floatsPerVertex,	// start at this vertex number, and 
			sphVerts.length/floatsPerVertex);	// draw this many vertices.
	}
VBObox1.prototype.Drawpokeball_partII=function(){
		pushMatrix(this.g_modelMatrix);  // SAVE world drawing coords.
		// this.g_modelMatrix.translate(0.2,0.2,0.2);
		this.g_modelMatrix.rotate(90,0,1,0);
		this.g_modelMatrix.translate(0,0,1);
		this.g_modelMatrix.translate(0.1,0,0);
		this.g_modelMatrix.scale(0.3, 0.3, 0.3);				// Make it smaller.
		  // Drawing:
		  // Pass our current matrix to the vertex shaders:
		  gl.uniformMatrix4fv(this.g_modelMatLoc, false, this.g_modelMatrix.elements);
		  gl.drawArrays(gl.TRIANGLE_FAN,				// use this drawing primitive, and
			cirStart/floatsPerVertex,	// start at this vertex number, and 
			my_circle.length/floatsPerVertex);	// draw this many vertices.
	
	}
VBObox1.prototype.Drawpokeball_partIII=function(){
		pushMatrix(this.g_modelMatrix);  // SAVE world drawing coords.
		// this.g_modelMatrix.translate(0.2,0.2,0.2);
		  // Drawing:
		  // Pass our current matrix to the vertex shaders:
		  gl.uniformMatrix4fv(this.g_modelMatLoc, false, this.g_modelMatrix.elements);
		  gl.drawArrays(gl.LINE_LOOP,				// use this drawing primitive, and
			cirStart2/floatsPerVertex,	// start at this vertex number, and 
			my_circle2.length/floatsPerVertex);	// draw this many vertices.
		popMatrix();
		popMatrix();
		this.g_modelMatrix=popMatrix();
	}
	
VBObox1.prototype.Drawhourglass_partI=function(){
		pushMatrix(this.g_modelMatrix);  // SAVE world drawing coords.
		// this.g_modelMatrix.translate(0.2,0.2,0.2);
		  // Drawing:
		  // Pass our current matrix to the vertex shaders:
		  //this.g_modelMatrix.rotate(180,0,1,0);
		  	// this.g_modelMatrix.rotate(g_angle01, 0,0 , 1);  // spin drawing axes on Y axis;
		  this.g_modelMatrix.rotate(90,0,1,0);
		  this.g_modelMatrix.scale(4,2,2);
	//Find inverse transpose of modelMatrix:
	this.normalMatrix.setInverseOf(this.g_modelMatrix);
	this.normalMatrix.transpose();


	gl.uniformMatrix4fv(this.g_modelMatLoc, false, this.g_modelMatrix.elements);
	gl.uniformMatrix4fv(this.u_NormalMatrix, false, this.normalMatrix.elements);

		  gl.drawArrays(gl.TRIANGLES,				// use this drawing primitive, and
			tetStart/floatsPerVertex,	// start at this vertex number, and 
			my_tetrahedron.length/floatsPerVertex);	// draw this many vertices.
	}
	
VBObox1.prototype.Drawhourglass_partII=function(){
		pushMatrix(this.g_modelMatrix);  // SAVE world drawing coords.
		// this.g_modelMatrix.translate(0.2,0.2,0.2);
		  // Drawing:
		  // Pass our current matrix to the vertex shaders:
		  this.g_modelMatrix.rotate(180,0,1,0);
		  this.g_modelMatrix.rotate(90,1,0,0);
		//Find inverse transpose of modelMatrix:
		this.normalMatrix.setInverseOf(this.g_modelMatrix);
		this.normalMatrix.transpose();
	
	
		gl.uniformMatrix4fv(this.g_modelMatLoc, false, this.g_modelMatrix.elements);
		gl.uniformMatrix4fv(this.u_NormalMatrix, false, this.normalMatrix.elements);
		  gl.drawArrays(gl.TRIANGLES,				// use this drawing primitive, and
			tetStart/floatsPerVertex,	// start at this vertex number, and 
			my_tetrahedron.length/floatsPerVertex);	// draw this many vertices.
			popMatrix();
		this.g_modelMatrix=popMatrix();
	}
	
VBObox1.prototype.Drawhouse_partI=function(){
		pushMatrix(this.g_modelMatrix);  // SAVE world drawing coords.
		// this.g_modelMatrix.translate(0.2,0.2,0.2);
		  // Drawing:
		  // Pass our current matrix to the vertex shaders:
		  this.g_modelMatrix.rotate(90,0,1,0);
		  gl.uniformMatrix4fv(this.g_modelMatLoc, false, this.g_modelMatrix.elements);
		  gl.drawArrays(gl.TRIANGLES,				// use this drawing primitive, and
			vbox1_cubStart/floatsPerVertex,	// start at this vertex number, and 
			my_cube.length/floatsPerVertex);	// draw this many vertices.
	}
	


	
VBObox1.prototype.Drawhouse_partII=function(){
		pushMatrix(this.g_modelMatrix);  // SAVE world drawing coords.
		// this.g_modelMatrix.translate(0.2,0.2,0.2);
		  // Drawing:
		  // Pass our current matrix to the vertex shaders:
	
		  this.g_modelMatrix.translate(0.5+0.125,0.20,0.25);
		  this.g_modelMatrix.scale(1,2,2);
		  this.g_modelMatrix.translate(0.125,0,0);
		  this.g_modelMatrix.scale(2,1,1);
		  gl.uniformMatrix4fv(this.g_modelMatLoc, false, this.g_modelMatrix.elements);
		  gl.drawArrays(gl.TRIANGLES,				// use this drawing primitive, and
			tetStart/floatsPerVertex,	// start at this vertex number, and 
			my_tetrahedron.length/floatsPerVertex);	// draw this many vertices.
		popMatrix();
		this.g_modelMatrix=popMatrix();
	}
	
VBObox1.prototype.DrawspinSphere=function(){
		pushMatrix(this.g_modelMatrix);  // SAVE world drawing coords.
		this.g_modelMatrix.scale(0.6, 0.6, 0.6);				// Make it smaller.
		this.g_modelMatrix.rotate(-g_angle01,0,0,1);
		this.g_modelMatrix.translate(0,0,3.0);
		  // Drawing:
		  // Pass our current matrix to the vertex shaders:



	//Find inverse transpose of modelMatrix:
	this.normalMatrix.setInverseOf(this.g_modelMatrix);
	this.normalMatrix.transpose();



	my_Material=new Material(6);//Current material for Phong shading sphere= 6(MATL_BRASS)
	// var my_ambientColor= my_Material.K_ambi.slice(0,3); 
	var my_diffuseColor= my_Material.K_diff.slice(0,3) ; 
	// var my_specularColor= my_Material.K_spec.slice(0,3) ;
	var my_specularColor=my_Material.K_spec.slice(0,3);
	var my_shininessVal=my_Material.K_shiny;

	// console.log("Ka:",my_ambientColor);
	console.log("Kd:",my_diffuseColor);
	console.log("Ks",my_specularColor);
	console.log("shininessVal",my_shininessVal);

	//bind

	gl.uniform1f(this.shininessVal,my_shininessVal);
	// gl.uniform3fv(this.ambientColor, my_ambientColor);
	gl.uniform3fv(this.diffuseColor, my_diffuseColor);
	gl.uniform3fv(this.specularColor, my_specularColor);


	gl.uniformMatrix4fv(this.g_modelMatLoc, false, this.g_modelMatrix.elements);
	gl.uniformMatrix4fv(this.u_NormalMatrix, false, this.normalMatrix.elements);

		  gl.drawArrays(gl.TRIANGLE_STRIP,				// use this drawing primitive, and
			vbox1_spinSphStart/vbobox1_floatsPerVertex,	// start at this vertex number, and 
			spinSphVerts.length/vbobox1_floatsPerVertex);	// draw this many vertices.
		this.g_modelMatrix= popMatrix();//get to head	
	}
	
	
VBObox1.prototype.Drawcube=function(){
		pushMatrix(this.g_modelMatrix);  // SAVE world drawing coords.
		// this.g_modelMatrix.translate(0.2,0.2,0.2);
		  // Drawing:
		  // Pass our current matrix to the vertex shaders:
		  this.g_modelMatrix.rotate(90,0,1,0);

	//Find inverse transpose of modelMatrix:
	this.normalMatrix.setInverseOf(this.g_modelMatrix);
	this.normalMatrix.transpose();

	my_Material=new Material(18);//6 MATL_BRASS
	// var my_ambientColor= my_Material.K_ambi.slice(0,3); 
	var my_diffuseColor= my_Material.K_diff.slice(0,3) ; 
	// var my_specularColor= my_Material.K_spec.slice(0,3) ;
	var my_specularColor=my_Material.K_spec.slice(0,3);
	var my_shininessVal=my_Material.K_shiny;

	// console.log("Ka:",my_ambientColor);
	console.log("Kd:",my_diffuseColor);
	console.log("Ks",my_specularColor);
	console.log("shininessVal",my_shininessVal);

	//bind

	gl.uniform1f(this.shininessVal,my_shininessVal);
	// gl.uniform3fv(this.ambientColor, my_ambientColor);
	gl.uniform3fv(this.diffuseColor, my_diffuseColor);
	gl.uniform3fv(this.specularColor, my_specularColor);


		gl.uniformMatrix4fv(this.g_modelMatLoc, false, this.g_modelMatrix.elements);
		gl.uniformMatrix4fv(this.u_NormalMatrix, false, this.normalMatrix.elements);
		  gl.drawArrays(gl.TRIANGLES,				// use this drawing primitive, and
			vbox1_cubStart/floatsPerVertex,	// start at this vertex number, and 
			my_cube.length/floatsPerVertex);	// draw this many vertices.
		this.g_modelMatrix= popMatrix();//get to head	
	}	
	
	
VBObox1.prototype.Drawhourglass=function(){
		this.Drawhourglass_partI();
		this.Drawhourglass_partII();
	
	}
	
	
VBObox1.prototype.Drawpokeball=function(){
	this.Drawpokeball_partI();
	this.Drawpokeball_partII();
	this.Drawpokeball_partIII();
	}
VBObox1.prototype.Drawhouse=function(){
	
	this.Drawhouse_partI();
	this.Drawhouse_partII();
	
	}


VBObox1.prototype.vbobox1_DrawTetrahedron=function(){
	
	pushMatrix(this.g_modelMatrix);  // SAVE world drawing coords.

	// this.g_modelMatrix.rotate(-90,1,0,0);

	this.g_modelMatrix.translate(-1.0,-1.0, 0.0);  // 'set' means DISCARD old matrix,
  						// (drawing axes centered in CVV), and then make new
  						// drawing axes moved to the lower-left corner of CVV. 

	this.g_modelMatrix.scale(0.5, 0.5, 0.5);
  						// if you DON'T scale, tetra goes outside the CVV; clipped!
	// this.g_modelMatrix.rotate(g_angle01, 0,0 , 1);  // spin drawing axes on Y axis;

	//Find inverse transpose of modelMatrix:
	this.normalMatrix.setInverseOf(this.g_modelMatrix);
	this.normalMatrix.transpose();

	my_Material=new Material(21);//blueplastic
	// var my_ambientColor= my_Material.K_ambi.slice(0,3); 
	var my_diffuseColor= my_Material.K_diff.slice(0,3) ; 
	// var my_specularColor= my_Material.K_spec.slice(0,3) ;
	var my_specularColor=my_Material.K_spec.slice(0,3);
	var my_shininessVal=my_Material.K_shiny;

	// console.log("Ka:",my_ambientColor);
	console.log("Kd:",my_diffuseColor);
	console.log("Ks",my_specularColor);
	console.log("shininessVal",my_shininessVal);

	//bind

	gl.uniform1f(this.shininessVal,my_shininessVal);
	// gl.uniform3fv(this.ambientColor, my_ambientColor);
	gl.uniform3fv(this.diffuseColor, my_diffuseColor);
	gl.uniform3fv(this.specularColor, my_specularColor);

	gl.uniformMatrix4fv(this.g_modelMatLoc, false, this.g_modelMatrix.elements);
	gl.uniformMatrix4fv(this.u_NormalMatrix, false, this.normalMatrix.elements);
	gl.drawArrays(gl.TRIANGLES,				// use this drawing primitive, and
		vbox1_TetraStart/vbobox1_floatsPerVertex,	// start at this vertex number, and 
		vbobox1_my_tetrahedron.length/vbobox1_floatsPerVertex);	// draw this many vertices.

	this.g_modelMatrix= popMatrix();//get to head	


	}







function getnormalvector(giveshapes,verticesamount){

	var vboBox1_mynormal=new Float32Array(verticesamount*3);
	for(r=0,t=0;t<verticesamount*3;){
		var temp_x=giveshapes[r];
		var temp_y=giveshapes[r+1];
		var temp_z=giveshapes[r+2];
		var temp_x_2=giveshapes[r+7];
		var temp_y_2=giveshapes[r+8];
		var temp_z_2=giveshapes[r+9];
		var temp_x_3=giveshapes[r+14];
		var temp_y_3=giveshapes[r+15];
		var temp_z_3=giveshapes[r+16];
		var temp_vector=new Vector3([temp_x-temp_x_2,temp_y-temp_y_2,temp_z-temp_z_2]);
		var temp_vector2=new Vector3([temp_x_3-temp_x_2,temp_y_3-temp_y_2,temp_z_3-temp_z_2]);
		var normal_vector=temp_vector2.cross(temp_vector);
		normal_vector.normalize();
		var normal_x=normal_vector.elements[0];
		var normal_y=normal_vector.elements[1];
		var normal_z=normal_vector.elements[2];
		vboBox1_mynormal[t]=normal_x;
		vboBox1_mynormal[t+1]=normal_y;
		vboBox1_mynormal[t+2]=normal_z;
		vboBox1_mynormal[t+3]=normal_x;
		vboBox1_mynormal[t+4]=normal_y;
		vboBox1_mynormal[t+5]=normal_z;
		vboBox1_mynormal[t+6]=normal_x;
		vboBox1_mynormal[t+7]=normal_y;
		vboBox1_mynormal[t+8]=normal_z;
		r=r+21;
		t=t+9;
	}
	console.log("vbo_test",vboBox1_mynormal);

	return vboBox1_mynormal;



}
function getnormalvector_Sphere(giveshapes,verticesamount){

var vboBox2_mynormal=new Float32Array(verticesamount*3);
for(e=0,p=0;p<vboBox2_mynormal.length;){
	vboBox2_mynormal[p]=giveshapes[e];
	vboBox2_mynormal[p+1]=giveshapes[e+1];
	vboBox2_mynormal[p+2]=giveshapes[e+2];
	e=e+7;
	p=p+3;
}
return vboBox2_mynormal;
}

//——————————————————————————————————————————-
VBObox2.prototype.DrawspinSphere=function(){
	pushMatrix(this.g_modelMatrix);  // SAVE world drawing coords.
	this.g_modelMatrix.scale(0.6, 0.6, 0.6);				// Make it smaller.
	this.g_modelMatrix.translate(2,-3,3.0);
	this.g_modelMatrix.rotate(-g_angle01,0,0,1);

	  // Drawing:
	  // Pass our current matrix to the vertex shaders:
//Find inverse transpose of modelMatrix:
this.normalMatrix.setInverseOf(this.g_modelMatrix);
this.normalMatrix.transpose();



my_Material=new Material(material_code);//7 
// var my_ambientColor= my_Material.K_ambi.slice(0,3); 
var my_diffuseColor= my_Material.K_diff.slice(0,3) ; 
// var my_specularColor= my_Material.K_spec.slice(0,3) ;
var my_specularColor=my_Material.K_spec.slice(0,3);
var my_shininessVal=my_Material.K_shiny;

// console.log("Ka:",my_ambientColor);
console.log("Kd:",my_diffuseColor);
console.log("Ks",my_specularColor);
console.log("shininessVal",my_shininessVal);

//bind

gl.uniform1f(this.shininessVal,my_shininessVal);
// gl.uniform3fv(this.ambientColor, my_ambientColor);
gl.uniform3fv(this.diffuseColor, my_diffuseColor);
gl.uniform3fv(this.specularColor, my_specularColor);


gl.uniformMatrix4fv(this.g_modelMatLoc, false, this.g_modelMatrix.elements);
gl.uniformMatrix4fv(this.u_NormalMatrix, false, this.normalMatrix.elements);

	  gl.drawArrays(gl.TRIANGLE_STRIP,				// use this drawing primitive, and
		vbox2_spinSphStart/floatsPerVertex,	// start at this vertex number, and 
		spinSphVerts.length/floatsPerVertex);	// draw this many vertices.
	this.g_modelMatrix= popMatrix();//get to head	
}



VBObox2.prototype.DrawHead = function(){
	//draw pikachu's face
	pushMatrix(this.g_modelMatrix);
		
	  //this.g_modelMatrix.scale(1.0,1.0,1.0);
	  this.g_modelMatrix.scale(1.0,1.0,1.0);
	//Find inverse transpose of modelMatrix:
	this.normalMatrix.setInverseOf(this.g_modelMatrix);
	this.normalMatrix.transpose();

	my_Material=new Material(1);//6 MATL_BRASS
	// var my_ambientColor= my_Material.K_ambi.slice(0,3); 
	var my_diffuseColor= my_Material.K_diff.slice(0,3) ; 
	// var my_specularColor= my_Material.K_spec.slice(0,3) ;
	var my_specularColor=my_Material.K_spec.slice(0,3);
	var my_shininessVal=my_Material.K_shiny;

	// console.log("Ka:",my_ambientColor);
	console.log("Kd:",my_diffuseColor);
	console.log("Ks",my_specularColor);
	console.log("shininessVal",my_shininessVal);

	//bind

	gl.uniform1f(this.shininessVal,my_shininessVal);
	// gl.uniform3fv(this.ambientColor, my_ambientColor);
	gl.uniform3fv(this.diffuseColor, my_diffuseColor);
	gl.uniform3fv(this.specularColor, my_specularColor);


		gl.uniformMatrix4fv(this.g_modelMatLoc, false, this.g_modelMatrix.elements);
		gl.uniformMatrix4fv(this.u_NormalMatrix, false, this.normalMatrix.elements);
	  gl.drawArrays(gl.TRIANGLES,0,36);
	this.g_modelMatrix=popMatrix();
	}
VBObox2.prototype.Drawlefteyes=function(){
		//draw pikachu's eyes
		pushMatrix(this.g_modelMatrix);
		this.g_modelMatrix.scale(1.0,1.0,1.0);

	//Find inverse transpose of modelMatrix:
	this.normalMatrix.setInverseOf(this.g_modelMatrix);
	this.normalMatrix.transpose();

	my_Material=new Material(2);//6 MATL_BRASS
	// var my_ambientColor= my_Material.K_ambi.slice(0,3); 
	var my_diffuseColor= my_Material.K_diff.slice(0,3) ; 
	// var my_specularColor= my_Material.K_spec.slice(0,3) ;
	var my_specularColor=my_Material.K_spec.slice(0,3);
	var my_shininessVal=my_Material.K_shiny;

	// console.log("Ka:",my_ambientColor);
	console.log("Kd:",my_diffuseColor);
	console.log("Ks",my_specularColor);
	console.log("shininessVal",my_shininessVal);

	//bind

	gl.uniform1f(this.shininessVal,my_shininessVal);
	// gl.uniform3fv(this.ambientColor, my_ambientColor);
	gl.uniform3fv(this.diffuseColor, my_diffuseColor);
	gl.uniform3fv(this.specularColor, my_specularColor);


		gl.uniformMatrix4fv(this.g_modelMatLoc, false, this.g_modelMatrix.elements);
		gl.uniformMatrix4fv(this.u_NormalMatrix, false, this.normalMatrix.elements);
		gl.drawArrays(gl.TRIANGLE_FAN,36,38);
		this.g_modelMatrix=popMatrix();
	
		
	}
VBObox2.prototype.Drawlefteyes_white=function(){
		//draw left eyes white
		pushMatrix(this.g_modelMatrix);
		this.g_modelMatrix.scale(1.0,1.0,1.0);
			//Find inverse transpose of modelMatrix:
	this.normalMatrix.setInverseOf(this.g_modelMatrix);
	this.normalMatrix.transpose();

	my_Material=new Material(3);//6 MATL_BRASS
	// var my_ambientColor= my_Material.K_ambi.slice(0,3); 
	var my_diffuseColor= my_Material.K_diff.slice(0,3) ; 
	// var my_specularColor= my_Material.K_spec.slice(0,3) ;
	var my_specularColor=my_Material.K_spec.slice(0,3);
	var my_shininessVal=my_Material.K_shiny;

	// console.log("Ka:",my_ambientColor);
	console.log("Kd:",my_diffuseColor);
	console.log("Ks",my_specularColor);
	console.log("shininessVal",my_shininessVal);

	//bind

	gl.uniform1f(this.shininessVal,my_shininessVal);
	// gl.uniform3fv(this.ambientColor, my_ambientColor);
	gl.uniform3fv(this.diffuseColor, my_diffuseColor);
	gl.uniform3fv(this.specularColor, my_specularColor);


		gl.uniformMatrix4fv(this.g_modelMatLoc, false, this.g_modelMatrix.elements);
		gl.uniformMatrix4fv(this.u_NormalMatrix, false, this.normalMatrix.elements);
		gl.drawArrays(gl.TRIANGLE_FAN,74,38);
		this.g_modelMatrix=popMatrix();
	
			
	}
VBObox2.prototype.Drawrighteyes=function(){
		//draw right eyes
		pushMatrix(this.g_modelMatrix);
		this.g_modelMatrix.scale(1.0,1.0,1.0);
		//Find inverse transpose of modelMatrix:
		this.normalMatrix.setInverseOf(this.g_modelMatrix);
		this.normalMatrix.transpose();
	
		my_Material=new Material(4);//6 MATL_BRASS
		// var my_ambientColor= my_Material.K_ambi.slice(0,3); 
		var my_diffuseColor= my_Material.K_diff.slice(0,3) ; 
		// var my_specularColor= my_Material.K_spec.slice(0,3) ;
		var my_specularColor=my_Material.K_spec.slice(0,3);
		var my_shininessVal=my_Material.K_shiny;
	
		// console.log("Ka:",my_ambientColor);
		console.log("Kd:",my_diffuseColor);
		console.log("Ks",my_specularColor);
		console.log("shininessVal",my_shininessVal);
	
		//bind
	
		gl.uniform1f(this.shininessVal,my_shininessVal);
		// gl.uniform3fv(this.ambientColor, my_ambientColor);
		gl.uniform3fv(this.diffuseColor, my_diffuseColor);
		gl.uniform3fv(this.specularColor, my_specularColor);
	
	
			gl.uniformMatrix4fv(this.g_modelMatLoc, false, this.g_modelMatrix.elements);
			gl.uniformMatrix4fv(this.u_NormalMatrix, false, this.normalMatrix.elements);
			gl.drawArrays(gl.TRIANGLE_FAN,112,38);
		this.g_modelMatrix=popMatrix();
	
		
		}
VBObox2.prototype.Drawrighteyes_white=function(){
		
		  //draw right eyes white
		  pushMatrix(this.g_modelMatrix);
		  this.g_modelMatrix.scale(1.0,1.0,1.0);
		 	//Find inverse transpose of modelMatrix:
	this.normalMatrix.setInverseOf(this.g_modelMatrix);
	this.normalMatrix.transpose();

	my_Material=new Material(5);//6 MATL_BRASS
	// var my_ambientColor= my_Material.K_ambi.slice(0,3); 
	var my_diffuseColor= my_Material.K_diff.slice(0,3) ; 
	// var my_specularColor= my_Material.K_spec.slice(0,3) ;
	var my_specularColor=my_Material.K_spec.slice(0,3);
	var my_shininessVal=my_Material.K_shiny;

	// console.log("Ka:",my_ambientColor);
	console.log("Kd:",my_diffuseColor);
	console.log("Ks",my_specularColor);
	console.log("shininessVal",my_shininessVal);

	//bind

	gl.uniform1f(this.shininessVal,my_shininessVal);
	// gl.uniform3fv(this.ambientColor, my_ambientColor);
	gl.uniform3fv(this.diffuseColor, my_diffuseColor);
	gl.uniform3fv(this.specularColor, my_specularColor);


		gl.uniformMatrix4fv(this.g_modelMatLoc, false, this.g_modelMatrix.elements);
		gl.uniformMatrix4fv(this.u_NormalMatrix, false, this.normalMatrix.elements);
		  gl.drawArrays(gl.TRIANGLE_FAN,150,38);
		this.g_modelMatrix=popMatrix();
	
		
		}
VBObox2.prototype.Drawnose=function(){
		//draw nose
		pushMatrix(this.g_modelMatrix);
		this.g_modelMatrix.scale(1.0,1.0,1.0);
			//Find inverse transpose of modelMatrix:
	this.normalMatrix.setInverseOf(this.g_modelMatrix);
	this.normalMatrix.transpose();

	my_Material=new Material(6);//6 MATL_BRASS
	// var my_ambientColor= my_Material.K_ambi.slice(0,3); 
	var my_diffuseColor= my_Material.K_diff.slice(0,3) ; 
	// var my_specularColor= my_Material.K_spec.slice(0,3) ;
	var my_specularColor=my_Material.K_spec.slice(0,3);
	var my_shininessVal=my_Material.K_shiny;

	// console.log("Ka:",my_ambientColor);
	console.log("Kd:",my_diffuseColor);
	console.log("Ks",my_specularColor);
	console.log("shininessVal",my_shininessVal);

	//bind

	gl.uniform1f(this.shininessVal,my_shininessVal);
	// gl.uniform3fv(this.ambientColor, my_ambientColor);
	gl.uniform3fv(this.diffuseColor, my_diffuseColor);
	gl.uniform3fv(this.specularColor, my_specularColor);


		gl.uniformMatrix4fv(this.g_modelMatLoc, false, this.g_modelMatrix.elements);
		gl.uniformMatrix4fv(this.u_NormalMatrix, false, this.normalMatrix.elements);
		gl.drawArrays(gl.TRIANGLE_FAN,188,38);
		this.g_modelMatrix=popMatrix();
	
		
		}
VBObox2.prototype.Drawleftmouth=function(){
		
		//draw left mouth
		pushMatrix(this.g_modelMatrix);
		this.g_modelMatrix.scale(1.0,1.0,1.0);
		//Find inverse transpose of modelMatrix:
		this.normalMatrix.setInverseOf(this.g_modelMatrix);
		this.normalMatrix.transpose();
	
		my_Material=new Material(7);//6 MATL_BRASS
		// var my_ambientColor= my_Material.K_ambi.slice(0,3); 
		var my_diffuseColor= my_Material.K_diff.slice(0,3) ; 
		// var my_specularColor= my_Material.K_spec.slice(0,3) ;
		var my_specularColor=my_Material.K_spec.slice(0,3);
		var my_shininessVal=my_Material.K_shiny;
	
		// console.log("Ka:",my_ambientColor);
		console.log("Kd:",my_diffuseColor);
		console.log("Ks",my_specularColor);
		console.log("shininessVal",my_shininessVal);
	
		//bind
	
		gl.uniform1f(this.shininessVal,my_shininessVal);
		// gl.uniform3fv(this.ambientColor, my_ambientColor);
		gl.uniform3fv(this.diffuseColor, my_diffuseColor);
		gl.uniform3fv(this.specularColor, my_specularColor);
	
	
			gl.uniformMatrix4fv(this.g_modelMatLoc, false, this.g_modelMatrix.elements);
			gl.uniformMatrix4fv(this.u_NormalMatrix, false, this.normalMatrix.elements);
		gl.drawArrays(gl.LINE_STRIP,226,13);
		this.g_modelMatrix=popMatrix();
	
		
		}
VBObox2.prototype.Drawrightmouth=function(){
		//draw right mouth
		pushMatrix(this.g_modelMatrix);
		this.g_modelMatrix.scale(1.0,1.0,1.0);
	
			//Find inverse transpose of modelMatrix:
	this.normalMatrix.setInverseOf(this.g_modelMatrix);
	this.normalMatrix.transpose();

	my_Material=new Material(7);//6 MATL_BRASS
	// var my_ambientColor= my_Material.K_ambi.slice(0,3); 
	var my_diffuseColor= my_Material.K_diff.slice(0,3) ; 
	// var my_specularColor= my_Material.K_spec.slice(0,3) ;
	var my_specularColor=my_Material.K_spec.slice(0,3);
	var my_shininessVal=my_Material.K_shiny;

	// console.log("Ka:",my_ambientColor);
	console.log("Kd:",my_diffuseColor);
	console.log("Ks",my_specularColor);
	console.log("shininessVal",my_shininessVal);

	//bind

	gl.uniform1f(this.shininessVal,my_shininessVal);
	// gl.uniform3fv(this.ambientColor, my_ambientColor);
	gl.uniform3fv(this.diffuseColor, my_diffuseColor);
	gl.uniform3fv(this.specularColor, my_specularColor);


		gl.uniformMatrix4fv(this.g_modelMatLoc, false, this.g_modelMatrix.elements);
		gl.uniformMatrix4fv(this.u_NormalMatrix, false, this.normalMatrix.elements);
		gl.drawArrays(gl.LINE_STRIP,239,13);
		this.g_modelMatrix=popMatrix();
	
		
	}
VBObox2.prototype.Drawleftearpart1=function(){
		pushMatrix(this.g_modelMatrix);	
		this.g_modelMatrix.translate(0.0,0.5,0.25);// -toward back，+ toward front，only after set identity's scale(1,1,-1)
		this.g_modelMatrix.rotate(-30,0,0,1);
		this.g_modelMatrix.rotate(-g_angle03, 0, 0, 1); 
		pushMatrix(this.g_modelMatrix);
	
	
		this.g_modelMatrix.scale(0.4,0.4,0.4);	
		//Find inverse transpose of modelMatrix:
		this.normalMatrix.setInverseOf(this.g_modelMatrix);
		this.normalMatrix.transpose();
	
		my_Material=new Material(6);//6 MATL_BRASS
		// var my_ambientColor= my_Material.K_ambi.slice(0,3); 
		var my_diffuseColor= my_Material.K_diff.slice(0,3) ; 
		// var my_specularColor= my_Material.K_spec.slice(0,3) ;
		var my_specularColor=my_Material.K_spec.slice(0,3);
		var my_shininessVal=my_Material.K_shiny;
	
		// console.log("Ka:",my_ambientColor);
		console.log("Kd:",my_diffuseColor);
		console.log("Ks",my_specularColor);
		console.log("shininessVal",my_shininessVal);
	
		//bind
	
		gl.uniform1f(this.shininessVal,my_shininessVal);
		// gl.uniform3fv(this.ambientColor, my_ambientColor);
		gl.uniform3fv(this.diffuseColor, my_diffuseColor);
		gl.uniform3fv(this.specularColor, my_specularColor);
	
	
			gl.uniformMatrix4fv(this.g_modelMatLoc, false, this.g_modelMatrix.elements);
			gl.uniformMatrix4fv(this.u_NormalMatrix, false, this.normalMatrix.elements);
	
	
		gl.drawArrays(gl.TRIANGLES, 252, 18);
		this.g_modelMatrix=popMatrix();
	}
	
	
VBObox2.prototype.Drawleftearpart2=function(){
		
		pushMatrix(this.g_modelMatrix);
		this.g_modelMatrix.rotate(90,0,0,1);
		this.g_modelMatrix.translate(0,0.125*0.4,0);
		this.g_modelMatrix.rotate(-g_angle04, 0, 0, 1);
		pushMatrix(this.g_modelMatrix);
		this.g_modelMatrix.scale(0.25,0.25,0.25);		
			//Find inverse transpose of modelMatrix:
	this.normalMatrix.setInverseOf(this.g_modelMatrix);
	this.normalMatrix.transpose();

	my_Material=new Material(6);//6 MATL_BRASS
	// var my_ambientColor= my_Material.K_ambi.slice(0,3); 
	var my_diffuseColor= my_Material.K_diff.slice(0,3) ; 
	// var my_specularColor= my_Material.K_spec.slice(0,3) ;
	var my_specularColor=my_Material.K_spec.slice(0,3);
	var my_shininessVal=my_Material.K_shiny;

	// console.log("Ka:",my_ambientColor);
	console.log("Kd:",my_diffuseColor);
	console.log("Ks",my_specularColor);
	console.log("shininessVal",my_shininessVal);

	//bind

	gl.uniform1f(this.shininessVal,my_shininessVal);
	// gl.uniform3fv(this.ambientColor, my_ambientColor);
	gl.uniform3fv(this.diffuseColor, my_diffuseColor);
	gl.uniform3fv(this.specularColor, my_specularColor);


		gl.uniformMatrix4fv(this.g_modelMatLoc, false, this.g_modelMatrix.elements);
		gl.uniformMatrix4fv(this.u_NormalMatrix, false, this.normalMatrix.elements);
	
	
		gl.drawArrays(gl.TRIANGLES, 270, 12);
		this.g_modelMatrix=popMatrix();
			
	}
VBObox2.prototype.Drawleftearpart3=function(){
		pushMatrix(this.g_modelMatrix);
		this.g_modelMatrix.translate(0,0.25*0.25*Math.sqrt(6)/3,0);
		pushMatrix(this.g_modelMatrix);
	
		this.g_modelMatrix.scale(1.0,1.0,1.0);			
			//Find inverse transpose of modelMatrix:
	this.normalMatrix.setInverseOf(this.g_modelMatrix);
	this.normalMatrix.transpose();

	my_Material=new Material(6);//6 MATL_BRASS
	// var my_ambientColor= my_Material.K_ambi.slice(0,3); 
	var my_diffuseColor= my_Material.K_diff.slice(0,3) ; 
	// var my_specularColor= my_Material.K_spec.slice(0,3) ;
	var my_specularColor=my_Material.K_spec.slice(0,3);
	var my_shininessVal=my_Material.K_shiny;

	// console.log("Ka:",my_ambientColor);
	console.log("Kd:",my_diffuseColor);
	console.log("Ks",my_specularColor);
	console.log("shininessVal",my_shininessVal);

	//bind

	gl.uniform1f(this.shininessVal,my_shininessVal);
	// gl.uniform3fv(this.ambientColor, my_ambientColor);
	gl.uniform3fv(this.diffuseColor, my_diffuseColor);
	gl.uniform3fv(this.specularColor, my_specularColor);


		gl.uniformMatrix4fv(this.g_modelMatLoc, false, this.g_modelMatrix.elements);
		gl.uniformMatrix4fv(this.u_NormalMatrix, false, this.normalMatrix.elements);
	
	
		gl.drawArrays(gl.TRIANGLES, 282,24);
		this.g_modelMatrix= popMatrix();	
	}
VBObox2.prototype.Drawleftearpart4=function(){
		pushMatrix(this.g_modelMatrix);
		this.g_modelMatrix.translate(0,0.3,0);
		pushMatrix(this.g_modelMatrix);
	
		this.g_modelMatrix.scale(1.0,1.0,1.0);	
			//Find inverse transpose of modelMatrix:
	this.normalMatrix.setInverseOf(this.g_modelMatrix);
	this.normalMatrix.transpose();

	my_Material=new Material(5);//6 MATL_BRASS
	// var my_ambientColor= my_Material.K_ambi.slice(0,3); 
	var my_diffuseColor= my_Material.K_diff.slice(0,3) ; 
	// var my_specularColor= my_Material.K_spec.slice(0,3) ;
	var my_specularColor=my_Material.K_spec.slice(0,3);
	var my_shininessVal=my_Material.K_shiny;

	// console.log("Ka:",my_ambientColor);
	console.log("Kd:",my_diffuseColor);
	console.log("Ks",my_specularColor);
	console.log("shininessVal",my_shininessVal);

	//bind

	gl.uniform1f(this.shininessVal,my_shininessVal);
	// gl.uniform3fv(this.ambientColor, my_ambientColor);
	gl.uniform3fv(this.diffuseColor, my_diffuseColor);
	gl.uniform3fv(this.specularColor, my_specularColor);


		gl.uniformMatrix4fv(this.g_modelMatLoc, false, this.g_modelMatrix.elements);
		gl.uniformMatrix4fv(this.u_NormalMatrix, false, this.normalMatrix.elements);
	
	
		gl.drawArrays(gl.TRIANGLES, 306,12);
		popMatrix();
		popMatrix();
		popMatrix();
		popMatrix();
		this.g_modelMatrix= popMatrix();//get to head	
	}
	
	
VBObox2.prototype.Drawrightearpart1=function(){
		pushMatrix(this.g_modelMatrix);	
		this.g_modelMatrix.translate(0.5,0.5,0.25); // -toward back，+ toward front，only after set identity's scale(1,1,-1)
	
		this.g_modelMatrix.rotate(30,0,0,1);
		this.g_modelMatrix.rotate(g_angle05, 0, 0, 1); 
		pushMatrix(this.g_modelMatrix);
	
	
		this.g_modelMatrix.scale(0.4,0.4,0.4);	
			//Find inverse transpose of modelMatrix:
	this.normalMatrix.setInverseOf(this.g_modelMatrix);
	this.normalMatrix.transpose();

	my_Material=new Material(6);//6 MATL_BRASS
	// var my_ambientColor= my_Material.K_ambi.slice(0,3); 
	var my_diffuseColor= my_Material.K_diff.slice(0,3) ; 
	// var my_specularColor= my_Material.K_spec.slice(0,3) ;
	var my_specularColor=my_Material.K_spec.slice(0,3);
	var my_shininessVal=my_Material.K_shiny;

	// console.log("Ka:",my_ambientColor);
	console.log("Kd:",my_diffuseColor);
	console.log("Ks",my_specularColor);
	console.log("shininessVal",my_shininessVal);

	//bind

	gl.uniform1f(this.shininessVal,my_shininessVal);
	// gl.uniform3fv(this.ambientColor, my_ambientColor);
	gl.uniform3fv(this.diffuseColor, my_diffuseColor);
	gl.uniform3fv(this.specularColor, my_specularColor);


		gl.uniformMatrix4fv(this.g_modelMatLoc, false, this.g_modelMatrix.elements);
		gl.uniformMatrix4fv(this.u_NormalMatrix, false, this.normalMatrix.elements);
	
	
		gl.drawArrays(gl.TRIANGLES, 318, 18);
		this.g_modelMatrix=popMatrix();
	}
	
	
	
VBObox2.prototype.Drawrightearpart2=function(){
		
		pushMatrix(this.g_modelMatrix);
		this.g_modelMatrix.rotate(-90,0,0,1);
		this.g_modelMatrix.translate(0,0.125*0.4,0);
		this.g_modelMatrix.rotate(g_angle06, 0, 0, 1);
		pushMatrix(this.g_modelMatrix);
		this.g_modelMatrix.scale(0.25,0.25,0.25);		
			//Find inverse transpose of modelMatrix:
	this.normalMatrix.setInverseOf(this.g_modelMatrix);
	this.normalMatrix.transpose();

	my_Material=new Material(6);//6 MATL_BRASS
	// var my_ambientColor= my_Material.K_ambi.slice(0,3); 
	var my_diffuseColor= my_Material.K_diff.slice(0,3) ; 
	// var my_specularColor= my_Material.K_spec.slice(0,3) ;
	var my_specularColor=my_Material.K_spec.slice(0,3);
	var my_shininessVal=my_Material.K_shiny;

	// console.log("Ka:",my_ambientColor);
	console.log("Kd:",my_diffuseColor);
	console.log("Ks",my_specularColor);
	console.log("shininessVal",my_shininessVal);

	//bind

	gl.uniform1f(this.shininessVal,my_shininessVal);
	// gl.uniform3fv(this.ambientColor, my_ambientColor);
	gl.uniform3fv(this.diffuseColor, my_diffuseColor);
	gl.uniform3fv(this.specularColor, my_specularColor);


		gl.uniformMatrix4fv(this.g_modelMatLoc, false, this.g_modelMatrix.elements);
		gl.uniformMatrix4fv(this.u_NormalMatrix, false, this.normalMatrix.elements);
	
	
		gl.drawArrays(gl.TRIANGLES, 270, 12);//re call it is the same
		this.g_modelMatrix=popMatrix();
			
	}
VBObox2.prototype.Drawrightearpart3=function(){
		pushMatrix(this.g_modelMatrix);
		this.g_modelMatrix.translate(0,0.25*0.25*Math.sqrt(6)/3,0);
		pushMatrix(this.g_modelMatrix);
	
		this.g_modelMatrix.scale(1.0,1.0,1.0);	
			//Find inverse transpose of modelMatrix:
	this.normalMatrix.setInverseOf(this.g_modelMatrix);
	this.normalMatrix.transpose();

	my_Material=new Material(6);//6 MATL_BRASS
	// var my_ambientColor= my_Material.K_ambi.slice(0,3); 
	var my_diffuseColor= my_Material.K_diff.slice(0,3) ; 
	// var my_specularColor= my_Material.K_spec.slice(0,3) ;
	var my_specularColor=my_Material.K_spec.slice(0,3);
	var my_shininessVal=my_Material.K_shiny;

	// console.log("Ka:",my_ambientColor);
	console.log("Kd:",my_diffuseColor);
	console.log("Ks",my_specularColor);
	console.log("shininessVal",my_shininessVal);

	//bind

	gl.uniform1f(this.shininessVal,my_shininessVal);
	// gl.uniform3fv(this.ambientColor, my_ambientColor);
	gl.uniform3fv(this.diffuseColor, my_diffuseColor);
	gl.uniform3fv(this.specularColor, my_specularColor);


		gl.uniformMatrix4fv(this.g_modelMatLoc, false, this.g_modelMatrix.elements);
		gl.uniformMatrix4fv(this.u_NormalMatrix, false, this.normalMatrix.elements);
	
	
		gl.drawArrays(gl.TRIANGLES, 282,24);//re call it is the same
		this.g_modelMatrix= popMatrix();	
	}
VBObox2.prototype.Drawrightearpart4=function(){
		pushMatrix(this.g_modelMatrix);
		this.g_modelMatrix.translate(0,0.3,0);
		pushMatrix(this.g_modelMatrix);
	
		this.g_modelMatrix.scale(1.0,1.0,1.0);		
			//Find inverse transpose of modelMatrix:
	this.normalMatrix.setInverseOf(this.g_modelMatrix);
	this.normalMatrix.transpose();

	my_Material=new Material(5);//6 MATL_BRASS
	// var my_ambientColor= my_Material.K_ambi.slice(0,3); 
	var my_diffuseColor= my_Material.K_diff.slice(0,3) ; 
	// var my_specularColor= my_Material.K_spec.slice(0,3) ;
	var my_specularColor=my_Material.K_spec.slice(0,3);
	var my_shininessVal=my_Material.K_shiny;

	// console.log("Ka:",my_ambientColor);
	console.log("Kd:",my_diffuseColor);
	console.log("Ks",my_specularColor);
	console.log("shininessVal",my_shininessVal);

	//bind

	gl.uniform1f(this.shininessVal,my_shininessVal);
	// gl.uniform3fv(this.ambientColor, my_ambientColor);
	gl.uniform3fv(this.diffuseColor, my_diffuseColor);
	gl.uniform3fv(this.specularColor, my_specularColor);


		gl.uniformMatrix4fv(this.g_modelMatLoc, false, this.g_modelMatrix.elements);
		gl.uniformMatrix4fv(this.u_NormalMatrix, false, this.normalMatrix.elements);
	
	
		gl.drawArrays(gl.TRIANGLES, 306,12);//re call it is the same
		popMatrix();
		popMatrix();
		popMatrix();
		popMatrix();
		this.g_modelMatrix= popMatrix();//get to head	
	}
	
VBObox2.prototype.DrawleftBlush=function(){
		pushMatrix(this.g_modelMatrix);
		this.g_modelMatrix.translate(0.07*0.5,0.12,0.5011);
		this.g_modelMatrix.scale(0.07,0.07,1.0);
		this.normalMatrix.setInverseOf(this.g_modelMatrix);
	this.normalMatrix.transpose();

	my_Material=new Material(18);//6 MATL_BRASS
	// var my_ambientColor= my_Material.K_ambi.slice(0,3); 
	var my_diffuseColor= my_Material.K_diff.slice(0,3) ; 
	// var my_specularColor= my_Material.K_spec.slice(0,3) ;
	var my_specularColor=my_Material.K_spec.slice(0,3);
	var my_shininessVal=my_Material.K_shiny;

	// console.log("Ka:",my_ambientColor);
	console.log("Kd:",my_diffuseColor);
	console.log("Ks",my_specularColor);
	console.log("shininessVal",my_shininessVal);

	//bind

	gl.uniform1f(this.shininessVal,my_shininessVal);
	// gl.uniform3fv(this.ambientColor, my_ambientColor);
	gl.uniform3fv(this.diffuseColor, my_diffuseColor);
	gl.uniform3fv(this.specularColor, my_specularColor);


		gl.uniformMatrix4fv(this.g_modelMatLoc, false, this.g_modelMatrix.elements);
		gl.uniformMatrix4fv(this.u_NormalMatrix, false, this.normalMatrix.elements);
			gl.drawArrays(gl.TRIANGLE_FAN,336,29);
		
		this.g_modelMatrix=popMatrix();
	
		pushMatrix(this.g_modelMatrix);
	
		this.g_modelMatrix.translate(0.0, 0.12, 0.5011);
		this.normalMatrix.setInverseOf(this.g_modelMatrix);
	this.normalMatrix.transpose();

	my_Material=new Material(19);//6 MATL_BRASS
	// var my_ambientColor= my_Material.K_ambi.slice(0,3); 
	var my_diffuseColor= my_Material.K_diff.slice(0,3) ; 
	// var my_specularColor= my_Material.K_spec.slice(0,3) ;
	var my_specularColor=my_Material.K_spec.slice(0,3);
	var my_shininessVal=my_Material.K_shiny;

	// console.log("Ka:",my_ambientColor);
	console.log("Kd:",my_diffuseColor);
	console.log("Ks",my_specularColor);
	console.log("shininessVal",my_shininessVal);

	//bind

	gl.uniform1f(this.shininessVal,my_shininessVal);
	// gl.uniform3fv(this.ambientColor, my_ambientColor);
	gl.uniform3fv(this.diffuseColor, my_diffuseColor);
	gl.uniform3fv(this.specularColor, my_specularColor);


		gl.uniformMatrix4fv(this.g_modelMatLoc, false, this.g_modelMatrix.elements);
		gl.uniformMatrix4fv(this.u_NormalMatrix, false, this.normalMatrix.elements);
		gl.drawArrays(gl.TRIANGLES,365,3);
		this.g_modelMatrix=popMatrix();
	}
VBObox2.prototype.DrawrightBlush=function(){
		pushMatrix(this.g_modelMatrix);
		this.g_modelMatrix.translate(0.5-0.07*0.5,0.12,0.5011);
		this.g_modelMatrix.scale(0.07,0.07,1.0);
		this.g_modelMatrix.scale(-1,1,1);
		this.normalMatrix.setInverseOf(this.g_modelMatrix);
	this.normalMatrix.transpose();

	my_Material=new Material(21);//6 MATL_BRASS
	// var my_ambientColor= my_Material.K_ambi.slice(0,3); 
	var my_diffuseColor= my_Material.K_diff.slice(0,3) ; 
	// var my_specularColor= my_Material.K_spec.slice(0,3) ;
	var my_specularColor=my_Material.K_spec.slice(0,3);
	var my_shininessVal=my_Material.K_shiny;

	// console.log("Ka:",my_ambientColor);
	console.log("Kd:",my_diffuseColor);
	console.log("Ks",my_specularColor);
	console.log("shininessVal",my_shininessVal);

	//bind

	gl.uniform1f(this.shininessVal,my_shininessVal);
	// gl.uniform3fv(this.ambientColor, my_ambientColor);
	gl.uniform3fv(this.diffuseColor, my_diffuseColor);
	gl.uniform3fv(this.specularColor, my_specularColor);


		gl.uniformMatrix4fv(this.g_modelMatLoc, false, this.g_modelMatrix.elements);
		gl.uniformMatrix4fv(this.u_NormalMatrix, false, this.normalMatrix.elements);
			gl.drawArrays(gl.TRIANGLE_FAN,336,29);
		
		this.g_modelMatrix=popMatrix();
	
		pushMatrix(this.g_modelMatrix);
		this.g_modelMatrix.translate(0.5, 0.12, 0.5011);
		this.g_modelMatrix.scale(-1,1,1);
		this.normalMatrix.setInverseOf(this.g_modelMatrix);
	this.normalMatrix.transpose();

	my_Material=new Material(21);//6 MATL_BRASS
	// var my_ambientColor= my_Material.K_ambi.slice(0,3); 
	var my_diffuseColor= my_Material.K_diff.slice(0,3) ; 
	// var my_specularColor= my_Material.K_spec.slice(0,3) ;
	var my_specularColor=my_Material.K_spec.slice(0,3);
	var my_shininessVal=my_Material.K_shiny;

	// console.log("Ka:",my_ambientColor);
	console.log("Kd:",my_diffuseColor);
	console.log("Ks",my_specularColor);
	console.log("shininessVal",my_shininessVal);

	//bind

	gl.uniform1f(this.shininessVal,my_shininessVal);
	// gl.uniform3fv(this.ambientColor, my_ambientColor);
	gl.uniform3fv(this.diffuseColor, my_diffuseColor);
	gl.uniform3fv(this.specularColor, my_specularColor);


		gl.uniformMatrix4fv(this.g_modelMatLoc, false, this.g_modelMatrix.elements);
		gl.uniformMatrix4fv(this.u_NormalMatrix, false, this.normalMatrix.elements);
		gl.drawArrays(gl.TRIANGLES,365,3);
		this.g_modelMatrix=popMatrix();
	
	}
	//Blush in the left side
VBObox2.prototype.DrawleftBlush_left=function(){
		pushMatrix(this.g_modelMatrix);
		this.g_modelMatrix.translate(0, 0.12, 0.50);
		this.g_modelMatrix.rotate(90,0,1,0);
		this.g_modelMatrix.translate(-0.002, 0.0, 0);
		this.g_modelMatrix.scale(0.025,0.061,1);
		this.normalMatrix.setInverseOf(this.g_modelMatrix);
	this.normalMatrix.transpose();

	my_Material=new Material(21);//6 MATL_BRASS
	// var my_ambientColor= my_Material.K_ambi.slice(0,3); 
	var my_diffuseColor= my_Material.K_diff.slice(0,3) ; 
	// var my_specularColor= my_Material.K_spec.slice(0,3) ;
	var my_specularColor=my_Material.K_spec.slice(0,3);
	var my_shininessVal=my_Material.K_shiny;

	// console.log("Ka:",my_ambientColor);
	console.log("Kd:",my_diffuseColor);
	console.log("Ks",my_specularColor);
	console.log("shininessVal",my_shininessVal);

	//bind

	gl.uniform1f(this.shininessVal,my_shininessVal);
	// gl.uniform3fv(this.ambientColor, my_ambientColor);
	gl.uniform3fv(this.diffuseColor, my_diffuseColor);
	gl.uniform3fv(this.specularColor, my_specularColor);


		gl.uniformMatrix4fv(this.g_modelMatLoc, false, this.g_modelMatrix.elements);
		gl.uniformMatrix4fv(this.u_NormalMatrix, false, this.normalMatrix.elements);
		gl.drawArrays(gl.TRIANGLE_FAN,368,22);
		this.g_modelMatrix=popMatrix();
	
	
	}
	
	//blush in the right side
VBObox2.prototype.DrawrightBlush_left=function(){
		pushMatrix(this.g_modelMatrix);
		this.g_modelMatrix.translate(0.5, 0.12, 0.50);
		this.g_modelMatrix.rotate(90,0,1,0);
		this.g_modelMatrix.translate(-0.002, 0.0, 0);
		this.g_modelMatrix.scale(0.025,0.061,1);
		this.normalMatrix.setInverseOf(this.g_modelMatrix);
	this.normalMatrix.transpose();

	my_Material=new Material(21);//6 MATL_BRASS
	// var my_ambientColor= my_Material.K_ambi.slice(0,3); 
	var my_diffuseColor= my_Material.K_diff.slice(0,3) ; 
	// var my_specularColor= my_Material.K_spec.slice(0,3) ;
	var my_specularColor=my_Material.K_spec.slice(0,3);
	var my_shininessVal=my_Material.K_shiny;

	// console.log("Ka:",my_ambientColor);
	console.log("Kd:",my_diffuseColor);
	console.log("Ks",my_specularColor);
	console.log("shininessVal",my_shininessVal);

	//bind

	gl.uniform1f(this.shininessVal,my_shininessVal);
	// gl.uniform3fv(this.ambientColor, my_ambientColor);
	gl.uniform3fv(this.diffuseColor, my_diffuseColor);
	gl.uniform3fv(this.specularColor, my_specularColor);


		gl.uniformMatrix4fv(this.g_modelMatLoc, false, this.g_modelMatrix.elements);
		gl.uniformMatrix4fv(this.u_NormalMatrix, false, this.normalMatrix.elements);
		gl.drawArrays(gl.TRIANGLE_FAN,390,22);
		this.g_modelMatrix=popMatrix();
	}
VBObox2.prototype.Drawlefteye_brown=function(){
		pushMatrix(this.g_modelMatrix);
		this.g_modelMatrix.translate(0.15, 0.26, 0.5012);
		this.g_modelMatrix.scale(0.050,0.025,1);
		this.normalMatrix.setInverseOf(this.g_modelMatrix);
	this.normalMatrix.transpose();

	my_Material=new Material(21);//6 MATL_BRASS
	// var my_ambientColor= my_Material.K_ambi.slice(0,3); 
	var my_diffuseColor= my_Material.K_diff.slice(0,3) ; 
	// var my_specularColor= my_Material.K_spec.slice(0,3) ;
	var my_specularColor=my_Material.K_spec.slice(0,3);
	var my_shininessVal=my_Material.K_shiny;

	// console.log("Ka:",my_ambientColor);
	console.log("Kd:",my_diffuseColor);
	console.log("Ks",my_specularColor);
	console.log("shininessVal",my_shininessVal);

	//bind

	gl.uniform1f(this.shininessVal,my_shininessVal);
	// gl.uniform3fv(this.ambientColor, my_ambientColor);
	gl.uniform3fv(this.diffuseColor, my_diffuseColor);
	gl.uniform3fv(this.specularColor, my_specularColor);


		gl.uniformMatrix4fv(this.g_modelMatLoc, false, this.g_modelMatrix.elements);
		gl.uniformMatrix4fv(this.u_NormalMatrix, false, this.normalMatrix.elements);
		gl.drawArrays(gl.TRIANGLE_FAN,412,22);
		this.g_modelMatrix=popMatrix();
	
	}
VBObox2.prototype.Drawrighteye_brown=function(){
		pushMatrix(this.g_modelMatrix);
		this.g_modelMatrix.translate(0.35, 0.26, 0.5012);
		this.g_modelMatrix.scale(0.050,0.025,1);
		this.normalMatrix.setInverseOf(this.g_modelMatrix);
	this.normalMatrix.transpose();

	my_Material=new Material(21);//6 MATL_BRASS
	// var my_ambientColor= my_Material.K_ambi.slice(0,3); 
	var my_diffuseColor= my_Material.K_diff.slice(0,3) ; 
	// var my_specularColor= my_Material.K_spec.slice(0,3) ;
	var my_specularColor=my_Material.K_spec.slice(0,3);
	var my_shininessVal=my_Material.K_shiny;

	// console.log("Ka:",my_ambientColor);
	console.log("Kd:",my_diffuseColor);
	console.log("Ks",my_specularColor);
	console.log("shininessVal",my_shininessVal);

	//bind

	gl.uniform1f(this.shininessVal,my_shininessVal);
	// gl.uniform3fv(this.ambientColor, my_ambientColor);
	gl.uniform3fv(this.diffuseColor, my_diffuseColor);
	gl.uniform3fv(this.specularColor, my_specularColor);


		gl.uniformMatrix4fv(this.g_modelMatLoc, false, this.g_modelMatrix.elements);
		gl.uniformMatrix4fv(this.u_NormalMatrix, false, this.normalMatrix.elements);
		gl.drawArrays(gl.TRIANGLE_FAN,412,22);
		this.g_modelMatrix=popMatrix();
	}
VBObox2.prototype.Drawtailpart1=function(){
		pushMatrix(this.g_modelMatrix);	
		this.g_modelMatrix.translate(0.225,0.05,-0.01);// 
		this.g_modelMatrix.rotate(90,0,1,0);
		this.g_modelMatrix.rotate(-g_angle07, 0, 0, 1); 
		pushMatrix(this.g_modelMatrix);
			//Find inverse transpose of modelMatrix:
	this.normalMatrix.setInverseOf(this.g_modelMatrix);
	this.normalMatrix.transpose();

	my_Material=new Material(20);//6 MATL_BRASS
	// var my_ambientColor= my_Material.K_ambi.slice(0,3); 
	var my_diffuseColor= my_Material.K_diff.slice(0,3) ; 
	// var my_specularColor= my_Material.K_spec.slice(0,3) ;
	var my_specularColor=my_Material.K_spec.slice(0,3);
	var my_shininessVal=my_Material.K_shiny;

	// console.log("Ka:",my_ambientColor);
	console.log("Kd:",my_diffuseColor);
	console.log("Ks",my_specularColor);
	console.log("shininessVal",my_shininessVal);

	//bind

	gl.uniform1f(this.shininessVal,my_shininessVal);
	// gl.uniform3fv(this.ambientColor, my_ambientColor);
	gl.uniform3fv(this.diffuseColor, my_diffuseColor);
	gl.uniform3fv(this.specularColor, my_specularColor);


		gl.uniformMatrix4fv(this.g_modelMatLoc, false, this.g_modelMatrix.elements);
		gl.uniformMatrix4fv(this.u_NormalMatrix, false, this.normalMatrix.elements);
	
		gl.drawArrays(gl.TRIANGLES, 434, 16);
		this.g_modelMatrix=popMatrix();
	}
	VBObox2.prototype.Drawtailpart2=function(){
	
		pushMatrix(this.g_modelMatrix);
		this.g_modelMatrix.translate(0.025*Math.sqrt(15),0,0);
		pushMatrix(this.g_modelMatrix);		
			//Find inverse transpose of modelMatrix:
	this.normalMatrix.setInverseOf(this.g_modelMatrix);
	this.normalMatrix.transpose();

	my_Material=new Material(15);//6 MATL_BRASS
	// var my_ambientColor= my_Material.K_ambi.slice(0,3); 
	var my_diffuseColor= my_Material.K_diff.slice(0,3) ; 
	// var my_specularColor= my_Material.K_spec.slice(0,3) ;
	var my_specularColor=my_Material.K_spec.slice(0,3);
	var my_shininessVal=my_Material.K_shiny;

	// console.log("Ka:",my_ambientColor);
	console.log("Kd:",my_diffuseColor);
	console.log("Ks",my_specularColor);
	console.log("shininessVal",my_shininessVal);

	//bind

	gl.uniform1f(this.shininessVal,my_shininessVal);
	// gl.uniform3fv(this.ambientColor, my_ambientColor);
	gl.uniform3fv(this.diffuseColor, my_diffuseColor);
	gl.uniform3fv(this.specularColor, my_specularColor);


		gl.uniformMatrix4fv(this.g_modelMatLoc, false, this.g_modelMatrix.elements);
		gl.uniformMatrix4fv(this.u_NormalMatrix, false, this.normalMatrix.elements);
	
	
		gl.drawArrays(gl.TRIANGLES, 450, 36);//re call it is the same
		this.g_modelMatrix=popMatrix();
	
	}
VBObox2.prototype.Drawtailpart3=function(){
		pushMatrix(this.g_modelMatrix);
		this.g_modelMatrix.translate(0.5*0.025*Math.sqrt(15),0,0);
		pushMatrix(this.g_modelMatrix);
	
			//Find inverse transpose of modelMatrix:
	this.normalMatrix.setInverseOf(this.g_modelMatrix);
	this.normalMatrix.transpose();

	my_Material=new Material(15);//6 MATL_BRASS
	// var my_ambientColor= my_Material.K_ambi.slice(0,3); 
	var my_diffuseColor= my_Material.K_diff.slice(0,3) ; 
	// var my_specularColor= my_Material.K_spec.slice(0,3) ;
	var my_specularColor=my_Material.K_spec.slice(0,3);
	var my_shininessVal=my_Material.K_shiny;

	// console.log("Ka:",my_ambientColor);
	console.log("Kd:",my_diffuseColor);
	console.log("Ks",my_specularColor);
	console.log("shininessVal",my_shininessVal);

	//bind

	gl.uniform1f(this.shininessVal,my_shininessVal);
	// gl.uniform3fv(this.ambientColor, my_ambientColor);
	gl.uniform3fv(this.diffuseColor, my_diffuseColor);
	gl.uniform3fv(this.specularColor, my_specularColor);


		gl.uniformMatrix4fv(this.g_modelMatLoc, false, this.g_modelMatrix.elements);
		gl.uniformMatrix4fv(this.u_NormalMatrix, false, this.normalMatrix.elements);
	
	
		gl.drawArrays(gl.TRIANGLES, 486, 36);//re call it is the same
		this.g_modelMatrix= popMatrix();	
	}
VBObox2.prototype.Drawtailpart4=function(){
		pushMatrix(this.g_modelMatrix);
		this.g_modelMatrix.translate(1.5*0.025*Math.sqrt(15),0,0);
		pushMatrix(this.g_modelMatrix);	
			//Find inverse transpose of modelMatrix:
	this.normalMatrix.setInverseOf(this.g_modelMatrix);
	this.normalMatrix.transpose();

	my_Material=new Material(17);//6 MATL_BRASS
	// var my_ambientColor= my_Material.K_ambi.slice(0,3); 
	var my_diffuseColor= my_Material.K_diff.slice(0,3) ; 
	// var my_specularColor= my_Material.K_spec.slice(0,3) ;
	var my_specularColor=my_Material.K_spec.slice(0,3);
	var my_shininessVal=my_Material.K_shiny;

	// console.log("Ka:",my_ambientColor);
	console.log("Kd:",my_diffuseColor);
	console.log("Ks",my_specularColor);
	console.log("shininessVal",my_shininessVal);

	//bind

	gl.uniform1f(this.shininessVal,my_shininessVal);
	// gl.uniform3fv(this.ambientColor, my_ambientColor);
	gl.uniform3fv(this.diffuseColor, my_diffuseColor);
	gl.uniform3fv(this.specularColor, my_specularColor);


		gl.uniformMatrix4fv(this.g_modelMatLoc, false, this.g_modelMatrix.elements);
		gl.uniformMatrix4fv(this.u_NormalMatrix, false, this.normalMatrix.elements);
	
		gl.drawArrays(gl.TRIANGLES, 522, 18);//re call it is the same
		popMatrix();
		popMatrix();
		popMatrix();
		popMatrix();
		this.g_modelMatrix= popMatrix();//get to head	
	}
VBObox2.prototype.Drawground=function(){
		pushMatrix(this.g_modelMatrix);  // SAVE world drawing coords.
		this.g_modelMatrix.scale(0.1, 0.1, 0.1);				// shrink by 10X:
		  // Drawing:
		  // Pass our current matrix to the vertex shaders:
		  	//Find inverse transpose of modelMatrix:
	this.normalMatrix.setInverseOf(this.g_modelMatrix);
	this.normalMatrix.transpose();

	my_Material=new Material(21);//6 MATL_BRASS
	// var my_ambientColor= my_Material.K_ambi.slice(0,3); 
	var my_diffuseColor= my_Material.K_diff.slice(0,3) ; 
	// var my_specularColor= my_Material.K_spec.slice(0,3) ;
	var my_specularColor=my_Material.K_spec.slice(0,3);
	var my_shininessVal=my_Material.K_shiny;

	// console.log("Ka:",my_ambientColor);
	console.log("Kd:",my_diffuseColor);
	console.log("Ks",my_specularColor);
	console.log("shininessVal",my_shininessVal);

	//bind

	gl.uniform1f(this.shininessVal,my_shininessVal);
	// gl.uniform3fv(this.ambientColor, my_ambientColor);
	gl.uniform3fv(this.diffuseColor, my_diffuseColor);
	gl.uniform3fv(this.specularColor, my_specularColor);


		gl.uniformMatrix4fv(this.g_modelMatLoc, false, this.g_modelMatrix.elements);
		gl.uniformMatrix4fv(this.u_NormalMatrix, false, this.normalMatrix.elements);
		gl.drawArrays(gl.LINES, 								// use this drawing primitive, and
			gndStart/floatsPerVertex,	// start at this vertex number, and
			gndVerts.length/floatsPerVertex);	// draw this many vertices.
		this.g_modelMatrix= popMatrix();//get to head	
	}

VBObox2.prototype.Drawaxes=function(){
		pushMatrix(this.g_modelMatrix);  // SAVE world drawing coords.
		this.g_modelMatrix.scale(0.4, 0.4, 0.4);				// Make it smaller.
		  // Drawing:
		  // Pass our current matrix to the vertex shaders:
		  	//Find inverse transpose of modelMatrix:
	this.normalMatrix.setInverseOf(this.g_modelMatrix);
	this.normalMatrix.transpose();

	my_Material=new Material(4);//6 MATL_BRASS
	// var my_ambientColor= my_Material.K_ambi.slice(0,3); 
	var my_diffuseColor= my_Material.K_diff.slice(0,3) ; 
	// var my_specularColor= my_Material.K_spec.slice(0,3) ;
	var my_specularColor=my_Material.K_spec.slice(0,3);
	var my_shininessVal=my_Material.K_shiny;

	// console.log("Ka:",my_ambientColor);
	console.log("Kd:",my_diffuseColor);
	console.log("Ks",my_specularColor);
	console.log("shininessVal",my_shininessVal);

	//bind

	gl.uniform1f(this.shininessVal,my_shininessVal);
	// gl.uniform3fv(this.ambientColor, my_ambientColor);
	gl.uniform3fv(this.diffuseColor, my_diffuseColor);
	gl.uniform3fv(this.specularColor, my_specularColor);


		gl.uniformMatrix4fv(this.g_modelMatLoc, false, this.g_modelMatrix.elements);
		gl.uniformMatrix4fv(this.u_NormalMatrix, false, this.normalMatrix.elements);
		gl.drawArrays(gl.LINES, 								// use this drawing primitive, and
			axeStart/floatsPerVertex,	// start at this vertex number, and
			myaxes.length/floatsPerVertex);	// draw this many vertices.
		this.g_modelMatrix= popMatrix();//get to head	
	}
VBObox2.prototype.Drawsphere=function(){
		pushMatrix(this.g_modelMatrix);  // SAVE world drawing coords.
		this.g_modelMatrix.scale(0.3, 0.3, 0.3);				// Make it smaller.
		  // Drawing:
		  // Pass our current matrix to the vertex shaders:
		  	//Find inverse transpose of modelMatrix:
	this.normalMatrix.setInverseOf(this.g_modelMatrix);
	this.normalMatrix.transpose();

	my_Material=new Material(10);//6 MATL_BRASS
	// var my_ambientColor= my_Material.K_ambi.slice(0,3); 
	var my_diffuseColor= my_Material.K_diff.slice(0,3) ; 
	// var my_specularColor= my_Material.K_spec.slice(0,3) ;
	var my_specularColor=my_Material.K_spec.slice(0,3);
	var my_shininessVal=my_Material.K_shiny;

	// console.log("Ka:",my_ambientColor);
	console.log("Kd:",my_diffuseColor);
	console.log("Ks",my_specularColor);
	console.log("shininessVal",my_shininessVal);

	//bind

	gl.uniform1f(this.shininessVal,my_shininessVal);
	// gl.uniform3fv(this.ambientColor, my_ambientColor);
	gl.uniform3fv(this.diffuseColor, my_diffuseColor);
	gl.uniform3fv(this.specularColor, my_specularColor);


		gl.uniformMatrix4fv(this.g_modelMatLoc, false, this.g_modelMatrix.elements);
		gl.uniformMatrix4fv(this.u_NormalMatrix, false, this.normalMatrix.elements);
		  gl.drawArrays(gl.TRIANGLE_STRIP,				// use this drawing primitive, and
			sphStart/floatsPerVertex,	// start at this vertex number, and 
			sphVerts.length/floatsPerVertex);	// draw this many vertices.
		this.g_modelMatrix= popMatrix();//get to head	
	}
VBObox2.prototype.Drawpokeball_partI=function(){
		pushMatrix(this.g_modelMatrix);  // SAVE world drawing coords.
		this.g_modelMatrix.scale(0.3, 0.3, 0.3);				// Make it smaller.
		  // Drawing:
		  // Pass our current matrix to the vertex shaders:
		  	//Find inverse transpose of modelMatrix:
	this.normalMatrix.setInverseOf(this.g_modelMatrix);
	this.normalMatrix.transpose();

	my_Material=new Material(18);//6 MATL_BRASS
	// var my_ambientColor= my_Material.K_ambi.slice(0,3); 
	var my_diffuseColor= my_Material.K_diff.slice(0,3) ; 
	// var my_specularColor= my_Material.K_spec.slice(0,3) ;
	var my_specularColor=my_Material.K_spec.slice(0,3);
	var my_shininessVal=my_Material.K_shiny;

	// console.log("Ka:",my_ambientColor);
	console.log("Kd:",my_diffuseColor);
	console.log("Ks",my_specularColor);
	console.log("shininessVal",my_shininessVal);

	//bind

	gl.uniform1f(this.shininessVal,my_shininessVal);
	// gl.uniform3fv(this.ambientColor, my_ambientColor);
	gl.uniform3fv(this.diffuseColor, my_diffuseColor);
	gl.uniform3fv(this.specularColor, my_specularColor);


		gl.uniformMatrix4fv(this.g_modelMatLoc, false, this.g_modelMatrix.elements);
		gl.uniformMatrix4fv(this.u_NormalMatrix, false, this.normalMatrix.elements);
		  gl.drawArrays(gl.TRIANGLE_STRIP,				// use this drawing primitive, and
			vbox2_SphStart/floatsPerVertex,	// start at this vertex number, and 
			sphVerts.length/floatsPerVertex);	// draw this many vertices.
	}
VBObox2.prototype.Drawpokeball_partII=function(){
		pushMatrix(this.g_modelMatrix);  // SAVE world drawing coords.
		// this.g_modelMatrix.translate(0.2,0.2,0.2);
		this.g_modelMatrix.rotate(90,0,1,0);
		this.g_modelMatrix.translate(0,0,1);
		this.g_modelMatrix.translate(0.1,0,0);
		this.g_modelMatrix.scale(0.3, 0.3, 0.3);				// Make it smaller.
		  // Drawing:
		  // Pass our current matrix to the vertex shaders:
		  	//Find inverse transpose of modelMatrix:
	this.normalMatrix.setInverseOf(this.g_modelMatrix);
	this.normalMatrix.transpose();

	my_Material=new Material(18);//6 MATL_BRASS
	// var my_ambientColor= my_Material.K_ambi.slice(0,3); 
	var my_diffuseColor= my_Material.K_diff.slice(0,3) ; 
	// var my_specularColor= my_Material.K_spec.slice(0,3) ;
	var my_specularColor=my_Material.K_spec.slice(0,3);
	var my_shininessVal=my_Material.K_shiny;

	// console.log("Ka:",my_ambientColor);
	console.log("Kd:",my_diffuseColor);
	console.log("Ks",my_specularColor);
	console.log("shininessVal",my_shininessVal);

	//bind

	gl.uniform1f(this.shininessVal,my_shininessVal);
	// gl.uniform3fv(this.ambientColor, my_ambientColor);
	gl.uniform3fv(this.diffuseColor, my_diffuseColor);
	gl.uniform3fv(this.specularColor, my_specularColor);


		gl.uniformMatrix4fv(this.g_modelMatLoc, false, this.g_modelMatrix.elements);
		gl.uniformMatrix4fv(this.u_NormalMatrix, false, this.normalMatrix.elements);
		  gl.drawArrays(gl.TRIANGLE_FAN,				// use this drawing primitive, and
			vbox2_cir1Start/floatsPerVertex,	// start at this vertex number, and 
			my_circle.length/floatsPerVertex);	// draw this many vertices.
	
	}
VBObox2.prototype.Drawpokeball_partIII=function(){
		pushMatrix(this.g_modelMatrix);  // SAVE world drawing coords.
		// this.g_modelMatrix.translate(0.2,0.2,0.2);
		  // Drawing:
		  // Pass our current matrix to the vertex shaders:
		  	//Find inverse transpose of modelMatrix:
	this.normalMatrix.setInverseOf(this.g_modelMatrix);
	this.normalMatrix.transpose();

	my_Material=new Material(18);//6 MATL_BRASS
	// var my_ambientColor= my_Material.K_ambi.slice(0,3); 
	var my_diffuseColor= my_Material.K_diff.slice(0,3) ; 
	// var my_specularColor= my_Material.K_spec.slice(0,3) ;
	var my_specularColor=my_Material.K_spec.slice(0,3);
	var my_shininessVal=my_Material.K_shiny;

	// console.log("Ka:",my_ambientColor);
	console.log("Kd:",my_diffuseColor);
	console.log("Ks",my_specularColor);
	console.log("shininessVal",my_shininessVal);

	//bind

	gl.uniform1f(this.shininessVal,my_shininessVal);
	// gl.uniform3fv(this.ambientColor, my_ambientColor);
	gl.uniform3fv(this.diffuseColor, my_diffuseColor);
	gl.uniform3fv(this.specularColor, my_specularColor);


		gl.uniformMatrix4fv(this.g_modelMatLoc, false, this.g_modelMatrix.elements);
		gl.uniformMatrix4fv(this.u_NormalMatrix, false, this.normalMatrix.elements);
		  gl.drawArrays(gl.LINE_LOOP,				// use this drawing primitive, and
			vbox2_cir2Start/floatsPerVertex,	// start at this vertex number, and 
			my_circle2.length/floatsPerVertex);	// draw this many vertices.
		popMatrix();
		popMatrix();
		this.g_modelMatrix=popMatrix();
	}
	
VBObox2.prototype.Drawhourglass_partI=function(){
		pushMatrix(this.g_modelMatrix);  // SAVE world drawing coords.
		// this.g_modelMatrix.translate(0.2,0.2,0.2);
		  // Drawing:
		  // Pass our current matrix to the vertex shaders:
		  //this.g_modelMatrix.rotate(180,0,1,0);
		  	// this.g_modelMatrix.rotate(g_angle01, 0,0 , 1);  // spin drawing axes on Y axis;
		  this.g_modelMatrix.rotate(90,0,1,0);
		  this.g_modelMatrix.scale(3,3,3);
	//Find inverse transpose of modelMatrix:
	this.normalMatrix.setInverseOf(this.g_modelMatrix);
	this.normalMatrix.transpose();


		//Find inverse transpose of modelMatrix:
	this.normalMatrix.setInverseOf(this.g_modelMatrix);
	this.normalMatrix.transpose();

	my_Material=new Material(20);//6 MATL_BRASS
	// var my_ambientColor= my_Material.K_ambi.slice(0,3); 
	var my_diffuseColor= my_Material.K_diff.slice(0,3) ; 
	// var my_specularColor= my_Material.K_spec.slice(0,3) ;
	var my_specularColor=my_Material.K_spec.slice(0,3);
	var my_shininessVal=my_Material.K_shiny;

	// console.log("Ka:",my_ambientColor);
	console.log("Kd:",my_diffuseColor);
	console.log("Ks",my_specularColor);
	console.log("shininessVal",my_shininessVal);

	//bind

	gl.uniform1f(this.shininessVal,my_shininessVal);
	// gl.uniform3fv(this.ambientColor, my_ambientColor);
	gl.uniform3fv(this.diffuseColor, my_diffuseColor);
	gl.uniform3fv(this.specularColor, my_specularColor);


		gl.uniformMatrix4fv(this.g_modelMatLoc, false, this.g_modelMatrix.elements);
		gl.uniformMatrix4fv(this.u_NormalMatrix, false, this.normalMatrix.elements);
	gl.uniformMatrix4fv(this.u_NormalMatrix, false, this.normalMatrix.elements);

		  gl.drawArrays(gl.TRIANGLES,				// use this drawing primitive, and
			vbox2_tetStart/floatsPerVertex,	// start at this vertex number, and 
			my_tetrahedron.length/floatsPerVertex);	// draw this many vertices.
	}
	
VBObox2.prototype.Drawhourglass_partII=function(){
		pushMatrix(this.g_modelMatrix);  // SAVE world drawing coords.
		// this.g_modelMatrix.translate(0.2,0.2,0.2);
		  // Drawing:
		  // Pass our current matrix to the vertex shaders:
		  this.g_modelMatrix.rotate(130,0,1,0);
		  this.g_modelMatrix.rotate(g_angle02,0,1,0);
		  this.g_modelMatrix.rotate(g_angle01,1,0,0);
		//Find inverse transpose of modelMatrix:
		this.normalMatrix.setInverseOf(this.g_modelMatrix);
		this.normalMatrix.transpose();
	
	
			//Find inverse transpose of modelMatrix:
	this.normalMatrix.setInverseOf(this.g_modelMatrix);
	this.normalMatrix.transpose();

	my_Material=new Material(20);//6 MATL_BRASS
	// var my_ambientColor= my_Material.K_ambi.slice(0,3); 
	var my_diffuseColor= my_Material.K_diff.slice(0,3) ; 
	// var my_specularColor= my_Material.K_spec.slice(0,3) ;
	var my_specularColor=my_Material.K_spec.slice(0,3);
	var my_shininessVal=my_Material.K_shiny;

	// console.log("Ka:",my_ambientColor);
	console.log("Kd:",my_diffuseColor);
	console.log("Ks",my_specularColor);
	console.log("shininessVal",my_shininessVal);

	//bind

	gl.uniform1f(this.shininessVal,my_shininessVal);
	// gl.uniform3fv(this.ambientColor, my_ambientColor);
	gl.uniform3fv(this.diffuseColor, my_diffuseColor);
	gl.uniform3fv(this.specularColor, my_specularColor);


		gl.uniformMatrix4fv(this.g_modelMatLoc, false, this.g_modelMatrix.elements);
		gl.uniformMatrix4fv(this.u_NormalMatrix, false, this.normalMatrix.elements);
		gl.uniformMatrix4fv(this.u_NormalMatrix, false, this.normalMatrix.elements);
		  gl.drawArrays(gl.TRIANGLES,				// use this drawing primitive, and
			vbox2_tetStart/floatsPerVertex,	// start at this vertex number, and 
			my_tetrahedron.length/floatsPerVertex);	// draw this many vertices.
			popMatrix();
		this.g_modelMatrix=popMatrix();
	}
	
VBObox2.prototype.Drawhouse_partI=function(){
		pushMatrix(this.g_modelMatrix);  // SAVE world drawing coords.
		// this.g_modelMatrix.translate(0.2,0.2,0.2);
		  // Drawing:
		  // Pass our current matrix to the vertex shaders:
		  this.g_modelMatrix.rotate(90,0,1,0);
		  this.g_modelMatrix.scale(0.7,0.7,0.7);
		  	//Find inverse transpose of modelMatrix:
	this.normalMatrix.setInverseOf(this.g_modelMatrix);
	this.normalMatrix.transpose();

	my_Material=new Material(17);//6 MATL_BRASS
	// var my_ambientColor= my_Material.K_ambi.slice(0,3); 
	var my_diffuseColor= my_Material.K_diff.slice(0,3) ; 
	// var my_specularColor= my_Material.K_spec.slice(0,3) ;
	var my_specularColor=my_Material.K_spec.slice(0,3);
	var my_shininessVal=my_Material.K_shiny;

	// console.log("Ka:",my_ambientColor);
	console.log("Kd:",my_diffuseColor);
	console.log("Ks",my_specularColor);
	console.log("shininessVal",my_shininessVal);

	//bind

	gl.uniform1f(this.shininessVal,my_shininessVal);
	// gl.uniform3fv(this.ambientColor, my_ambientColor);
	gl.uniform3fv(this.diffuseColor, my_diffuseColor);
	gl.uniform3fv(this.specularColor, my_specularColor);


		gl.uniformMatrix4fv(this.g_modelMatLoc, false, this.g_modelMatrix.elements);
		gl.uniformMatrix4fv(this.u_NormalMatrix, false, this.normalMatrix.elements);
		  gl.drawArrays(gl.TRIANGLES,				// use this drawing primitive, and
			vbox2_cubStart/floatsPerVertex,	// start at this vertex number, and 
			my_cube.length/floatsPerVertex);	// draw this many vertices.
	}
	


	
VBObox2.prototype.Drawhouse_partII=function(){
		pushMatrix(this.g_modelMatrix);  // SAVE world drawing coords.
		// this.g_modelMatrix.translate(0.2,0.2,0.2);
		  // Drawing:
		  // Pass our current matrix to the vertex shaders:
	
		  this.g_modelMatrix.translate(0.5+0.125,0.20,0.25);
		  this.g_modelMatrix.scale(1,2,2);
		  this.g_modelMatrix.translate(0.125,0,0);
		  this.g_modelMatrix.scale(2,1,1);
		  	//Find inverse transpose of modelMatrix:
	this.normalMatrix.setInverseOf(this.g_modelMatrix);
	this.normalMatrix.transpose();

	my_Material=new Material(20);//6 MATL_BRASS
	// var my_ambientColor= my_Material.K_ambi.slice(0,3); 
	var my_diffuseColor= my_Material.K_diff.slice(0,3) ; 
	// var my_specularColor= my_Material.K_spec.slice(0,3) ;
	var my_specularColor=my_Material.K_spec.slice(0,3);
	var my_shininessVal=my_Material.K_shiny;

	// console.log("Ka:",my_ambientColor);
	console.log("Kd:",my_diffuseColor);
	console.log("Ks",my_specularColor);
	console.log("shininessVal",my_shininessVal);

	//bind

	gl.uniform1f(this.shininessVal,my_shininessVal);
	// gl.uniform3fv(this.ambientColor, my_ambientColor);
	gl.uniform3fv(this.diffuseColor, my_diffuseColor);
	gl.uniform3fv(this.specularColor, my_specularColor);


		gl.uniformMatrix4fv(this.g_modelMatLoc, false, this.g_modelMatrix.elements);
		gl.uniformMatrix4fv(this.u_NormalMatrix, false, this.normalMatrix.elements);
		  gl.drawArrays(gl.TRIANGLES,				// use this drawing primitive, and
			vbox2_tetStart/floatsPerVertex,	// start at this vertex number, and 
			my_tetrahedron.length/floatsPerVertex);	// draw this many vertices.
			popMatrix();
		this.g_modelMatrix=popMatrix();
	}



	
	
VBObox2.prototype.Drawcube=function(){
		pushMatrix(this.g_modelMatrix);  // SAVE world drawing coords.
		// this.g_modelMatrix.translate(0.2,0.2,0.2);
		  // Drawing:
		  // Pass our current matrix to the vertex shaders:
		  this.g_modelMatrix.rotate(90,0,1,0);

	//Find inverse transpose of modelMatrix:
	this.normalMatrix.setInverseOf(this.g_modelMatrix);
	this.normalMatrix.transpose();

	my_Material=new Material(6);//6 MATL_BRASS
	// var my_ambientColor= my_Material.K_ambi.slice(0,3); 
	var my_diffuseColor= my_Material.K_diff.slice(0,3) ; 
	// var my_specularColor= my_Material.K_spec.slice(0,3) ;
	var my_specularColor=my_Material.K_spec.slice(0,3);
	var my_shininessVal=my_Material.K_shiny;

	// console.log("Ka:",my_ambientColor);
	console.log("Kd:",my_diffuseColor);
	console.log("Ks",my_specularColor);
	console.log("shininessVal",my_shininessVal);

	//bind

	gl.uniform1f(this.shininessVal,my_shininessVal);
	// gl.uniform3fv(this.ambientColor, my_ambientColor);
	gl.uniform3fv(this.diffuseColor, my_diffuseColor);
	gl.uniform3fv(this.specularColor, my_specularColor);


		gl.uniformMatrix4fv(this.g_modelMatLoc, false, this.g_modelMatrix.elements);
		gl.uniformMatrix4fv(this.u_NormalMatrix, false, this.normalMatrix.elements);
		  gl.drawArrays(gl.TRIANGLES,				// use this drawing primitive, and
			vbox1_cubStart/floatsPerVertex,	// start at this vertex number, and 
			my_cube.length/floatsPerVertex);	// draw this many vertices.
		this.g_modelMatrix= popMatrix();//get to head	
	}	
	
	
VBObox2.prototype.Drawhourglass=function(){
		this.Drawhourglass_partI();
		this.Drawhourglass_partII();
	
	}
	
	
VBObox2.prototype.Drawpokeball=function(){
	this.Drawpokeball_partI();
	this.Drawpokeball_partII();
	this.Drawpokeball_partIII();
	}
VBObox2.prototype.Drawhouse=function(){
	
	this.Drawhouse_partI();
	this.Drawhouse_partII();
	
	}

VBObox2.prototype.Drawpikachu=function(){

		//on head part
		this.DrawHead();
		this.Drawlefteyes();
		this.Drawlefteyes_white();
		this.Drawrighteyes();
		this.Drawrighteyes_white();
		this.Drawnose();
		this.Drawleftmouth();
		this.Drawrightmouth();
		this.DrawleftBlush();
		this.DrawleftBlush_left();
		this.DrawrightBlush();
		this.DrawrightBlush_left();
		this.Drawlefteye_brown();
		this.Drawrighteye_brown();
		//left_ear
		this.Drawleftearpart1();
		this.Drawleftearpart2();
		this.Drawleftearpart3();
		this.Drawleftearpart4();
		//right_ear
		this.Drawrightearpart1();
		this.Drawrightearpart2();
		this.Drawrightearpart3();
		this.Drawrightearpart4();
		//tail
		this.Drawtailpart1();
		this.Drawtailpart2();
		this.Drawtailpart3();
		this.Drawtailpart4();
		
		}
		

