#pragma strict

var character : Transform;
var targetPos : Vector3;
var playerTag : String = "Player";
var characterRigidbody : Rigidbody;
var sideMovementScript : SideMovement;

var smoothSideOffset : FloatLerp;
var sideOffset : float = .5;
var sideOffsetSpeed : float = 1.0;
var characterXPos : float;
var lockX : boolean;
var lockXTransition : FloatLerp;
var lockXTransitionSpeed : float = 2.0;
var lockXPos : float;
var targetXPos : float;

var heightSpeed : float = 2.0;
var deltaHeight : float;
var deltaHeightSpeed : float = .5;
var heightTarget : float;
var lockVelocityFollowUntil : float;
var verticalCameraVelocity : float;

var maxHeightOffset : float = .5;
var minHeightOffset : float = 0.0;

var zDistance : float = 12.0;
//var bigScreenZDistance : float = 4.0;
var zDistanceSpeedCurve : AnimationCurve;
var zDistanceTime : float = .5;
var smoothZDistance : FloatSmoothDamp;
var cameraLocationZoom : float; //Zoom added by PlayerCameraLocation script.
var addZoom : FloatLerp;
var changedZoom : boolean;
var addZoomPriority : int; 

var minX : float;
var maxX : float;

var disableLimitsBounds : Bounds[]; 

var setTargetPos : boolean;
var newTargetPos : Vector3;

function SetPos(tpos : Vector3){
	setTargetPos = true;
	newTargetPos = tpos;
}

function SetAddZoom(newZoom : float, priority : int){
	if(priority >= addZoomPriority){
		addZoom.target = newZoom;
		changedZoom = true;
	}
}

function GetPlayer(){
	var targetCharacterObj : GameObject = GameObject.FindGameObjectWithTag(playerTag);
	if(targetCharacterObj != null){
		character = targetCharacterObj.transform;
		characterRigidbody = targetCharacterObj.GetComponent.<Rigidbody>();
		sideMovementScript = targetCharacterObj.GetComponentInChildren.<SideMovement>();
		
	}
}

function Start () {
	if(addZoom.speed == 0.0){
		addZoom.speed = 8.0;
	}

	GetPlayer();
 	
 	var clampX : CameraClampXVals = GameObject.FindObjectOfType.<CameraClampXVals>();
 	if(clampX != null){
 		minX = clampX.minX;
 		maxX = clampX.maxX;
 	}
 	
	smoothZDistance.current = zDistance;
	smoothZDistance.target = zDistance;

	targetPos = transform.position;
}

function Update(){
	if(character == null) GetPlayer();

	if(setTargetPos){
		setTargetPos = false;
		targetPos = newTargetPos;
	}
	else{
		if(character != null){
			targetPos = character.position;
		}
	}

	if(sideMovementScript != null){
		var side : int = sideMovementScript.currentSide;
	}	
	
	//Horizontal.
	smoothSideOffset.speed = sideOffsetSpeed;
	smoothSideOffset.target = -side * sideOffset;
	
	smoothSideOffset.Lerp();
	
	lockXTransition.speed = lockXTransitionSpeed;
	
	if(lockX) lockXTransition.target = 1.0;
	else lockXTransition.target = 0.0;
	
	lockXTransition.Lerp();
	
	if(character != null){
		var characterXPos : float = targetPos.x + smoothSideOffset.current;
	}
	
	targetXPos = Mathf.Lerp(characterXPos, lockXPos, lockXTransition.current);
	
	transform.position.x = targetXPos;
	
	
	
	//Height.
	deltaHeight = heightTarget - transform.position.y;
	
	
	if(deltaHeight > maxHeightOffset){
		verticalCameraVelocity = Mathf.Max(verticalCameraVelocity, 0);
		transform.position.y = Mathf.Lerp(transform.position.y, heightTarget + maxHeightOffset, Time.deltaTime * heightSpeed);
	}
	if(deltaHeight < minHeightOffset){
		verticalCameraVelocity = Mathf.Min(verticalCameraVelocity, 0);
		transform.position.y = Mathf.Lerp(transform.position.y, heightTarget - minHeightOffset, Time.deltaTime * heightSpeed);
	}
	if(deltaHeight > minHeightOffset && deltaHeight < maxHeightOffset){
		verticalCameraVelocity = 0.0;
	}
	
	heightTarget = targetPos.y;

	//Z position.
	if(!changedZoom){
		addZoom.target = 0.0;
	}
	changedZoom = false;
	addZoomPriority = 0;
	addZoom.Lerp();
	smoothZDistance.time = zDistanceTime;
	if(characterRigidbody != null){
		smoothZDistance.target = zDistance + zDistanceSpeedCurve.Evaluate(characterRigidbody.velocity.magnitude) + addZoom.current;
		smoothZDistance.target += cameraLocationZoom;
	}
	#if UNITY_STANDALONE
	//smoothZDistance.target += bigScreenZDistance;
	#endif
	
	smoothZDistance.SmoothDamp();
	
	transform.position.z = smoothZDistance.current;
	
	var disableLimits : boolean;
	for(var i = 0; i < disableLimitsBounds.Length; i++){
		if(disableLimitsBounds[i].Contains(targetPos)){
			disableLimits = true;
			break;
		}
	}
	if(!disableLimits){
		if(transform.position.x < minX) transform.position.x = minX;
		if(transform.position.x > maxX) transform.position.x = maxX;
	}
}

function FixedUpdate(){
	if(Time.time > lockVelocityFollowUntil){
		if(characterRigidbody != null){
			verticalCameraVelocity = characterRigidbody.velocity.y;
			transform.position.y += verticalCameraVelocity * Time.deltaTime * Mathf.Abs(deltaHeight) * deltaHeightSpeed;
		}
	}
}

function OnDrawGizmosSelected(){
	#if UNITY_EDITOR
	for(var i = 0 ; i < disableLimitsBounds.Length; i++){
		Gizmos.DrawWireCube(disableLimitsBounds[i].center, disableLimitsBounds[i].size);
	}
	#endif
}