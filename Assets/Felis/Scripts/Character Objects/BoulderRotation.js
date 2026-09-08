#pragma strict

var rb : Rigidbody;
var multiplier : float;

var useTransform : boolean;
var tAxis : Vector3 = Vector3.forward;
var local : boolean;

function Start () {
	if(rb == null){
		rb = GetComponent.<Rigidbody>();
	}
}


function Update () {
	if(useTransform){
		var useAxis : Vector3;
		if(local){
			useAxis = transform.TransformDirection(tAxis);
		}
		else{
			useAxis = tAxis;
		}
		transform.RotateAround(transform.position, useAxis, (rb.velocity.x * multiplier) / (transform.localScale.magnitude * Mathf.PI));
	}
	else{
		rb.angularVelocity.z = (rb.velocity.x * multiplier) / (transform.localScale.magnitude * Mathf.PI);
	}

}