#pragma strict

var shootSpeed : Vector3;
var shoot : boolean;
var resetOnShoot : boolean;

var speed : Vector3;

var gravity : Vector3;

var aimForwardVector : Vector3;
var upVector : Vector3;
var aimTowardsSpeedDirectionFactor : float;
var speedDirectionTowardsAimFactor : float;

var speedNoseUpFactor : float;

var startingPos : Vector3;
var startingRotation : Quaternion;
var reset : boolean;

var disableGravityUntilShooting : boolean;

var varyRotation : Vector3;
var varywaveAmplitude : Vector3;
var varyWaveSpeed : Vector3;
var varyWaveOffset : Vector3;

var drag : float;

var shootTime : float;

function Start () {
	startingPos = transform.position;
	startingRotation = transform.rotation;
}

function LateUpdate () {
	transform.position += speed * Time.deltaTime;

	if(!disableGravityUntilShooting) speed += gravity * Time.deltaTime;
	
	if(shoot){
		speed = shootSpeed;
		shoot = false;
		disableGravityUntilShooting = false;
		if(resetOnShoot) reset = true;
		shootTime = Time.time;
	}
	
	//Direction towards speed.
	if(speed.magnitude > 0){
		var speedDirectionRotation : Quaternion = 
		Quaternion.LookRotation(speed, transform.TransformDirection(upVector)) * Quaternion.Inverse(Quaternion.LookRotation(aimForwardVector, upVector));

		transform.rotation = Quaternion.Lerp(transform.rotation, speedDirectionRotation, Time.deltaTime * aimTowardsSpeedDirectionFactor);
	}
	
	//Speed towrads direction.
	var aimingDirectionSpeed : Vector3 = transform.TransformDirection(aimForwardVector) * speed.magnitude;
	speed = Vector3.Lerp(speed, aimingDirectionSpeed, Time.deltaTime * speedDirectionTowardsAimFactor);
	
	//Nose up.
	transform.rotation = Quaternion.Lerp(transform.rotation, Quaternion.Euler(Vector3.up), Time.deltaTime * speed.magnitude * speedNoseUpFactor);
	
	//Reset position.
	if(reset){
		reset = false;
		transform.position = startingPos;
		transform.rotation = startingRotation;
		//speed = Vector3.zero;
	}
	
	//Vary rotation over speed.
	varyRotation.x = Mathf.Sin(Time.time * varyWaveSpeed.x + varyWaveOffset.x) * varywaveAmplitude.x * speed.magnitude;
	varyRotation.y = Mathf.Sin(Time.time * varyWaveSpeed.y + varyWaveOffset.y) * varywaveAmplitude.y * speed.magnitude;
	varyRotation.z = Mathf.Sin(Time.time * varyWaveSpeed.z + varyWaveOffset.z) * varywaveAmplitude.z * speed.magnitude;
	
	transform.rotation *= Quaternion.AngleAxis(varyRotation.x, transform.TransformDirection(Vector3.Cross(aimForwardVector, upVector)));
	transform.rotation *= Quaternion.AngleAxis(varyRotation.y, transform.TransformDirection(upVector));
	transform.rotation *= Quaternion.AngleAxis(varyRotation.z, transform.TransformDirection(aimForwardVector));
	
	//Drag.
	speed = Vector3.Lerp(speed, Vector3.zero, Time.deltaTime * drag * speed.magnitude);
}