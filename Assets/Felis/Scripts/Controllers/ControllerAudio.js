#pragma strict

var input : ControllerInput;

var buttonASound : AudioSource;
var buttonBSound : AudioSource;


function Start () {
	input = GetComponent.<ControllerInput>();
}

function Update () {
	if(input.inputButtonA.down){
		buttonASound.Play();
	}
	if(input.inputButtonB.down){
		buttonBSound.Play();
	}
}