#pragma strict

var fGroupSource : UVFrameGroups;

var fGroupTarget : UVFrameGroups;

var sourceSearchTag : String = "Player";

var getTimer : Timer;

function Start () {
	if(getTimer.every == 0.0){
		getTimer.every = 1.0;
	}
}

function Update () {
	getTimer.Update();
	if(getTimer.current){
		if(fGroupSource == null){
			var player : GameObject = GameObject.FindWithTag(sourceSearchTag);
			if(player != null){
				fGroupSource = player.GetComponentInChildren.<UVFrameGroups>();
			}
		}
	}

	if(fGroupSource != null && fGroupTarget != null  
	&& fGroupTarget.currentFrame != null && fGroupSource.currentFrame != null
	&& fGroupTarget.currentFrame.Length <= fGroupSource.currentFrame.Length){
		for(var i = 0; i < fGroupTarget.currentFrame.Length; i++){
			fGroupTarget.SetFrame(i, fGroupSource.currentFrame[i]);
		}
	}
}