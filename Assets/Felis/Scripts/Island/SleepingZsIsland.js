#pragma strict

var startScreen : StartScreen;

var alpha : float;
var alphaTarget : float;

var maxAlpha : float = 0.4;

function Start () {
	startScreen = GameObject.Find("Start Screen").GetComponent(StartScreen);

}

function Update () {
	if(startScreen.currentLevel != -1){
		if(startScreen.levels[1].completed)
			alphaTarget = 0;
		else
			alphaTarget = maxAlpha;
	}
	else{
		alphaTarget = 0;
	}
	
	alpha = Mathf.Lerp(alpha, alphaTarget, Time.deltaTime * 5.0);
	GetComponent.<Renderer>().material.SetColor("_TintColor",Color(1,1,1,alpha));
}