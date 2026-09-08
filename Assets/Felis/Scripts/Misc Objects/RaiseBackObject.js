#pragma strict

var rb : Rigidbody;

var raiseBack : boolean;
var raiseBackSpeed : float = 1.0;
var forceMultiplier : float = 1000.0;

var useInitialHeight : boolean = true;
var settleHeight : float;

var isGrounded : IsGrounded;

var slowDown : boolean;

var slowDownDrag : float = 100.0;
var defaultDrag : float = 0.0;

var raiseBackOnDeath : Health;

var resetTrigger : boolean;
var trigger : BoundsTriggerGravity;

var autoRaiseBack : boolean;
var raiseBackDelay : float;

var raiseOnSlabPress : boolean;
var getSlabBounds : Bounds;
var slabRaise : Trigger;
var getTimer : Timer;

var raiseSound : AudioSource;

var triggerCancelRaise : boolean;

var land_CreatePrefab : GameObject;

function GetSlab(){
	if(getSlabBounds.size.magnitude == 0.0){
		return;
	}
	var slabs : Trigger[] = GameObject.FindObjectsOfType.<Trigger>();
	for(var i = 0; i < slabs.Length; i++){
		if(getSlabBounds.Contains(slabs[i].transform.position - transform.position)){
			slabRaise = slabs[i];
			break;
		}
	}
}

function Start () {
	if(useInitialHeight){
		settleHeight = transform.position.y;
	}
	
	rb =  GetComponent.<Rigidbody>();
	isGrounded = GetComponentInChildren.<IsGrounded>();
	
	defaultDrag = rb.drag;

	if(getTimer.every == 0.0){
		getTimer.every = 2.0;
	}

}

function Update () {
	getTimer.Update();
	if(getTimer.current){
		if(raiseOnSlabPress && slabRaise == null){
			GetSlab();
		}
	}
	if(raiseBack && transform.position.y > settleHeight){
		rb.useGravity = false;
		raiseBack = false;
		slowDown = true;
	}
	
	if(slowDown){
		if(rb.velocity.magnitude > 0.0001){
			rb.drag = slowDownDrag;
		}
		else{
			rb.drag = defaultDrag;
			slowDown = false;
			
			if(resetTrigger && trigger != null){
				trigger.triggered = false;
			}
		}
	}

	if(triggerCancelRaise && trigger != null && trigger.triggered && slabRaise != null && !slabRaise.stepped.current){
		slowDown = false;
		rb.drag = defaultDrag;
		raiseBack = false;
		rb.useGravity = true;
	}
	
	if(raiseBack){
		PhysicsUtility.ApplyForceForVelocity(rb, Vector3(0,raiseBackSpeed,0), forceMultiplier);
		raiseSound.volume = Mathf.Lerp(raiseSound.volume, 1.0, Time.deltaTime * 5.0);
	}
	else{
		raiseSound.volume = Mathf.Lerp(raiseSound.volume, 0.0, Time.deltaTime * 15.0);
	}

	if(raiseBackOnDeath != null &&  raiseBackOnDeath.health <= 0.0 
	|| !slowDown && autoRaiseBack && trigger.triggered && Time.time > trigger.lastTriggerTime +  raiseBackDelay
	|| !slowDown && raiseOnSlabPress && slabRaise != null && slabRaise.stepped.current && transform.position.y < settleHeight){
		raiseBack = true;
		raiseBackOnDeath = null;
	}

	if(!isGrounded.wasGrounded && isGrounded.isGrounded){
		if(land_CreatePrefab != null){
			var newPrefabInstance : GameObject = GameObject.Instantiate(land_CreatePrefab);
			newPrefabInstance.transform.position = transform.position;
		}
	}
}

function OnDrawGizmosSelected(){
	#if UNITY_EDITOR
	Gizmos.DrawWireCube(getSlabBounds.center + transform.position, getSlabBounds.size);
	if(getSlabBounds.size.magnitude > .1){
		Handles.Label(getSlabBounds.center + transform.position, "Find Slab");
	}
	#endif
}