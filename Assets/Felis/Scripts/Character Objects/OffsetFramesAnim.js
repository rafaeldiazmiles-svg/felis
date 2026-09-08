#pragma strict

var offsetFrames : OffsetFrames;
var playing : boolean;

var frames : OF_Frame[];
var currentFrame : int;
var nextFrameTime : float;

class OF_Frame{
	var duration : float;
	var ID : int;
}

function ResetAnim(){
	currentFrame = 0;
	ResetNextFrameTime();
	offsetFrames.currentFrame = frames[currentFrame].ID;
}

function ResetNextFrameTime(){
	nextFrameTime = Time.time + frames[currentFrame].duration;
}

function Start () {

}

function Update () {
	if(playing){
		if(Time.time > nextFrameTime){
			currentFrame ++;
			currentFrame = currentFrame % frames.Length;
			ResetNextFrameTime();
			offsetFrames.currentFrame = frames[currentFrame].ID;
		}
	}

}