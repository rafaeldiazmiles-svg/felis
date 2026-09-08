#pragma strict

var skinnedMesh : SkinnedMeshRenderer;

var originalCharacterPrefab : GameObject;

var bones : PreserveRelativeBone[];

var preserveLocalRotation : boolean;

var ignoreList : Transform[];

class PreserveRelativeBone{
	var bone : Transform;
	var ignore : boolean;
	var deltaPos : Vector3;
	var deltaRot : Quaternion;
}

function Start () {
	var i : int;
	
	skinnedMesh = transform.parent.GetComponentInChildren.<SkinnedMeshRenderer>();
	
	var originalCharacter : GameObject = Instantiate(originalCharacterPrefab,skinnedMesh.transform.position, skinnedMesh.transform.rotation);
	
	var originalSkinnedMesh : SkinnedMeshRenderer = originalCharacter.GetComponentInChildren(SkinnedMeshRenderer);
	//var originalSkinnedMesh : SkinnedMeshRenderer = originalCharacterPrefab.GetComponentInChildren(SkinnedMeshRenderer);
	var originalBones : Transform[] = new Transform[originalSkinnedMesh.bones.Length];
	for(i = 0; i < originalBones.Length; i++) originalBones[i] = originalSkinnedMesh.bones[i];
	
	bones = new PreserveRelativeBone[skinnedMesh.bones.Length];
	for(i = 0; i < bones.Length; i++){
		bones[i] = new PreserveRelativeBone();
		bones[i].bone = skinnedMesh.bones[i];
		
		for(var m = 0; m < ignoreList.Length; m++){
			if(ignoreList[m] == bones[i].bone){
				 bones[i].ignore = true;
			}
		}
		
		for(var n = 0; n < originalBones.Length; n++){
			if(bones[i].bone.name == originalBones[n].name){
				bones[i].deltaPos = bones[i].bone.localPosition - originalBones[n].localPosition;
				bones[i].deltaRot =  bones[i].bone.localRotation * Quaternion.Inverse(originalBones[n].localRotation);
				break;
			}
		}
	}
	
	Destroy(originalCharacter);
}

function LateUpdate () {
	for(var i = 0; i < bones.Length; i++){
		if(bones[i].ignore) continue;
		bones[i].bone.localPosition += bones[i].deltaPos;
		if(preserveLocalRotation) bones[i].bone.localRotation *= bones[i].deltaRot;
	}
}