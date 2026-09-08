#pragma strict

var mipMapBias : float;

function Start () {
	GetComponent.<Renderer>().material.mainTexture = Instantiate(GetComponent.<Renderer>().material.mainTexture);
}

function Update () {
	GetComponent.<Renderer>().material.mainTexture.mipMapBias = mipMapBias;
}