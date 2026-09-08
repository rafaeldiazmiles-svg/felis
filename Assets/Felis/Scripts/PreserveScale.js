#pragma strict

var useEditorScale : boolean = true;
var defaultScale : Vector3;

function Start () {
	defaultScale = transform.localScale;
}

function LateUpdate () {
	if(useEditorScale) transform.localScale = defaultScale;
}