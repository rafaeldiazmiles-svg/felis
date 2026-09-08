#pragma strict

var door : Transform;
var doorAnimationComponent : Animation;

var doorOpenAnimationClip : AnimationClip;
var doorCloseAnimationClip : AnimationClip;

var doorOpenAnimWeightControl : FloatLerp;
var doorCloseAnimWeightControl : FloatLerp;

var isGrounded : IsGrounded;
var wasGrounded : boolean;
var landed : boolean;

var doorOpenCloseTime : FloatMoveTowards;

var angle : float;
var angleHandle : Transform;

var tiltAngle : float = 30.0;
var tilted : ToggleBoolean;

var drop : boolean;

var landTime : float;
var landTimeDrop : float = .7;

var health : Health;
var healthDropPointPct : float = .5;

var configurableJoint : ConfigurableJoint;

var pickUpRB : PickUpRigidbody;
var dropCatDelay : float = .5;
var dropCatTime : float;
var dropCat : boolean;

var dontFall : ToggleBoolean;
var connectedAnchorPos : Vector3;
var connectedAnchorMoveUp : float = 3.0;

var linkToLooseSlab : Trigger;

var chainFollowBreak : FollowBreak;

var gateSound : AudioSource;

var rb : Rigidbody;


function Start () {
	doorAnimationComponent = GetComponentInChildren(Animation);
	door = doorAnimationComponent.transform;
	
	isGrounded = GetComponentInChildren(IsGrounded);
	
	health = GetComponentInChildren(Health);
	
	configurableJoint = GetComponent(ConfigurableJoint);
	
	pickUpRB = GetComponentInChildren(PickUpRigidbody);
	
	connectedAnchorPos = configurableJoint.connectedAnchor;
	
	rb = GetComponent.<Rigidbody>();
	
	if(linkToLooseSlab == null){
		dontFall.current = false;
	}
	else{	
		dontFall.current = true;
	}
	
	//LinkToSlab();
}

function LinkToSlab(){
	var allSlabs : Trigger[] = GameObject.FindObjectsOfType.<Trigger>();
	var closest : Trigger;
	var closestDist : float = Mathf.Infinity;
	for(var i = 0; i < allSlabs.Length; i++){
		var thisDist : float  = Vector3.Distance(transform.position, allSlabs[i].transform.position);
		if(thisDist < closestDist){
			closest = allSlabs[i];
			closestDist = thisDist;
		}
	}
	linkToLooseSlab = closest;
	dontFall.current = true;
}

function CharacterDestroy(){
	if(pickUpRB != null && pickUpRB.pickedObject != null && pickUpRB.pickedObject.character != null){
		var caged : Caged = pickUpRB.pickedObject.character.GetComponentInChildren.<Caged>();
	}

	if(caged != null){
		caged.isCaged = false;
	}
}

function Update () {
	if(pickUpRB.justPickedUp){
		//Debug.Log(Time.time);
		var caged : Caged = pickUpRB.pickedObject.character.GetComponentInChildren.<Caged>();
		if(caged != null){
			caged.isCaged = true;
		}
	}

	dontFall.Update();
	if(dontFall.toggledTrue){
		configurableJoint.connectedAnchor = connectedAnchorPos + Vector3(0, connectedAnchorMoveUp, 0);
	}
	if(dontFall.toggledFalse){
		configurableJoint.connectedAnchor = connectedAnchorPos;
	}	
	
	if(linkToLooseSlab != null){
		if(linkToLooseSlab.stepped.toggledTrue){
			dontFall.current = false;
		}
	}
	
	doorOpenCloseTime.MoveTowards();
	doorOpenAnimWeightControl.Lerp();
	doorCloseAnimWeightControl.Lerp();
	tilted.Update();
	
	landed = false;
	if(isGrounded.isGrounded){
		landTime += Time.deltaTime;
	}
	else{
		landTime = Mathf.MoveTowards(landTime, 0.0, Time.deltaTime);
	}
	
	wasGrounded = isGrounded.isGrounded;
	
	if(landTime > landTimeDrop){
		landed = true;
	}
	
	if(landed){
		CatOut();
		drop = true;
	}
	
	if(dropCat && Time.time > dropCatTime || landed && pickUpRB.pickedObject != null){
		dropCat = false;
		if(pickUpRB != null && pickUpRB.pickedObject != null && pickUpRB.pickedObject.character != null){
			caged = pickUpRB.pickedObject.character.GetComponentInChildren.<Caged>();
		}

		if(caged != null){
			caged.isCaged = false;
		}		
		pickUpRB.Drop();
	}
	
	if(doorOpenCloseTime.target > doorOpenCloseTime.current){
		doorOpenAnimWeightControl.target = 1.0;
		doorCloseAnimWeightControl.target = 0.0;
	}
	else{
		doorOpenAnimWeightControl.target = 0.0;
		doorCloseAnimWeightControl.target = 1.0;		
	}
	
	
	doorAnimationComponent[doorOpenAnimationClip.name].enabled = true;
	doorAnimationComponent[doorCloseAnimationClip.name].enabled = true;
	
	doorAnimationComponent[doorOpenAnimationClip.name].normalizedTime = doorOpenCloseTime.current;
	doorAnimationComponent[doorCloseAnimationClip.name].normalizedTime = 1-doorOpenCloseTime.current;
	
	doorAnimationComponent[doorOpenAnimationClip.name].speed = 0.0;
	doorAnimationComponent[doorCloseAnimationClip.name].speed = 0.0;

	doorAnimationComponent[doorOpenAnimationClip.name].weight = doorOpenAnimWeightControl.current;
	doorAnimationComponent[doorCloseAnimationClip.name].weight = doorCloseAnimWeightControl.current;
	
	angle = Mathf.Atan2(transform.position.y - angleHandle.position.y, transform.position.x - angleHandle.position.x) * Mathf.Rad2Deg;
	
	if(Mathf.Abs(angle) > tiltAngle){
		tilted.current = true;
	}
	else{
		tilted.current = false;
	}
	
	if(tilted.toggledTrue){
		//doorOpenCloseTime.target = 0.0;
	}
	if(tilted.toggledFalse){
		//doorOpenCloseTime.target = 1.0;
	}
	
	if(!drop && !dontFall.current && health.health < health.maxHealth * healthDropPointPct && pickUpRB.isPickingUp && !dropCat){
		drop = true;
		CatOut();
	}
	
	if(dontFall.current){
		health.health = health.maxHealth;
	}

	if(drop){
		drop = false;
		configurableJoint.xDrive.positionSpring = 0.0;
		configurableJoint.xDrive.positionDamper = 0.0;
		configurableJoint.yDrive.positionSpring = 0.0;
		configurableJoint.yDrive.positionDamper = 0.0;
		configurableJoint.angularYZDrive.positionSpring = 0.0;
		configurableJoint.angularYZDrive.positionDamper = 0.0;
		if(chainFollowBreak != null) chainFollowBreak.breakDist = 0.0;
	}
}

function CatOut(){
	dropCat = true;
	dropCatTime = Time.time + dropCatDelay;
	doorOpenCloseTime.target = 1.0;
	gateSound.Play();
}