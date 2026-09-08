#pragma strict

var autoFindComponents : boolean = true;
var sweatDrops : SweatDropsParticles;
var frameGroups : UVFrameGroups;
var health : Health;

var stamina : float = 100;;
var previousStamina : float;

var staminaReduce : ToggleBoolean;
var noStamina : ToggleBoolean;
var waitBeforeRechargeDuration : float = .5;

var storemaxStamina : boolean = true;
var maxStamina : float;
var lowStaPct : float = .5;

var rechargeRate : float = 20.0;
var breatheRecharge : FloatLerp;
var breatheRecharge_Amount : float = 50;
var holdBreathRate : float = 5.0;

var noAirDamage : float = 30.0;

var noAirDamageTimer : Timer;

var meleeAttack : MeleeAttack;
var meleeAttackS : MeleeAttackSimple;
var staminaPerAttack : float = 5;
var staminaPerAttack_Underwater : float = 2;

var disableWhenTiredDuration : float = 1.0;

var sweatDuration : float = 2.0;
var worriedFaceDuration : float = 2.0;
var faceIsWorried : boolean;

var fish : boolean;
var underwater : UnderWater;

var drownBubblesPrefab : GameObject;
var headBone : GameObject;
var headBoneName : String = "Head";

function Start () {
	if(autoFindComponents){
		sweatDrops = transform.parent.GetComponentInChildren(SweatDropsParticles);
		frameGroups = transform.parent.GetComponentInChildren(UVFrameGroups);
		underwater = transform.parent.GetComponentInChildren(UnderWater);
		health = transform.parent.GetComponentInChildren(Health);
	}
	
	if(storemaxStamina){
		maxStamina = stamina;
	}
	stamina += maxStamina * 0.25;
	maxStamina = stamina;

	meleeAttack = transform.parent.GetComponentInChildren(MeleeAttack);
	meleeAttackS = transform.parent.GetComponentInChildren(MeleeAttackSimple);

	if(noAirDamageTimer.every == 0.0){
		noAirDamageTimer.every = 4.0;
	}

	if(breatheRecharge.speed == 0.0){
		breatheRecharge.speed = 1.0;
	}

	if(drownBubblesPrefab == null){
		drownBubblesPrefab = Resources.Load("Prefabs/Effects/Effects Prefabs/Underwater Bubbles", GameObject);
	}
	headBone = FindUtility.FindWithNameInObjChildren_Contains(transform.parent.gameObject, headBoneName);
}

function Update () {
	noAirDamageTimer.Update();
	if(underwater.isUnderwater.current && stamina <= 0.0 && noAirDamageTimer.current){
		health.health -= noAirDamage;
		if(drownBubblesPrefab != null && headBone != null){
			var newDrownBubbles : GameObject = GameObject.Instantiate(drownBubblesPrefab);
			newDrownBubbles.transform.position = headBone.transform.position;
		}
	}

	if(health.godMode){
		stamina = maxStamina;
	}

	if(stamina < previousStamina)
		staminaReduce.current = true;
	else
		staminaReduce.current = false;
	staminaReduce.Update();

	if(underwater != null && underwater.isUnderwater.toggledFalse){
		breatheRecharge.current = breatheRecharge_Amount;
	}

	breatheRecharge.Lerp();


	if(underwater != null && !underwater.isUnderwater.current || underwater == null || fish){
		if(Time.time > staminaReduce.toggledTrueTime + waitBeforeRechargeDuration){
			stamina = Mathf.MoveTowards(stamina, maxStamina, Time.deltaTime * (rechargeRate + breatheRecharge.current));
		}
	}
	else{
		stamina = Mathf.MoveTowards(stamina, 0, Time.deltaTime * holdBreathRate);
	}
		
	previousStamina = stamina;

	if(meleeAttack != null){
		if(meleeAttack.attacking.toggledTrue){
			if(stamina > 0){
				if(underwater.isUnderwater.current){
					stamina -= staminaPerAttack_Underwater;
				}
				else{
					stamina -= staminaPerAttack;
				}

			}
		}
	}
	if(meleeAttackS != null){
		if(meleeAttackS.attacking.toggledTrue){
			if(stamina > 0){
				if(underwater.isUnderwater.current){
					stamina -= staminaPerAttack_Underwater;
				}
				else{
					stamina -= staminaPerAttack;
				}
			}
		}
	}

	if(stamina <= maxStamina * lowStaPct){
		noStamina.current = true;
	}
	else{
		noStamina.current = false;
	}
	noStamina.Update();
	
	if(noStamina.toggledTrue){
		if(sweatDrops != null){
			sweatDrops.forceSweatDropUntil = Time.time + sweatDuration;
		}
	}
	
	if(Time.time < noStamina.toggledTrueTime + worriedFaceDuration && noStamina.current){
		if(frameGroups!= null){
			frameGroups.SetFrame(0,3);//frameGroups.SetFrame("Eyes", "Worried");
			if(!underwater.isUnderwater.current){
				frameGroups.SetFrame(1,3);//frameGroups.SetFrame("Mouth", "Worried");
			}
			faceIsWorried = true;
		}
	}
	if(Time.time > noStamina.toggledFalseTime + worriedFaceDuration && !noStamina.current && faceIsWorried){
		if(frameGroups!= null){
			frameGroups.SetFrame("Eyes", "Closed");
			if(!underwater.isUnderwater.current){
				frameGroups.SetFrame("Mouth", "Closed");
			}
			faceIsWorried = false;
		}		
	}
}

function RestoreStamina(){
	stamina = maxStamina;
}