#pragma strict

var getPlayerByTag : boolean = true;
var playerTag : String = "Player";
var player : Transform;
var playerHealth : Health;
var playerJumpSwim : JumpSwim;
var playerIsGrounded : IsGrounded;

var currentStage : RatShield_Stages;
var previousStage : RatShield_Stages;
var changedStage : boolean;
enum RatShield_Stages{HoldPosition, DisableAI}

var autoFindComponents : boolean = true;
var controller : ControllerInput;
var movementAI : MovementAI;
var sideMovement : SideMovement;
var jumpSwim : JumpSwim;
var ratRigidbody : Rigidbody;
var pickUpRB : PickUpRigidbody;
var meleeAttack : MeleeAttackSimple;
var characterHurt : Hurt;
var stopVelocity : float = .1;

var maxVerticalDistance : float = 3;
var holdPositionDefaultLocation : Vector3;
var holdPositionLocation : Transform;
var holdPositionLocationWPos : IsWorldPosition;
var holdPosLocationDistance : float;
var maintainDirectionDistanceToHoldPos : float = 1.5;
var shieldDirection : int = -1;
var adjustHoldPosDistance : float = 1.5;
var maxHoldPosX : float = -80;
var minHoldPosX : float = -65; 
var jumpTimer : Timer;
var maxJumpDistance : float = 3.5;
	
var playerSide : int;
var detectionRange : float = 5.0; 
var goBack : Timer;
var playerDistance : float;
var attackRange : float = 1.5;
var attackTimer : Timer;
var minAttackVelocity : float = 1.0;
private var attackRateMul : float = 0.2; //0.24 / 1.2
private var minAttackEvery : float = 0.208; //0.25 / 1.2
private var attackRangeMul : float = 1.5; //Start the swing from farther away.
private var attackVelocityMul : float = 1.6; //Lets the shield rat swing while still closing in.
private var holdPosInsideRangeMul : float = 0.7; //Parks inside striking distance instead of right on its edge.
private var attackQueued : boolean;

function Start () {
	if(getPlayerByTag){
		GetPlayer();
		/*player = GameObject.FindGameObjectWithTag(playerTag).transform;
		playerHealth = player.GetComponentInChildren(Health);
		playerJumpSwim = player.GetComponentInChildren(JumpSwim);
		playerIsGrounded =  player.GetComponentInChildren(IsGrounded);*/
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
	
	holdPositionLocationWPos = holdPositionLocation.GetComponent(IsWorldPosition);
	holdPositionDefaultLocation = holdPositionLocation.position;

	if(attackTimer.every > 0.0){
		attackTimer.every *= attackRateMul;
		if(attackTimer.every < minAttackEvery) attackTimer.every = minAttackEvery;
	}

	minAttackVelocity *= attackVelocityMul;
	attackRange *= attackRangeMul;

	if(adjustHoldPosDistance > attackRange * holdPosInsideRangeMul){
		adjustHoldPosDistance = attackRange * holdPosInsideRangeMul;
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

function Update () {
	if(player == null) GetPlayer();

	if(currentStage != previousStage) changedStage = true;
	else changedStage = false;
	
	if(player != null){
		playerSide = Mathf.Sign(transform.position.x - player.position.x);
		playerDistance = Vector3.Distance(transform.position, player.position);
	}
	
	holdPosLocationDistance = Vector3.Distance(transform.position, holdPositionLocation.position);
	
	jumpTimer.Update();
	goBack.Update();
	attackTimer.Update();

	//Hold the tick until the rat is actually in a position to swing, instead of losing it.
	if(attackTimer.current) attackQueued = true;
	
	switch (currentStage){
		case RatShield_Stages.HoldPosition:
			movementAI.target = null;
			movementAI.targetPosition = holdPositionLocation.position;
			movementAI.enableMovement = true;
			
			if(holdPosLocationDistance < maintainDirectionDistanceToHoldPos){
				sideMovement.currentSide = shieldDirection;
			}
			
			if(player != null){
				if(player.position.x  < minHoldPosX && shieldDirection == -1 || player.position.x > maxHoldPosX && shieldDirection == 1){
					sideMovement.currentSide = playerSide;
				}
			}
			
			//if(!playerIsGrounded.isGrounded) Debug.DrawRay(transform.position, Vector3(1,1,0));
			
			if(playerIsGrounded != null && jumpTimer.current && playerSide == shieldDirection && !playerIsGrounded.isGrounded && playerDistance < maxJumpDistance){
				controller.inputButtonB.pressed = true;
			}
			
			if( player != null){
				if(shieldDirection == -1 && player.position.x < transform.position.x || shieldDirection == 1 && player.position.x  > transform.position.x ){
					holdPositionLocationWPos.worldPosition = player.position + Vector3.right * shieldDirection * adjustHoldPosDistance;
						
				}
			}

			
			if(shieldDirection == -1 && holdPositionLocationWPos.worldPosition.x < minHoldPosX || shieldDirection == 1 && holdPositionLocationWPos.worldPosition.x > maxHoldPosX){
				holdPositionLocationWPos.worldPosition.x = Mathf.Clamp(holdPositionLocationWPos.worldPosition.x, minHoldPosX, maxHoldPosX);
			}
			else{
				if(goBack.current){
					holdPositionLocationWPos.worldPosition = holdPositionDefaultLocation;
				}
			}
			
			if(playerDistance < attackRange && ratRigidbody.velocity.magnitude < minAttackVelocity){
				sideMovement.currentSide = playerSide;
				if(playerIsGrounded != null && attackQueued && playerIsGrounded.isGrounded){
					controller.inputButtonA.pressed = true;
					attackQueued = false;
				}
			}

		break;
		
		case RatShield_Stages.DisableAI:
		
		break;
	}
	
	previousStage = currentStage;
}