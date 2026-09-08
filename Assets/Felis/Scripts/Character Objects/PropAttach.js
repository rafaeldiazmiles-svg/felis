#pragma strict
@Space(30)
var parent : Parent;
var linkedDUseParent : boolean = true;
var linkedD : LinkedDestroy;
@Space(30)
var follow : Follow;
@Space(30)
var rend : Renderer;
@Space(30)
var getTimer : Timer;
var charTag : String[];
var tagsParent : boolean;
var boneName : String;
var altBoneNames : String[];
var requireParentName : boolean;
var parentName : String;
var detectRange : float = 1.5;

var matchColor : boolean;
var colorProp : String = "_Color";
var charColorProp : String = "_Color";

@Space(30)
var boneAttach : Transform;

var character : Transform;
var charRend : Renderer;

@Space(30)
var affectSecondaryAnim : AffectSecondaryAnim[]; //Apply offset for secondaryAnim.js
@Space(30)
var registerUnderwaterRend : boolean = true;
@Space(30)
var sideDetectIgnoreOwn : boolean = true;

class AffectSecondaryAnim{
	var parentBoneName : String;
	var addLocalOffset : Vector3;
}

function FindBoneForChar(tgtCharacter : Transform){
	character = tgtCharacter;
	var thisCharBones : Transform[] = tgtCharacter.GetComponentsInChildren.<Transform>();
	for(var m = 0; m < thisCharBones.Length; m++){
		if(thisCharBones[m].name.ToLower().Contains(boneName.ToLower())){
			boneAttach = thisCharBones[m];
			break;
		}
	}

	if(boneAttach != null){
		//Follow
		if(follow == null){
			follow = GetComponent.<Follow>();
		}

		if(follow != null){
			follow.target = boneAttach;
			follow.rootCharacter = character;
		}

		//Parent
		if(parent == null){
			parent = GetComponent.<Parent>();
		}

		if(parent != null){
			parent.target = boneAttach;
			parent.Apply(boneAttach);
		}
	}

	if(character != null){
		charRend = character.GetComponentInChildren.<Renderer>();
	}
}

function FindSuitableChar(useBoneName : String){
	var closestBone : Transform;
	var closestBoneDist : float;
	for(var i = 0; i < charTag.Length; i++){
		var thisTagChars : GameObject[] = GameObject.FindGameObjectsWithTag(charTag[i]);
		for(var n = 0; n < thisTagChars.Length; n++){
			if(Vector3.Distance(transform.position, thisTagChars[n].transform.position) > detectRange){	
				continue;
			}

			var thisCharBones : Transform[];
			if(tagsParent){
				thisCharBones = thisTagChars[n].transform.parent.GetComponentsInChildren.<Transform>();
			}
			else{
				thisCharBones = thisTagChars[n].GetComponentsInChildren.<Transform>();
			}

			for(var m = 0; m < thisCharBones.Length; m++){
				if(requireParentName){
					if(thisCharBones[m].parent == null){
						continue;
					}
					else{
						if(!thisCharBones[m].parent.name.ToLower().Contains(parentName.ToLower())){
							continue;
						}
					}
				}
				if(thisCharBones[m].name.ToLower().Contains(useBoneName.ToLower())){
					if(closestBone == null){
						closestBone = thisCharBones[m];
						closestBoneDist = Vector3.Distance(transform.position, closestBone.position);
						if(tagsParent){
							character = thisTagChars[n].transform.parent;
						}
						else{
							character = thisTagChars[n].transform;
						}

					}
					else{
						var thisDist : float = Vector3.Distance(transform.position, thisCharBones[m].position);
						if(thisDist < closestBoneDist){
							closestBone = thisCharBones[m];
							closestBoneDist = thisDist;
							if(tagsParent){
								character = thisTagChars[n].transform.parent;
							}
							else{
								character = thisTagChars[n].transform;
							}
						}
					}
				}
			}
		}
	}
	boneAttach = closestBone;
	
	if(character != null){
		charRend = character.GetComponentInChildren.<Renderer>();
	}
	
	if(boneAttach != null){
		if(linkedD != null && linkedDUseParent){
			linkedD.enabled = true;
			linkedD.otherObject = boneAttach.gameObject;
		}
		if(parent != null){
			parent.Apply(boneAttach);

			if(affectSecondaryAnim != null && affectSecondaryAnim.Length > 0){
				var allBoneAttachChildren : Transform[] = boneAttach.GetComponentsInChildren.<Transform>();
				for(n = 0; n < affectSecondaryAnim.Length; n++){
					for(i = 0; i <  allBoneAttachChildren.Length; i++){
						if(allBoneAttachChildren[i].name.ToLower().Contains(affectSecondaryAnim[n].parentBoneName.ToLower())){
							var allChildrenOfFoundBone : Transform[] = 	allBoneAttachChildren[i].GetComponentsInChildren.<Transform>();
							for(m = 0; m < 	allChildrenOfFoundBone.Length; m++){
								var sAnim : SecondaryAnimation = allChildrenOfFoundBone[m].GetComponent.<SecondaryAnimation>();
								if(sAnim != null){
									sAnim.addLocalPosOffset = affectSecondaryAnim[n].addLocalOffset;
								}
							}
						}
					}
				}
			}
		}
		else{
			if( follow != null){
				follow.target = boneAttach;
				follow.rootCharacter = character;
			}
		}

		if(registerUnderwaterRend){
			var charUnderWater : UnderWater = character.GetComponentInChildren.<UnderWater>();
			if(charUnderWater != null){
				charUnderWater.AddPropRend(rend);
			}
		}

		if(sideDetectIgnoreOwn){
			var sd : SideDetection = character.GetComponentInChildren.<SideDetection>();
			if(sd != null){
				sd.IgnoreOwn();
			}
		}
	}
}

function OnDrawGizmosSelected(){
	#if UNITY_EDITOR
	DebugUtility.DrawCircle(transform.position, detectRange, Vector3.forward, Color.cyan, 16);
	#endif
}

function Start () {
	rend = GetComponentInChildren.<Renderer>();
	parent = GetComponent.<Parent>();
	follow = GetComponent.<Follow>();
	linkedD = GetComponent.<LinkedDestroy>();

	if(getTimer.every == 0.0){
		getTimer.every = .1;
	}
}

function LateUpdate () {
	getTimer.Update();
	if(getTimer.current){
		if(boneAttach == null){
			FindSuitableChar(boneName);
			if(boneAttach == null){
				for(var i = 0; i < altBoneNames.Length; i++){
					FindSuitableChar(altBoneNames[i]);
					if(boneAttach != null){
						break;
					}
				}
			}
		}
	}
	
	if(matchColor){
		if(charRend != null && rend != null){
			rend.material.SetColor(colorProp, charRend.material.GetColor(charColorProp));
		}
	}
}