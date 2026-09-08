#pragma strict

var fadeStart : float;
var fadeEnd : float;

var randomizeFadeEnd : boolean;
var randomizeFadeEndValue : float;

var timeStart : float;

var color : Color = Color.white;

var colorProperty : String = "_TintColor";

var destroyAfterFade : boolean = true;

var addDelay : float;

var rend : Renderer;

function Start(){
	 rend = GetComponent.<Renderer>();
	 Reset();
}

function Update () {
	if(Time.time > timeStart + fadeStart){
		var duration = fadeEnd - fadeStart;
		var transparency : float = (Time.time - timeStart - fadeStart - addDelay) / duration;
		rend.material.SetColor(colorProperty, Color(color.r,color.g,color.b,1-transparency));
	}
	
	if(destroyAfterFade && Time.time > timeStart + fadeEnd){
		Destroy(gameObject);
		//gameObject.SetActive(false);
	}
	
}

function Reset(){
	timeStart = Time.time;
	if(rend == null){
		 rend = GetComponent.<Renderer>();
	}
	
	if(rend != null){
		rend.material.SetColor(colorProperty, color);
	}
	
	if(randomizeFadeEnd){
		fadeEnd += Random.Range(-randomizeFadeEndValue*.5,randomizeFadeEndValue*.5);
	}	
}