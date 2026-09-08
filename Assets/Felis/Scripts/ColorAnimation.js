#pragma strict

var red : AnimationCurve;
var green : AnimationCurve;
var blue : AnimationCurve;
var alpha : AnimationCurve;

//var material : Material;

var colorProperty : String;

var speed : float = 1.0;

var multiplyColor : Color;

var lerpMColorAlpha : boolean;
var mColLerp : FloatLerp;

var fadeIn : boolean;
var fadeInDelay : float = 2.0;

var fadeOut : boolean;
var fadeOutDelay : float = 6.0;

var startTimeIsCreateTime : boolean = true;
var startTime : float;

var delayTime : float;

var rend : Renderer;

var resetStartTimeNow : boolean;

function GetRend(){
	rend = GetComponent.<Renderer>();
}

function Start () {
	if(startTimeIsCreateTime){
		startTime = Time.time;
	}

	if(rend == null){
		GetRend();
	}

	if(rend != null){
		var curveValue : float = (Time.time - startTime - delayTime) * speed;	
		rend.material.SetColor(colorProperty, 
		multiplyColor * Color(red.Evaluate(curveValue), green.Evaluate(curveValue), blue.Evaluate(curveValue), alpha.Evaluate(curveValue)));
	}
}

function Update () {
	if(resetStartTimeNow){
		resetStartTimeNow = false;
		startTime = Time.time;
	}

	if(lerpMColorAlpha){
		if(fadeIn){
			if(Time.time - startTime > 	fadeInDelay){
				fadeIn = false;
				mColLerp.target = 1.0;
			}
		}
		if(fadeOut){
			if(Time.time - startTime > fadeOutDelay){
				fadeOut = false;
				mColLerp.target = 0.0;
			}
		}
		mColLerp.Lerp();
		multiplyColor.a = mColLerp.current;
	}

	var curveValue : float = (Time.time - startTime - delayTime) * speed;

	if(rend == null){
		rend = GetComponent.<Renderer>();
	}

	if(rend != null){	
		rend.material.SetColor(colorProperty, 
		multiplyColor * Color(red.Evaluate(curveValue), green.Evaluate(curveValue), blue.Evaluate(curveValue), alpha.Evaluate(curveValue)));
	}
}