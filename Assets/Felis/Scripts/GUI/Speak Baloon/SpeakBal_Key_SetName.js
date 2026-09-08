#pragma strict

@Header("----------------------Input-----------------")
var bounds : Bounds;
var doorName : String;

@Header("---------------------Values-----------------")
var playerTag : String = "Player";
var player : GameObject;
var playerInside : ToggleBoolean;
var speakBal : SpeakBal_Key;
var getTimer : Timer;



function Start () {
	if(getTimer.every == 0.0){
		getTimer.every = 2.0;
	}
}

function GetSpeakBal(){
	speakBal = GameObject.FindObjectOfType.<SpeakBal_Key>();
}

function GetPlayer(){
	player = GameObject.FindGameObjectWithTag(playerTag);
}

function Update () {
	getTimer.Update();
	if(getTimer.current){
		GetSpeakBal();
		GetPlayer();
	}
	
	playerInside.current = false;
	if(player != null){
		var bCenter : Vector3 = bounds.center;
		bounds.center += transform.position;
		if(bounds.Contains(player.transform.position)){
			playerInside.current = true;
		}

		bounds.center = bCenter;
	}
	
	if(playerInside.toggledTrue){
		if(speakBal != null){
			speakBal.doorName = doorName;
		}
	}
	
	playerInside.Update();
}

function OnDrawGizmosSelected(){
	#if UNITY_EDITOR
	Gizmos.DrawWireCube(bounds.center + transform.position, bounds.size);
	#endif
}