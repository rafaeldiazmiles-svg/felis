#pragma strict

var player : GameObject;
var playerTag : String = "Player";

var controller : ControllerInput;
var health : Health;
var unPressWaitDuration: float = .3;
var isGrounded : IsGrounded;

var cats : GameObject[];
var catTag : String = "Cat";
var getCatsTimer : Timer;

var detectRange : float = 4.0;
var pickRange : float = 1.3;
var catInPickRange : boolean;
var pickTimeLeft : float = .5;;
var pickDelay = .5;

var closestCatInRange : Transform;
var closestZerkyDistance : float;

var legGrab : PickUpRigidbody;

var patrolAI : PatrolAI;

var wingedFlightAI : WingedFlightAI;

var flyAwayAI : FlyAwayAI;

var flyOverPickedZerkyOffset : Vector3 = Vector3(0,2,0);


var getBombRange : float = 2.0;
var hasBomb : boolean;
var dropBombHDist : float = 1.0;
var dropBombOffset : Vector3 = Vector3(0,3.5,0);
var minDropBombHeight : float = 1.0;

var dropBombRunAwayDuration : float = 3.0;
var dropBombRunAwayUntil : float;

function Start () {
	if(getCatsTimer.every == 0.0){
		getCatsTimer.every = 3.0;
	}
	controller = transform.parent.GetComponentInChildren.<ControllerInput>();
	flyAwayAI = transform.parent.GetComponentInChildren.<FlyAwayAI>();
	patrolAI = transform.parent.GetComponentInChildren.<PatrolAI>();
	wingedFlightAI = transform.parent.GetComponentInChildren.<WingedFlightAI>();
	 legGrab = transform.parent.GetComponentInChildren.<PickUpRigidbody>();
	isGrounded =  transform.parent.GetComponentInChildren.<IsGrounded>();
	 
	 var bombs : Fuse[] = GameObject.FindObjectsOfType.<Fuse>();
	 for(var i = 0; i < bombs.Length; i++){
	 	if(bombs[i].turnOnByDropping != null){
		 	if(Vector3.Distance(transform.position, bombs[i].transform.position) < getBombRange){
		 		legGrab.Pick(bombs[i].turnOnByDropping);
		 		hasBomb = true;
		 		controller.inputButtonA.pressed = false;
		 	}
	 	}
	 }
}

function GetCats(){
	cats = GameObject.FindGameObjectsWithTag(catTag);
}

function GetPlayer(){
	player = GameObject.FindGameObjectWithTag(playerTag);
}

function Update () {
	getCatsTimer.Update();
	if(getCatsTimer.current){
		GetCats();
		GetPlayer();	
	}
	
	closestCatInRange = null;
	
	//controller.inputButtonA.pressed = true;
	
	for(var i = 0; i < cats.Length; i++){
		if(cats[i] == null){
			continue;
		}

		var caged : Caged = cats[i].GetComponent.<Caged>();
		if(caged != null){
			if(caged.isCaged){
				continue;
			}
		}

		
		var catDist : float = Vector3.Distance(cats[i].transform.position, transform.position);
		if(catDist < detectRange){
			if(closestCatInRange == null) closestCatInRange = cats[i].transform;
			else {
				if(catDist < Vector3.Distance(closestCatInRange.position, transform.position)){
					closestCatInRange = cats[i].transform;
				}
			}
		}
	}
	
	if(controller.inputButtonA.pressed && Time.time > controller.inputButtonA.lastDownTime + unPressWaitDuration){
		controller.inputButtonA.pressed = false;
	}	
	
	
	var playerHDist : float = Mathf.Infinity;
	
	if(closestCatInRange != null){
		closestZerkyDistance = Vector3.Distance(transform.position, closestCatInRange.position);
	}
	if(player != null){
		playerHDist = Mathf.Abs(transform.position.x - player.transform.position.x); 
	}
	
	catInPickRange = false;
	
	if(hasBomb && !legGrab.isPickingUp){
		hasBomb = false;
		dropBombRunAwayUntil = Time.time + dropBombRunAwayDuration;
	}
	
	if(hasBomb){
		//Bomb behaviour.
		patrolAI.enablePatrol = false;
		flyAwayAI.enableFlyAway = false;
		wingedFlightAI.useExtraHeight = true;
		wingedFlightAI.addOffset = dropBombOffset;
		
		var inDropBombRange : boolean;
		
		if(closestCatInRange != null){
			if(closestZerkyDistance){
				if(playerHDist < dropBombHDist){
					inDropBombRange = true;
					//controller.inputButtonA.pressed = (Time.time % .2 < .1);
				}			
			}
			wingedFlightAI.targetTransform = closestCatInRange;
		}
		else{
			if(playerHDist < detectRange){
				wingedFlightAI.targetTransform = player.transform;
				if(playerHDist < dropBombHDist){
					inDropBombRange = true;
					//controller.inputButtonA.pressed = (Time.time % .2 < .1);
				}
			}
			else{
				wingedFlightAI.addOffset = Vector3.zero;
				patrolAI.enablePatrol = true;
			}
		}
		
		if(inDropBombRange){
			if(isGrounded.avgGroundDistance < minDropBombHeight){
				legGrab.pickedObject.forceVerticalDrop = true;
				controller.inputButtonA.pressed = (Time.time % .2 < .1);
			}
		}
	}
	else{
		if(Time.time < dropBombRunAwayUntil){
			//Run away if drop Bomb.
			wingedFlightAI.targetTransform = null;
			flyAwayAI.enableFlyAway = true;
			patrolAI.enablePatrol = false;	
		}
		else{
			//Normal behaviour.
			if(closestCatInRange != null){
				patrolAI.enablePatrol = false;

				if(!legGrab.isPickingUp){
					flyAwayAI.enableFlyAway = false;
					//legGrab.grabTarget = closestCatInRange;
					wingedFlightAI.targetTransform = closestCatInRange;
					wingedFlightAI.useExtraHeight = true;

					if(closestZerkyDistance < pickRange){
						catInPickRange = true;
						
					}

				}
				else{
					wingedFlightAI.targetTransform = null;
					flyAwayAI.enableFlyAway = true;
					
					if(health.hurt)
						controller.inputButtonA.pressed = true;
				}
				
				if(!legGrab.isPickingUp) wingedFlightAI.addOffset = Vector3(0,0,0);
				else wingedFlightAI.addOffset = flyOverPickedZerkyOffset;
			}
			else{
				flyAwayAI.enableFlyAway = false;
				patrolAI.enablePatrol = true;
				closestZerkyDistance = Mathf.Infinity;
			}
			
			if(catInPickRange) pickTimeLeft -= Time.deltaTime;
			else pickTimeLeft = pickDelay;
			
			if(pickTimeLeft < 0 && !legGrab.isPickingUp){
				controller.inputButtonA.pressed = (Time.time % .2 < .1);
			}
		}
	}
}
