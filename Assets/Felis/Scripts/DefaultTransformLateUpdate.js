#pragma strict

var keepPosition : boolean = true;
var keepRotation : boolean = true;
var keepScale : boolean = true;

var positionSpace : Space;
var rotationSpace : Space;

var defualtPosition : Vector3;
var defaultRotation : Quaternion;
var defaultScale : Vector3;

private var defualtLocalPosition : Vector3;
private var defaultLocalRotation : Quaternion;

function Start () {
	defualtPosition = transform.position;
	defualtLocalPosition = transform.localPosition;

	defaultRotation = transform.rotation;
	defaultLocalRotation = transform.localRotation;
	
	defaultScale = transform.localScale;
}

function LateUpdate () {  
	if(keepPosition) {
		if(positionSpace == Space.Self) transform.localPosition = defualtLocalPosition;
		else transform.position = defualtPosition;
	}

	if(keepRotation){
		if(rotationSpace == Space.Self)	transform.localRotation = defaultLocalRotation;
		else transform.rotation = defaultRotation;
	}
	
	if(keepScale){
		transform.localScale = defaultScale;
	}
}