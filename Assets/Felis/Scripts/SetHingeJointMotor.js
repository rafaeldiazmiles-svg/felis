#pragma strict



function SetHingeJointMotorTargetSpeed (speed : float) {
	var hj : HingeJoint = GetComponent.<HingeJoint>();
	if(hj != null){
		hj.motor.targetVelocity = speed;
	}
}

