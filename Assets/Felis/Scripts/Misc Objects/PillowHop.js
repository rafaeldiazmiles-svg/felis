#pragma strict

var prospero : Transform;
var playerTag : String = "Player";
var prosperoIsGrounded : IsGrounded;

var isGroundedToggle : ToggleBoolean;

var landArea : Bounds;

var debug : boolean;

var pillowAnimation : PlayStillAnimation;

function Start () {
	 GetPlayer();
}

function GetPlayer(){
	var playerObj : GameObject = GameObject.FindGameObjectWithTag(playerTag);
	if(playerObj != null){
		prospero = playerObj.transform;
		prosperoIsGrounded = prospero.GetComponentInChildren.<IsGrounded>();
	}
}

function Update () {
	if(prospero == null){
		GetPlayer();
	}
	else{
		isGroundedToggle.current = prosperoIsGrounded.isGrounded;
		isGroundedToggle.Update();
		
		if(prospero != null && landArea.Contains(prospero.position) && isGroundedToggle.toggledTrue){
			pillowAnimation.animationPlay.current = true;
		}
	}
}

function OnDrawGizmosSelected(){
	#if UNITY_EDITOR
	if(debug){
		Gizmos.DrawWireCube(landArea.center, landArea.size);
	}
	#endif
}