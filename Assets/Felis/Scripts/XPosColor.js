#pragma strict

var autoGetAllRenderers : boolean = true;
var allChildMaterials : Renderer[];

var usePlayer : boolean = true;
var playerTag : String = "Player";

var movingPoint : Transform;

var alphaCurve : AnimationCurve;

var lerpColorA : Color;
var lerpColorB : Color;

var ignoreAlpha : boolean = true;

function Start () {
	if(autoGetAllRenderers){
		allChildMaterials = gameObject.GetComponentsInChildren.<Renderer>() as Renderer[];
	}
	 GetPlayer();
}

function GetPlayer(){
	var playerObj : GameObject = GameObject.FindGameObjectWithTag(playerTag);
	if(playerObj != null){
		movingPoint = playerObj.transform;
	}
}

function Update () {
	if(usePlayer && movingPoint == null){
		GetPlayer();
	}
	
	if(movingPoint != null){
		for(var i = 0; i < allChildMaterials.Length; i++){
			//allChildMaterials[i].material.color.a = alphaCurve.Evaluate(movingPoint.position.x);
			var newColor : Color = Color.Lerp(lerpColorA, lerpColorB, alphaCurve.Evaluate(movingPoint.position.x));
			if(ignoreAlpha){
				allChildMaterials[i].material.color.r = newColor.r;
				allChildMaterials[i].material.color.g = newColor.g;
				allChildMaterials[i].material.color.b = newColor.b;
			}
			else{
				allChildMaterials[i].material.color = newColor;
			}
		}
	}
}