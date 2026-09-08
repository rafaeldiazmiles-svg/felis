#pragma strict

var skyName : String = "Sky";
var textureA : Texture;
var textureB : Texture;

function Start () {
	var skyObj : Transform = Camera.main.transform.Find(skyName);
	if(skyObj != null) {
		var skyRend : Renderer = skyObj.GetComponent.<Renderer>();
		if(textureA != null){
			skyRend.material.SetTexture("_MainTex", textureA);
		}
		if(textureB != null){
			skyRend.material.SetTexture("_BlendTex", textureB);
		}
	}
}

function Update () {

}