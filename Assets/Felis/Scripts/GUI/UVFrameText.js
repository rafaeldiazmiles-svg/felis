#pragma strict

var frameGroups : UVFrameGroups;
var displayText : String;
var updateText : boolean;
var charAmount : int = 9;

var centerText : boolean;
var centerXPosition : float;
var charWidth : float;

function Start () {
	frameGroups = GetComponent(UVFrameGroups);
}

function Update () {
	if(updateText){
		for(var i = 0; i < charAmount; i++){
			if(i < displayText.Length){
				var currentChar : String = displayText.Substring(i, 1);
				if(currentChar != " ")
					frameGroups.SetFrame(i.ToString(), displayText.Substring(i, 1));
				else{
					frameGroups.SetFrame(i.ToString(), "_");
				}
			}
			else
				frameGroups.SetFrame(i.ToString(), "_");
		}
		updateText = false;
		
		if(centerText){
			transform.localPosition.x = centerXPosition + charWidth * displayText.Length;
		}
	}
}