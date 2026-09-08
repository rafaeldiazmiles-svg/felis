#pragma strict

var playerTag : String = "Player";
var player : GameObject;

var playerInBounds : boolean;

var getTimer : Timer;

var useNearestRG : boolean;
var useSearchBounds : boolean = true;
var searchBounds : Bounds;
var targetRB : Rigidbody;

var forceBounds : Bounds[];
var desiredVelocity : Vector3;
var useX : boolean = true;
var useY : boolean = false;
var useZ : boolean = false;
var forceMultiplier : float = 1.0;

var force : Vector3Lerp;

function GetPlayer(){
	player = GameObject.FindGameObjectWithTag(playerTag);
}

function GetTargetRB(){
	var rbs : Rigidbody[] = GameObject.FindObjectsOfType.<Rigidbody>();
	var closestDist : float = Mathf.Infinity;
	var bCenter: Vector3 = searchBounds.center;
	searchBounds.center += transform.position;
	for(var i = 0; i < rbs.Length; i++){
		if(useSearchBounds && !searchBounds.Contains(rbs[i].transform.position)){
			continue;
		}
		var thisDist : float = Vector3.Distance(transform.position, rbs[i].transform.position);
		if( thisDist < closestDist){
			closestDist = thisDist;
			targetRB = rbs[i];
		}
	}
	
	searchBounds.center = bCenter;
}

function Start () {
	if(getTimer.every == 0.0){
		getTimer.every = 2.0;
	}
	
	if(force.speed == 0.0){
		force.speed = 15.0;
	}
}

function Update () {
	getTimer.Update();
	if(getTimer.current){
		if(player == null){
			GetPlayer();
		}
		if(targetRB == null){
			GetTargetRB();
		}
	}
	
	
	playerInBounds = false;
	if(player != null && targetRB != null){
		
		for(var i = 0; i < forceBounds.Length; i++){
			var bCenter : Vector3 = forceBounds[i].center;
			
			forceBounds[i].center += transform.position;
			
			if(forceBounds[i].Contains(player.transform.position)){
				playerInBounds = true;
			}
			forceBounds[i].center = bCenter;
			
			if(playerInBounds) {
				break;
			}
		}
		
		if(playerInBounds){
			force.target = (desiredVelocity - targetRB.velocity) * forceMultiplier;
			if(!useX){
				force.current.x = 0.0;
			}
			if(!useY){
				force.current.y = 0.0;
			}
			if(!useZ){
				force.current.z = 0.0;
			}
			
			
		}
		else{
			force.target = Vector3.zero;
		}
	}
	
	force.Lerp();
}

function FixedUpdate(){
	if(targetRB != null){
		targetRB.AddForce(force.current);
	}
}

function OnDrawGizmosSelected(){
	#if UNITY_EDITOR
	Gizmos.color = Color.grey;
	Gizmos.DrawWireCube(searchBounds.center + transform.position, searchBounds.size);
	if(forceBounds != null){
		for(var i = 0; i < forceBounds.Length; i++){
			Gizmos.color = Color.red;
			Gizmos.DrawWireCube(forceBounds[i].center + transform.position, forceBounds[i].size);
		}
	}
	#endif
}