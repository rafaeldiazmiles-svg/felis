#pragma strict

var enableBounds : BoundsArray;
var disableBounds : BoundsArray;

var scripts : MonoBehaviour[];

var player : GameObject;
var playerTag : String = "Player";

var getTimer : Timer;

function GetPlayer(){
	player = GameObject.FindGameObjectWithTag(playerTag);
}

function Start () {
	if(getTimer.every == 0.0){
		getTimer.every = 3.0;
	}
}

function Update () {
	getTimer.Update();
	if(getTimer.current){
		if(player == null){
			GetPlayer();
		}
	}

	if(player != null){
		if(enableBounds.ContainsWithCenter(player.transform.position, transform.position)){
			ScriptsSet(true);
		}

		if(disableBounds.ContainsWithCenter(player.transform.position, transform.position)){
			ScriptsSet(false);
		}

	}
}

function ScriptsSet(valueSet : boolean){
	for(var i = 0; i < scripts.Length; i++){
		scripts[i].enabled = valueSet;
	}
}

function OnDrawGizmosSelected(){
	#if UNITY_EDITOR
	Gizmos.color = Color.green;
	enableBounds.DrawWireCubesWithCenter(transform.position);
	Gizmos.color = Color.red;
	disableBounds.DrawWireCubesWithCenter(transform.position);
	#endif
}