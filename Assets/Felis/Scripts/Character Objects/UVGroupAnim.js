#pragma strict

@Header("---------------Autoget Components-------------")
var frameGroups : UVFrameGroups;
@Header("------------------Input----------------------")
var frameGroup : int;
var frames : UVGroupAnimFrame [];
@Header("------------------Values----------------------")
var playing : ToggleBoolean;
var animTime : float;
var currentFrame : int;
var previousFrame : int;
var currentUVFrame : int;

class UVGroupAnimFrame{
	var frame : int;
	var frameStartTime : float;
}

function Start () {
	frameGroups = FindUtility.ReverseFindUVFrameGroups(transform);
}

function Update () {
	playing.Update();
	
	
	
	if(playing.toggledTrue){
		currentFrame = 0;
		animTime = 0.0;
		frameGroups.SetFrame(frameGroup, frames[0].frame);
	}
	
	if(playing.current){
		animTime = Time.time - playing.toggledTrueTime;
		CheckFrameTime();
	}
	
	currentUVFrame = frames[currentFrame].frame;
	
	if(currentFrame != previousFrame){
		previousFrame = currentFrame;
		frameGroups.SetFrame(frameGroup, currentUVFrame);
	}
	
	
}

function CheckFrameTime(){
	if(currentFrame >= frames.Length - 1){
		currentFrame = frames.Length - 1;
		playing.current = false;
	}
	else{
		if(animTime > frames[currentFrame+1].frameStartTime){
			currentFrame ++;
			CheckFrameTime();
		}		
	}
	

}