#pragma strict

var autoFindComponents : boolean = true;

var currentFrame : int[];
var uvOffsetGroups : UVFrameGroup[];
var updateEveryFrame : boolean = false;

var testFrame : boolean;
var group : String;
var frame : String;


class UVFrameGroup{
	var name : String;
	var uvOffset : UVFrameOffset[];
}

class UVFrameOffset{
	var name : String;
	var offset : Vector2;
}

class UVFrame{
	var group : String;
	var frame : String;
}

var offsetUV : VertexColorGroups;




function Start () {
	if(autoFindComponents){
		offsetUV = GetComponentInChildren(VertexColorGroups);
	}
	currentFrame = new int[uvOffsetGroups.Length];
}

function Update () {
	if(testFrame) SetFrame(group, frame);
}


function SetFrame(group : int, frame : int) : boolean{
	var changeFrame : boolean;
	if(currentFrame[group] != frame || updateEveryFrame){
		if(group < uvOffsetGroups.Length && frame < uvOffsetGroups[group].uvOffset.Length){
			offsetUV.OffsetUVGroup(group, uvOffsetGroups[group].uvOffset[frame].offset);
			currentFrame[group] = frame;
			changeFrame = true;
		}
	}

	return changeFrame;
}

function SetFrameGroupZero(frame : float){
	if(currentFrame == null || currentFrame.Length == 0){
		offsetUV = GetComponentInChildren(VertexColorGroups);
		offsetUV.GetColorGroups();
		currentFrame = new int[uvOffsetGroups.Length];
	}
	currentFrame[0] = frame;
	offsetUV.OffsetUVGroup(0, uvOffsetGroups[0].uvOffset[frame].offset);
}

function GetFrame(group : String) : int{
	for(var i = 0; i < uvOffsetGroups.Length; i++){
		if(uvOffsetGroups[i].name == group){
			return i;
		}
	}
	return -1;
}

function SetFrame(group : String, frame : String) : boolean{
	var changeFrame : boolean;
	var frameGroupID : int = -1;
	for(var i = 0; i < uvOffsetGroups.Length; i++){
		if(uvOffsetGroups[i].name == group){
			frameGroupID = i;
			break;
		}
	}
	if(frameGroupID == -1) return;
	
	var frameID : int = -1;
	
	for(var n = 0; n < uvOffsetGroups[frameGroupID].uvOffset.Length; n++){
		if(uvOffsetGroups[frameGroupID].uvOffset[n].name == frame){
			frameID = n;
			break;
		}
	}
	if(frameID == -1)return;
	
	try{	
		if(currentFrame[frameGroupID] != frameID || updateEveryFrame){
			offsetUV.OffsetUVGroup(frameGroupID, uvOffsetGroups[frameGroupID].uvOffset[frameID].offset);
			currentFrame[frameGroupID] = frameID;
			changeFrame = true;
		}
	}
	catch(err){
		Debug.Log(frameGroupID);
	}

	return changeFrame;
}

function SetFrame(uvFrame : UVFrame) : boolean{
	var group : String = uvFrame.group;
	var frame : String = uvFrame.frame;
	
	var changeFrame : boolean;
	var frameGroupID : int = -1;
	for(var i = 0; i < uvOffsetGroups.Length; i++){
		if(uvOffsetGroups[i].name == group){
			frameGroupID = i;
			break;
		}
	}
	if(frameGroupID == -1) return;
	
	var frameID : int = -1;
	
	for(var n = 0; n < uvOffsetGroups[frameGroupID].uvOffset.Length; n++){
		if(uvOffsetGroups[frameGroupID].uvOffset[n].name == frame){
			frameID = n;
			break;
		}
	}
	if(frameID == -1)return;
	
	try{	
		if(currentFrame[frameGroupID] != frameID || updateEveryFrame){
			offsetUV.OffsetUVGroup(frameGroupID, uvOffsetGroups[frameGroupID].uvOffset[frameID].offset);
			currentFrame[frameGroupID] = frameID;
			changeFrame = true;
		}
	}
	catch(err){
		Debug.Log(frameGroupID);
	}

	return changeFrame;
}