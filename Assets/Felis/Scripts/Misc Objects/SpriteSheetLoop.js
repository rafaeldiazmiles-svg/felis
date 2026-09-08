#pragma strict

@script RequireComponent(SpriteSheetUV)

var playing : boolean = true;
var playSpeed : float;

var timeStart : float;

var spriteSheetUVScript : SpriteSheetUV;

var currentFrame : float;

var frameCount : int;
@Space(30)

var togglePlay : boolean;
var toggleTimer : TimerToggle;

var useStopFrame : boolean;;
var stopFrame : int;
@Space(30)
var playing_Audio : AudioSource;
@Space(30)
var playing_RBForceBounds : RigidbodyForceBound[];

function Start(){
	timeStart = Time.time;
	spriteSheetUVScript = GetComponent.<SpriteSheetUV>();

}

function Update () {
	if(togglePlay){
		toggleTimer.Update();
		if(toggleTimer.A.toggledTrue){
			playing = true;
			if(playing_Audio != null){
				playing_Audio.Play();
			}
		}
		if(toggleTimer.B.toggledTrue){
			playing = false;
			if(useStopFrame){
				currentFrame = stopFrame;
			}
			if(playing_Audio != null){
				playing_Audio.Stop();
			}
		}
	}

	if(playing){
		currentFrame += Time.deltaTime * playSpeed;
		currentFrame = currentFrame % frameCount;
	}

	spriteSheetUVScript.currentFrame = Mathf.FloorToInt(currentFrame);

	if(playing_RBForceBounds != null){
		for(var i = 0; i < playing_RBForceBounds.Length; i++){
			playing_RBForceBounds[i].forceEnabled = playing;
		}
	}
}