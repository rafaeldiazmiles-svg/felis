#pragma strict

var openClip : AnimationClip;
var closeClip : AnimationClip;

var clipBlendWeight : FloatLerp;

var animationTime : float;
var animationTimeTarget : float;
var openSpeed : float = .5;
var closeSpeed : float = 1.5;

var animationComponent : Animation;

var slabTrigger : Trigger;

var pressingAll : ToggleBoolean;
var slabTriggerMultiple : Trigger[];

function Start () {
	animationComponent = GetComponent.<Animation>();
	
	animationComponent[openClip.name].enabled = true;
	animationComponent[openClip.name].time = 0.0;
	animationComponent[openClip.name].speed = 0.0;
	
	animationComponent[closeClip.name].enabled = true;
	animationComponent[closeClip.name].time = 1.0;
	animationComponent[closeClip.name].speed = 0.0;
}

function Update () {
	animationComponent[openClip.name].enabled = true;
	animationComponent[closeClip.name].enabled = true;
	
	animationComponent[openClip.name].time = animationTime;
	animationComponent[closeClip.name].time = 1 - animationTime;
	
	pressingAll.Update();
	
	var allSlabs : boolean = true;
	if(slabTrigger != null && !slabTrigger.stepped.current) allSlabs = false;
	
	if(slabTriggerMultiple != null){
		for(var i = 0; i < slabTriggerMultiple.Length; i++){
			if(!slabTriggerMultiple[i].stepped.current){
				allSlabs = false;
				break;
			}
		}
	}
	
	pressingAll.current = allSlabs;

	if(pressingAll.toggledTrue){
		animationTimeTarget = 1.0;
	}
	if(pressingAll.toggledFalse){
		animationTimeTarget = 0.0;
	}	
	
	/*if(slabTrigger != null){
		if(slabTrigger.stepped.toggledTrue){
			animationTimeTarget = 1.0;
		}
		if(slabTrigger.stepped.toggledFalse){
			animationTimeTarget = 0.0;
		}
	}*/
	
	
	
	var useSpeed : float;
	if(animationTimeTarget == 1.0) useSpeed = openSpeed;
	else useSpeed = closeSpeed;
	
	animationTime = Mathf.MoveTowards(animationTime, animationTimeTarget, Time.deltaTime * useSpeed);
	
	clipBlendWeight.target = animationTimeTarget;
	clipBlendWeight.Lerp();
	
	animationComponent[openClip.name].weight = clipBlendWeight.current;
	animationComponent[closeClip.name].weight = 1 - clipBlendWeight.current;

}