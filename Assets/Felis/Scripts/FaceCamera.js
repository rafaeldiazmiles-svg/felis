#pragma strict

@script ExecuteInEditMode()

var offset : Vector3;

function Start () {
	if(Camera.main != null){
		transform.LookAt(Camera.main.transform.position, Vector3.up);
		transform.Rotate(offset);
	}
}

function Update () {
	if(Camera.main != null){
		transform.LookAt(Camera.main.transform.position, Vector3.up);
		transform.Rotate(offset);
	}
		
}