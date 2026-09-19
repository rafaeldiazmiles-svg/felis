	#pragma strict

@Header("--------------Autoget Components------------")
var flightAI : WingedFlightAI;
var patrolAI : PatrolAI;
var alphaGroups : AlphaColorGroups;
var targets : Transform[];
var tagList : String[];
var eyeGlow : GlowItem;
@Header("--------------Input------------")
var detectRange : float = 7;
var ignoreIfDead : boolean;
var shootDelay : float = 2.0;
private var shootDelayMul : float = 0.48;
private var minShootDelay : float = 0.5;
var shootBone : Transform;
var ammoPrefab : GameObject;
var shootForceMultiplier : float = 100;
var effectVisbileOnTimeLeft : float = 1.0;
@Space(30)
var effectA : Transform;
var effectAFindString : String = "Effect A";
var effectB : Transform;
var effectBFindString : String = "Effect B";
var effectASpinSpeed : float = 250;
var effectAScaleCurve : AnimationCurve;
var effectBSpinSpeed : float = -250;
var effectBRadiusCurve : AnimationCurve;
var glowSizeMultiplier : float = 4.0;
var fireBurstPrefab : GameObject;
var fireBurstRotationLeft : float = -90;
var fireBurstRotationRight : float = 90;
var fireBurstOffset : float = .3;
var fireBurstScale : float = 1.7;

@Header("--------------Values------------")
var closestTarget : Transform;
var closestTargetDist : float;
var targetOffset : Vector3;
var inRange : ToggleBoolean;;
var shootTimeLeft : float;
var shoot : ToggleBoolean;
var effectIsVisible : ToggleBoolean;
var effectBChildren : Transform[];
var effectBChildrenOrignialPos : Vector3[];

function Start () {
	flightAI = transform.parent.GetComponentInChildren(WingedFlightAI);
	patrolAI = transform.parent.GetComponentInChildren(PatrolAI);
	alphaGroups = transform.parent.GetComponentInChildren(AlphaColorGroups);
	if(eyeGlow == null){
		eyeGlow = transform.parent.GetComponentInChildren(GlowItem);
	}

	GetTargets();

	shootDelay *= shootDelayMul;
	if(shootDelay < minShootDelay) shootDelay = minShootDelay;
	shootTimeLeft = shootDelay;
	
	
	
	var children : Transform[] = transform.parent.GetComponentsInChildren.<Transform>() as Transform[];
	for(var i = 0; i < children.Length; i++){
		if(children[i].name.ToLower().Contains(effectAFindString.ToLower())){
			effectA = children[i];
		}
		if(children[i].name.ToLower().Contains(effectBFindString.ToLower())){
			effectB = children[i];
		}
		if(effectA != null && effectB != null){
			break;
		}
	}
	
	if(effectB != null){
		var effectBChildrenArray : Array = new Array();
		var effectBChildrenIncParent : Transform[] = effectB.GetComponentsInChildren.<Transform>() as Transform[];
		for(var n = 0; n < effectBChildrenIncParent.Length; n++){
			if(effectBChildrenIncParent[n] != effectB){
				effectBChildrenArray.Push(effectBChildrenIncParent[n]);
			}
		}
		effectBChildren = effectBChildrenArray.ToBuiltin(Transform) as Transform[];
	}
	
	effectBChildrenOrignialPos = new Vector3[effectBChildren.Length];
	if(effectBChildren != null){
		for(var m = 0; m < effectBChildren.Length; m++){
			effectBChildrenOrignialPos[m] = effectBChildren[m].localPosition;
		}
	}
}

function LateUpdate () {
	FindClosestTarget();
	inRange.Update();
	shoot.Update();

	
	if(inRange.toggledTrue){
		patrolAI.enablePatrol = false;
	}
	
	if(inRange.current){
		flightAI.targetPosition = closestTarget.position + targetOffset;
		
		if(shootTimeLeft > 0){
			shootTimeLeft -= Time.deltaTime;
			shoot.current = false;
		}
		else{
			shootTimeLeft = 0;
			shoot.current = true;
		}

		effectIsVisible.current = true;
	}
	else{
		effectIsVisible.current = false;
	}
	effectIsVisible.Update();
	
	if(inRange.toggledFalse){
		patrolAI.enablePatrol = true;

		shootTimeLeft = shootDelay;
	}
	
	if(shoot.toggledTrue){
		shootTimeLeft = shootDelay;
		if(ammoPrefab != null){
			var firedBullet : GameObject = Instantiate(ammoPrefab);
			if(shootBone != null){
				firedBullet.transform.position = shootBone.position;
			}
			else{
				firedBullet.transform.position = transform.position;
			}
			var firedBulletRB : Rigidbody = firedBullet.GetComponentInChildren.<Rigidbody>();
			var shootForce : float = (closestTarget.position.x - transform.position.x) * shootForceMultiplier;
			firedBulletRB.AddForce(Vector3(shootForce,shootForce*.3,0));
			
			if(fireBurstPrefab != null && shootBone != null){
				var newFireBurst : GameObject = Instantiate(fireBurstPrefab);
				newFireBurst.transform.position = shootBone.position;
				newFireBurst.transform.parent = shootBone;
				newFireBurst.transform.localScale = Vector3.one * fireBurstScale;
				if(transform.parent.localScale.x < 0 ){
					newFireBurst.transform.localEulerAngles.z = fireBurstRotationLeft;
				}
				else{
					newFireBurst.transform.localEulerAngles.z = fireBurstRotationRight;
				}
				newFireBurst.transform.position += newFireBurst.transform.up * fireBurstOffset;
			}
		}
	}
	
	/*if(shootTimeLeft < effectVisbileOnTimeLeft){
		effectIsVisible.current = true;
	}
	else{
		effectIsVisible.current = false;
	}*/
	if(effectIsVisible.toggledTrue){
		alphaGroups.alphaFrameGroups[0].currentFrame = 0;	
	}
	if(effectIsVisible.toggledFalse){
		alphaGroups.alphaFrameGroups[0].currentFrame = -1;
	}
	if(effectIsVisible.current){
		effectA.transform.localEulerAngles.z += Time.deltaTime * effectASpinSpeed;
		
		var effectScale : float = effectAScaleCurve.Evaluate(shootTimeLeft);
		effectA.transform.localScale = Vector3.one * effectScale;
		
		for(var i = 0; i < effectBChildren.Length; i++){
			effectBChildren[i].localScale = Vector3.one * effectScale;
			effectBChildren[i].localPosition = Vector3.Lerp(effectBChildrenOrignialPos[i], Vector3.zero, effectBRadiusCurve.Evaluate(shootTimeLeft));
		}
		
		effectB.transform.localEulerAngles.z += Time.deltaTime * effectBSpinSpeed;
		
		eyeGlow.size = effectScale * glowSizeMultiplier;
	}
	else{
		eyeGlow.size = 0.0;
	}
}

function GetTargets(){
	var targetsArray : Array = new Array();
	for(var i = 0; i < tagList.Length; i++){
		var tagObjects : GameObject[] = GameObject.FindGameObjectsWithTag(tagList[i]);
		for(var n = 0; n < tagObjects.Length; n++){
			if(tagObjects[n].transform.parent == null){
				targetsArray.Push(tagObjects[n].transform);
			}
		}
	}
	targets = targetsArray.ToBuiltin(Transform) as Transform[];	
}

function FindClosestTarget(){
	closestTarget = null;
	closestTargetDist = Mathf.Infinity;
	for(var i = 0; i < targets.Length; i++){
		 if(targets[i] == null) continue;
		if(ignoreIfDead){
			var targetHealth : Health = targets[i].GetComponentInChildren.<Health>();
			if(targetHealth != null){
				if(targetHealth.health <= 0) continue;
			}
		}
		
		if(targets[i] == null){
			GetTargets();
			break;
		}
		var currentDist : float = Vector3.Distance(targets[i].position, transform.position);
		if(currentDist < closestTargetDist){
			closestTarget = targets[i];
			closestTargetDist = currentDist;
		}
	}
	inRange.current = closestTargetDist < detectRange;
}