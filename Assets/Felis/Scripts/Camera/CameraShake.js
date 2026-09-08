#pragma strict

var shakeNow : boolean;

var cameraShakiness : Shakiness;

function Start () {

}

function Update () {
	if(shakeNow){
		shakeNow = false;
		if(Camera.main.transform.parent != null){
			cameraShakiness = Camera.main.transform.parent.GetComponent(Shakiness);
		}

		if(cameraShakiness != null){
			cameraShakiness.highQuake = true;
		}	
	}
}