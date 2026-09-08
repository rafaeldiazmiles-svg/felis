#pragma strict

var pickableObjects : PickableRigidbody[];
var isGrounded : IsGrounded;
var pickableRB : PickableRigidbody;
var pickupRB : PickUpRigidbody;
var health : Health;

@Space(30)
var target : Transform;
var targetCaged : Caged;

@Space(30)
var verticalAngle : float = 8;
var cageRelativeDetectPosition : Vector3; //Position to check if a character is below the cage.
var cageDetectRange : float; //Basically the radius of the cage.
var enableMovementAfterFreedom : boolean;
var isVertical : boolean;
var forceCage : boolean;
var forceCageDist : float = 8.0;

var getTimer : Timer;

var dropDelay : float = .4;
var dropTimeLeft : float;

var disableDropDuration : float = 1.0;

var disableUntil : float;

@Space(30)

var cageDestroyDelay : float = 4.0;
var cageDestroyTimeLeft : float;

function Start () {

	isGrounded = GetComponentInChildren.<IsGrounded>();
	pickableRB = GetComponent.<PickableRigidbody>();
	pickupRB = GetComponentInChildren.<PickUpRigidbody>();
	health = GetComponentInChildren.<Health>();

	dropTimeLeft = dropDelay;

	cageDestroyTimeLeft = cageDestroyDelay;

	GetPickableObjs();
	EvaluateCageObjects();
}

function CharacterDestroy(){
	if(targetCaged != null){
		targetCaged.isCaged = false;
	}
}

function GetPickableObjs(){
	var pRBs : PickableRigidbody[] = GameObject.FindObjectsOfType.<PickableRigidbody>();
	if(pRBs != null){
		var pickableObjectsArray : Array = new Array();
		for(var i = 0; i < pRBs.Length; i++){
			pRBs[i].GetCharacterNow();
			if(pRBs[i].character.GetComponent.<Caged>() == null){
				continue;
			}
			pickableObjectsArray.Push(pRBs[i]);
		}
		pickableObjects = pickableObjectsArray.ToBuiltin(PickableRigidbody);
	}
}

var debug = true;

function LateUpdate () {
	getTimer.Update();
	if(getTimer.current){
		GetPickableObjs();
	}

	if(Time.time > disableUntil){
		//Is the cage vertical?
			isVertical = Mathf.Abs(Mathf.DeltaAngle(transform.eulerAngles.z, 0)) < verticalAngle;	

		//Cage characters if cage drops on top.
		if(!pickableRB.beingPicked.current){
			if(pickupRB.pickedObject == null){
				EvaluateCageObjects();
			}
			

		}

		//Uncage
		if(pickupRB.pickedObject != null && isVertical && pickableRB.beingPicked.current){
			dropTimeLeft -= Time.deltaTime;
		}

		if(dropTimeLeft < 0){
			dropTimeLeft = dropDelay;

			pickupRB.Drop();
			targetCaged.isCaged = false;
			disableUntil = Time.time + disableDropDuration;
		}
	}

	if(pickupRB.pickedObject == null && pickableRB.pickingObject == null){
		cageDestroyTimeLeft -= Time.deltaTime;
	}
	else{
		cageDestroyTimeLeft = cageDestroyDelay;
	}

	if(cageDestroyTimeLeft < 0){
		health.health = 0.0;
	}
}

function EvaluateCageObjects(){
	for(var i = 0; i < pickableObjects.Length; i++){
		if(pickableObjects[i] == null){
			continue;
		}

		var thisCaged : Caged = pickableObjects[i].character.GetComponent.<Caged>();

		if(thisCaged == null){
			continue;
		}

		if(!pickableObjects[i].pickable || pickableObjects[i].beingPicked.current || pickableObjects[i] == pickableRB){
			 continue;
		}

		var dist : float = Vector3.Distance(pickableObjects[i].transform.position, transform.TransformPoint(cageRelativeDetectPosition));
			
		if(forceCage){
			if(dist < forceCageDist){
				pickupRB.Pick(pickableObjects[i]);
				thisCaged.isCaged = true;
				forceCage = false;
				targetCaged = thisCaged;
				return;
			}
		}

		//Cage and un-cage.
		if(dist < cageDetectRange && isVertical && !isGrounded.isGrounded){
			pickupRB.Pick(pickableObjects[i]);
			thisCaged.isCaged = true;
			targetCaged = thisCaged;
		}
	}
}

function OnDrawGizmosSelected(){
	if(debug){
		Gizmos.color = Color.blue;
		DebugUtility.DrawCircle(transform.TransformPoint(cageRelativeDetectPosition), cageDetectRange, Vector3.forward);

		Gizmos.color = Color.red;
		DebugUtility.DrawCircle(transform.TransformPoint(cageRelativeDetectPosition), forceCageDist, Vector3.forward);
	}
}