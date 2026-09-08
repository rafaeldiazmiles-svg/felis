#pragma strict

var sceneCamera : Transform;

var useMainCamera : boolean = true;

var rotationCurve : AnimationCurve;

private var deltaXPosition : float;

var applyMode : ApplyMode;

private var defaultRotation : Quaternion;

function Start () {
	if(useMainCamera){
		sceneCamera = Camera.main.transform;
	}
	
	defaultRotation = transform.localRotation;
}

function FixedUpdate () {
	deltaXPosition = transform.position.x - sceneCamera.position.x;
	
	if(applyMode == ApplyMode.absolute) transform.localRotation = defaultRotation;
	
	transform.RotateAround(transform.position, Vector3.up, rotationCurve.Evaluate(deltaXPosition));
}