//3456789_123456789_123456789_123456789_123456789_123456789_123456789_123456789_
// (JT: why the numbers? counts columns, helps me keep 80-char-wide listings)
//
// Chapter 5: ColoredTriangle.js (c) 2012 matsuda  AND
// Chapter 4: RotatingTriangle_withButtons.js (c) 2012 matsuda AND
// Chapter 2: ColoredPoints.js (c) 2012 matsuda
//
// merged and modified to became:
//
// ControlMulti.js for EECS 351-1, 
//									Northwestern Univ. Jack Tumblin

//		--converted from 2D to 4D (x,y,z,w) vertices
//		--demonstrate how to keep & use MULTIPLE colored shapes 
//			in just one Vertex Buffer Object(VBO).
//		--demonstrate several different user I/O methods: 
//				--Webpage pushbuttons 
//				--Webpage edit-box text, and 'innerHTML' for text display
//				--Mouse click & drag within our WebGL-hosting 'canvas'
//				--Keyboard input: alphanumeric + 'special' keys (arrows, etc)
//


// Global Variables
// =========================
// Use globals to avoid needlessly complex & tiresome function argument lists,
// and for user-adjustable controls.
// For example, the WebGL rendering context 'gl' gets used in almost every fcn;
// requiring 'gl' as an argument won't give us any added 'encapsulation'; make
// it global.  Later, if the # of global vars grows too large, we can put them 
// into one (or just a few) sensible global objects for better modularity.
//------------For WebGL-----------------------------------------------
var gl;           // webGL Rendering Context. Set in main(), used everywhere.
var g_canvas = document.getElementById('webgl');     



// For multiple VBOs & Shaders:-----------------
worldBox = new VBObox0();		  // Holds VBO & shaders for 3D 'world' ground-plane grid, etc;
gouraudBox = new VBObox1();		  // "  "  for first set of custom-shaded 3D parts
phongBox = new VBObox2();     // "  "  for second set of custom-shaded 3D parts


// For mouse/keyboard:------------------------
var g_show0 = 1;								// 0==Show, 1==Hide VBO0 contents on-screen.
var g_show1 = 1;								// 	"					"			VBO1		"				"				" 
var g_show2 = 1;                //  "         "     VBO2    "       "       "

                  // our HTML-5 canvas object that uses 'gl' for drawing.
                  
// ----------For tetrahedron & its matrix---------------------------------
var g_vertsMax = 0;                 // number of vertices held in the VBO 
                                    // (global: replaces local 'n' variable)



//------------For Animation---------------------------------------------
var g_isRun = true;                 // run/stop for animation; used in tick().
var g_lastMS = Date.now();    			// Timestamp for most-recently-drawn image; 
                                    // in milliseconds; used by 'animate()' fcn 
                                    // (now called 'timerAll()' ) to find time
                                    // elapsed since last on-screen image.
var g_angle01 = 0;                  // initial rotation angle
var g_angle01Rate = 45.0;           // rotation speed, in degrees/second 

var g_angle02 = 0;                  // initial rotation angle
var g_angle02Rate = 40.0;           // rotation speed, in degrees/second 

var g_angle03 = 0;                  // initial rotation angle
var g_angle03Rate = 40.0;           // rotation speed, in degrees/second 

var g_angle04 = 0;                  // initial rotation angle
var g_angle04Rate = 22.5;           // rotation speed, in degrees/second 

var g_angle05 = 0;                  // initial rotation angle
var g_angle05Rate = 15;           // rotation speed, in degrees/second 

var g_angle06 = 0;                  // initial rotation angle
var g_angle06Rate = 10;           // rotation speed, in degrees/second 


var g_angle07 = 0;                  // initial rotation angle
var g_angle07Rate = 10;           // rotation speed, in degrees/second 

var g_angle08 = 0;                  // initial rotation angle
var g_angle08Rate = 45;           // rotation speed, in degrees/second 

  // All time-dependent params (you can add more!)
  var g_angleNow0  =  0.0; 			  // Current rotation angle, in degrees.
  var g_angleRate0 = 45.0;				// Rotation angle rate, in degrees/second.
								  //---------------
  var g_angleNow1  = 100.0;       // current angle, in degrees
  var g_angleRate1 =  95.0;        // rotation angle rate, degrees/sec
  var g_angleMax1  = 150.0;       // max, min allowed angle, in degrees
  var g_angleMin1  =  60.0;
								  //---------------
  var g_angleNow2  =  0.0; 			  // Current rotation angle, in degrees.
  var g_angleRate2 = -62.0;				// Rotation angle rate, in degrees/second.
  

//------------For position -------------------------------
var g_posNow0 =  0.0;           // current position
var g_posRate0 = 0.6;           // position change rate, in distance/second.
var g_posMax0 =  0.5;           // max, min allowed for g_posNow;
var g_posMin0 = -0.5;           
                                // ------------------
var g_posNow1 =  0.0;           // current position
var g_posRate1 = 0.5;           // position change rate, in distance/second.
var g_posMax1 =  1.0;           // max, min allowed positions
var g_posMin1 = -1.0;
                                //---------------


//------------For mouse click-and-drag: -------------------------------
var g_isDrag=false;		// mouse-drag: true when user holds down mouse button
var g_xMclik=0.0;			// last mouse button-down position (in CVV coords)
var g_yMclik=0.0;   
var g_xMdragTot=0.0;	// total (accumulated) mouse-drag amounts (in CVV coords).
var g_yMdragTot=0.0; 
var g_digits=5;			// DIAGNOSTICS: # of digits to print in console.log (
									//    console.log('xVal:', xVal.toFixed(g_digits)); // print 5 digits	


//------------For material-------------------------------
var material_code=20;

//------------For quarternion -------------------------------
var qNew = new Quaternion(0,0,0,1); // most-recent mouse drag's rotation
var qTot = new Quaternion(0,0,0,1);	// 'current' orientation (made from qNew)

var quatMatrix = new Matrix4();	// rotation matrix, made from latest qTot

//------------For camera------------------------------
// this.g_modelMatrix.lookAt(-4,-4, 4, 0, 0, 0, 0,0 ,1);
var eyex=-3.5;
var eyey=-3.5;
var eyez=3.5;
var aimx;
var aimy;
var aimz;
var angle=2*Math.PI/360*30;
var tilt=-0.6;			


//------------For light-----------------------------
// this.g_modelMatrix.lookAt(-4,-4, 4, 0, 0, 0, 0,0 ,1);
var lightx=-5;
var lighty=-5;
var lightz=3;
var my_light_status=1;
var my_phong_status=1;
var my_phong_status2=1;
var light_Ambient=[1.0,1.0,1.0];
var light_Diffuse=[1.0,1.0,1.0];
var light_Specular=[1.0,1.0,1.0];

									
//------------For keyboard -------------------------------

var moveFWD=false;
var movepacex=0.0;
var movepacey=0.0;
var movepacez=0.0;
var movepacey=0.0;


//------------For movetmp -------------------------------

var myTmp_1=0.0;
var myTmp_3=0.0;
var myTmp_4=0.0;
var myTmp_5=0.0;
var myTmp_6=0.0;



function main() {
//==============================================================================
/*REPLACED THIS: 
// Retrieve <canvas> element:
 var canvas = document.getElementById('webgl'); 
//with global variable 'g_canvas' declared & set above.
*/
  
  // Get gl, the rendering context for WebGL, from our 'g_canvas' object
  gl = g_canvas.getContext("webgl", { preserveDrawingBuffer: true});


  if (!gl) {
    console.log('Failed to get the rendering context for WebGL');
    return;
  }
	window.addEventListener("keydown", myKeyDown, false);

	window.addEventListener("keyup", myKeyUp, false);

	window.addEventListener("mousedown", myMouseDown); 
	// (After each 'mousedown' event, browser calls the myMouseDown() fcn.)
  window.addEventListener("mousemove", myMouseMove); 
	window.addEventListener("mouseup", myMouseUp);	
	window.addEventListener("click", myMouseClick);				
	window.addEventListener("dblclick", myMouseDblClick); 

  gl.clearColor(0.3, 0.3, 0.3, 1.0);
	// // NEW!! Enable 3D depth-test when drawing: don't over-draw at any pixel 
	// // unless the new Z value is closer to the eye than the old one..
	// gl.depthFunc(gl.LESS);
	// gl.enable(gl.DEPTH_TEST); 	  
//test depth, if it is without camera
// gl.enable(gl.DEPTH_TEST); // enabled by default, but let's be SURE.

// gl.clearDepth(0.0);       // each time we 'clear' our depth buffer, set all
// 						  // pixel depths to 0.0  (1.0 is DEFAULT)
// gl.depthFunc(gl.GREATER); // draw a pixel only if its depth value is GREATER


  // Initialize each of our 'vboBox' objects: 
  worldBox.init(gl);		// VBO + shaders + uniforms + attribs for our 3D world,
                        // including ground-plane,                       
  gouraudBox.init(gl);		//  "		"		"  for 1st kind of shading & lighting
  phongBox.init(gl);    //  "   "   "  for 2nd kind of shading & lighting	

  gl.clearColor(0.2, 0.2, 0.2, 1);	  // RGBA color for clearing <canvas>

drawResize();  
  
  var tick = function() {
    animate();   // Update the rotation angle
    drawAll();   // Draw all parts
	var temp=new Material(material_code);

	document.getElementById('CurAngleDisplayForMiniModel').innerHTML= 
			'Current material for Phong shading sphere= '+material_code+'('+temp.K_name+')';

    requestAnimationFrame(tick, g_canvas);   
    									// Request that the browser re-draw the webpage
    									// (causes webpage to endlessly re-draw itself)
  };
  tick();							// start (and continue) animation: draw current image
	
}

function drawAll() {
//==============================================================================
  // Clear <canvas>  colors AND the depth buffer
  gl.clear(gl.COLOR_BUFFER_BIT | gl.DEPTH_BUFFER_BIT);
  
// Great question from student:
// "?How can I get the screen-clearing color (or any of the many other state
//		variables of OpenGL)?  'glGet()' doesn't seem to work..."
// ANSWER: from WebGL specification page: 
//							https://www.khronos.org/registry/webgl/specs/1.0/
//	search for 'glGet()' (ctrl-f) yields:
//  OpenGL's 'glGet()' becomes WebGL's 'getParameter()'

if(g_show0 == 1) {	// IF user didn't press HTML button to 'hide' VBO0:
	worldBox.switchToMe();  // Set WebGL to render from this VBObox.
	  worldBox.adjust();		  // Send new values for uniforms to the GPU, and
	  worldBox.draw();			  // draw our VBO's contents using our shaders.
}
if(g_show1 == 1) { // IF user didn't press HTML button to 'hide' VBO1:
	gouraudBox.switchToMe();  // Set WebGL to render from this VBObox.
	gouraudBox.adjust();		  // Send new values for uniforms to the GPU, and
	gouraudBox.draw();			  // draw our VBO's contents using our shaders.
	}
  if(g_show2 == 1) { // IF user didn't press HTML button to 'hide' VBO2:
	phongBox.switchToMe();  // Set WebGL to render from this VBObox.
	phongBox.adjust();		  // Send new values for uniforms to the GPU, and
	phongBox.draw();			  // draw our VBO's contents using our shaders.
	}



}


function lightTurnOn(){
	if(my_light_status != 1) my_light_status = 1;				// show,
	else my_light_status = 0;										// hide.
	console.log('my_light_status: '+my_light_status);
}

function VBO0toggle() {
	//=============================================================================
	// Called when user presses HTML-5 button 'Show/Hide VBO0'.
	  if(g_show0 != 1) g_show0 = 1;				// show,
	  else g_show0 = 0;										// hide.
	  console.log('g_show0: '+g_show0);

	}

function Phong() {
		//=============================================================================
		// Called when user presses HTML-5 button 'Show/Hide VBO1'.
		  if(my_phong_status != 1) my_phong_status = 1;			// show,
		  else my_phong_status = 0;									// hide.
		  console.log('my_lightning_status: '+my_phong_status);
}
function Phong2() {
	//=============================================================================
	// Called when user presses HTML-5 button 'Show/Hide VBO1'.
	  if(my_phong_status2 != 1) my_phong_status2 = 1;			// show,
	  else my_phong_status2 = 0;									// hide.
	  console.log('my_lightning_status: '+my_phong_status2);
}


function VBO1toggle() {
		//=============================================================================
		// Called when user presses HTML-5 button 'Show/Hide VBO1'.
		  if(g_show1 != 1) g_show1 = 1;			// show,
		  else g_show1 = 0;									// hide.
		  console.log('g_show1: '+g_show1);
}
		
function VBO2toggle() {
		//=============================================================================
		// Called when user presses HTML-5 button 'Show/Hide VBO2'.
		  if(g_show2 != 1) g_show2 = 1;			// show,
		  else g_show2 = 0;									// hide.
		  console.log('g_show2: '+g_show2);
}
		

function drawResize() {
	//==============================================================================
	// Called when user re-sizes their browser window , because our HTML file
	// contains:  <body onload="main()" onresize="winResize()">
	
		//Report our current browser-window contents:
	
		console.log('g_Canvas width,height=', g_canvas.width, g_canvas.height);		
	 console.log('Browser window: innerWidth,innerHeight=', 
																	innerWidth, innerHeight);	
																	// http://www.w3schools.com/jsref/obj_window.asp
	
		
		//Make canvas fill the top 3/4 of our browser window:
		var xtraMargin = 16;    // keep a margin (otherwise, browser adds scroll-bars)
		g_canvas.width = innerWidth - xtraMargin;
		g_canvas.height = (innerHeight*3/4) - xtraMargin;
		// IMPORTANT!  Need a fresh drawing in the re-sized viewports.
		drawAll();				// draw in all viewports.
	}
// function perspective(){
// 	 var vpAspect = g_canvas.width/2 /			// On-screen aspect ratio for
// 	 (g_canvas.height/2);	// this camera: width/height.
// 	// this.g_modelMatrix.setPerspective(40, vpAspect, 1, 1000);	// near, far (always >0).
// 	this.g_modelMatrix.setPerspective(35,vpAspect, 1, 30.0);
// }
// Last time that this function was called:  (used for animation timing)
var g_last = Date.now();

function animate() {
//==============================================================================
  // Calculate the elapsed time
  var now = Date.now();
  var elapsed = now - g_last;
  g_last = now;

  var nowMS = Date.now();             // current time (in milliseconds)
  var elapsedMS = nowMS - g_lastMS;   // 
  g_lastMS = nowMS;                   // update for next webGL drawing.
  if(elapsedMS > 1000.0) {            
    // Browsers won't re-draw 'canvas' element that isn't visible on-screen 
    // (user chose a different browser tab, etc.); when users make the browser
    // window visible again our resulting 'elapsedMS' value has gotten HUGE.
    // Instead of allowing a HUGE change in all our time-dependent parameters,
    // let's pretend that only a nominal 1/30th second passed:
    elapsedMS = 1000.0/30.0;
    }
  // Find new time-dependent parameters using the current or elapsed time:
  // Continuous rotation:
  g_angleNow0 = g_angleNow0 + (g_angleRate0 * elapsedMS) / 1000.0;
  g_angleNow1 = g_angleNow1 + (g_angleRate1 * elapsedMS) / 1000.0;
  g_angleNow2 = g_angleNow2 + (g_angleRate2 * elapsedMS) / 1000.0;
  g_angleNow0 %= 360.0;   // keep angle >=0.0 and <360.0 degrees  
  g_angleNow1 %= 360.0;   
  g_angleNow2 %= 360.0;
  if(g_angleNow1 > g_angleMax1) { // above the max?
    g_angleNow1 = g_angleMax1;    // move back down to the max, and
    g_angleRate1 = -g_angleRate1; // reverse direction of change.
    }
  else if(g_angleNow1 < g_angleMin1) {  // below the min?
    g_angleNow1 = g_angleMin1;    // move back up to the min, and
    g_angleRate1 = -g_angleRate1;
    }
  // Continuous movement:
  g_posNow0 += g_posRate0 * elapsedMS / 1000.0;
  g_posNow1 += g_posRate1 * elapsedMS / 1000.0;
  // apply position limits
  if(g_posNow0 > g_posMax0) {   // above the max?
    g_posNow0 = g_posMax0;      // move back down to the max, and
    g_posRate0 = -g_posRate0;   // reverse direction of change
    }
  else if(g_posNow0 < g_posMin0) {  // or below the min? 
    g_posNow0 = g_posMin0;      // move back up to the min, and
    g_posRate0 = -g_posRate0;   // reverse direction of change.
    }
  if(g_posNow1 > g_posMax1) {   // above the max?
    g_posNow1 = g_posMax1;      // move back down to the max, and
    g_posRate1 = -g_posRate1;   // reverse direction of change
    }
  else if(g_posNow1 < g_posMin1) {  // or below the min? 
    g_posNow1 = g_posMin1;      // move back up to the min, and
    g_posRate1 = -g_posRate1;   // reverse direction of change.
    }









  //from right to left
  g_angle01 = g_angle01 + (g_angle01Rate * elapsed) / 1000.0;
  if(g_angle01 > 180.0) g_angle01 = g_angle01 - 360.0;
  if(g_angle01 <-180.0) g_angle01 = g_angle01 + 360.0;

	g_angle02 = g_angle02 + (g_angle02Rate * elapsed) / 1000.0;
  if(g_angle02 > 180.0) g_angle02 = g_angle02 - 360.0;
  if(g_angle02 <-180.0) g_angle02 = g_angle02 + 360.0;
  
  if(g_angle02 > 45.0 && g_angle02Rate > 0) g_angle02Rate *= -1.0;
  if(g_angle02 < 0.0  && g_angle02Rate < 0) g_angle02Rate *= -1.0;



  // Update the current rotation angle (adjusted by the elapsed time)
  //  limit the angle to move smoothly between +55 and -25 degrees:
  if(g_angle03>   55.0 && g_angle03Rate > 0)g_angle03Rate= -g_angle03Rate;
  if(g_angle03 <  -25.0 && g_angle03Rate < 0) g_angle03Rate= -g_angle03Rate;

  g_angle03= [g_angle03 + (g_angle03Rate * elapsed) / 1000.0]%360;

  // Update the current rotation angle (adjusted by the elapsed time)
  //  limit the angle to move smoothly between +25 and -20 degrees:
  if(g_angle04>   25.0 && g_angle04Rate > 0)g_angle04Rate= -g_angle04Rate;
  if(g_angle04 <  -20.0 && g_angle04Rate < 0) g_angle04Rate= -g_angle04Rate;
  g_angle04= [g_angle04 + (g_angle04Rate * elapsed) / 1000.0]%360;

  
  // Update the current rotation angle (adjusted by the elapsed time)
  //  limit the angle to move smoothly between +15and -15 degrees:
  if(g_angle05>   15.0&& g_angle05Rate > 0)g_angle05Rate= -g_angle05Rate;
  if(g_angle05 <  -15.0 && g_angle05Rate < 0) g_angle05Rate= -g_angle05Rate;
  g_angle05= [g_angle05 + (g_angle05Rate * elapsed) / 1000.0]%360;


    //  limit the angle to move smoothly between 0 and -20 degrees:
  if(g_angle06>   0.0 && g_angle06Rate > 0)g_angle06Rate= -g_angle06Rate;
    if(g_angle06 <  -20.0 && g_angle06Rate < 0) g_angle06Rate= -g_angle06Rate;
 		g_angle06= [g_angle06 + (g_angle06Rate * elapsed) / 1000.0]%360;

   //  limit the angle to move smoothly between 0 and -20 degrees:
   if(g_angle07>   0.0 && g_angle07Rate > 0)g_angle07Rate= -g_angle07Rate;
   if(g_angle07 <  -20.0 && g_angle07Rate < 0) g_angle07Rate= -g_angle07Rate;
		g_angle07= [g_angle07 + (g_angle07Rate * elapsed) / 1000.0]%360;


		g_angle08 = g_angle08 + (g_angle08Rate * elapsed) / 1000.0;
		if(g_angle08 > 180.0) g_angle08 = g_angle08 - 360.0;
		if(g_angle08 <-180.0) g_angle08 = g_angle08 + 360.0;

}

//==================HTML Button Callbacks======================

function Material_submit() {

// Read HTML edit-box contents:
	var UsrTxt = document.getElementById('usrMaterial').value;	
// Display what we read from the edit-box: use it to fill up
// the HTML 'div' element with id='editBoxOut':

  document.getElementById('EditBoxOut').innerHTML ='You Typed: '+UsrTxt;
  console.log('angleSubmit: UsrTxt:', UsrTxt); // print in console, and
//   g_angle01 = parseFloat(UsrTxt);     // convert string to float number 
	material_code=parseInt(UsrTxt);
};
function hexToRgb(hex) {
	var temp=[];
	var red = parseInt(hex[1]+hex[2],16);
	var green = parseInt(hex[3]+hex[4],16);
	var blue = parseInt(hex[5]+hex[6],16);
	temp.push(red);
	temp.push(green);
	temp.push(blue);
	console.log(temp);
	return temp
  }

function show_lightvalue0(x){

	lightx=x;
	document.getElementById("slider_value0").innerHTML="x:"+lightx;
}
function show_lightvalue1(y){
	lighty=y;
	document.getElementById("slider_value1").innerHTML="y:"+lighty;
	
}
function show_lightvalue2(z){
	lightz=z;
	document.getElementById("slider_value2").innerHTML="z:"+lightz;
}

function change_lightAmbient(x){
	var temp=hexToRgb(x);
	var temp_x=temp[0]/255;
	var temp_y=temp[1]/255;
	var temp_z=temp[2]/255;
	light_Ambient=[temp_x,temp_y,temp_z];

	document.getElementById("light_value0").innerHTML="A_val:"+	temp;
}
function change_lightDiffuse(x){
	var temp=hexToRgb(x);
	var temp_x=temp[0]/255;
	var temp_y=temp[1]/255;
	var temp_z=temp[2]/255;
	light_Diffuse=[temp_x,temp_y,temp_z];
	document.getElementById("light_value1").innerHTML="D_val:"+temp;
}
function change_lightSpecular(x){
	var temp=hexToRgb(x);
	var temp_x=temp[0]/255;
	var temp_y=temp[1]/255;
	var temp_z=temp[2]/255;
	light_Specular=[temp_x,temp_y,temp_z];
	document.getElementById("light_value2").innerHTML="S_val:"+temp;
}



function clearDrag() {
// Called when user presses 'Clear' button in our webpage
	g_xMdragTot = 0.0;
	g_yMdragTot = 0.0;
}

function spinUp() {
// Called when user presses the 'Spin >>' button on our webpage.
// ?HOW? Look in the HTML file (e.g. ControlMulti.html) to find
// the HTML 'button' element with onclick='spinUp()'.


  //for g_angle03Rate
	if(g_angle03Rate<0){
		g_angle03Rate-=20;		
	}else{
		g_angle03Rate+=20;
	};

	//for g_angle04Rate
	 if(g_angle04Rate<0){
		g_angle04Rate-=11.25;
	}else{
		g_angle04Rate+=11.25;
	}
  //for g_angle05Rate
  if(g_angle05Rate<0){
		g_angle05Rate-=7.5;
	}else{
		g_angle05Rate+=7.5;
	}
    //for g_angle06Rate
	if(g_angle06Rate<0){
		g_angle06Rate-=5;
	}else{
		g_angle06Rate+=5;
	}
}
//For minimodel
function spinUpForMiniModel(){
	g_angle01Rate += 25; 
}
function spinDown() {
// Called when user presses the 'Spin <<' button


	//for g_angle03Rate
	if(g_angle03Rate<0){
		g_angle03Rate+=20;		
	}else if(g_angle03Rate>0){
		g_angle03Rate-=20;
	}

	//for g_angle04Rate
	if(g_angle04Rate<0){
		g_angle04Rate+=11.25;
	}else if(g_angle04Rate>0){
		g_angle04Rate-=11.25;
	}
	//for g_angle05Rate
	if(g_angle05Rate<0){
		g_angle05Rate+=7.5;
	}else if(g_angle05Rate>0){
		g_angle05Rate-=7.5;
	}
	//for g_angle06Rate
	if(g_angle06Rate<0){
		g_angle06Rate+=5;
	}else if(g_angle06Rate>0){
		g_angle06Rate-=5;
	}

}
function spinDownForMiniModel(){
	g_angle01Rate -= 25; 
}

function runStop() {
// Called when user presses the 'Run/Stop' button

	//if g_angle03Rate^2>1, so it is not zero
	if(g_angle03Rate*g_angle03Rate>1){
		myTmp_3 = g_angle03Rate;  // store the current rate,
		g_angle03Rate=0;	
	}else{
		//when it is zero
		g_angle03Rate=myTmp_3;
	}
	//if g_angle04Rate^2>1, so it is not zero
	if(g_angle04Rate*g_angle04Rate>1){
		myTmp_4 = g_angle04Rate;  // store the current rate,
		g_angle04Rate=0;
	}else{
		//when it is zero
		g_angle04Rate=myTmp_4;
	}


	//if g_angle05Rate^2>1, so it is not zero
	if(g_angle05Rate*g_angle05Rate>1){
		myTmp_5 = g_angle05Rate;  // store the current rate,
		g_angle05Rate=0;
	}else{
		//when it is zero
		g_angle05Rate=myTmp_5;
	}

	//if g_angle06Rate^2>1, so it is not zero
	if(g_angle06Rate*g_angle06Rate>1){
		myTmp_6 = g_angle06Rate;  // store the current rate,
		g_angle06Rate=0;
	}else{
		//when it is zero
		g_angle06Rate=myTmp_6;
	}

		// //if g_angle05Rate^2>1, so it is not zero
		// if(g_angle07Rate*g_angle07Rate>1){
		// 	myTmp_7 = g_angle07Rate;  // store the current rate,
		// 	g_angle07Rate=0;
		// }else{
		// 	//when it is zero
		// 	g_angle07Rate=myTmp_7;
		// }

	//if any one of them is decresed to 0 becasue of spin, when use stop, they all get to zero;
	if(g_angle03Rate*g_angle04Rate*g_angle05Rate*g_angle06Rate==0){
		g_angle03Rate = 0;
		g_angle04Rate = 0;
		g_angle05Rate = 0;
		g_angle06Rate = 0;
	}

}
function runStopForMiniModel(){

	if(g_angle01Rate*g_angle01Rate > 1) {  // if nonzero rate,
		myTmp_1 = g_angle01Rate;  // store the current rate,
		g_angle01Rate = 0;      // and set to zero.
	}
	else{    
		// but if rate is zero,
		g_angle01Rate = myTmp_1;  // use the stored rate.

	}


}

//===================Mouse and Keyboard event-handling Callbacks

function myMouseDown(ev) {
//==============================================================================
// Called when user PRESSES down any mouse button;
// 									(Which button?    console.log('ev.button='+ev.button);   )
// 		ev.clientX, ev.clientY == mouse pointer location, but measured in webpage 
//		pixels: left-handed coords; UPPER left origin; Y increases DOWNWARDS (!)  

// Create right-handed 'pixel' coords with origin at WebGL canvas LOWER left;
  var rect = ev.target.getBoundingClientRect();	// get canvas corners in pixels
  var xp = ev.clientX - rect.left;									// x==0 at canvas left edge
  var yp = g_canvas.height - (ev.clientY - rect.top);	// y==0 at canvas bottom edge
//  console.log('myMouseDown(pixel coords): xp,yp=\t',xp,',\t',yp);
  
	// Convert to Canonical View Volume (CVV) coordinates too:
  var x = (xp - g_canvas.width/2)  / 		// move origin to center of canvas and
  						 (g_canvas.width/2);			// normalize canvas to -1 <= x < +1,
	var y = (yp - g_canvas.height/2) /		//										 -1 <= y < +1.
							 (g_canvas.height/2);
//	console.log('myMouseDown(CVV coords  ):  x, y=\t',x,',\t',y);
	
	g_isDrag = true;											// set our mouse-dragging flag
	g_xMclik = x;													// record where mouse-dragging began
	g_yMclik = y;
	// report on webpage
	// document.getElementById('MouseAtResult').innerHTML = 
	//   'Pikachu waited until u drag  '+x.toFixed(g_digits)+', '+y.toFixed(g_digits);
};


function myMouseMove(ev) {
//==============================================================================
// Called when user MOVES the mouse with a button already pressed down.
// 									(Which button?   console.log('ev.button='+ev.button);    )
// 		ev.clientX, ev.clientY == mouse pointer location, but measured in webpage 
//		pixels: left-handed coords; UPPER left origin; Y increases DOWNWARDS (!)  

	if(g_isDrag==false) return;				// IGNORE all mouse-moves except 'dragging'

	// Create right-handed 'pixel' coords with origin at WebGL canvas LOWER left;
  var rect = ev.target.getBoundingClientRect();	// get canvas corners in pixels
  var xp = ev.clientX - rect.left;									// x==0 at canvas left edge
	var yp = g_canvas.height - (ev.clientY - rect.top);	// y==0 at canvas bottom edge
//  console.log('myMouseMove(pixel coords): xp,yp=\t',xp,',\t',yp);
  
	// Convert to Canonical View Volume (CVV) coordinates too:
  var x = (xp - g_canvas.width/2)  / 		// move origin to center of canvas and
  						 (g_canvas.width/2);		// normalize canvas to -1 <= x < +1,
	var y = (yp - g_canvas.height/2) /		//									-1 <= y < +1.
							 (g_canvas.height/2);
//	console.log('myMouseMove(CVV coords  ):  x, y=\t',x,',\t',y);

	// find how far we dragged the mouse:
	g_xMdragTot += (x - g_xMclik);			// Accumulate change-in-mouse-position,&
	g_yMdragTot += (y - g_yMclik);

	// AND use any mouse-dragging we found to update quaternions qNew and qTot.
	dragQuat(x - g_xMclik, y - g_yMclik);

	// // Report new mouse position & how far we moved on webpage:
	// document.getElementById('MouseAtResult').innerHTML = 
	//   'Pikachu is wandering around. Your location is '+x.toFixed(g_digits)+', '+y.toFixed(g_digits);

	g_xMclik = x;											// Make next drag-measurement from here.
	g_yMclik = y;
};

function myMouseUp(ev) {
//==============================================================================
// Called when user RELEASES mouse button pressed previously.
// 									(Which button?   console.log('ev.button='+ev.button);    )
// 		ev.clientX, ev.clientY == mouse pointer location, but measured in webpage 
//		pixels: left-handed coords; UPPER left origin; Y increases DOWNWARDS (!)  

// Create right-handed 'pixel' coords with origin at WebGL canvas LOWER left;
  var rect = ev.target.getBoundingClientRect();	// get canvas corners in pixels
  var xp = ev.clientX - rect.left;									// x==0 at canvas left edge
	var yp = g_canvas.height - (ev.clientY - rect.top);	// y==0 at canvas bottom edge
//  console.log('myMouseUp  (pixel coords):\n\t xp,yp=\t',xp,',\t',yp);

	// Convert to Canonical View Volume (CVV) coordinates too:
  var x = (xp - g_canvas.width/2)  / 		// move origin to center of canvas and
  						 (g_canvas.width/2);			// normalize canvas to -1 <= x < +1,
	var y = (yp - g_canvas.height/2) /		//										 -1 <= y < +1.
							 (g_canvas.height/2);
	console.log('myMouseUp  (CVV coords  ):\n\t x, y=\t',x,',\t',y);
	
	g_isDrag = false;											// CLEAR our mouse-dragging flag, and
	// accumulate any final bit of mouse-dragging we did:
	g_xMdragTot += (x - g_xMclik);
	g_yMdragTot += (y - g_yMclik);

	// AND use any mouse-dragging we found to update quaternions qNew and qTot;
	dragQuat(x - g_xMclik, y - g_yMclik);
	// Report new mouse position:
	// document.getElementById('MouseAtResult').innerHTML = 
	//   'Pika Pika? Your location is '+x.toFixed(g_digits)+', '+y.toFixed(g_digits);
	console.log('myMouseUp: g_xMdragTot,g_yMdragTot =',
		g_xMdragTot.toFixed(g_digits),',\t',g_yMdragTot.toFixed(g_digits));
};

function myMouseClick(ev) {
//=============================================================================
// Called when user completes a mouse-button single-click event 
// (e.g. mouse-button pressed down, then released)
// 									   
//    WHICH button? try:  console.log('ev.button='+ev.button); 
// 		ev.clientX, ev.clientY == mouse pointer location, but measured in webpage 
//		pixels: left-handed coords; UPPER left origin; Y increases DOWNWARDS (!) 
//    See myMouseUp(), myMouseDown() for conversions to  CVV coordinates.

  // STUB
	console.log("myMouseClick() on button: ", ev.button); 
}	

function myMouseDblClick(ev) {
//=============================================================================
// Called when user completes a mouse-button double-click event 
// 									   
//    WHICH button? try:  console.log('ev.button='+ev.button); 
// 		ev.clientX, ev.clientY == mouse pointer location, but measured in webpage 
//		pixels: left-handed coords; UPPER left origin; Y increases DOWNWARDS (!) 
//    See myMouseUp(), myMouseDown() for conversions to  CVV coordinates.

  // STUB
	console.log("myMouse-DOUBLE-Click() on button: ", ev.button); 
}	

function myKeyDown(kev) {
//===============================================================================
// Called when user presses down ANY key on the keyboard;
//
// For a light, easy explanation of keyboard events in JavaScript,
// see:    http://www.kirupa.com/html5/keyboard_events_in_javascript.htm
// For a thorough explanation of a mess of JavaScript keyboard event handling,
// see:    http://javascript.info/tutorial/keyboard-events
//
// NOTE: Mozilla deprecated the 'keypress' event entirely, and in the
//        'keydown' event deprecated several read-only properties I used
//        previously, including kev.charCode, kev.keyCode. 
//        Revised 2/2019:  use kev.key and kev.code instead.
//
// Report EVERYTHING in console:
  console.log(  "--kev.code:",    kev.code,   "\t\t--kev.key:",     kev.key, 
              "\n--kev.ctrlKey:", kev.ctrlKey,  "\t--kev.shiftKey:",kev.shiftKey,
              "\n--kev.altKey:",  kev.altKey,   "\t--kev.metaKey:", kev.metaKey);

// and report EVERYTHING on webpage:
	// document.getElementById('KeyDownResult').innerHTML = ''; // clear old results
 	//  document.getElementById('KeyModResult' ).innerHTML = ''; 
  // key details:
//   document.getElementById('KeyModResult' ).innerHTML = 
//         "   --kev.code:"+kev.code   +"      --kev.key:"+kev.key+
//     "<br>--kev.ctrlKey:"+kev.ctrlKey+" --kev.shiftKey:"+kev.shiftKey+
//     "<br>--kev.altKey:"+kev.altKey +"  --kev.metaKey:"+kev.metaKey;
 
	switch(kev.code) {
		case "KeyP":
			console.log("Pause/unPause!\n");                // print on console,
			document.getElementById('KeyDownResult').innerHTML =  
			'Your press p/P key. Pause/unPause!';   // print on webpage
			if(g_isRun==true) {
			  g_isRun = false;    // STOP animation
			  }
			else {
			  g_isRun = true;     // RESTART animation
			  tick();
			  }
			break;
		//------------------WASD navigation-----------------
		case "KeyA":
			console.log("a/A key: Camera are going LEFT!\n");
			
			var direction=new Vector3([aimx-eyex,aimy-eyey,aimz-eyez]);
			direction=direction.normalize();
			var upperdirection=new Vector3([0,0,1]);
			var directionformove=direction.cross(upperdirection);
			movepacex=directionformove.elements[0];
			movepacey=directionformove.elements[1];
			movepacez=directionformove.elements[2];
			eyex=eyex-movepacex/10;
			eyey=eyey-movepacey/10;
			eyez=eyez-movepacez/10;
			aimx=aimx-movepacex/10;
			aimy=aimy-movepacey/10;
			aimz=aimz-movepacez/10;
			//movepace-=0.1;
			document.getElementById('KeyDownResult').innerHTML =  
			'Your press a/A key. Camera are going LEFT!';
			break;
    	case "KeyD":
			var direction=new Vector3([aimx-eyex,aimy-eyey,aimz-eyez]);
			direction=direction.normalize();
			var upperdirection=new Vector3([0,0,1]);
			var directionformove=direction.cross(upperdirection);
			movepacex=directionformove.elements[0];
			movepacey=directionformove.elements[1];
			movepacez=directionformove.elements[2];
			eyex=eyex+movepacex/10;
			eyey=eyey+movepacey/10;
			eyez=eyez+movepacez/10;
			aimx=aimx+movepacex/10;
			aimy=aimy+movepacey/10;
			aimz=aimz+movepacez/10;
			console.log("d/D key: Camera are going Right!\n");
			//movepace+=0.1;
			document.getElementById('KeyDownResult').innerHTML = 
			'Your press d/D key. Camera are going Right!';
			break;
		case "KeyS":

			var direction=new Vector3([aimx-eyex,aimy-eyey,aimz-eyez]);
			direction=direction.normalize();
			movepacex=direction.elements[0];
			movepacey=direction.elements[1];
			movepacez=direction.elements[2];
			eyex=eyex-movepacex/10;
			eyey=eyey-movepacey/10;
			eyez=eyez-movepacez/10;
			aimx=aimx-movepacex/10;
			aimy=aimy-movepacey/10;
			aimz=aimz-movepacez/10;
			console.log(eyex);

			//movepaceud-=0.1;
			console.log("s/S key: Camera are moving back!\n");
			document.getElementById('KeyDownResult').innerHTML = 
			'Your press s/S key. Camera are moving back!';
			break;
		case "KeyW":
			var direction=new Vector3([aimx-eyex,aimy-eyey,aimz-eyez]);
			direction=direction.normalize();
			movepacex=direction.elements[0];
			movepacey=direction.elements[1];
			movepacez=direction.elements[2];
			eyex=eyex+movepacex/10;
			eyey=eyey+movepacey/10;
			eyez=eyez+movepacez/10;
			aimx=aimx+movepacex/10;
			aimy=aimy+movepacey/10;
			aimz=aimz+movepacez/10;
			console.log(eyex);
			console.log(eyey);
			console.log(eyez);
			console.log(aimx);
			console.log(aimy);
			console.log(aimz);
			//movepaceud+=0.1;
			console.log("w/W key: Camera are moving forward!\n");
			document.getElementById('KeyDownResult').innerHTML =  
			'Your press w/W key. Camera are moving forward!';
			break;
		//----------------Arrow keys------------------------
		case "ArrowLeft": 	
			angle=(angle+0.01)%360;
			
			console.log(' left-arrow.');
			// and print on webpage in the <div> element with id='Result':
  		document.getElementById('ArrowResult').innerHTML =
  			'Your press ← key. Camera are looking left.'
			//+kev.keyCode;
			break;
		case "ArrowRight":

			angle=(angle-0.01)%360;
			
			console.log('right-arrow.');
  		document.getElementById('ArrowResult').innerHTML =
  			'Your press → key. Camera are looking right.'
			//+kev.keyCode;
  		break;
		case "ArrowUp":	
			tilt=tilt+0.05;
			console.log(tilt);	
			console.log('   up-arrow.');
  		document.getElementById('ArrowResult').innerHTML =
  			'Your press ↑ key. Camera are looking up.'
			  //+kev.keyCode;
			break;
		case "ArrowDown":
			tilt=tilt-0.05;	
			console.log(tilt);	
			console.log(' down-arrow.');
  		document.getElementById('ArrowResult').innerHTML =
  			'Your press ↓ key. Camera are looking down.'
			  //+kev.keyCode;
  		break;	

		
    default:
      console.log("UNUSED!");
  		document.getElementById('KeyDownResult').innerHTML =
  			'myKeyDown(): UNUSED!';
      break;
	}
}

function myKeyUp(kev) {
//===============================================================================
// Called when user releases ANY key on the keyboard; captures scancodes well

	console.log('myKeyUp()--keyCode='+kev.keyCode+' released.');
}



function dragQuat(xdrag, ydrag) {
	//==============================================================================
	// Called when user drags mouse by 'xdrag,ydrag' as measured in CVV coords.
	// We find a rotation axis perpendicular to the drag direction, and convert the 
	// drag distance to an angular rotation amount, and use both to set the value of 
	// the quaternion qNew.  We then combine this new rotation with the current 
	// rotation stored in quaternion 'qTot' by quaternion multiply.  Note the 
	// 'draw()' function converts this current 'qTot' quaternion to a rotation 
	// matrix for drawing. 
		var res = 5;
		var qTmp = new Quaternion(0,0,0,1);
		 var dist = Math.sqrt(xdrag*xdrag + ydrag*ydrag);
		// // console.log('xdrag,ydrag=',xdrag.toFixed(5),ydrag.toFixed(5),'dist=',dist.toFixed(5));
		// //change it to 
		// var direction_tomy_model=new Vector3([1.25-eyex,-0.25-eyey,1.26-eyez]);
		// var upper_direction1=new Vector3([0,0,1]);
		// var new_xaxie=direction_tomy_model.cross(upper_direction1);
		// var tan0=Math.abs(new_xaxie.elements[1])/Math.abs(new_xaxie.elements[0]);
		// var angletorotate=Math.atan(tan0)*360/(2*Math.PI);
		// this.g_modelMatrix.rotate(angletorotate,0,1,0);

		// // console.log("angle:",angletorotate);
		// qTmp2.setFromAxisAngle(0,angle,0,0);
		//qTmp3.setFromAxisAngle(0,1,0,angle*180/Math.PI-90);
		qNew.setFromAxisAngle(-ydrag + 0.0001, xdrag + 0.0001, 0.0, dist*150.0);
		// (why add tiny 0.0001? To ensure we never have a zero-length rotation axis)
								// why axis (x,y,z) = (-yMdrag,+xMdrag,0)? 
								// -- to rotate around +x axis, drag mouse in -y direction.
								// -- to rotate around +y axis, drag mouse in +x direction.

		qTmp.multiply(qNew,qTot);

		// qTmp.multiply(qNew,qTmp2);
		//--------------------------
		// IMPORTANT! Why qNew*qTot instead of qTot*qNew? (Try it!)
		// ANSWER: Because 'duality' governs ALL transformations, not just matrices. 
		// If we multiplied in (qTot*qNew) order, we would rotate the drawing axes
		// first by qTot, and then by qNew--we would apply mouse-dragging rotations
		// to already-rotated drawing axes.  Instead, we wish to apply the mouse-drag
		// rotations FIRST, before we apply rotations from all the previous dragging.
		//------------------------
		// IMPORTANT!  Both qTot and qNew are unit-length quaternions, but we store 
		// them with finite precision. While the product of two (EXACTLY) unit-length
		// quaternions will always be another unit-length quaternion, the qTmp length
		// may drift away from 1.0 if we repeat this quaternion multiply many times.
		// A non-unit-length quaternion won't work with our quaternion-to-matrix fcn.
		// Matrix4.prototype.setFromQuat().
	//	qTmp.normalize();						// normalize to ensure we stay at length==1.0.
		qTot.copy(qTmp);
		// show the new quaternion qTot on our webpage in the <div> element 'QuatValue'
		// document.getElementById('QuatValue').innerHTML= 
		// 													 '\t X=' +qTot.x.toFixed(res)+
		// 													'i\t Y=' +qTot.y.toFixed(res)+
		// 													'j\t Z=' +qTot.z.toFixed(res)+
		// 													'k\t W=' +qTot.w.toFixed(res)+
		// 													'<br>length='+qTot.length().toFixed(res);
	};
	


