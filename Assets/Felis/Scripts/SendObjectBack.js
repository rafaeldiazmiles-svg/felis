#pragma strict

var sendBackObject : Transform;
var useProspero : boolean;
var detectDistance : float;
var sendBackPosition : Transform;
var delayTime : float;

private var detected : boolean = false;
private var detectTime : float;

function Start () {
	if(useProspero)
		sendBackObject = GameObject.Find("Prospero").transform.parent;
}

function Update () {
	if(!detected && Vector3.Distance(sendBackObject.position, transform.position) < detectDistance){
		detected = true;
		detectTime = Time.time;
	}
	
	if(detected && Time.time > detectTime + delayTime){
		sendBackObject.position = sendBackPosition.position;
		detected = false;
	}
}

function OnDrawGizmosSelected(){
	Gizmos.DrawSphere(transform.position, detectDistance);
}