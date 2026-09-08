#pragma strict
var multiplier : Vector2;

var Z_Y_Switch : boolean;

var additiveRotation : boolean;

var minAngle : float = -35;
var maxAngle : float = 35;

var currentRotation : FloatSpring;
var defaultRotation : Quaternion;

var transformSpeedInfoScript : TransformSpeedInfo;

var inertia : Vector3;;

var sideMovement : SideMovement;

function Start () {
	defaultRotation = transform.localRotation;
	sideMovement = FindUtility.ReverseFindSideMovement(transform);
	if(transformSpeedInfoScript == null){
		transformSpeedInfoScript = GetComponent.<TransformSpeedInfo>();
	}	
}

function LateUpdate () {
	if(!additiveRotation){
		transform.localRotation = defaultRotation;
	}
	
	inertia = transformSpeedInfoScript.acceleration;
	if(sideMovement != null) inertia.x  *= sideMovement.currentSide;

	var h_Inertia : float = inertia.x;
	var v_Inertia : float;
	if(Z_Y_Switch){
		v_Inertia = inertia.z;
	}
	else{
		v_Inertia = inertia.y;
	}

	currentRotation.target = h_Inertia * multiplier.x + v_Inertia * multiplier.y;
	currentRotation.target = Mathf.Clamp(currentRotation.target, minAngle, maxAngle);
	if(currentRotation.current < minAngle){
		currentRotation.current = minAngle;
		currentRotation.velocity = Mathf.Abs(currentRotation.velocity);
	}
	if(currentRotation.current > maxAngle){
		currentRotation.current = maxAngle;
		currentRotation.velocity = -Mathf.Abs(currentRotation.velocity);
	}
	currentRotation.Spring();
	
	var angle : float = currentRotation.current;
	
	transform.RotateAround(transform.position, Vector3.forward, angle);
}