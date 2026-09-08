#pragma strict

var maxVel : float;

var useRange : boolean;
var xMin : float;
var xMax : float;
var yMin : float;
var yMax : float;

var disableUntil : float;

var rb : Rigidbody;

var minYPosition : float = -150.0;
var loopBackYPos : float = 100.0;

var delta : MaxRigidbodyDeltaPos;

function Start () {
	rb = GetComponent.<Rigidbody>();

	delta = GetComponent.<MaxRigidbodyDeltaPos>();

}

function FixedUpdate () {
	if(Time.time > disableUntil){
		if(useRange){
			rb.velocity.x = Mathf.Clamp(rb.velocity.x, xMin, xMax);
			rb.velocity.y = Mathf.Clamp(rb.velocity.y, yMin, yMax);
		}
		else{
			if(rb.velocity.magnitude > maxVel){
				rb.velocity = rb.velocity.normalized * maxVel;
			}
		}
	}

	if(transform.position.y < minYPosition){
		transform.position.y = loopBackYPos;
		if(delta != null){
			delta.previousPosition = transform.position;
		}
	}
}