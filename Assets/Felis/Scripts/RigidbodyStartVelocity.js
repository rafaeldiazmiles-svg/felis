#pragma strict

var startVelocity : Vector3;
var randomizeVelocity : Vector3;


function SetStartVelocity(newStartVel : Vector3){
	startVelocity = newStartVel;
}

function Start () {
	GetComponent.<Rigidbody>().velocity = startVelocity + Vector3(
	Random.Range(-randomizeVelocity.x * .5, randomizeVelocity.x * .5), 
	Random.Range(-randomizeVelocity.y * .5, randomizeVelocity.y * .5),
	Random.Range(-randomizeVelocity.z * .5, randomizeVelocity.z * .5));
}

function Update () {

}