#pragma strict

var animationComponent : Animation;
var animationPlay: ToggleBoolean;

var loopAnimation : AnimationClip;
var useExitAnimation : boolean;
var exitAnimation : PlayStillAnimation;
var loopAnimationWeightControl : FloatLerp;
var layer : int;
var blendSpeed : float;
var animationStartTime : float;

var applyBrake : boolean = true;
var brake : float;
var brakeRigidbody : Rigidbody;

var disableMovement : boolean;
var sideMovement : SideMovement;

//var disableAttack : boolean;
//var pushAttack : PushAttack;

var disableJump : boolean;
var jumpSwim : JumpSwim;

var dropObject : boolean;
var pickUp : PickUpRigidbody;

var loopFadeOutDelayTime : float;
var loopFadeOutTime : float;
var fadeOutAnim : boolean;

var randomSounds : AudioSource[];
var randomPitchRange : Vector2 = Vector2(.9,1.1);

var forceWeightWhenPlaying : boolean;

@Space(30)
var blendOutAllOthers : boolean;

@Space(30)
var instantCutAnim : boolean;

//Writing to a missing AnimationState crashes the editor instead of throwing, so every
//access to the loop clip has to go through here.
function GetLoopState() : AnimationState {
	if(animationComponent == null || loopAnimation == null){
		return null;
	}
	//While the Animation is disabled (pause does that scene wide) the state lookup returns a
	//dangling pointer that passes a null check and then crashes the process.
	if(!animationComponent.enabled){
		return null;
	}
	return animationComponent[loopAnimation.name];
}

function InstantCutAnim(){
	animationPlay.current = false;
	animationPlay.previous = false;
	var cutState : AnimationState = GetLoopState();
	if(cutState != null){
		cutState.enabled = false;
	}
}

function Start(){
	animationComponent = FindUtility.ReverseFindAnimation(transform);
	
	brakeRigidbody = FindUtility.ReverseFindRigidbody(transform);

	if(blendSpeed == 0.0){
		blendSpeed = 10.0;
	}
}

function Update () {
	if(instantCutAnim){
		InstantCutAnim();
		instantCutAnim = false;
	}

	if(animationComponent == null){
		animationComponent = FindUtility.ReverseFindAnimation(transform);
	}
	else{

		animationPlay.Update();
		loopAnimationWeightControl.Lerp();
		loopAnimationWeightControl.speed = blendSpeed;
		
		if(animationPlay.toggledTrue){
			loopAnimationWeightControl.target = 1.0;
			var startState : AnimationState = GetLoopState();
			if(startState != null){
				startState.enabled = true;
				startState.time = 0;
				startState.layer = layer;
			}
			animationStartTime = Time.time;
			
			
			//if(disableMovement) sideMovement.disableMovementUntil = Time.time + animationComponent[loopAnimation.name].length;
			if(dropObject){
				if(pickUp == null && transform.parent != null){
					pickUp = transform.parent.GetComponentInChildren.<PickUpRigidbody>();
				}
				if(pickUp != null){
					pickUp.pickUp = false;
				}
			}
		}
		
		if(animationPlay.current){
			if(forceWeightWhenPlaying){
				loopAnimationWeightControl.target = 1.0;
			}
		
			if(sideMovement == null && transform.parent != null){
				sideMovement = transform.parent.GetComponentInChildren.<SideMovement>();
			}
			if(disableMovement && sideMovement != null) sideMovement.disableMovementUntil = Time.time + .5;
			
			if(jumpSwim == null && transform.parent != null){
				jumpSwim = transform.parent.GetComponentInChildren.<JumpSwim>();
			}
			if(disableJump && jumpSwim != null) jumpSwim.disableJumpUntil = Time.time + .5;

			if(blendOutAllOthers){
				for(var anim : AnimationState in animationComponent){
					if(anim.clip != loopAnimation){
						anim.weight = Mathf.Lerp(anim.weight,0, Time.deltaTime * blendSpeed);
					}
				}
			}
		}
		
		//if(Time.time > animationStartTime + animationComponent[loopAnimation.name].length - (3/blendSpeed)) animationPlay.current = false;
		
		if(animationPlay.toggledFalse){
			loopAnimationWeightControl.target = 0.0;

			if(useExitAnimation){
				exitAnimation.animationPlay.current = true;
			}

			fadeOutAnim = true;
			loopFadeOutTime = Time.time + loopFadeOutDelayTime;
		}
		
		if(fadeOutAnim && Time.time > loopFadeOutTime){
			fadeOutAnim = false;
		}
		
		var loopState : AnimationState = GetLoopState();
		if(loopState != null){
			loopState.weight = loopAnimationWeightControl.current;
		}
		
		if(applyBrake && animationPlay.current){
			if(brakeRigidbody == null && transform.parent != null){
				brakeRigidbody = transform.parent.GetComponentInChildren.<Rigidbody>();
			}
			
			if(brakeRigidbody != null){
				brakeRigidbody.velocity = Vector3.Lerp(brakeRigidbody.velocity, Vector3.zero, Time.deltaTime * brake);
			}
		}
		
		if(animationPlay.current && randomSounds != null && randomSounds.Length > 0){
			var isPlaying : boolean;
			for(var i = 0; i < randomSounds.Length; i++){
				if(randomSounds[i].isPlaying){
					isPlaying = true;
					break;
				}
			}
			if(!isPlaying){
				var id : int = Random.value * randomSounds.Length;
				randomSounds[id].pitch = Random.Range(randomPitchRange.x, randomPitchRange.y);
				randomSounds[id].Play();
			}
		}
	}
}
