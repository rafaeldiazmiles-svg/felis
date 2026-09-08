#pragma strict
var alpha : VColorGroupAlpha;

var northID : int;
var eastID : int;
var southID : int;
var westID : int;

var north : boolean;
var east : boolean;
var south : boolean;
var west : boolean;

var show : ToggleBoolean;

var size : Vector3Spring;
var defaultSize : Vector3;

var rend : Renderer;

var startScreen : StartScreen;

var lvlBaloons : Transform[];
var offsetPos : Vector3;

var hideDuration : float = 1.0;
var hideUntil : float;

//var changeCompass : boolean;

var compassSet : CompassSet[];

class CompassSet{
	var onLevel : int;

	var northLevel : int;
	var eastLevel : int;
	var southLevel : int;
	var westLevel : int;
}

function Start () {
	alpha = GetComponent.<VColorGroupAlpha>();
	rend = GetComponent.<Renderer>();

	if(size.springForce == 0.0 && size.damp == 0.0){
		size.springForce = 3.0;
		size.damp = 10.0;
	}

	defaultSize = transform.localScale;

	startScreen = GameObject.FindObjectOfType.<StartScreen>();

	GetLVLBaloons();

	hideUntil = Time.time + hideDuration;
}


function GetLVLBaloons(){
	var lvlBaloonsArray : Array = new Array();
	var lvlBaloonsObj : Transform = GameObject.FindObjectOfType.<BaloonLVLs>().transform;
	for(var i = 0; i <  lvlBaloonsObj.childCount; i ++){
		lvlBaloonsArray.Push(lvlBaloonsObj.GetChild(i));
	}
	lvlBaloons = lvlBaloonsArray.ToBuiltin(Transform);	
}

function Update () {
	if(startScreen.changedLevel){
		hideUntil = Time.time + hideDuration;
		//changeCompass = false;
	}
	if(Time.time < hideUntil){
		show.current = false;
	}
	else{
		show.current = true;
	}

	if(startScreen.currentLevel <= 0){
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

	if(transform.localScale.magnitude < .1){
		rend.enabled = false;
		SetCompass();
	}
	else {
		rend.enabled = true;
	}

	if(north){
		alpha.setAlphaGroups[northID].alpha = 1.0;
	}
	else{
		alpha.setAlphaGroups[northID].alpha = 0.0;
	}

	if(east){
		alpha.setAlphaGroups[eastID].alpha = 1.0;
	}
	else{
		alpha.setAlphaGroups[eastID].alpha = 0.0;
	}

	if(south){
		alpha.setAlphaGroups[southID].alpha = 1.0;
	}
	else{
		alpha.setAlphaGroups[southID].alpha = 0.0;
	}

	if(west){
		alpha.setAlphaGroups[westID].alpha = 1.0;
	}
	else{
		alpha.setAlphaGroups[westID].alpha = 0.0;
	}
}

function SetCompass(){
	if(startScreen.currentLevel > 0){
		//if(!changeCompass){
			transform.position = lvlBaloons[startScreen.currentLevel - 1].position + offsetPos;
			for(var i = 0; i < compassSet.Length; i++){
				if(startScreen.currentLevel == compassSet[i].onLevel){
					north = false;
					if(compassSet[i].northLevel > 0){
						if(startScreen.IsLevelAvailable(compassSet[i].northLevel)){
							north = true;
						}

					}

					east = false;
					if(compassSet[i].eastLevel > 0){
						if(startScreen.IsLevelAvailable(compassSet[i].eastLevel)){
							east = true;
						}
					}

					south = false;
					if(compassSet[i].southLevel > 0){
						if(startScreen.IsLevelAvailable(compassSet[i].southLevel)){
							south = true;
						}
					}

					west = false;
					if(compassSet[i].westLevel > 0){
						if(startScreen.IsLevelAvailable(compassSet[i].westLevel)){
							west = true;
						}
					}
					break;
				}
			}
			//changeCompass = true; 
		//}
	}
}