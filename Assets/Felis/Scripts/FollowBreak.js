#pragma strict

var target : Transform;
var useStartingOffset : boolean = true;
var offset : Vector3;

var x : boolean;
var y : boolean;
var z : boolean;

var startPos : Vector3;
var breakDist : float;
var breakFollow : boolean;

var playBreakAnim : AnimationClip;

function Start () {
	if(useStartingOffset) offset = transform.position - target.position;
	
	startPos = transform.position;
}

function Update () {
	if(!breakFollow){
		if(x)transform.position.x = target.position.x + offset.x;
		if(y)transform.position.y = target.position.y + offset.y;
		if(z)transform.position.z = target.position.z + offset.z;
	}
	
	if(!breakFollow && Vector3.Distance(transform.position, startPos) > breakDist){
		breakFollow = true;	
		GetComponent.<Animation>()[playBreakAnim.name].enabled = true;
		GetComponent.<Animation>()[playBreakAnim.name].weight = 1.0;
		GetComponent.<Animation>()[playBreakAnim.name].time = 0.0;
	}
}