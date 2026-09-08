#pragma strict

var alpha : FloatLerp;

var fadeAreasNames : String[];

var fadeAreas : AreaMesh[];

var action : Visibility;

var useAllChildren : boolean = true;
var renderers : Renderer[];

enum Visibility{Hide, Show}
@Space(30)
var excludeAreasNames : String[];
var excludeAreas : AreaMesh[];
@Space(30)
var playedAudio : boolean;
var audioFirstShow : AudioSource;

@Space(50)
var getAllAreaNames : boolean;
var getAllAreaNames_Exclude : boolean;



function RetrieveAllAreaNames(){
	var fadeAreasArray : Array = new Array();
	var allFadeAreas : AreaMesh[] = GameObject.FindObjectsOfType.<AreaMesh>();
	for(var n = 0; n < allFadeAreas.Length; n++){
		fadeAreasArray.Add(allFadeAreas[n].name);
	}
	if(fadeAreasArray.length > 0){
		fadeAreasNames = new String[fadeAreasArray.length];
		fadeAreasNames = fadeAreasArray.ToBuiltin(String);
	}
}

function RetrieveAllAreaNames_Exclude(){
	var fadeAreasArray : Array = new Array();
	var allFadeAreas : AreaMesh[] = GameObject.FindObjectsOfType.<AreaMesh>();
	for(var n = 0; n < allFadeAreas.Length; n++){
		fadeAreasArray.Add(allFadeAreas[n].name);
	}
	if(fadeAreasArray.length > 0){
		excludeAreasNames = new String[fadeAreasArray.length];
		excludeAreasNames = fadeAreasArray.ToBuiltin(String);
	}
}


function GetExludeAreas(){
	if(excludeAreasNames != null && excludeAreasNames.Length > 0){
		var fadeAreasArray : Array = new Array();
		var allFadeAreas : AreaMesh[] = GameObject.FindObjectsOfType.<AreaMesh>();
		for(var i = 0; i < excludeAreasNames.Length; i++){
			for(var n = 0; n < allFadeAreas.Length; n++){
				if(excludeAreasNames[i] == allFadeAreas[n].gameObject.name){
					fadeAreasArray.Add(allFadeAreas[n]);
				}
			}
		}
		if(fadeAreasArray.length > 0){
			excludeAreas = fadeAreasArray.ToBuiltin(AreaMesh);
		}
	}
}

function GetFadeAreas(){
	if(fadeAreasNames != null && fadeAreasNames.Length > 0){
		var fadeAreasArray : Array = new Array();
		var allFadeAreas : AreaMesh[] = GameObject.FindObjectsOfType.<AreaMesh>();
		for(var i = 0; i < fadeAreasNames.Length; i++){
			for(var n = 0; n < allFadeAreas.Length; n++){
				if(fadeAreasNames[i] == allFadeAreas[n].gameObject.name){
					fadeAreasArray.Add(allFadeAreas[n]);
				}
			}
		}
		if(fadeAreasArray.length > 0){
			fadeAreas = fadeAreasArray.ToBuiltin(AreaMesh);
		}
	}
}

function Start () {
	if(useAllChildren){
		renderers = GetComponentsInChildren.<Renderer>();
	}
	alpha.changed = true;

	GetFadeAreas();
	GetExludeAreas();

	SetFade();

	if(alpha.speed == 0.0){
		alpha.speed = 8.0;
	}
	if(alpha.magnet == 0.0){
		alpha.magnet = .1;
	}
}

function LateUpdate () {
	//if(Time.frameCount % skip == 0){
		SetFade();
	//}
}

function SetFade(){
	//yield WaitForEndOfFrame();

	alpha.target = 0.0;

	for(var n = 0; n < fadeAreas.Length; n++){
		if(fadeAreas[n].charInArea){
			alpha.target = 1.0;

			if(!playedAudio){
				playedAudio = true;
				if(audioFirstShow != null){
					audioFirstShow.Play();
				}
			}

			break;
		}
	}

	if(action == Visibility.Hide){
		alpha.target = -alpha.target + 1.0;
	}

	for(n = 0; n < excludeAreas.Length; n++){
		if(excludeAreas[n].charInArea){
			alpha.target = 0.0;
			break;
		}
	}

	alpha.Lerp();

	for(var i = 0; i < renderers.Length; i++){
		if(renderers[i] == null){
			continue;
		}
		if(alpha.changed || Time.timeSinceLevelLoad > 1.0){
			if(renderers[i].material.HasProperty("_Color")){
				renderers[i].enabled = alpha.current > .05;
				renderers[i].material.color.a = alpha.current;

			}
			else{
				renderers[i].enabled = alpha.target > .05;
			}
		}

		/*if(renderers[i].gameObject != gameObject){
			if(alpha.target >  0.05 && !renderers[i].gameObject.activeSelf){
				renderers[i].gameObject.SetActive(true);
			}
			if(alpha.target < 0.05 && renderers[i].gameObject.activeSelf){
				renderers[i].enabled = false;
				//renderers[i].gameObject.SetActive(false);
			}
		}*/
	}
}

function OnDrawGizmosSelected(){
	#if UNITY_EDITOR
	if(getAllAreaNames){
		RetrieveAllAreaNames();
		getAllAreaNames = false;
	}

	if(getAllAreaNames_Exclude){
		RetrieveAllAreaNames_Exclude();
		getAllAreaNames_Exclude = false;
	}
	#endif
}