#pragma strict

var findRigidbody : boolean = true;
var movingRigidbody : Rigidbody;

var previousVelocity : Vector3;
var acceleration : Vector3;

function Start () {
	if(findRigidbody){
		if(transform.parent != null) movingRigidbody = transform.parent.gameObject.GetComponent.<Rigidbody>();
	 	if(movingRigidbody == null) movingRigidbody = GetComponent.<Rigidbody>();
	 }
}

function LateUpdate () {
	acceleration = (movingRigidbody.velocity - previousVelocity) / Time.deltaTime;;
	previousVelocity = movingRigidbody.velocity;
}

function GetAcceleration() : Vector3{
	return acceleration;
}