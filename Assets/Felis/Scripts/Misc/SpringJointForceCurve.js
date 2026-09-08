#pragma strict

var sj : SpringJoint;


var forceCurve : AnimationCurve;
var multiplier : float = 100;
var speedRangeMultiplier : float = 4.0;

var startPos : Vector3;

var configurableJointMode : boolean;
var confJoint : ConfigurableJoint;

function Start () {
	sj = GetComponent.<SpringJoint>();
	startPos = transform.position;

	if(configurableJointMode){
		confJoint = GetComponent.<ConfigurableJoint>();
	}
}

function FixedUpdate () {
	var dist : float = Vector3.Distance(startPos, transform.position);

	if(configurableJointMode){
		confJoint.angularYZDrive.positionSpring = forceCurve.Evaluate(dist * speedRangeMultiplier) * multiplier;
		confJoint.yDrive.positionSpring = forceCurve.Evaluate(dist * speedRangeMultiplier) * multiplier;
	}
	else{
		sj.spring = forceCurve.Evaluate(dist * speedRangeMultiplier) * multiplier;
	}
}