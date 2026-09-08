#pragma strict

var velocity : Vector3;
var previousPosition : Vector3;
var acceleration : Vector3;
var previousVelocity : Vector3;

var debug : boolean;

var useUpdate : boolean;
var useLateUpdate : boolean;
var useFixedUpdate : boolean;

var local : boolean;

function Start () {
	if(local){
		previousPosition = transform.localPosition;
	}
	else{
		previousPosition = transform.position;
	}
}

function Update () {
	if(useUpdate){
		ProcessGlobalValues();
	}
}

function LateUpdate(){
	if(useLateUpdate){
		ProcessGlobalValues();
	}
}

function FixedUpdate(){
	if(useFixedUpdate){
		ProcessGlobalValues();
	}
}

function GetVelocity() : Vector3{
	return velocity;
}

function GetAcceleration() : Vector3{
	return acceleration;
}

function OnDrawGizmos(){
	#if UNITY_EDITOR
	if(debug && Application.isPlaying){
		var guiStyle : GUIStyle = new GUIStyle();
		guiStyle.normal.textColor = Color.white;
		//Handles.Label(transform.position, velocity.ToString(), guiStyle);
		//Handles.Label(transform.TransformPoint(0,-.2,0), acceleration.ToString(), guiStyle);
		DebugUtility.DrawArrow(transform.position, acceleration * 0.1, Color.red);
		DebugUtility.DrawArrow(transform.position, velocity * 3.0, Color.green);
	}
	#endif	
}

function ProcessGlobalValues(){
	var deltaTime : float = Mathf.Max(0.00001, Time.deltaTime);
	if(local){
		velocity = (transform.localPosition - previousPosition) / deltaTime;
		previousPosition = transform.localPosition;
	}
	else{
		velocity = (transform.position - previousPosition) / deltaTime;
		previousPosition = transform.position;
	}

	acceleration = (velocity - previousVelocity) / deltaTime;
	previousVelocity = velocity;
}
	
