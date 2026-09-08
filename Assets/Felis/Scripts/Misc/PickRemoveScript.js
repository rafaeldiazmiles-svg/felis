#pragma strict

var pickableRB : PickableRigidbody;

var otherPRB : PickableRigidbody[];

var removeScripts : MonoBehaviour[];

var removeConfigurableJoint : boolean;

function Start () {
	if(pickableRB == null){
		pickableRB = GetComponentInChildren.<PickableRigidbody>();
	}
}

function Update () {
	if(pickableRB.beingPicked.toggledTrue){
		RemoveScripts();
	}

	for(var n = 0; n < otherPRB.Length; n ++){
		if(otherPRB[n].beingPicked.toggledTrue){
			RemoveScripts();
		}
	}
}

function RemoveScripts(){
	for(var i = 0; i < removeScripts.Length; i++){
		Destroy(removeScripts[i]);
	}

	if(removeConfigurableJoint){
		Destroy(GetComponent.<ConfigurableJoint>());
	}	
}