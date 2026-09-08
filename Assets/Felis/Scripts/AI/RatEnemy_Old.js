#pragma strict

var getPlayerByTag : boolean = true;
var playerTag : String = "Player";
var player : Transform;
var playerHealth : Health;

var currentStage : RatLVL1Enemy_Stages;
var previousStage : RatLVL1Enemy_Stages;
var changedStage : boolean;
enum RatLVL1Enemy_Stages{WaitingPlayer, AttackingPlayer, StealingCat, DisableAI}

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
var playerDetectRange : float;
var playerAttackRange : float = 5.0;
var stopVelocity : float = .1;

var delayAttack : float;
var attackTimeLeft : float;
var playerInFront : boolean;
var playerDistance : float;
var playerSide : float;
var attackDistance : float;
var playerEscapeRange : float = 6.0;
var playerFirstDetected : boolean;
var playerFirstDetectTime : float;
var focusOnPlayerDuration : float = 3.0;

var catDetectRange : float = 4.0;
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

function GetCats(){
	var catTags : GameObject[] = GameObject.FindGameObjectsWithTag(catTag);
	allCats = new Transform[catTags.Length];
	for(var i = 0; i < catTags.Length; i++){
		allCats[i] = catTags[i].transform;
	}
}

function Start () {
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
		GetPlayer();	
	}
	
	if(currentStage != previousStage) changedStage = true;
	else changedStage = false;
	
	switch (currentStage){
		case RatLVL1Enemy_Stages.WaitingPlayer:
			movementAI.target = null;
			movementAI.targetPosition = waitingPlayerPosition.position;
			movementAI.enableMovement = true;

			
			//Look at prospero when standing still.
			if(movementAI.onTarget.current && ratRigidbody.velocity.magnitude < stopVelocity){
				if(sideMovement.currentSide > 0){
					sideMovement.currentSide = -1;
				}
			}
			
			if(playerHealth != null && player != null && playerHealth.health > 0 && Vector3.Distance(transform.position, player.position) < playerDetectRange){
				currentStage = RatLVL1Enemy_Stages.AttackingPlayer;
			}

		break;
		
		case RatLVL1Enemy_Stages.AttackingPlayer:
			if(changedStage){
				movementAI.target = null;
				movementAI.enableMovement = true;
				attackTimeLeft = delayAttack;
			}
			
			if(player != null){
				playerDistance = Vector3.Distance(transform.position, player.position);
				playerSide = Mathf.Sign(transform.position.x - player.position.x );
			
			
				//Get close enough to attack.
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
				meleeAttack.performAttack = true;
			}
			
			if(characterHurt.hurt.toggledTrue) receivedFirstHit = true;
			
			if(playerFirstDetected && Time.time > playerFirstDetectTime + focusOnPlayerDuration){
				GetClosestCat();
				
				if(closestCat != null){
					if(closestCatDistance < catDetectRange){
						currentStage = RatLVL1Enemy_Stages.StealingCat;
					}
				}
			}
			
			if(playerHealth != null && playerDistance > playerEscapeRange || playerHealth.health <= 0){
				currentStage = currentStage = RatLVL1Enemy_Stages.WaitingPlayer;
			}
					
		break;
		
		case RatLVL1Enemy_Stages.StealingCat:
			if(changedStage){
				movementAI.target = null;
				movementAI.enableMovement = true;
			}
			
			if(!hasTheCat.current)	GetClosestCat();
			
			if(closestCat != null){
				closestCatSide = Mathf.Sign(transform.position.x - closestCat.position.x );
			
				if(closestCatDistance > catEscapeRange){
					currentStage = RatLVL1Enemy_Stages.WaitingPlayer;
				}
				
				hasTheCat.current = false;
				if(pickUpRB.isPickingUp && pickUpRB.pickedObject != null && pickUpRB.pickedObject.transform.parent != null && pickUpRB.pickedObject.transform.parent == closestCat){
					hasTheCat.current = true;
				}
				
				if(pickUpRB.isPickingUp  && pickUpRB.pickedObject != null && pickUpRB.pickedObject.transform.tag == cageTag){
					sideMovement.currentSide = -closestCatSide;
					jumpSwim.disableJumpUntil = Time.time + .5;
					
					if(sideMovement.currentSide != closestCatSide){
						if(Time.time % 0.4 < 0.2){
							//
							controller.inputButtonA.pressed = true;
						}
						else{
							controller.inputButtonA.pressed = false;
						}
					}
				}
				
				if(!hasTheCat.current){
					movementAI.targetPosition = closestCat.position;
				
					if(closestCatDistance < pickUpDistance && sideMovement.currentSide == closestCatSide){
						if(Time.time % 1.0 < 0.5){
							controller.inputButtonA.pressed = true;
							Debug.DrawRay(transform.position, Vector3.up*5.0, Color.green);
						}
						else{
							controller.inputButtonA.pressed = false;
						}
					}
				}
				else{
					movementAI.targetPosition = escapeLocation[currentEscapeLocation].position;
					if(movementAI.onTarget.toggledTrue){
						sideMovement.disableMovementUntil = Time.time + waitDuration;
						jumpSwim.disableJumpUntil = Time.time + waitDuration;
							
						currentEscapeLocation++;
						if(currentEscapeLocation >= escapeLocation.Length)
							currentEscapeLocation = 0;
					}
				}
			}
			else{
				currentStage = RatLVL1Enemy_Stages.WaitingPlayer;
			}
			
			hasTheCat.Update();
			
			if(hasTheCat.toggledTrue || pickUpRB.justPickedUp){
				sideMovement.disableMovementUntil = Time.time + waitDuration;
				jumpSwim.disableJumpUntil = Time.time + waitDuration;
				pickUpRB.disableUntil = Time.time + waitDuration;
			}

		break;
		
		case RatLVL1Enemy_Stages.DisableAI:
		
		break;
	}
	
	previousStage = currentStage;
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