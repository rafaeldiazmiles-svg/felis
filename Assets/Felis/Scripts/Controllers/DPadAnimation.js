#pragma strict

var horizontalAxis : FloatSmoothDamp;
var verticalAxis : FloatSmoothDamp;

var rotationTime : float;

var pushAngle : Vector2;

private var defaultRotation : Quaternion;

function Start () {
	defaultRotation = transform.localRotation;
}

function Update () {
		
	//Smooth damp horizontal and vertical axis values.
	horizontalAxis.time = rotationTime;
	verticalAxis.time = rotationTime;
	
	horizontalAxis.target = Mathf.Clamp(horizontalAxis.target, -1.0, 1.0);
	verticalAxis.target = Mathf.Clamp(verticalAxis.target, -1.0, 1.0);
	
	horizontalAxis.SmoothDamp();
	verticalAxis.SmoothDamp();	
				
	//Set rotation based on horizontal and vertical axis values.
 	transform.localRotation = defaultRotation;
 	
 	transform.Rotate(Vector3(-verticalAxis.current * pushAngle.y, -horizontalAxis.current * pushAngle.x, 0), Space.Self);
}