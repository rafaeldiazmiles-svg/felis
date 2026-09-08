#pragma strict

@Header("----------Input---------")
var bounds : Bounds;
var disable : boolean;
@Header("---------Values---------")
var targets : Array;
var checkTimer : Timer;
var toggledTrue : boolean;
var inTargets : Array;

static var arbitraryTimerVal : float = 8.0;

function Start () {
	if(checkTimer.every == 0.0){
		checkTimer.every = arbitraryTimerVal;
	}
	targets = new Array();
	CheckTargets();
	
	inTargets = new Array();
}

function CheckTargets(){
	targets.Clear();
	var rbs : Rigidbody[] = GameObject.FindObjectsOfType.<Rigidbody>();
	for(var i = 0; i < rbs.Length; i++){
		var isGrounded : IsGrounded = rbs[i].GetComponentInChildren.<IsGrounded>();
		if(isGrounded == null) continue;
		
		var newFallObj : FallObj = new FallObj();
		newFallObj.t = rbs[i].transform;
		newFallObj.colliders = rbs[i].transform.GetComponentsInChildren.<Collider>();
		newFallObj.isGrounded = rbs[i].transform.GetComponentInChildren.<IsGrounded>();
		newFallObj.friction = rbs[i].transform.GetComponentInChildren.<StopFrictionDrag>();
		targets.Push(newFallObj);
	}
}

class FallObj{
	var t : Transform;
	var colliders : Collider[];
	var isGrounded : IsGrounded;
	var friction : StopFrictionDrag; 
}

function Update () {
	//Check Targets
	checkTimer.Update();
	if(checkTimer.current){
		CheckTargets();
	}
	
	//Update Targets
	var center : Vector3 = bounds.center;
	bounds.center += transform.position;
	toggledTrue = false;
	
	for(var target : FallObj in targets){
		if(target.t == null) continue;
		
		if(bounds.Contains(target.t.position)){
			toggledTrue = true;
			//There's no ground nor friction.
			if(target.isGrounded != null){
				target.isGrounded.forceNotGroundedUntil = Time.time + .1;
			}
			if(target.friction != null){
				target.friction.stopTime = 0.0;
			}
			
			//Push target into array if array doesn't have it.
			var hasTarget : boolean;
			for(var m = 0; m < inTargets.length; m++){
				var thisTarget : FallObj = inTargets[m];
				if(thisTarget == target){
					hasTarget = true;
					break;
				}
			}
			if(!hasTarget){
				inTargets.Push(target);
			}
			
			//Disable all target's colliders.
			for(var i = 0; i < target.colliders.Length; i ++){
				target.colliders[i].enabled = false;
			}
			
		}

	}
	
	for(var n = inTargets.length - 1; n >= 0; n--){
		thisTarget = inTargets[n];
		if(thisTarget == null) continue;
		if(thisTarget.t == null) continue;
		
		if(!bounds.Contains(thisTarget.t.position)){

			var beingPicked : boolean;
			var pickableRB : PickableRigidbody;		
			pickableRB = thisTarget.t.GetComponentInChildren.<PickableRigidbody>();
			if(pickableRB != null){
				beingPicked = pickableRB.beingPicked.current;
			}
			
			if(!beingPicked){
				//Enable all target's colliders.
				for(i = 0; i < thisTarget.colliders.Length; i ++){
					thisTarget.colliders[i].enabled = true;
				}
				//Debug.Log(thisTarget.t.name + " " + Time.time);
			}
			inTargets.RemoveAt(n);
		}
	}
	
	bounds.center = center;
}

function OnDrawGizmosSelected(){
	#if UNITY_EDITOR
	Gizmos.DrawWireCube(bounds.center + transform.position, bounds.size);
	for(var target : FallObj in targets){
		if(target.t == null) continue;
		DebugUtility.DrawPoint(target.t.position, .5);
	}
		
	#endif
}