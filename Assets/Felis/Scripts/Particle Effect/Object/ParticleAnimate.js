#pragma strict

@script RequireComponent(SpriteSheetUV)

var DestroyAfterUse : boolean = true;
var HideAfterUSe : boolean;
var particleRenderer : Renderer;
var playSpeed : float;

var playAgain : boolean;

var timeStart : float;

var spriteSheetUVScript : SpriteSheetUV;

var currentFrame : int;

var addDelay : float;

function Start(){
	Reset();
	//timeStart = Time.time;
	spriteSheetUVScript = GetComponent.<SpriteSheetUV>();
}

function Update () {
	if(playAgain){
		Reset();
		//timeStart = Time.time;
		playAgain = false;
	}
	
	currentFrame = Mathf.FloorToInt((Time.time - timeStart - addDelay) * playSpeed);
	
	spriteSheetUVScript.currentFrame = currentFrame;
	
	if(DestroyAfterUse && currentFrame > spriteSheetUVScript.frameCount){
		Destroy(gameObject);
		//gameObject.SetActive(false);
	}
	
	if(HideAfterUSe && currentFrame > spriteSheetUVScript.frameCount){
		particleRenderer.enabled = false;
	}
	
}

function Reset(){
	timeStart = Time.time;
	if(HideAfterUSe){
		particleRenderer.enabled = true;
	}
}