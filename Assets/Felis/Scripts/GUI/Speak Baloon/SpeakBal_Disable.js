#pragma strict

var speakBal : SpeakBaloonAnimate;

var pickable : PickableRigidbody;
var caged : Caged;

function Start () {
	speakBal = GetComponent(SpeakBaloonAnimate);
	caged = transform.parent.GetComponent.<Caged>();
}

function Update () {
	if(pickable!= null && pickable.beingPicked.current){
		var isCaged : boolean;
		if(caged != null){
			isCaged = caged.isCaged;
		}
		if(!isCaged){
			speakBal.disableUntil = Time.time + 1.0;
		}
	}
}