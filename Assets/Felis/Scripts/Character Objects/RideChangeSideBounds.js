#pragma strict

var setSide : int;

var bounds : Bounds;

var rides : Ride[];

var getTimer : Timer;

var enableOnTrigger : Trigger;

function Start () {
	if(getTimer.every == 0.0){
		getTimer.every = 6.0;
	}
}

function Update () {
	getTimer.Update();
	if(getTimer.current){
		GetRides();
	}

	if(enableOnTrigger == null || enableOnTrigger != null && enableOnTrigger.stepped.current){
		for(var i = 0; i < rides.Length; i++){
			if(bounds.Contains(rides[i].transform.position - transform.position)){
				rides[i].side = setSide;
			}
		}
	}
}

function GetRides(){
	rides = GameObject.FindObjectsOfType.<Ride>();
}

function OnDrawGizmosSelected(){
	#if UNITY_EDITOR

	Gizmos.DrawWireCube(bounds.center + transform.position, bounds.size);

	#endif
}