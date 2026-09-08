#pragma strict

var setRandom : boolean;
var randomize : float;

var startSpeed : Vector2;
var friction : float = 5.0;

var velocity : Vector2;

var gravity : float; 

var setVelocityAngle : boolean;
var zeroAngle : Vector3;
var zeroAngleIsDefault : boolean;
var angle : float;

var zVel : float;

var lockToSource : Transform;
var setSourceLock : boolean;
var sourceLocalPos : Vector3;
var lockDuration : float = .2;
var lockStartTime : float;

function Start () {
	Reset();
	//if(setRandom) startSpeed = Random.insideUnitCircle * randomize;
	//velocity = startSpeed;
	if(zeroAngleIsDefault){
		zeroAngle = transform.eulerAngles;
	}
}

function Update () {
	if(lockToSource == null){
		transform.position.x += velocity.x * Time.deltaTime;
		transform.position.y += velocity.y * Time.deltaTime;
		transform.position.z += zVel * Time.deltaTime;
	}
	else{
		if(!setSourceLock){
			setSourceLock = true;
			SetSL();
		}
		transform.position = lockToSource.TransformPoint(sourceLocalPos);
		if(Time.time > lockStartTime + lockDuration){
			lockToSource = null;
		}
	}

	velocity = Vector2.Lerp(velocity, Vector2.zero, Time.deltaTime * friction);
	velocity.y += gravity * Time.deltaTime;

	if(setVelocityAngle){
		angle = Mathf.Atan2(velocity.y, velocity.x) * Mathf.Rad2Deg;
		transform.eulerAngles = zeroAngle;
		transform.RotateAround(transform.position, Vector3.forward, 180 + angle);
	}

}

function Reset(){
	if(setRandom) startSpeed = Random.insideUnitCircle * randomize;
	velocity = startSpeed;	
}

function SetSL(){
	lockStartTime = Time.time;
	sourceLocalPos = lockToSource.InverseTransformPoint(transform.position);
}