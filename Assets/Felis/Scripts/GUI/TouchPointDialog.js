#pragma strict

var tp : TouchPoint;
var question : InputQuestion;
var linkToRenderer : Renderer;
var controller : ControllerInput;

function Start () {
    GetController();//controller = GameObject.FindObjectOfType.<ControllerInput>();
    tp = transform.parent.GetComponent.<TouchPoint>();
}

function Update(){
	if(controller == null){
		GetController();
	}


    if(question != null){
    	tp.disable = !question.showingSign.current;
   	}
   	if(linkToRenderer != null){
   		tp.disable = !linkToRenderer.enabled;
   	}
    if(Time.time < tp.disableUntil){
        tp.disable = true;
    }
}

function PressA(){
	if(controller != null){
	    controller.inputButtonA.pressed = true;
	}
}

function PressB(){
	if(controller != null){
   		controller.inputButtonB.pressed = true;
    }
}

function GetController(){
	var allControllers : ControllerInput[] = GameObject.FindObjectsOfType.<ControllerInput>();
	for(var i = 0; i < allControllers.Length; i++){
		if(allControllers[i].controllerType == ControllerType.User){
			controller = allControllers[i];
			break;
		}
	}
}