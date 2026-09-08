#pragma strict

var emitPosition : Vector3;
var emitRadius : float;
var sweatDropPrefab : GameObject;
var emitRate : float;
var emitRateRandomness : float;

var emitWait : float;
var currentEmitWait : float;

 var nextEmitTime : float;

var sideMovementAnimation : SideMovementAnimation;
var sideMovement : SideMovement;
var isGrounded : IsGrounded;

var toggleSide : boolean;

var forceSweatDropUntil : float;

var useRoot : boolean = true;
var charRoot : Transform;

function Start () {
	if(useRoot) charRoot = transform.root;
		
	sideMovementAnimation = charRoot.GetComponentInChildren(SideMovementAnimation);
	sideMovement = charRoot.gameObject.GetComponentInChildren(SideMovement);
	isGrounded = charRoot.GetComponentInChildren(IsGrounded);
	
	currentEmitWait = emitWait;
}

function LateUpdate () {
	var side : int = 1.0;
	if(sideMovement != null){
		side = sideMovement.currentSide;
	}

	var almostFalling : boolean;
	var pushing : boolean;
	if(sideMovementAnimation != null){
		if(sideMovementAnimation.almostFalling.current){
			almostFalling = true;
		}
		if(sideMovementAnimation.IsPushing()){
			pushing = true;
		}
	}

	if(isGrounded.isGrounded){ 
		if(almostFalling || pushing || Time.time <  forceSweatDropUntil){ 
			currentEmitWait -= Time.deltaTime;
		}
		else{
			currentEmitWait = emitWait;
		}
	}
	
	if(currentEmitWait < 0 && Time.time > nextEmitTime){
		var useSide : int = side;
		var useEmitRate : float = emitRate;
		var useEmitRateRandomness : float = emitRateRandomness;
		
		//Both sides.
		if(almostFalling || Time.time <  forceSweatDropUntil){
			if(toggleSide){
				useSide *= -1;
			}
			toggleSide = !toggleSide;	
			useEmitRate *= 2.0;
			useEmitRateRandomness *= .5;
		}	
		
		var newParticle : GameObject = Instantiate(sweatDropPrefab);
		newParticle.transform.position = transform.position + Vector3(emitPosition.x * useSide, emitPosition.y, emitPosition.z) + (Random.insideUnitSphere * emitRadius);
		newParticle.GetComponent(RandomProjectile).side = useSide;
		nextEmitTime = Time.time + (1.0/useEmitRate) + Random.value * useEmitRateRandomness;

	}
}
