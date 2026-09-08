#pragma strict

var speed : float;
var multiplier : float;
var offset : float;

var useRigidbody : boolean;

var local : boolean;

var defaultXPosition : float;

function Start () {
	if(!local){
		defaultXPosition = transform.position.x;
	}
	else{
		defaultXPosition = transform.localPosition.x;
	}
}

function Update () {
	if(useRigidbody){
		GetComponent.<Rigidbody>().AddForce(Vector3.right * Mathf.Sin(Time.time * speed) * multiplier);
	}
	else{
		if(!local){
			transform.position.x = defaultXPosition + Mathf.Sin(Time.time * speed + offset) * multiplier;
		}
		else{
			transform.localPosition.x = defaultXPosition + Mathf.Sin(Time.time * speed + offset) * multiplier;
		}
	}
}