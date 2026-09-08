#pragma strict

var underWaterChar : UnderWater;
var getTimer : Timer;
var playerTag : String = "Player";

var lowPass : float = 650;
var blendSpeedDown : float = 3;
var blendSpeedUp : float = .2;

var currentFreq : float = 10000;
var targetFreq : float = 10000;

var lowPassFilter : AudioLowPassFilter;

function GetUnderWaterChar(){
	var charObj : GameObject = GameObject.FindGameObjectWithTag(playerTag);
	if(charObj != null){
		underWaterChar = charObj.GetComponentInChildren.<UnderWater>();
	}
}

function Start () {
 	if(getTimer.every == 0.0){
 		getTimer.every = 4.0;
 	}
 	
 	lowPassFilter = GetComponent.<AudioLowPassFilter>();
}

function Update () {
	getTimer.Update();
	if(getTimer.current){
		GetUnderWaterChar();
	}
	
	if(underWaterChar != null){
		if(underWaterChar.isUnderwater.toggledTrue){
			targetFreq = lowPass;
		}
		if(underWaterChar.isUnderwater.toggledFalse){
			targetFreq = 22000;
		}
		
	}
	
	if(currentFreq > targetFreq){
		currentFreq = Mathf.Lerp(currentFreq, targetFreq, Time.deltaTime * blendSpeedDown);
	}
	else{
		currentFreq = Mathf.Lerp(currentFreq, targetFreq, Time.deltaTime * blendSpeedUp);
	}
	
	lowPassFilter.cutoffFrequency = currentFreq;
	
}