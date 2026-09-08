#pragma strict

var radius : float;

var stopF : StopFrictionDrag[];
var forceF : ForceFriction[];

var getTimer : Timer;

function Start () {
	if(getTimer.every == 0.0){
		getTimer.every = 4.0;
	}
}

function Update () {
	getTimer.Update();
	if(getTimer.current){
		GetForceItems();
	}

	for(var i = 0; i < stopF.Length; i++){
		if(stopF[i] == null){
			continue;
		}
		var dist : float = Vector3.Distance(transform.position, stopF[i].transform.position);
		if( dist < radius){
			stopF[i].BreakDrag();
		}
	}
	for(i = 0; i < forceF.Length; i++){
		if(forceF[i] == null){
			continue;
		}
		dist = Vector3.Distance(transform.position, forceF[i].transform.position);
		if( dist < radius){
			forceF[i].disableUntil = Time.time + .1;
		}
	}
}

function GetForceItems(){
	stopF = GameObject.FindObjectsOfType.<StopFrictionDrag>();
	forceF = GameObject.FindObjectsOfType.<ForceFriction>();
}

function OnDrawGizmosSelected(){
	#if UNITY_EDITOR
	DebugUtility.DrawCircle(transform.position, radius, Vector3.forward, Color.red);
	#endif
}