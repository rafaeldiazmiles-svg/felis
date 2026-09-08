#pragma strict

var player : GameObject;

var playerTag : String = "Player";

var sleepAnimation : PlayLoopAnimation;
var wakeUpAnimation : PlayStillAnimation;

var controller : ControllerInput;

var wakeUpTime : float;

var lookLeftTime : float;

var requireLeftTurn : boolean;

var wokenUp : boolean;

var sideMovement : SideMovement;

var dontFadeController : boolean = true;
var controllerFadeOut : FadeOut;
var controllerName : String = "Controller";

var applySweatDrops : boolean;
var sweat : SweatDropsParticles;
var sweatDuration : float;

var frameGroups : UVFrameGroups;

var blink : FaceAnim;

var lookUp : LookUp;

var enterLevel : ProsperoEnterLevel;

var soundName : String = "Voice C";
var sound : AudioSource;

var playedSleepAnims : boolean;

var instantWakeUp : boolean;

function InstantWakeUp(){
	requireLeftTurn = false;
	wokenUp = true;
	lookUp.enabled = true;

	frameGroups.SetFrame("Eyes", "Open");
	frameGroups.SetFrame("Mouth", "Closed");

	sleepAnimation.InstantCutAnim();
}

function GetPlayer(){
	player = GameObject.FindGameObjectWithTag(playerTag);
	if(player != null){
		transform.position = player.transform.position;
		transform.parent = player.transform;
		sideMovement = player.GetComponentInChildren.<SideMovement>();
		controller = player.GetComponentInChildren.<ControllerInput>();
		blink = player.GetComponentInChildren.<FaceAnim>();
		blink.enabled = false;
		sweat = player.GetComponentInChildren.<SweatDropsParticles>();
		frameGroups = player.GetComponentInChildren.<UVFrameGroups>();
		lookUp = player.GetComponentInChildren.<LookUp>();
		if(lookUp != null) lookUp.enabled = false;
		
		enterLevel =  player.GetComponentInChildren.<ProsperoEnterLevel>();
		if(enterLevel != null){
			enterLevel.cancel = true;
		}
		
		var audio : AudioSource[] = player.GetComponentsInChildren.<AudioSource>();
		for(var i = 0; i < audio.Length; i++){
			if(audio[i].name == soundName){
				sound = audio[i];
			}
		}
	}
}

function Start () {
	GetFadeOutController();
	controllerFadeOut = GameObject.FindObjectOfType.<FadeOut>();
}

function GetFadeOutController(){
	var allFadeOut : FadeOut[] = FindObjectsOfType.<FadeOut>() as FadeOut[];
	for(var i = 0; i < allFadeOut.Length; i++){
		if(allFadeOut[i].gameObject.name == controllerName){
			controllerFadeOut = allFadeOut[i];
			break;
		}
	}
}

function Update () {
	if(player == null){
		GetPlayer();
	}

	if(instantWakeUp){
		InstantWakeUp();
		instantWakeUp = false;
	}

	if(player != null){
		if(!playedSleepAnims){
			sleepAnimation.animationPlay.current = true;
			playedSleepAnims = true;
		}
		
		if(dontFadeController && controllerFadeOut == null) GetFadeOutController();
		
		if(!wokenUp){
			if(controllerFadeOut != null && dontFadeController){
				controllerFadeOut.showUntil = Time.time + 1.0;
			}
		
			if(controller.inputButtonA.down || controller.inputButtonB.down){
				//sleepingZs.beginDestroy = true;
				sleepAnimation.animationPlay.current = false;
				wakeUpTime = Time.time;
				requireLeftTurn = true;
				
				sweat.forceSweatDropUntil = Time.time + sweatDuration;
				
				sound.Play();
			}
			
			if(requireLeftTurn && Time.time > wakeUpTime){
				if(sideMovement.currentSide > 0){
					controller.inputAxis.current.x = -1.0;
					
				}
				else{
					requireLeftTurn = false;
					wokenUp = true;
					lookUp.enabled = true;
				}
			}

		}

		if(frameGroups != null){
			if(sleepAnimation.animationPlay.current) frameGroups.SetFrame("Eyes", "Sleep");
			if(wakeUpAnimation.animationPlay.current){
				frameGroups.SetFrame("Eyes", "Worried");
				frameGroups.SetFrame("Mouth", "Worried");
			}
			if(wakeUpAnimation.animationPlay.toggledFalse){
				frameGroups.SetFrame("Mouth","Closed");
				blink.enabled = true;
			}
		}
	}
}