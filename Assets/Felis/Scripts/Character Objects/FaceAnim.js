#pragma strict

@Header("----------Comps-------------")
var frameGroups : UVFrameGroups;
var sideMovement : SideMovement;
var sideMovementAnimation : SideMovementAnimation;
var underWater : UnderWater;
var animationComponent : Animation;

@Header("----------Input-------------")
var autoBlink : boolean = true;
var eyesGroup : int = 0;
var blinkFrame : int = 1;
var defaultEyes : int = 0;
var previousDefaultEyes : int;
var defaultEyesWater : int = 3;
@Space(30)
var resetMouth : boolean = true;
var mouthGroup : int = 1;
var defaultMouth : int = 1;
var defaultMouthWater : int = 4;
@Space(30)
var askHelpAnim : AnimationClip;
var mouthOpen : boolean;
var mouthOpenTime : float = .2;
var mouthCloseTime : float = .6;
var askHelpUntil : float;
var defHelpAnimLength : float = 1.5;
@Space(30)
var frameAnims: UVOF_Anim[];
var playingAnim : ToggleBoolean;
var animID : int;
@Space(30)
var disableUntil : float;

@Header("----------Vals-------------")
var blinking : TimerToggle;

class UVOF_Anim{
	var frames : UVOF_Anim_Frame[];
	function Reset(){
		for(var i = 0; i < frames.Length; i++){
			frames[i].played = false;
		}
	}

	function SetFrame(currentTime : float, frameGroups : UVFrameGroups, playingAnim : ToggleBoolean){
		var playedAll : boolean = true;
		for(var i = 0; i < frames.Length; i++){
			if(!frames[i].played){
				playedAll = false;
				if(currentTime > frames[i].time){
					frameGroups.SetFrame(frames[i].group, frames[i].frame);
					frames[i].played = true;
				}
			}
		}
		if(playedAll){
			playingAnim.current = false;
		}	
	}
}

class UVOF_Anim_Frame{
	var time : float;
	var group : int;
	var frame : int;
	var played : boolean;
}

function PlayAnim(ID : int){
	animID = ID;
	playingAnim.current = true;
}

function Start () {
	if(animationComponent == null){
		animationComponent = transform.parent.GetComponentInChildren(Animation);
	}
	if(frameGroups == null){
	frameGroups = transform.parent.GetComponentInChildren(UVFrameGroups);
	}
	if(underWater == null){
		underWater = transform.parent.GetComponentInChildren(UnderWater);
	}
	if(sideMovement == null){
		sideMovement = transform.parent.GetComponentInChildren(SideMovement);
	}
	if(sideMovementAnimation == null){
		sideMovementAnimation = transform.parent.GetComponentInChildren(SideMovementAnimation);
	}
}

function Update () {
	if(Time.time < disableUntil){
		return;
	}

	playingAnim.Update();

	if(playingAnim.toggledTrue){
		frameAnims[animID].Reset();
	}

	if(!playingAnim.current){ //If not playing any anymation use default anim (blinking, etc).
		//Help Mouth Anim
		if(Time.time < askHelpUntil){
			MouthUVAnimation(defHelpAnimLength);
		}

		//Blink
		blinking.Update();

		if(autoBlink){
			if(sideMovement != null && !sideMovement.isPushing && !sideMovementAnimation.almostFalling.current || sideMovement == null){
				if(blinking.A.toggledTrue){
					if(underWater != null && underWater.isUnderwater.current){
						frameGroups.SetFrame(eyesGroup, defaultEyesWater);
					}
					else{
						frameGroups.SetFrame(eyesGroup, defaultEyes);
					}
					
					if(resetMouth){
						if(underWater != null && underWater.isUnderwater.current){
							frameGroups.SetFrame(mouthGroup, defaultMouthWater);
						}
						else{
							frameGroups.SetFrame(mouthGroup, defaultMouth);
						}
					}
				}
				
				if(blinking.B.toggledTrue){
					frameGroups.SetFrame(eyesGroup, blinkFrame);
				}
			}
		}

		if(previousDefaultEyes != defaultEyes){
			previousDefaultEyes = defaultEyes;
			blinking.ToggleNow();
		}		
	}
	else{//Play animation from frameAnims[]
		var currentAnimTime : float = Time.time - playingAnim.toggledTrueTime;
		frameAnims[animID].SetFrame(currentAnimTime, frameGroups, playingAnim);
	}
}

function MouthUVAnimation(){
	if(askHelpAnim == null) return;
	
	var animationNormalizedTime : float = animationComponent[askHelpAnim.name].normalizedTime % 1.0;
	
	if(animationNormalizedTime > mouthOpenTime && animationNormalizedTime < mouthCloseTime  && !mouthOpen){
		frameGroups.SetFrame("Mouth","Open");
		mouthOpen = true;
	}

	if(animationNormalizedTime > 0 && animationNormalizedTime < mouthOpenTime || animationNormalizedTime >  mouthCloseTime){
		if(mouthOpen){
			frameGroups.SetFrame("Mouth","Normal");
			mouthOpen = false;
		}
	} 
}

function MouthUVAnimation(animLenght : float){
	var animationNormalizedTime : float = (Time.time % animLenght) / animLenght;//animationComponent[askHelpAnim.name].normalizedTime % 1.0;
	
	frameGroups.SetFrame("Eyes","Closed");
	
	if(animationNormalizedTime > mouthOpenTime && animationNormalizedTime < mouthCloseTime  && !mouthOpen){
		frameGroups.SetFrame("Mouth","Open");
		mouthOpen = true;
	}

	if(animationNormalizedTime > 0 && animationNormalizedTime < mouthOpenTime || animationNormalizedTime >  mouthCloseTime){
		if(mouthOpen){
			frameGroups.SetFrame("Mouth","Normal");
			mouthOpen = false;
		}
	} 
}


