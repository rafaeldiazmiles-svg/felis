#pragma strict

var trigger : Trigger;

var triggered : ToggleBoolean;

@Space(30)
var cameraLocStarted : boolean;
var cameraLoc : PlayerCameraLocation;
var cameraLocDelay : float = 2.0;
var showDuration : float = 5.0;
@Space(15)
var fadeOut_anticiapte : float = 0.6;

@Space(30)
var animStarted : boolean;
//var anim : Animation;
//var animClip : AnimationClip;
var anim : TriggerAnimation;
var animDelay : float = 3.0;



function Start () {

}

function Update () {
	if(trigger != null && trigger.stepped.toggledTrue){
		triggered.current = true;	
	}

	triggered.Update();

	if(triggered.current){
		if(cameraLoc != null){
			if(cameraLoc.showLocation.current && Time.time > cameraLoc.showLocation.toggledTrueTime + showDuration){
				cameraLoc.showLocation.current = false;
			}

			if(!cameraLocStarted){
				if(Time.time > triggered.toggledTrueTime + cameraLocDelay){
					cameraLocStarted = true;
					cameraLoc.showLocation.current = true;
				}

				if(fadeOut_anticiapte && Time.time > triggered.toggledTrueTime + cameraLocDelay - fadeOut_anticiapte){
					cameraLoc.fadeCamera_Pause.overlayLerp.target = 1.0;
				}
			}
		}

		if(!animStarted){
			if(Time.time > triggered.toggledTrueTime + animDelay){
				animStarted = true;
				anim.play = true;
				/*anim[animClip.name].enabled = true;
				anim[animClip.name].weight = 1.0;
				anim[animClip.name].time = 0.0;
				anim[animClip.name].speed = 1.0;*/
			}
		}
	}
}

