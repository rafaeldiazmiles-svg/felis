#pragma strict

var defaultRotaiton : Quaternion;

function Start () {
	defaultRotaiton = transform.rotation;
}

function Update () {

	var angle : float = Mathf.Atan2(Camera.main.transform.position.x - transform.position.x, Camera.main.transform.position.z - transform.position.z) * Mathf.Rad2Deg;
	transform.rotation = defaultRotaiton * Quaternion.Euler(0,angle,0);
}