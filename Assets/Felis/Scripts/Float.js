#pragma strict

var targetYVelocity : float = 0;
var forceMutliplier : float = 10.0;
var curve : float = 1.0;

function Start () {

}

function FixedUpdate () {
	PhysicsUtility.ApplyForceForYVelocity(GetComponent.<Rigidbody>(), targetYVelocity, forceMutliplier, curve);
}