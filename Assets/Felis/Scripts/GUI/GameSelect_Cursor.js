#pragma strict

var currentGame : int;
var currentRow : int;

var show : boolean;

var positionControl : Vector3Lerp;
var scaleControl : Vector3Lerp;

var gameRowScale_Mul : float = 1.0;
var binRowScale_Mul : float = 1.0;

var gameA_x : float = 1.1;
var gameB_x : float = 0.0;
var gameC_x : float = -1.03;

var gameABone : Transform;
var gameBBone : Transform;
var gameCBone : Transform;
var gameA_CurrentDist : float;
var gameB_CurrentDist : float;
var gameC_CurrentDist : float;
var gameRow_CurrentDist : float;
var trashBinRow_CurrentDist : float;
var onMaxDistance : float = 0.015;
var onGameA : ToggleBoolean;
var onGameB : ToggleBoolean;
var onGameC : ToggleBoolean;
var onGameRow : ToggleBoolean;
var onTrashBinRow : ToggleBoolean;

var gameRow_Y : float  = 0.557;
var trashBinRow_Y : float = 0.108;

var propName : String = "_Color";
var gameRowColor : Color;	
var trashBinRowColor : Color;
var currentColor : Color;
var targetColor : Color;
var colorBlendSpeed : float = 15.0;

var offsetFrames : OffsetFrames;

var cursorSound : AudioSource;
var cursorSoundPitch : FloatMoveTowards;
var lowPitch : float = .7;
var highPitch : float = 1.0;
var cursorSoundPan : FloatMoveTowards;
var maxPan : float = .7;

function Start () {
	positionControl.current = transform.localPosition;
	positionControl.target = transform.localPosition;
	
	scaleControl.current = Vector3.one;
	scaleControl.target = Vector3.one;
	
	//currentColor = gameRowColor;
	
	offsetFrames = GetComponent(OffsetFrames);
}

function Update () {
	gameA_CurrentDist = Mathf.Abs(transform.position.x - gameABone.position.x);
	gameB_CurrentDist = Mathf.Abs(transform.position.x - gameBBone.position.x);
	gameC_CurrentDist = Mathf.Abs(transform.position.x - gameCBone.position.x);
	
	gameRow_CurrentDist = Mathf.Abs(transform.localPosition.z - gameRow_Y);
	trashBinRow_CurrentDist = Mathf.Abs(transform.localPosition.z - trashBinRow_Y);
	
	onGameA.current = (gameA_CurrentDist < onMaxDistance);
	onGameB.current = (gameB_CurrentDist < onMaxDistance);
	onGameC.current = (gameC_CurrentDist < onMaxDistance);
	
	onGameRow.current = (gameRow_CurrentDist < onMaxDistance);
	onTrashBinRow.current = (trashBinRow_CurrentDist < onMaxDistance);
	
	onGameA.Update();
	onGameB.Update();
	onGameC.Update();
	onGameRow.Update();
	onTrashBinRow.Update();
	

	
	cursorSoundPitch.MoveTowards();
	cursorSound.pitch = cursorSoundPitch.current;
	cursorSoundPan.MoveTowards();
	cursorSound.panStereo = cursorSoundPan.current;
	
	if(!onTrashBinRow.current){
		if(onGameA.toggledTrue || onGameB.toggledTrue ||onGameC.toggledTrue){
			offsetFrames.SetFrame("Cursor");
		}
		if(onGameA.toggledFalse || onGameB.toggledFalse ||onGameC.toggledFalse){
			cursorSound.Play();
			//offsetFrames.SetFrame("HBlur");
		}
	}
	
	if(onGameRow.toggledTrue){
		offsetFrames.SetFrame("Cursor");
	}
	
	if(onTrashBinRow.current){
		offsetFrames.SetFrame("TrashBin");
		scaleControl.target = Vector3.one * binRowScale_Mul;	
	}
	if(onGameRow.toggledFalse){
		cursorSound.Play();
		cursorSoundPitch.target = lowPitch;
	}
	if(onTrashBinRow.toggledFalse){
		cursorSound.Play();
		cursorSoundPitch.target = highPitch;
	}

	if(onGameRow.current){
		if(onGameA.current){
			scaleControl.target = gameABone.localScale * gameRowScale_Mul;
		}
		if(onGameB.current){
			scaleControl.target = gameBBone.localScale * gameRowScale_Mul;
		}
		if(onGameC.current){
			scaleControl.target = gameCBone.localScale * gameRowScale_Mul;
		}
	}

	scaleControl.Lerp();
	transform.localScale = scaleControl.current;



	if(currentGame == 0){
		positionControl.target.x = gameA_x;
		cursorSoundPan.target = -maxPan; 
	}
	if(currentGame == 1){
		positionControl.target.x = gameB_x;
		cursorSoundPan.target = 0;
	}
	if(currentGame == 2){
		positionControl.target.x = gameC_x;
		cursorSoundPan.target = maxPan;
	}
	
	if(show){
		if(currentRow == 0){
			positionControl.target.z = gameRow_Y;
			targetColor = gameRowColor;
		}
		if(currentRow == 1){
			positionControl.target.z = trashBinRow_Y;
			targetColor =trashBinRowColor;
		}
	}
	else{
		targetColor.a = 0.0;
	}

	positionControl.Lerp();

	currentColor = Color.Lerp(currentColor, targetColor, Time.deltaTime * colorBlendSpeed);
	GetComponent.<Renderer>().material.SetColor("_Color", currentColor);	
		
	transform.localPosition = positionControl.current;
	
	if(currentColor.a  < .1)GetComponent.<Renderer>().enabled = false;
	else GetComponent.<Renderer>().enabled = true;
}