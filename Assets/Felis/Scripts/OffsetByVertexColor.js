#pragma strict

var colorGroups : VertexColorGroups;

var groupFrames : GroupFrame[];

var testFrame : boolean;
var testGroupNumber : int;
var testFrameNumber : int;


class GroupFrame{
	var offset : Vector2[];
}

function Start () {
	if(colorGroups == null) colorGroups = GetComponentInChildren(VertexColorGroups);
}

function Update () {
	if(testFrame) SetFrame(testGroupNumber, testFrameNumber);
}

function SetFrame(groupNumber : int, frameNumber : int){
	colorGroups.OffsetUVGroup(groupNumber, groupFrames[groupNumber].offset[frameNumber]);
}