#pragma strict

var waitForEndOfFrame : boolean;

function Start () {
	if(!waitForEndOfFrame){
		transform.parent = null;
	}
}

function UnparentEOF(){
	yield WaitForEndOfFrame();
	transform.parent = null;
}
