#pragma strict

@Header("-----------------Components----------------")
var meshF : MeshFilter;

@Header("------------------Input-------------------")
var waveVertsBounds : Bounds[];
@Space(30)
var waveSpeed : float = 2.0;
var waveLength : float = 1.0; 
var waveHeight : float = 0.1;
@Space(30)
var waveSplashRange : float = 5.0;
var tweakWaveSpeed : float = 1.0;
var adjacentWaveTimeOffset : float = 0.15;
var splashWaveMultiply : float = .06;
var upSplashVelocityMultiplier : float = .5;
var splashPrefab : GameObject;
var bigSplashSpeed : float = 1;
var splashObjSizeSpeed : float = 0.4;
var maxWaveSize : float = 0.7;
var splashSizeError : float = 2.0; //More than this and it's a weird error.

var minSplashSize : float = .35;
var splashPrefabOffset : Vector3 = Vector3(0,.7,0);
var disableSplashDuration : float = .3;

@Space(30)

var rotationHeight : float;
var deltaOffset : float;
var maxRot : float = 30;
var minRot : float = -30;

@Space(30)


var skipAmount : int = 1;
var skipping : int;


@Header("--------------------Values-----------------")
var waveVerts : int[];
var holdWaveVerts : Vector3[];
var waterLevel : float;
@Space(30)
var getTimer : Timer;
var waterAreas : WaterArea[];
var waveSplashes : WaveSplashV[];
var waveShape : AnimationCurve;
@Space(30)
var rigidbodyList : Rigidbody[];
var lastBubblePos : Vector3[];
var underWaterScript : UnderWater[];
@Space(30)
var defRotation : Quaternion;


static var maxWaveSplashes : int = 6;


class WaveSplashV{
	var position : float;
	var startTime : float;
	var size : float;
}

function GetWaterAreas(){
	waterAreas = GameObject.FindObjectsOfType.<WaterArea>();
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


function Start () {
	defRotation = transform.rotation;

	waveSplashes = new WaveSplashV[maxWaveSplashes];
	for(var i = 0; i < waveSplashes.Length; i++){
		waveSplashes[i] = new WaveSplashV();
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

	GetWaterObjects();

	meshF = GetComponent.<MeshFilter>();
	
	//Gather wave verts.
	var waveVertsArray = new Array();
	var holdWaveVertsArray = new Array();
	var vertices : Vector3[] = meshF.mesh.vertices;
	for(i = 0; i < vertices.Length; i++){
		var wPos : Vector3 = transform.TransformPoint(vertices[i]);
		for(var n = 0; n < waveVertsBounds.Length; n++){
			var center : Vector3 = waveVertsBounds[n].center;
			waveVertsBounds[n].center += transform.position;
			var pushed : boolean  = false;
			if(waveVertsBounds[n].Contains(wPos)){
				waveVertsArray.Push(i);
				holdWaveVertsArray.Push(wPos);
				pushed = true;
			}
			waveVertsBounds[n].center = center;
			if(pushed){
				break;
			}
		}
	}
	waveVerts = waveVertsArray.ToBuiltin(int) as int[];
	holdWaveVerts = holdWaveVertsArray.ToBuiltin(Vector3) as Vector3[];
	
	waterLevel = transform.TransformPoint(vertices[waveVerts[0]]).y;
	
	//Sort.
	SortByXPosition();
	
	if(getTimer.every == 0.0){
		getTimer.every = 2.0;
	}
}

function IsObjBeingPicked(obj : UnderWater):boolean{
	var picked : boolean;
	if(obj.pickable != null){
		if(obj.pickable.beingPicked.current){
			picked = true;
		}
	}
	return picked;
}


function LateUpdate(){
	var deltaHeight : float = transform.position.y - Camera.main.transform.position.y + deltaOffset;
	var angle : float = deltaHeight * rotationHeight;
	angle = Mathf.Clamp(angle, minRot, maxRot);
	transform.RotateAround(transform.position, Vector3.right, angle);
}

function Update () {
	
	transform.rotation = defRotation;
	
	//SPLASHES
	
	getTimer.Update();
	if(getTimer.current){
		GetWaterAreas();
		GetWaterObjects();
	}
	
	//Interaction.
	for(var m = 0; m < rigidbodyList.Length; m++){
		if(rigidbodyList[m] == null){
			//GetWaterObjects();
			continue;
		}
		
		/*if(!underWaterScript[m].makeWaves){
			//continue;
		}*/
		
		if(underWaterScript[m].isUnderwater.toggledTrue || underWaterScript[m].isUnderwater.toggledFalse ){
			var splashSize : float = -rigidbodyList[m].velocity.y * splashWaveMultiply;
			
			if(rigidbodyList[m].velocity.y > 0){
				splashSize *= upSplashVelocityMultiplier;
			
			}
			
			splashSize*=splashWaveMultiply;
			
			if(Mathf.Abs(splashSize) < splashSizeError){
			
				if(Mathf.Abs(splashSize) > maxWaveSize){
					splashSize = Mathf.Sign(splashSize) * maxWaveSize;
				}
				
				if(!IsObjBeingPicked(underWaterScript[m])){
					if(underWaterScript[m].makeSplashes){
						AddSplash(underWaterScript[m].transform.position, splashSize);
					}
					if(underWaterScript[m].makeWaves){
						AddSWave(underWaterScript[m].transform.position, splashSize);
					}
					underWaterScript[m].noSplahUntil = Time.time + disableSplashDuration;
				}
			}
		}

	} 
	
	///VERTICES
	
	var skipVertexUpdate : boolean;
	
	skipping --;
	if(skipping < 0){
		skipping = skipAmount;
	}
	else{
		skipVertexUpdate = true;
	}
	
	if(!skipVertexUpdate){
		var vertices : Vector3[] = meshF.mesh.vertices;
		
		//Idle waves.
		var localToWorld : Matrix4x4 = transform.localToWorldMatrix;
		var worldToLocal: Matrix4x4 = transform.worldToLocalMatrix;
		
		
			for(var i = 0; i < waveVerts.Length; i++){
				var wPos : Vector3 = localToWorld.MultiplyPoint3x4(vertices[waveVerts[i]]);
				wPos.y =  waterLevel + Mathf.Sin(Time.time * waveSpeed + wPos.x * waveLength) * waveHeight;
				vertices[waveVerts[i]] = worldToLocal.MultiplyPoint3x4(wPos);
			}
		
		
		//Splashing waves.
		var waveDuration : float = waveShape.keys[waveShape.keys.Length -1].time;
		for(var n = 0; n < waveSplashes.Length; n++){
			if(waveSplashes[n].startTime > Time.time + waveDuration){
				continue;
			}
			for(i = 0; i < waveVerts.Length; i++){
				wPos = localToWorld.MultiplyPoint3x4(vertices[waveVerts[i]]);
				
				var splashDistance : float = Mathf.Abs(wPos.x - waveSplashes[n].position);
				var splashTime : float = Time.time -  waveSplashes[n].startTime;
				
				var waveValue : float = waveShape.Evaluate((splashTime - splashDistance * adjacentWaveTimeOffset) * tweakWaveSpeed) 
				* Mathf.Max(0, (waveSplashRange - splashDistance) / waveSplashRange) * waveSplashes[n].size;
				
				//if(i == 0 &&  hasLoopableLeft == null || i == waterWaves.Length-1 && hasLoopableRight == null) waveValue *= .1;										
				
				wPos.y += waveValue;
				
				wPos.x = holdWaveVerts[i].x;
				wPos.z = holdWaveVerts[i].z;
				
				vertices[waveVerts[i]] = worldToLocal.MultiplyPoint3x4(wPos);
																																																																																						
				//waterWaves[i].position.y += waveValue;
			}	
		}
		
		meshF.mesh.vertices = vertices;
	
	}
}

function AddSplash(position : Vector3, size : float){
	var vertices : Vector3[] = meshF.mesh.vertices;
	
	//Splash sprite
	var wPosLeft : Vector3 = transform.localToWorldMatrix.MultiplyPoint3x4(vertices[waveVerts[0]]);
	var wPosRight : Vector3 = transform.localToWorldMatrix.MultiplyPoint3x4(vertices[waveVerts[waveVerts.Length - 1]]);
	
	if(position.x < wPosLeft.x && position.x > wPosRight.x){
		var newSplashSprite : GameObject = Instantiate(splashPrefab,position, Quaternion.identity);
		newSplashSprite.transform.localScale = Vector3.one * minSplashSize + Vector3(1,2.5,1) * Mathf.Abs(size) * splashObjSizeSpeed;
		newSplashSprite.transform.position += splashPrefabOffset;
	}
	
}

function AddSWave(position : Vector3, size : float){
	//Splash wave
	var splashID : int = 0;
	for (var i = 1; i < waveSplashes.Length; i++){
		if(waveSplashes[i].startTime < waveSplashes[i-1].startTime){//waveSplashes[splashID].startTime){
			splashID = i;
		}
	}
	
	waveSplashes[splashID].position = position.x;
	waveSplashes[splashID].size = size;
	waveSplashes[splashID].startTime = Time.time;
	
}

function SortByXPosition(){
	var doAgain : boolean = false;
	
	var vertices : Vector3[] = meshF.mesh.vertices;
		
	for(var n = 0; n < waveVerts.Length-1; n++){
		var nextVertexPos : Vector3 = transform.TransformPoint(vertices[waveVerts[n+1]]);
		var thisVertexPos : Vector3 = transform.TransformPoint(vertices[waveVerts[n]]);
		if(nextVertexPos.x > thisVertexPos.x){
			var hold : int = waveVerts[n];
			waveVerts[n] = waveVerts[n+1];
			waveVerts[n+1] = hold;
			
			var holdF : Vector3 = holdWaveVerts[n];
			holdWaveVerts[n] = holdWaveVerts[n+1];
			holdWaveVerts[n+1] = holdF;
			
			doAgain = true;
		}
	}
	if(doAgain) SortByXPosition();
}

function OnDrawGizmosSelected(){
	#if UNITY_EDITOR
	for(var i = 0; i < waveVertsBounds.Length; i++){
		var center : Vector3 = waveVertsBounds[i].center;
		waveVertsBounds[i].center += transform.position;
		Gizmos.DrawWireCube(waveVertsBounds[i].center, waveVertsBounds[i].size);
		waveVertsBounds[i].center = center;
	}
	#endif
}