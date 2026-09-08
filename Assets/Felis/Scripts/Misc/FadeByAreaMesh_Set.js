#pragma strict

var targetByName : String;

var fadeAreasNames : String[];
@Space(50)
var getAllAreaNames : boolean;

function Start () {
	if(targetByName != ""){
		var allFBAM : FadeByAreaMesh[] = GameObject.FindObjectsOfType.<FadeByAreaMesh>();
		for(var i = 0; i < allFBAM.Length; i++){
			if(allFBAM[i].name == targetByName){
				allFBAM[i].fadeAreasNames = fadeAreasNames;
				allFBAM[i].GetFadeAreas();
				allFBAM[i].GetExludeAreas();
				break;
			}
		}
	}
}

function Update () {

}

function OnDrawGizmosSelected(){
	#if UNITY_EDITOR
	if(getAllAreaNames){
		RetrieveAllAreaNames();
		getAllAreaNames = false;
	}
	#endif
}

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
