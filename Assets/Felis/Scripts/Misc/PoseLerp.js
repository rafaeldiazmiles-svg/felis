#pragma strict

@script ExecuteInEditMode()

var lerpValue : FloatLerp;
@Space(20)
var lerpLocalRotation : Transform[]; 
var lerpLocalRotationSource : Transform[]; 
@Space(20)
var forceLocalRotation : Transform[];
var forceLocalRotationSource : Transform[]; 
@Space(20)
var sourceBonesRoot : Transform;
var getSourceBones : boolean;
@Space(40)
var addDeltaPos : Transform[];
var deltaPosSource : Transform;
var deltaPosDefault : Vector3;
@Space(40)
var anim : PlayStillAnimation;
var playNow : boolean;

function Start () {
	deltaPosDefault = deltaPosSource.localPosition;
}

function LateUpdate () {
	if(Application.isPlaying){
		var dPos : Vector3 = deltaPosSource.localPosition - deltaPosDefault;
		dPos = Vector3.Scale(dPos, transform.localScale);

		lerpValue.target = 1 - anim.stillAnimationWeightControl.current;

		lerpValue.Lerp();

		for(var n = 0; n < lerpLocalRotation.Length; n++){
			lerpLocalRotation[n].localRotation = Quaternion.Lerp(lerpLocalRotation[n].localRotation, lerpLocalRotationSource[n].localRotation, lerpValue.current);
		}

		for(var m = 0; m < forceLocalRotation.Length; m++){
			forceLocalRotation[m].localRotation = forceLocalRotationSource[m].localRotation;
		}


		for(var i = 0; i < addDeltaPos.Length; i++){
			addDeltaPos[i].position += dPos;
		}

		if(playNow){
			playNow = false;
			anim.animationPlay.current = true;
		}
	}
	else{
		if(getSourceBones){
			getSourceBones = false;
			GetSourceBones();
		}
	}
}

function GetSourceBones(){
	var allSourceBones : Transform[] = sourceBonesRoot.GetComponentsInChildren.<Transform>();

	var lerpLocalRotationArray : Array = new Array();
	var forceLocalRotationArray : Array = new Array();

	for(var i = 0; i < allSourceBones.Length; i++){
		for(var n = 0; n < lerpLocalRotation.Length; n++){
			if(allSourceBones[i].name == lerpLocalRotation[n].name){
				lerpLocalRotationArray.Push(allSourceBones[i]);
			}
		}

		for(var m = 0; m < forceLocalRotation.Length; m++){
			if(allSourceBones[i].name == forceLocalRotation[m].name){
				forceLocalRotationArray.Push(allSourceBones[i]);
			}
		}
	}

	lerpLocalRotationSource = lerpLocalRotationArray.ToBuiltin(Transform);
	forceLocalRotationSource = forceLocalRotationArray.ToBuiltin(Transform);
}