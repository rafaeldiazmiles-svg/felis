#pragma strict

var relative : boolean = true;
var finalXPosition : float;

var input : ControllerInput;

var enterXPos : float = 8;
var enterLevel : boolean;

var startTime : float = 1.0;

var useArea : boolean;
var centerArea : boolean = true;
var area : Bounds;

var cancel : boolean;

function Start () {
	input = transform.parent.GetComponentInChildren(ControllerInput);
	if(centerArea){
		area.center = transform.position;
	}
	
	if(relative){
		finalXPosition += transform.position.x;
		enterXPos += transform.position.x;
	}
}

function FixedUpdate () {
	if(cancel){
		return;
	}
	
	if(!useArea || area.Contains(transform.position)){
		if(transform.position.x > enterXPos){
			enterLevel = true;
		}
		
		if(transform.position.x > finalXPosition){
			if(Time.timeSinceLevelLoad > startTime && enterLevel){
				input.inputAxis.current.x = 1.0;
			}
		}
		else{
			enterLevel = false;
		}
	}
	else{
		enterLevel = false;
	}
}

function CancelEnterLevel(){
	cancel = true;
}

function OnDrawGizmosSelected(){
	#if UNITY_EDITOR
	Gizmos.DrawWireCube(area.center, area.size);
	#endif
}