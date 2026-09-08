#pragma strict
var textureAray : Texture[];

function Start () {
	Reset();
	//GetComponent.<Renderer>().material.mainTexture = textureAray[Mathf.FloorToInt(Random.value * textureAray.Length)];
}

function Reset(){
	GetComponent.<Renderer>().material.mainTexture = textureAray[Mathf.FloorToInt(Random.value * textureAray.Length)];
}