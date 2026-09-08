#pragma strict

static var left : int = -1;
static var right : int = -1;

var autoFindComponents : boolean = true;

var isGroundedScript : IsGrounded;
var sideMovementScript : SideMovement;
var jumpScript : JumpSwim;
var underWaterScript : UnderWater;
var characterRigidbody : Rigidbody;

var smokePrefab : GameObject;
var animationComponent : Animation;
var runAnimation : AnimationClip;

var leftFootSmokeTime : float;
var rightFootSmokeTime : float;
var feetSmokeTimeout : float;

private var leftFootSmokeLock : boolean;
private var rightFootSmokeLock : boolean;

private var currentSmokeFeet : int = left;

var feetParticlePosition : Vector3;
var randomizeX : float = .1;
var minSpeedForSpeedSmoke : float = 2.0;

var minFallSpeedForLandingSmoke : float = 2.0;

private var wasGrounded : boolean;

private	var side : int;
private	var isGrounded : boolean;
private	var groundDistance : float;
private	var slopeAngle : float;
private	var jumpedThisFrame : boolean;

var skidThisFrame : boolean;
var minSkidSpeedForSpeedSmoke : float = 1.0;

var skidParticleSpeed : float = 5.0;

var maxSmokeRate : float = 10.0;
private var nextSmokeTime : float;

var maxParticleDistance : float = .3;

var maxGroundDistance : float = .2;

var pushParticleSpeed : float = 1.0;

var isUnderwater : boolean;

var stepSound : AudioSource[];
var skidSound : AudioSource[];
var soundID : int;
var skidSoundID : int;
var disableSoundUntil : float;
var soundWaitDuration : float = .2;
var disableSkidSoundUntil : float;
var skidSoundWaitDuration : float = .2;
var disableUntil : float;

var fps : FPS;

//var pMngr : PoolManager;

function SetAnimComp(newAnimComp : Animation){
	animationComponent = newAnimComp;
}

function Start () {
	if(autoFindComponents){
		animationComponent = GetComponentInChildren(Animation);
		sideMovementScript = GetComponentInChildren(SideMovement);
		isGroundedScript = GetComponentInChildren(IsGrounded);
		jumpScript = GetComponentInChildren(JumpSwim);
		underWaterScript = GetComponentInChildren(UnderWater);
		characterRigidbody = GetComponentInChildren(Rigidbody);
				
		if(transform.parent != null){
			if(animationComponent == null) animationComponent = transform.parent.gameObject.GetComponentInChildren(Animation);
			if(sideMovementScript == null) sideMovementScript = transform.parent.gameObject.GetComponentInChildren(SideMovement);
			if(isGroundedScript == null) isGroundedScript = transform.parent.gameObject.GetComponentInChildren(IsGrounded);
			if(jumpScript == null) jumpScript = transform.parent.gameObject.GetComponentInChildren(JumpSwim);
			if(underWaterScript == null) underWaterScript = transform.parent.gameObject.GetComponentInChildren(UnderWater);
			if(characterRigidbody == null) characterRigidbody = transform.parent.gameObject.GetComponentInChildren(Rigidbody);
		}
	}
	
	fps = GameObject.FindObjectOfType.<FPS>();
	//pMngr = GameObject.FindObjectOfType.<PoolManager>();
}

function Update () {
	side =  sideMovementScript.currentSide;
	isGrounded = isGroundedScript.isGrounded;
	groundDistance = isGroundedScript.avgGroundDistance;
	slopeAngle = isGroundedScript.slopeAngle;
	jumpedThisFrame = jumpScript.JumpedThisFrame();

	skidThisFrame = sideMovementScript.SkidThisFrame();
	var isPushing : boolean = sideMovementScript.IsPushing();
	var hasInput : boolean = sideMovementScript.HasInput();
	
	if(underWaterScript != null)
		isUnderwater = underWaterScript.isUnderwater.current;
	else
		isUnderwater = false;
	
	//Run Smoke;
	if(animationComponent != null){
		if(isGrounded && characterRigidbody.velocity.magnitude > minSpeedForSpeedSmoke 
		|| isPushing 
		|| hasInput && isGrounded && Time.time > sideMovementScript.disableMovementUntil){
		
			if(animationComponent[runAnimation.name].normalizedTime % 1.0 > leftFootSmokeTime
			&& animationComponent[runAnimation.name].normalizedTime % 1.0 < leftFootSmokeTime + feetSmokeTimeout){
				if(!leftFootSmokeLock){
					leftFootSmokeLock = true;
					Smoke(Vector2(pushParticleSpeed * transform.right.x,  pushParticleSpeed * transform.right.y) * side);
					
				}
			}
			else{
				leftFootSmokeLock = false;
			}
			
			if(animationComponent[runAnimation.name].normalizedTime % 1.0 > rightFootSmokeTime 
			&& animationComponent[runAnimation.name].normalizedTime % 1.0 < rightFootSmokeTime + feetSmokeTimeout){
				if(!rightFootSmokeLock){
					rightFootSmokeLock = true;
					Smoke(Vector2(pushParticleSpeed * transform.right.x,  pushParticleSpeed * transform.right.y) * side);
				}
			}
			else{
				rightFootSmokeLock = false;
			}
		}
	}
	
	//Jump Smoke;
	if(isGrounded && jumpedThisFrame){
		DoubleSmoke();
	}
	
	//Landing Smoke;
	if(isGrounded && !wasGrounded){
		if(characterRigidbody.velocity.y < Mathf.Abs(minFallSpeedForLandingSmoke)){
			DoubleSmoke();
			
		}
	}
	wasGrounded = isGrounded;
	
	//Skid smoke;
	var characterVelocity : Vector2 = Vector2(characterRigidbody.velocity.x, characterRigidbody.velocity.y);
	
	if(isGrounded && skidThisFrame && characterRigidbody.velocity.magnitude > minSkidSpeedForSpeedSmoke) Smoke(characterVelocity * skidParticleSpeed);
	
	if(isGrounded && !sideMovementScript.isRunning && characterRigidbody.velocity.magnitude > minSkidSpeedForSpeedSmoke)
		SmokeInvertedSide(characterVelocity * skidParticleSpeed);
}

function Smoke(){
	if(Time.time < disableUntil){
		return;
	}

	if(!isUnderwater && isGroundedScript.GetGroundDistance() < maxGroundDistance && Time.time >= nextSmokeTime){
		var newParticlePosition : Vector3;
		var newParticle : GameObject;
		
		var useRandomizeX : float = Random.value* randomizeX - randomizeX*.5;
		newParticlePosition = transform.TransformPoint(Vector3((feetParticlePosition.x + useRandomizeX) * side, feetParticlePosition.y, feetParticlePosition.z));
		newParticlePosition.y -= Mathf.Min(maxParticleDistance, groundDistance);
		
		//newParticle = pMngr.Create(ObjType.Smoke, newParticlePosition, Quaternion.identity);
		newParticle = Instantiate(smokePrefab, newParticlePosition, Quaternion.identity);
		if(newParticle != null){
			newParticle.transform.RotateAround(transform.position, Vector3.forward, -slopeAngle); 
			newParticle.GetComponent(RandomStartSize).side = side;
		}
		
		nextSmokeTime = Time.time + (1/ maxSmokeRate);
	}
	 PlayStepSound();
}

function SmokePos(pos : Vector3){
	if(Time.time < disableUntil){
		return;
	}
	//var newParticle : GameObject = pMngr.Create(ObjType.Smoke, pos, Quaternion.identity);
	var newParticle : GameObject = Instantiate(smokePrefab, pos, Quaternion.identity);
	newParticle.GetComponent.<RandomStartSize>().side = side;
	
	nextSmokeTime = Time.time + (1/ maxSmokeRate);
	
 	 PlayStepSound();
}


function PlayStepSound(){
	if(Time.time > disableSoundUntil && stepSound != null && stepSound.Length > 0){
		stepSound[soundID].Play();
		soundID++;
		soundID = soundID % stepSound.Length;
		disableSoundUntil = Time.time + soundWaitDuration;
	}
	else{
		if(Time.time < disableSoundUntil && skidSound != null && skidSound.Length > 0 && Time.time > disableSkidSoundUntil){
			skidSound[skidSoundID].Play();
			skidSoundID ++;
			skidSoundID = skidSoundID % skidSound.Length;
			disableSkidSoundUntil = Time.time + skidSoundWaitDuration;
		}
	}
}

function Smoke(startSpeed : Vector2){
	if(Time.time < disableUntil){
		return;
	}
	if(!isUnderwater && isGroundedScript.GetGroundDistance() < maxGroundDistance && Time.time >= nextSmokeTime){
		var newParticlePosition : Vector3;
		var newParticle : GameObject;
		
		var useRandomizeX : float = Random.value* randomizeX - randomizeX*.5;
		newParticlePosition = transform.TransformPoint(Vector3((feetParticlePosition.x + useRandomizeX) * side, feetParticlePosition.y, feetParticlePosition.z));
		newParticlePosition.y -= Mathf.Min(maxParticleDistance, groundDistance);
		//newParticle = pMngr.Create(ObjType.Smoke, newParticlePosition, Quaternion.identity);
		newParticle = Instantiate(smokePrefab, newParticlePosition, Quaternion.identity);
		newParticle.transform.RotateAround(transform.position, Vector3.forward, -slopeAngle); 
		newParticle.GetComponent(RandomStartSize).side = side;
		newParticle.GetComponent(ParticleSpeed).startSpeed = startSpeed;
		
		nextSmokeTime = Time.time + (1/ maxSmokeRate);
	}
	 PlayStepSound();
}

function SmokeInvertedSide(){
	side *= -1; Smoke(); side *= -1;
}

function SmokeInvertedSide(startSpeed : Vector2){
	side *= -1; Smoke(startSpeed); side *= -1;
}

function DoubleSmoke(){
	Smoke();
	nextSmokeTime = Time.time;
	SmokeInvertedSide();
}