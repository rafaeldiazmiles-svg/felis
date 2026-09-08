#pragma strict

enum ControllerType{User, Ai}

var controllerType : ControllerType = ControllerType.User;

var startSelectName : String = "StartSelect Position";
var buttonsName : String = "Buttons Position";
var dPadName : String = "DPad Position";

var startSelectTransform : Transform;
var dPadTransform : Transform;
var buttonsTransform : Transform;

var startAnimation : ButtonPressAnimation;
var selectAnimation : ButtonPressAnimation;
var dPadAnimation : DPadAnimation;
var buttonAAnimation : ButtonPressAnimation;
var buttonBAnimation : ButtonPressAnimation;

var sceneCamera : Camera;
var useMainCamera : boolean = true;

var maxSize : float = 1.4;
var minSize : float = 0.4;
var minDistance : float = 0.3;
var maxDistance : float = 1.0;
 var currentSize : float;

var startSelectPositionScript : ViewportPosition;
var dPadViewportPositionScript : ViewportPosition;
var buttonsViewportPositionScript : ViewportPosition;

var startButton : Button;
var selectButton : Button;

var inputAxis : Vector2SmoothDamp;
static var inputTime : float = .01;
var inputButtonA : Button;
var inputButtonB : Button;


var defaultStartSelectViewportPosition : Vector3;
var defaultDPadViewportPosition : Vector3;
var defaultButtonsViewportPosition : Vector3;

static var offsetTime : float = 0.15;
var dPadOffset : Vector2SmoothDamp;
var buttonsOffset : Vector2SmoothDamp;

var thumbAngleAdjust : float = 5.0;
var dPadThumbAngleOffset : float = 0.0;
var buttonsThumbAngleOffset : float = 0.0;
static var angleTime : float = .1;

var dPadAngle : FloatSmoothDamp;
var buttonsAngle : FloatSmoothDamp;

var defaultStartSelectRotation : Quaternion;
var defaultDPadRotation : Quaternion;
var defaultButtonsRotation : Quaternion;

var minDeltaTouchSpace : Vector2 = Vector2(.05, .08);;

var maxOffset : Vector2 = Vector2(.2,.2);;
var maxTouchViewportDistance : Vector2 = Vector2(.04,.05);
//var multiplyAdjust : Vector2 = Vector2.one;


var maxTouchDelta : float = .25;
var minTouchDelta : float = .02;

var ignoreCenterWidth : float = .15;
var doubleButtonWidth : float = .05;

var defaultInputAnimatesController : boolean = true;

var lastControllerTouchTime : float;

//Start Select
var startSelectAreaRadius : float = .1;

var disableUntil : float;

//Touch Points
var tPoints : TouchPoint[];
var TP_Radius : float = 0.1;
var disableTPDuration : float = 0.4;

//No Mobile
var noMobileInput : boolean;
var noMouseInput : boolean;

//Configurable Button Strings
var p1_ButtonA : String = "Player One A Button";
var p1_ButtonB : String = "Player One B Button";
var p1_Select  : String = "Player One Select Button";
var p1_Start   : String = "Player One Start Button";

function DisableOneSecond(){
	disableUntil = Time.time + 1.0;
}

function DisableFiveSeconds(){
	disableUntil = Time.time + 5.0;
}

class Button{
	var pressed : boolean;
	var up : boolean;
	var down : boolean;
	
	var previouslyPressed : boolean;
	
	var lastDownTime : float;
	var lastUpTime : float;
	
	function Update(){
		if(pressed && !previouslyPressed){
			down = true;
			lastDownTime = Time.time;
		}
		else
			down = false;
		
		if(!pressed && previouslyPressed)
		{
			up = true;
			lastUpTime = Time.time;
		}
		else up = false;
		
		previouslyPressed = pressed;
	}
}


function Start () {
	GetDpadValues();
	
	if(useMainCamera) sceneCamera = Camera.main;
	
	SetSmoothDampTime();

	GetTouchPoints();
}

function GetTouchPoints(){
	tPoints = GameObject.FindObjectsOfType.<TouchPoint>();
	for(var i = 0; i < tPoints.Length; i++){
		var tpDialogs : TouchPointDialog[] = tPoints[i].GetComponentsInChildren.<TouchPointDialog>();
		if(tpDialogs != null){
			for(var n = 0; n < tpDialogs.Length; n++){
				if(tpDialogs[n].controller == null){
					tpDialogs[n].controller = this;
				}
			}
		}
	}
}

function GetDpadValues(){
	var allGameObjects : GameObject[] = FindObjectsOfType.<GameObject>() as GameObject[];
	for(var i = 0; i < allGameObjects.Length; i++){
		if(allGameObjects[i].name == startSelectName){
			startSelectTransform = allGameObjects[i].transform;
		}
		if(allGameObjects[i].name == buttonsName){
			buttonsTransform = allGameObjects[i].transform;
		}
		if(allGameObjects[i].name == dPadName){
			dPadTransform = allGameObjects[i].transform; 
		}
		if(buttonsTransform != null && dPadTransform != null && startSelectTransform != null) break;
	}
	
	if(dPadTransform != null && buttonsTransform != null && startSelectTransform != null){
		startAnimation = startSelectTransform.Find("Start Button").GetComponent.<ButtonPressAnimation>();
		selectAnimation = startSelectTransform.Find("Select Button").GetComponent.<ButtonPressAnimation>();
		dPadAnimation = dPadTransform.Find("DPad").GetComponent.<DPadAnimation>();
		buttonAAnimation = buttonsTransform.Find("Button A").GetComponent.<ButtonPressAnimation>();
		buttonBAnimation = buttonsTransform.Find("Button B").GetComponent.<ButtonPressAnimation>();
		
		
		startSelectPositionScript = startSelectTransform.GetComponent.<ViewportPosition>();
		dPadViewportPositionScript = dPadTransform.GetComponent.<ViewportPosition>();
		buttonsViewportPositionScript = buttonsTransform.GetComponent.<ViewportPosition>();
		
		defaultStartSelectViewportPosition = startSelectPositionScript.viewportPosition;
		defaultDPadViewportPosition = dPadViewportPositionScript.viewportPosition;
		defaultButtonsViewportPosition = buttonsViewportPositionScript.viewportPosition;
		
		defaultStartSelectRotation = startSelectTransform.localRotation;
		defaultDPadRotation = dPadTransform.localRotation;
		defaultButtonsRotation = buttonsTransform.localRotation;
		

	}
}

function ControllerSize(){
	var controllerDistance : float = Vector3.Distance(defaultDPadViewportPosition, defaultButtonsViewportPosition);
	currentSize = Mathf.Lerp(minSize, maxSize, (controllerDistance - minDistance) / (maxDistance - minDistance) );
	
	var setSize : Vector3 = Vector3.one * currentSize;
	
	startSelectTransform.localScale = setSize;
	dPadTransform.localScale = setSize;
	buttonsTransform.localScale = setSize;	
}

function SetSmoothDampTime(){
	dPadOffset.time = offsetTime;
	buttonsOffset.time = offsetTime;
	inputAxis.time = inputTime;
	dPadAngle.time = angleTime;
	buttonsAngle.time = angleTime;	
}

function FixedUpdate(){
	//Process touch
	if(controllerType == controllerType.User){
		inputAxis.target = Vector2.zero;
		inputButtonA.pressed = false;
		inputButtonB.pressed = false;
		startButton.pressed = false;
		selectButton.pressed = false;
		
		if(Time.time > disableUntil){
		    for(var touch : Touch in Input.touches) {
				ProcessTouch(touch.position);
			
			}

			inputAxis.target.x += Input.GetAxis("Player One Horizontal Axis") + Input.GetAxis("Player One Horizontal Axis Joystick");
			inputAxis.target.y += Input.GetAxis("Player One Vertical Axis") + Input.GetAxis("Player One Vertical Axis Joystick");
		}
	}

	//For gameplay within editor

	#if !UNITY_EDITOR
	if(!noMouseInput && Time.time > disableUntil && Input.GetMouseButton(0) && controllerType == ControllerType.User){
		ProcessTouch(Vector2(Input.mousePosition.x, Input.mousePosition.y));
	}
	#endif

	#if UNITY_EDITOR
	if(Time.time > disableUntil && Input.GetMouseButton(0) && controllerType == ControllerType.User){
		ProcessTouch(Vector2(Input.mousePosition.x, Input.mousePosition.y));
	}
	#endif

	//Pick up controller input
	if(Time.time > disableUntil){
		if(controllerType == ControllerType.User){		
			if(defaultInputAnimatesController){
				if(Input.GetButton(p1_ButtonA)){
					buttonAAnimation.pressed = true;
					inputButtonA.pressed = true;
				}
				if(Input.GetButton(p1_ButtonB)){
					buttonBAnimation.pressed = true;
					inputButtonB.pressed = true;
				}
				if(Input.GetButton(p1_Select)){
					buttonBAnimation.pressed = true;
					selectButton.pressed = true;
				}
				if(Input.GetButton(p1_Start)){
					buttonBAnimation.pressed = true;
					startButton.pressed = true;
				}
			}
		}
	}

	//Input update
	startButton.Update();
	selectButton.Update();
	inputButtonA.Update();
	inputButtonB.Update();		
	inputAxis.SmoothDamp();
}

function Update () {
	SetSmoothDampTime();

	//Animation & Orientation
	if(controllerType == ControllerType.User){
		//Offset
		dPadViewportPositionScript.viewportPosition = defaultDPadViewportPosition + dPadOffset.current;
		buttonsViewportPositionScript.viewportPosition = defaultButtonsViewportPosition + buttonsOffset.current;
		
		dPadOffset.SmoothDamp();
		buttonsOffset.SmoothDamp();		
			
		//Adjust controllers to thumb angle.
		dPadTransform.localRotation = defaultDPadRotation;
		buttonsTransform.localRotation = defaultButtonsRotation;
		
		dPadAngle.target = Mathf.Lerp(-thumbAngleAdjust, thumbAngleAdjust, dPadViewportPositionScript.viewportPosition.x * 2.0) + dPadThumbAngleOffset;
		buttonsAngle.target = Mathf.Lerp(thumbAngleAdjust, -thumbAngleAdjust, (1-buttonsViewportPositionScript.viewportPosition.x) * 2.0) + buttonsThumbAngleOffset;
		
		dPadAngle.SmoothDamp();
		buttonsAngle.SmoothDamp();
								
		dPadTransform.Rotate(Vector3(0,0,dPadAngle.current), Space.Self);
		buttonsTransform.Rotate(Vector3(0,0,buttonsAngle.current), Space.Self);
		
		//Animation;
		startAnimation.pressed = startButton.pressed;
		selectAnimation.pressed = selectButton.pressed;
		
		dPadAnimation.horizontalAxis.target = inputAxis.current.x;
		dPadAnimation.verticalAxis.target = inputAxis.current.y;
		
		buttonAAnimation.pressed = inputButtonA.pressed;
		buttonBAnimation.pressed = inputButtonB.pressed;
	
		ControllerSize();
	}
}

function ProcessTouch(touchPosition : Vector2){
    //2a)get touch 3D space position, to compare with controller's local position. And also touch viewport position.
    var touchSpace : Vector3 = sceneCamera.ScreenToWorldPoint(Vector3(touchPosition.x, touchPosition.y, dPadViewportPositionScript.viewportPosition.z));
    var touchViewportPosition : Vector2 = sceneCamera.ScreenToViewportPoint(Vector3(touchPosition.x, touchPosition.y, 0));;
	
    var localTouchPosition : Vector3; //Position of touchSpace relative to controller.

    //Touch points
    for(var i = 0; i < tPoints.Length; i++){
        if(tPoints[i].disable){
            continue;
        }

        var touched : boolean;
        if(tPoints[i].useArea){
        	if(tPoints[i].TestAreaPos(touchViewportPosition)){
        		touched = true;
        	}
        }
        else{
	        var tPointVP : Vector3 = sceneCamera.WorldToViewportPoint(tPoints[i].transform.position);
	        var touchDist : float = Vector3.Distance(tPointVP, Vector3(touchViewportPosition.x, touchViewportPosition.y, tPointVP.z));

	        if(touchDist < TP_Radius){
	        	touched = true;

	        }      	
        }

        if(touched){
            tPoints[i].Use();
            
            //Disable All for a while
            for(var n = 0; n < tPoints.Length; n++){
                tPoints[n].DisableFor(disableTPDuration);
            }

            //Also disable Buttons
            disableUntil = Time.time + disableTPDuration;

            return;       	
        }

    }

    if(noMobileInput){
    	return;
    }

    //---------------------------------START SELECT---------------------------------------
    localTouchPosition  = startSelectTransform.InverseTransformPoint(touchSpace);
	
	var startSelectViewportPosition : Vector2 = startSelectPositionScript.viewportPosition;
	if(Vector2.Distance(touchViewportPosition, startSelectViewportPosition) < startSelectAreaRadius){
		lastControllerTouchTime = Time.time;
		
		if(localTouchPosition.x < 0){
			selectButton.pressed = true;
		}		
		else{
			startButton.pressed = true;
		}
		
		return;
	}
	
	//------------------------------DIRECTION PAD-------------------------------------------
	if(touchPosition.x < Screen.width * (0.5 - ignoreCenterWidth)){//2b)DPad side:
		//2b1)check dPadDelta Vector2 position.
		var dPadViewportPosition : Vector2 = dPadViewportPositionScript.viewportPosition;
		var dPadDelta : Vector2 = touchViewportPosition - dPadViewportPosition;
		
		if(dPadDelta.magnitude > maxTouchDelta || dPadDelta.magnitude < minTouchDelta) return;
		
		/////OFFSET
		//2b2)If dPadDelta magnitude is larger than max touch distance, move dpad with dpad Vector2 offset.
		if(Mathf.Abs(dPadDelta.x) > maxTouchViewportDistance.x){
			dPadOffset.target.x = touchViewportPosition.x - defaultDPadViewportPosition.x - maxTouchViewportDistance.x * Mathf.Sign(dPadDelta.x);
		}
		if(Mathf.Abs(dPadDelta.y) > maxTouchViewportDistance.y){
			dPadOffset.target.y = touchViewportPosition.y - defaultDPadViewportPosition.y - maxTouchViewportDistance.y * Mathf.Sign(dPadDelta.y);;
		}
		//2b3)If dPad offset Vector2 x or y offset are larger than maxOffset x or y, clamp offset.
		if(Mathf.Abs(dPadOffset.target.x) > maxOffset.x){
			dPadOffset.target.x = maxOffset.x * Mathf.Sign(dPadOffset.target.x);
		}
		if(Mathf.Abs(dPadOffset.target.y) > maxOffset.y){
			dPadOffset.target.y = maxOffset.y * Mathf.Sign(dPadOffset.target.y);
		}
		
		/////////INPUT
		//2b4) Set inputAxis value based on dPadDelta.
		localTouchPosition  = dPadTransform.InverseTransformPoint(touchSpace);

		inputAxis.target.x = Mathf.Sign( localTouchPosition.x );
		if(Mathf.Abs(localTouchPosition.y) > minDeltaTouchSpace.y){		
			inputAxis.target.y = Mathf.Sign( -localTouchPosition.y );
			if(Mathf.Abs(localTouchPosition.x) < minDeltaTouchSpace.x){
				inputAxis.target.x = 0.0;
			}
		}
		lastControllerTouchTime = Time.time;
	}
	
	//------------------------------BUTTONS -------------------------------------------	
	if(touchPosition.x > Screen.width * (.5 + ignoreCenterWidth)){//2c)Button side:
		//2c1)check buttonDelta Vector2 position.
		var buttonsViewportPosition : Vector2 = buttonsViewportPositionScript.viewportPosition;
		var buttonsDelta : Vector2 = touchViewportPosition - buttonsViewportPosition;
		
		if(buttonsDelta.magnitude > maxTouchDelta) return;
		
		//2c3)If buttonDelta Vector2 magnitude is larget tham max touch distance, move the buttons to the touch position.
		if(Mathf.Abs(buttonsDelta.x) > maxTouchViewportDistance.x){
			buttonsOffset.target.x = touchViewportPosition.x - defaultButtonsViewportPosition.x - maxTouchViewportDistance.x * Mathf.Sign(buttonsDelta.x);
		}
		if(Mathf.Abs(buttonsDelta.y) > maxTouchViewportDistance.y){
			buttonsOffset.target.y = touchViewportPosition.y - defaultButtonsViewportPosition.y - maxTouchViewportDistance.y * Mathf.Sign(buttonsDelta.y);;
		}
		
		//2c4)If button offset x or y are larger than maxOffset x or y, clamp offset.
		if(Mathf.Abs(buttonsOffset.target.x) > maxOffset.x){
			buttonsOffset.target.x = maxOffset.x * Mathf.Sign(buttonsOffset.target.x);
		}
		if(Mathf.Abs(buttonsOffset.target.y) > maxOffset.y){
			buttonsOffset.target.y = maxOffset.y * Mathf.Sign(buttonsOffset.target.y);
		}
		//2c2)Check if it's button A or button B.
		localTouchPosition = buttonsTransform.InverseTransformPoint(touchSpace);
		
		if(localTouchPosition.x > -doubleButtonWidth){
			inputButtonA.pressed = true;
			lastControllerTouchTime = Time.time;
		}
		if(localTouchPosition.x < doubleButtonWidth){
			inputButtonB.pressed = true;
			lastControllerTouchTime = Time.time;
		}
	}		
}

