#pragma strict

var enableFlyAway : boolean;

var wingedFlightAI : WingedFlightAI;

var flyAwayFromPoint : Vector3;
var flyAwayFromTransform : Transform;

var flyDirection : int;
var rayCastDistance : float;
var rayCastHeight : float;

var flyHeight : float;

var targetPosition : Vector3;

var foundGround : boolean;

var groundName : String;

var debug : boolean;

function Start () {
	wingedFlightAI = transform.parent.GetComponentInChildren.<WingedFlightAI>();
}

function Update () {
	if(enableFlyAway){
		if(flyAwayFromTransform != null) flyAwayFromPoint = flyAwayFromTransform.position;
		
		flyDirection = Mathf.Sign(transform.position.x - flyAwayFromPoint.x);
		
		GetTargetPosition();
		
		wingedFlightAI.targetPosition = targetPosition;
		wingedFlightAI.useExtraHeight = true;
	}
	
	if(debug) DebugUtility.DrawPoint(targetPosition, .2, Color.yellow);
}

function GetTargetPosition(){
	var hits : RaycastHit[];
	
	hits = Physics.RaycastAll(Vector3(transform.position.x + rayCastDistance * flyDirection, transform.position.y + rayCastHeight, transform.position.z), Vector3.down, 10.0);
	
	if(debug) DebugUtility.DrawArrow(Vector3(transform.position.x + rayCastDistance * flyDirection, transform.position.y + rayCastHeight, transform.position.z),
	Vector3.down);
	
	var highestHit : RaycastHit;
	foundGround = false;
	
	for(var i = 0; i < hits.Length; i++){
		if(highestHit == null) highestHit = hits[i];
		else if(hits[i].point.y > highestHit.point.y) highestHit = hits[i];
	}
	
	if(highestHit.transform != null){
		//groundName = highestHit.transform.name;
		targetPosition = highestHit.point + Vector3.up * flyHeight;
		foundGround = true;
	}
	else  targetPosition = transform.position + Vector3.right * rayCastDistance * flyDirection;
}