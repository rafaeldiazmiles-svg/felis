#pragma strict

var animationComponent : Animation;
var sideMovementScript : SideMovement;
var controller : ControllerInput;
var rb : Rigidbody;
var attack : MeleeAttack;
var pickableRB : PickableRigidbody;
var sideDetection : SideDetection;
var crouch : Crouch;
var health : Health;

var defaultMass : float;
var pickingMass : float;
var addMass : float = 1.0;

var getCharacter : boolean = true;
var character : Transform;

var isEnemy : boolean;

var pickUpClip : AnimationClip;

var layer : int = 7;
var weight : FloatSmoothDamp;
static var blendTime : float = .1;

var spine : Transform;
var pickupBone : Transform;
var offsetAngle : Vector3;

@Space(30)

var useDifferentMTransform : boolean;
var mixingTransform : Transform[];

@Space(30)

var pickUp : boolean;
var isPickingUp : boolean;
var justPickedUp : boolean;
var justDroped : boolean;


var side : int = 1;
static var left = -1;
static var right = 1;

var pickableObjects : PickableRigidbody[];

var nearestPickable : PickableRigidbody;
var pickedObject : PickableRigidbody;

var pickableDistance : float = 1.0; //Distance required for character to reach object.
var anySidePickableDistance : float = 1.0;

var pickCenter : Vector3; //Offset for pickable object when being picked.

var debug : boolean;

var ignorePickable : PickableRigidbody;
var unIgnorePickableTime : float; //Time at which ignored pickable is unignored.
var ignoreAfterDropTime : float; //How many seconds to ignore a pickable after drop.

var armsHeight : float = .5;

var nearestObjectSetExternally : boolean;

var useFatherRotation : boolean;

var setNearestPickable : boolean;

var disableUntil : float;


var dropAtParentVel : boolean = true;

var addDropOffsetPos : Vector3;

var grabTight : boolean; //Keeps character from dropping object if hit.

var pickUpAnim : PlayStillAnimation;
var dropAnim : PlayStillAnimation;
@Space(30)
var setShootForce : Vector3;

//var noObjFrames : int;
//var noObjDrop_FAmount : int = 5;

function SetAnimComp(newAnimComp : Animation){
	animationComponent = newAnimComp;
	 SetAnim();
}

var getTimer : Timer;

var onlyPickID : int[];
var ID : int;

@Space(30)
var dontCollideWCharacterLayer : int = 17;

@Space(30)
var colliderHolder : Transform;

@Space(30)

var crouchDrop_DisableMovement : boolean;

@Space(30)

var copyColliders : boolean;

function Start () {

	if(getTimer.every == 0.0){
		getTimer.every = 3.0;
	}

	if(animationComponent == null) animationComponent = GetComponentInChildren(Animation);
	if(controller == null)  controller = GetComponentInChildren(ControllerInput);
	if(sideMovementScript == null) sideMovementScript = GetComponentInChildren(SideMovement);
	if(rb == null) rb = GetComponentInChildren(Rigidbody);
	if(attack == null)  attack = GetComponentInChildren(MeleeAttack);
	if(pickableRB == null)pickableRB = GetComponentInChildren(PickableRigidbody);
	if(sideDetection == null) sideDetection = GetComponentInChildren.<SideDetection>();
	if(crouch == null) crouch = GetComponentInChildren.<Crouch>();
	if(health == null) health = GetComponentInChildren.<Health>();

	if(transform.parent != null){
		if(animationComponent == null) animationComponent = transform.parent.GetComponentInChildren(Animation);
		if(controller == null) controller = transform.parent.GetComponentInChildren(ControllerInput);
		if(sideMovementScript == null) sideMovementScript = transform.parent.GetComponentInChildren(SideMovement);
		if(rb == null) rb = transform.parent.GetComponentInChildren(Rigidbody);
		if(attack == null)  attack = transform.parent.GetComponentInChildren(MeleeAttack);
		if(pickableRB == null) pickableRB = transform.parent.GetComponentInChildren.<PickableRigidbody>();
		if(sideDetection == null) sideDetection = transform.parent.GetComponentInChildren.<SideDetection>();
		if(crouch == null) crouch = transform.parent.GetComponentInChildren.<Crouch>();
		if(health == null) health = transform.parent.GetComponentInChildren.<Health>();
	}

	if(character == null){
		if(transform.parent != null){
			character = transform.parent;
		}
		else{
			 character = transform;
		}
	}
	
	if(spine == null){
		var allChildren : Transform[] = transform.parent.GetComponentsInChildren.<Transform>();{
			for(var i = 0; i < allChildren.Length; i++){
				if(allChildren[i].name.ToLower().Contains("spine")){
					spine = allChildren[i];
					break;
				}
			}
		}
	}



	SetAnim();
	
	
	GetPickableObjs();

	weight.time = blendTime;
	
	if(rb != null){
		defaultMass = rb.mass;
	}
}

function SetAnim(){
	if(animationComponent != null && pickUpClip != null){
		animationComponent[pickUpClip.name].enabled = true;
		animationComponent[pickUpClip.name].layer = layer;

		if(!useDifferentMTransform){
			if(spine != null){
				animationComponent[pickUpClip.name].AddMixingTransform(spine);
			}
		}
		else{
			for(var i = 0; i < mixingTransform.Length; i++){
				animationComponent[pickUpClip.name].AddMixingTransform(mixingTransform[i]);
			}
		}
	}
}

function GetPickableObjs(){
	pickableObjects = FindObjectsOfType.<PickableRigidbody>() as PickableRigidbody[];
}

function FixedUpdate(){
    //Input.
	if(controller != null && controller.inputButtonA.down && Time.time > disableUntil){
		if(attack != null){
			attack.FindNearestEnemyInFront();
		}

		if(attack == null || !attack.importantEnemy){
			if(!isPickingUp){
				if(pickUpAnim != null){
					SetNearestObject();
					nearestObjectSetExternally = true;
					if(nearestPickable != null){
						pickUpAnim.animationPlay.current = true;
					}
				}
				else{
					pickUp = true; //Pick up without anim
				}
			}
			else{
				if(dropAnim != null && (crouch == null || !crouch.crouching.current)){
					dropAnim.animationPlay.current = true;
				}
				else{
					pickUp = true; //Pick up without anim
				}
			}
		}
	}
}

function Update () {
	if(isPickingUp && pickedObject == null){
		Drop();
	}


	justPickedUp = false;
	justDroped = false;

	getTimer.Update();
	if(getTimer.current){
		GetPickableObjs();
	}

    if(pickUp){
        if(!isPickingUp){
            if(!nearestObjectSetExternally) {
            	SetNearestObject();
            }

            if(nearestPickable != null){
                Pick(nearestPickable);
            }
        }
		else{
			Drop();
	    }
        pickUp = false;
    }

    if(sideMovementScript != null){
        side = Mathf.Sign(character.localScale.x);
    }

    //Animation.
	if(animationComponent != null && pickUpClip != null){
		weight.time = blendTime;
		weight.SmoothDamp();
		animationComponent[pickUpClip.name].enabled = true;
		animationComponent[pickUpClip.name].weight = weight.current;
		animationComponent[pickUpClip.name].time = Time.time;
	}

	if(isPickingUp && pickedObject != null){
		pickedObject.beingPicked.current = true;
		//colliderHolder.position = pickedObject.character.position;
		//colliderHolder.rotation = pickedObject.character.rotation;
		//pickedObject.beingPicked.toggledTrueTime = Time.time;  
	}

	//Unignore pickable.
	if(ignorePickable != null && Time.time > unIgnorePickableTime) ignorePickable = null;
	
	if(setNearestPickable){
		SetNearestObject();
		setNearestPickable = false;
	}
}

function PickUpCheck() : boolean{
	SetNearestObject();
	nearestObjectSetExternally = true;

	if(nearestPickable != null){
		return true;
	}
	else{
		return false;
	}
}


function SetNearestObject() : PickableRigidbody{
	nearestPickable = null;
	
	for(var i = 0; i < pickableObjects.Length; i++){
		if(pickableObjects[i] == null) continue;
		
		if(!pickableObjects[i].pickable) continue;
		
		if(pickableObjects[i] == ignorePickable) continue;
		
		if(pickableObjects[i] != null && pickableObjects[i].transform == null) continue;

		var cont : boolean;
		if(onlyPickID != null && onlyPickID.Length > 0){
			cont = true;
			for(var n = 0 ; n < onlyPickID.Length; n++){
				if(pickableObjects[i].ID == onlyPickID[n]){
					cont = false;
					break;
				}
			}
		}

		if(cont){
			continue;
		}

		if(pickableObjects[i].onlyPickableBy != null && pickableObjects[i].onlyPickableBy.Length > 0){
			cont = true;
			for(n = 0 ; n < pickableObjects[i].onlyPickableBy.Length; n++){
				if(ID == pickableObjects[i].onlyPickableBy[n]){
					cont = false;
					break;
				}
			}			
		}
		if(cont){
			continue;
		}



		var thisPickable : PickableRigidbody = transform.parent.GetComponentInChildren.<PickableRigidbody>();
		if(thisPickable == pickableObjects[i]){
			continue;
		}

		var pickableTransform : Transform = pickableObjects[i].transform;
		
		var sameSide : boolean = (Mathf.Sign(character.position.x - pickableTransform.position.x) == side);
		if(sideMovementScript == null) sameSide = true;
		var distance : float = Vector3.Distance(transform.TransformPoint(0,armsHeight,0), pickableTransform.position);
		
		if(distance < pickableDistance && sameSide || distance < anySidePickableDistance){
			if(nearestPickable == null){
				nearestPickable = pickableTransform.GetComponent(PickableRigidbody);
			}
			else{
				if(distance < Vector3.Distance(character.position, nearestPickable.transform.position)){
					nearestPickable = pickableTransform.GetComponent(PickableRigidbody);
				}
			}
		}
	}

	return nearestPickable;
}

function Pick(pickObj : PickableRigidbody){
	pickedObject = pickObj;

	isPickingUp = true;

	pickedObject.beingPicked.current = true;
	pickedObject.beingPicked.toggledTrueTime = Time.time;
	pickedObject.pickingObject = this;
	pickedObject.SetColliders(false);
	pickedObject.SetDisableComponents(false);
	pickedObject.pickable = false;
	//pickedObject.character.gameObject.layer = dontCollideWCharacterLayer;

	if(pickedObject.forceFriction != null && pickedObject.forceFriction.loopingDragSound != null){
		pickedObject.forceFriction.loopingDragSound.volume = 0.0;
	}

	//Set picked target
	if(pickupBone == null){
		if(spine != null){
			pickedObject.target = spine;
		}
		else{
			pickedObject.target = transform;
		}
	}
	else{
		pickedObject.target = pickupBone;
	}

	if(isEnemy && pickedObject.losingCat != null){
		pickedObject.losingCat.enableDestroy.current = true;
	}
	weight.target = 1.0;

	justPickedUp = true; //Sets false next frame.
	
	pickedObject.useFatherRotation = useFatherRotation;

	if(rb != null){
		if(pickedObject.setAddMass){
			rb.mass  = defaultMass + pickedObject.addMass;
		}
		else{
			rb.mass = defaultMass + addMass;
		}
	}

	if(attack != null){
		if(pickedObject.noPickingRBAttack){
			attack.disableUntil = Time.time + .5;
			attack.attacking.current = false;
			//attack.disableFireballUntil = Time.time + .5;
		}
	}

	if(copyColliders){
		IncorporateCollider();
	}
}

function Drop(){
	isPickingUp = false;

	if(pickedObject != null){
		ignorePickable = pickedObject;
		unIgnorePickableTime = Time.time + ignoreAfterDropTime;
		pickedObject.beingPicked.current = false;
		pickedObject.beingPicked.toggledFalseTime = Time.time;
		pickedObject.pickingObject = null;
		pickedObject.SetColliders(true);
		pickedObject.SetDisableComponents(false);
		pickedObject.target = null;
		
		if(pickedObject.frictionDrag != null){
			pickedObject.frictionDrag.stopTime = 0.0;
		}

		if(pickedObject.rb != null){
			if(rb!= null && dropAtParentVel){
				pickedObject.rb.velocity = rb.velocity;
			}
			else{
				pickedObject.rb.velocity = Vector3.zero;
			}
		}
			
		if(isEnemy && pickedObject.losingCat != null){
			pickedObject.losingCat.enableDestroy.current = false;
		}

		if(pickedObject.rb != null){
			var collisionDamage : CollisionDamage = pickedObject.rb.gameObject.GetComponent.<CollisionDamage>();
			if(collisionDamage != null){
				var ignoreRB : Rigidbody[] = new Rigidbody[1];
				ignoreRB[0] = rb;
				collisionDamage.ignoreRB = ignoreRB;
			}
		}

		if(crouch == null || crouch.crouching.current){
			pickedObject.nextDropLightly = true;
		}
		else{
			pickedObject.usePickerShootForce = setShootForce;
			if(controller.inputAxis.current.y > .5){
				pickedObject.shootUpwards = true;
			}
			else{
				pickedObject.shootUpwards = false;
			}
		}

		pickedObject.character.gameObject.layer = pickedObject.defaultLayer;

		if(crouchDrop_DisableMovement){
			var movAI : MovementAI = pickedObject.character.GetComponentInChildren.<MovementAI>();
			if(movAI != null){
				if(crouch != null && crouch.crouching.current){
					movAI.enableMovement = false;
				}
				else{
					movAI.enableMovement = true;
				}
			}
		}
	}
	
	if(pickedObject != null && pickedObject.transform.parent != null && pickedObject.transform.parent != null){
		pickedObject.transform.parent.position += addDropOffsetPos;
	}
	
	justDroped = true;  //Sets false next frame
	nearestPickable = null;
	weight.target = 0.0;

	pickedObject = null;
	
	if(rb != null){
		rb.mass = defaultMass;
	}


	if(copyColliders){
		ClearColliderHolder();
	}
}

static var debugSphereSize : float = .03;

function OnDrawGizmos(){ 
	#if UNITY_EDITOR
	var guiStyle : GUIStyle = new GUIStyle();
	guiStyle.normal.textColor = Color.yellow;
	//Handles.Label(transform.TransformPoint(0,1,0), transition.current.ToString(), guiStyle);
	
	if (debug){
		Gizmos.color = Color.red;
		Gizmos.DrawSphere(spine.TransformPoint(pickCenter), debugSphereSize);
	}
	
	#endif
}

function ClearColliderHolder(){
	if(colliderHolder != null){
		Destroy(colliderHolder.gameObject);
	}

	/*if(colliderHolder != null){
		var incCols : Collider[] = colliderHolder.GetComponentsInChildren.<Collider>();
		for(var i = incCols.Length - 1; i >= 0; i --){
			Destroy(incCols[i]);
		}

		var incChildren : Transform[] = colliderHolder.GetComponentsInChildren.<Transform>();
		for(i = incChildren.Length - 1; i >= 0; i --){
			if(incChildren[i] != colliderHolder){
				Destroy(incChildren[i].gameObject);
			}
		}

	}*/
}

function MakeColliderHolder(){
	if(character == null){
		if(transform.parent != null){
			character = transform.parent;
		}
		else{
			 character = transform;
		}
	}

	colliderHolder = new GameObject(character.name + " Collider Holder").transform;
	colliderHolder.parent = character;
	colliderHolder.localPosition = Vector3.zero;
	colliderHolder.localRotation = Quaternion.identity;
	colliderHolder.localScale = Vector3.one;	
}

function IncorporateCollider(){ //Currently only works with root colliders
	if(colliderHolder == null){
		MakeColliderHolder();
	}

	colliderHolder.position = pickedObject.character.position;
	colliderHolder.rotation = pickedObject.character.rotation;
	colliderHolder.localScale = pickedObject.character.localScale;

	for(var i = 0; i < pickedObject.colliders.Length; i++){
		if(pickedObject.colliders[i].transform == pickedObject.character){
			switch(pickedObject.colliders[i].GetType()){
				case BoxCollider:
					var newBoxCol : BoxCollider = colliderHolder.gameObject.AddComponent.<BoxCollider>();
					var sourceBoxCol : BoxCollider = pickedObject.colliders[i].gameObject.GetComponent.<BoxCollider>();
					newBoxCol.center = sourceBoxCol.center;
					newBoxCol.size = sourceBoxCol.size;
				break;

				case SphereCollider:
					var newSphereCol : SphereCollider = colliderHolder.gameObject.AddComponent.<SphereCollider>();
					var sourceSphereCol : SphereCollider = pickedObject.colliders[i].gameObject.GetComponent.<SphereCollider>();
					newSphereCol.center = sourceSphereCol.center;
					newSphereCol.radius = sourceSphereCol.radius;				
				break;

				case CapsuleCollider:
					var newCapsuleCol : CapsuleCollider = colliderHolder.gameObject.AddComponent.<CapsuleCollider>();
					var sourceCapsuleCol : CapsuleCollider = pickedObject.colliders[i].gameObject.GetComponent.<CapsuleCollider>();
					newCapsuleCol.center = sourceCapsuleCol.center;
					newCapsuleCol.direction = sourceCapsuleCol.direction;	
					newCapsuleCol.height = sourceCapsuleCol.height;	
					newCapsuleCol.radius = sourceCapsuleCol.radius;	
				break;
			}
		}
		else{
			//Collider not a character component, but on of its children
			//Create gameObject that's child of colliderHolder, and same position, rotation, scale as source child. Add component to this child (instead of collider holder)
			//As an extra try not to create two gameObjects that is the same as the picked object's child.
		}
	}

	if(sideDetection != null){
		sideDetection.IgnoreOwn();
	}
}