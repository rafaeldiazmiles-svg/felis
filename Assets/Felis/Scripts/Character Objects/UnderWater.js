#pragma strict
@Space(60)
var rb : Rigidbody;
var frameGroups : UVFrameGroups;
var rend : Renderer;
var propRends : Array;
var pickable : PickableRigidbody;
var jumpSwim : JumpSwim;
var input : ControllerInput;

@Space(60)
var pushForce : float = 5;
@Space(10)
var usePushForceCurve : boolean;
var pushForceCurveMultiplier : float = 1.0;
var pushForceCurve : AnimationCurve;
@Space(10)
var waterInSlowDown : float = .4;
var waterOutJumpOut : float = 2.5;
var waterDrag : float = 2.0;
var waterAngularDrag : float = 1.0; 
var emitBubbles : boolean = true;
var makeWaves : boolean = true;
var makeSplashes : boolean = true;
var noSplahUntil : float;
var outOfWaterForce : float = 10.0;
var outOfWaterDeepness : float = .5;
var disableJumpDuration : float = .4;
@Space(30)
var underwaterAudio : AudioSource;
var highPitch : float = 1.3;
var lowPitch : float = .8;
var maxDeepness : float = 4.0;
var dynamicWaterSurfaceCheck : boolean;
var surfaceCheckOffset : float = .1;
@Space(30)
var changeColor : boolean;
var originalColor : Color;
var waterColor : Color;
var dontChangeWaterColor : boolean;
var blendColorDuration : float = 1.0;
var blendSpeed : float = 5.0;
var colorProp : String = "_Color";
@Space(30)
var testRB : boolean = true;


@Space(60)
var isUnderwater : ToggleBoolean;
var deepness : float;
var sinkHeight : float;
var underwaterPitchCurve : AnimationCurve;
var getWaterAreas_LastTime : float;
var disableGetWaterAreasDuration : float = 5.0;
var waterAreas : WaterArea[];
var getTimer : Timer;
@Space(30)
var loadPlayerSeaBubblesEffect : boolean;
var player_SeaParticlesPrefab : GameObject;
var player_SeaParticles : GameObject;
var disableSeaPart_Delay : float = 4.0;
@Space(30)
var hideProps : boolean;
var unhideProps : boolean;

function Start () {
	if(loadPlayerSeaBubblesEffect && player_SeaParticlesPrefab == null){
		player_SeaParticlesPrefab = Resources.Load("Prefabs/Misc/Sea Particles", GameObject);
		if(player_SeaParticlesPrefab != null){
			player_SeaParticles = GameObject.Instantiate(player_SeaParticlesPrefab);
		}
	}

	if(transform.parent != null){
		if(testRB)rb = transform.parent.GetComponent.<Rigidbody>();
		frameGroups = transform.parent.GetComponentInChildren.<UVFrameGroups>();
		if(rend == null) rend = transform.parent.GetComponentInChildren.<Renderer>();
		pickable = transform.parent.GetComponentInChildren.<PickableRigidbody>();
		jumpSwim = transform.parent.GetComponentInChildren.<JumpSwim>();
		input = transform.parent.GetComponentInChildren.<ControllerInput>();
	}
	
	if(rend == null){
		rend = GetComponent.<Renderer>();
	}
	
	underwaterPitchCurve = new AnimationCurve();
	underwaterPitchCurve.AddKey(0.0, highPitch);
	underwaterPitchCurve.AddKey(maxDeepness, lowPitch);

	GetWaterAreas();
	
	if(changeColor){
		if(rend.material.HasProperty(colorProp)){
			originalColor = rend.material.GetColor(colorProp);
		}
		else{
			if(transform.parent != null){
				Debug.Log(transform.parent.name + " Underwater script: Doesn't have color property: " + colorProp);
			}		
		}
	}
	
	getTimer.next = Time.time + .1;
}

function Update () {
	if(hideProps){
		hideProps = false;
		HideProps();
	}

	if(unhideProps){
		unhideProps = false;
		UnhideProps();
	}

	getTimer.Update();
	if(getTimer.current){
		GetWaterAreas();
	}
	isUnderwater.Update();

	if(rb == null && transform.parent != null && testRB){
		transform.parent.GetComponent.<Rigidbody>();
	}
	
	if(isUnderwater.toggledTrue){
		if(frameGroups != null){
			frameGroups.SetFrame("Mouth", "Hold Breath");
			frameGroups.SetFrame("Eyes", "Worried");
			if(underwaterAudio != null){
				underwaterAudio.volume = 1.0;
			}
		}
		
		sinkHeight = transform.position.y;
		
		if(rb != null && rb.velocity.y < 0){
			rb.velocity.y *= waterInSlowDown;
		}
		
		if(jumpSwim != null){
			jumpSwim.disableJumpUntil = Time.time + disableJumpDuration;
		}

		if(player_SeaParticles != null){
			player_SeaParticles.SetActive(true);
		}
	}
	
	if(isUnderwater.toggledFalse){
		if(frameGroups != null){
			frameGroups.SetFrame("Mouth", "Closed");
			frameGroups.SetFrame("Eyes", "Open");
			if(underwaterAudio != null){
				underwaterAudio.volume = 0.0;
			}
		}
		
		if(rb != null && rb.velocity.y > 0){
			rb.velocity.y *= waterOutJumpOut;
			
		}
		if(testRB && rb == null){
			if(transform.parent != null){
				rb = transform.parent.GetComponent.<Rigidbody>();
			}
			else{
				rb = transform.GetComponent.<Rigidbody>();
			}
		}


	}

	if(isUnderwater.current){
		deepness = sinkHeight - transform.position.y;
		
		if(dynamicWaterSurfaceCheck){
			//If water surface + offset is inside water... move water surface (sinkHeight) up a bit.
			var checkUp : boolean = CheckPointForWater(Vector3(transform.position.x, sinkHeight + surfaceCheckOffset, transform.position.z));
			if(checkUp){
				sinkHeight += surfaceCheckOffset;
			}
			else{
				//if checking up returned air, then check if current watersurface is underwater. If not, move water surface down a bit.
				var checkCurrent : boolean = CheckPointForWater(Vector3(transform.position.x, sinkHeight, transform.position.z));
				if(!checkCurrent){
					sinkHeight -= surfaceCheckOffset;
				}
			}
		}
		
		if(underwaterAudio != null){
			underwaterAudio.pitch = underwaterPitchCurve.Evaluate(deepness);
		}


	}
	else{
		if(player_SeaParticles != null && Time.time > isUnderwater.toggledFalseTime + disableSeaPart_Delay){
			player_SeaParticles.SetActive(false);
		}
		deepness = 0.0;
	}
	
	
	if(changeColor){
		if(rend == null){
			if(transform.parent != null){
				rend = transform.parent.GetComponentInChildren.<Renderer>();
			}
		}
		if(rend != null){
			if(rend.material.HasProperty(colorProp)){
				var setColor : Color;
				if(isUnderwater.current){// && Time.time < isUnderwater.toggledTrueTime + blendColorDuration){
					setColor = Color.Lerp(rend.material.GetColor(colorProp), waterColor, Time.deltaTime * blendSpeed);
					rend.material.SetColor(colorProp, setColor);
					PropSetCol(setColor);
				}
				
				if(!isUnderwater.current && Time.time < isUnderwater.toggledFalseTime + blendColorDuration){
					setColor = Color.Lerp(rend.material.GetColor(colorProp), originalColor, Time.deltaTime * blendSpeed);
					rend.material.SetColor(colorProp, setColor);
					PropSetCol(setColor);
				}
			}
			else{
				if(transform.parent != null){
					Debug.Log(transform.parent.name + " Underwater script: Doesn't have color property: " + colorProp + " on " + rend.transform.name + ". Disabling color change.");
					changeColor = false;
				}
				
			}
		}



	}

}

function HideProps(){
	if(propRends != null){
		for(var i = 0; i < propRends.length; i++){
			var thisRend : Renderer = propRends[i];
			thisRend.gameObject.SetActive(false);
		}
	}	
}

function UnhideProps(){
	if(propRends != null){
		for(var i = 0; i < propRends.length; i++){
			var thisRend : Renderer = propRends[i];
			thisRend.gameObject.SetActive(true);
		}
	}		
}

function AddPropRend(rend : Renderer){
	if(propRends == null){
		propRends = new Array();
	}
	propRends.Add(rend);	
}

function PropSetCol(col : Color){
	if(propRends != null){
		for(var i = 0; i < propRends.length; i++){
			var thisRend : Renderer = propRends[i];
			if(thisRend != null){
				thisRend.material.color = col;
			}
		}
	}	
}

function CheckPointForWater(point : Vector3): boolean{
	if(waterAreas != null){
		for(var n = 0; n < waterAreas.Length; n++){
			if(waterAreas[n].IsPointInWater(point)){
				return true;
			}
		}
	}
	
	return false;
}

function GetWaterAreas(){
	waterAreas = GameObject.FindObjectsOfType.<WaterArea>();
	for(var i = 0; i < waterAreas.Length; i++){
		waterAreas[i].GetUnderWaterObjs();
	}
}

function FixedUpdate(){
	if(isUnderwater.current){
		if(rb != null){
			if(!(pickable != null && pickable.beingPicked.current)){
				var usePushForce : float = pushForce;

				if(usePushForceCurve){
					usePushForce = pushForceCurve.Evaluate(deepness) * pushForceCurveMultiplier;
				}

				rb.AddForce(Vector3.up * usePushForce);
			}



			if(input != null && input.inputButtonB.down){
				if(deepness < outOfWaterDeepness){
					if(!(pickable != null && pickable.beingPicked)){
						rb.AddForce(Vector3(0,outOfWaterForce,0));
					}
				}
			}
		}
	}
}