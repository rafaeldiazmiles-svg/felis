#pragma strict
var offset : float;
var speed : float = 1.0;
var length : float = 10.0;
var axis : Vector3 = Vector3(0,0,1);
@Space(30)
var phase : float;
var defRot : Quaternion;


function Start () {
	defRot = transform.localRotation;
}

function Update () {
	phase += Time.deltaTime * speed;
	transform.localRotation = defRot;
	transform.RotateAround(transform.position, axis, Mathf.Sin(phase + offset) * length);
}