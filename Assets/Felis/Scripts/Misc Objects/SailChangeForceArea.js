#pragma strict

var affectOnArea : Bounds;

var newSailForce : Vector3;

var boats : Sailboat[];

var getTimer : Timer;


function Start () {
	if(getTimer.every == 0.0){
		getTimer.every = 6.0;
	}
}

function GetBoats(){
	boats = GameObject.FindObjectsOfType.<Sailboat>();
}

function Update () {
	getTimer.Update();
	if(getTimer.current){
		GetBoats();
	}

		if(boats != null){
			for(var i = 0; i < boats.Length; i++){
				if(boats[i] == null){
					continue;
				}
				if(affectOnArea.Contains(boats[i].transform.position - transform.position)){
					boats[i].sailForce = newSailForce;
					boats[i].sailSpeed = newSailForce.x;
				}
			}
		}
}

function OnDrawGizmosSelected(){
	#if UNITY_EDITOR
	Gizmos.color = Color.red;
	Gizmos.DrawWireCube(affectOnArea.center + transform.position, affectOnArea.size);

	DebugUtility.DrawArrow(affectOnArea.center, newSailForce);
	#endif
}