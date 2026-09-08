#pragma strict

var speed : float;
var multiplier : float;
var additive : boolean;
@Space(20)
var useRigidbody : boolean;



private var defaultYPosition : float;



function Start () {
	defaultYPosition = transform.position.y;
}

function Update () {
	if(useRigidbody){
		GetComponent.<Rigidbody>().AddForce(Vector3.up * Mathf.Sin(Time.time * speed) * multiplier);
	}
	else{
		if(additive){
			transform.position.y += Mathf.Sin(Time.time * speed) * multiplier * Time.deltaTime;
		}
		else{
			transform.position.y = defaultYPosition + Mathf.Sin(Time.time * speed) * multiplier;
		}
	}
}