#pragma strict

var invert : boolean;

var playerTag : String = "Player";
var target : Transform;
var targetPos : Vector3;
var targetSpinRadius : float = 3.0;
var targetSpinSpeed : float = 1.0;
var spinAngle : float;
var stretchCircle : float = 1.0;

var limitTargetBounds : Bounds;

var bonesAreChildren : boolean = true;;
var bones : HingeJoint[];

var rootAngle : FloatLerp;
var minRootAngle : float = -90;
var maxRootAngle : float = 90;

var bend : FloatLerp;
var bendCurve : AnimationCurve;

var debug : boolean;

var getTimer : Timer;

var targetDistance : float;

var adjustToBend : float = 2.0;

var mouth : Transform;

function GetPlayer(){
	var playerObj : GameObject = GameObject.FindGameObjectWithTag(playerTag);
	if(playerObj != null){
		target = playerObj.transform;
	}
}

function Start () {
	if(bend.speed == 0.0){
		bend.speed = 9.0;
	}
	if(rootAngle.speed == 0.0){
		rootAngle.speed = 4.0;
	}
	
	if(bonesAreChildren){
		bones = transform.GetComponentsInChildren.<HingeJoint>();
	}

	
	if(getTimer.every == 0.0){
		getTimer.every = 3.0;
	}
}

function Update () {
	getTimer.Update();
	if(getTimer.current){
		if(target == null){
			GetPlayer();	
		}
	}
	
	
	
	if(target != null){
		spinAngle += Time.deltaTime * targetSpinSpeed;
		if(stretchCircle < 0.0001){
			stretchCircle = 0.0001;
		}
		
		var mouthPos : Vector3 = transform.position;
		if(mouth != null) mouthPos = mouth.position;
		
		var useTargetSpinRadius : float = Vector3.Distance(target.position, mouthPos);
		
		useTargetSpinRadius = Mathf.Min(useTargetSpinRadius, targetSpinRadius);
		
		targetPos = target.position + Vector3.right * Mathf.Sin(spinAngle) * useTargetSpinRadius * stretchCircle 
		+ Vector3.up * Mathf.Cos(spinAngle) * useTargetSpinRadius * (1/stretchCircle);
		
		//limit target pos
		var center : Vector3 = limitTargetBounds.center;
		limitTargetBounds.center += transform.position;
		targetPos = limitTargetBounds.ClosestPoint(targetPos);
		limitTargetBounds.center = center;
		
		targetDistance = Vector3.Distance(bones[0].transform.position, targetPos);
		var bendVal :float = bendCurve.Evaluate(targetDistance);
		
		if(invert){
			bendVal = -bendVal;
		}
		
		if(debug){
			DebugUtility.DrawPoint(targetPos, .5);
		}
		
		rootAngle.target = -90 + Mathf.Rad2Deg * Mathf.Atan2(targetPos.y -  transform.position.y, targetPos.x -  transform.position.x);
		rootAngle.target += bendVal * adjustToBend;
		rootAngle.target = Mathf.Clamp(rootAngle.target, minRootAngle, maxRootAngle);
		
		
		bend.target = bendVal;
		
	}
	
	rootAngle.Lerp();
	transform.rotation = Quaternion.identity;
	transform.RotateAround(transform.position, Vector3.forward, rootAngle.current);
	
	bend.Lerp();
	for(var i = 0; i < bones.Length; i++){
		bones[i].spring.targetPosition = bend.current;
	}
}

function OnDrawGizmos(){
	#if UNITY_EDITOR
	if(debug){
		var center : Vector3 = limitTargetBounds.center;
		limitTargetBounds.center += transform.position;
		Gizmos.DrawWireCube(limitTargetBounds.center, limitTargetBounds.size);
		limitTargetBounds.center = center;
	}
	#endif
}