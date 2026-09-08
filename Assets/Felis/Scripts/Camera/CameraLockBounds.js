#pragma strict

var player : GameObject;
var playerTag : String = "Player";
var playerMng : CharacterScriptMng;

var fChar : FollowCharacter;

var bounds : BoundsArray;

var lockCam : boolean;
var lockPos : Vector3;

var useFInputBounds : ForceInputBounds; //Match bounds to Force Input

var disablePlayerController : boolean;

function Start () {
	fChar = GameObject.FindObjectOfType.<FollowCharacter>();

	if(useFInputBounds != null){
		bounds = useFInputBounds.bounds;
	}
}

function Update () {


	if(Time.frameCount % 100 == 0){
		if(player == null){
			player = GameObject.FindGameObjectWithTag(playerTag);
			if(player != null){
				playerMng = player.GetComponent.<CharacterScriptMng>();
			}
		}

		if(fChar == null){
			fChar = GameObject.FindObjectOfType.<FollowCharacter>();
		}

	}

	if(!lockCam && fChar != null && player != null && bounds.ContainsWithCenter(player.transform.position, transform.position)){
		lockCam = true;
		lockPos = player.transform.position;
	}

	if(lockCam && fChar != null){
		fChar.SetPos(lockPos);
		if(disablePlayerController){
			playerMng.input.disableUntil = Time.time + .5;
		}
	}
}

function OnDrawGizmosSelected(){
	#if UNITY_EDITOR
	Gizmos.color = Color.red;
	bounds.DrawWireCubesWithCenter(transform.position);
	#endif
}