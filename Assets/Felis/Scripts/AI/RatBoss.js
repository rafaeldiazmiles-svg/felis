#pragma strict

var getPlayerByTag : boolean = true;
var playerTag : String = "Player";
var player : Transform;
var playerHealth : Health;

var currentStage : RatBoss_Stages;
var previousStage : RatBoss_Stages;
var changedStage : boolean;
enum RatBoss_Stages{WaitingPlayer, AttackingPlayer, StealingCat, DisableAI}

var autoFindComponents : boolean = true;
var controller : ControllerInput;
var movementAI : MovementAI;
var sideMovement : SideMovement;
var jumpSwim : JumpSwim;
var ratRigidbody : Rigidbody;
var pickUpRB : PickUpRigidbody;
var meleeAttack : MeleeAttackSimple;
var characterHurt : Hurt;

var maxVerticalDistance : float = 3;

var waitingPlayerPosition : Transform;
var waitingPlayerPosition_Lock : boolean;
var playerAttackRange : float = 5.0;
var stopVelocity : float = .1;

var defaultSide : float = -1;
var delayAttack : float;
private var attackDelayMul : float = 0.48;
private var minAttackDelay : float = 0.3;
private var ratAttackSpeedMul : float = 1.2; //Rat Boss only.
private var bearAttackSpeedMul : float = 1.6; //Level 2 bear: same idea, punchier cadence.
var attackTimeLeft : float;
var playerInFront : boolean;
var playerDistance : float;
var playerSide : float;
var attackDistance : float;
var playerEscapeRange : float = 6.0;
var playerFirstDetected : boolean;
var playerFirstDetectTime : float;
var focusOnPlayerDuration : float = 3.0;

var detectRange : float = 5.0;
var receivedFirstHit : boolean;
var allCats : Transform[];
var catTag : String = "Cat";
var closestCat : Transform;
var closestCatDistance : float;
var closestCatSide : float;
var catEscapeRange : float = 6.0;
var pickUpDistance : float = 1.0;
var hasTheCat : ToggleBoolean;
var escapeLocation : Transform[];
var currentEscapeLocation : int;
var waitDuration : float = 0.5;
var cageTag : String = "Cage";

var escapeLocationSide : int;
var tooLongOnTargetDuration : float = 1.5;
var forceFleeDistance : float = 1.0;

var gotAngry : boolean;
var gotAngryRestoreDelay : float = 5.0;
var angryAnim : PlayStillAnimation;

var eatCatAnim : PlayStillAnimation;
var eatCatDelay : float = 1.0;
var holdingCatCounter : float;
var eatingCat : boolean;
var catEatDestroyDelay : float = .6;
var disableEatingCatUntil : float;
var disableEatingDuration : float = 2.0;

var eatCatPrefab : GameObject;

var raiseBackDoor : boolean;
//var raiseScript : RaiseBackObject;

var debug : boolean;

var getTimer : Timer;

function SetDefaultSide(newSide : int){
	defaultSide = newSide;
}

function LockWaitPlayerPos(){
	waitingPlayerPosition_Lock = true;
}

function GetCats(){
	var catTags : GameObject[] = GameObject.FindGameObjectsWithTag(catTag);
	allCats = new Transform[catTags.Length];
	for(var i = 0; i < catTags.Length; i++){
		allCats[i] = catTags[i].transform;
	}
	//Debug.Log(Time.time);
}

function Start () {
	if(getTimer.every == 0.0){
		getTimer.every = 2.0;
	}

	if(delayAttack > 0.0){
		delayAttack *= attackDelayMul;
		var attackFloor : float = minAttackDelay;
		if(LooksLikeBear()){
			delayAttack /= bearAttackSpeedMul;
			attackFloor /= bearAttackSpeedMul;
		}
		else{
			delayAttack /= ratAttackSpeedMul;
			attackFloor /= ratAttackSpeedMul;
		}
		if(delayAttack < attackFloor) delayAttack = attackFloor;
	}

	if(getPlayerByTag){
		GetPlayer();
		//player = GameObject.FindGameObjectWithTag(playerTag).transform;
		//playerHealth = player.GetComponentInChildren(Health);
	}
	
	if(autoFindComponents){
		controller  = transform.parent.GetComponentInChildren(ControllerInput);
		movementAI = transform.parent.GetComponentInChildren(MovementAI);
		sideMovement = transform.parent.GetComponentInChildren(SideMovement);
		jumpSwim = transform.parent.GetComponentInChildren(JumpSwim);
		ratRigidbody = transform.parent.GetComponentInChildren(Rigidbody);
		pickUpRB = transform.parent.GetComponentInChildren(PickUpRigidbody);
		meleeAttack = transform.parent.GetComponentInChildren(MeleeAttackSimple);
		characterHurt = transform.parent.GetComponentInChildren(Hurt);
	}
	
	if(raiseBackDoor){
		var allRaiseBack : RaiseBackObject[] = GameObject.FindObjectsOfType.<RaiseBackObject>();
		var closest : RaiseBackObject;
		var closestDist : float = Mathf.Infinity;
		for(var i = 0; i < allRaiseBack.Length; i ++){
			var thisDist : float = Vector3.Distance(transform.position, allRaiseBack[i].transform.position);
			if(thisDist < closestDist){
				closest = allRaiseBack[i];
				closestDist = thisDist;
			}
		}
		if(closest != null){
			closest.raiseBackOnDeath = transform.parent.GetComponentInChildren.<Health>();
		}
	}
	
	GetCats();
}

function GetPlayer(){
	var playerObj : GameObject = GameObject.FindGameObjectWithTag(playerTag);
	if(playerObj != null){
		player = playerObj.transform;
		playerHealth = playerObj.GetComponentInChildren(Health);	
	}
}

function Update () {
	if(player == null || playerHealth == null){
		getTimer.Update();
		if(getTimer.current){
			GetPlayer();	
		}
	}
		
	if(currentStage != previousStage){
		changedStage = true;
		previousStage = currentStage;
		//Debug.Log(Time.time);
	}
	else changedStage = false;
	
	if(player != null){
		playerDistance = Vector3.Distance(transform.position, player.position);
		playerSide = Mathf.Sign(transform.position.x - player.position.x );
	}
	
	escapeLocationSide = Mathf.Sign(transform.position.x - escapeLocation[currentEscapeLocation].position.x);
	
	if(characterHurt.hurt.current){
		eatingCat = false;
	}
	
	if(playerHealth == null){
		currentStage = RatBoss_Stages.WaitingPlayer;
	}
	
	switch (currentStage){
		case RatBoss_Stages.WaitingPlayer:
			if(Time.time > 	angryAnim.animationPlay.toggledTrueTime + gotAngryRestoreDelay){
				gotAngry = false;
			}	

			movementAI.target = null;
			if(waitingPlayerPosition_Lock){
				waitingPlayerPosition.position = transform.position;
			}
			movementAI.targetPosition = waitingPlayerPosition.position;
			movementAI.enableMovement = true;
			
			//Look at prospero when standing still.
			if(movementAI.onTarget.current && ratRigidbody.velocity.magnitude < stopVelocity){
				sideMovement.currentSide = defaultSide;
			}
			
			if(playerHealth != null){
				if(playerHealth.health > 0 && playerDistance < detectRange){
					if(!gotAngry){
						angryAnim.animationPlay.current = true;
						gotAngry = true;
					}
					else{
						if(!angryAnim.animationPlay.current){
							currentStage = RatBoss_Stages.AttackingPlayer;
						}
					}
				}
			}			
		break;
		
		case RatBoss_Stages.AttackingPlayer:
			if(changedStage){
				GetCats();
				movementAI.target = null;
				movementAI.enableMovement = true;
				attackTimeLeft = delayAttack;
				//Debug.Log(Time.time);
			}
			
			//Get close enough to attack.
			if(player != null){
				movementAI.targetPosition = player.position + Vector3(playerSide * attackDistance,0,0);
			}
			
			//Look at prospero when standing still.
			if(movementAI.onTarget.current && ratRigidbody.velocity.magnitude < stopVelocity){
				sideMovement.currentSide = playerSide;
			}
								
			//Attack player.
			playerInFront = false;
			if(playerSide == sideMovement.currentSide){
				if(playerDistance < playerAttackRange){
					if(!playerFirstDetected){
						playerFirstDetected = true;
						playerFirstDetectTime = Time.time;
					}		
		
					if(!meleeAttack.attacking.current){
						playerInFront = true;
		
					}
				}
			}
			
			if(playerInFront) attackTimeLeft -= Time.deltaTime; 
			else attackTimeLeft = Mathf.MoveTowards(attackTimeLeft, delayAttack, Time.deltaTime);
			
			if(attackTimeLeft < 0){
				attackTimeLeft = delayAttack;
				//meleeAttack.performAttack = true;
				controller.inputButtonA.pressed = true;
			}
			
			if(characterHurt.hurt.toggledTrue) receivedFirstHit = true;
			
			if(playerFirstDetected && Time.time > playerFirstDetectTime + focusOnPlayerDuration){
				GetClosestCat();
				
				if(closestCat != null){
					if(closestCatDistance < detectRange && closestCatDistance < playerDistance){
						currentStage = RatBoss_Stages.StealingCat;
					}
				}
			}
			
			if(playerDistance > playerEscapeRange || playerHealth.health <= 0){
				currentStage = RatBoss_Stages.WaitingPlayer;
			}
			
				

		break;
		
		case RatBoss_Stages.StealingCat:
			if(changedStage){
				movementAI.target = null;
				movementAI.enableMovement = true;
				GetCats();
				//Debug.Log(Time.time);
			}
			
			if(Time.time < disableEatingCatUntil){
				currentStage = RatBoss_Stages.AttackingPlayer;
				break;
			}
			
			if(!hasTheCat.current)	GetClosestCat();
			
			
			
			if(closestCat != null){
				closestCatSide = Mathf.Sign(transform.position.x - closestCat.position.x );
			
				if(closestCatDistance > catEscapeRange){
					currentStage = RatBoss_Stages.WaitingPlayer;
				}
				
				hasTheCat.current = false;
				if(pickUpRB.isPickingUp && pickUpRB.pickedObject != null && pickUpRB.pickedObject.transform.parent != null && pickUpRB.pickedObject.transform.parent == closestCat){
					hasTheCat.current = true;
				}
				
				if(pickUpRB.isPickingUp  && pickUpRB.pickedObject != null && pickUpRB.pickedObject.transform.tag == cageTag){
					sideMovement.currentSide = -closestCatSide;
					jumpSwim.disableJumpUntil = Time.time + .5;
					
					if(sideMovement.currentSide != closestCatSide){
						PressButton(controller.inputButtonA, 0.4, .2);
					}
				}
				
				if(!hasTheCat.current){
					movementAI.targetPosition = closestCat.position;
				
					if(closestCatDistance < pickUpDistance && sideMovement.currentSide == closestCatSide){
						PressButton(controller.inputButtonA, 1.0, .3);
					}
					
					holdingCatCounter = 0.0;
					
					if(playerDistance < closestCatDistance){
						currentStage = RatBoss_Stages.AttackingPlayer; 
					}
				}
				else{
					if(eatingCat && eatCatAnim.animationPlay.current && Time.time > eatCatAnim.animationPlay.toggledTrueTime + catEatDestroyDelay){
						Destroy(pickUpRB.pickedObject.character.gameObject);
						eatingCat = false;
						if(eatCatPrefab != null){
							var newEatCatPrefab : GameObject = Instantiate(eatCatPrefab);
							newEatCatPrefab.transform.position = pickUpRB.pickedObject.character.position;
						}
						disableEatingCatUntil = Time.time + disableEatingDuration;
					}
				
					holdingCatCounter += Time.deltaTime;
					if(holdingCatCounter < eatCatDelay){
						//Escape();
					}
					else{
						if(!eatingCat && Time.time > disableEatingCatUntil){
							eatCatAnim.animationPlay.current = true;
							eatingCat = true;
						}
					}
				}
			}
			else{
				currentStage = RatBoss_Stages.WaitingPlayer;
			}
			
			hasTheCat.Update();
			
			if(hasTheCat.toggledTrue || pickUpRB.justPickedUp){
				sideMovement.disableMovementUntil = Time.time + waitDuration;
				jumpSwim.disableJumpUntil = Time.time + waitDuration;
				pickUpRB.disableUntil = Time.time + waitDuration;
			}

		break;
		
		case RatBoss_Stages.DisableAI:
		
		break;
	}
	
	
}

function Escape(){
	movementAI.targetPosition = escapeLocation[currentEscapeLocation].position;

	if(movementAI.onTarget.toggledTrue || movementAI.onTarget.current && Time.time > movementAI.onTarget.toggledTrueTime + tooLongOnTargetDuration){
		sideMovement.disableMovementUntil = Time.time + waitDuration;
		jumpSwim.disableJumpUntil = Time.time + waitDuration;
			
		currentEscapeLocation++;
	}
	
	if(currentEscapeLocation >= escapeLocation.Length){
		currentEscapeLocation = 0;
	}
}

function PressButton(button : Button, cycle : float, range : float){
	//Debug.DrawRay(transform.position, Vector3.down + Vector3.right * 1, Color.white);
	if(Time.time % cycle < range){
		//Debug.DrawRay(transform.position, Vector3.down * 5, Color.blue);
		button.pressed = true;
	}
	else{
		button.pressed = false;
		//Debug.DrawRay(transform.position, Vector3.down * 2, Color.yellow);
	}
}

function LooksLikeBear() : boolean {
	var start : Transform = (transform.parent != null) ? transform.parent : transform;
	var p : Transform = start;
	while(p != null){
		if(p.name.ToLower().Contains("bear")) return true;
		p = p.parent;
	}
	var kids : Component[] = start.GetComponentsInChildren(Transform);
	for(var i = 0; i < kids.Length; i++){
		if(kids[i].name.ToLower().Contains("bear")) return true;
	}
	return false;
}

function ChangeDetectRange(newVal : float){
	detectRange = newVal;
}

function GetClosestCat(){
	if(closestCat != null){
		if(Mathf.Abs(transform.position.y - closestCat.position.y) > maxVerticalDistance)
			closestCat = null;
		else
			closestCatDistance = Mathf.Abs(transform.position.x - closestCat.position.x);	
	}
	
	if(closestCat == null)
		closestCatDistance = Mathf.Infinity;
		
	for(var i = 0; i < allCats.Length; i++){
		if(allCats[i] == null) continue;
		if(Mathf.Abs(transform.position.y - allCats[i].position.y) > maxVerticalDistance) continue;
		
		var catDistance : float = Mathf.Abs(transform.position.x - allCats[i].position.x);
		if(closestCat == null){
			closestCat = allCats[i];
			continue;
		}
		if(catDistance < closestCatDistance){
			closestCat = allCats[i];
		}
	}
}
