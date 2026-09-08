#pragma strict

var keepPosition : boolean = true;
var keepRotation : boolean = true;
var keepScale : boolean = true;

var positionSpace : Space;
var rotationSpace : Space;

private var defualtPosition : Vector3;
private var defaultRotation : Quaternion;
private var defaultScale : Vector3;

private var defualtLocalPosition : Vector3;
private var defaultLocalRotation : Quaternion;

function Start () {
	defualtPosition = transform.position;
	defualtLocalPosition = transform.localPosition;

	defaultRotation = transform.rotation;
	defaultLocalRotation = transform.localRotation;
	
	defaultScale = transform.localScale;
}

function FixedUpdate () {
	if(keepPosition){
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