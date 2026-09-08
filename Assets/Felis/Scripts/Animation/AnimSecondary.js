#pragma strict

var blend : FloatLerp;

var animationComponent : Animation;

var idleAnimation : IdleAnimation;
var sideMovementAnimation : SideMovementAnimation ;
var jumpSwimAnimation : JumpSwimAnimation;
var hurt : Hurt;

var idleAnimationClip : AnimationClip;
var jumpUpAnimationClip : AnimationClip;
var fallDownAnimationClip : AnimationClip;
var landAnimationClip : AnimationClip;
var runAnimationClip : AnimationClip;
var hurtAnimationClip : AnimationClip;

var start : boolean;
var using : boolean;

/*function Start(){

	
}*/

function SetVals(){
	animationComponent = transform.parent.GetComponent.<Animation>();
	idleAnimation = GetComponent(IdleAnimation);
	sideMovementAnimation = GetComponent(SideMovementAnimation );
	jumpSwimAnimation = GetComponent(JumpSwimAnimation);
	hurt = transform.parent.GetComponentInChildren(Hurt);
	
	animationComponent.AddClip(idleAnimationClip, idleAnimationClip.name);
	animationComponent.AddClip(jumpUpAnimationClip, jumpUpAnimationClip.name);
	animationComponent.AddClip(fallDownAnimationClip, fallDownAnimationClip.name);
	animationComponent.AddClip(landAnimationClip, landAnimationClip.name);
	animationComponent.AddClip(runAnimationClip, runAnimationClip.name);
	animationComponent.AddClip(hurtAnimationClip, hurtAnimationClip.name);
}

function Update(){
	if(start){
		start = false;
		using = true;
		SetVals();
	}
	
	blend.Lerp();
	
	if(!using) return;
	
	if(blend.current < .01 && blend.target < .01){
		blend.current = 0.0;
		return;
	}
	
	if(blend.current > 0){
		if(idleAnimationClip != null){
			var weight : float = animationComponent[idleAnimation.idleAnimation.name].weight * blend.current;
			animationComponent[idleAnimationClip.name].enabled = weight > .05;
			animationComponent[idleAnimationClip.name].weight = weight;
			animationComponent[idleAnimationClip.name].layer = animationComponent[idleAnimation.idleAnimation.name].layer + 1;
			animationComponent[idleAnimation.idleAnimation.name].weight = animationComponent[idleAnimationClip.name].weight * (1-blend.current);
		}
		
		if(jumpUpAnimationClip != null){
			weight = animationComponent[jumpSwimAnimation.jumpUpAnimation.name].weight * blend.current;
			animationComponent[jumpUpAnimationClip.name].enabled = weight > .05;
			animationComponent[jumpUpAnimationClip.name].weight = weight;
			animationComponent[jumpUpAnimationClip.name].layer = animationComponent[jumpSwimAnimation.jumpUpAnimation.name].layer + 1;
			animationComponent[jumpSwimAnimation.jumpUpAnimation.name].weight = animationComponent[jumpUpAnimationClip.name].weight * (1-blend.current);
		}
		
		if(fallDownAnimationClip != null){
			weight =  animationComponent[jumpSwimAnimation.fallDownAnimation.name].weight * blend.current;
			animationComponent[fallDownAnimationClip.name].enabled = weight > .05;
			animationComponent[fallDownAnimationClip.name].weight = weight;
			animationComponent[fallDownAnimationClip.name].layer = animationComponent[jumpSwimAnimation.fallDownAnimation.name].layer + 1;
			animationComponent[jumpSwimAnimation.fallDownAnimation.name].weight = animationComponent[fallDownAnimationClip.name].weight * (1-blend.current);
		}
		
		if(landAnimationClip != null){
			weight = animationComponent[jumpSwimAnimation.landAnimation.name].weight * blend.current;
			animationComponent[landAnimationClip.name].enabled = weight > .05;
			animationComponent[landAnimationClip.name].weight = weight;
			animationComponent[landAnimationClip.name].layer = animationComponent[jumpSwimAnimation.landAnimation.name].layer + 1;
			animationComponent[jumpSwimAnimation.landAnimation.name].weight = animationComponent[landAnimationClip.name].weight * (1-blend.current);
		}
		
		if(runAnimationClip != null){
			weight = animationComponent[sideMovementAnimation.runAnimation.name].weight * blend.current;
			animationComponent[runAnimationClip.name].enabled = weight > .05;
			animationComponent[runAnimationClip.name].weight = weight;
			animationComponent[runAnimationClip.name].layer = animationComponent[sideMovementAnimation.runAnimation.name].layer + 1;
			animationComponent[sideMovementAnimation.runAnimation.name].weight = animationComponent[runAnimationClip.name].weight * (1-blend.current);
		}
		if(hurtAnimationClip != null){
			weight = animationComponent[hurt.hurtClip.name].weight * blend.current;
			animationComponent[hurtAnimationClip.name].enabled = weight > .05;
			animationComponent[hurtAnimationClip.name].weight = weight;
			animationComponent[hurtAnimationClip.name].layer = animationComponent[hurt.hurtClip.name].layer + 1;
			animationComponent[hurt.hurtClip.name].weight = animationComponent[hurtAnimationClip.name].weight * (1-blend.current);
		}
	}
}