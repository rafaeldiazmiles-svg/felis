#pragma strict

var animationClip : AnimationClip;
var every : float;
var lastPlayed : float;

var resetAnimation : boolean;

function Start () {

}

function Update () {
	if(Time.time > lastPlayed + every + GetComponent.<Animation>()[animationClip.name].length){
		GetComponent.<Animation>()[animationClip.name].enabled = true;
		GetComponent.<Animation>()[animationClip.name].weight = 1.0;
		GetComponent.<Animation>()[animationClip.name].time = 0.0;
		
		lastPlayed = Time.time;
	}
	
	if(resetAnimation){
		GetComponent.<Animation>()[animationClip.name].time = 0.0;
		lastPlayed = Time.time;
		resetAnimation = false;
	}
}