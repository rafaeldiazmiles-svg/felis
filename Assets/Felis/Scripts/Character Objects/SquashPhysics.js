#pragma strict

var squash : Squash;
@Space(30)
var rigidbodyAcceleration : RigidbodyAccelerationInfo;
var acceleration : float;
var squashAmount : float;
var squashVelocity : float;
@Space(30)
var previousAcceleration : float;
var deltaAcceleration : float;
var verticalSquashEffect_Mul : float = 1.0;
@Space(30)
var addSquash : float;
@Space(30)
var externalSquashInput : float;
@Space(30)
var springForce = 2.0;
var damp : float = 5.0;
var multiplier : float;

function Start () {
	squash = GetComponent(Squash);
	if(transform.parent != null){
		rigidbodyAcceleration = transform.parent.GetComponentInChildren.<RigidbodyAccelerationInfo>();
	}
	if(rigidbodyAcceleration == null) rigidbodyAcceleration = GetComponentInChildren.<RigidbodyAccelerationInfo>();
}

function Update () {
	var acceleration : float = rigidbodyAcceleration.GetAcceleration().y;
	deltaAcceleration = (acceleration - previousAcceleration) / Time.deltaTime;
	previousAcceleration = acceleration;
	
	squashVelocity += ((deltaAcceleration * verticalSquashEffect_Mul) - squashAmount) * Time.deltaTime * springForce;
	
	squashVelocity = Mathf.Lerp(squashVelocity, 0, Time.deltaTime * damp);
	
	squashVelocity += externalSquashInput;
	externalSquashInput = 0.0;
	
	squashAmount += squashVelocity;
	
	squash.squashAmount = squashAmount * multiplier + addSquash;
}