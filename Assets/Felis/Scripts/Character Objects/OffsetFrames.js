#pragma strict

var frames : Frame[];

var currentFrame : int;
var previousFrame : int;

var constantSetOffset : boolean;

var rend : Renderer;

class Frame{
	var name : String;
	var offset : Vector2;
}

function Start () {
	rend = GetComponent.<Renderer>();
}

function Update () { 
	currentFrame = Mathf.Clamp(currentFrame, 0, frames.Length - 1);
	if(currentFrame != previousFrame || constantSetOffset){
		rend.material.SetTextureOffset("_MainTex", frames[currentFrame].offset);
	}
	
	previousFrame = currentFrame;
}

function SetFrame(name : String){
	for(var i = 0; i < frames.Length; i++){
		if(frames[i].name == name){
			currentFrame = i;
			break;
		}
	}
}