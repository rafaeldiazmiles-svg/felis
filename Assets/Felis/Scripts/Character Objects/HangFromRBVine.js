#pragma strict

@Header("--------Autoget Components-----------")
var character : Transform;
var controller : ControllerInput;
var sideMovement : SideMovement;
var jumpSwim : JumpSwim;
var crouch : Crouch;
var lookUp : LookUp;
var stopFrictionDrag : StopFrictionDrag;
var forceFriction : ForceFriction;
var isGrounded : IsGrounded;
var rb : Rigidbody;
var maxDeltaPos : MaxRigidbodyDeltaPos;
var spineBalance : SpineBalance;
var meleeAttack : MeleeAttack;

@Header("--------------Input------------------")
var characterIsParent : boolean;
var targetRB : Rigidbody;
var targetRBDist : float;
var pickVineDist : float;
var posIterpolation : float;
var hangOffset : Vector3;
var charCenterOffset : Vector3;
var vineForceMultiplier : float;
var gravity : float;
var jumpForce : Vector3;
var defaultVineLayer : int;
var dontCollideLayer : int;
var slideDownSpeed : float = .5;
var disableAfterDrop : float = .25;
var restoreDelay : float = 1.0;
var maxVel : float = 15.0;
@Space(30)
var rotationBone : Transform;
var angleOffset : float;
var rotBoneAngleZero : Vector3;
var inertiaMultiplier : float;
var loseInertiaDist : float = 1.0;
var loseInertiaMultiplier : float = 2.0;
var maxInertia : float = 40;
var ignoreUpperVines : int;
var maintainAngle : MaintainAngle;


@Space(30)
var legs : Transform[];
var legsInertiaMultiplier : float;
@Space(30)
var IKArms : IK2D[];
var useAllIK : boolean;
@Space(30)
var debug : boolean = true;
@Header("--------------Values-----------------")
var getVineTimer : Timer;
var vines : Vine[];
var vineTag : String = "Vine";
var closestVineRoot : Transform;
var closestVineRootDist : float;
var characterVinePos : float;
var closestVineID : int;
var closestVineRBID : int;
var vinePosWorld : Vector3;
var thisVine : Transform;
var prevVine : Transform;
var vinePosWorldLerp : float;
@Space(30)
var hanging : ToggleBoolean;
var playerSide : int;
@Space(30)
var prevPos : Vector3;
var velocity : Vector3;
var acceleration : Vector3;
var prevVelocity : Vector3;
@Space(30)
var vineForce : Vector3;
var inertia : FloatSmoothDamp;
var legsAngle : FloatSpring;
var disableUntil : float;
@Space(30)
var restoreVineLayer : Array;
var removeAtID : Array;

class Vine{
	var root : Transform;
	var vineRBs : Rigidbody[];
	var vinePos : float[]; //0 is top, 1.0 is bottom.
}

class RestoreVineLayer{
	var vineID : int;
	var atTime : float;
	function RestoreVineLayer(setID : int , setTime : float){
		vineID = setID;
		atTime = setTime;
	}
}


function Start () {
	if(characterIsParent) character = transform.parent;
	isGrounded = transform.parent.GetComponentInChildren.<IsGrounded>();
	controller = transform.parent.GetComponentInChildren.<ControllerInput>();
	sideMovement = transform.parent.GetComponentInChildren.<SideMovement>();
	jumpSwim = transform.parent.GetComponentInChildren.<JumpSwim>();
	crouch = transform.parent.GetComponentInChildren.<Crouch>();	
	lookUp = transform.parent.GetComponentInChildren.<LookUp>();
	stopFrictionDrag = transform.parent.GetComponentInChildren.<StopFrictionDrag>();	
	forceFriction = transform.parent.GetComponentInChildren.<ForceFriction>();
	rb = transform.parent.GetComponentInChildren.<Rigidbody>();
	maxDeltaPos = transform.parent.GetComponentInChildren.<MaxRigidbodyDeltaPos>();
	spineBalance = transform.parent.GetComponentInChildren.<SpineBalance>();
	meleeAttack = transform.parent.GetComponentInChildren.<MeleeAttack>();
	maintainAngle = transform.parent.GetComponentInChildren.<MaintainAngle>();

	
	if(useAllIK){
		IKArms = transform.parent.GetComponentsInChildren.<IK2D>();
	}
	
	GetVines();
	if(getVineTimer.every == 0.0){
		getVineTimer.every = 3.0;
	}
	
	restoreVineLayer = new Array();
	//removeAtID = new Array();
}

function GetVines(){
	var vinesObj : GameObject []= GameObject.FindGameObjectsWithTag(vineTag);
	vines = new Vine[vinesObj.Length];
	for(var i = 0; i < vinesObj.Length; i++){
		vines[i] = new Vine();
		vines[i].root = vinesObj[i].transform;
		vines[i].vineRBs = vines[i].root.GetComponentsInChildren.<Rigidbody>() as Rigidbody[];
		SortRBByHeight(vines[i].vineRBs);
		var vineLength : float = vines[i].vineRBs[0].transform.position.y - vines[i].vineRBs[vines[i].vineRBs.Length - 1].transform.position.y;
		vines[i].vinePos = new float[vines[i].vineRBs.Length];
		for(var m = 0; m < vines[i].vineRBs.Length; m++){
			vines[i].vinePos[m] = vines[i].vineRBs[0].position.y - vines[i].vineRBs[m].position.y;
			vines[i].vinePos[m] /= vineLength;
		}
	}	
}

function SortRBByHeight(rbs : Rigidbody[]){
	for(var i = 0; i < rbs.Length - 1; i++){
		if(rbs[i].transform.position.y < rbs[i+1].transform.position.y){
			var rb : Rigidbody = rbs[i];
			rbs[i] = rbs[i+1];
			rbs[i+1] = rb;
			SortRBByHeight(rbs);
			break;
		}
	}
}

function FixedUpdate () {
	//Calc velocity
	velocity = (transform.position - prevPos) / Time.deltaTime;
	prevPos = transform.position;
	acceleration = (velocity - prevVelocity) / Time.deltaTime;
	prevVelocity = velocity;

	getVineTimer.Update();
	if(getVineTimer.current){
		GetVines();
	}
	
	for(var w = restoreVineLayer.length-1; w >= 0; w--){
		if(restoreVineLayer[w] == null){
			continue;
		}
		var thisRestoreVine : RestoreVineLayer = restoreVineLayer[w];
		if(Time.time > thisRestoreVine.atTime){
			if(vines == null) continue;
			if(thisRestoreVine.vineID >= vines.Length) continue;
			if(vines[thisRestoreVine.vineID] == null) continue;
			for(var q = 0; q < vines[thisRestoreVine.vineID].vineRBs.Length; q++) {
				if(vines[thisRestoreVine.vineID].vineRBs[q] == null){
					continue;
				}
				vines[thisRestoreVine.vineID].vineRBs[q].gameObject.layer = defaultVineLayer;
			}
			restoreVineLayer.RemoveAt(w);
		}
	}


	if(Time.time < disableUntil) return;

	if(targetRB == null){
		hanging.current = false;
	}		
			
	hanging.Update();

	if(hanging.toggledTrue){
		rb.constraints = RigidbodyConstraints.FreezePositionZ | RigidbodyConstraints.FreezeRotationX | RigidbodyConstraints.FreezeRotationY;
		rb.useGravity = false;
		rb.drag = 10.0;

		stopFrictionDrag.enabled = false;
		forceFriction.enabled = false;
		maxDeltaPos.disable = true;
		maxDeltaPos.previousPosition = transform.position;
		//maxDeltaPos.enabled = false;
		spineBalance.enabled = false;
		isGrounded.enabled = false;
		isGrounded.isGrounded = false;
		
		playerSide = sideMovement.currentSide;
		//sideMovement.currentSide = 1.0;
		
		for(var n = 0; n < IKArms.Length; n++){
			IKArms[n].updateIK.current = true;
		}

		
		for(var m = 0; m < vines[closestVineID].vineRBs.Length; m++){
			vines[closestVineID].vineRBs[m].gameObject.layer = dontCollideLayer;
		}

		characterVinePos = vines[closestVineID].vinePos[closestVineRBID];
		
		SetVinePosLerp();
		
		inertia.current = acceleration.x * inertiaMultiplier;
		inertia.target  = inertia.current ;
		
	}
	
	if(hanging.toggledFalse){
		maxDeltaPos.disable = false;
		maxDeltaPos.disableUntil = Time.time + 5.0;
		
		rb.constraints = RigidbodyConstraints.FreezePositionZ | RigidbodyConstraints.FreezeRotationX | RigidbodyConstraints.FreezeRotationY;// | RigidbodyConstraints.FreezeRotationZ;
		rb.useGravity = true;

		stopFrictionDrag.enabled = true;
		forceFriction.enabled = true;
		maxDeltaPos.previousPosition = transform.position;
		maxDeltaPos.enabled = true;
		spineBalance.enabled = true;
		isGrounded.enabled = true;
		sideMovement.currentSide = playerSide;
		
		rotationBone.localScale.x = Mathf.Abs(rotationBone.localScale.x);
		
		disableUntil = Time.time + disableAfterDrop;
		
		for(n = 0; n < IKArms.Length; n++){
			IKArms[n].updateIK.current = false;
		}

		var newRestoreVLayer : RestoreVineLayer = new RestoreVineLayer(closestVineID, Time.time + restoreDelay );
		restoreVineLayer.Push(newRestoreVLayer);
		
		meleeAttack.airKick = false;//Allow to drop vine and attack.
	}
	
	inertia.SmoothDamp();
	
	if(hanging.current){
		sideMovement.disableMovementUntil = Time.time + .2;
		crouch.disableUntil = Time.time + .2;
		lookUp.disableUntil = Time.time + .2;

		if(controller.inputButtonA.down || controller.inputButtonB.down || controller.inputAxis.current.y < -.5){
			hanging.current = false;	
		}
		
		if(controller.inputButtonB.down){
			var useJumpForce : Vector3 = Vector3(-jumpForce.x * controller.inputAxis.current.x, jumpForce.y, 0);

			rb.AddForce(useJumpForce);
		}
		
		characterVinePos += Time.deltaTime * slideDownSpeed;
		characterVinePos = Mathf.Max(characterVinePos, 0);
		SetVinePosLerp();
		GetClosestVineRB();
		
		if(prevVine == null || thisVine == null){
			SetVinePosLerp();
		}
		
		vinePosWorld = Vector3.Lerp(prevVine.position, thisVine.position, vinePosWorldLerp);
		
		if(debug) DebugUtility.DrawPoint(vinePosWorld, .5, Color.yellow);
		
		//Inertia
		inertia.target = acceleration.x * inertiaMultiplier;
		
		legsAngle.Spring();
		legsAngle.target = inertia.current * -Mathf.Sign(rotationBone.localScale.x) * legsInertiaMultiplier;
		
		//Vine force
		vineForce.x = -controller.inputAxis.current.x * vineForceMultiplier;
		var vineDeltaPosDivider : float = Mathf.Abs(transform.position.x - targetRB.transform.parent.position.x) + 1;
		vineForce.x /= vineDeltaPosDivider;
		if(transform.parent.position.x < targetRB.transform.parent.position.x + loseInertiaDist){
			if(vineForce.x < 0){
				vineForce.x /= vineDeltaPosDivider * loseInertiaMultiplier;
			}
		}
		if(transform.parent.position.x > targetRB.transform.parent.position.x - loseInertiaDist){
			if(vineForce.x > 0){
				vineForce.x /= vineDeltaPosDivider * loseInertiaMultiplier;
			}
		}
		vineForce.y = gravity;
		
		//IK
		for(n = 0; n < IKArms.Length; n++){
			IKArms[n].target = null;
			IKArms[n].targetPos = vinePosWorld;
		}
		
		//Be sure not to have the player collide with the vine while using it
		for(m = 0; m < vines[closestVineID].vineRBs.Length; m++){
			vines[closestVineID].vineRBs[m].gameObject.layer = dontCollideLayer;
		}
		
		inertia.current = Mathf.Clamp(inertia.current, -maxInertia, maxInertia);
		inertia.target = Mathf.Clamp(inertia.target, -maxInertia, maxInertia);
		legsAngle.current = Mathf.Clamp(inertia.current, -maxInertia, maxInertia);
		legsAngle.target = Mathf.Clamp(inertia.target, -maxInertia, maxInertia);
		
		maxDeltaPos.previousPosition = transform.position;
	}
	else{
		if(Time.time > disableUntil){ 
			GetClosestVineRB();
			if(targetRB != null){
				if(Vector3.Distance(transform.position - hangOffset, targetRB.transform.position) < pickVineDist){
					//if(controller.inputButtonA.down || controller.inputButtonB.down){
						hanging.current = true;
						if(meleeAttack != null){
							meleeAttack.disableFireballUntil = Time.time + .5;
						}
						//disableUntil = Time.time + disableAfterDrop;
					//}
				}
			}
		}
	}

	if(Time.time < disableUntil) return;
	
	if(targetRB == null){
		hanging.current = false;
		return;
	}
	

	
	if(hanging.current){
		targetRB.AddForce(vineForce);
		rb.velocity = (vinePosWorld + hangOffset - transform.position)* posIterpolation;
		if(rb.velocity.magnitude > maxVel){
			rb.velocity = rb.velocity.normalized * maxVel;
		}
	}
}

function LateUpdate(){
	if(Time.time < disableUntil) return;

	if(targetRB == null){
		hanging.current = false;
		return;
	}	
			
	if(hanging.current){
		//Hang anim.
		//rotationBone.RotateAround(vinePosWorld, -Vector3.forward, inertia.current);
		//rotationBone.RotateAround(vinePosWorld, -Vector3.forward, inertia.current);
		
		//rotationBone.eulerAngles = rotBoneAngleZero;
		/*if(rotationBone.localScale.x < 0){
			rotationBone.RotateAround(rotationBone.transform.position, Vector3.forward, 180);
		}*/
		
		/*var dy : float = vinePosWorld.y - rotationBone.position.y;
		var dx : float = vinePosWorld.x - rotationBone.position.x;
		
		var angle : float = Mathf.Atan2(dy, -dx) * Mathf.Rad2Deg ;*/
		//rotationBone.RotateAround(rotationBone.transform.position, -Vector3.forward, angle + angleOffset);

		maintainAngle.defaultAngle = inertia.current;

		transform.parent.localScale.x = Mathf.Abs(transform.parent.localScale.x);
		
		for(var i = 0; i < legs.Length; i++){
			legs[i].RotateAround(legs[i].position, Vector3.forward, legsAngle.current);
		}

		//Scale side
		if(Mathf.Abs(controller.inputAxis.current.x) > .5){
			playerSide = Mathf.Abs(rotationBone.localScale.x) * Mathf.Sign(controller.inputAxis.current.x);
		}
		rotationBone.localScale.x = playerSide;
	}
}

/*function FixedUpdate(){
	
}*/

function GetClosestVineRB(){
	targetRB = null;
	targetRBDist = Mathf.Infinity;

	for(var i = 0; i < vines.Length; i++){
		if(vines[i] == null || vines[i].root == null) continue;

		for(var n = 0; n < vines[i].vineRBs.Length; n++){
			if(n <	ignoreUpperVines-1) continue;
			var thisRB : Rigidbody = vines[i].vineRBs[n];
			
			var thisRBDist : float = Vector3.Distance(transform.position+charCenterOffset, thisRB.transform.position);
			if(thisRBDist < targetRBDist){
				targetRB = thisRB;
				targetRBDist = Vector3.Distance(transform.position+charCenterOffset, thisRB.transform.position);
				closestVineRBID = n;
				closestVineID = i;	
			}
		}
	}
}

function SetVinePosLerp(){
	//Calc grab vine world lerp
	for(var i = 0; i < vines[closestVineID].vinePos.Length; i++){
		if(vines[closestVineID].vinePos[i] >= characterVinePos){
			if (i == 0){
				vinePosWorld = vines[closestVineID].vineRBs[0].transform.position;
				break;
			}
			var vineSegmentLength : float = vines[closestVineID].vinePos[i] - vines[closestVineID].vinePos[i-1];
			var segmentPos : float = characterVinePos - vines[closestVineID].vinePos[i-1];
			prevVine = vines[closestVineID].vineRBs[i-1].transform;
			thisVine = vines[closestVineID].vineRBs[i].transform;
			
			vinePosWorldLerp = segmentPos / vineSegmentLength;
			break;
		}
	}
}
