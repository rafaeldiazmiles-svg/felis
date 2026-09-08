#pragma strict

var isGrounded : IsGrounded;
var sideMovement : SideMovement;

var debug : boolean;

function Start () {
	isGrounded = GetComponentInChildren.<IsGrounded>();
	sideMovement = GetComponentInChildren.<SideMovement>();
}

function Update () {

}

function OnCollisionStay(){
	if(!isGrounded.isGrounded){
		sideMovement.disableMovementUntil = Time.time + .2;

		if(Time.frameCount % 2 == 0){
			DebugUtility.DrawPoint(transform.position, 1.0, Color.red);
		}
	}
}