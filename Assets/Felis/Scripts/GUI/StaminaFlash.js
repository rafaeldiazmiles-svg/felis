#pragma strict

var charStamina : Stamina;
var flashDuration : float = 1.0;
var colorAnim : ColorAnimation;
var colorProp : String = "_Color";
var playerTag : String = "Player";

var rendererComp : Renderer;

function Start () {
	colorAnim = GetComponent(ColorAnimation);
	GetPlayerStamina(); //charStamina = GameObject.FindGameObjectWithTag(playerTag).GetComponentInChildren(Stamina);
	rendererComp = GetComponent.<Renderer>();
}

function GetPlayerStamina(){
	var playerObj : GameObject = GameObject.FindGameObjectWithTag(playerTag);
	if(playerObj != null) charStamina = playerObj.GetComponentInChildren(Stamina);	
	
}

function Update () {
	if(charStamina == null) GetPlayerStamina();
	
	if(charStamina != null){
		if(Time.time < charStamina.noStamina.toggledTrueTime + flashDuration){
			colorAnim.enabled = true;
		}
		else{
			colorAnim.enabled = false;
			rendererComp.material.SetColor(colorProp, Color.white);
		}
	}
	else{
		colorAnim.enabled = false;
	}
	
}