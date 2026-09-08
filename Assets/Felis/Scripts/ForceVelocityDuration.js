#pragma strict

var forceUntil : float;
var multiplier : float = 1.0;
var velocity : Vector3;

var applyForOneSecond : boolean;

function Start () {

}

function FixedUpdate () {
	if(applyForOneSecond){
		forceUntil = Time.time + 1.0;
		applyForOneSecond = false;
	}
	
	if(Time.time < forceUntil){
		PhysicsUtility.ApplyForceForVelocity(GetComponent.<Rigidbody>(), velocity, multiplier);
	}
}