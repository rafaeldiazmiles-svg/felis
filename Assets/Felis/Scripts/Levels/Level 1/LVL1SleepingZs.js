#pragma strict

var wakeUp : ProsperoWakeUp;

var alpha : float;
var targetAlpha : float;
var maxAlpha : float = .5;

var speed : float = 5.0;

function Start () {
	alpha = maxAlpha;
}

function GetWakeUp(){
	wakeUp = GameObject.FindObjectOfType.<ProsperoWakeUp>();
}

function Update () {
	if(wakeUp == null){
		GetWakeUp();
	}
	else{
		if(wakeUp.wokenUp){
			targetAlpha = 0.0;
		}
		else{
			targetAlpha = maxAlpha;
		}
		alpha = Mathf.Lerp(alpha, targetAlpha, Time.deltaTime * speed);
		
		GetComponent.<Renderer>().material.SetColor("_TintColor", Color(1,1,1,alpha));
		
		if(alpha < .1){
			Destroy(gameObject);
		}
	}
}