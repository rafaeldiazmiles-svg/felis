#pragma strict

var targets : GameObject[];
var closest : GameObject;
var angleHandle : Transform;
var angleHandleName : String = "Angle Handle";
var rideMng : CharacterScriptMng;
var targetTag : String = "Ride";

var getTimer : Timer;

var rideAnimation : AnimationClip;

var ride : ToggleBoolean;
var blendSpeed : float = 8.0;
var lockDist : float = .5;

var col : Collider;
var rb : Rigidbody;

var charMng : CharacterScriptMng;

var followChar : FollowCharacter;
var zoomOut : float = 8;

var side : int;

var testKey : KeyCode;

var angle : float;
var angleOffset : float;
var currentGriffinAngle : float;
var angleMultiplier : float = 1.0;
var rideAngleSpeed : float = 4.0;

var rideAnim : PlayLoopAnimation;

var reinPos : Transform;
var reinIKSeparation : float = .05;
var reinName : String = "Rein";
var ikLeft: IK2D;
var ikRight : IK2D;

var seatDist : float = 1.5;

var unMountAnimString : String = "Scream";
var unMountAnim : PlayStillAnimation;

var mountLVLEND_Bounded : boolean;
var endLevelMountHealth : Health;
var changeEndDelay : boolean = true;
var spiralDelay : float = 2.5;
var backToIslandDelay : float = 3.8;

var forceAIUntil : float;
var forcingAI : ToggleBoolean;

var mountFallSpeed : float = -2.0;

var jumpOutVel : Vector3 = Vector3(0,6,0);

var goingRight : ToggleBoolean;
var changeSideDelay : float = 5.0;

var dontRide : boolean;

var unMountDirSpeed : float = 6.0;
var unMountRideDownVel : float = 2.0;

function ForceAIDuration(duration : float){
	forceAIUntil = Time.time + duration;
}

function GetTargets(){
	targets = GameObject.FindGameObjectsWithTag(targetTag);
}

function StartOutRiding(){
	ride.current = true;
}

function Start () {
	if(getTimer.every == 0.0){
		getTimer.every = 5.0;
	}

	col = transform.parent.GetComponent.<Collider>();
	rb = transform.parent.GetComponent.<Rigidbody>();

	charMng = transform.parent.GetComponent.<CharacterScriptMng>();

	followChar = GameObject.FindObjectOfType.<FollowCharacter>();

	rideAnim = GetComponent.<PlayLoopAnimation>();

}

function LateUpdate () {
	if(dontRide){
		ride.current = false;
	}

	getTimer.Update();
	if(getTimer.current){
		GetTargets();
	}

	if(Input.GetKeyDown(testKey)){
		ride.current = !ride.current;
	}

	ride.Update();

	if(ride.toggledTrue){
		closest = FindUtility.GetClosest(transform.position, targets);
		if(closest != null){
			rideMng = closest.transform.root.GetComponentInChildren.<CharacterScriptMng>();
			col.enabled = false;
			rb.isKinematic = true;

			if(rideMng.wingedFlightAI != null){
				rideMng.wingedFlightAI.enabled = false;
				rideMng.wingedFlight.side = Mathf.Sign(closest.transform.root.localScale.x);

				if(rideMng.health.boundHealth){
					mountLVLEND_Bounded = true;
					endLevelMountHealth = rideMng.health;
				}
			}

			SetScripts(false);

			side = Mathf.Sign(closest.transform.root.localScale.x);

			angleHandle = closest.transform.Find(angleHandleName);
			reinPos = closest.transform.Find(reinName);

			rideAnim.animationPlay.current = true;

			if(ikLeft != null && ikRight != null && reinPos != null){
				ikLeft.updateIK.current = true;
				ikRight.updateIK.current = true;
			}

			charMng.frameGroups.SetFrame("Right Leg", "Side");

			var unMountAnimT :Transform = closest.transform.root.Find(unMountAnimString);
			if(unMountAnimT != null){
				unMountAnim = unMountAnimT.GetComponent.<PlayStillAnimation>();
			}
			if(unMountAnim != null){
				unMountAnim.playDelayed.current = false;
			}

			charMng.health.riding = true;


		}
	}

	if(ride.toggledFalse){
		col.enabled = true;
		rb.isKinematic = false;


		var rideVel : Vector3;

		if(rideMng != null && rideMng.wingedFlightAI != null){
			rideMng.wingedFlight.lastFlapLeftTime = 0.0;
			rideMng.wingedFlight.lastFlapRightTime = 0.0;
			rideMng.wingedFlightAI.enabled = true;
			rideMng.wingedFlight.fCurveArray.Clear();
			rideMng.wingedFlight.disableUntil = Time.time + 1.0;
			rideVel = rideMng.rb.velocity;
			rideMng.rb.velocity = Vector3.down * unMountRideDownVel;

		}

		SetScripts(true);

		charMng.rb.velocity = jumpOutVel + rideVel;
		charMng.rb.velocity.x -= charMng.input.inputAxis.current.x * unMountDirSpeed;

		charMng.groundAngle.angleOffset = 0.0;

		rideAnim.animationPlay.current = false;

		if(ikLeft != null && ikRight != null && reinPos != null){
			ikLeft.updateIK.current = false;
			ikRight.updateIK.current = false;
		}

		charMng.jumpSwim.ApplyJump();

		if(unMountAnim != null){
			unMountAnim.playDelayed.current = true;
		}

		charMng.health.riding = false;
	}

	if(ride.current){
		if(closest != null){
			if(Time.time < forceAIUntil){
				forcingAI.current = true;
				rideMng.wingedFlightAI.enabled = true;
			}
			else{
				forcingAI.current = false;
			}
			forcingAI.Update();
			if(forcingAI.toggledFalse){
				rideMng.wingedFlightAI.enabled = false;
			}

			if(followChar != null){
				followChar.SetAddZoom(zoomOut,0);
			}
			
			/*if(charMng.input.inputAxis.current.x < -.5){
				side = -1;
			}
			if(charMng.input.inputAxis.current.x > .5){
				side = 1;
			}*/

			rideMng.wingedFlight.SetSide(side);



			closest.transform.root.localScale.x = Mathf.Abs(closest.transform.root.localScale.x) * side;


			if(Vector3.Distance(transform.position, closest.transform.position) < lockDist){
				transform.parent.position = closest.transform.position;
			}
			else{
				transform.parent.position = Vector3.Lerp(transform.parent.position, closest.transform.position, Time.deltaTime * blendSpeed);
			}

			charMng.sideMovement.currentSide = side;
			transform.parent.localScale.x = Mathf.Abs(transform.parent.localScale.x) * side;

			//Input
			if(charMng.sideMovement.currentSide == 1){
				rideMng.wingedFlight.flapLeft =  charMng.input.inputAxis.current.x < -.5;
				rideMng.wingedFlight.flapRight =  charMng.input.inputAxis.current.x > .5;
			}
			else{
				rideMng.wingedFlight.flapLeft =  charMng.input.inputAxis.current.x > .5;
				rideMng.wingedFlight.flapRight =  charMng.input.inputAxis.current.x < -.5;

			}

			if(charMng.input.inputAxis.current.y > .5){
				rideMng.wingedFlight.flapLeft = true;
				rideMng.wingedFlight.flapRight = true;
			}

			//Side

			if(rideMng.rb.velocity.x < 0){
				goingRight.current = true;
			}
			else{
				goingRight.current = false;
			}
			goingRight.Update();

			/*if(goingRight.current && Time.time > goingRight.toggledTrueTime + changeSideDelay){
				SetSide(1);
			}
			if(!goingRight.current && Time.time > goingRight.toggledFalseTime + changeSideDelay){
				SetSide(-1);
			}*/

			//Angle
			charMng.isGrounded.isGrounded = false;

			currentGriffinAngle = Mathf.Atan2(angleHandle.position.y - closest.transform.position.y, angleHandle.position.x - closest.transform.position.x) * Mathf.Rad2Deg;

			if(side == -1){
				currentGriffinAngle -= 180;
			}

			angle = Mathf.DeltaAngle(0,currentGriffinAngle + angleOffset *side);

			transform.parent.eulerAngles.x = 0.0;
			transform.parent.eulerAngles.y = 0.0;
			transform.parent.eulerAngles.z = Mathf.LerpAngle(transform.parent.eulerAngles.z, angle * angleMultiplier, Time.deltaTime * rideAngleSpeed);

			//charMng.groundAngle.angleOffset = angle * angleMultiplier;

			//IK
			if(ikLeft != null && ikRight != null && reinPos != null){
				ikLeft.targetPos = reinPos.position + reinPos.right * reinIKSeparation;
				ikRight.targetPos = reinPos.position - reinPos.right * reinIKSeparation;
			}

			//Jump out
			if(charMng.input.inputButtonB.pressed ){// charMng.input.inputAxis.current.y > .5){
				ride.current = false;
			}

			charMng.health.mountHealth = rideMng.health.health;

			if(rideMng.health.health <= 0){ 
				ride.current = false;
				charMng.health.FakeDestroy();
			}
		}
		else{
			ride.current = false;
			charMng.health.FakeDestroy();
		}
	}
	else{
		if(mountLVLEND_Bounded){
			if(endLevelMountHealth == null || endLevelMountHealth.health <= 0){
				if(changeEndDelay){
					charMng.death.backToIslandDelay = backToIslandDelay; 
					charMng.death.optionsDelayAfterDeath = spiralDelay;
				}
				charMng.death.endLevel.current = true;
			}
		}

		for(var i = 0; i < targets.Length; i++){
			if(targets[i] == null){
				continue;
			}

			var dist : float = Vector3.Distance(targets[i].transform.position, transform.position);

			if(dist < seatDist){
				if(charMng.rb.velocity.y < mountFallSpeed){
					if(!dontRide){
						ride.current = true;
					}
				}
			}

		}
	}

}

function SetSide(newSide : int){
	side = newSide;
	rideMng.wingedFlight.SetSide(side);
}

function SetScripts(setEnabled : boolean){
	charMng.idleAnimation.enabled = setEnabled;
	charMng.sideMovement.enabled = setEnabled;
	charMng.sideMovementAnimation.enabled = setEnabled;
	charMng.jumpSwim.enabled = setEnabled;
	charMng.jumpSwimAnimation.enabled = setEnabled;
	charMng.lookUp.enabled = setEnabled;
	charMng.crouch.enabled = setEnabled;
	charMng.meleeAttack.enabled = setEnabled;
	charMng.feetParticle.enabled = setEnabled;
	charMng.bounceSound.enabled = setEnabled;
}