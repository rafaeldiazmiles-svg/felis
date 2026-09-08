#pragma strict

var ID : int;
var speed : Vector2;

var globalTime : boolean;

private var offset : Vector2;

var rendererComp : Renderer;

var modUV : boolean = true;

var useCurveAnim : boolean;
var startTime : float;
var relativeCurve : boolean = true;
var curveX : AnimationCurve;
var curveY : AnimationCurve;
var curveSpeed : float = 1.0;

var resetStartTimeNow : boolean;

var addOffset : Vector2;

var startOffset : Vector2;

function Start () {
	rendererComp = GetComponent.<Renderer>();

	startOffset = rendererComp.materials[ID].mainTextureOffset;

	startTime = Time.time;
}

function Update () {
	if(resetStartTimeNow){
		resetStartTimeNow = false;
		Reset();
	}

	if(globalTime){
		if(useCurveAnim){
			offset.x = curveX.Evaluate(Time.time * curveSpeed);
			offset.y = curveY.Evaluate(Time.time * curveSpeed);
		}
		else{
			offset = Time.time * speed;
		}
	}
	else{
		if(useCurveAnim){
			offset.x = curveX.Evaluate((Time.time - startTime) * curveSpeed);
			offset.y = curveY.Evaluate((Time.time - startTime) * curveSpeed);
		}
		else{
			offset += speed * Time.deltaTime;
		}
	}

	if(useCurveAnim && relativeCurve){
		offset.x += rendererComp.materials[ID].mainTextureOffset.x;
		offset.y += rendererComp.materials[ID].mainTextureOffset.y;		
	}

	if(modUV){
		offset.x = offset.x % 1.0;
		offset.y = offset.y % 1.0;
	}

	offset += addOffset;

	rendererComp.materials[ID].SetTextureOffset("_MainTex",offset);
}

function SetXScrollSpeed(newSpeed : float){
	speed.x = newSpeed;
}

function SetYScrollSpeed(newSpeed : float){
	speed.y = newSpeed;
}

function Reset(){
	startTime = Time.time;
	rendererComp.materials[ID].mainTextureOffset = startOffset;
}