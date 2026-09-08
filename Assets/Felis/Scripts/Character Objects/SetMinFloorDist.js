#pragma strict

var isGrounded : IsGrounded;

var groundTag : String = "Ground Collider";

var addDist : float = .15;
var blendSpeed : float = 4.0;

var haveTouchedGround : boolean;
var noGroundMinGD : float = .1;

function Start () {
	isGrounded = GetComponentInChildren.<IsGrounded>();
}

function OnCollisionStay(col : Collision){
	if(col.gameObject.tag == groundTag){	
		isGrounded.minFloorDistanceScale = false;
		isGrounded.minFloorDistance = Mathf.Lerp(isGrounded.minFloorDistance, isGrounded.avgGroundDistance + addDist, Time.deltaTime * blendSpeed);
		haveTouchedGround = true;
	}
}

function Update () {
	if(!haveTouchedGround){
		isGrounded.minFloorDistance = noGroundMinGD;
	}
}