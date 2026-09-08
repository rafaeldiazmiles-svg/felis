#pragma strict

var rend : Renderer;

var propName : String = "_MainTex";

var horizontalFrameCount : int = 4;

//var offFrame : int = 0.0;

var fuseOn : ToggleBoolean;

var frameTimer : Timer;
var currentFrame : int;

var fuseFullOffset : float = 0.0;
var fuseEmptyOffset : float = 1.0;

var currentFuse : float;
var previousFuse : float;

var enableFuseBurn : boolean = true;
var burnRate : float = .2;

var sparks : GameObject;
var sparksAnim : Animation;
var sparkFuseAnim : AnimationClip;
var sparksPart : ParticleEmitter;

var smokeTrail : SmokeTrail;

var turnOnByDropping : PickableRigidbody;

var enableDestroy : boolean = true;
var bombObj : GameObject;
var destroy : ToggleBoolean;
var destroyPrefabs : GameObject[];
var explodeSound : AudioSource[];
var multiplyPrefabSize : float[];

var fuseSound : AudioSource;

var quake : boolean = true;

var explosionRadius : float = 4.0;
var explosionForce : float = 2000.0;
var upMod : float = 1.0;

var damage : float = 150;
var hurtDamage : float = 30.0;

var scary : SetFrameBounds;

@Space(30)
var magicFuse : boolean; //growsBackAfter Use.
var growBackDelay : float = 1.0;
var growBackRate : float = .6;
@Space(10)
var growBackSound : AudioSource;
var playGrowBackSound : boolean;

@Space(10)
var keepDist : EnemyKeepDistance;

function SetFrame(frame : int){
	rend.material.mainTextureOffset.y = -(1.0 / horizontalFrameCount) * frame;
	
	if(frameTimer.every == 0.0){
		frameTimer.every = .05;
	}
}

function Start () {
	rend = GetComponent.<Renderer>();
	
	if(sparks != null){
		sparksAnim = sparks.GetComponent.<Animation>();
		sparksPart = sparks.GetComponent.<ParticleEmitter>();
		sparksPart.emit = false;
	}
	
	if(smokeTrail == null){
		smokeTrail = GetComponentInChildren.<SmokeTrail>();
	}
	

}

function Update () {
	if(bombObj == null){
		if(transform.parent != null){
			bombObj = transform.parent.gameObject;
		}
		else{
			bombObj = gameObject;
		}
	}

	if(keepDist != null){
		keepDist.disable = !fuseOn.current;
	}
	
	fuseOn.Update();

	if(magicFuse){
		if(!fuseOn.current && Time.time > fuseOn.toggledTrueTime + growBackDelay){
			currentFuse = Mathf.MoveTowards(currentFuse, 0.0, growBackRate * Time.deltaTime);
			if(growBackSound != null){
				if(playGrowBackSound){
					playGrowBackSound = false;
					growBackSound.Play();
				}
			}
		}
	}

	if(currentFuse != previousFuse){
		previousFuse = currentFuse;
		rend.material.mainTextureOffset.x = Mathf.Lerp(fuseFullOffset, fuseEmptyOffset, currentFuse);
		if(sparksAnim != null){
			sparksAnim[sparkFuseAnim.name].enabled = true;
			sparksAnim[sparkFuseAnim.name].weight = 1.0;
			sparksAnim[sparkFuseAnim.name].normalizedTime = currentFuse;
		}
	}
	
	if(fuseOn.current){
		frameTimer.Update();
		if(frameTimer.current){
			currentFrame ++;
			if(currentFrame >= horizontalFrameCount){
				currentFrame = 1;
			}
			SetFrame(currentFrame);
			//SetFrame(Random.value * (horizontalFrameCount -1) + 1);
		}

		if(enableFuseBurn){
			currentFuse = Mathf.MoveTowards(currentFuse, 1.0, burnRate * Time.deltaTime);
		}

		fuseSound.volume = Mathf.MoveTowards(fuseSound.volume, 1.0, Time.deltaTime * 10.0);

		if(currentFuse >= 1.0){
			fuseOn.current = false;
		}
	}
	
	if(fuseOn.toggledTrue){
		if(fuseSound != null){
			fuseSound.Play();
			fuseSound.volume = 0.0;
		}
		if(sparksPart != null){
			sparksPart.emit = true;
		}
		if(smokeTrail != null){
			smokeTrail.emit = true;
		}
		
		if(scary != null){
			scary.enabled = true;
		}
	}
	
	if(fuseOn.toggledFalse){
		playGrowBackSound= true;

		if(fuseSound != null){
			fuseSound.Stop();
			fuseSound.volume = 0.0;
		}	
		if(sparksPart != null){
			sparksPart.emit = false;
		}
		if(smokeTrail != null){
			smokeTrail.emit = false;
		}	
		SetFrame(0);
		
		if(scary != null){
			scary.enabled = false;
		}
	}
	
	if(turnOnByDropping != null){
		if(turnOnByDropping.beingPicked.toggledFalse){
			fuseOn.current = true;
		}
	}
	
	if(enableDestroy && currentFuse == 1.0){
		destroy.current = true;
	}
	
	//Destroy
	destroy.Update();
	if(destroy.toggledTrue){
		if(quake){
			var cameraShakiness : Shakiness;
		
			if(Camera.main.transform.parent != null){
				cameraShakiness = Camera.main.transform.parent.GetComponent(Shakiness);
			}		
		
			if(cameraShakiness != null){
				cameraShakiness.highQuake = true;
			}		
		}	
	
		for(var i = 0; i < destroyPrefabs.Length; i++){
			var newPrefab : GameObject = Instantiate(destroyPrefabs[i]);
			newPrefab.transform.position = bombObj.transform.position;
			
			if(multiplyPrefabSize != null && i < multiplyPrefabSize.Length && multiplyPrefabSize[i] != 0.0){
				newPrefab.transform.localScale *= multiplyPrefabSize[i];
			}
			
			if(explodeSound != 0){
				var random : int = Random.value * explodeSound.Length;
				if(explodeSound[random].enabled){
					explodeSound[random].Play();
				}
				explodeSound[random].transform.parent = null;
				var td : TimedDestroy = explodeSound[random].gameObject.AddComponent(TimedDestroy);
				td.destroyTriggerTime = 1.0;
			}
		}
		
		//Explosion Force
		var allRB : Rigidbody[] = GameObject.FindObjectsOfType.<Rigidbody>();
		for(i = 0; i < allRB.Length; i++){
			allRB[i].AddExplosionForce(explosionForce, transform.position, explosionRadius, upMod);
		}
		
		var allHealth : Health[] = GameObject.FindObjectsOfType.<Health>();
		for(i = 0; i < allHealth.Length; i++){
			var dist : float = Vector3.Distance(transform.position, allHealth[i].transform.position);
			if(dist < explosionRadius){
				var range : float = 1 - (dist / explosionRadius);
				var thisDamage : float = damage * range;
				allHealth[i].health -= thisDamage;
				if(thisDamage > hurtDamage){
					if(allHealth[i].transform.parent != null){
						var hurt : Hurt = allHealth[i].transform.parent.GetComponentInChildren.<Hurt>();
						if(hurt != null){
							hurt.hurt.current = true;
						}
					}
				}
			}
		}		
		Destroy(bombObj);
	}
}