#pragma strict

var glowFadeOutAreas : GlowFadeOutArea[];

var debug : boolean;

function Start () {
	//Add itself to glow list.
	var glowComp : Glow = GameObject.FindObjectOfType.<Glow>();
	if(glowComp != null){
		var glowFadeOutAreasArray : Array = new Array();
		if(glowComp.glowFadeOutAreas != null){
			for(var i = 0; i < glowComp.glowFadeOutAreas.Length; i++){
				glowFadeOutAreasArray.Push(glowComp.glowFadeOutAreas[i]);
			}
		}
		
		for(var n = 0; n < glowFadeOutAreas.Length; n++){
			glowFadeOutAreasArray.Push(glowFadeOutAreas[n]);
		}
		
		glowComp.glowFadeOutAreas = glowFadeOutAreasArray.ToBuiltin(GlowFadeOutArea) as GlowFadeOutArea[];
	}
}

function Update () {

}

function OnDrawGizmosSelected(){
	#if UNITY_EDITOR
	if(debug){
		for(var i = 0; i < glowFadeOutAreas.Length; i++){
			Gizmos.color = Color.gray;
			var transformOffset : Vector3;
			if(glowFadeOutAreas[i].transformCenter != null) transformOffset = glowFadeOutAreas[i].transformCenter.position;
			Gizmos.DrawWireCube(glowFadeOutAreas[i].bounds.center + transformOffset, glowFadeOutAreas[i].bounds.size);
		}
	}
	#endif
}