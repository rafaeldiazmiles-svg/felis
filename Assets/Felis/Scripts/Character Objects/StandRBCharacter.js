#pragma strict

var isGrounded : IsGrounded;

var RBStates : StandRBChar_RBState[];

class StandRBChar_RBState{
	var cJoint : ConfigurableJoint;

	var angularYZDrive_Spring_Grounded : float;

	var angularYZDrive_Spring_Air : float;
}


function Start () {

}

function Update () {
	if(isGrounded.isGrounded){
		for(var i = 0; i < RBStates.Length; i++){
			RBStates[i].cJoint.angularYZDrive.positionSpring = RBStates[i].angularYZDrive_Spring_Grounded;
		}
	}
	else{
		for(i = 0; i < RBStates.Length; i++){
			RBStates[i].cJoint.angularYZDrive.positionSpring = RBStates[i].angularYZDrive_Spring_Air;
		}		
	}
}