#pragma strict

var lvlBaloon : Transform[];
var showBaloon : ToggleBoolean[];

var colorProp : String;
var alphaBlendSpeed : float = 5.0;

var startScreen : StartScreen;
var startScreenObjectName : String = "Start Screen";

var baloonLevel : int[];

function Start () {
	var childTransformComp : Transform[] = gameObject.GetComponentsInChildren.<Transform>() as Transform[];
	var lvlBaloonArray = new Array();
	for(var i = 0; i < childTransformComp.Length; i++) if(childTransformComp[i] != transform) lvlBaloonArray.Push(childTransformComp[i]);
	lvlBaloon = lvlBaloonArray.ToBuiltin(Transform) as Transform[];
	
	showBaloon = new ToggleBoolean[lvlBaloon.Length];
	for(var n = 0; n < showBaloon.Length; n++) showBaloon[n] = new ToggleBoolean();
	
	var startScreenObject : GameObject = GameObject.Find(startScreenObjectName);
	startScreen = startScreenObject.GetComponent(StartScreen);
	
	if(startScreen.currentLevel != -1)
		showBaloon[baloonLevel[startScreen.currentLevel]].current = true;
}

function Update () {
	for(var i = 0; i < lvlBaloon.Length; i++){
		showBaloon[i].Update();
		
		if(lvlBaloon[i].GetComponent.<Renderer>().material.GetColor(colorProp).a < .1) lvlBaloon[i].GetComponent.<Renderer>().enabled = false;
		
		var currentColor : Color = lvlBaloon[i].GetComponent.<Renderer>().material.GetColor(colorProp);
		if(showBaloon[i].current){
			lvlBaloon[i].GetComponent.<Renderer>().material.SetColor(colorProp, Color.Lerp(currentColor, Color.white, Time.deltaTime * alphaBlendSpeed)); 
		}
		else{
			lvlBaloon[i].GetComponent.<Renderer>().material.SetColor(colorProp, Color.Lerp(currentColor, Color(1,1,1,0), Time.deltaTime * alphaBlendSpeed)); 
		}
		
		if(showBaloon[i].toggledTrue){
			ShowBaloon(i);
		}
	}
	
	if(startScreen.changedLevel){
		if(startScreen.currentLevel == -1){
			ShowBaloon(0);
		}
		else{
			showBaloon[baloonLevel[startScreen.currentLevel]].current = true;
		}
	}
	
	if(startScreen.PopupQuestionToggledTrue() && (startScreen.question_EnterThisLevel || startScreen.question_GoBack) ){
		ShowBaloon(0);
	}
	
	if(!startScreen.enteringLevel){
		if(startScreen.PopupQuestionToggledFalse() && (startScreen.question_EnterThisLevel || startScreen.question_GoBack) ){
			if(startScreen.currentLevel != -1){
				showBaloon[baloonLevel[startScreen.currentLevel]].current = true;
			}
		}
	}

	if(startScreen.changedLevel && startScreen.currentLevel == -1){
		HideAll();
	}
}


function ShowBaloon(ID : int){
	lvlBaloon[ID].GetComponent.<Renderer>().enabled = true;
	
	var currentColor : Color = lvlBaloon[ID].GetComponent.<Renderer>().material.GetColor(colorProp);
	if(currentColor.a < .1)
		lvlBaloon[ID].GetComponent.<Renderer>().material.SetColor(colorProp, Color(1,1,1,.1));
	
	//Hide all other baloons. Only one Baloon Visible.
	for(var i = 0; i < showBaloon.Length; i++){
		if(i != ID) showBaloon[i].current = false;
	}
}

function HideAll(){
	for(var i = 0; i < showBaloon.Length; i++){
		showBaloon[i].current = false;
	}
}