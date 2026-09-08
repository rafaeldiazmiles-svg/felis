#pragma strict

var sleepAnimation : AnimationClip;

var wakeAnimationTrigger : TriggerAnimation;

var prosperoWakeUpAnimation : PlayStillAnimation;

var playerTag : String = "Player";
var sleepObjName : String = "Sleep Behaviour";

var wokeUp : boolean;

var animationComp : Animation;

function Start () {
	GetProsperoWakeUpAnim();
	
	animationComp = GetComponent.<Animation>();
	animationComp[sleepAnimation.name].enabled = true;
	animationComp[sleepAnimation.name].weight = 1.0;
	
	wakeAnimationTrigger = GetComponent.<TriggerAnimation>();
}

function GetProsperoWakeUpAnim(){
	
	var playerObj : GameObject = GameObject.FindGameObjectWithTag(playerTag);
	if(playerObj != null){
		var allPlayerAnim : PlayStillAnimation[] = playerObj.GetComponentsInChildren.<PlayStillAnimation>();
		for(var i = 0; i < allPlayerAnim.Length; i++){
			if(allPlayerAnim[i].gameObject.name.ToLower().Contains(sleepObjName.ToLower())){
				prosperoWakeUpAnimation = allPlayerAnim[i];
				break;
			}
		}
	}
}

function Update () {
	if(prosperoWakeUpAnimation == null){
		GetProsperoWakeUpAnim();
	}
	else{
		if(prosperoWakeUpAnimation.animationPlay.toggledTrue){
			wakeAnimationTrigger.play = true;
			wokeUp = true;
		}
		
		if(wokeUp) animationComp[sleepAnimation.name].weight = Mathf.Lerp(animationComp[sleepAnimation.name].weight, 0, Time.deltaTime);
	}
}