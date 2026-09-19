#pragma strict

var animComp : Animation;
var isGrounded : IsGrounded;
var sideMovement : SideMovement;
var controller : ControllerInput;
var underWater : UnderWater;
var pickRB : PickUpRigidbody;
var stamina : Stamina;
var rb : Rigidbody;

var allEnemies : GameObject[];
var getAllEnemies_LastTime : float;
var disableGetEnemiesDuration : float = 5.0;

var enemyTag : String = "Enemy";
var attackCenterOffset : Vector3;
var attackBone : Transform;
var attackTargets : Transform[];
var noThreatTag : String = "No Threat";
var importantEnemy : boolean;
var importantID : Array;
var attackRange : float;
var velocityIncreaseRange : float = .2;
var verticalReachUp : float = 1.4;
var verticalReachDown : float = 1.2;
var pushMul : float = 1.4;
private var ratHitboxMul : float = 1.4; //Rats only. Punch range vs anything named Rat. Not bees, not the eye, not the bear.

var performAttack : boolean;
var attacking : ToggleBoolean;
var lastAttackTime : float;
var lockAttack : boolean;

var applyForceTime : float;
var applyForceTimePunch : float = 0.05;
var applyForceTimeKick: float = 0.05;
var applyForceTimeUppercut : float = 0.15;
var applyForceTimePunchRun : float = .15;

var lastAttackDuration : float;
private var comboStep : int;
private var comboSpeedStep : float = 0.88;
private var comboFloorMul : float = 0.65;
private var comboHitMargin : float = 0.08;
var punchDuration : float = .3;
var kickDuration : float = .3;
var upperCutDuration : float = .4;
var punchRunDuration : float = .5;

var pushSpeed : Vector2 = Vector2(10,2);
var pushSpeed_Punch: Vector2 = Vector2(4,2);
var pushSpeed_Kick: Vector2 = Vector2(6,3);
var pushSpeed_Uppercut: Vector2 = Vector2(3,10);
var pushSpeed_PunchRun: Vector2 = Vector2(10,3); 
var pushForce : float = 50;
var forceApplied : boolean;
var enemyDisableMovementTime : float;

var punchAnimation : PlayStillAnimation;
var kickAnimation : PlayStillAnimation;
var upperCutAnimation : PlayStillAnimation;
var punchRunAnimation : PlayStillAnimation;

var punchRun : boolean;
var punchRunVel : float = 0.5;
var addPunchRunVel : float = 4.0;

var kick : boolean;
var secondaryAttackDuration : float = 1.0;
var airKick : boolean;

var upperCutBar : float;
var upperCutBarAdd : float = 1.0;
var activateUpperCutOn : float = 2.0;
var upperCut : boolean;

var disableUntil : float;

var useFrameGroups : boolean;
var frameGroups : UVFrameGroups;

var smokePrefab : Transform;
var smokePosition : Vector3;

var punchHitEffectPrefab : Transform;
var punchHitEffectPosition : Vector3;

var attackPower : float;
var attackPowerPunch : float = 60;
var attackPowerKick : float = 90;
var attackPowerUppercut : float = 120;
var attackPowerPunchRun : float = 120;

var staminaFactor : float;
var useStaminaEffect : boolean;
var minStaminaF : float = .5;
var multEnem_ReducePower : float = 5.0;

var disableIfHurt : boolean;
var disableDuration : float;
var characterHurt : Hurt;

//Sometimes some non attacking animations are played over the attack animation. If this happens, it looks
//bad that the attack still takes effect.
var disablingAnimations : AnimationClip[]; 
var disablingWeightCombined : float;
var maxWeightAllowed : float = .2;

//var getAllEnemiesTimer : Timer;

@Space(30)
var maxMultipleHit : int = 3;
var hitTimeSeparation : float = .08;
var enemyID : int;
var checkEnemies : boolean;

@Space(30)
var lockPunch : boolean;
var throwFireball : boolean;
var fireballPrefab : GameObject;
var fireballThrown : boolean;
var fireballPosition : Vector3;
var fireballSpeed : Vector2 = Vector2(6,4);
var fireballDamage : float = 150;
var fireballRange = 1.3;
var disableFireballDuration : float = 1.0;
var disableFireballUntil : float;
var catTag : String = "Cat";
var fireball_UpXMul : float = .25;
var fireball_UpYMul : float = 6.0;
var dontCollideWPlayer_Layer : int = 23;

@Space(30)
var cameraShakiness : Shakiness;

@Space(30)
var allDoors : OpenDoor[];
var lastDoorCheck : float;
var checkNoSoonerThan : float = 3.0;




function Start () {
	if(isGrounded == null) 		isGrounded = transform.parent.gameObject.GetComponentInChildren(IsGrounded);
	if(sideMovement == null)	sideMovement = transform.parent.gameObject.GetComponentInChildren(SideMovement);
	if(controller == null) 		controller = transform.parent.gameObject.GetComponentInChildren(ControllerInput);
	if(underWater == null) 		underWater = transform.parent.gameObject.GetComponentInChildren(UnderWater);
	if(rb == null) 				rb = transform.parent.GetComponentInChildren(Rigidbody);
	if(pickRB == null) 			pickRB = transform.parent.gameObject.GetComponentInChildren(PickUpRigidbody);
	if(animComp == null) 		animComp = transform.parent.gameObject.GetComponentInChildren(Animation);
	if(stamina == null) 		stamina = transform.parent.gameObject.GetComponentInChildren(Stamina);

	// attackPower is overwritten from these on every swing, so scale the sources.
	// Was 1.1, now taken to 90% of that.
	attackPowerPunch *= 0.99;
	attackPowerKick *= 0.99;
	attackPowerUppercut *= 0.99;
	attackPowerPunchRun *= 0.99;

	importantID = new Array();
	GetAllEnemies();
	
	if(Camera.main.transform.parent != null){
		cameraShakiness = Camera.main.transform.parent.GetComponent(Shakiness);
	}
}

function FixedUpdate(){
    //Input.
    if(!lockAttack && controller.inputButtonA.down && Time.time > disableUntil && disablingWeightCombined < maxWeightAllowed){
    	lockAttack = true;
    	controller.inputButtonA.lastDownTime = Time.time;

    	FindNearestEnemyInFront();

    	var picking : boolean;
    	var doorInFront : boolean;

    	if(!importantEnemy){ //Only check if there's no important enemies. (If there's an enemy, attack)
	    	if(pickRB != null){
	    		if(pickRB.PickUpCheck() || pickRB.isPickingUp){
	    			picking = true;
	    		}
	    	}

	    	if(allDoors == null || allDoors != null && allDoors.Length == 0|| Time.time > lastDoorCheck + checkNoSoonerThan){
	    		lastDoorCheck = Time.time; 
	    		allDoors = GameObject.FindObjectsOfType.<OpenDoor>();
	    	}
	    	for(var i = 0; i < allDoors.Length; i++){
	    		if(allDoors[i].OpenCheck()){
	    			doorInFront = true;
	    			break;
	    		}
	    	}
    	}


    	if(!picking && !doorInFront){
    		forceApplied = false;
	    	performAttack = true;
	    	pickRB.Drop();

	    	if(!lockPunch){
		    	if(!isGrounded.isGrounded ){
		    		airKick = true;
		    	}
		    	else{
		    		airKick = false;
		    	}

		    	if(airKick){
		    		kick = true;	
		    	}
	    	}
        }
    }
}

function LateUpdate () {
	if(upperCutBar > 0){
		upperCutBar -= Time.deltaTime;
	}
	else{
		upperCutBar = 0;
	}

	
	if(isGrounded.isGrounded || underWater.isUnderwater.current){
		airKick = false;
	}

	if(disableIfHurt && characterHurt.hurt.toggledTrue){
		disableUntil = Time.time + disableDuration;
	}	
	
	if(performAttack){
		attacking.current = true;
		performAttack = false;
	}

	attacking.Update();

	if(attacking.toggledTrue){
		enemyID = 0;
		checkEnemies = false;

		if(!lockPunch){
			if(upperCutBar > activateUpperCutOn || controller.inputAxis.current.y < -0.5){
				upperCut = true;
				upperCutBar = 0.0;
				disableFireballUntil = Time.time + 1.0;
			}
			else{
				upperCut = false;
			}
		}
		
		if(isGrounded.isGrounded  && Mathf.Abs(rb.velocity.x) > punchRunVel){
			punchRun = true;
			
		} 
		
		//Apply force time
		if(upperCut){
			applyForceTime = applyForceTimeUppercut;
		}
		else{
			if(kick){
				applyForceTime = applyForceTimeKick;
			}
			else{
				if(punchRun){
					applyForceTime = applyForceTimePunchRun;
					
				}
				else{
					applyForceTime = applyForceTimePunch;
				}
			}
		}
		
		//AttackPower
		if(upperCut){
			attackPower = attackPowerUppercut;
			pushSpeed = pushSpeed_Uppercut;
		}
		else{
			if(kick){
				attackPower = attackPowerKick;
				pushSpeed = pushSpeed_Kick;
			}
			else{
				if(punchRun){
					attackPower = attackPowerPunchRun;
					pushSpeed = pushSpeed_PunchRun;
				}
				else{
					attackPower = attackPowerPunch;
					pushSpeed = pushSpeed_Punch;
				}
			}
		}

		if(lockPunch){
			upperCut = false;
			kick = false;
		}

		if(upperCut){
			upperCutAnimation.Play();//upperCutAnimation.animationPlay.current = true;
			lastAttackDuration = upperCutDuration;
		}
		else{
			if(!kick){
				if(punchRun){
					punchRunAnimation.Play();//punchRunAnimation.animationPlay.current = true;
					sideMovement.forceSkidUntil = Time.time + .5;
					lastAttackDuration = punchRunDuration;
				}
				else{
					punchAnimation.Play();//punchAnimation.animationPlay.current = true;
					lastAttackDuration = punchDuration;
				}
				
			}
			if(kick){
				kickAnimation.Play();//kickAnimation.animationPlay.current = true;
				lastAttackDuration = kickDuration;
			}

			kick = !kick;
			
			upperCutBar += upperCutBarAdd;
		}
		
		//Each hit of a chain resolves sooner than the last, but never before this swing's force lands.
		var comboMul : float = Mathf.Pow(comboSpeedStep, comboStep);
		if(comboMul < comboFloorMul) comboMul = comboFloorMul;
		lastAttackDuration *= comboMul;
		if(lastAttackDuration < applyForceTime + comboHitMargin) lastAttackDuration = applyForceTime + comboHitMargin;
		comboStep++;
		
		//performAttack = false;
		lastAttackTime = Time.time;
	}

	if(Time.time > lastAttackTime + secondaryAttackDuration){
		kick = false;
		comboStep = 0;
	}

	if(Time.time > lastAttackTime + lastAttackDuration){;
		attacking.current = false;
		fireballThrown = false;
		lockAttack = false;
	}

	if(useFrameGroups){
		if(attacking.current){
			frameGroups.SetFrame("Right Leg", "Side");
			if(kick || upperCut) frameGroups.SetFrame("Eyes", "Closed");
			else frameGroups.SetFrame("Mouth", "Angry");
		}
		if(attacking.toggledFalse){
			frameGroups.SetFrame("Eyes", "Open");
			frameGroups.SetFrame("Mouth", "Closed");
		}
	}
	
	//Attack Effect
	if(attacking.current && Time.time > lastAttackTime + applyForceTime && disablingWeightCombined < maxWeightAllowed){
		//Fireball
		if(throwFireball && !fireballThrown && Time.time > disableFireballUntil){
			
			fireballThrown = true;
			var newFireball : GameObject = GameObject.Instantiate(fireballPrefab);
			var newFireballPosition : Vector3 = transform.position + Vector3(fireballPosition.x * -sideMovement.currentSide, fireballPosition.y, fireballPosition.z);
			newFireball.transform.position = newFireballPosition;
			var fireballRB : Rigidbody = newFireball.GetComponent.<Rigidbody>();
			var applySpeed : Vector3;
			if(controller.inputAxis.current.y > .5){
				applySpeed = Vector3(fireballSpeed.x * -sideMovement.currentSide * fireball_UpXMul, fireballSpeed.y * fireball_UpYMul,0);
			}
			else{
				applySpeed = Vector3(fireballSpeed.x * -sideMovement.currentSide, fireballSpeed.y,0);
			}
			
			applySpeed.x += rb.velocity.x;
			
			fireballRB.velocity = applySpeed;
			var fireballScript : Fireball = newFireball.GetComponent.<Fireball>();
			fireballScript.AddIgnore(transform.parent);
			fireballScript.targetDestroyDist = fireballRange;
			disableFireballUntil = Time.time + disableFireballDuration;
			fireballScript.inflictDamage  = fireballDamage;

			newFireball.layer = dontCollideWPlayer_Layer;


			var cats : GameObject[] = GameObject.FindGameObjectsWithTag(catTag);
			for(var catID : int = 0; catID < cats.Length; catID ++){
				fireballScript.AddIgnore(cats[catID].transform);
			}
		}
		
		//Hit
		if(!forceApplied){
			forceApplied = true;

			if(!checkEnemies){
				FindNearestEnemyInFront();
				checkEnemies = true;
			}

			if(enemyID + 1 < attackTargets.Length){
				lastAttackTime = Time.time;
				applyForceTime = hitTimeSeparation;
				forceApplied = false;
			}
			 

			if(attackTargets != null && enemyID < attackTargets.Length && attackTargets[enemyID] != null){
				if(upperCut || punchRun){
					cameraShakiness.lowQuake = true;
				}

				//Push
				var tgtRB : Rigidbody = attackTargets[enemyID].GetComponent.<Rigidbody>();
				if(tgtRB != null){
					var playerCenter : Vector3 = transform.position 
					+ Vector3(attackCenterOffset.x * sideMovement.currentSide, attackCenterOffset.y, attackCenterOffset.z);
					
					applySpeed = Vector3(pushSpeed.x * -sideMovement.currentSide, pushSpeed.y,0);
					if(IsBeeTarget(attackTargets[enemyID])){
						//Two rounds of +25%, so 1.25 * 1.25.
						applySpeed.x *= 1.5625;
					}
					else{
						//Shove everything else aside so fighting does not block movement.
						applySpeed.x *= pushMul;
					}

					PhysicsUtility.ApplyForceForVelocity(tgtRB, applySpeed, pushForce);
				}
				
				//Smoke.
				var newSmokePosition : Vector3 = transform.position + Vector3(smokePosition.x * -sideMovement.currentSide, smokePosition.y, smokePosition.z);
				var newSmoke : Transform = Instantiate(smokePrefab, newSmokePosition, Quaternion.identity);
				//var newSmoke : Transform =  pMngr.Create(ObjType.Smoke, newSmokePosition, Quaternion.identity).transform;
				
				//Punch Hit.
				var newPunchHitEffectPosition : Vector3 = 
				transform.position + Vector3(punchHitEffectPosition.x * -sideMovement.currentSide, punchHitEffectPosition.y, punchHitEffectPosition.z);
				var newPunchHitEffect : Transform = Instantiate(punchHitEffectPrefab, newPunchHitEffectPosition, Quaternion.identity);		
				//var newPunchHitEffect : Transform =  pMngr.Create(ObjType.PunchEffect, newPunchHitEffectPosition, Quaternion.identity).transform;	
				newPunchHitEffect.localScale.x *= sideMovement.currentSide;
				
				var targetSideMovement : SideMovement = attackTargets[enemyID].GetComponent(SideMovement);
				var targetJumpSwim : JumpSwim = attackTargets[enemyID].GetComponent(JumpSwim);
				var targetAttackAI : BasicAttackAI = attackTargets[enemyID].GetComponent(BasicAttackAI);
				
				if(targetSideMovement != null) targetSideMovement.disableMovementUntil = Time.time + enemyDisableMovementTime;
				if(targetJumpSwim != null) targetJumpSwim.disableJumpUntil = Time.time + enemyDisableMovementTime;
				if(targetAttackAI != null) targetAttackAI.disableUntil = Time.time + enemyDisableMovementTime;
				
				//Affect health.

				var health : Health = attackTargets[enemyID].gameObject.GetComponentInChildren.<Health>();
				if( health != null){
					staminaFactor = 1.0;
					if(stamina != null && useStaminaEffect){
						staminaFactor = stamina.stamina / stamina.maxStamina;
						staminaFactor = Mathf.Max(staminaFactor, minStaminaF);
					}
					health.health -= Mathf.Max(0,attackPower * staminaFactor - (multEnem_ReducePower * enemyID));
					health.healthLossText_ManualSide = true;
					health.healthLossText_Side = -Mathf.Sign(transform.parent.localScale.x);
				}
				
				//Hurt animation.
				var hurt : Hurt = attackTargets[enemyID].gameObject.GetComponentInChildren(Hurt);
				if(hurt != null){
					hurt.hurt.current = true;
				}
				
				//Force to drop picking obj
				var pickRBEnemy : PickUpRigidbody = attackTargets[enemyID].gameObject.GetComponentInChildren(PickUpRigidbody);
				if(pickRBEnemy != null){
					if(pickRBEnemy.isPickingUp && !pickRBEnemy.grabTight){
						pickRBEnemy.Drop();
					}
				}
			}

			enemyID ++;
		}

		//Punch Run increase vel;
		if(punchRun){
			punchRun = false; 
			rb.velocity.x -= addPunchRunVel * sideMovement.currentSide;
		}

	}
	
	disablingWeightCombined = 0;
	if(animComp != null && disablingAnimations != null){
		for(var i = 0; i < disablingAnimations.Length; i++){
			disablingWeightCombined += animComp[disablingAnimations[i].name].weight;
		}
	}
}


function FindNearestEnemyInFront(){
	if(allEnemies == null || Time.time > getAllEnemies_LastTime + disableGetEnemiesDuration){
		GetAllEnemies();
		getAllEnemies_LastTime = Time.time;
	}

	importantEnemy = false;

	//attackTargets = null;
	var attackTargetArray : Array = new Array();
	var attackTargetArray_Dist : Array = new Array();

	var enemyCount : int;

	for(var i = 0; i < allEnemies.Length; i++){
		if(allEnemies[i] == null){
			continue;
		}

		var thisEnemySide : int = Mathf.Sign(transform.position.x - allEnemies[i].transform.position.x);
		if(thisEnemySide == sideMovement.currentSide){
			//Get Distance
			var targetDistance : float;

			var useAttackBone : Transform;
			if(attackBone != null){
				useAttackBone = attackBone;
			}
			else{
				useAttackBone = transform;
			}

			var playerCenter : Vector3 = useAttackBone.position 
			+ Vector3(attackCenterOffset.x * sideMovement.currentSide, attackCenterOffset.y, attackCenterOffset.z);
			
			var enemyCenter : EnemyCenter = allEnemies[i].GetComponentInChildren(EnemyCenter);

			var targetPosition : Vector3;
			if(enemyCenter != null){
				targetPosition = enemyCenter.targetBone.position;
			}
			else{
				targetPosition = allEnemies[i].transform.position;
			}

			//Count vertical distance as less than it is, so the hit box reaches further up than down.
			var toTarget : Vector3 = targetPosition - playerCenter;
			if(toTarget.y > 0) toTarget.y /= verticalReachUp;
			else toTarget.y /= verticalReachDown;

			targetDistance = toTarget.magnitude;

			//Add if in range. Rats count as a bigger target so the punch does not have to land on a point.
			var hitRange : float = attackRange + rb.velocity.magnitude * velocityIncreaseRange;
			if(IsRatTarget(allEnemies[i].transform)){
				hitRange *= ratHitboxMul;
			}

			if(targetDistance < hitRange){
				attackTargetArray.Add(allEnemies[i].transform);
				attackTargetArray_Dist.Add(targetDistance);
				enemyCount ++;

				if(!importantEnemy){
					for(var n = 0; n < importantID.length; n++){
						var thisImporantID : int = importantID[n];
						if(thisImporantID == i){
							importantEnemy = true;
						}
					}
				}

				if(enemyCount > maxMultipleHit){
					break;
				}
			}
		}
	}

	//Sort by dist
	i = 0;
	for(i = 0; i < attackTargetArray.length - 1; i++){
		var thisDist : float = attackTargetArray_Dist[i];
		var nextDist : float = attackTargetArray_Dist[i+1];
		if(thisDist > nextDist){
			var thisEnemy : Transform = attackTargetArray[i];
			var nextEnemy : Transform = attackTargetArray[i+1];
			attackTargetArray[i+1] = thisEnemy;
			attackTargetArray[i] = nextEnemy;
			attackTargetArray_Dist[i+1] = thisDist;
			attackTargetArray_Dist[i] = nextDist;
			i = 0;
		}
	}

	attackTargets = attackTargetArray.ToBuiltin(Transform);
}

function GetAllEnemies(){
	if(importantID == null){
		importantID = new Array();
	}

	importantID.Clear();

	allEnemies = GameObject.FindGameObjectsWithTag(enemyTag);
	for(var i = 0; i < allEnemies. Length; i++){
		var noThreat : boolean;
		if(allEnemies[i].transform.childCount > 0){
			if(allEnemies[i].transform.GetChild(0).tag == noThreatTag){
				noThreat = true;
			}
		}

		if(!noThreat){
			importantID.Add(i);
		}

		allEnemies[i] = allEnemies[i].transform.parent.gameObject;
	}
}

function IsRatTarget(t : Transform) : boolean {
	var p : Transform = t;
	while(p != null){
		if(p.name.ToLower().Contains("rat")){
			return true;
		}
		p = p.parent;
	}
	return false;
}

function IsBeeTarget(t : Transform) : boolean {
	var p : Transform = t;
	while(p != null){
		if(p.tag == "Bee"){
			return true;
		}
		p = p.parent;
	}
	return false;
}
