#pragma strict

var debug : boolean;
var hideGroup : HideBounds[];

var character : Transform;

class HideBounds{
	var bounds : Bounds[];
	var hideRenderer : Renderer[];
	var hasCharacter : boolean;
}

function Start () { 

}

function Update () {
	for(var i = 0; i < hideGroup.Length; i++){
		hideGroup[i].hasCharacter = false;
		
		for(var n = 0; n < hideGroup[i].bounds.Length; n ++){
			if(hideGroup[i].bounds[n].Contains(character.position)){
				hideGroup[i].hasCharacter = true;
			}
		}

		if(!hideGroup[i].hasCharacter){
			for(var m = 0; m < hideGroup[i].hideRenderer.Length; m++){
				hideGroup[i].hideRenderer[m].enabled = false;
			}
		}
		else{
			for(m = 0; m < hideGroup[i].hideRenderer.Length; m++){
				hideGroup[i].hideRenderer[m].enabled = true;
			}		
		}

	}	
}

function OnDrawGizmosSelected(){
	#if UNITY_EDITOR
	if(debug){
		for(var i = 0; i < hideGroup.Length; i++){
			for(var n = 0; n < hideGroup[i].bounds.Length; n++){
				Gizmos.DrawWireCube(hideGroup[i].bounds[n].center, hideGroup[i].bounds[n].size);
			}
			
		}
	}
	#endif
}