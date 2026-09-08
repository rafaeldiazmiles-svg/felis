#pragma strict

@Header("----------Input-------------")
var feetGroup : int;
var groundedFrame : int;
var looseFrame : int;

@Header("----------Comps-------------")
var frameGroups : UVFrameGroups;
var isGrounded : IsGrounded;


function Start () {
	if(frameGroups == null){
		frameGroups = transform.parent.GetComponentInChildren.<UVFrameGroups>();
	}
	if(isGrounded == null){
		isGrounded  = transform.parent.GetComponentInChildren.<IsGrounded>();
	}
}

function Update () {
	if(isGrounded.isGrounded){
		frameGroups.SetFrame(feetGroup, groundedFrame);
	}
	else{
		frameGroups.SetFrame(feetGroup, looseFrame);
	}
}