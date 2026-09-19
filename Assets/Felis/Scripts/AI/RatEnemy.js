#pragma strict

@Header("-------------------Comps--------------------")

var controller : ControllerInput;
var movementAI : MovementAI;
var sideMovement : SideMovement;
var jumpSwim : JumpSwim;
var ratRigidbody : Rigidbody;
var pickUpRB : PickUpRigidbody;
var meleeAttack : MeleeAttackSimple;
var characterHurt : Hurt;
@Space(10)
var playerHealth : Health;
var playerJumpSwim : JumpSwim;
var playerIsGrounded : IsGrounded;
@Space(10)
var passKeySound : AudioSource;

@Header("-------------------Input--------------------")//////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
var autoFindComponents : boolean = true;

@Header("Misc values: ")
@Space(10)

var stopVelocity : float = .1;
var maxVerticalDistance : float = 3;
var detectRange : float = 5.0;
@Space(10)
var delayAttack : float;
var attackTimeLeft : float;
private var attackDelayMul : float = 0.24;
private var minAttackDelay : float = 0.25;
private var attackVelocityMul : float = 1.6; //Lets the rat swing while still closing in, instead of only once it has stopped.
private var extraStrikeDelay : float = 0.27;
private var extraStrikeReady : boolean = true;

@Header("Player related values: ")
@Space(10)

var getPlayerByTag : boolean = true;
var playerTag : String = "Player";
var waitingPlayerPosition : Transform;
var playerAttackRange : float = 2.0;
var attackDistance : float = 0.5;
var playerEscapeRange : float = 6.0;
var focusOnPlayerDuration : float = 3.0;


@Space(10)
@Header("Cats related values: ")


var catTag : String = "Cat";
var getCatTimer : Timer;
@Space(10)
var stealCats : boolean = true;

@Space(10)
@Header("Key related values: ")


var predictVelocityMultiplier : float = 2.0;
var keyAskDistance : float = 2.0;
var waitDurationAfterPassingKey : float = 1.0;
var keyThrowVelocity : Vector2 = Vector2(10,20);
var maxThrowDistance : float = 4.0;
var maxKeyThrowVelocity : float  = 10.0;
var forceFleeDistance : float = 1.0;
var askFromCharacterOtherSideDist : float = 6.0;
var keyThrowForceDuration : float = .5;
var followRatIfTooFarDist : float = 5.0;
var waitTooLongDuration : float = 3.0;
var keyPickDelay : float = 0.0;;
var keyPicked_StandDuration : float = 0.0;
@Space(10)
var stealKey : boolean = true;


@Space(10)
@Header("Hold Pos values: ")
var adjustHoldPosDistance : float = 1.5;
var holdRange : float = 4.0;
var jumpWithPlayerDist : float = 2.0;
var minAttackVelocity : float = 1.0;
var attackRange : float = 1.5;
var guardSide : int = -1;
var forceFacePlayerDistance : float = 3.0;
var allowPastDist : float = 0.5;

@Space(10)
@Header("Bomb values: ")
var useBombs : boolean;
var bombTag : String = "Bomb";
var bombPickAgainDelay : float = 6.0;

@Header("Misc values: ")
@Header("------------------Values--------------------")/////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////

var currentStage : RatAIStages;
var previousStage : RatAIStages;
var changedStage : boolean;
var receivedFirstHit : boolean;
var escapeLocationSide : int;
var buttonTimer : Timer;
var pickUpDistance : float = 1.0;

@Header("Player related values: ")
@Space(10)
var player : Transform;
var playerFirstDetected : boolean;
var playerFirstDetectTime : float;
var playerSide : float;
var playerDistance : float;
var playerInFront : boolean;
@Header("Cats related values: ")
@Space(10)

var allCats : Transform[];
var closestCat : Transform;
var closestCatDistance : float;
var closestCatSide : float;
var catEscapeRange : float = 6.0;
var hasTheCat : ToggleBoolean;
var escapeLocation : Transform[];
var currentEscapeLocation : int;
var waitDuration : float = 0.5; //After picking up. Throwing key. Etc.
var cageTag : String = "Cage";

@Space(10)
@Header("Key related values: ")

var key : Transform;
var getItemTimer : Timer;
var keyTag : String = "Key";
var keyPickableRB : PickableRigidbody;
var minKeyDistanceRange : float = 1.5;
var maxKeyDistanceRange : float = 4.0;
var hasTheKey : ToggleBoolean;
var otherRatHasKey : boolean;
var ratTag : String = "Rat";
var passedKey : ToggleBoolean;
var keySide : int;
var tooLongOnTargetDuration : float = 1.5;
var waitTooLongTimeLeft : float;
var escapeHoldStill : boolean;
var playerHasTheKey : boolean;
var keyDistance : float;
var followRatOrPlayerTimer : Timer;
var followRatOrPlayer : RatOrPlayer;
var previousFollowRatOrPlayer : RatOrPlayer;
var maxChangeValue : float = 2.0;
var changeValue : float;
var followNoneDuration : float = 1.0;
var followNoneUntil : float;
var keyPickDelayTimeLeft : float;

@Space(10)
@Header("Hold Pos values: ")
var startPos : Vector3;
var holdPositionDefaultLocation : Vector3;
var holdPositionLocation : Transform;
var shieldDirection : int = -1;
var goBack : Timer;

@Space(10)
@Header("Bomb values: ")
//var bombs : Fuse[];
var bombs : GameObject[];
var bombsFuses : Fuse[];
var bombs_PRB : PickableRigidbody[];

var closestBomb : GameObject;
var dropBombDist : float = 2.0;
var hasBomb : boolean;
var dropBombTimeLeft : float;
var canDropBomb : boolean;
var dropBombDelay : float = .15;
var bombThrowVel : Vector2;


function SetShieldDirection(newDir : float){
	shieldDirection = Mathf.Sign(newDir);
}

enum RatOrPlayer {Rat, Player, None}

var debug : boolean;

enum RatAIStages{WaitingPlayer, AttackingPlayer, StealingCat, DisableAI, RunWithKey, AskForKey, HoldPosition, GettingBomb, PlacingBomb}

function DisableAI_RatEnemt(){
	currentStage = RatAIStages.DisableAI;
}

function SetFocusOnPlayerDuration(newDuration : float){
	focusOnPlayerDuration = newDuration;
}

function Start () {
	startPos = transform.position;

	GetKey();
	
	if(getPlayerByTag){
		GetPlayer();
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
	
	if(getCatTimer.every == 0.0){
		getCatTimer.every = 2.0;
	}
	GetCats();
	
	if(getItemTimer.every == 0.0){
		getItemTimer.every = 3.0;
	}
	
	GetHoldDefaultPos();
	
	if(buttonTimer.every == 0.0){
		buttonTimer.every = .1;
	}
	
	if(followRatOrPlayerTimer.every == 0.0){
		followRatOrPlayerTimer.every = 2.0;
	}
	
	if(goBack.every == 0.0){
		goBack.every = 3.0;
	}

	if(delayAttack > 0.0){
		delayAttack *= attackDelayMul;
		if(delayAttack < minAttackDelay) delayAttack = minAttackDelay;
	}

	minAttackVelocity *= attackVelocityMul;
}



function Update () {
	/*//Unpress button failsafe (movementAI is badly scripted... it sets button every frame. So this is just a failsafe)
	if(Time.time > controller.inputButtonA.lastDownTime + .1) controller.inputButtonA.pressed = false;
	if(Time.time > controller.inputButtonB.lastDownTime + .1) controller.inputButtonB.pressed = false;*/
	

	
	
	//Update Timer
	goBack.Update();
	buttonTimer.Update();
	getItemTimer.Update();
	getCatTimer.Update();
	
	if(getCatTimer.current){
		GetCats();
	}
	
	if(getItemTimer.current){
		GetKey();
		if(useBombs){
			GetBombs();
		}
	}
	
	if(player == null || playerHealth == null){
		GetPlayer();	
	}
		
	changeValue = Mathf.MoveTowards(changeValue, 0.0, Time.deltaTime);
	
	if(currentStage != previousStage) changedStage = true;
	else changedStage = false;

	if(key!= null && keyPickableRB == null){
		keyPickableRB = key.GetComponentInChildren(PickableRigidbody);
	}

	keyDistance  = 0;
	if(key == null){
		keyDistance = Mathf.Infinity;
	}
	else{
		keyDistance = Vector3.Distance(transform.position, key.position);
	}
	
	if( player != null){
		playerDistance = Vector3.Distance(transform.position, player.position);
	}
	
	hasTheKey.current = false;
	if(pickUpRB!= null && pickUpRB.pickedObject != null && pickUpRB.pickedObject.transform.parent != null && pickUpRB.pickedObject.transform.parent == key){
		hasTheKey.current = true;
	}
	hasTheKey.Update();



	playerHasTheKey = false;

	if(keyPickableRB != null && keyPickableRB.beingPicked.current && keyPickableRB.pickingObject.transform.tag == playerTag){
		playerHasTheKey = true;
	}
	
	otherRatHasKey = false;
	if(keyPickableRB != null && keyPickableRB.beingPicked.current && keyPickableRB.pickingObject.transform.parent != null && keyPickableRB.pickingObject.transform.parent.tag == ratTag){
		otherRatHasKey = true;
	}
	
	if(player != null){
		playerSide = Mathf.Sign(transform.position.x - player.position.x );
	
	}
	
	if(key!=null)keySide = Mathf.Sign(transform.position.x - key.position.x );
	
	escapeLocationSide = Mathf.Sign(transform.position.x - escapeLocation[currentEscapeLocation].position.x);
	
	if(hasTheKey.current && Time.time < hasTheKey.toggledTrueTime + keyPicked_StandDuration){
		escapeHoldStill = true;
	}
	else{
		escapeHoldStill = false;
	}


	
	var velMagnitude : float = ratRigidbody.velocity.magnitude;
	
	closestBomb = null;
	if(currentStage != RatAIStages.GettingBomb){
		if(useBombs && bombs != null){
			for(var b = 0; b < bombs.Length; b++){
				if(bombs[b] == null){
					continue;
				}

				var bombDist : float = Vector3.Distance(transform.position, bombs[b].transform.position);
				if(bombDist < detectRange){
					if(bombs_PRB[b] != null){ //Check if bomb is being picked
						if(!bombs_PRB[b].beingPicked.current && Time.time > bombs_PRB[b].beingPicked.toggledTrueTime + bombPickAgainDelay){
							closestBomb = bombs[b];
							currentStage = RatAIStages.GettingBomb;
							break;
						}
					}

					if(bombsFuses[b] == null){
						
					}
				}
			}
		}
	}
	
	hasBomb = false;
	if(pickUpRB != null && pickUpRB.pickedObject != null && pickUpRB.pickedObject.transform.parent != null){
		if(pickUpRB.pickedObject.transform.parent.tag == bombTag){
			hasBomb = true;
			currentStage = RatAIStages.PlacingBomb;	
		}
	}	
	
	switch (currentStage){
		case RatAIStages.PlacingBomb:
		
			if(player != null){
				if(playerDistance < detectRange){
					movementAI.enableMovement = true;
					movementAI.targetPosition = player.transform.position;				
				}
				else{
					movementAI.targetPosition = waitingPlayerPosition.position;
				}

				
				if(hasBomb){
					if(playerDistance < dropBombDist){
						//movementAI.sideMovement.currentSide = Mathf.Sign(player.position.x - transform.position.x);
						canDropBomb = true;
					}
				}
				else{
					currentStage = RatAIStages.WaitingPlayer;
				}
			}
			else{
				currentStage = RatAIStages.WaitingPlayer;
			}
			
			if(canDropBomb){
				movementAI.targetPosition = transform.position;
				movementAI.sideMovement.currentSide = playerSide;
				dropBombTimeLeft = Mathf.MoveTowards(dropBombTimeLeft, 0.0, Time.deltaTime);
			}
			else{
				dropBombTimeLeft = dropBombDelay;
			}
			
			if(dropBombTimeLeft == 0.0){
				var holdingBomb : Rigidbody = pickUpRB.pickedObject.rb;
				pickUpRB.pickedObject.nextDropLightly = true; //Don't add force, apply velocity manually.
				pickUpRB.Drop();

				if(player != null){
					var throwVector : Vector3 = (player.position - transform.position) * bombThrowVel.x + Vector3.up * bombThrowVel.y;
					holdingBomb.velocity = throwVector;

				}

				dropBombTimeLeft = dropBombDelay;



			}
		break;
		
		case RatAIStages.GettingBomb:
			if(closestBomb != null){
				if(!hasBomb){
					var closestBombDist : float = Vector3.Distance(closestBomb.transform.position, transform.position);
					movementAI.enableMovement = true;
					movementAI.targetPosition = closestBomb.transform.position;
					if(closestBombDist < pickUpDistance){
						movementAI.sideMovement.currentSide = Mathf.Sign(closestBomb.transform.position.x - transform.position.x);
						PressButton(controller.inputButtonA);
					}
				}
				/*else{
					//Once it has the bomb, place the bomb.
					currentStage = RatAIStages.PlacingBomb;
				}*/
			}
			else{
				currentStage = RatAIStages.WaitingPlayer;
			}
		break;
		
		case RatAIStages.WaitingPlayer:
			movementAI.target = null;
			movementAI.targetPosition = waitingPlayerPosition.position;
			movementAI.enableMovement = true;
			
			//Look at prospero when standing still.
			if(movementAI.onTarget.current && velMagnitude < stopVelocity){
				sideMovement.currentSide = guardSide;
			}

			if(!hasTheKey.current){
				if(playerHealth != null && keyDistance > detectRange && playerHealth.health > 0 && playerDistance < detectRange){
					currentStage = RatAIStages.AttackingPlayer;
				}		
			
				if(keyDistance < detectRange && stealKey){
					currentStage = RatAIStages.RunWithKey;
				}
			}
			else{
				if(playerDistance < detectRange && stealKey){
					currentStage = RatAIStages.RunWithKey;
				}
			}
			
		break;
		
		case RatAIStages.AttackingPlayer:
			if(changedStage){
				movementAI.target = null;
				movementAI.enableMovement = true;
				attackTimeLeft = delayAttack;
			}
			
			//Get close enough to attack.
			if(player != null){
				movementAI.targetPosition = player.position + Vector3(playerSide * attackDistance,0,0);
			}
			
			//Look at prospero when standing still, or as soon as he is within striking distance.
			if(playerDistance < playerAttackRange || (movementAI.onTarget.current && velMagnitude < stopVelocity)){
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
				if(extraStrikeReady){
					extraStrikeReady = false;
					attackTimeLeft = extraStrikeDelay;
				}
				else{
					extraStrikeReady = true;
					attackTimeLeft = delayAttack;
				}
				meleeAttack.performAttack = true;
			}
			
			if(characterHurt.hurt.toggledTrue) receivedFirstHit = true;
			
			if(playerFirstDetected && Time.time > playerFirstDetectTime + focusOnPlayerDuration){
				GetClosestCat();
				
				if(closestCat != null){
					if(closestCatDistance < detectRange && stealCats){
						currentStage = RatAIStages.StealingCat;
					}
				}
			}
			
			if(playerDistance > playerEscapeRange || playerHealth != null && playerHealth.health <= 0){
				currentStage = currentStage = RatAIStages.WaitingPlayer;
			}
			
			
			if(stealKey){	
				if(otherRatHasKey || keyDistance < detectRange){
					currentStage = currentStage = RatAIStages.RunWithKey;
				}	
			}
		break;
		
		case RatAIStages.StealingCat:
			if(changedStage){
				movementAI.target = null;
				movementAI.enableMovement = true;
			}
			
			if(!hasTheCat.current)	GetClosestCat();
			
			if(closestCat != null){
				closestCatSide = Mathf.Sign(transform.position.x - closestCat.position.x );
			
				if(closestCatDistance > catEscapeRange){
					currentStage = RatAIStages.WaitingPlayer;
				}
				
				hasTheCat.current = false;
				if(pickUpRB != null && pickUpRB.isPickingUp && pickUpRB.pickedObject != null && pickUpRB.pickedObject.transform.parent != null && pickUpRB.pickedObject.transform.parent == closestCat){
					hasTheCat.current = true;
				}
				
				if(pickUpRB != null && pickUpRB.isPickingUp  && pickUpRB.pickedObject != null && pickUpRB.pickedObject.transform.tag == cageTag){
					sideMovement.currentSide = -closestCatSide;
					jumpSwim.disableJumpUntil = Time.time + .5;
					
					if(sideMovement.currentSide != closestCatSide){
						PressButton(controller.inputButtonA);
					}
				}
				
				if(!hasTheCat.current){
					movementAI.targetPosition = closestCat.position;
				
					if(closestCatDistance < pickUpDistance && sideMovement.currentSide == closestCatSide){
						PressButton(controller.inputButtonA);
					}
				}
				else{
					Escape();
				}
			}
			else{
				currentStage = RatAIStages.WaitingPlayer;
			}
			
			hasTheCat.Update();
			
			if(hasTheCat.toggledTrue || pickUpRB != null && pickUpRB.justPickedUp){
				sideMovement.disableMovementUntil = Time.time + waitDuration;
				jumpSwim.disableJumpUntil = Time.time + waitDuration;
				pickUpRB.disableUntil = Time.time + waitDuration;
			}

		break;
		
		case RatAIStages.RunWithKey:
			
			if(keyDistance > detectRange || playerDistance > detectRange){
				waitTooLongTimeLeft -= Time.deltaTime;
				escapeHoldStill = true;
			}
			else{
				waitTooLongTimeLeft = waitTooLongDuration;
			}
			
			if(waitTooLongTimeLeft <= 0){
				currentStage = RatAIStages.WaitingPlayer;
				waitTooLongTimeLeft = waitTooLongDuration;
			}
			
			if(changedStage){
				movementAI.target = null;
				movementAI.enableMovement = true;
			}
	
			if(!hasTheKey.current){
				if(key!=null){
					if(keyPickableRB != null && keyPickableRB.rb != null){
						movementAI.targetPosition = keyPickableRB.rb.position + keyPickableRB.rb.velocity * predictVelocityMultiplier;
					}
					
					if(keyDistance < pickUpDistance){
						keyPickDelayTimeLeft -= Time.deltaTime;
						if(keyPickDelayTimeLeft < 0){
							PressButton(controller.inputButtonA);
						}	
					}
					else{
						keyPickDelayTimeLeft = keyPickDelay;
					}
					
					if(otherRatHasKey && stealKey){
						currentStage = RatAIStages.AskForKey;
					}
				}
				else{
					currentStage = RatAIStages.WaitingPlayer;
				}
				
			}
			else{
				if(key!= null){
					Escape();	
				}
				else{
					currentStage = RatAIStages.WaitingPlayer;
				}		
			}
			
		break;
		
		case RatAIStages.AskForKey:
			passedKey.Update();
			if(key != null){
				if(otherRatHasKey){
					if(!passedKey.current){
						var otherRatWithKey : Transform = keyPickableRB.pickingObject.transform.parent;
						var ratWithKeyPos : Vector3 = otherRatWithKey.position ;
						var ratWKeyDist : float = Vector3.Distance(transform.position, ratWithKeyPos);
						var ratWKeySide : int = Mathf.Sign(transform.position.x - ratWithKeyPos.x);
						var ratWKeyPlayersSide : int;
						var playerToOtherRatDist : float;
						if(player != null){
							ratWKeyPlayersSide = Mathf.Sign(ratWithKeyPos.x - player.position.x);
							playerToOtherRatDist = Vector3.Distance(ratWithKeyPos, player.position);
						}
						
						
						followRatOrPlayerTimer.Update();
						
						if(Time.time < followNoneUntil){
							followRatOrPlayer = RatOrPlayer.None;
						}
						else{
							if(followRatOrPlayerTimer.current){
								if(playerDistance > askFromCharacterOtherSideDist || ratWKeyDist > followRatIfTooFarDist){
									//movementAI.targetPosition = ratWithKeyPos + Vector3(keyAskDistance * ratWKeySide,0,0);
									followRatOrPlayer = RatOrPlayer.Rat;
								}
								else{
									//movementAI.targetPosition = player.position + Vector3(keyAskDistance * -ratWKeyPlayersSide,0,0);
									followRatOrPlayer = RatOrPlayer.Player;
								}			
							}
						}
						
						if(previousFollowRatOrPlayer != followRatOrPlayer){
							previousFollowRatOrPlayer = followRatOrPlayer;
							changeValue += 1.0;
						}
						
						if(changeValue > maxChangeValue){
							followNoneUntil = Time.time + followNoneDuration;
							changeValue = 0.0;
						}
						
						switch(followRatOrPlayer){
							case RatOrPlayer.Rat:
								movementAI.targetPosition = ratWithKeyPos + Vector3(keyAskDistance * ratWKeySide,0,0);
							break;
							
							case RatOrPlayer.Player:
								if(player != null){
									movementAI.targetPosition = player.position + Vector3(keyAskDistance * -ratWKeyPlayersSide,0,0);
								}	
							
							break;
							
							case RatOrPlayer.None:
								movementAI.targetPosition = transform.position;
								movementAI.sideMovement.currentSide = playerSide;
							break;
						}

						var ratWKeyIsCloserToPlayer : boolean = 
						(playerSide != escapeLocationSide && -ratWKeySide != ratWKeyPlayersSide && ratWKeyDist  > minKeyDistanceRange && ratWKeyDist < maxKeyDistanceRange);
						
						var ratWKeyIsLookingThisRatAndPlayerIsBetween : boolean = 
						(ratWKeyPlayersSide != playerSide && -ratWKeySide == Mathf.Sign(otherRatWithKey.localScale.x) && ratWKeyDist < maxThrowDistance);
						
						if(ratWKeyIsCloserToPlayer || ratWKeyIsLookingThisRatAndPlayerIsBetween){ 
							var ratWKeyPickUpRB : PickUpRigidbody = keyPickableRB.pickingObject;

							//var ratWKeyDistVelocityPredict: float 
							//= Vector3.Distance(transform.position, ratWithKeyPos + ratWKeyPickUpRB.characterRigidbody.velocity * predictVelocityMultiplier); 

							ratWKeyPickUpRB.Drop();
							
							if(passKeySound != null){
								passKeySound.pitch = Random.Range(.8,1.2);
								passKeySound.Play();
							}
							
							var desiredVelocity : Vector3 = Vector3(ratWKeyDist * keyThrowVelocity.x * ratWKeySide, ratWKeyDist * keyThrowVelocity.y,0);
							desiredVelocity.x = Mathf.Clamp(desiredVelocity.x, -maxKeyThrowVelocity, maxKeyThrowVelocity);
							desiredVelocity.y = Mathf.Clamp(desiredVelocity.y, -maxKeyThrowVelocity, maxKeyThrowVelocity);
							desiredVelocity.z = Mathf.Clamp(desiredVelocity.z, -maxKeyThrowVelocity, maxKeyThrowVelocity);
							
							var forceVelocity : ForceVelocityDuration = key.GetComponent(ForceVelocityDuration);
							forceVelocity.forceUntil = Time.time + keyThrowForceDuration;
							forceVelocity.velocity = desiredVelocity;
							
							var ratWKey_KeyHolder : RatEnemy = otherRatWithKey.GetComponentInChildren(RatEnemy);
							ratWKey_KeyHolder.passedKey.current = true;

						}
					}
					else{
						if(Time.time > passedKey.toggledTrueTime + waitDurationAfterPassingKey){
							passedKey.current = false;
						}
					}
				}
				else{
					if(passedKey.current){
						//Debug.DrawRay(transform.position, Vector3.up *3);
						if(Time.time > passedKey.toggledTrueTime + waitDurationAfterPassingKey){
							passedKey.current = false;
						}
					}
					else{
						currentStage = RatAIStages.WaitingPlayer;
					}
					
				}
			}
			else{
				currentStage = RatAIStages.WaitingPlayer;
			}

		break;
		
		case RatAIStages.HoldPosition:
			
			movementAI.target = null;
			movementAI.target  = holdPositionLocation;
			movementAI.enableMovement = true;

			
			if(player != null){
				//Jump if player jumps
				if(playerDistance < jumpWithPlayerDist){
					if(playerIsGrounded != null && !playerIsGrounded.isGrounded){
						PressButton(controller.inputButtonB);
					}
				}

				//Stand in front of player
				if(shieldDirection == -1 && player.position.x < transform.position.x - allowPastDist || shieldDirection == 1 && player.position.x  > transform.position.x + allowPastDist ){
					holdPositionLocation.position = player.position + Vector3.right * shieldDirection * adjustHoldPosDistance;
				}
				else{
					//Face player
					if(playerDistance < forceFacePlayerDistance){
						sideMovement.currentSide = playerSide;
						movementAI.disableUntil = Time.time + .1;
						goBack.next = Time.time + goBack.every;
					}
					else{
						if(movementAI.onTarget.current){
							sideMovement.currentSide = shieldDirection;
						}
					}
				}

				//Attack player
				if(playerDistance < attackRange && velMagnitude < minAttackVelocity){
					if(playerIsGrounded != null && playerIsGrounded.isGrounded){
						PressButton(controller.inputButtonA);
					}
				}
			}
			
			//Clamp hold position.
			holdPositionLocation.position.x = Mathf.Clamp(holdPositionLocation.position.x, startPos.x - holdRange, startPos.x + holdRange);
			
			//Go back.
			if(player == null || player != null && playerDistance > attackRange ){
				if(goBack.current){
					holdPositionLocation.position = holdPositionDefaultLocation;
				}
			}
			


		break;
		
		case RatAIStages.DisableAI:
		
		break;
	}
	
	previousStage = currentStage;
}

function GetKey(){
	var keys : GameObject[] = GameObject.FindGameObjectsWithTag(keyTag);
	var closestKey : GameObject;
	var closestKeyDist : float;
	for(var i = 0; i < keys.Length; i++){
		if(closestKey == null){
			closestKey = keys[i];
			closestKeyDist = Vector3.Distance(transform.position, closestKey.transform.position);
		}
		else{
			var thisDist : float = Vector3.Distance(keys[i].transform.position, transform.position);
			if(thisDist < closestKeyDist){
				closestKey = keys[i];
				closestKeyDist = thisDist;
			}
		}
	}
	if(closestKey != null){
		key = closestKey.transform;
		passKeySound = key.GetComponent.<AudioSource>();
	}
}

function GetBombs(){
	//bombs = GameObject.FindObjectsOfType.<Fuse>();
	bombs = GameObject.FindGameObjectsWithTag(bombTag);
	bombsFuses = new Fuse[bombs.Length];
	bombs_PRB = new PickableRigidbody[bombs.Length];
	for(var i = 0; i < bombs.Length; i++){
		bombsFuses[i] = bombs[i].GetComponentInChildren.<Fuse>();
		bombs_PRB[i] = bombs[i].GetComponentInChildren.<PickableRigidbody>();
	}

}

function GetCats(){
	var catTags : GameObject[] = GameObject.FindGameObjectsWithTag(catTag);
	allCats = new Transform[catTags.Length];
	for(var i = 0; i < catTags.Length; i++){
		allCats[i] = catTags[i].transform;
	}
}

function GetHoldDefaultPos(){
	for(var i = 0; i < transform.childCount; i ++){
		var child : Transform = transform.GetChild(i);
		if(child.name.ToLower().Contains("hold position")){
			holdPositionDefaultLocation = child.position;
			holdPositionLocation = child;
			break;
		}
	}
	
}

function GetPlayer(){
	var playerObj : GameObject = GameObject.FindGameObjectWithTag(playerTag);
	if(playerObj != null){
		player = playerObj.transform;
		playerHealth = playerObj.GetComponentInChildren(Health);
		playerJumpSwim = playerObj.GetComponentInChildren(JumpSwim);
		playerIsGrounded =  playerObj.GetComponentInChildren(IsGrounded);
	}
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

function Escape(){
	if(playerSide != escapeLocationSide || playerDistance < forceFleeDistance){
		movementAI.targetPosition = escapeLocation[currentEscapeLocation].position;
	}
	else{
		movementAI.targetPosition = transform.position;
	}
	
	if(escapeHoldStill){
		movementAI.targetPosition = transform.position;
	}
	
	if(movementAI.onTarget.toggledTrue || movementAI.onTarget.current && Time.time > movementAI.onTarget.toggledTrueTime + tooLongOnTargetDuration){
		sideMovement.disableMovementUntil = Time.time + waitDuration;
		jumpSwim.disableJumpUntil = Time.time + waitDuration;
			
		currentEscapeLocation++;
	}
	
	if(currentEscapeLocation >= escapeLocation.Length){
		currentEscapeLocation = 0;
	}
}

function PressButton(button : Button){//, cycle : float, range : float){
	if(buttonTimer.current){
		button.pressed = true;
		button.down = true;
		button.lastDownTime = Time.time;
	}
}

function Guard(){
	currentStage = RatAIStages.HoldPosition;
}

function ChangeRange(newRange : float){
	//playerAttackRange = newRange;
	detectRange = newRange;
}

function ChangeDropBombDist(newDist : float){
	dropBombDist = newDist;
}