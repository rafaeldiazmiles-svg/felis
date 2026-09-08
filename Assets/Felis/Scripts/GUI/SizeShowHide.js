#pragma strict

var show : ToggleBoolean;
var size : Vector3Spring;
var defaultSize : Vector3;
var rends : Renderer[];

@Space(40)
var rendTrigger : Renderer;
@Space(20)
var requireSavedValue : boolean;
var valueString : String;
var requiredValue : int;
var addLevelString : boolean;
var currentValue : int;
var hasValue : boolean;
var resetValue : boolean;
var saveCurrentValue : boolean;
var loadCurrentValue : boolean;
var resetDefaultValue : int = 0;
@Space(40)
var debug : boolean;

function GetValueString() : String{
	var useValueString : String = "";
	if(addLevelString){
		var gVals : HoldGlobalValues = GameObject.FindObjectOfType.<HoldGlobalValues>();
		if(gVals != null){
			useValueString = "Game " + gVals.currentGame.ToString() + " - ";
		}
	}
	useValueString += valueString;

	return useValueString;
}


function Start () {
	rends = GetComponentsInChildren.<Renderer>();

	if(size.springForce == 0.0 && size.damp == 0.0){
		size.springForce = 6.0;
		size.damp = 17.0;
	}

	defaultSize = transform.localScale;

	if(requireSavedValue){
		var useValueString : String = GetValueString();

		currentValue = PlayerPrefs.GetInt(useValueString);

		hasValue = currentValue == requiredValue;
	}
}



function Update () {
	if(resetValue){
		resetValue = false;

		var useValueString : String = GetValueString();

		PlayerPrefs.SetInt(useValueString, resetDefaultValue);
		Debug.Log("Saved value: " + useValueString + "- Value is : " + resetDefaultValue);
		hasValue = resetDefaultValue == requiredValue;
	}

	if(saveCurrentValue){
		saveCurrentValue = false;

		useValueString = GetValueString();

		PlayerPrefs.SetInt(useValueString, currentValue);
		Debug.Log("Saved value: " + useValueString + "- Value is : " + currentValue);
		hasValue = currentValue == requiredValue;
	}

	if(loadCurrentValue){
		loadCurrentValue = false;

		useValueString = GetValueString();

		currentValue = PlayerPrefs.GetInt(useValueString);
		if(debug){
			Debug.Log("Load value: " + useValueString + " - Value is: " + currentValue);
		}
		hasValue = currentValue == requiredValue;
	}

	if(rendTrigger != null){
		show.current = rendTrigger.material.color.a > .9;
	}

	if(requireSavedValue && !hasValue){
		show.current = false;
	}

	show.Update();

	if(show.toggledTrue){
		size.target = defaultSize;
	}
		
	if(show.toggledFalse){
		size.target = Vector3.zero;
	}
	size.Spring();
	transform.localScale = size.current;

	if(transform.localScale.magnitude < .15){
		for(var rend : Renderer in rends){
			rend.enabled = false;
		}
	}
	else {
		for(var rend : Renderer in rends){
			rend.enabled = true;
		}
	}

}