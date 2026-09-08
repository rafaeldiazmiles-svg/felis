
var character : Transform;
var sideMovementScript : SideMovement;
var animationComponent : Animation;
var rb : Rigidbody;
var frameGroups : UVFrameGroups;
var maxRBDeltaPos : MaxRigidbodyDeltaPos;
var frictionDrag : StopFrictionDrag;
var forceFriction: ForceFriction;
var isGrounded : IsGrounded;

var target : Transform;
var offset : Vector3;

var beingPicked : ToggleBoolean;
var pickingObject : PickUpRigidbody;
var transition : FloatSmoothDamp; //0 not picked ... 1 picked.

var disableOnPick : MonoBehaviour[];
var colliders : Collider[];

var transitionTime : float = 1.0;
var unPickShootForce : Vector3;
var usePickerShootForce : Vector3;
var shootUpShiftForce : float = 4.0;
var shootUpwards : boolean;

var pickingObjectSide : int = 1;
static var left = -1;
static var right = 1;

var pickedClip : AnimationClip;
var layer : int;
var weight : FloatSmoothDamp;
static var blendTime : float = .1;

var useFatherRotation : boolean = true;
var forceFatherRotation : boolean;
var lerpRotation : boolean;
var lerpRotationSpeed : float = 3.0;
var nonCharacterPickedAngle : float;
var offsetAngle : Vector3;
var offsetAngleZ_Side : boolean;

var pickable : boolean = true;

var losingCat : LosingCat;

var colliderFreeDistance : float = .8; //Will collide with enemies 

var defaultLayer : int;

//var layerTimer : Timer;

/*var dontCollideWEnemyAfterDropDelay : float = .5;
var catTag : String = "Cat";
var playerTagName : String = "Player";*/

var forceVerticalDrop : boolean;

var setFathersSide : boolean = true;

var noPickAfterDropDelay : float = .1;

var ID : int;
var onlyPickableBy : int[];

var dropIfBeingPicked : PickUpRigidbody;

var noPickingRBAttack : boolean;

@Space(30)
var transferPick : boolean;
var transferPickID : int; //If PickUpRigidbody with ID is nearby, transfer it.
var transferDist : float = 1.5;
var transfterDelay : float = .1;

@Space(30)
var nextDropLightly : boolean; //skip shoot force;

@Space(30)
var slipNow : boolean;
@Space(30)
var disableCompTest : boolean;
@Space(30)
var setAddMass : boolean;
var addMass : float = 1.0;

function GetCharacterNow(){
	if(transform.parent != null){
		character = transform.parent;
	}
	else{
		character = transform;
	}
}

function Slip(){
	beingPicked.current = false;
	pickingObject.pickedObject = null;
	pickingObject = null;
}

function Start () {
	

	if(transform.parent != null){
		colliders = transform.parent.GetComponentsInChildren.<Collider>() as Collider[];
	}
	else{
		colliders = GetComponentsInChildren.<Collider>() as Collider[];
	}
	
	//layerTimer.every = .25;
	
	if(sideMovementScript == null) sideMovementScript = GetComponentInChildren(SideMovement);
	if(animationComponent == null)animationComponent = GetComponentInChildren(Animation);
	if(rb == null) rb = GetComponentInChildren(Rigidbody);
	if(frameGroups == null) frameGroups = GetComponentInChildren(UVFrameGroups);
	if(maxRBDeltaPos == null)maxRBDeltaPos = GetComponentInChildren(MaxRigidbodyDeltaPos);
	if(frictionDrag == null) frictionDrag = GetComponentInChildren(StopFrictionDrag);
	if(forceFriction == null) forceFriction = GetComponentInChildren(ForceFriction);
	if(isGrounded == null) isGrounded = GetComponentInChildren.<IsGrounded>();

	if(transform.parent != null){
		if(sideMovementScript == null) sideMovementScript = transform.parent.GetComponentInChildren(SideMovement);
		if(animationComponent == null) animationComponent = transform.parent.GetComponentInChildren(Animation);
		if(rb == null) rb = transform.parent.GetComponentInChildren(Rigidbody);
		if(frameGroups == null) frameGroups = transform.parent.GetComponentInChildren(UVFrameGroups);
		if(maxRBDeltaPos == null) maxRBDeltaPos = transform.parent.GetComponentInChildren(MaxRigidbodyDeltaPos);
		if(frictionDrag == null) frictionDrag = transform.parent.GetComponentInChildren(StopFrictionDrag);
		if(forceFriction == null) forceFriction = transform.parent.GetComponentInChildren(ForceFriction);
		if(isGrounded == null) isGrounded = transform.parent.GetComponentInChildren.<IsGrounded>();
	}

	if(character == null){
		if(transform.parent != null){
			character = transform.parent;
		}
		else{
			 character = transform;
		}
	}

	defaultLayer = character.gameObject.layer;

	weight.time = blendTime;

	var allScriptsArray = new Array();
	if(transform.parent != null){
		allScriptsArray = transform.parent.GetComponentsInChildren.<MonoBehaviour>() as MonoBehaviour[];
		for(var i = allScriptsArray.length - 1; i >= 0; i--){
			var thisScript : MonoBehaviour = allScriptsArray[i];
			if(thisScript.transform == transform) allScriptsArray.RemoveAt(i);
			if(thisScript instanceof SquashPhysics) allScriptsArray.RemoveAt(i);
			if(thisScript instanceof Squash) allScriptsArray.RemoveAt(i);
			if(thisScript instanceof CatTied) allScriptsArray.RemoveAt(i);
			if(thisScript instanceof Shadow) allScriptsArray.RemoveAt(i);
			if(thisScript instanceof MaxRigidbodyDeltaPos) allScriptsArray.RemoveAt(i);
			if(thisScript instanceof ChangeProportions) allScriptsArray.RemoveAt(i);
			if(thisScript instanceof ColorControl) allScriptsArray.RemoveAt(i);
			if(thisScript instanceof UnderWater) allScriptsArray.RemoveAt(i);
			if(thisScript instanceof TimedDestroy) allScriptsArray.RemoveAt(i);
			if(thisScript instanceof Fuse) allScriptsArray.RemoveAt(i);
			if(thisScript instanceof SetFrameBounds) allScriptsArray.RemoveAt(i);
			if(thisScript instanceof Potion) allScriptsArray.RemoveAt(i);
			if(thisScript instanceof VertexColorGroups) allScriptsArray.RemoveAt(i);
			if(thisScript instanceof UVFrameGroups) allScriptsArray.RemoveAt(i);
			if(thisScript instanceof CustomBone) allScriptsArray.RemoveAt(i);
			if(thisScript instanceof FaceAnim) allScriptsArray.RemoveAt(i);
			if(thisScript instanceof SweatDropsParticles) allScriptsArray.RemoveAt(i);
			if(thisScript instanceof Caged) allScriptsArray.RemoveAt(i);
			if(thisScript instanceof CharacterActiveByBounds) allScriptsArray.RemoveAt(i);
			if(thisScript instanceof PickRemoveScript) allScriptsArray.RemoveAt(i);
			if(thisScript instanceof PickUpRigidbody) allScriptsArray.RemoveAt(i);
			if(thisScript instanceof IsGrounded) allScriptsArray.RemoveAt(i);
			if(thisScript instanceof Health) allScriptsArray.RemoveAt(i);
			if(thisScript instanceof PlayLoopAnimation) allScriptsArray.RemoveAt(i);
			if(thisScript instanceof MovementAI) allScriptsArray.RemoveAt(i);
			if(thisScript instanceof WaitForProspero) allScriptsArray.RemoveAt(i);
			if(thisScript instanceof CharacterParty) allScriptsArray.RemoveAt(i);
			if(thisScript.gameObject.tag == "Help Baloon")allScriptsArray.RemoveAt(i);
		}
		disableOnPick = allScriptsArray.ToBuiltin(MonoBehaviour) as MonoBehaviour[];
	}
	
	RegisterPickableRB();

	transition.time = transitionTime;

	beingPicked.toggledTrueTime = 0.0;
	beingPicked.toggledFalseTime = 0.0;
}

function RegisterPickableRB(){
	var allPickUpRB : PickUpRigidbody[] = FindObjectsOfType.<PickUpRigidbody>() as PickUpRigidbody[];
	for(var i = 0; i < allPickUpRB.Length; i++){
		allPickUpRB[i].GetPickableObjs();//getPickableRB.current = true; //GetPickableObjs();
	}
}

function Update () {
	if(disableCompTest){
		SetDisableComponents(false);
	}

	if(slipNow){
		slipNow = false;
		Slip();
	}

	if(pickingObject != null){
		pickingObjectSide = pickingObject.side;

		if(pickingObject.pickedObject == null){
			Slip();
		}
	}


	beingPicked.Update();

	/*layerTimer.Update();
	if(layerTimer.current && !beingPicked.current && Time.time > beingPicked.toggledFalseTime + dontCollideWEnemyAfterDropDelay 
	&& transform.parent!= null && transform.parent.gameObject.tag == catTag){
		var sceneColliders : Collider[] = gameObject.FindObjectsOfType(Collider) as Collider[];
		var noColliderNearby : boolean = true;
		var thisCollider : Collider;
		
		if(transform.parent != null) thisCollider = transform.parent.GetComponent.<Collider>();
		else thisCollider = GetComponent.<Collider>();

		for(var i = 0; i < sceneColliders.Length; i++){
			if(sceneColliders[i] == thisCollider) continue;
			if(Vector3.Distance(transform.position, sceneColliders[i].transform.position) < colliderFreeDistance){
				noColliderNearby = false;
			}
		}
		
		if(noColliderNearby){
			transform.parent.gameObject.layer = defaultLayer;
		}
	}*/
	
	if(pickingObject == null){
		beingPicked.current = false;
	}
	
	//Animation if there's any.
	if(pickedClip != null){
		animationComponent[pickedClip.name].enabled = weight.current > .1;
		animationComponent[pickedClip.name].weight = weight.current;
		animationComponent[pickedClip.name].layer = layer;
	}

	if(beingPicked.toggledTrue){
		SetColliders(false);
		
		rb.useGravity = false;
		rb.velocity = Vector3.zero;
		rb.angularVelocity = Vector3.zero;
		SetDisableComponents(false);
		
		pickable = false;

		//Tag don't collide for a while
		/*if(pickingObject!= null && pickingObject.transform != null){
		
			if( (pickingObject.transform.parent == null && pickingObject.gameObject.tag != playerTagName)
			|| (pickingObject.transform.parent != null && pickingObject.transform.parent.tag != playerTagName) ){
			
				if(transform.parent != null && transform.parent.gameObject.tag == catTag){
					transform.parent.gameObject.layer = dontCollideWCharacterLayer;
				}
			
			}
					
		}*/

		if(	dropIfBeingPicked != null){
			dropIfBeingPicked.Drop();
		}

		transition.current = 0.0;
	}
	
	if(beingPicked.toggledFalse){
		SetDisableComponents(true);
		SetColliders(true);

		rb.useGravity = true;

		if(nextDropLightly){
			nextDropLightly = false;
		}
		else{
			var shootForce : Vector3;
			if(usePickerShootForce.magnitude > 0){
				shootForce = usePickerShootForce;
				usePickerShootForce = Vector3.zero;
			}
			else{
				shootForce = unPickShootForce;
			}

			shootForce = Vector3(shootForce.x * -pickingObjectSide, shootForce.y, 0);
			if(forceVerticalDrop){
				shootForce.x = 0.0;
				forceVerticalDrop = false;
			}

			if(shootUpwards){
				shootUpShiftForce = Mathf.Max(shootUpShiftForce, 1.0);
				shootForce.x *= 1 / shootUpShiftForce;
				shootForce.y *= shootUpShiftForce;
			}

			rb.AddForce(shootForce);
		}
		
		if(losingCat != null)
			losingCat.enableDestroy.current = false;
		
		//Transfer
		var allPickUpRB : PickUpRigidbody[] = FindObjectsOfType.<PickUpRigidbody>() as PickUpRigidbody[];
		for(var i = 0; i < allPickUpRB.Length; i++){
			if(transferPick && allPickUpRB[i].ID == transferPickID){
				var dist : float = Vector3.Distance(transform.position, allPickUpRB[i].transform.position);
				if(dist < transferDist){
					allPickUpRB[i].nearestPickable = this;
					allPickUpRB[i].disableUntil = 0.0;
					transition.current = 0.0;
					allPickUpRB[i].Pick(this);
					break;
				}
			}
		}
	}


	transition.SmoothDamp();

	if(beingPicked.current){
		transition.target = 1.0; //Transition pos
		GoToTargetPos();	
	}
}

function GoToTargetPos(){
	var targetPosition : Vector3;

	if(pickingObject != null){
		if(target != null){
			targetPosition = target.TransformPoint(pickingObject.pickCenter) + Vector3(offset.x * pickingObjectSide, offset.y, offset.z);
		}
		else{
			targetPosition = pickingObject.character.position;
		}
		
		if(transition.current > .9){
			//rb.MovePosition(targetPosition);
			rb.position = targetPosition;
			character.position = targetPosition;
			if(maxRBDeltaPos != null){
				maxRBDeltaPos.previousPosition = targetPosition;
			}

		}
		else{
			//rb.MovePosition(Vector3.Lerp(rb.position, targetPosition, transition.current));
			rb.position = Vector3.Lerp(rb.position, targetPosition, transition.current);
			character.position = Vector3.Lerp(rb.position, targetPosition, transition.current);
		}

		if(pickingObject.pickableRB != null){
			pickingObject.pickableRB.GoToTargetPos();
		}
	}


}

function LateUpdate(){
	//transition.time = transitionTime;
	//transition.SmoothDamp();

	if(beingPicked.current){
		weight.target = 1.0;//being picked animation
		//transition.target = 1.0; //Transition pos

		//Position
		//GoToTargetPos();

		//Side
		if(sideMovementScript != null){
			sideMovementScript.currentSide = pickingObjectSide;
		}

		if(setFathersSide){
			character.localScale.x = Mathf.Abs(character.localScale.x) * pickingObjectSide;
		}
		
		//Copy father's rotation.
		if(useFatherRotation || forceFatherRotation){
			if(beingPicked)	rb.angularVelocity = Vector3.zero;

			if(pickingObject != null){
				var useOffsetAngle : Vector3 = offsetAngle;

				if(offsetAngleZ_Side){
					useOffsetAngle.z *= pickingObjectSide;
				}

				var rotationObj : Transform;
				if(pickingObject.spine != null){
					rotationObj = pickingObject.spine;
				}
				else{
					rotationObj = pickingObject.character;
				}

				if(lerpRotation){
					character.rotation = Quaternion.Lerp(character.rotation, rotationObj.rotation * Quaternion.Euler(useOffsetAngle) * Quaternion.Euler(pickingObject.offsetAngle), Time.deltaTime * lerpRotationSpeed);
				}
				else{
					character.rotation = rotationObj.rotation;
					character.Rotate(useOffsetAngle);
					character.Rotate(pickingObject.offsetAngle);				
				}

			}
			else{
				if(target != null){
					character.rotation = Quaternion.identity;
				}
			}
					
		}
	}
	else{
		weight.target = 0.0;//being picked animation

		transition.target = 0.0;

		if(Time.time > beingPicked.toggledFalseTime + noPickAfterDropDelay){
			pickable = true;
		}
	}

	weight.SmoothDamp();
}

function SetDisableComponents(enabled : boolean){
	yield WaitForEndOfFrame();
	for(var i = 0; i < disableOnPick.Length; i++){
		if(disableOnPick[i] != null) disableOnPick[i].enabled = enabled;
	}
	if(sideMovementScript!=  null) sideMovementScript.enabled = true;
}

function SetColliders(enabled : boolean){
	for(var n : Collider in colliders){
		if(n == null){
			if(transform.parent != null){
				colliders = transform.parent.GetComponentsInChildren.<Collider>() as Collider[];
			}		
			SetColliders(enabled);
			break;
		}
		n.enabled = enabled;
	}
}