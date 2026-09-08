#pragma strict

var rends : Renderer[];
var startScreen : StartScreen;

var topLeftOffset : Vector3;
var bottomRightOffset : Vector3;
var topLeftBaloonLocalOffset : Vector3;
var bottomRightBaloonLocalOffset : Vector3;

var baloon : Transform;
var catHead : Transform;

static var topLeft : int = 0;
static var bottomRight : int = 1;

var lvlBaloons : Transform[];
var offsetPos : int[];

var hideDuration : float = 1.0;
var hideUntil : float;

var size : Vector3Spring;
var baloonSize : Vector3Spring; 
var catHeadSize : Vector3Spring;
var defSizeBaloon : Vector3;
var defSizeCatHead : Vector3;

var show : ToggleBoolean;

var changeCatPos : boolean;

var playAnim : boolean;

var playAnimTimer : Timer;
var catAnimComp : Animation;
var catFrameAnims : UVGroupAnim[];

var minimumCatsPerLevel : int[];
var catsNeeded : int;
var saveLoad : SaveLoad;
var catsNeededNumber : UVFrameText;

var baloonAlphaS : VColorGroupAlpha; // To hide S

var meowSounds : AudioSource[];

function Start () {
	meowSounds = GetComponentsInChildren.<AudioSource>();

	baloonAlphaS = GetComponentInChildren.<VColorGroupAlpha>();

	catsNeededNumber = GetComponentInChildren.<UVFrameText>();

	saveLoad = GameObject.FindObjectOfType.<SaveLoad>();

	if(playAnimTimer.every == 0.0){
		playAnimTimer.every = 2.0;
	}

	defSizeCatHead = catHead.localScale;
	defSizeBaloon = baloon.localScale;

	if(size.springForce == 0.0 && size.damp == 0.0){
		size.springForce = 6.0;
		size.damp = 15.0;
	}
	if(baloonSize.springForce == 0.0 && baloonSize.damp == 0.0){
		baloonSize.springForce = 3.0;
		baloonSize.damp = 10;
	}
	if(catHeadSize.springForce == 0.0 && catHeadSize.damp == 0.0){
		catHeadSize.springForce = 2;
		catHeadSize.damp = 8;
	}

	rends = GetComponentsInChildren.<Renderer>();
	startScreen = GameObject.FindObjectOfType.<StartScreen>();

	GetLVLBaloons();

	catAnimComp = GetComponentInChildren.<Animation>();
	catFrameAnims = GetComponentsInChildren.<UVGroupAnim>();
}

function LateUpdate () {
	playAnimTimer.Update();

	if(playAnimTimer.current){
		catAnimComp.Play();
		for(var catFrameAnim : UVGroupAnim in catFrameAnims){
			catFrameAnim.playing.current = true;
		}
	}

	if(startScreen.changedLevel){
		hideUntil = Time.time + hideDuration;
		changeCatPos = false;
		catsNeeded = minimumCatsPerLevel[GetLevelID()] - saveLoad.GetCatsSaved();
		if(catsNeeded == 1){
			baloonAlphaS.setAlphaGroups[0].alpha = 0.0;
		}
		else{
			baloonAlphaS.setAlphaGroups[0].alpha = 1.0;
		}
	}
	if(Time.time < hideUntil){
		show.current = false;
	}
	else{
		show.current = true;
	}

	if(startScreen.currentLevel <= 0 || catsNeeded <= 0){
		show.current = false;
	}

	show.Update();

	if(show.toggledTrue){
		size.target = Vector3.one;
		baloonSize.target = defSizeBaloon;
		catHeadSize.target = defSizeCatHead;
	}
		
	if(show.toggledFalse){
		size.target = Vector3.zero;
		baloonSize.target = Vector3.zero;
		catHeadSize.target = Vector3.zero;
	}
	size.Spring();
	baloonSize.Spring();
	catHeadSize.Spring();

	transform.localScale = size.current;
	catHead.localScale = catHeadSize.current;
	baloon.localScale = baloonSize.current;

	if(transform.localScale.magnitude < .1){
		for(var rend : Renderer in rends){
			rend.enabled = false;
		}

		if(startScreen.currentLevel > 0){
			if(!changeCatPos){
				catsNeededNumber.displayText = catsNeeded.ToString();
				catsNeededNumber.updateText = true;

				var levelID : int = GetLevelID();
				transform.position = lvlBaloons[levelID].position;
				switch(offsetPos[levelID]){
					case topLeft:
						transform.position += topLeftOffset;
						if(baloon != null){
							baloon.localPosition = topLeftBaloonLocalOffset;
						}
					break;

					case bottomRight:
						transform.position += bottomRightOffset;
						if(baloon != null){
							baloon.localPosition = bottomRightBaloonLocalOffset;
						}

					break;
				}
				changeCatPos = true;

				playAnim = true;
			}
		}
	}
	else {
		for(var rend : Renderer in rends){
			rend.enabled = true;
		}
	}
}

function GetLVLBaloons(){
	var lvlBaloonsArray : Array = new Array();
	var lvlBaloonsObj : Transform = GameObject.FindObjectOfType.<BaloonLVLs>().transform;
	for(var i = 0; i <  lvlBaloonsObj.childCount; i ++){
		lvlBaloonsArray.Push(lvlBaloonsObj.GetChild(i));
	}
	lvlBaloons = lvlBaloonsArray.ToBuiltin(Transform);

	//offsetPos = new int[lvlBaloons.Length];

}

function GetLevelID() : int{
	return Mathf.Max(0,startScreen.currentLevel - 1);
}

function MoreCatsNeeded(){
	meowSounds[Random.value * meowSounds.Length].Play();
	size.current = Vector3.one * .5;
}