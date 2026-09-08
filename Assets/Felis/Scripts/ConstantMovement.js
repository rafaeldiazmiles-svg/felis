#pragma strict

var addPos : Vector3;


function Start () {

}

function Update () {
	transform.position += addPos * Time.deltaTime;
}