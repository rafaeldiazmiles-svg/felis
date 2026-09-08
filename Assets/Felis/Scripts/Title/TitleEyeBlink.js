#pragma strict

var autoGetComponents : boolean = true;
var frameGroup : UVFrameGroups;

var blink : ToggleBoolean;
var blinkAudio : AudioSource;

var currentFrame : float;
var blinkDuration : float;
var frameCount : int = 4;

var frameGroupID : int = 0;

var eyeBone : Transform;
var squashCuve : AnimationCurve;
var squashDurationFactor : float = 1.0;
var squashFactor : float = 1.0;
var additiveSquash : boolean = true;

var blinkEvery : float = 2.0;
var blinkEveryRandomize : float = 1.8;
var nextBlinkTime : float;

var eyeRenderer : Renderer;

function Start () {
	if(autoGetComponents){
		frameGroup = GetComponent(UVFrameGroups);
	}
	
	eyeRenderer = GetComponent.<Renderer>();
}

function LateUpdate () {
	if(Time.time > nextBlinkTime){
		nextBlinkTime = Time.time + blinkEvery + Random.Range(-blinkEveryRandomize,blinkEveryRandomize);
		blink.current = true;
	}
	
	blink.Update();
	if(blink.current) blink.current = false;
	if(Time.time < blink.toggledTrueTime + blinkDuration * .5){
		currentFrame = ((Time.time - blink.toggledTrueTime) / blinkDuration*2.0) * (frameCount-1);
	}
	else{
		currentFrame = (1-((Time.time - (blink.toggledTrueTime + blinkDuration*.5) ) / blinkDuration)) * (frameCount-1);
	}

	currentFrame = Mathf.Round(currentFrame);
	if(currentFrame < 0 ) currentFrame = 0;
	
	frameGroup.SetFrame(frameGroupID, currentFrame);
	if(additiveSquash){
		eyeBone.localScale.y += (squashCuve.Evaluate((Time.time - blink.toggledTrueTime)/squashDurationFactor)-1) * squashFactor;
		eyeBone.localScale.x -= (squashCuve.Evaluate((Time.time - blink.toggledTrueTime)/squashDurationFactor)-1) * squashFactor;
	}
	else{
		eyeBone.localScale.y = squashCuve.Evaluate((Time.time - blink.toggledTrueTime)/squashDurationFactor);
		eyeBone.localScale.y = 1 + (eyeBone.localScale.y-1)*squashFactor;
		
		eyeBone.localScale.x = 1 / eyeBone.localScale.y;
	}

	if(blink.toggledTrue && eyeRenderer.enabled){
		blinkAudio.Play();
	}
}