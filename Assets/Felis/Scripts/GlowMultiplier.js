#pragma strict

var glowObjects : GlowObject[];

var globalMultiplier : float = 1.0;

class GlowObject{
	var renderer : Renderer;
	var color : Color;
}

function Update () {
	for(var i = 0; i < glowObjects.Length; i++){
		glowObjects[i].renderer.material.SetColor("_TintColor", glowObjects[i].color * globalMultiplier); 
	}
}