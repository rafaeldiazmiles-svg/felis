#pragma strict

var getPlayerTag : boolean = true;
var playerTag : String = "Player";
var targetCharacter : Transform;

var attackOnFreeWill : boolean;
var tolerance : float;
var maxTolerance : float;
var maxToleranceVariation : Vector2;

var characterInRange : boolean;

var attackClip : AnimationClip;
var layer : int;

var attack : boolean;

var lastAttackTime : float;

var isAttacking : boolean;

var animationBlendInSpeed : float = 20.0;
var animationBlendOutSpeed : float = 7.0;

var attackAnimationWeightControl : FloatLerp;

var sideMovement : SideMovement;

var isGrounded : IsGrounded;

var attackRange : float = 1.0;
var attackForce : float = 500;
var appliedForce : boolean;
var attackForceTime : float = .2;
var attackForceTimeEnd : float = .5;
var lastForceTime : float;

var skidEffectDuration : float = 0.6;

var enableAttack : boolean = true;

var disableUntil : float; //disable attack until specified time.

var disableTimeAfterHit : float = 2.0;

var attackDelayMul : float = 0.7;
var attackDisableMul : float = 0.6;
var minAttackGap : float = 0.4;
private var frequentAttacker : boolean; //Rats and bears attack more often and follow up with an extra strike.
private var usedExtraStrike : boolean;

function Start () {
	attackAnimationWeightControl = new FloatLerp();
	//attackAnimationWeightControl.speed = animationBlendSpeed;

	var rootName : String = transform.root.name;
	frequentAttacker = rootName.Contains("Bear") || rootName.Contains("Rat");
	if(frequentAttacker){
		maxTolerance *= attackDelayMul;
		maxToleranceVariation *= attackDelayMul;
		disableTimeAfterHit *= attackDisableMul;

		//Never let the gap collapse to zero, or the attack would retrigger every frame.
		if(maxToleranceVariation.x < minAttackGap) maxToleranceVariation.x = minAttackGap;
		if(maxToleranceVariation.y < maxToleranceVariation.x) maxToleranceVariation.y = maxToleranceVariation.x;
		if(maxTolerance < minAttackGap) maxTolerance = minAttackGap;
	}

	tolerance = maxTolerance;

	if(getPlayerTag){
		 GetPlayer();//targetCharacter = GameObject.FindGameObjectWithTag(playerTag).transform;
	}
}

function GetPlayer(){
	var targetCharacterObj : GameObject = GameObject.FindGameObjectWithTag(playerTag);
	if(targetCharacterObj != null) targetCharacter = targetCharacterObj.transform;
}

function Update () {
	if(targetCharacter == null) GetPlayer();
	
	//Weight animation.
	attackAnimationWeightControl.Lerp();
	GetComponent.<Animation>()[attackClip.name].weight = attackAnimationWeightControl.current;
	
	//Disable until.
	if(Time.time < disableUntil) enableAttack = false;
	else if(frequentAttacker) enableAttack = true;
	
	//Attack when boolean is true.
	if(attack && !isGrounded.isGrounded) attack = false;
	if(attack && !isAttacking && enableAttack) PerformAttack();
	
	//End attack.
	var attackEndTime : float = lastAttackTime + GetComponent.<Animation>()[attackClip.name].length;
	if(Time.time > attackEndTime){
		if(isAttacking && frequentAttacker && !usedExtraStrike && characterInRange && Time.time > disableUntil){
			usedExtraStrike = true;
			attack = true;
		}
		isAttacking = false;
		appliedForce = false;	
	}
	
	//Start reducing animation weight.		
	if(Time.time > attackEndTime - (1 / animationBlendOutSpeed)){
		attackAnimationWeightControl.speed = animationBlendOutSpeed;
		attackAnimationWeightControl.target = 0.0;
	}
	
	//Disable moving.
	if(isAttacking) sideMovement.disableMovementUntil = Time.time + .5;
	
	//Apply Force.
	if(targetCharacter != null){
		if(Mathf.Sign(targetCharacter.position.x - transform.position.x) != sideMovement.currentSide
		&& Vector3.Distance(targetCharacter.position, transform.position) < attackRange){
			characterInRange = true;
		}
		else characterInRange = false;
		
		if(characterInRange && isAttacking && !appliedForce && Time.time > lastAttackTime + attackForceTime && Time.time < lastAttackTime + attackForceTimeEnd){
			targetCharacter.GetComponent.<Rigidbody>().AddForce(Vector3.left * attackForce * sideMovement.currentSide);
			disableUntil = Time.time + disableTimeAfterHit;
			appliedForce = true;
			lastForceTime = Time.time;
			targetCharacter.GetComponent(SideMovement).forceSkidUntil = Time.time + skidEffectDuration;
			
			targetCharacter.GetComponent(Hurt).hurt.current = true;
		}
	}
	
	if(attackOnFreeWill){
		if(characterInRange)tolerance -= Time.deltaTime;
		else if(tolerance < maxTolerance) tolerance += Time.deltaTime;
		
		if(tolerance < 0){
			attack = true;
			usedExtraStrike = false;
			maxTolerance = Random.Range(maxToleranceVariation.x, maxToleranceVariation.y);
			tolerance = maxTolerance;
		}
	}
}




function PerformAttack(){
	attack = false; //Toggle back the boolean for next use.
	
	if(!isAttacking){
		lastAttackTime = Time.time;
		isAttacking = true;
		attackAnimationWeightControl.speed =animationBlendInSpeed;
		attackAnimationWeightControl.target = 1.0;
		GetComponent.<Animation>()[attackClip.name].enabled = true;
		GetComponent.<Animation>()[attackClip.name].layer = layer;
		GetComponent.<Animation>()[attackClip.name].time = 0.0;
	}
}

