#pragma strict

var loadFromResources : boolean = true;
@Space(20)
var health : float;
var previousHealth : float;
var storeMaxHealth : boolean = true;
var maxHealth : float;
var regenRate : float;
var regenUpToPercent : float = 1.0;
@Space(10)
var pickableRB : PickableRigidbody;
var pickedRegenRate : float;
@Space(20)
var godMode : boolean;
var godModeKey : KeyCode;
@Space(20)
var riding : boolean;
var mountHealth : float;
var boundHealth : boolean;
@Space(20)
var hurt : boolean;
var minDamageHurt : float = 15;
var hurtComp : Hurt;
var hurtAnim : PlayStillAnimation;
var hurtSounds : AudioSource[];
var hurtSoundDisableDuration : float;
var disableSoundUntil : float;
@Space(20)
var destroyObjectIsParent : boolean = true;
var destroyOnDeath : boolean;
var fakeDestroy : boolean;
var detroyObject : GameObject;
@Space(20)
var delayDestroy : boolean;
var destroyNow : boolean;
var delayDestroyDuration : float;
var destroyTime : float;
var createPrefabOnDestroy : boolean;
var deathPrefab : GameObject;
var deathPrefabPosition : Vector3;
var deathQuake : boolean;
var deathSound : AudioSource;
var destroyComplete : boolean;
var applicationQuit : boolean;
var deathAnimPlayed : boolean;
var playAnimOnDeath : boolean;
var animComp : Animation;
var deathAnim : AnimationClip;
@Space(20)
var shadow : Shadow;
var testKillKey : KeyCode;
var immuneToFallingWeight : boolean;
var cameraShakiness : Shakiness;
var isGrounded : IsGrounded;
@Space(20)
var squashDamage : SquashPhysics;
var squashDamageMultiply : float = 11.0;
var maxSquashEffect : float = 500.0;
@Space(20)
var underwater : UnderWater;
var noUnderwaterRegen : boolean;

@Header("-------Sick/Poison-------")
var sick : ToggleBoolean;
var sickTimer : Timer;
var sickAmount : float;
var sickDuration : float;
@Space(20)
var alterGreenColor : boolean;
var defaultColor : Color;
var greenRange : Vector2;
var greenWaveSpeed : float = 2.0;
var characterRenderer : Renderer;
var colorPropertyName : String = "_Color";
var ColorBlendSpeed : float = 10.0;
@Space(20)
var greenBubblePrefab : GameObject;
var greenBubbleTimer : Timer;
var greenBubbleBoneEmit : Transform;
var bubbleOffset : Vector3;
@Space(20)
var colorControl : ColorControl;
var addColorControl : boolean = true;
var flashingDuration : float = 0.2;
var flash : ToggleBoolean;
@Space(30)

var healthLossText_LastTime : float;
var healthLossText_DisableDuration = .5;
var healthLossText_L_Preafab : GameObject;
var healthLossText_R_Preafab : GameObject;
var healthLossText_OffsetPos : Vector3 = Vector3(.2,1,1);
var healthLossText_ManualSide : boolean;
var healthLossText_Side : int;
var healthLossText__minimumHealth : float = -50;

@Space(30)
var dizzyStarsPrefab : GameObject;
var dizzyStar : GameObject;
var dizzyStarsBone : GameObject;
var dizzyStarBone_FindName : String = "Head";
var dizzyStarBone_OffsetPosition : Vector3 = Vector3(0,.5,0);
var dizzyStarBone_UnderHealthPerc : float = .35;
var dizzyStar_LerpSpeed : float = 20.0;
var dizzyStar_Rend : Renderer;

@Space(30)
var healthAudio : HealthAudio[];
var healthAudio_DelayedP : Array;

class HealthAudio{
	var played : boolean;
	var onHealthPct : float;
	var audio : AudioSource;
	var playMoreThanOnce : boolean;

	@Space(30)
	var useDelay : float;
	var baloon : GameObject;
	var baloonChance : float;
}

class HealthAudio_DelayedPrefab{
	 var prefab : GameObject;
	 var onTime : float;
}

function HealthAudio_DelayedPref(){
	if(healthAudio_DelayedP != null){
		for(var i = healthAudio_DelayedP.length - 1; i >= 0; i--){
			var thisDelayedP : HealthAudio_DelayedPrefab = healthAudio_DelayedP[i];
			if(Time.time > thisDelayedP.onTime){
				var newPrefabInstance : GameObject = GameObject.Instantiate(thisDelayedP.prefab);
				newPrefabInstance.transform.position = transform.position;
				healthAudio_DelayedP.RemoveAt(i);
			}
		}
	}
}


function HealthAudio(){
	for(var i = 0; i < healthAudio.Length; i++){
		if(health < healthAudio[i].onHealthPct * maxHealth && !healthAudio[i].played){
			healthAudio[i].played = true;
			if(healthAudio[i].audio != null){
				healthAudio[i].audio.Play();
			}

			if(healthAudio[i].baloon != null && Random.value < healthAudio[i].baloonChance){
				if(!healthAudio[i].useDelay){
					var newBaloon : GameObject = GameObject.Instantiate(healthAudio[i].baloon);
					newBaloon.transform.position = transform.position;
				}
				else{
					if(healthAudio_DelayedP == null){
						healthAudio_DelayedP = new Array();
					}
					var newDelayedP : HealthAudio_DelayedPrefab = new HealthAudio_DelayedPrefab();
					newDelayedP.prefab = healthAudio[i].baloon;
					newDelayedP.onTime = Time.time + healthAudio[i].useDelay;
					healthAudio_DelayedP.Add(newDelayedP);
				}
			}

		}

		if(healthAudio[i].playMoreThanOnce && health > healthAudio[i].onHealthPct * maxHealth){
			healthAudio[i].played = false;
		}
	}
}

function LoadResources(){
	if(healthLossText_L_Preafab == null){
		healthLossText_L_Preafab = Resources.Load("Prefabs/GUI/Health Loss Indicator L", GameObject);
	}
	if(healthLossText_R_Preafab == null){
		healthLossText_R_Preafab = Resources.Load("Prefabs/GUI/Health Loss Indicator R", GameObject);
	}
	if(dizzyStarsPrefab == null){
		dizzyStarsPrefab = Resources.Load("Prefabs/Effects/Dizzy Stars", GameObject);
	}
}

function ChangeHealth(newHealth : float){
	health = newHealth;
	previousHealth = newHealth;
	maxHealth = newHealth;
}

function RegisterOnKillZones(){
	var allKillZones : KillZone[] = GameObject.FindObjectsOfType.<KillZone>();
	for(var i = 0; i < allKillZones.Length; i++){
		allKillZones[i].getTargets.current = true;
	}
}

function SetAnimComp(newAnimComp : Animation){
	animComp = newAnimComp;
}

function DizzyStar(){
	if(dizzyStarsPrefab != null && dizzyStarsBone != null){
		if(health < maxHealth * dizzyStarBone_UnderHealthPerc){
			if(dizzyStar == null){
				dizzyStar = GameObject.Instantiate(dizzyStarsPrefab);
				dizzyStar.name = transform.parent.name + " - Dizzy Stars";
				dizzyStar_Rend = dizzyStar.GetComponentInChildren.<Renderer>();
				dizzyStar.transform.position = dizzyStarsBone.transform.position + dizzyStarsBone.transform.TransformDirection(dizzyStarBone_OffsetPosition);

				var linkedDestroy : LinkedDestroy = dizzyStar.GetComponent.<LinkedDestroy>();
				if(linkedDestroy != null){
					linkedDestroy.otherObject = gameObject;
				}

				/*var underwater : UnderWater = transform.parent.GetComponentInChildren.<UnderWater>();
				if(underwater != null){
					underwater.AddPropRend(dizzyStar_Rend);
				}*/
			}

			if(!dizzyStar.activeSelf){
				dizzyStar.SetActive(true);
				dizzyStar.transform.position = dizzyStarsBone.transform.position + dizzyStarsBone.transform.TransformDirection(dizzyStarBone_OffsetPosition);
			}

			dizzyStar_Rend.material.color.a = Mathf.Lerp(dizzyStar_Rend.material.color.a, 1.0, Time.deltaTime * dizzyStar_LerpSpeed * .1);

			dizzyStar.transform.position = Vector3.Lerp(dizzyStar.transform.position, 
			dizzyStarsBone.transform.position + dizzyStarsBone.transform.TransformDirection(dizzyStarBone_OffsetPosition),
			Time.deltaTime * dizzyStar_LerpSpeed);
		}
		else{
			if(dizzyStar != null){
				if(dizzyStar.activeSelf){
					dizzyStar.transform.position = Vector3.Lerp(dizzyStar.transform.position, 
					dizzyStarsBone.transform.position + dizzyStarsBone.transform.TransformDirection(dizzyStarBone_OffsetPosition),
					Time.deltaTime * dizzyStar_LerpSpeed);

					dizzyStar_Rend.material.color.a = Mathf.Lerp(dizzyStar_Rend.material.color.a, 0.0, Time.deltaTime * dizzyStar_LerpSpeed * .1);
					if(dizzyStar_Rend.material.color.a < .05){
						dizzyStar.SetActive(false);
					}
				}
			}
		}
	}
}

function Start (){

	dizzyStarsBone = FindUtility.FindWithNameInObjChildren_Contains(transform.parent.gameObject, dizzyStarBone_FindName);
	if(dizzyStarsBone != null){
		dizzyStarBone_OffsetPosition = dizzyStarsBone.transform.InverseTransformDirection(dizzyStarBone_OffsetPosition);
	}
	 

	if(loadFromResources){
		LoadResources();
	}

	RegisterOnKillZones();
	
	if(transform.parent != null){
		animComp = transform.parent.GetComponentInChildren.<Animation>();
		isGrounded = transform.parent.GetComponentInChildren.<IsGrounded>();
		squashDamage = transform.parent.GetComponentInChildren.<SquashPhysics>();
		underwater = transform.parent.GetComponentInChildren.<UnderWater>();
	}
	
	if(destroyObjectIsParent){
		detroyObject = transform.parent.gameObject;
	}


	
	if(storeMaxHealth){
		maxHealth = health;
	}

	var sceneName : String = UnityEngine.SceneManagement.SceneManager.GetActiveScene().name;
	var easedLevel : boolean = sceneName.Contains("Level 2") || sceneName.Contains("Castle Tower");
	var hpRoot : String = (transform.parent != null) ? transform.parent.name : gameObject.name;

	if(hpRoot.Contains("Barricade") || hpRoot.Contains("Spikes")){
		var barricadeMul : float = (easedLevel) ? 0.75 * 0.75 : 0.65;
		health *= barricadeMul;
		maxHealth *= barricadeMul;
	}

	if(easedLevel){
		if((hpRoot.Contains("Bee") && !hpRoot.Contains("Nest")) || hpRoot.Contains("Rat")){
			health *= 0.75;
			maxHealth *= 0.75;
		}
	}
	
	shadow = transform.parent.GetComponentInChildren(Shadow);
	
	hurtComp = transform.parent.GetComponentInChildren.<Hurt>();
	
	if(alterGreenColor){
		characterRenderer = transform.parent.GetComponentInChildren.<Renderer>();
		defaultColor = characterRenderer.material.GetColor(colorPropertyName);
	}
	
	if(greenBubbleBoneEmit == null){
		var allBones : Transform[] = transform.parent.GetComponentsInChildren.<Transform>() as Transform[];
		for(var i = 0; i < allBones.Length; i++){
			if(allBones[i].name.Contains("Head")){
				greenBubbleBoneEmit = allBones[i];
				break;
			}
		}
	}
	
	if(Camera.main.transform.parent != null){
		cameraShakiness = Camera.main.transform.parent.GetComponent(Shakiness);
	}

	pickableRB = transform.parent.GetComponentInChildren.<PickableRigidbody>();
	//pMngr = GameObject.FindObjectOfType.<PoolManager>();

	var meleeAttacks : MeleeAttack[] = GameObject.FindObjectsOfType.<MeleeAttack>();
	for(i = 0; i < meleeAttacks.Length; i ++){
		meleeAttacks[i].GetAllEnemies();
	}

	colorControl = transform.parent.GetComponentInChildren.<ColorControl>();
	if(colorControl == null && addColorControl){
		var rend : Renderer = transform.parent.GetComponentInChildren.<Renderer>();
		if(rend != null){
			colorControl = rend.gameObject.AddComponent.<ColorControl>();
		}
	}
}

function Update () {
	HealthAudio();
	HealthAudio_DelayedPref();
	DizzyStar();

	#if UNITY_EDITOR
	if(Input.GetKeyDown(godModeKey)){
		godMode = !godMode;
	}
	#endif

	if(godMode){
		health = maxHealth;
	}

	if(health > 0 && health < maxHealth * regenUpToPercent){
		if(underwater == null || !noUnderwaterRegen || !underwater.isUnderwater.current){
			health = Mathf.MoveTowards(health, maxHealth * regenUpToPercent, Time.deltaTime * regenRate);
		}
	}

	if(pickableRB != null && pickableRB.beingPicked.current){
		health = Mathf.MoveTowards(health, maxHealth, Time.deltaTime * pickedRegenRate);
	}

	#if UNITY_EDITOR
	if(Input.GetKeyDown(testKillKey)){
		health = 0.0;
	}
	#endif
	
	sick.Update();
	
	var currentColor : Color;
	
	if(sick.current){
		sickTimer.Update();
		if(sickTimer.current){
			health -= sickAmount;
			if(hurtComp != null){
				hurtComp.hurt.current = true;
			}
		}
		
		if(Time.time > sick.toggledTrueTime + sickDuration){
			sick.current = false;
		}
		
		if(alterGreenColor){
			var greenWave :float = greenRange.x + (Mathf.Sin(Time.time * greenWaveSpeed)* .5 + .5) * (greenRange.y - greenRange.x);
			
			currentColor = characterRenderer.material.GetColor(colorPropertyName);
			var greenColor : Color = Color.Lerp(currentColor ,Color(0, 0.3, 0, greenWave), Time.deltaTime * ColorBlendSpeed);
			characterRenderer.material.SetColor(colorPropertyName, greenColor);
				
		}
		if(greenBubblePrefab != null){
			greenBubbleTimer.Update();
			if(greenBubbleTimer.current){
				var newBubble = Instantiate(greenBubblePrefab);
				newBubble.transform.position = greenBubbleBoneEmit.position;
				newBubble.transform.position += bubbleOffset;
			}
		}	
		
	}
	
	if(alterGreenColor && Time.time < sick.toggledFalseTime + 1/ColorBlendSpeed + 1.0){
		currentColor = characterRenderer.material.GetColor(colorPropertyName);
		characterRenderer.material.SetColor(colorPropertyName, Color.Lerp(currentColor,defaultColor, Time.deltaTime * ColorBlendSpeed));
	}

	if(health > maxHealth){
		health = maxHealth; 
	}

	if(health < previousHealth){
		if(squashDamage != null){
			squashDamage.externalSquashInput += Mathf.Min(maxSquashEffect, (previousHealth - health) * squashDamageMultiply);
		}
		if(colorControl != null){
			flash.current = true;
		}

		if((previousHealth - health) > 1 && health > healthLossText__minimumHealth && Time.time > healthLossText_LastTime + healthLossText_DisableDuration){
			healthLossText_LastTime = Time.time;
			var newHLI : GameObject;
			var hLI_Side : int;
			if(healthLossText_ManualSide){
				healthLossText_ManualSide = false;
				hLI_Side = healthLossText_Side;
			}
			else{
				hLI_Side = Mathf.Sign(transform.parent.localScale.x);
			}
			var offset : Vector3 = Vector3(healthLossText_OffsetPos.x * hLI_Side, healthLossText_OffsetPos.y, healthLossText_OffsetPos.z);
			if(hLI_Side > 0  && healthLossText_L_Preafab!= null){
				newHLI = GameObject.Instantiate(healthLossText_L_Preafab);
			}
			if(hLI_Side < 0 && healthLossText_R_Preafab != null){
				newHLI = GameObject.Instantiate(healthLossText_R_Preafab);
			}
			newHLI.transform.position = transform.position + offset;
			var hLIFont : FontMeshArrange = newHLI.GetComponent.<FontMeshArrange>();
			hLIFont.text = new String[1];
			var minusHealthString : String = (previousHealth - health).ToString();
			for(var i = 0; i < minusHealthString.Length; i++){ //Dont have a dot in minus health text, "i" is the dot position if it has a dot. Used in Math.Min(3,i)
				if(minusHealthString.Substring(i,1) == "."){
					break;
				}
			}
			hLIFont.text[0] = "-" + minusHealthString.Substring(0,Mathf.Min(Mathf.Min(3,i), minusHealthString.Length));
		}
	}

	if(health < previousHealth - minDamageHurt){
		hurt = true;
	}
	else{
		hurt = false;
	}
	previousHealth = health;

	flash.Update();

	if(colorControl != null){
		colorControl.flash = flash.current;

		if(flash.current && Time.time > flash.toggledTrueTime + flashingDuration){
			flash.current = false;
		}
	}

	if(health <= 0){
		if(dizzyStar != null){
			Destroy(dizzyStar);
		}

		if(deathSound != null){
			deathSound.Play();
			deathSound.transform.parent = null;
			var timedDestroy : TimedDestroy = deathSound.gameObject.AddComponent(TimedDestroy);
			timedDestroy.destroyTriggerTime = 2.0;
		}
		if(deathQuake){
			if(cameraShakiness != null){
				cameraShakiness.highQuake = true;
			}		
		}
		if(!deathAnimPlayed && playAnimOnDeath && animComp != null){
			deathAnimPlayed = true;
			animComp.Play(deathAnim.name);
		}
		if(destroyOnDeath && !destroyComplete){
			if(!delayDestroy){
				if(fakeDestroy){
					detroyObject.GetComponent.<Renderer>().enabled = false;
					shadow.GetComponent.<Renderer>().enabled = false;
					
				}
				else{
					if(transform.parent != null){
						transform.parent.BroadcastMessage("CharacterDestroy", SendMessageOptions.DontRequireReceiver);
					}
					Destroy(detroyObject);
				}
				if(deathPrefab != null){
					Instantiate(deathPrefab, transform.TransformPoint(deathPrefabPosition), Quaternion.identity);
				}
				//pMngr.Create(ObjType.PuffDestroy, detroyObject.transform.TransformPoint(deathPrefabPosition), Quaternion.identity);
				
				destroyComplete = true;
			}
			else{
				if(!destroyNow){
					destroyNow = true;
					destroyTime = Time.time;
				}
			}
		}
	}
	if(!destroyComplete && destroyNow && Time.time > destroyTime + delayDestroyDuration){
		if(fakeDestroy){
			var rend : Renderer = detroyObject.GetComponentInChildren.<Renderer>();
			if(rend != null){
				rend.enabled = false;
			}
			if(shadow != null){
				shadow.GetComponent.<Renderer>().enabled = false;
			}

			if(transform.parent != null){
				transform.parent.GetComponent.<Rigidbody>().isKinematic = true;
				var cols : Collider[] = transform.parent.GetComponentsInChildren.<Collider>();
				for(var n = 0; n < cols.Length; n++){
					cols[n].enabled = false;
				} 
			}
		}
		else{
			if(transform.parent != null){
				transform.parent.BroadcastMessage("CharacterDestroy", SendMessageOptions.DontRequireReceiver);
			}
			Destroy(detroyObject);
		}
		
		Instantiate(deathPrefab, transform.TransformPoint(deathPrefabPosition), Quaternion.identity);
		//pMngr.Create(ObjType.PuffDestroy, detroyObject.transform.TransformPoint(deathPrefabPosition), Quaternion.identity);
		
		var dropCollectibles : DropCollectibles = transform.parent.GetComponentInChildren(DropCollectibles);
		if(dropCollectibles != null){
			dropCollectibles.Drop();
		}
		
		destroyComplete = true;
	}
	
	if(destroyComplete && fakeDestroy){
		var glowItems : GlowItem[] = transform.parent.GetComponentsInChildren.<GlowItem>() as GlowItem[];
		for(i = 0; i < glowItems.Length; i++){
			glowItems[i].startColor = Color.black;
		}
	}
	

	
	if(hurt && health > 0){
		if(hurtComp != null){
			hurtComp.hurt.current = true;
		}
		if(hurtAnim != null){
			hurtAnim.animationPlay.current = true;
		}
		if(hurtSounds != null && hurtSounds.Length > 0){
			disableSoundUntil = Time.time + hurtSoundDisableDuration;
			if(Time.time > disableSoundUntil){
				var rand : int = Random.value * hurtSounds.Length;
				if(hurtSounds[rand] != null){
					if(hurtSounds[rand].enabled){
						hurtSounds[rand].Play();
					}
					else{
						if(transform.parent != null){
							//Debug.Log(transform.parent.name + "'s Health script has a disabled hurt audio source");
						}	
					}
				}
				else{
					if(transform.parent != null){
						Debug.Log(transform.parent.name + "'s Health script is missing a hurt audio source");
					}
				}
			}
		}
	}
}

function OnApplicationQuit(){
	applicationQuit = true;
}

function FakeDestroy(){
	health = 0.0;
	fakeDestroy = true;
	destroyOnDeath = true;
	delayDestroy = true;
	delayDestroyDuration = .15;
}

function DestroyOnDeath(){
	destroyOnDeath = true;
}