#pragma strict

var changeColEnabled : boolean;
var col : Collider;
var col_Enabled : boolean;
@Space(30)
var changeRendEnabled : boolean;
var rend : Renderer;
var rend_Enabled : boolean;
@Space(30)
var changeRendShader : boolean;
var rend_SetShader : Renderer;
var otherShader : Shader;

function Start () {
	if(changeColEnabled && col != null){
		col.enabled = col_Enabled;
	}

	if(changeRendEnabled && rend != null){
		rend.enabled = rend_Enabled;
	}

	if(changeRendShader && rend_SetShader != null && otherShader != null){
		rend_SetShader.material.shader = otherShader;
	}
}

function Update () {

}

function EnableCol(){
	col.enabled = true;
	col.isTrigger = false;

	if(rend != null){
		rend.enabled = false;
	}

	if(otherShader != null && rend_SetShader != null){
		rend_SetShader.material.shader = otherShader;
	}
}