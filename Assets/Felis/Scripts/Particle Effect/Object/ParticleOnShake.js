#pragma strict

var playParticles : boolean;


var previousPosition : Vector3;
var currentVelocity : Vector3;

var emitVelocity : float;
var emitEvery : float;
var disableUntil : float;

function Start () {
}

function Update () {
	currentVelocity = (transform.position - previousPosition) / Time.deltaTime;
	previousPosition = transform.position;

	if(currentVelocity.magnitude > emitVelocity && Time.time > disableUntil){
		disableUntil = Time.time + emitEvery;
		
		playParticles = true;
	}
	
	if(playParticles){
		playParticles = false;
		GetComponent.<ParticleSystem>().Play();
	}
}