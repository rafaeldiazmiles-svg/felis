#pragma strict

var hJoint : HingeJoint;

var toggleTimer : Timer;

function Start () {
	if(hJoint == null){
		hJoint = GetComponent.<HingeJoint>();
	}
}

function Update () {
	toggleTimer.Update();
	if(toggleTimer.current){
		hJoint.spring.targetPosition *= -1;
	}
}