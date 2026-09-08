#pragma strict

var skinnedMesh : SkinnedMeshRenderer;

var bones : PreserveLocalPositionBone[];

var getBones : boolean;

class PreserveLocalPositionBone{
	var bone : Transform;
	var delta : Vector3;
}

function Start () {
	if(getBones){
		bones = new PreserveLocalPositionBone[skinnedMesh.bones.Length];
		for(var i = 0; i < bones.Length; i++){
			bones[i] = new PreserveLocalPositionBone();
			bones[i].bone = skinnedMesh.bones[i];
		}
	}
}

function LateUpdate () {
	for(var i = 0; i < bones.Length; i++){
		bones[i].bone.localPosition += bones[i].delta;
	}
}