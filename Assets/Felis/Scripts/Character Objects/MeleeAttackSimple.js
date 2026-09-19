#pragma strict

var animComp : Animation;
var isGrounded : IsGrounded;
var sideMovement : SideMovement;
var wingedFlight : WingedFlight;
var input : ControllerInput;
var attackAnimation : PlayStillAnimation;
var frameGroups : UVFrameGroups;
var stamina : Stamina;

var allEnemies : GameObject[];
var enemyTag : String = "Enemy";
var enemyTags : String[];
var attackTarget : Transform;
var attackRange : float;

var performAttack : boolean;
var onlyOnGround : boolean;
var attacking : ToggleBoolean;
var lastAttackTime : float;

var applyForceTime : float;
var pushSpeed : Vector2 = Vector2(10,2);
var pushForce : float = 50;
var forceApplied : boolean;
var enemyDisableMovementTime : float;
var makeTargetSick : boolean;

var disableUntil : float;

var useFrameGroups : boolean;

var smokePrefab : Transform;
var smokePosition : Vector3;

var useAttackBone : Transform;

var punchHitEffectPrefab : Transform;
var punchHitEffectPosition : Vector3;

var attackPower : float;
private var attackPowerMul : float = 1.3;
private var ratPunchRangeMul : float = 1.4; //How far a rat punch can still connect.
private var bearPunchRangeMul : float = 2.88; //1.6 * 1.8 of the previous connect range.
var staminaFactor : float;
var minStaminaFactor : float = .3;

var disableIfHurt : boolean;
var disableDuration : float;
var characterHurt : Hurt;

//Sometimes some non attacking animations are played over the attack animation. If this happens, it looks
//bad that the attack still takes effect.
var disablingAnimations : AnimationClip[]; 
var disablingWeightCombined : float;
var maxWeightAllowed : float = .2;

var applyQuake : boolean;
var cameraShakiness : Shakiness;

var hitSounds : AudioSource[];

var getEnemiesTimer : Timer;

var buttonA : boolean;

var debug : boolean;

var groundQuake : boolean;
var groundQuake_Used : boolean;
var groundQuake_Radius : float = 5.0;
var groundQuake_Speed : float = 5.0;

var dodgedL_Prefab : GameObject;
var dodgedR_Prefab : GameObject;
var dodgeText_Offset : Vector3 = Vector3(.5,.6,1);
var dodgeText_DisableDuration : float = .5;
var lastDodgeTextTime : float;

function LoadResources(){
	if(dodgedL_Prefab == null){
		dodgedL_Prefab = Resources.Load("Prefabs/GUI/Dodged Text L", GameObject);
	}
	if(dodgedR_Prefab == null){
		dodgedR_Prefab = Resources.Load("Prefabs/GUI/Dodged Text R", GameObject);
	}
}

function Start () {
	LoadResources();

	//Enemy strikes hit harder. The player swings through MeleeAttack.js, so it is left alone.
	if(transform.root.tag != "Player"){
		attackPower *= attackPowerMul;
		attackRange *= EnemyPunchRangeMul();
	}

		if(animComp == null) animComp = transform.parent.GetComponentInChildren(Animation);
		if(isGrounded == null) isGrounded = transform.parent.GetComponentInChildren(IsGrounded);
		if(sideMovement == null) sideMovement = transform.parent.GetComponentInChildren(SideMovement);
		if(wingedFlight == null) wingedFlight = transform.parent.GetComponentInChildren.<WingedFlight>();
		if(input == null) input = transform.parent.GetComponentInChildren(ControllerInput);
		if(attackAnimation == null) attackAnimation = GetComponent(PlayStillAnimation);
		if(characterHurt == null) characterHurt = transform.parent.GetComponentInChildren(Hurt);
		if(stamina == null) stamina = transform.parent.gameObject.GetComponentInChildren(Stamina);

		if(useFrameGroups){
			frameGroups = transform.parent.GetComponentInChildren(UVFrameGroups);
		}

	GetAllEnemies();
	
	if(Camera.main.transform.parent != null){
		cameraShakiness = Camera.main.transform.parent.GetComponent(Shakiness);
	}
	
	if(getEnemiesTimer.every == 0.0){
		getEnemiesTimer.every = 2.0;
	}
}

function LateUpdate () {
	buttonA = input.inputButtonA.down;

	getEnemiesTimer.Update();
	if(getEnemiesTimer.current){
		GetAllEnemies();	
	}
	
	//Input.
	if(!attacking.current && buttonA && Time.time > disableUntil && disablingWeightCombined < maxWeightAllowed){
		if(isGrounded.isGrounded){
			performAttack = true;
			groundQuake_Used = false;
		}
	}
	
	if(characterHurt != null && disableIfHurt && characterHurt.hurt.toggledTrue){
		disableUntil = Time.time + disableDuration;
	}
	
	if(performAttack && Time.time ){
		performAttack = false;
		if(Time.time > disableUntil){
			if(onlyOnGround && isGrounded.isGrounded || !onlyOnGround){
				attacking.current = true;
			}
		}
	}
	
	if(attackAnimation.animationPlay.toggledFalse){
		attacking.current = false;
		forceApplied = false;
	}
	
	
	attacking.Update();
	
	if(attacking.toggledTrue){
		attackAnimation.animationPlay.current = true;
		lastAttackTime = Time.time;
	}
	
	if(useFrameGroups){
		if(attacking.current){
			frameGroups.SetFrame("Right Leg", "Side");
			frameGroups.SetFrame("Mouth", "Angry");
		}
	}

	if(attacking.current){
		if(groundQuake && !groundQuake_Used && Time.time > lastAttackTime + applyForceTime && allEnemies != null){
			groundQuake_Used = true;
			for(var n = 0; n < allEnemies.Length; n++){
				if(allEnemies[n] == null){
					continue;
				}
				var enemyRB : Rigidbody = allEnemies[n].GetComponentInChildren.<Rigidbody>();
				if(enemyRB != null){
					var enemyIG : IsGrounded = allEnemies[n].GetComponentInChildren.<IsGrounded>();
					if(enemyIG != null && enemyIG.isGrounded){
						var enemyDist : float = Vector3.Distance(transform.position, allEnemies[n].transform.position);
						enemyRB.velocity.y += groundQuake_Speed * (Mathf.Max(0, groundQuake_Radius - enemyDist) / groundQuake_Radius);
					}
				}
			}
		}
	}
	//Push force.
	
	if(!forceApplied && attacking.current && Time.time > lastAttackTime + applyForceTime && Time.time > disableUntil && disablingWeightCombined < maxWeightAllowed){
		if(applyQuake && cameraShakiness != null){
			cameraShakiness.highQuake = true;
		}

		FindNearestEnemyInFront();

		if(attackTarget != null){
			var targetDistance : float;
			
			if(useAttackBone != null){
				targetDistance = Vector3.Distance(useAttackBone.position, attackTarget.position);
				if(debug) Debug.DrawLine(useAttackBone.position, attackTarget.position, Color.yellow, 2.0);
			}
			else{
				targetDistance = Vector3.Distance(transform.position, attackTarget.position);
				if(debug) Debug.DrawLine(transform.position, attackTarget.position, Color.yellow, 2.0);
			}

			if(targetDistance < attackRange){
				var currentSide : int = CurrentSide();

				var targetRB : Rigidbody = attackTarget.GetComponent.<Rigidbody>();
				if(targetRB != null){
					PhysicsUtility.ApplyForceForVelocity(targetRB, Vector3(pushSpeed.x * -currentSide, pushSpeed.y,0), pushForce);
				}

				//Smoke.
				var newSmokePosition : Vector3 = transform.position + Vector3(smokePosition.x * -currentSide, smokePosition.y, smokePosition.z);
				var newSmoke : Transform = Instantiate(smokePrefab, newSmokePosition, Quaternion.identity);

				//Punch Hit.
				var newPunchHitEffectPosition : Vector3 = 
				transform.position + Vector3(punchHitEffectPosition.x * -currentSide, punchHitEffectPosition.y, punchHitEffectPosition.z);
				var newPunchHitEffect : Transform = Instantiate(punchHitEffectPrefab, newPunchHitEffectPosition, Quaternion.identity);		
				newPunchHitEffect.localScale.x *= currentSide;
				
				var targetSideMovement : SideMovement = attackTarget.GetComponent(SideMovement);
				var targetJumpSwim : JumpSwim = attackTarget.GetComponent(JumpSwim);
				var targetAttackAI : BasicAttackAI = attackTarget.GetComponent(BasicAttackAI);
				
				if(targetSideMovement != null) targetSideMovement.disableMovementUntil = Time.time + enemyDisableMovementTime;
				if(targetJumpSwim != null) targetJumpSwim.disableJumpUntil = Time.time + enemyDisableMovementTime;
				if(targetAttackAI != null) targetAttackAI.disableUntil = Time.time + enemyDisableMovementTime;
				
				//Affect health.
				var healthComp : Health = attackTarget.gameObject.GetComponentInChildren(Health);
				staminaFactor = 1.0;
				if(stamina != null){
					staminaFactor = stamina.stamina / stamina.maxStamina;
					staminaFactor = Mathf.Max(staminaFactor, minStaminaFactor);
				}
				healthComp.health -= attackPower * staminaFactor;

				//Hurt animation.
				var hurt : Hurt = attackTarget.gameObject.GetComponentInChildren(Hurt);
				if(hurt != null){
					hurt.hurt.current = true;
				}
				
				//Sound.
				if(hitSounds != null && hitSounds.Length > 0){
					hitSounds[Random.value * hitSounds.Length].Play();
				}
				
				//Make target sick
				if(makeTargetSick){
					healthComp.sick.current = true;
				}



			}
		}
		forceApplied = true;
	}
	
	disablingWeightCombined = 0;
	if(animComp != null){
		for(var i = 0; i < disablingAnimations.Length; i++){
			disablingWeightCombined += animComp[disablingAnimations[i].name].weight;
		}
	}
}

function SetAnimComp(newAnimComp : Animation){
	animComp = newAnimComp;
}

function FindNearestEnemyInFront(){
	attackTarget = null;
	for(var i = 0; i < allEnemies.Length; i++){
		if(allEnemies[i] == null){
			continue;
		}

		var thisEnemySide : int = Mathf.Sign(transform.position.x - allEnemies[i].transform.position.x);
		var currentSide : int = CurrentSide();

		//Crouch dodge
		var crouch : Crouch = allEnemies[i].GetComponentInChildren.<Crouch>();
		if(crouch != null){
			if(Time.time > lastDodgeTextTime + dodgeText_DisableDuration && crouch.crouching.current && Time.time < crouch.crouching.toggledTrueTime + crouch.crouchDodgeDuration){
				/*if(allEnemies[i].transform.parent == null){
					var enemySide : int = Mathf.Sign(allEnemies[i].transform.localScale.x);
				}
				else{
					enemySide = Mathf.Sign(allEnemies[i].transform.parent.localScale.x);
				}*/
				var newDodgeText : GameObject;
				if(thisEnemySide > 0){
					newDodgeText = GameObject.Instantiate(dodgedR_Prefab);
				}
				else{
					newDodgeText = GameObject.Instantiate(dodgedL_Prefab);
				}
				newDodgeText.transform.position = allEnemies[i].transform.position + Vector3(dodgeText_Offset.x * thisEnemySide, dodgeText_Offset.y, dodgeText_Offset.z);

				continue;
			}
		}


		/*if(sideMovement != null) currentSide = sideMovement.currentSide;
		else currentSide = Mathf.Sign(transform.parent.localScale.x);*/
		
		if(thisEnemySide == currentSide){
			
			//Same side.
			var targetDistance : float;
			if(useAttackBone != null){
				targetDistance = Vector3.Distance(useAttackBone.position, allEnemies[i].transform.position);
				if(debug) Debug.DrawLine(useAttackBone.position, allEnemies[i].transform.position, Color.red, 2.0);
			}
			else{
				targetDistance = Vector3.Distance(transform.position, allEnemies[i].transform.position);
				if(debug) Debug.DrawLine(transform.position, allEnemies[i].transform.position, Color.red, 2.0);
			}
			
			if(targetDistance < attackRange){

				//In range.
				if(attackTarget == null){
					attackTarget = allEnemies[i].transform; //No other enemy.
				}
				else{
					if(targetDistance < Vector3.Distance(attackTarget.transform.position, transform.position)){
						//closer than current enemy.
						attackTarget = allEnemies[i].transform;
					}
				}
			}
		}
	}
	
}

function CurrentSide(){
	var currentSide : int;
	if(sideMovement != null){
		currentSide = sideMovement.currentSide;
	}
	else{
		if(wingedFlight != null){
			currentSide = wingedFlight.side;
		}
		else{
			currentSide = Mathf.Sign(transform.parent.localScale.x);
		}
	}

	return currentSide;
}

	
function GetAllEnemies(){
	allEnemies = GameObject.FindGameObjectsWithTag(enemyTag);

	var enemyArray : Array = new Array();

	for(var n = 0; n < allEnemies.Length; n++){
		enemyArray.Push(allEnemies[n]);
	}		

	if(enemyTags != null){
		for(n = 0; n < enemyTags.Length; n++){
			var thisTagObjs : GameObject[] = GameObject.FindGameObjectsWithTag(enemyTags[n]) as GameObject[];
			for(var i = 0; i < thisTagObjs.Length; i++){
				enemyArray.Push(thisTagObjs[i]);
			}
		}

	}

	allEnemies = enemyArray.ToBuiltin(GameObject) as GameObject[];
}

function EnemyPunchRangeMul() : float {
	if(EnemyNameHas("bear")) return bearPunchRangeMul;
	if(EnemyNameHas("rat")) return ratPunchRangeMul;
	return 1.0;
}

function EnemyNameHas(needle : String) : boolean {
	var n : String = needle.ToLower();
	var p : Transform = transform;
	while(p != null){
		if(p.name.ToLower().Contains(n)) return true;
		p = p.parent;
	}
	var start : Transform = (transform.parent != null) ? transform.parent : transform;
	var kids : Component[] = start.GetComponentsInChildren(Transform);
	for(var i = 0; i < kids.Length; i++){
		if(kids[i].name.ToLower().Contains(n)) return true;
	}
	return false;
}