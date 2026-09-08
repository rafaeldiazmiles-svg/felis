#pragma strict


var beginDestroy : boolean;

var totalTime : float;
var timeLeft : float;

var useRenderer : Renderer;
var propertyName : String;

var useCurve : boolean;
var alphaCurve : AnimationCurve;

function Start () {
	timeLeft = totalTime;
}

function Update () {
	if(beginDestroy){
		timeLeft -= Time.deltaTime;

		var alpha : float;
		if(!useCurve){
			alpha = timeLeft / totalTime;
		}
		else{
			alpha = alphaCurve.Evaluate( (totalTime - timeLeft) / totalTime);
		}
		useRenderer.material.SetColor(propertyName, Color(1,1,1,timeLeft / totalTime));
	}
	if(timeLeft < 0){
		Destroy(gameObject);
		//gameObject.SetActive(false);
	}
}