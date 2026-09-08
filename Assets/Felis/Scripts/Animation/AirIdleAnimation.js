#pragma strict

@Header("--------------Input------------")
var speed : float;
var layer : int;
@Space(30)
var groundedIdleAnimation : AnimationClip;
var idleAnimation : AnimationClip;
var fallAnimation : AnimationClip;
var forwardAnimation : AnimationClip;

var blendCurve : AnimationCurve;
var fwdBlendCurve : AnimationCurve;

@Header("------------Values----------------")
var idleAnimationWeight : FloatLerp;
var fwdAnimationWeight : FloatLerp;
var blendSpeed : float = 8.0;
var blendFast : float = 20.0;
var side : int;

@Header("---------Autoget Components----------")
var animationComp : Animation;
var rb : Rigidbody;
var isGrounded : IsGrounded;
var wingedFlight : WingedFlight;

function Start () {
	if(animationComp == null){
		animationComp = transform.parent.GetComponentInChildren.<Animation>();
	}

	if(rb == null){
		rb = transform.parent.GetComponentInChildren.<Rigidbody>();
	}

	if(isGrounded == null){
		isGrounded = transform.parent.GetComponentInChildren.<IsGrounded>();
	}

	if(wingedFlight == null){
		wingedFlight = transform.parent.GetComponentInChildren.<WingedFlight>();
	}
	
	animationComp[idleAnimation.name].layer = layer;
	animationComp[fallAnimation.name].layer = layer;

	animationComp[idleAnimation.name].enabled = true;
	animationComp[fallAnimation.name].enabled = true;

	animationComp[idleAnimation.name].speed = speed;
	animationComp[fallAnimation.name].speed = speed;

	if(forwardAnimation != null){
		animationComp[forwardAnimation.name].layer = layer;
		animationComp[forwardAnimation.name].enabled = true;
		animationComp[forwardAnimation.name].speed = speed;

	}
	if(groundedIdleAnimation != null){
		animationComp[groundedIdleAnimation.name].layer = layer;
		animationComp[groundedIdleAnimation.name].enabled = true;
		animationComp[groundedIdleAnimation.name].speed = speed;
	}

	side = Mathf.Sign(transform.parent.localScale.x);
}

function Update () {
	if(wingedFlight != null){
		side = wingedFlight.side;
	}
	
	if(forwardAnimation != null){
		fwdAnimationWeight.target = fwdBlendCurve.Evaluate(-rb.velocity.x * side);
		fwdAnimationWeight.target = Mathf.Clamp01(fwdAnimationWeight.target);
	}

	animationComp[idleAnimation.name].enabled = true;
	animationComp[fallAnimation.name].enabled = true;
	if(forwardAnimation != null){
		animationComp[forwardAnimation.name].enabled = true;

	}

	idleAnimationWeight.target = blendCurve.Evaluate(rb.velocity.y); 
	if(forwardAnimation != null){
		idleAnimationWeight.target -= fwdAnimationWeight.target;
	}
	idleAnimationWeight.target = Mathf.Clamp01(idleAnimationWeight.target);


	fwdAnimationWeight.Lerp();
	idleAnimationWeight.Lerp();

	if(isGrounded != null && isGrounded.isGrounded && groundedIdleAnimation != null){
		animationComp[idleAnimation.name].weight = Mathf.Lerp(animationComp[idleAnimation.name].weight,0.0, blendFast*Time.deltaTime);
		animationComp[fallAnimation.name].weight =  Mathf.Lerp(animationComp[fallAnimation.name].weight,0.0, blendFast*Time.deltaTime);
		animationComp[groundedIdleAnimation.name].weight = Mathf.Lerp(animationComp[groundedIdleAnimation.name].weight,1.0, blendFast*Time.deltaTime);
		if(forwardAnimation != null){
			animationComp[forwardAnimation.name].weight = Mathf.Lerp(animationComp[forwardAnimation.name].weight,0.0, blendFast*Time.deltaTime);
		}
	}
	else{
		if(groundedIdleAnimation != null){
			animationComp[groundedIdleAnimation.name].weight = Mathf.Lerp(animationComp[groundedIdleAnimation.name].weight,0.0, blendSpeed*Time.deltaTime); 
		}
		animationComp[idleAnimation.name].weight = idleAnimationWeight.current;
		animationComp[fallAnimation.name].weight = 1 - animationComp[idleAnimation.name].weight;
		if(forwardAnimation != null){
			animationComp[forwardAnimation.name].weight = fwdAnimationWeight.current;
			animationComp[fallAnimation.name].weight -= animationComp[forwardAnimation.name].weight;
			animationComp[fallAnimation.name].weight = Mathf.Clamp01(animationComp[fallAnimation.name].weight);
		}
	}
}