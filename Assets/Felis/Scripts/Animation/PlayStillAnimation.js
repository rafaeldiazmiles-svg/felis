#pragma strict

var autoFindComponents : boolean = true;
@Space(30)
var animationComponent : Animation;
var pickUp : PickUpRigidbody;
var sideMovement : SideMovement;
var jumpSwim : JumpSwim;
var brakeRigidbody : Rigidbody;

@Space(30)
var playDelayed : ToggleBoolean;
var delay : float = 2.0;

@Space(30)
var animationPlay: ToggleBoolean;

@Space(30)
var stillAnimation : AnimationClip;
var stillAnimationWeightControl : FloatLerp;
var layer : int;
var playSpeed : float = 1.0;
var blendSpeed : float = 20.0;
var animationStartTime : float;

@Space(30)
var applyBrake : boolean = true;
var brake : float;

@Space(30)
var disableMovement : boolean;
var animSide : int;
var holdCurrentSide : boolean;
var disableJump : boolean;
var dropObject : boolean;

@Space(30)
var holdPose : boolean;
var holdPoseAnimationNormalizedTime : float;

@Space(30)
var noSound : boolean;
var playSound : AudioSource[];
var delaySound : float;
var playSoundTime : float;
var playDelayedSound : boolean;

@Space(20)
var secondarySound : AudioSource[];
var delaySecondarySound : float;
var playSecondarySoundTime : float;
var playDelayedSecondarySound;

@Space(30)
var forcePlay : boolean;

@Space(30)
var createPrefab : GameObject;
var prefabInstance : GameObject;
var prefabOffset : Vector3;
var createPrefabDelay : float;

@Space(30)
var useUVGroupAnim : UVGroupAnim[];

@Space(30)
var faceAnim : FaceAnim;
var playFaceAnimID : int;

@Space(30)
var blendMode : AnimationBlendMode = AnimationBlendMode.Blend;

@Space(30)
var mixTranform : Transform;
var mixTransformSelect : Transform[];

@Space(30)
var animationPicksUp : boolean;
var pickedUp : boolean;
var pickDelay : float;
var pickupRB : PickUpRigidbody;

@Space(30)
var disableAfterPlayDuration : float;

function SetAnimComp(newAnimComp : Animation){
	animationComponent = newAnimComp;
}

function Start(){
	if(autoFindComponents){
		animationComponent = FindUtility.ReverseFindAnimation(transform);
		pickUp = FindUtility.ReverseFindPickUpRigidbody(transform);
		sideMovement = FindUtility.ReverseFindSideMovement(transform);
		jumpSwim = FindUtility.ReverseFindJumpSwim(transform);
		brakeRigidbody = FindUtility.ReverseFindRigidbody(transform);
	}
	
	if(animationComponent != null && stillAnimation != null){
		animationComponent[stillAnimation.name].blendMode = blendMode;
	}

	if(mixTranform != null){
		animationComponent[stillAnimation.name].AddMixingTransform(mixTranform);
	}

	if(mixTransformSelect != null && mixTransformSelect.Length > 0){
		for(var i = 0; i < mixTransformSelect.Length; i++){
			animationComponent[stillAnimation.name].AddMixingTransform(mixTransformSelect[i], false);
		}
	}

	animationPlay.toggledFalseTime = -disableAfterPlayDuration;
}

function Update () {


	if(!animationPlay.current){
		pickedUp = false;
	}

	playDelayed.Update();
	if(playDelayed.current && Time.time > playDelayed.toggledTrueTime + delay){
		playDelayed.current = false;
		animationPlay.current = true;
	}

	if(animationComponent == null){
		animationComponent = FindUtility.ReverseFindAnimation(transform);
	}
	if(animationComponent == null) return;

	if(Time.time < animationPlay.toggledFalseTime + disableAfterPlayDuration){
		animationPlay.current = false;
	}

	animationPlay.Update();
	stillAnimationWeightControl.Lerp();
	stillAnimationWeightControl.speed = blendSpeed;
	
	if(animationComponent != null && !animationPlay.current && stillAnimationWeightControl.current < .1){
		animationComponent[stillAnimation.name].enabled = false;
	}

	if(createPrefab != null && animationPlay.current && Time.time > animationPlay.toggledTrueTime + createPrefabDelay && prefabInstance == null){
		if(sideMovement == null){
			sideMovement = FindUtility.ReverseFindSideMovement(transform);
		}	
		var side : float = 1.0;
		if(sideMovement!= null){
			side = sideMovement.currentSide;
		}
		
		prefabInstance = Instantiate(createPrefab);
		prefabInstance.transform.position = transform.position + Vector3(prefabOffset.x * side, prefabOffset.y, prefabOffset.z);
		if(transform.parent != null){
			prefabInstance.transform.localScale.x *= Mathf.Sign(transform.parent.localScale.x);
		}
	}
	
	
	if(animationPlay.toggledTrue || forcePlay){
		forcePlay = false;
		
		stillAnimationWeightControl.target = 1.0;
		if(animationComponent != null){
			animationComponent[stillAnimation.name].enabled = true;
			animationComponent[stillAnimation.name].speed = playSpeed;
			animationComponent[stillAnimation.name].time = 0;
			animationComponent[stillAnimation.name].layer = layer;
		}
		animationStartTime = Time.time;
		
		if(holdCurrentSide && sideMovement != null){
			animSide = sideMovement.currentSide;
		}
		
		if(animationComponent != null){
			if(sideMovement == null){
				sideMovement = FindUtility.ReverseFindSideMovement(transform);
			}
			if(disableMovement && sideMovement != null){
				sideMovement.disableMovementUntil = Time.time + animationComponent[stillAnimation.name].length * playSpeed;
			}
			if(jumpSwim == null){
				jumpSwim = FindUtility.ReverseFindJumpSwim(transform);
			}
			if(disableJump && jumpSwim != null){
				jumpSwim.disableJumpUntil = Time.time + animationComponent[stillAnimation.name].length * playSpeed ;
			}
		}
		
		if(dropObject){
			if(pickUp == null && transform.parent != null){
				pickUp = transform.parent.GetComponentInChildren.<PickUpRigidbody>();
			}
			
			if(pickUp != null){
				pickUp.pickUp = false;
			}
		}

		if(!noSound){
			if(playSound != null && playSound.Length > 0){
				if(delaySound == 0){
					playSound[Random.value * playSound.Length].Play();
				}
				else{
					playDelayedSound = true;
					playSoundTime = Time.time + delaySound;
				}
			}
			
			if(secondarySound != null && secondarySound.Length > 0){
				if(delaySecondarySound == 0){
					secondarySound[Random.value * secondarySound.Length].Play();
				}
				else{
					playDelayedSecondarySound = true;
					playSecondarySoundTime = Time.time + delaySecondarySound;
				}
			}
		}
		
		//UV Group Anim
		for(var i = 0; i < useUVGroupAnim.Length; i++){
			if(useUVGroupAnim[i] == null){
				if(transform.parent != null){
					Debug.Log("Unused UV Group anim on: " + gameObject.name + " - of parent: " + transform.parent.name);
				}
				continue;
			}
			useUVGroupAnim[i].playing.current = true;
		}

		//Face Anim
		if(faceAnim != null){
			faceAnim.PlayAnim(playFaceAnimID);
		}
	}



	if(!noSound){
		if(playDelayedSound && Time.time > playSoundTime){
			playSound[Random.value * playSound.Length].Play();
			playDelayedSound = false;
		}
		
		if(playDelayedSecondarySound && Time.time > playSecondarySoundTime){
			secondarySound[Random.value * secondarySound.Length].Play();
			playDelayedSecondarySound = false;
		}
	}

	noSound = false;

	
	if(!holdPose){
		if(animationComponent != null && Time.time > (animationStartTime + animationComponent[stillAnimation.name].length / playSpeed) - (3.0 / blendSpeed)){
			animationPlay.current = false;
		}

		if(animationPlay.toggledFalse){
			stillAnimationWeightControl.target = 0.0;
		}
	}
	else{
		if(animationComponent != null && animationComponent[stillAnimation.name].normalizedTime > holdPoseAnimationNormalizedTime){
			animationComponent[stillAnimation.name].speed = 0.0; 
			animationComponent[stillAnimation.name].normalizedTime = holdPoseAnimationNormalizedTime;
		}
	}
	
	if(animationComponent != null) {
		animationComponent[stillAnimation.name].weight = stillAnimationWeightControl.current;
	}
	
	if(applyBrake && animationPlay.current){
		if(brakeRigidbody == null){
			brakeRigidbody = FindUtility.ReverseFindRigidbody(transform);
		}
		if(brakeRigidbody != null){
			brakeRigidbody.velocity = Vector3.Lerp(brakeRigidbody.velocity, Vector3.zero, Time.deltaTime * brake);
		}
	}

	//Pick up
	if(animationPicksUp && animationPlay.current && !pickedUp){
		if(Time.time > animationPlay.toggledTrueTime + pickDelay){
			pickupRB.pickUp = true;
			pickedUp = true;
		}
	}
}

function LateUpdate(){
	if(animationPlay.current && sideMovement != null && holdCurrentSide){
		sideMovement.currentSide = animSide;
	}	
}

function PlayNoSound(){
	animationPlay.current = true;
	noSound = true;
}

function Play(){
	animationPlay.current = true;
	animationPlay.toggledTrue = true;
}