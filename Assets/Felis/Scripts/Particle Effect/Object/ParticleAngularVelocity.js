#pragma strict

var randomizeInitalRotation : boolean;
var randomizeInitalRotationValue : float;

var setRandom : boolean;
var randomize : Vector2;
var startAngularVelocity : float;

var angularVelocity : float;
var drag : float;

function Start () {
	Reset();
}

function Update () {
	//transform.rotation *= Quaternion.AngleAxis(, Vector3.up);
	transform.RotateAround(transform.position, Vector3.forward, angularVelocity * Time.deltaTime);
	angularVelocity = Mathf.Lerp(angularVelocity, 0, Time.deltaTime * drag);
}

function Reset(){
	if(setRandom) startAngularVelocity = Random.Range(randomize.x,randomize.y);
	
	if(randomizeInitalRotation){
		transform.rotation *= Quaternion.AngleAxis(Random.Range(-randomizeInitalRotationValue*.5,randomizeInitalRotationValue*.5), Vector3.up);
	}
	
	angularVelocity = startAngularVelocity;	
}