#pragma strict

var scaleCurve : AnimationCurve;

var useDefaultScale : boolean;
var defaultScale : Vector3;

private var startTime : float;

var resetStartTimeNow : boolean;

var speed : float = 1.0;

var multiplier : float = 1.0;

function Start () {
	startTime = Time.time;
	
	defaultScale = transform.localScale;
}

function Update () {
	if(resetStartTimeNow){
		resetStartTimeNow = false;
		startTime = Time.time;
	}


	if(useDefaultScale){
		transform.localScale = defaultScale * scaleCurve.Evaluate((Time.time - startTime) * speed);
	}
	else{
		transform.localScale = Vector3.one * scaleCurve.Evaluate((Time.time - startTime) * speed);
	}

	transform.localScale *= multiplier;
}