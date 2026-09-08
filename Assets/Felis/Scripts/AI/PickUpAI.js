#pragma strict

var target : Transform;
var pickableRigidbody : PickableRigidbody;

private var movementAI : MovementAI;

private var sideMovement : SideMovement;
static var left = -1;
static var right = 1;

var pickUpRigidbody : PickUpRigidbody; //Pick up script.

var debug : boolean;

var pickupDistance : float = 1.5;

var enablePicking : boolean;

function Start () {
	movementAI = GetComponent(MovementAI);
	sideMovement = GetComponent(SideMovement);
	if(pickUpRigidbody == null) pickUpRigidbody = GetComponent(PickUpRigidbody);
}

function Update () {
	if(target == null) {pickableRigidbody = null; return;}
	else if(pickableRigidbody == null) pickableRigidbody = target.GetComponent(PickableRigidbody);
	if(pickableRigidbody == null) return;
	
	if(!movementAI.enabled) movementAI.enabled = true;
	
	var side : int = sideMovement.currentSide;
	
	var targetSide : int = Mathf.Sign(transform.position.x - target.position.x);
	
	if(enablePicking){
		movementAI.enableMovement = true;
		
		if(!pickUpRigidbody.isPickingUp)
			movementAI.targetPosition = target.position + Vector3(targetSide * pickupDistance,0,0); //Go towards target.
		
		if(movementAI.onTarget && side != targetSide) movementAI.targetPosition = target.position; //Look at target.
		
		if(movementAI.onTarget && side == targetSide && !pickUpRigidbody.isPickingUp){
			pickUpRigidbody.pickUp = true;
			enablePicking = false;
		}
	}
	
	if(debug)
		Debug.DrawLine(transform.position, target.position, Color.gray);
}

function DropObject(){
	enablePicking = false;
	target = null;
	//pickUpRigidbody.pickUp = false;
	pickUpRigidbody.Drop();
}

function EnablePicking(newTarget : Transform){
	target = newTarget;
	enablePicking = true;
}

/*function OnDrawGizmos(){
	if(target == null || pickableRigidbody == null) return;
	if (debug){
		#if UNITY_EDITOR
		var guiStyle = new GUIStyle(); guiStyle.normal.textColor = Color.white;

		#endif
	}
}*/