#pragma strict

var startScreen : StartScreen;
var controller : ControllerInput;
var tp : TouchPoint;
var onLevels : int[];
var goToLevel : int;
var inputQ : InputQuestion[];

function Start () {
    startScreen = GameObject.FindObjectOfType.<StartScreen>();
    controller = GameObject.FindObjectOfType.<ControllerInput>();
    tp = transform.parent.GetComponent.<TouchPoint>();
    inputQ = GameObject.FindObjectsOfType.<InputQuestion>();
}

function Update () {
    tp.disable = true;
    for(var i = 0; i < onLevels.Length; i++){
        if(startScreen.currentLevel == onLevels[i]){
            tp.disable = false;
        }
    }
    if(startScreen.currentLevel == goToLevel){
        tp.disable = false;
    }

    for(var n = 0; n < inputQ.Length; n++){
        if(inputQ[n].showingSign.current){
            tp.disable = true;
            break;
        }
    }
    if(!startScreen.IsLevelAvailable(goToLevel)){
    	tp.disable = true;
    }

    if(Time.time < tp.disableUntil){
        tp.disable = true;
    }
}

function EnterLevel(){
    if(goToLevel == startScreen.currentLevel){
        //controller.inputButtonA.pressed = true;
        startScreen.tP_EnterLevel = true;
    }
    else{
    	if(!startScreen.question_EnterThisLevel && !startScreen.question_GoBack){
	        for(var i = 0; i < onLevels.Length; i++){
	            if(startScreen.currentLevel == onLevels[i]){
	                startScreen.currentLevel = goToLevel;
	                break;
	            }
	        }
        }
    }


}