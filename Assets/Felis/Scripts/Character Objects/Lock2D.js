#pragma strict

var useEditorVals : boolean = true;

var lockZ : boolean = true;
var zPosition : float;

var lockXYRotation : boolean;
var xRot : float;
var yRot : float;

var rb : Rigidbody;

function Start () {
	if(useEditorVals){
		zPosition = transform.position.z;
	
		xRot = transform.eulerAngles.x;
		yRot = transform.eulerAngles.y;
	}
}

function Update () {
	if(lockZ){
		transform.position.z = zPosition;
	}

	if(rb != null){
		rb.position.z = zPosition;
	}

	if(lockXYRotation){
		transform.eulerAngles.x = xRot;
		transform.eulerAngles.y = yRot;

		if(rb != null){
			rb.rotation = transform.rotation;
		}
	}
}