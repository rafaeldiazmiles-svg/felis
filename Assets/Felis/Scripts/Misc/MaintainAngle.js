#pragma strict

var rb : Rigidbody;

var defaultAngle : float;

var currentAngle : float;

var torque : float;

function Start () {
	if(rb == null){
		rb = GetComponent.<Rigidbody>();
	}

	var tDir : Vector3 = transform.TransformDirection(1,0,0);
	defaultAngle = Mathf.Atan2(tDir.y, tDir.x) * Mathf.Rad2Deg; 
}

function FixedUpdate () {
	var tDir : Vector3 = transform.TransformDirection(1,0,0);
	currentAngle = Mathf.Atan2(tDir.y, tDir.x) * Mathf.Rad2Deg;

	rb.AddTorque(Vector3(0,0,1) * Mathf.DeltaAngle(currentAngle, defaultAngle) * torque);
}