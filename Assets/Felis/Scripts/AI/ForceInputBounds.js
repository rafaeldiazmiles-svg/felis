#pragma strict

var inputs : ControllerInput[];

var tags : String[];

var getTimer : Timer;

var bounds : BoundsArray;

var pressA : boolean;
var pressB : boolean;

@Header("B is pressed, A is unpressed")
var timerButtonA : TimerToggle;
var timerButtonB : TimerToggle;

function GetInputs(){
	var inputArray : Array = new Array();
	for(var i = 0; i < tags.Length; i++){
		var theseTags : GameObject[] = GameObject.FindGameObjectsWithTag(tags[i]);
		for(var n = 0; n < theseTags.Length; n++){
			var thisInput : ControllerInput = theseTags[n].GetComponentInChildren.<ControllerInput>();
			if(thisInput != null){
				inputArray.Push(thisInput);
			}
		}
	}

	inputs = inputArray.ToBuiltin(ControllerInput);
}

function Start () {
	if(getTimer.every == 0.0){
		getTimer.every = 3.0;
	}
}

function LateUpdate () {
	getTimer.Update();
	timerButtonA.Update();
	timerButtonB.Update();

	if(getTimer.current){
		GetInputs();
	}

	if(inputs != null){
		for(var i = 0; i < inputs.Length; i++){
			if(inputs[i] == null){
				continue;
			}
			if(bounds.ContainsWithCenter(inputs[i].transform.position, transform.position)){
				//Button A
				if(pressA){
					if(timerButtonA.A.current){
						inputs[i].inputButtonA.pressed = false;
					}
					if(timerButtonA.B.current){
						inputs[i].inputButtonA.pressed = true;
					}
				}
				//Button B
				if(pressB){
					if(timerButtonB.A.current){
						inputs[i].inputButtonB.pressed = false;
					}
					if(timerButtonB.B.current){
						inputs[i].inputButtonB.pressed = true;
					}
				}
			}
		}
	}
}

function OnDrawGizmosSelected(){
	#if UNITY_EDITOR
	Gizmos.color = Color.blue;
	bounds.DrawWireCubesWithCenter(transform.position);
	#endif
}