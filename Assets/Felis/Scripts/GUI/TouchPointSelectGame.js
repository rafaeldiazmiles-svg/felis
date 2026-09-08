#pragma strict

var tp : TouchPoint;
var linkToRenderer : Renderer;
var controller : ControllerInput;
var gameSelect : GameSelect;
var startScreen : StartScreen;

var game : int;
var row : int;

function Start () {
    controller = GameObject.FindObjectOfType.<ControllerInput>();
    startScreen = GameObject.FindObjectOfType.<StartScreen>();
    tp = transform.parent.GetComponent.<TouchPoint>();
    gameSelect = GameObject.FindObjectOfType.<GameSelect>();
}

function Update () {
   	if(linkToRenderer != null){
   		tp.disable = !linkToRenderer.enabled;
   	}
    if(Time.time < tp.disableUntil){
        tp.disable = true;
    }
}

function GameSelect(){
	if(game ==  gameSelect.currentGame){
		if(gameSelect.currentRow == row){
			 controller.inputButtonA.pressed = true;
		}
		else{
			gameSelect.currentRow = row;
		}
	}
	else{
		//if(gameSelect.currentRow == 0){
			startScreen.tP_SetGame = game;
			gameSelect.currentRow = 0;
		//}		
	}

}