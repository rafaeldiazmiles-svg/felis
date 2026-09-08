#pragma strict

@script RequireComponent(DefaultTransformFixedUpdate);

var masterValue : float;

var positiveOffset : Vector3;
var negativeOffset : Vector3;
var positiveRotation : float;
var negativeRotation : float;

var damp : float = 5.0;
var springForce : float = 2.0;

var randomizeDamp : float = 1.0;
var randomizeSpringForce : float = 0.3;


var currentPositionOffset : Vector3;
var targetPositionOffset : Vector3;
var positionOffsetVelocity : Vector3;

var positionOffsetAcceleration : Vector3;
var previousPositionOffsetVelocity : Vector3;

var currentRotationOffset : float;
var targetRotationOffset : float;
var rotationOffsetVelocity : float;



var defaultPosition : Vector3;
var defaultRotaiton : Quaternion;


function Start () {
	damp += Random.Range(-randomizeDamp*.5, randomizeDamp*.5);
	springForce += Random.Range(-randomizeSpringForce*.5, randomizeSpringForce*.5);
}

function FixedUpdate () {
	positionOffsetAcceleration = (positionOffsetVelocity - previousPositionOffsetVelocity) / Time.deltaTime;
	previousPositionOffsetVelocity  = positionOffsetVelocity;
	
	//Y velocity target position.
	if(masterValue > 0){
		targetPositionOffset = positiveOffset * Mathf.Clamp01(masterValue);
	}
	else{
		targetPositionOffset = negativeOffset * Mathf.Clamp01(-masterValue);
	}
	//Y velocity target rotation.
	if(positionOffsetAcceleration.y > 0){
		targetRotationOffset = positiveRotation * Mathf.Clamp01(positionOffsetAcceleration.y);
	}
	else{
		targetRotationOffset = negativeRotation * Mathf.Clamp01(-positionOffsetAcceleration.y);
	}	
	
			
	//Process and apply velocity, also rotation.
	positionOffsetVelocity += (targetPositionOffset - currentPositionOffset) * Time.deltaTime * springForce; //Increase velocity.
	positionOffsetVelocity = Vector3.Lerp(positionOffsetVelocity, Vector3.zero, Time.deltaTime * damp); //Slow down velocity.
	currentPositionOffset += positionOffsetVelocity; //Apply velocity.
	transform.position += Vector3(currentPositionOffset.x, currentPositionOffset.y, currentPositionOffset.z);
		
	currentRotationOffset = Mathf.SmoothDamp(currentRotationOffset, targetRotationOffset, rotationOffsetVelocity, .02);
	transform.RotateAround(transform.position, Vector3.forward, currentRotationOffset);
}

function GetCurrentRotation() : float{
	return currentRotationOffset;
}
