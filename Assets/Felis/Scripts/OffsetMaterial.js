#pragma strict

var offset : Vector2;
var propertyName : String;

function Start () {

}

function Update () {
	GetComponent.<Renderer>().material.SetTextureOffset(propertyName, offset);
}