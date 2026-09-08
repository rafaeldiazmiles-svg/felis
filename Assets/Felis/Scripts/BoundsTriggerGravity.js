#pragma strict

var active : boolean = true;

var center : boolean;
var bounds : Bounds;

var character : Transform;

var triggered : boolean;
var lastTriggerTime : float;

var targetRB : Rigidbody;

var setVelocity : Vector3 = Vector3(0,-8,0);

var disableMovementDuration : float = 1.0;

//var delayDrop : float = .5;

var isGrounded : IsGrounded;
var wasGrounded : boolean;
var cameraShakiness : Shakiness;

var scareCharacter : boolean = true;
var frameGroups : UVFrameGroups;
var eyesGroup : int = 0;
var eyesWorriedFrame : int = 3;
var mouthGroup : int = 1;
var mouthWorriedFrame : int = 3;
var sideMovement : SideMovement;

var shakeBeforeFallDuration : float;
var sBF_DefaultDurection : float;
var shakiness : Shakiness;
var multiplierCurve : AnimationCurve;

var createDebrisOnTrigger : GameObject;
var debrisOffset : Vector3;

var triggerSound : AudioSource;

var shakeSoundMul : float = 1.0;
var shakeSound : AudioSource;

var debug : boolean;

var playerTag : String = "Player";
var getCharTimer : Timer;

var priorityFalls : BoundsTriggerGravity[]; //Must fall before this one.

function Start () {
	if(Camera.main.transform.parent != null){
		cameraShakiness = Camera.main.transform.parent.GetComponent(Shakiness);
	}
	
	isGrounded = GetComponentInChildren(IsGrounded);
	
	if(targetRB != null){
		isGrounded = targetRB.gameObject.GetComponentInChildren(IsGrounded);
	}
	if(character != null){
		frameGroups = character.GetComponentInChildren(UVFrameGroups);
		sideMovement = character.GetComponentInChildren(SideMovement);
	}
	
	if(getCharTimer.every == 0.0){
		getCharTimer.every = 2.0;
	}
	 GetPlayer();

	 sBF_DefaultDurection = shakeBeforeFallDuration;
}

function GetPlayer(){
	var playerObj : GameObject = GameObject.FindGameObjectWithTag(playerTag);
	if(playerObj != null){
		character = playerObj.transform;
		frameGroups = character.GetComponentInChildren(UVFrameGroups);
		sideMovement = character.GetComponentInChildren(SideMovement);
	}
}

function Update () {
	if(shakeSound != null && shakiness != null){
		if(!shakeSound.isPlaying){
			shakeSound.Play();
		}
		shakeSound.volume = shakiness.multiplier * shakeSoundMul;
	}

	getCharTimer.Update();
	if(getCharTimer.current){
		GetPlayer();
	}
	
	
	if(character == null || targetRB == null) return;
	
	var bCenter : Vector3 = bounds.center;
	if(center){
		bounds.center += transform.position;
	}

	var triggerNow : boolean;

	var noPriorityFalls : boolean = true;
	for(var i = 0; i < priorityFalls.Length; i++){
		if(priorityFalls[i] == null){
			continue;
		}
		if(!priorityFalls[i].triggered){
			noPriorityFalls = false;
			break;
		}
	}

	if(!triggered && noPriorityFalls){
		if(bounds.Contains(character.position)){
			shakeBeforeFallDuration -= Time.deltaTime;


		}
		else{
			shakeBeforeFallDuration = Mathf.MoveTowards(shakeBeforeFallDuration, sBF_DefaultDurection, Time.deltaTime);
		}

		if(shakiness != null){
			if(shakeBeforeFallDuration < sBF_DefaultDurection){
				shakiness.multiplier = multiplierCurve.Evaluate(shakeBeforeFallDuration);
			}
			else{
				shakiness.multiplier = 0.0;
			}

		}

		if(shakeBeforeFallDuration < 0){
			triggerNow = true;
		}
		
		if(active && triggerNow){
			if(shakiness != null){
				shakiness.multiplier = 0.0;
			}

			lastTriggerTime = Time.time;
			triggered = true;
			if(triggerSound != null && triggerSound.enabled){
				triggerSound.Play();
			}
			targetRB.useGravity = true;
			targetRB.isKinematic = false;
			targetRB.velocity = setVelocity;

			if(disableMovementDuration > 0){
				character.GetComponentInChildren(SideMovement).disableMovementUntil = Time.time + disableMovementDuration;
			}

			if(createDebrisOnTrigger != null){
				var newDebris : GameObject = GameObject.Instantiate(createDebrisOnTrigger);
				newDebris.transform.position = transform.position + debrisOffset;
			}
		}
	}
		
	bounds.center = bCenter;
	
	if(isGrounded != null && isGrounded.isGrounded && !wasGrounded){
		if(cameraShakiness != null){
			cameraShakiness.lowQuake = true;
		}
		
		if(scareCharacter){
			if(frameGroups != null){
				frameGroups.SetFrame(eyesGroup, eyesWorriedFrame);
				frameGroups.SetFrame(mouthGroup, mouthWorriedFrame);
			}
			
			if(sideMovement != null){
				sideMovement.currentSide = Mathf.Sign(character.position.x - targetRB.position.x);
			}
		}
	}
	wasGrounded = isGrounded.isGrounded;
	

}

function OnDrawGizmosSelected(){
	#if UNITY_EDITOR
	if(debug){
		Gizmos.color = Color.green;
		var bCenter : Vector3 = bounds.center;
		if(center){
			bounds.center += transform.position;
		}
		Gizmos.DrawWireCube(bounds.center, bounds.size);
		bounds.center = bCenter;
		
		if(targetRB != null){
			Handles.Label(bounds.center, "Trigger gravity for: " + targetRB.gameObject.name);
		}
	}
	#endif
}