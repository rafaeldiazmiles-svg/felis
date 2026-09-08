#pragma strict

var defaultTexture : Texture;
var otherTexture : Texture;
@Space(30)
var rend : Renderer;
@Space(30)
var changeOnClick : boolean;



function Start () {
	if(rend == null){
		rend = GetComponent.<Renderer>();
	}
}

function Update () {
	if(changeOnClick){
		if(Input.GetMouseButtonDown(0)){
			rend.material.mainTexture = otherTexture;
		}

		if(Input.GetMouseButtonUp(0)){
			rend.material.mainTexture = defaultTexture;
		}
	}
}