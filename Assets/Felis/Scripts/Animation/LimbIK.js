#pragma strict

var upperArm : Transform;
var useCurrentAsUpperArm : boolean = true;
var forearm : Transform;
var useChildAsForearm : boolean = true;
var clavicle : Transform;
var useParentAsClavicle : boolean = true;

var target : Transform;

//var angle : float;
var zeroRotation : Vector3;

var offsetZ : float;
var offsetAngle : float = 180;

var transition : float;

var clavicleOffsetMultiplier : float = .1;

var upperArmAngleMultiplier : float = 1.0;
var forearmAngleMultiplier : float = 1.0;

function Start () {
	if(useCurrentAsUpperArm) upperArm = transform;
	if(useChildAsForearm) forearm = transform.GetChild(0);
	if(useParentAsClavicle) clavicle = transform.parent;
}

function LateUpdate () {
	if(target == null) return;
	
	transition = Mathf.Clamp01(transition);
	
	//Store animation rotation.
	var upperArmRotation : Quaternion = upperArm.rotation;
	var forearmRotation : Quaternion = forearm.rotation;
	var claviclePosition : Vector3 = clavicle.position;
	
	//Offset Z.
	upperArm.position.z += offsetZ * transition;
	
	//Clavicle aproach target.
	var targetDistance : float = Vector3.Distance(upperArm.position, target.position);
	var clavicleOffset : float = Mathf.Pow(targetDistance,.2) * clavicleOffsetMultiplier;
	clavicle.position = Vector3.MoveTowards(clavicle.position, target.position, clavicleOffset); 
							
	//Upper arm looks at target.
	upperArm.eulerAngles = zeroRotation; 	
	
	var relative : Vector3 = upperArm.position - target.position;
	var angle : float = Mathf.Atan2(relative.y, relative.x) * Mathf.Rad2Deg + offsetAngle;
	upperArm.RotateAround(upperArm.position, Vector3.forward, angle);
	
	
	//Upper arm IK angle.
	var upperArmLength = Vector3.Distance(upperArm.position, forearm.position);
	var forearmLength = upperArmLength; //Without hand can't know real lengh.
	var armLength = upperArmLength + forearmLength;
	
	var clampedTargetDistance = Mathf.Min(targetDistance, armLength - 0.00001);		
	var adjacent : float = ((upperArmLength*upperArmLength) - (forearmLength*forearmLength) + (clampedTargetDistance*clampedTargetDistance))/(2*clampedTargetDistance);
	angle = Mathf.Acos(adjacent/upperArmLength) * Mathf.Rad2Deg;
	upperArm.RotateAround(upperArm.position, Vector3.forward, angle * upperArmAngleMultiplier);
		
	//Forearm looks at target.
	
	forearm.eulerAngles = zeroRotation;
	
	relative = forearm.position - target.position;;
	angle = Mathf.Atan2(relative.y, relative.x) * Mathf.Rad2Deg + offsetAngle;
	forearm.RotateAround(forearm.position, Vector3.forward, angle * forearmAngleMultiplier);
	
	//Apply transition.
	upperArm.rotation = Quaternion.Lerp(upperArmRotation, upperArm.rotation, transition);
	forearm.rotation = Quaternion.Lerp(forearmRotation, forearm.rotation, transition);
	clavicle.position = Vector3.Lerp(claviclePosition, clavicle.position, transition);
	

}