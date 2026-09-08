#pragma strict

var autoFindComponents : boolean = true;
var isGroundedScript : IsGrounded;
//var sideMovementScript : SideMovement;
var rigidbodyAccelerationScript : RigidbodyAccelerationInfo;

var autofindByName : String[];

var spineTransforms : Transform[];
var spineDefaultRot : Quaternion[];

var smoothTime : float = .2;
var multiplier : float = 1.0;
var maxAngle : float = 20.0;
var currentAngle : float;
var targetAngle : float;
var angleOffset : float;
var angleVelocity : float;
var side : int;
var horizontalInertiaMultiplier : float = 10.0;
var maxInertiaAngle : float = 40.0;

var disable : boolean;

function GetSpine(){
	var spineObjs : Array = new Array();
	var allObjs : Transform [] = transform.parent.GetComponentsInChildren.<Transform>() as Transform[];
	for(var i = 0; i < allObjs.Length; i++){
		if(allObjs[i].name.ToLower().Contains("spine") || allObjs[i].name.ToLower().Contains("head")){
			spineObjs.Push(allObjs[i]);
		}
	}
	
	spineTransforms = spineObjs.ToBuiltin(Transform) as Transform[];
}

function Start () {
	if(autoFindComponents){
		isGroundedScript = GetComponentInChildren(IsGrounded);
		//sideMovementScript = GetComponentInChildren(SideMovement);
		rigidbodyAccelerationScript = GetComponentInChildren(RigidbodyAccelerationInfo);
		
		if(transform.parent != null){
			if(isGroundedScript == null) isGroundedScript = transform.parent.gameObject.GetComponentInChildren(IsGrounded);
			//if(sideMovementScript == null) sideMovementScript = transform.parent.gameObject.GetComponentInChildren(SideMovement);
			if(rigidbodyAccelerationScript == null) rigidbodyAccelerationScript = transform.parent.gameObject.GetComponentInChildren(RigidbodyAccelerationInfo);
		}
		
		if(autofindByName != null){
			AutoGetSpine();
		}
	}
	
	if(spineTransforms == null){
		GetSpine();
	}
	
	spineDefaultRot = new Quaternion[spineTransforms.Length];
	for(var i = 0; i < spineTransforms.Length; i++){
		spineDefaultRot[i] = spineTransforms[i].rotation;
	}
}

function AutoGetSpine(){
	var allT : Transform[] = transform.parent.GetComponentsInChildren.<Transform>();
	var spineArray : Array = new Array();
	for(var n = 0; n < autofindByName.Length; n++){
		for(var m = 0; m < allT.Length; m++){
			if(allT[m].name.ToLower().Contains(autofindByName[n].ToLower())){
				spineArray.Push(allT[m]);
			}
		}
	}
	spineTransforms = spineArray.ToBuiltin(Transform) as Transform[];
}

function Update(){
	for(var i = 0; i < spineTransforms.Length; i++){
		if(spineTransforms[i] == null){
			continue;
		}
		spineTransforms[i].rotation = spineDefaultRot[i];
	}
}

function LateUpdate () {
	var isGrounded : boolean = isGroundedScript.isGrounded;
	var floorNormal : Vector3 = isGroundedScript.floorNormal;
	side = Mathf.Sign(transform.parent.localScale.x); //sideMovementScript.currentSide;
	var acceleration : Vector3 = rigidbodyAccelerationScript.GetAcceleration();
	
	if(isGrounded){
		targetAngle = Mathf.DeltaAngle( Mathf.Atan2( floorNormal.x, floorNormal.y ) * Mathf.Rad2Deg , 
		Mathf.Atan2( transform.up.x, transform.up.y ) * Mathf.Rad2Deg);
		
		targetAngle *= multiplier ;
		
		targetAngle = Mathf.Clamp(targetAngle, -maxAngle, maxAngle);
		
		targetAngle *= side;
	}
	else{
		targetAngle = 0;
	}
	
	targetAngle += Mathf.Min(Mathf.Abs(acceleration.x), maxInertiaAngle) * Mathf.Sign(acceleration.x) * side * horizontalInertiaMultiplier;

	targetAngle += angleOffset;

	currentAngle = Mathf.SmoothDamp(currentAngle, targetAngle, angleVelocity, smoothTime);



	if(!disable){
		for(var i = 0; i < spineTransforms.Length; i++){
			if(spineTransforms[i] == null) continue;
			spineTransforms[i].RotateAround(spineTransforms[i].position, -Vector3.forward, currentAngle / spineTransforms.Length);	
		}
	}
}