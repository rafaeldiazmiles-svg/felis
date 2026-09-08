#pragma strict

var distance = 3.0;

var disable : boolean;

var onlyAlive : boolean = true;
var health : Health;

function Start () {
	var allAI : MovementAI[] = GameObject.FindObjectsOfType.<MovementAI>();
	for(var i = 0; i < allAI.Length; i++){
		allAI[i].getKeepDist.current = true;
	}

	health = GetComponentInChildren.<Health>();
}

function Update () {
	if(onlyAlive && health != null && health.health <= 0){
		disable = true;
	}
}

function OnDrawGizmosSelected(){
	#if UNITY_EDITOR
	DebugUtility.DrawCircle(transform.position, distance, Vector3.forward, Color.red);


	#endif
}