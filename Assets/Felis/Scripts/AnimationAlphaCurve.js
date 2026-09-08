#pragma strict
var animationClip : AnimationClip;
var alphaCurve : AnimationCurve;
var propertyName : String;

var hideUntil : float;

function Start () {

}

function Update () {
	if(Time.time < hideUntil)
		GetComponent.<Renderer>().material.SetColor(propertyName, Color(1,1,1,0) );
	else
		GetComponent.<Renderer>().material.SetColor(propertyName, Color(1,1,1,alphaCurve.Evaluate(GetComponent.<Animation>()[animationClip.name].normalizedTime)));
}