#pragma strict

var animComp : Animation;
var animClip : AnimationClip;
var baloonAnimate : SpeakBaloonAnimate;

var destroyIfTargetIsGone : boolean = true;

var debug : boolean;

var disable : boolean;

var speakWhenCaged : boolean;
var caged : Caged;

function Start () {
	animComp = transform.parent.GetComponent.<Animation>();
	baloonAnimate = GetComponent(SpeakBaloonAnimate);
	caged = transform.parent.GetComponent.<Caged>();
}

function Update () {
	if(disable) return;

		if(animComp != null){
		if(animComp[animClip.name].weight > .9)
			baloonAnimate.playEnabled = true;
		else
			baloonAnimate.playEnabled = false;
	}
	else{
		if(destroyIfTargetIsGone){
			Destroy(gameObject);
		}
	}
	
	if(speakWhenCaged){
		if(caged.isCaged){
			baloonAnimate.playEnabled = true;
			baloonAnimate.slowDownUntil = Time.time + .5;
		}
	}	
}

function OnDrawGizmosSelected(){
	#if UNITY_EDITOR
	if(debug){
		Handles.Label(transform.position, "Speak Baloon, weight animation: " + animComp[animClip.name].weight.ToString());
	}
	#endif
}