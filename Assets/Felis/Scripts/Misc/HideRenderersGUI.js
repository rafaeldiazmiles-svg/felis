#pragma strict

var fadeOut : FadeOut;

var guiRenderers : Renderer[];
var guiRenderers_alsoChildren : boolean;

function Start () {

}

function Update () {
	if(fadeOut != null){
		for(var i = 0; i < fadeOut.defaultColors.Length; i++){
			fadeOut.defaultColors[i].a = 0.0;
		}
	}

	for(var n = 0; n < guiRenderers.Length; n++) {
		guiRenderers[n].material.color.a = 0.0;
		if(guiRenderers_alsoChildren){
			var rendChildren : Renderer[] = guiRenderers[n].gameObject.GetComponentsInChildren.<Renderer>();
			for(var m = 0; m < rendChildren.Length; m++){
				rendChildren[m].material.color.a = 0.0;
			}
		}
	}
}