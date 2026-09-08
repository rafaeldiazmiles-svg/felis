#pragma strict

var animationClip : AnimationClip;
var speed : float;
var layer : int;
var blendMode : AnimationBlendMode;

var playAtStart : boolean;
var playAgain : boolean;

var animationClipSecondary : AnimationClip[];

var animComp : Animation;

function Start () {
	animComp = GetComponent.<Animation>();
	
	if(playAtStart){
		animComp[animationClip.name].enabled = true;
		animComp[animationClip.name].weight = 1.0;
		animComp[animationClip.name].speed = speed;
		animComp[animationClip.name].layer = layer;
		animComp[animationClip.name].time = 0.0;
		animComp[animationClip.name].blendMode = blendMode;
	}
}

function Update () {
	if(playAgain){
		animComp[animationClip.name].enabled = true;
		animComp[animationClip.name].weight = 1.0;
		animComp[animationClip.name].speed = speed;
		animComp[animationClip.name].layer = layer;
		animComp[animationClip.name].time = 0.0;
		animComp[animationClip.name].blendMode = blendMode;
		
		playAgain = false;	
	}
}

function PlaySecondary(ID : int, alone : boolean){
	if(animationClipSecondary == null || animationClipSecondary.Length == 0.0) return;
	animComp[animationClipSecondary[ID].name].enabled = true;
	animComp[animationClipSecondary[ID].name].weight = 1.0;
	animComp[animationClipSecondary[ID].name].speed = speed;
	animComp[animationClipSecondary[ID].name].layer = layer;
	animComp[animationClipSecondary[ID].name].time = 0.0;
	animComp[animationClipSecondary[ID].name].blendMode = blendMode;
	
	if(alone){
		for(var state : AnimationState in animComp){
			if(state != animComp[animationClipSecondary[ID].name]){
				state.enabled = false;
			}
		}
	}
}

function Set(time : float, alone : boolean){
	
	animComp[animationClip.name].enabled = true;
	animComp[animationClip.name].weight = 1.0;
	animComp[animationClip.name].speed = 0.0;
	animComp[animationClip.name].layer = layer;
	animComp[animationClip.name].time = time;
	animComp[animationClip.name].blendMode = blendMode;
	
	if(alone){
		for(var state : AnimationState in animComp){
			if(state != animComp[animationClip.name]){
				state.enabled = false;
			}
		}
	}
}


function SetNormalized(normalized : float, alone : boolean){
	
	animComp[animationClip.name].enabled = true;
	animComp[animationClip.name].weight = 1.0;
	animComp[animationClip.name].speed = 0.0;
	animComp[animationClip.name].layer = layer;
	animComp[animationClip.name].normalizedTime = normalized;
	animComp[animationClip.name].blendMode = blendMode;
	if(alone){
		for(var state : AnimationState in animComp){
			if(state != animComp[animationClip.name]){
				state.enabled = false;
			}
		}
	}
}

function SetSecondary(ID : int, time : float, alone : boolean){
	if(animationClipSecondary == null || animationClipSecondary.Length == 0.0) return;
	animComp[animationClipSecondary[ID].name].enabled = true;
	animComp[animationClipSecondary[ID].name].weight = 1.0;
	animComp[animationClipSecondary[ID].name].speed = 0.0;
	animComp[animationClipSecondary[ID].name].layer = layer;
	animComp[animationClipSecondary[ID].name].time = time;
	animComp[animationClipSecondary[ID].name].blendMode = blendMode;
	if(alone){
		for(var state : AnimationState in animComp){
			if(state != animComp[animationClipSecondary[ID].name]){
				state.enabled = false;
			}
		}
	}
}

function SetSecondaryNormalized(ID : int, normalized : float, alone : boolean){
	if(animationClipSecondary == null || animationClipSecondary.Length == 0.0) return;
	animComp[animationClipSecondary[ID].name].enabled = true;
	animComp[animationClipSecondary[ID].name].weight = 1.0;
	animComp[animationClipSecondary[ID].name].speed = 0.0;
	animComp[animationClipSecondary[ID].name].layer = layer;
	animComp[animationClipSecondary[ID].name].normalizedTime = normalized;
	animComp[animationClipSecondary[ID].name].blendMode = blendMode;
	if(alone){
		for(var state : AnimationState in animComp){
			if(state != animComp[animationClipSecondary[ID].name]){
				state.enabled = false;
			}
		}
	}
}