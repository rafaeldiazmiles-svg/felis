#pragma strict

var bounds : Bounds;

var sideMovs : SideMovement[];

var addFric : float = 10.0;
var addRunForce : float = 120.0;

function GetSideMovs(){
	sideMovs = GameObject.FindObjectsOfType.<SideMovement>();
}

function Start () {
	GetSideMovs();
}

function Update () {
	for(var i = 0; i < sideMovs.Length; i++){
		if(sideMovs[i] == null){
			continue;
		}
		if(bounds.Contains(sideMovs[i].transform.position - transform.position)){
			sideMovs[i].stairAddFriction += addFric;
			sideMovs[i].maxRunForce_StairAdd += addRunForce;
		}
	}
}

function OnDrawGizmosSelected(){
	#if UNITY_EDITOR
	Gizmos.DrawWireCube(bounds.center + transform.position, bounds.size);
	#endif
}