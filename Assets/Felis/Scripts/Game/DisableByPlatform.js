#pragma strict

var platform : Platform;
var disableByPlatformGroups : DisableByPlatform_Group[];

var apply : boolean;

class DisableByPlatform_Group{
	var onPlatform  : PlatformType[];
	@Space(30)
	var enableObjs  : GameObject[];
	var disableObjs : GameObject[];
	@Space(30)
	var enableScripts : MonoBehaviour[];
	var disableScripts : MonoBehaviour[];
}

function Start () {
	platform = GameObject.FindObjectOfType.<Platform>();	
}

function Update () {
	if(apply){
		if(platform != null){
			apply = false;
			Apply();
		}
	}
}

function Apply(){
	for(var i = 0; i < disableByPlatformGroups.Length; i++){
		for(var n = 0; n < disableByPlatformGroups[i].onPlatform.Length; n++){
			if(platform.platform == disableByPlatformGroups[i].onPlatform[n]){
				for(var m = 0; m < disableByPlatformGroups[i].enableObjs.Length; m++){
					disableByPlatformGroups[i].enableObjs[m].SetActive(true);
				}
				for(m = 0; m < disableByPlatformGroups[i].disableObjs.Length; m++){
					disableByPlatformGroups[i].disableObjs[m].SetActive(false);
				}

				for(m = 0; m < disableByPlatformGroups[i].enableScripts.Length; m++){
					disableByPlatformGroups[i].enableScripts[m].enabled = true;
				}
				for(m = 0; m < disableByPlatformGroups[i].disableScripts.Length; m++){
					disableByPlatformGroups[i].disableScripts[m].enabled = false;
				}
				break;
			}
		}
	}
}

function IsObjectDisabled(obj : GameObject){
	if(platform == null) return;

	for(var i = 0; i < disableByPlatformGroups.Length; i++){
		for(var n = 0; n < disableByPlatformGroups[i].onPlatform.Length; n++){
			if(platform.platform == disableByPlatformGroups[i].onPlatform[n]){
				for(var m = 0; m < disableByPlatformGroups[i].disableObjs.Length; m++){
					if( disableByPlatformGroups[i].disableObjs[m] == obj){
						return true;
						break;
					}
				}
			}
		}
	}
	return false;
}