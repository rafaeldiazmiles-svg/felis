#pragma strict

var teleportPositions : TeleportPosition[];

var playerTag : String = "Player";

var debug : boolean;

function SetOnPlayer(){
	var player : GameObject = GameObject.FindGameObjectWithTag(playerTag);
	if(player != null){
		var teleport : Teleport = player.GetComponentInChildren(Teleport);
		if(teleport != null){
			teleport.teleportPositions = teleportPositions;
		}
		Destroy(gameObject);
	}
}

function Start () {
	AddLocations();
	SetOnPlayer();
}


function AddLocations(){
	var places : TeleportAddPlace[] = GameObject.FindObjectsOfType.<TeleportAddPlace>();
	var tPosArray : Array = new Array();
	
	for(var n = 0; n < teleportPositions.Length; n++){
		tPosArray.Push(teleportPositions[n]);
	}
	
	for(var i = 0; i < places.Length; i++){
		tPosArray.Push(places[i].teleportPosition);
	}
	
	teleportPositions = tPosArray.ToBuiltin(TeleportPosition) as TeleportPosition[];
}

function Update () {
	SetOnPlayer();
}

function OnDrawGizmosSelected(){
	#if UNITY_EDITOR
	if(debug){
		for(var i = 0; i < teleportPositions.Length; i++){
			Gizmos.color  = Color.blue;
			Gizmos.DrawSphere(teleportPositions[i].position,.2);
			Handles.Label(teleportPositions[i].position, teleportPositions[i].key.ToString());
		}				
	}
	#endif
}