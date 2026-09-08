#pragma strict

var gridSize : Vector2;
var currentFrame : int;

var frameCount : int;

var rend : Renderer;

var setQuadScale : boolean = true;

function Start () {
	frameCount = Mathf.Floor(gridSize.x * gridSize.y);
	currentFrame = Mathf.Clamp(currentFrame, 0, frameCount-1);
	rend = GetComponent.<Renderer>();
	rend.material.mainTextureOffset.x = (currentFrame % gridSize.x) / gridSize.x;
	rend.material.mainTextureOffset.y =  (Mathf.Floor((frameCount - 1 - currentFrame) / gridSize.y) / gridSize.y);
}

function Update () {
	if(setQuadScale){
		var textureScale : Vector2 = Vector2(1.0/gridSize.x, 1.0/gridSize.y);
		rend.material.mainTextureScale = textureScale;
	}

	frameCount = Mathf.Floor(gridSize.x * gridSize.y);
	
	currentFrame = Mathf.Clamp(currentFrame, 0, frameCount-1);
	rend.material.mainTextureOffset.x = (currentFrame % gridSize.x) / gridSize.x;
	rend.material.mainTextureOffset.y =  (Mathf.Floor((frameCount - 1 - currentFrame) / gridSize.y) / gridSize.y);
}

/*function Reset(){
	
}*/