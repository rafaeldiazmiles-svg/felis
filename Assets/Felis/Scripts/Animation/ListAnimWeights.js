#pragma strict

var guiStyle : GUIStyle;
function Start () {
	guiStyle = new GUIStyle();
}

function Update () {

}

function OnGUI(){
	for(var state : AnimationState in GetComponent.<Animation>()){
		var col : Color = Color(state.weight,0,1-state.weight);
		if(!state.enabled) col = Color.black;
		guiStyle.normal.textColor = col;
		GUILayout.Label(transform.name + " - Animation: " + state.name + " : " + state.weight + " - time: " + state.time + " - layer: " + state.layer, guiStyle);
	}
}