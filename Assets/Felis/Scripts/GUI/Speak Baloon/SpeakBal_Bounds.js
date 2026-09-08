#pragma strict

var baloonAnim : SpeakBaloonAnimate;
var bounds : Bounds;
var debug : boolean;

var player : Transform;

var playerTag : String = "Player";

function Start () {
	GetPlayer(); // player = GameObject.FindGameObjectWithTag(playerTag).transform;
	baloonAnim = GetComponent(SpeakBaloonAnimate);
}

function GetPlayer(){
	var playerObj : GameObject = GameObject.FindGameObjectWithTag(playerTag);
	if(playerObj != null) player = playerObj.transform;
}

function Update () {
	if(player == null) GetPlayer();
	if(player == null) return;
	
	if(bounds.Contains(player.position)){
		baloonAnim.playEnabled = true;
	}
	else{
		baloonAnim.playEnabled = false;
	}
}

function OnDrawGizmos(){
	#if UNITY_EDITOR
	if(debug){
		Gizmos.color = Color.blue;
		Gizmos.DrawWireCube(bounds.center, bounds.size);	
	}
	#endif
}