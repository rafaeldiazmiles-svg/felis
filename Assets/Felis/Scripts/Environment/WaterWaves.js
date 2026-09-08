#pragma strict

var waterAreasTimer : Timer;
var waterAreas : WaterArea[];

var waterWaves : Transform[];

var waterLevel : float;

var waveSpeed : float = 1.0;
var waveLength: float = 1.0;
var waveHeight: float = 1.0;

var waveSplashRange : float = 5.0;

var waveSplashes : WaveSplash[];

var waveShape : AnimationCurve;

var tweakWaveSpeed : float = 1.0;
var adjacentWaveTimeOffset : float = 0.1;

static var maxWaveSplashes : int = 6;

var splashWaveMultiply : float = .2;

var splashPrefab : GameObject;

var bigSplashSpeed : float = 3;

var splashSize : float = .1;
var minSplashSize : float = .3;

//var bubbleEmit : ParticleEmitter;

//var bubbleTrailSeparation : float = .3;
//var bubbleBrightness : float = 0.7;

var rigidbodyList : Rigidbody[];
var lastBubblePos : Vector3[];
var underWaterScript : UnderWater[];

var loopableLength : float = 8;
var hasLoopableLeft : WaterWaves;
var hasLoopableRight : WaterWaves;

class WaveSplash{
	var position : float;
	var startTime : float;
	var size : float;
}

var getWaterObjectsTimer : Timer;


function GetWaterAreas(){
	waterAreas = GameObject.FindObjectsOfType.<WaterArea>();
}


function Start () {
	GetWaterAreas();
	
	if(waterAreasTimer.every == 0.0){
		waterAreasTimer.every = 2.0;
	}	


	GetWaterObjects();

	//Water wave objects.
	var waterWavesWParent : Transform[] = GetComponentsInChildren.<Transform>();
	var waterWavesArray = new Array();
	
	for(var i = 0; i < waterWavesWParent.Length; i++){
		if(waterWavesWParent[i].name.Contains("Wave")) waterWavesArray.push(waterWavesWParent[i]);
	}
	
	waterWaves = waterWavesArray.ToBuiltin(Transform) as Transform[];
	SortByXPosition(waterWaves);
	
	waterLevel = waterWaves[0].position.y;
	
	waveSplashes = new WaveSplash[maxWaveSplashes];
	for(i = 0; i < waveSplashes.Length; i++){
		waveSplashes[i] = new WaveSplash();
	}
	
	waveShape = new AnimationCurve();
	waveShape.AddKey(0,0);
	waveShape.AddKey(.25,-1);
	waveShape.AddKey(.5,.75);
	waveShape.AddKey(.75,-.5);
	waveShape.AddKey(1,.25);
	waveShape.AddKey(1.25,-.2);
	waveShape.AddKey(1.5,.15);
	waveShape.AddKey(1.74,-.1);
	waveShape.AddKey(2,.05);
	waveShape.AddKey(2.5,0);
	
	//bubbleEmit = GetComponent.<ParticleEmitter>();
	
	//bubbleEmit.emit = false;
	
	if(getWaterObjectsTimer.every == 0.0){
		getWaterObjectsTimer.every = 2.0;
	}
	
	var allWater : WaterWaves[] = GameObject.FindObjectsOfType.<WaterWaves>();
	for(var n = 0; n < allWater.Length; n++){
		if(allWater[n] == this){
		continue;
		}
		if(Vector3.Distance(transform.position + Vector3(loopableLength, 0, 0), allWater[n].transform.position) < .1){
			hasLoopableLeft = allWater[n];
		}
		if(Vector3.Distance(transform.position + Vector3(-loopableLength, 0, 0), allWater[n].transform.position) < .1){
			hasLoopableRight = allWater[n];
		}
	}
}

function Update () {
	waterAreasTimer.Update();
	if(waterAreasTimer.current){
		GetWaterAreas();
	}
	
	getWaterObjectsTimer.Update();
	if(getWaterObjectsTimer.current){
		GetWaterObjects();
	}

	//Interaction.
	for(var m = 0; m < rigidbodyList.Length; m++){
		if(rigidbodyList[m] == null){
			GetWaterObjects();
			break;
		}
	
		if(underWaterScript[m].isUnderwater.toggledTrue || underWaterScript[m].isUnderwater.toggledFalse ){
			AddSplash(rigidbodyList[m].position, -rigidbodyList[m].velocity.y * splashWaveMultiply,
			rigidbodyList[m].velocity.y);	
		}

	} 
	
	//Idle waves.
	for(var i = 0; i < waterWaves.Length; i++){
		waterWaves[i].position.y = waterLevel + Mathf.Sin(Time.time * waveSpeed + waterWaves[i].position.x * waveLength) * waveHeight;
	}
	
	
	
	//Splashing waves.
	
	for(var n = 0; n < waveSplashes.Length; n++){
		for(i = 0; i < waterWaves.Length; i++){
			var splashDistance : float = Mathf.Abs(waterWaves[i].position.x - waveSplashes[n].position);
			var splashTime : float = Time.time -  waveSplashes[n].startTime;
			
			var waveValue : float = waveShape.Evaluate((splashTime - splashDistance * adjacentWaveTimeOffset) * tweakWaveSpeed) 
			* Mathf.Max(0, (waveSplashRange - splashDistance) / waveSplashRange) * waveSplashes[n].size;
			
			//if(i == 0 &&  hasLoopableLeft == null || i == waterWaves.Length-1 && hasLoopableRight == null) waveValue *= .1;										
																											
			waterWaves[i].position.y += waveValue;
		}	
	}
	
	
	/*if(hasLoopableLeft != null){
		waterWaves[0].position = hasLoopableLeft.waterWaves[hasLoopableLeft.waterWaves.Length - 1].position;
	}*/
	

	
}

function LateUpdate(){
	if(hasLoopableRight != null){
		DebugUtility.DrawPoint(waterWaves[waterWaves.Length-1].position, .5, Color.green);
		waterWaves[waterWaves.Length-1].position = hasLoopableRight.waterWaves[0].position;
		DebugUtility.DrawPoint(waterWaves[waterWaves.Length-1].position, .5, Color.red);
	}
}

function AddSplash(position : Vector3, size : float, ySpeed : float){
	var splashID : int = 0;
	for (var i = 1; i < waveSplashes.Length; i++){
		if(waveSplashes[i].startTime <  waveSplashes[splashID].startTime){
			splashID = i;
		}
	}
	
	waveSplashes[splashID].position = position.x;
	waveSplashes[splashID].size = size;
	waveSplashes[splashID].startTime = Time.time;
	
	
	if(position.x < waterWaves[0].position.x + 1.0 && position.x > waterWaves[waterWaves.Length - 1].position.x){
		if(Mathf.Abs(ySpeed) > bigSplashSpeed){
			var newSplashSprite : GameObject = Instantiate(splashPrefab,position, Quaternion.identity);
			newSplashSprite.GetComponent(StayOnWater).SetLeftRightWaterObjects(waterWaves);
			newSplashSprite.transform.localScale = Vector3.one * minSplashSize + Vector3(0.5,1,0.5) * Mathf.Abs(ySpeed) * splashSize;
			
		}
	}
	
}

function IsPointInWater(point : Vector3, detectionOffset : float) :boolean{
	for(var i = 0; i < waterAreas.Length; i++){
		if(waterAreas[i].IsPointInWater(point + Vector3(0,detectionOffset,0) ) ){
			return true;
		}
	}
	return false;
}

function SortByXPosition(transformArray : Transform[]){
	var doAgain : boolean = false;
	for(var i = 0; i < transformArray.Length -1; i++){
		if(transformArray[i+1].position.x > transformArray[i].position.x){
			var hold : Transform = transformArray[i];
			transformArray[i] = transformArray[i+1];
			transformArray[i+1] = hold;
			doAgain = true;
		}
	}
	if(doAgain) SortByXPosition(transformArray);
}

function GetWaterObjects(){
	underWaterScript = GameObject.FindObjectsOfType.<UnderWater>();
	rigidbodyList = new Rigidbody[underWaterScript.Length];
	
	for(var i = 0; i < underWaterScript.Length; i++){
		if(underWaterScript[i].transform.parent != null){
			rigidbodyList[i] = underWaterScript[i].transform.parent.GetComponent(Rigidbody);
		}
	}
	
	lastBubblePos = new Vector3[rigidbodyList.Length];
}