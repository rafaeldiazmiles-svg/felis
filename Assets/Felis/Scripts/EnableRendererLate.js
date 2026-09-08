#pragma strict

var rend : Renderer;

var waitFrames : int = 2.0;

function Start () {
	rend = GetComponent.<Renderer>();
}

function LateUpdate () {
	waitFrames --;
	if(waitFrames < 0){
		rend.enabled = true;
	}
}