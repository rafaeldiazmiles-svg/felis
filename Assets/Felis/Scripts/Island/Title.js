#pragma strict

var autoGetComponents : boolean = true;

var titleRenderer : Renderer;
var fallAnimation : PlayStillAnimation;
var idleAnimation : PlayLoopAnimation;

var start : boolean;
var started : boolean;

var goUp : boolean;
var wentUp : boolean;

var startTriggerTime : float;

var fallAnimationClip : AnimationClip;
var goUpAnimationClip : AnimationClip;

var startTimeIsCreateTime : boolean = true;
var startTime : float;

var startScreen : StartScreen;
var startScreenName : String = "Start Screen";

var menuGoBackAudio : AudioSource;

var goUpTime : float;

function Start () {
	if(autoGetComponents){
		titleRenderer = GetComponentInChildren(Renderer);
		fallAnimation = GetComponent(PlayStillAnimation);
		idleAnimation = GetComponent(PlayLoopAnimation);
		var startScreenObj : GameObject =  GameObject.Find(startScreenName);
		if(startScreenObj!= null){
			startScreen = GameObject.Find(startScreenName).GetComponent(StartScreen);
		}
	}
	
	titleRenderer.enabled = false;
	
	if(startTimeIsCreateTime)
		startTime = Time.time;
}

function Update () {

	if(startScreen != null){
		if(!started && Time.time - startTime > startTriggerTime && startScreen.currentLevel == -1) start = true;
	}
	
	
	if(fallAnimation.animationPlay.current && GetComponent.<Animation>()[fallAnimation.stillAnimation.name].normalizedTime > .05){
		titleRenderer.enabled = true;
	}
	if(start){
		start = false;
		started = true;
		
		fallAnimation.stillAnimation = fallAnimationClip;
		fallAnimation.animationPlay.current = true;
		GetComponent.<Animation>()[fallAnimationClip.name].normalizedTime = 0.0;
		GetComponent.<Animation>()[goUpAnimationClip.name].normalizedTime = 0.0;
		GetComponent.<Animation>()[goUpAnimationClip.name].weight = 0.0;
		
		
		fallAnimation.stillAnimationWeightControl.target = 0.0;
		fallAnimation.stillAnimationWeightControl.current = 0.0;
		
		fallAnimation.holdPose = false;
	}
	
	if(fallAnimation.animationPlay.toggledFalse){
		idleAnimation.animationPlay.current = true;
	}
	
	if(goUp){
		goUp = false;
		wentUp = true;
		
		goUpTime = Time.time;
		
		fallAnimation.playSound[0] = menuGoBackAudio;
		
		fallAnimation.stillAnimation = goUpAnimationClip;
		idleAnimation.animationPlay.current = false;
		GetComponent.<Animation>()[fallAnimationClip.name].weight = 0.0;
		
		fallAnimation.forcePlay = true;
		fallAnimation.holdPose = true;
	}
	
	if(wentUp){
		if(Time.time > goUpTime + GetComponent.<Animation>()[goUpAnimationClip.name].length){
			titleRenderer.enabled = false;
		}
	}
}