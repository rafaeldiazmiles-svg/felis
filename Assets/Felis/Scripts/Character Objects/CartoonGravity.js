#pragma strict

var multiplier : float = 1.0;

var maxFallSpeed : float = 10;

var maxUnderwaterFallSpeed : float = 2.0;

var autoFindComponents : boolean = true;
var underWaterScript : UnderWater;
var movingRigidbody : Rigidbody;

var disableThisFrame_FixedUpdate : boolean;

function Start () {
	if(autoFindComponents){
		underWaterScript = GetComponent(UnderWater);
		if(underWaterScript == null && transform.parent != null) underWaterScript = transform.parent.gameObject.GetComponentInChildren(UnderWater);
		
		movingRigidbody = GetComponent.<Rigidbody>();
		if(movingRigidbody == null && transform.parent != null) movingRigidbody = transform.parent.GetComponent.<Rigidbody>();
	}
}

function FixedUpdate(){
	var force : Vector3 = Vector3.down * Mathf.Abs(movingRigidbody.velocity.y);
	
	var useMaxFallSpeed : float = maxFallSpeed;
	
	if(underWaterScript != null && underWaterScript.isUnderwater.current){
		useMaxFallSpeed = maxUnderwaterFallSpeed;
	}

	if(!disableThisFrame_FixedUpdate && movingRigidbody.velocity.y > -useMaxFallSpeed){
		movingRigidbody.AddForce(force * multiplier);
	}
	disableThisFrame_FixedUpdate = false;
}

