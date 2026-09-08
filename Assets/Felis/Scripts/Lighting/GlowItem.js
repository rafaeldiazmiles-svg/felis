#pragma strict

var color : Color = Color(0.05,0.07,0.1,0.7);
var size : float = 5.0;

var startColor : Color;

var boundToRenderer : boolean = true;
var matchRGB : boolean = true;
var matchAlpha : boolean;
var lerpRendColor : boolean = true;
var matchAlphaMultiply : float = 1.0;
var boundRenderer : Renderer;
var propertyName : String = "_Color";

var createdInRuntime : boolean = true;

var glowControllerTag : String = "Glow Controller";

var manualFade : boolean;

function Start () {
	tag = "Glow Item";
	
	if(propertyName == ""){
		propertyName = "_Color";
	}
	
	startColor = color;
	
	if(createdInRuntime){
		SetGlowItems();
	}
	
	
	boundRenderer = FindUtility.ReverseFindRenderer(transform);
}

function GlowSetStartColor(newColor : Color){
	color = newColor;
	startColor = newColor;
}

function GlowSetGlowSize(newSize : float){
	size = newSize;
}

function SetGlowItems(){
	var glowObj : GameObject = GameObject.FindGameObjectWithTag(glowControllerTag);
	if(glowObj != null){
		var glow : Glow = glowObj.GetComponent.<Glow>();
		if(glow != null){
			glow.SetGlowItems();
		}
	}	
}