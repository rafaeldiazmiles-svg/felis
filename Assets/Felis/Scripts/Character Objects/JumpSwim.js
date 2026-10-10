#pragma strict

var autoFindComponents : boolean = true;

var isGroundedScript : IsGrounded;
var sideMovementScript : SideMovement;
var sideDetection : SideDetection;
var underWaterScript : UnderWater;
var friction : StopFrictionDrag;
var input : ControllerInput;
var characterRigidbody : Rigidbody;
var feetPart : FeetParticle;

@Space(30)
var maxJumpForce : float = 100;
var jumpForceTime : float = .1;
var jumpForceTimeAdd : float;
var maxJumpForceTimeAdd : float = .4;
var maxJumpSpeed : float = 10.0;
private var currentJumpTargetSpeed : float;

@Space(30)
var isGrounded : boolean;
var groundedTime : float;
var lastTouchGroundTime : float;
var extendGroundedTime : float = .15;
var lastJumpTime : float;
var jumpButtonTime : float;
var maxJumpTime : float = .2;
var longJumpMultiplier : float = 2.0;
var floorNormalBias : float = .1;
var requiredGroundTime : float = .5;

@Space(30)
var maxSlopeAngle : float = 60.0;	

@Space(30)
var side : int;
static var left = -1;
static var right = 1;

@Space(30)
var airDrag : float = 0.2;

@Space(30)
var squashScript : Squash;
var compressMultiplier : float = 1.0;

@Space(30)
var slopeAngle : float;
var groundDistance : float;
var leftDistance : float;
var rightDistance : float;
var floorNormal : Vector3;

@Space(30)
var enableWallJump : boolean;
var wallJump : boolean;
var wallJumpMultiplier : float = 3.0;
var wallJumpAnim : PlayStillAnimation;

@Space(30)
var firstJump :boolean;
var buttonLock : boolean;
var jumpedThisFrame : boolean;
private var jumpedUntilLand : boolean;
private var airJumpsUsed : int;
private var wallJumpsUsed : int;
private var lastWallJumpSide : int;
private var maxAirJumps : int = 1;
private var minTimeBetweenJumps : float = 0.3;
private var airJumpPower : float = 0.3333334;
private var groundJumpPower : float = 1.0;
private var currentJumpForceMul : float = 1.0;
private var jumpWeightCompensation : float = 1.1;
private var isPlayer : boolean;
private var wallJumpForceMul : float = 1.1;
private var wallJumpRange : float = 0.6;
private var wallJumpMinAngle : float = 75;
private var wallJumpBuffer : float = 0.2;
private var wallContactGrace : float = 0.12;
private var wallJumpPressUntil : float;
private var wallContactUntil : float;
private var wallJumpSide : int;
private var wallJumpRise : boolean;
@Space(30)
var isUnderwater : boolean;
var swimTime : float = .3;
var swimMultiplier : float = .4;
var waterSurfaceDeepness : float = .5;
var waterJumpOutMultiplier : float = 1.5;

@Space(30)
var jumpSound : AudioSource;
var jumpSoundPitchRange : Vector2 = Vector2(.6,1.0);
var swimSound : AudioSource;

@Space(30)
var disableJumpUntil : float;
var disable : boolean;

@Space(30)
var enableGrabLedge : boolean;
var grabbingLedgeLeft : ToggleBoolean;
var grabbingLedgeRight : ToggleBoolean;
var smokeHand : Transform;
var smokeHandTimer : Timer;
var ledgeGrabFriction : float = 2.0;
var ledgeGrab_VelocityReduce : float = 0.5;

@Space(30)
var edgeJumpAnim : PlayStillAnimation;
var edgeJump_GroundHeight : float = 1.0;

@Space(30)
var springMul : float = 2.0;
var useSpringVector : boolean;
var springVector : Vector3;
var springAir : boolean;
var verticalUntil : float;
private var springActionWindow : float = 0.25;
private var springContact : Spring;
private var springContactUntil : float;



function IsPlayerCharacter() : boolean {
	var t : Transform = transform;
	while(t != null){
		if(t.tag == "Player"){
			return true;
		}
		t = t.parent;
	}
	return false;
}

function Start () {
	if(smokeHandTimer.every == 0.0){
		smokeHandTimer.every = .2;
	}

	friction =  transform.parent.gameObject.GetComponentInChildren(StopFrictionDrag);

	if(isGroundedScript == null) isGroundedScript = transform.parent.gameObject.GetComponentInChildren(IsGrounded);
	if(sideMovementScript == null) sideMovementScript = transform.parent.gameObject.GetComponentInChildren(SideMovement);
	if(squashScript == null) squashScript = transform.parent.gameObject.GetComponentInChildren(Squash);
	if(sideDetection == null) sideDetection = transform.parent.gameObject.GetComponentInChildren(SideDetection);
	if(underWaterScript == null) underWaterScript = transform.parent.gameObject.GetComponentInChildren(UnderWater);
	if(input == null) input = transform.parent.gameObject.GetComponentInChildren(ControllerInput);
	if(characterRigidbody == null) characterRigidbody = transform.parent.gameObject.GetComponentInChildren(Rigidbody);

	isPlayer = IsPlayerCharacter();
	if(isPlayer && maxSlopeAngle <= 61.0) maxSlopeAngle = 70.0;

	feetPart = transform.parent.GetComponentInChildren.<FeetParticle>();

}

function Update(){
	if(jumpForceTimeAdd > 0){
		jumpForceTimeAdd -= Time.deltaTime;
	}
	else{
		jumpForceTimeAdd = 0.0;
	}
	if(jumpForceTimeAdd > maxJumpForceTimeAdd){
		jumpForceTimeAdd = maxJumpForceTimeAdd;
	}

	//Grab Ledge
	grabbingLedgeLeft.current = false;
	grabbingLedgeRight.current = false;

	if(enableGrabLedge && !isGroundedScript.mostlyGrounded && characterRigidbody.velocity.y < 1.0){

		if(sideDetection.IsLeftSideBlocked() && input.inputAxis.current.x < -.5){
			grabbingLedgeLeft.current = true;
		}

		if(sideDetection.IsRightSideBlocked() && input.inputAxis.current.x > .5){
			grabbingLedgeRight.current = true;
		}

	}

	if(input.inputButtonB.pressed){
		grabbingLedgeRight.current = false;
		grabbingLedgeRight.current = false;
		characterRigidbody.drag = friction.defaultDrag;
	}

    grabbingLedgeLeft.Update();
    grabbingLedgeRight.Update();

    if(grabbingLedgeLeft.current || grabbingLedgeRight.current){
    	feetPart.disableSoundUntil = Time.time + .1;
    	if(smokeHand != null){
    		smokeHandTimer.Update();
    		if(smokeHandTimer.current){
    			feetPart.SmokePos(smokeHand.position);
    		}
    	}
    	characterRigidbody.velocity = Vector3.Lerp(characterRigidbody.velocity, Vector3.zero, ledgeGrabFriction * Time.deltaTime);
    }

    if(grabbingLedgeLeft.toggledTrue || grabbingLedgeRight.toggledTrue){
    	characterRigidbody.velocity *= ledgeGrab_VelocityReduce;
    }


	if(disable){
		disableJumpUntil = Time.time + .5;
	}

	if(isGroundedScript.isGrounded && Mathf.Abs(isGroundedScript.slopeAngle) < maxSlopeAngle){
		if(jumpedUntilLand && Time.time > lastJumpTime + 0.1){
			jumpedUntilLand = false;
			airJumpsUsed = 0;
			wallJumpsUsed = 0;
			lastWallJumpSide = 0;
		}
		if(!jumpedUntilLand){
			lastTouchGroundTime = Time.time;
		}
	}
	if(Time.time > lastTouchGroundTime + extendGroundedTime){
		isGrounded = false;
	}
	else{
		isGrounded = true;
	}
	
	//isGrounded = isGroundedScript.isGrounded;
	side = sideMovementScript.currentSide; //1 is going right, -1 is going left.
	slopeAngle = isGroundedScript.slopeAngle;
	floorNormal = isGroundedScript.floorNormal;
	
	if(underWaterScript != null) isUnderwater = underWaterScript.isUnderwater.current;
	
	jumpedThisFrame = false;
	
	leftDistance = sideDetection.GetLeftDistance();
	rightDistance = sideDetection.GetRightDistance();
	
	//currentGroundCollider is sized by IsGrounded.rays (1 with useSingleRay), never assume two slots.
	var groundCols : Collider[] = isGroundedScript.currentGroundCollider;
	if(groundCols != null){
		for(var springHit : int = 0; springHit < groundCols.Length; springHit++){
			if(groundCols[springHit] == null) continue;
			var touchedSpring : Spring = groundCols[springHit].GetComponentInChildren.<Spring>();
			if(touchedSpring != null){
				springContact = touchedSpring;
				springContactUntil = Time.time + springActionWindow;
				break;
			}
		}
	}

	if(isGrounded){
		groundedTime += Time.deltaTime;

		if(springAir){
			useSpringVector = false;
			springAir = false;
		}
	}
	else{
		groundedTime = 0;

		if(useSpringVector){
			springAir = true;
		}
	}

	if(!isGrounded){
		characterRigidbody.velocity.x = Mathf.Lerp(characterRigidbody.velocity.x, 0, Time.deltaTime * airDrag);

	}
	
	squashScript.squashAmount += jumpButtonTime * compressMultiplier;

}

function FixedUpdate(){
    var didWallJump : boolean = false;

    if(isPlayer && !isUnderwater && !isGrounded && input.inputButtonB.down){
    	wallJumpPressUntil = Time.time + wallJumpBuffer;
    }
    if(isPlayer){
    	var leftDist : float = sideDetection.GetLeftDistance();
    	var rightDist : float = sideDetection.GetRightDistance();
    	var leftNormal : Vector3 = sideDetection.GetLeftNormal();
    	var rightNormal : Vector3 = sideDetection.GetRightNormal();
    	var leftAngle : float = Mathf.Atan2(leftNormal.x, leftNormal.y) * Mathf.Rad2Deg;
    	var rightAngle : float = Mathf.Atan2(rightNormal.x, rightNormal.y) * Mathf.Rad2Deg;
    	var leftSideWall : boolean = leftDist < wallJumpRange && Mathf.Abs(leftAngle) >= wallJumpMinAngle;
    	var rightSideWall : boolean = rightDist < wallJumpRange && Mathf.Abs(rightAngle) >= wallJumpMinAngle;
    	if(leftSideWall || rightSideWall){
    		wallContactUntil = Time.time + wallContactGrace;
    		if(rightSideWall && (!leftSideWall || rightDist <= leftDist)) wallJumpSide = 1;
    		else wallJumpSide = -1;
    	}
    }

    if(Time.time > disableJumpUntil){
        if(!buttonLock){
        	var edgeJump : boolean;
		    if(grabbingLedgeLeft.current && sideDetection.leftGroundHeight < edgeJump_GroundHeight){
		    	if(input.inputButtonB.pressed && input.inputAxis.current.x < -.5){
		    		jumpButtonTime += Time.deltaTime;
		    	}
                if(input.inputButtonB.up || jumpButtonTime > maxJumpTime){
                    ApplyJump();
                    if(edgeJumpAnim != null){
						edgeJumpAnim.animationPlay.current = true;
                    }
                }
                edgeJump = true;
                useSpringVector = false;
	   		}

		    if(grabbingLedgeRight.current && sideDetection.rightGroundHeight < edgeJump_GroundHeight){
		    	if(input.inputButtonB.pressed && input.inputAxis.current.x > .5){
		    		jumpButtonTime += Time.deltaTime;
		    	}
                if(input.inputButtonB.up || jumpButtonTime > maxJumpTime){
                    ApplyJump();
                    if(edgeJumpAnim != null){
						edgeJumpAnim.animationPlay.current = true;
                    }
                }
				edgeJump = true;
				useSpringVector = false;
	   		}

	        //Wall Jump
	        if(enableWallJump){
	            if(!isUnderwater && !isGrounded && !edgeJump){
                    if(isPlayer){
                    	if(wallJumpSide != lastWallJumpSide){
                    		wallJumpsUsed = 0;
                    	}
                    	if(Time.time <= wallContactUntil && Time.time <= wallJumpPressUntil && wallJumpsUsed < 2){
                            jumpButtonTime = maxJumpTime;
							
                            sideMovementScript.disableMovementUntil = Time.time + .4;
							
                            if(wallJumpAnim != null){
                                wallJumpAnim.animationPlay.current = true;
                            }
													
                            wallJump = true;
                            useSpringVector = false;
                            ApplyJump();
                            wallJumpRise = true;
                            didWallJump = true;
                            wallJumpsUsed++;
                            lastWallJumpSide = wallJumpSide;
                            currentJumpTargetSpeed = maxJumpSpeed * longJumpMultiplier * wallJumpForceMul;
                        }
                    }
                    else if(sideDetection.IsLeftSideBlocked() || sideDetection.IsRightSideBlocked()){
                    	if(input.inputButtonB.down){
                            jumpButtonTime = maxJumpTime;
							
                            sideMovementScript.disableMovementUntil = Time.time + .4;
							
                            if(wallJumpAnim != null){
                                wallJumpAnim.animationPlay.current = true;
                            }
													
                            wallJump = true;
                            useSpringVector = false;
                            ApplyJump();
                        }
                    }
				}
			}

            if(!didWallJump){
            var canGroundJump : boolean = (!isPlayer || !jumpedUntilLand) && groundedTime > requiredGroundTime;
            var canAirJump : boolean = isPlayer && !isUnderwater && jumpedUntilLand && airJumpsUsed < maxAirJumps && Time.time >= lastJumpTime + minTimeBetweenJumps;
            if(canGroundJump || canAirJump || isUnderwater){
                if(input.inputButtonB.pressed){
                    if(!isUnderwater || Time.time > lastJumpTime + swimTime){
                    	//ApplyJump();
                        jumpButtonTime += Time.deltaTime;
                       }
                }
				

                if(input.inputButtonB.up || jumpButtonTime > maxJumpTime){
                    ApplyJump();
                }
            }
            }
        }
		
        //Jump if pressing button, and suddenly character is not grounded.
        if(!didWallJump && !isUnderwater && jumpButtonTime > 0 && !isGrounded){
            ApplyJump();
        }
	}

    if(wallJumpRise && Time.time >= lastJumpTime + jumpForceTime + jumpForceTimeAdd){
    	wallJumpRise = false;
    }

    if(!input.inputButtonB.pressed){ 
        if(!isUnderwater || Time.time > lastJumpTime + swimTime){
            jumpButtonTime = 0;
            buttonLock = false;
        }
    }

	groundDistance = isGroundedScript.GetGroundDistance();

	//Apply force over a period of time.
	if(Time.time < lastJumpTime + jumpForceTime + jumpForceTimeAdd && firstJump){
		var jumpForceVelocityAdjust : float = 1 - Mathf.Max(0,characterRigidbody.velocity.y) / currentJumpTargetSpeed;
		jumpForceVelocityAdjust = Mathf.Clamp01(jumpForceVelocityAdjust);
		
		var useJumpMul : float = currentJumpForceMul;
		if(wallJump || wallJumpRise) useJumpMul = wallJumpForceMul;
		else if(isPlayer) useJumpMul *= jumpWeightCompensation;
		var jumpForce : float = maxJumpForce * jumpForceVelocityAdjust * useJumpMul;
		
		var jumpVector : Vector3;
		if(!wallJump){
			if(isPlayer && Mathf.Abs(slopeAngle) > 12.0){
				jumpVector = Vector3.up * jumpForce;
			}
			else{
				jumpVector = Vector3.Lerp(Vector3.up, floorNormal, floorNormalBias) * jumpForce;
			}
			if(useSpringVector){
				jumpVector = springVector * jumpForce;
			}
		}
		else{
			//Debug.Log("wall jump @" + Time.time);
			wallJump = false;
			var rightWall : boolean = sideDetection.IsRightSideBlocked();
			if(isPlayer) rightWall = wallJumpSide == 1;
			if(rightWall){
				jumpVector = Vector3.right * jumpForce * wallJumpMultiplier;
				sideMovementScript.currentSide = -1.0;
				sideMovementScript.currentHorizontalScale =  Mathf.Sign(-1.0);
				
				if(feetPart != null && sideDetection.rightDistance < 3.0){
					feetPart.SmokePos(transform.position + Vector3.left * sideDetection.rightDistance);
				}
			}
			else{
				jumpVector = Vector3.left * jumpForce * wallJumpMultiplier;
				sideMovementScript.currentSide = 1.0;
				sideMovementScript.currentHorizontalScale =  Mathf.Sign(1.0);
				
				if(feetPart != null && sideDetection.leftDistance < 3.0){
					feetPart.SmokePos(transform.position + Vector3.right * sideDetection.leftDistance);
				}
			}
			
		}
			
		
		if(isUnderwater){
			var vectorMagnitude : float = jumpVector.magnitude * swimMultiplier;

			jumpVector = (jumpVector - (Vector3.right * input.inputAxis.current.x * jumpForce)).normalized * vectorMagnitude;
			
			if(underWaterScript.deepness < waterSurfaceDeepness){
				jumpVector *= waterJumpOutMultiplier;
			}
		}
		
		//Disable jump until.
		//if(Time.time > disableJumpUntil) 

		if(Time.time < verticalUntil){
			jumpVector = Vector3.up * jumpVector.magnitude;
		}

		characterRigidbody.AddForce(jumpVector);
		DebugUtility.DrawArrow(transform.position, jumpVector);

		DebugUtility.DrawArrow(transform.position, jumpVector * .01, Color.magenta);
	}

}

function ApplyJump(){
	wallJumpRise = false;
	wallJumpPressUntil = 0;
	disableJumpUntil = Time.time + .1;

	var isAirJump : boolean = isPlayer && !isUnderwater && jumpedUntilLand;
	if(isPlayer){
		if(isAirJump){
			airJumpsUsed++;
		}
		jumpedUntilLand = true;
		groundedTime = 0;
		isGrounded = false;
	}

	var jumpMultiplier : float = 1.0 + (longJumpMultiplier-1) * (jumpButtonTime / maxJumpTime);

	currentJumpForceMul = isPlayer ? (isAirJump ? airJumpPower * groundJumpPower : groundJumpPower) : 1.0;
	currentJumpTargetSpeed = maxJumpSpeed * jumpMultiplier * currentJumpForceMul;

	lastJumpTime = Time.time;
	
	jumpButtonTime = 0;
	
	firstJump = true;
	
	jumpedThisFrame = true;
	
	buttonLock = true;
	
	if(!isUnderwater){
		if(jumpSound != null){
			var useSound : AudioSource = jumpSound;
			for(var i = 0; i < 2; i ++){
				if(isGroundedScript.currentGroundCollider[i] == null){
					continue;
				}
				var spring : Spring = isGroundedScript.currentGroundCollider[i].GetComponentInChildren.<Spring>();
				if(spring != null){
					useSound = spring.jumpSound;

					var springVal : float = spring.GetSpringVal(this);

					currentJumpTargetSpeed *= springVal * 5.0;
					jumpForceTimeAdd = (springVal-1.0) * springMul;

					jumpForceTimeAdd = Mathf.Clamp(jumpForceTimeAdd,0,maxJumpForceTimeAdd);

					useSpringVector = true;
					springVector = spring.transform.up;

					verticalUntil = spring.verticalDuration;
					springContact = null;
					springContactUntil = 0;

					break;
				}
			}

			if(!useSpringVector && Time.time <= springContactUntil && springContact != null){
				useSound = springContact.jumpSound;

				springVal = springContact.GetSpringVal(this);

				currentJumpTargetSpeed *= springVal * 5.0;
				jumpForceTimeAdd = (springVal-1.0) * springMul;

				jumpForceTimeAdd = Mathf.Clamp(jumpForceTimeAdd,0,maxJumpForceTimeAdd);

				useSpringVector = true;
				springVector = springContact.transform.up;

				verticalUntil = springContact.verticalDuration;
				springContact = null;
				springContactUntil = 0;
			}

			useSound.pitch = Random.Range(jumpSoundPitchRange.x, jumpSoundPitchRange.y);
			useSound.Play();
		}
	}
	else{
		if(swimSound != null){
			swimSound.pitch = Random.Range(jumpSoundPitchRange.x, jumpSoundPitchRange.y);
			swimSound.Play();
		}		
	}
}

function GetLastJumpTime() : float{
	return lastJumpTime;
}

function GetJumpButtonTime() : float{
	return jumpButtonTime;
}

function JumpedThisFrame() : boolean{
	return jumpedThisFrame;
}
// compile
