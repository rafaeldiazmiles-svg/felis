#pragma strict

var sortMode : UnityEngine.TransparencySortMode;

function Start () {
	GetComponent(Camera).transparencySortMode = sortMode;
}

function Update () {

}