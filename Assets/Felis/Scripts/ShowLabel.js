#pragma strict

public var label : String;
public var guiStyle : GUIStyle;

function Start () {

}

function Update () {

}

function OnDrawGizmos(){
	#if UNITY_EDITOR
	//var guiStyle : GUIStyle = new GUIStyle();
	//guiStyle.normal.textColor = color;
	Handles.Label(transform.position, label, guiStyle);
	#endif
}