#pragma strict

var autoGetComponents : boolean = true;
var vColorGroups : VertexColorGroups;
var useColorGroupID : int;

var offset : Vector2;

var pupilBone : Transform;
var defaultPupilLocalPos : Vector3;
var pupilDeltaPos : Vector3;
var offsetMultiply : float;

function Start () {
	if(autoGetComponents){
		vColorGroups = GetComponent(VertexColorGroups);
	}
	
	defaultPupilLocalPos = pupilBone.transform.localPosition;
}

function LateUpdate () {
	pupilDeltaPos = pupilBone.transform.localPosition - defaultPupilLocalPos;
	offset.x = pupilDeltaPos.x * offsetMultiply;
	offset.y = -pupilDeltaPos.y * offsetMultiply;

	vColorGroups.OffsetUVGroup(useColorGroupID, offset);
}