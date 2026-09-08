#pragma strict

var startFaded : boolean;

var forceShow : boolean;
var forceHide : boolean;
var shown : boolean;
var forceShowTriggerTime : float;

var playerTag = "Player";
var controllerInputScript : ControllerInput;

var fadeOutObjects : Renderer[];
var fadeOutObjectCount : int;
var defaultColors : Color[];

var showTime : float = 4.0;
var fadeOutTime : float = 3.0;

var fadeAmount : FloatSmoothDamp;
static var fadeTime : float = .2;
var curveController : float = .3;
var curveGlow : float = 3.0;

var showUntil : float;


function Start () {
	try{
	if(controllerInputScript == null){
		GetPlayerController(); // controllerInputScript = GameObject.FindGameObjectWithTag(playerTag).GetComponentInChildren(ControllerInput);
	}
	}
	catch(err){
		Debug.Log(transform.name);
	}
	//glowMultiplierScript = GetComponent.<GlowMultiplier>();
	
	fadeOutObjectCount = fadeOutObjects.Length;
	defaultColors = new Color[fadeOutObjectCount];
	for(var i = 0; i < fadeOutObjectCount; i++)	defaultColors[i] = fadeOutObjects[i].material.color;
	
	fadeAmount = new FloatSmoothDamp();
	fadeAmount.time = fadeTime;
	
	if(controllerInputScript != null && startFaded){
		fadeAmount.current = 1.0;
		fadeAmount.target = 1.0;
		controllerInputScript.lastControllerTouchTime = -showTime - fadeOutTime;
	}
}

function GetPlayerController(){
	var playerObj : GameObject = GameObject.FindGameObjectWithTag(playerTag);
	if(playerObj != null) controllerInputScript = playerObj.GetComponentInChildren(ControllerInput);
}

function LateUpdate () {
	if(controllerInputScript == null){
		GetPlayerController(); // controllerInputScript = GameObject.FindGameObjectWithTag(playerTag).GetComponentInChildren(ControllerInput);
	}

	//Set fade amount.
	if(controllerInputScript != null){
		fadeAmount.target = Mathf.Clamp01( ( (Time.time - controllerInputScript.lastControllerTouchTime) - showTime) / fadeOutTime );
	}	
	//Dont fade until.
	if(Time.time < showUntil){
		fadeAmount.target = 0.0;
	}
	
	if(controllerInputScript != null && forceShow && !shown && Time.time > forceShowTriggerTime){
		shown = true;
		controllerInputScript.lastControllerTouchTime = Time.time;
	}


	fadeAmount.SmoothDamp();
		
	//Apply fade.
	ApplyFade();
	

}

function ApplyFade(){
	for(var i = 0; i < fadeOutObjectCount; i++){
		if(!forceHide){
			fadeOutObjects[i].material.color = defaultColors[i] * Mathf.Pow(1 - fadeAmount.current,curveController);
		}
		else{
			fadeOutObjects[i].material.color.a = 0.0;
		}

	}
}