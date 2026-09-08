#pragma strict

var startScreen : StartScreen;

var autoGetComponents : boolean = true;
var scrollRenderers : Renderer[];

var disableRenderersAtStart : boolean = true;

var show : ToggleBoolean;

var playDelay : float = 1.0;
var playAnimation : PlayAnimation;

var showing : boolean;

function Start () {
	if(autoGetComponents){
		scrollRenderers = GetComponentsInChildren.<Renderer>() as Renderer[];
		playAnimation = GetComponent(PlayAnimation);
	}
	
	if(disableRenderersAtStart){
		for(var i = 0; i < scrollRenderers.Length; i++){
			scrollRenderers[i].enabled = false;
		}
	}
}

function Update () {
	if(startScreen.currentLevel != -1) show.current = true;
	else show.current = false;
	
	show.Update();
	
	if(!showing && show.current && Time.time > show.toggledTrueTime + playDelay){
		showing = true;
		
		for(var i = 0; i < scrollRenderers.Length; i++){
			scrollRenderers[i].enabled = true;
		}	
		
		GetComponent.<Animation>()[playAnimation.animationClip.name].enabled = true;
		GetComponent.<Animation>()[playAnimation.animationClip.name].weight = 1.0;
		GetComponent.<Animation>()[playAnimation.animationClip.name].time = 0.0;
		GetComponent.<Animation>()[playAnimation.animationClip.name].speed = 1.0;
		
		playAnimation.playAgain = true;
	}
	
	if(show.toggledFalse){
		for(i = 0; i < scrollRenderers.Length; i++){
			showing = false;
			scrollRenderers[i].enabled = false;
			GetComponent.<Animation>()[playAnimation.animationClip.name].enabled = true;
			GetComponent.<Animation>()[playAnimation.animationClip.name].weight = 1.0;
			GetComponent.<Animation>()[playAnimation.animationClip.name].time = 0.0;
			GetComponent.<Animation>()[playAnimation.animationClip.name].speed = 0.0;
		}	
	}

}