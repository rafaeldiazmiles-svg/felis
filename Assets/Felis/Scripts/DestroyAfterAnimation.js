#pragma strict

var destroyAnimation : AnimationClip;

var animationComponent : Animation;

function Start () {
	animationComponent = GetComponentInChildren(Animation);
}

function Update () {
	if(animationComponent == null || destroyAnimation == null) return;

	//Pause disables every Animation in the scene, which tears down its AnimationStates.
	//A lookup while disabled hands back a dangling pointer that survives a null check and
	//crashes the process on read, so nothing here may touch a state until it is back on.
	if(!animationComponent.enabled) return;

	var state : AnimationState = animationComponent[destroyAnimation.name];
	if(state == null) return;
	if(state.normalizedTime >= 0.9){
		Destroy(gameObject);
	}
}
