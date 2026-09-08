#pragma strict

var viewportPosition : Vector3;

var sceneCamera : Camera;
var useMainCamera : boolean = true;

function Start () {
	if(useMainCamera){
		sceneCamera = Camera.main;
	}
}

function Update () {
	transform.position = sceneCamera.ViewportToWorldPoint(viewportPosition);
}