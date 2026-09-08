#pragma strict

var colorGroup : VertexColorGroups;
var alphaGroups : AlphaColorGroups;
var isGrounded : IsGrounded;
var rb : Rigidbody;
@Space(30)
var center : Transform;
var trail : Transform;
@Space(30)
var targets : Transform[];
//var targetTags : String[];
@Space(30)
var trailFrameEvery : float;
var trailStretch : float;
var trailStretchMax : float;
@Space(30)
var centerSpeed : float = 360;
var centerScaleCurve : AnimationCurve;
@Space(30)
var dontBurst : boolean;
var startEnergy : float = 3.0;
var bounceEnergyLoss : float = .3;
var targetDestroyDist : float = 1.0;
var distCheckOffset : Vector3;
var inflictDamage : float = 30.0;
var fireBurstSounds : AudioSource[];
@Space(30)
var underwater : UnderWater;
var waterEnergyLoss : float = 2.0;
@Space(15)
var smokeTrail : SmokeTrail;
var smokeTrail_UnderwaterAlpha : float = .5;
var smokeTrail_underwaterFadeSpeed : float = 10.0;
var smokeTrail_defaultFadeSpeed : float;
@Space(30)
var harmlessDuration : float = .3;
var ignoreList : Transform[];
@Space(30)
var lastTrailFrameTime : float;
@Space(30)
var createTime : float;

var destroy : ToggleBoolean;
var destroyPrefabs : GameObject[];
var energy : float;

@Space(30)
var fuses : Fuse[]; //light fuses.

function AddIgnore(ignore : Transform){
	if(ignoreList == null){
		ignoreList = new Transform[1];
		ignoreList[0] = ignore;
	}
	else{
		var ignoreArray : Array = new Array();
		for(var i = 0; i < ignoreList.Length; i++){
			ignoreArray.Push(ignoreList[i]);
		}
		ignoreArray.Push(ignore);
		ignoreList = new Transform[ignoreArray.length];
		ignoreList = ignoreArray.ToBuiltin(Transform) as Transform[];
	}
}

function Start () {
	underwater = GetComponentInChildren.<UnderWater>();
	smokeTrail = GetComponentInChildren.<SmokeTrail>();
	if(smokeTrail != null){
		smokeTrail_defaultFadeSpeed = smokeTrail.smokeFadeSpeed;
	}

	fuses = GameObject.FindObjectsOfType.<Fuse>();
	//ignoreList = new Array();
	
	createTime = Time.time;
	colorGroup = GetComponentInChildren.<VertexColorGroups>();
	alphaGroups = GetComponentInChildren.<AlphaColorGroups>();
	if(rb == null){
		rb = GetComponent.<Rigidbody>();
	}
	if(isGrounded == null){
		isGrounded = GetComponentInChildren.<IsGrounded>();
	}

	var children : Transform[] = GetComponentsInChildren.<Transform>() as Transform[];
	for(var i = 0; i < children.Length; i++){
		if(children[i].name.ToLower().Contains("Center".ToLower())){
			center = children[i];
		}
		if(children[i].name.ToLower().Contains("Trail".ToLower())){
			trail = children[i];
		}
		if(trail != null && center != null){
			break;
		}		
	}
	
	//GetTartets.
	var allHealth : Health[] = GameObject.FindObjectsOfType.<Health>();
	targets = new Transform[allHealth.Length];
	for(var n = 0; n < allHealth.Length; n++){
		if(allHealth[n].transform.parent != null){
			targets[n] = allHealth[n].transform.parent;
		}
		else{
			targets[n] = allHealth[n].transform;
		}
	}
	
	/*var targetsArray : Array = new Array();
	for(var n = 0; n < targetTags.Length; n++){
		var allTagObjects : GameObject[] = GameObject.FindGameObjectsWithTag(targetTags[n]) as GameObject[];
		for(var m = 0; m < allTagObjects.Length; m++){
			if(allTagObjects[m].transform.parent == null){
				targetsArray.Push(allTagObjects[m].transform);
			}
		}
	}
	
	targets = targetsArray.ToBuiltin(Transform) as Transform[];*/
	
	energy = startEnergy;


}

function LateUpdate () {
	if(underwater != null){
		if(underwater.isUnderwater.current){
			energy -= waterEnergyLoss * Time.deltaTime;
			if(smokeTrail != null){
				smokeTrail.smokeFadeSpeed = smokeTrail_underwaterFadeSpeed;
				smokeTrail.startVColorAlpha = smokeTrail_UnderwaterAlpha;
			}
		}
		else{
			if(smokeTrail != null){
				smokeTrail.smokeFadeSpeed = smokeTrail_defaultFadeSpeed;
				smokeTrail.startVColorAlpha = 1.0;
			}
		}
	}

	//Center.
	center.RotateAround(center.position, Vector3.forward, centerSpeed * Time.deltaTime);
	center.localScale = Vector3.one * centerScaleCurve.Evaluate(Time.time);
	
	//Trail.
	if(Time.time > lastTrailFrameTime + trailFrameEvery){
		lastTrailFrameTime = Time.time;
		//alphaGroups.alphaFrameGroups[0].currentFrame = Mathf.FloorToInt(Random.value * alphaGroups.alphaFrameGroups[0].frameID.Length);
		if(alphaGroups != null){
			alphaGroups.alphaFrameGroups[0].currentFrame ++;
			alphaGroups.alphaFrameGroups[0].currentFrame = alphaGroups.alphaFrameGroups[0].currentFrame % (alphaGroups.alphaFrameGroups[0].frameID.Length-1);
		}
	}
	trail.localRotation = Quaternion.identity;
	trail.RotateAround(trail.position, Vector3.forward, Mathf.Atan2(rb.velocity.y, rb.velocity.x) * Mathf.Rad2Deg);
	
	trail.localScale.x = Mathf.Min(trailStretchMax, rb.velocity.magnitude * trailStretch);
	
	//Destroy
	destroy.Update();
	if(destroy.toggledTrue){
		for(var i = 0; i < destroyPrefabs.Length; i++){
			var newPrefab : GameObject = Instantiate(destroyPrefabs[i]);
			newPrefab.transform.position = center.transform.position;
			if(fireBurstSounds != 0){
				var random : int = Random.value * fireBurstSounds.Length;
				if(fireBurstSounds[random].enabled){
					fireBurstSounds[random].Play();
				}
				fireBurstSounds[random].transform.parent = null;
				var td : TimedDestroy = fireBurstSounds[random].gameObject.AddComponent(TimedDestroy);
				td.destroyTriggerTime = 1.0;
			}
		}
		Destroy(gameObject);
		//gameObject.SetActive(false);
	}
	
	energy -= Time.deltaTime;
	
	if(isGrounded.touchedGround){
		energy -= bounceEnergyLoss;
		if(fireBurstSounds != null){
			fireBurstSounds[Random.value * fireBurstSounds.Length].Play();
		}
	}
	
	if(energy <= 0 && !dontBurst){
		destroy.current = true;
	}
	
	//Target
	if(Time.time > createTime + harmlessDuration){
		for(var n = 0; n < targets.Length; n++){
			var cont : boolean;
			for(var m = 0; m < ignoreList.Length; m++){
				if(ignoreList[m] == targets[n]){
					 cont = true;
					 break;
				}
			}
			if(targets[n] == null) cont = true;
			if(cont) continue;
			
			var dist : float = Vector3.Distance(transform.position, targets[n].position + distCheckOffset);
			if(dist < targetDestroyDist){
				
				destroy.current = true;
				var targetHealth : Health = targets[n].GetComponentInChildren.<Health>();
				if(targetHealth != null){
					targetHealth.health -= inflictDamage;
					var targetHurt : Hurt = targets[n].GetComponentInChildren.<Hurt>();
					if(targetHurt != null){
						targetHurt.hurt.current = true;
					}
					if(fireBurstSounds != null){
						fireBurstSounds[Random.value * fireBurstSounds.Length].Play();
					}
				}
				//break;
			}
		}
	}

	for(n = 0; n < fuses.Length; n++){
		if(fuses[n] == null){
			continue;
		}
		dist = Vector3.Distance(transform.position, fuses[n].transform.position);
		if(dist < targetDestroyDist){
			destroy.current = true;
			fuses[n].fuseOn.current = true;
			fuses[n].enableFuseBurn = true;
		}	
	}
}