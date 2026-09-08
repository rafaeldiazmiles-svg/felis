#pragma strict

 
var verticalPositiveOffset : Vector3;
var verticalNegativeOffset : Vector3;
var verticalPositiveRotation : float;
var verticalNegativeRotation : float;

var horizontalPositiveOffset : Vector3;
var horizontalNegativeOffset : Vector3;
var horizontalPositiveRotation : float;
var horizontalNegativeRotation : float;

var damp : float = 5.0;

var springForce : float = 2.0;

private var horizontalBias : float;

private var currentPositionOffset : Vector3;
private var targetPositionOffset : Vector3;
private var positionOffsetVelocity : Vector3;

private var positionOffsetAcceleration : Vector3;
private var previousPositionOffsetVelocity : Vector3;

private var currentRotationOffset : float;
private var targetRotationOffset : float;
private var rotationOffsetVelocity : float;


var bone : TransformSpeedInfo;

private var defaultPosition : Vector3;
private var defaultRotaiton : Quaternion;

private var sideMovementScript : SideMovement; 
private var side : int;

var useRoot : boolean = true;
var charRoot : Transform;

var wind : float;
var windPower : float = 100;
var windSpeed : float = 10;
var windSettle : float = .2;


function Start () {
	if(useRoot) charRoot = transform.root;
		
	sideMovementScript = charRoot.GetComponent.<SideMovement>();
}

function LateUpdate () {
	if(sideMovementScript != null) side = sideMovementScript.currentSide;
	
	positionOffsetAcceleration = (positionOffsetVelocity - previousPositionOffsetVelocity) / Time.deltaTime;
	previousPositionOffsetVelocity  = positionOffsetVelocity;
	
	
	
	//Y velocity target position.
	var velocityAndWind : float = bone.GetVelocity().y;
	
	if(velocityAndWind > 0){
		targetPositionOffset = verticalPositiveOffset * Mathf.Clamp01(velocityAndWind);
	}
	else{
		targetPositionOffset = verticalNegativeOffset * Mathf.Clamp01(-velocityAndWind);
	}
	//Y velocity target rotation.
	if(positionOffsetAcceleration.y > 0){
		targetRotationOffset = verticalPositiveRotation * Mathf.Clamp01(positionOffsetAcceleration.y);
	}
	else{
		targetRotationOffset = verticalNegativeRotation * Mathf.Clamp01(-positionOffsetAcceleration.y);
	}	
	
	horizontalBias = Mathf.Clamp(Mathf.Abs(bone.GetVelocity().x)*.1,0,1.0);

	//X velocity target position.
	if(bone.GetVelocity().x * side> 0){
		targetPositionOffset = Vector3.Lerp(targetPositionOffset,
		horizontalPositiveOffset * Mathf.Clamp01(Mathf.Abs(bone.GetVelocity().x)),
		horizontalBias);
	}
	else{
		targetPositionOffset = Vector3.Lerp(targetPositionOffset,
		horizontalNegativeOffset * Mathf.Clamp01(Mathf.Abs(bone.GetVelocity().x)),
		horizontalBias);
	}
	//X velocity target rotation.
	if(positionOffsetAcceleration.x < 0){
		targetRotationOffset = Mathf.Lerp(targetRotationOffset,
		horizontalPositiveRotation * Mathf.Clamp01(Mathf.Abs(positionOffsetAcceleration.x)),
		horizontalBias);
	}
	else{
		targetRotationOffset = Mathf.Lerp(targetRotationOffset,
		horizontalNegativeRotation * Mathf.Clamp01(Mathf.Abs(positionOffsetAcceleration.x)),
		horizontalBias);
	}
	
	//Wind.
	var windValue : float = Mathf.Sin(Time.time * windSpeed + transform.position.x * 2.0 + transform.position.y * 2.0) * windPower * wind;
	targetRotationOffset += windValue;
	wind = Mathf.MoveTowards(wind, 0.0, Time.deltaTime * windSettle);
	
	//Process and apply velocity, also rotation.
	positionOffsetVelocity += (targetPositionOffset - currentPositionOffset) * Time.deltaTime * springForce; //Increase velocity.
	positionOffsetVelocity = Vector3.Lerp(positionOffsetVelocity, Vector3.zero, Time.deltaTime * damp); //Slow down velocity.
	currentPositionOffset += positionOffsetVelocity; //Apply velocity.
	transform.position += Vector3(currentPositionOffset.x * side, currentPositionOffset.y, currentPositionOffset.z);
		
	currentRotationOffset = Mathf.SmoothDamp(currentRotationOffset, targetRotationOffset, rotationOffsetVelocity, .1);
	if(!float.IsNaN(currentRotationOffset)){
		transform.RotateAround(transform.position, Vector3.forward, currentRotationOffset);
	}
}

