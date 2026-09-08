#pragma strict

var rotationHeight : float = -4;
var deltaOffset : float = 1;
var maxRot : float = 0;
var minRot : float = -20;

var setDefaultRotation : boolean = true;

@Space(30)
var defaultRotation : Quaternion;

function Start () {
	defaultRotation = transform.rotation;
}



function LateUpdate(){
	if(setDefaultRotation){
		transform.rotation = defaultRotation;
	}
	var deltaHeight : float = transform.position.y - Camera.main.transform.position.y + deltaOffset;
	var angle : float = deltaHeight * rotationHeight;
	angle = Mathf.Clamp(angle, minRot, maxRot);
	transform.RotateAround(transform.position, Vector3.right, angle);
}