#pragma strict

var wingedFlightAI : WingedFlightAI;
var isGrounded : IsGrounded;
var attack : MeleeAttackSimple;

var beeTag : String = "Bee";
var beeNestTag : String = "Bee Nest";
var ignoreTag : String [];

var useAttackTargets : boolean = true;
var targets : Transform[];

var closestTargetInRange : Transform;
var targetDetectRange : float = 6.0;

//var defaulTargetPos : Vector3;
var idleMinHeight : float = 2.0;
var targetOffset : Vector3 = Vector3(0,1,0);

var attackDistance : float = 2.0;

var frameGroups : UVFrameGroups;
var animationComponent : Animation;
var leftWingAnim : AnimationClip;
var rightWingAnim : AnimationClip;
var leftWingSwing : ToggleBoolean;
var rightWingSwing : ToggleBoolean;

var attackOffetHeight : float = .2;
var attackTimer : Timer;
private var attackRateMul : float = 0.48;
private var minAttackEvery : float = 0.3;

var groundTag : String = "Ground Collider";

var playerTag : String = "Player";
var player : GameObject;
var beeBody : Rigidbody;
private var nextFindPlayerTime : float;
var playerBumpRange : float = 0.85;
var playerBumpSpeed : float = 5.0;
var playerBumpForce : float = 50.0;
var playerBumpStun : float = 0.2;
var bumpCooldown : float = 0.3;
private var lastBumpTime : float;
private var knockbackUntil : float;

function Start () {
	wingedFlightAI = transform.parent.GetComponentInChildren(WingedFlightAI);
	isGrounded = transform.parent.GetComponentInChildren(IsGrounded);
	attack = transform.parent.GetComponentInChildren(MeleeAttackSimple);
	frameGroups = transform.parent.GetComponentInChildren(UVFrameGroups);
	animationComponent = transform.parent.GetComponent(Animation);

	beeBody = transform.parent.GetComponentInChildren(Rigidbody);
	player = GameObject.FindGameObjectWithTag(playerTag);

	if(attackTimer.every > 0.0){
		attackTimer.every *= attackRateMul;
		if(attackTimer.every < minAttackEvery) attackTimer.every = minAttackEvery;
	}
	
	GetTargets();
	/*var targetsArray = new Array();
	var allHealthCharacters : Health[] = GameObject.FindObjectsOfType.<Health>() as Health[];
	for(var i = 0; i < allHealthCharacters.Length; i++){
		if(allHealthCharacters[i].transform.parent.tag == beeNestTag) continue;
		if(allHealthCharacters[i].transform.parent.tag == beeTag) continue;
		var cont : boolean;
		for(var n = 0; n < ignoreTag.Length; n++){
			if(allHealthCharacters[i].transform.parent.tag == ignoreTag[n]){
				cont = true;
				break;
			}
		}
		if(cont) continue;
		
		targetsArray.Push(allHealthCharacters[i].transform.parent);
		
	}
	targets = targetsArray.ToBuiltin(Transform) as Transform[];*/
	
	//defaulTargetPos = transform.position;
}

function GetTargets(){
	if(useAttackTargets){
		targets = new Transform[attack.allEnemies.Length];
		for(var m = 0; m < targets.Length; m++){
			targets[m] = attack.allEnemies[m].transform;
		}
		return;
	}
	
	var targetsArray = new Array();
	var allHealthCharacters : Health[] = GameObject.FindObjectsOfType.<Health>() as Health[];
	for(var i = 0; i < allHealthCharacters.Length; i++){
		if(allHealthCharacters[i].transform.parent.tag == beeNestTag) continue;
		if(allHealthCharacters[i].transform.parent.tag == beeTag) continue;
		var cont : boolean;
		for(var n = 0; n < ignoreTag.Length; n++){
			if(allHealthCharacters[i].transform.parent.tag == ignoreTag[n]){
				cont = true;
				break;
			}
		}
		if(cont) continue;
		
		targetsArray.Push(allHealthCharacters[i].transform.parent);
		
	}
	targets = targetsArray.ToBuiltin(Transform) as Transform[];	
}

function Update () {
	TryPlayerCollisionBump();
	if(Time.time < knockbackUntil){
		return;
	}

	if(useAttackTargets){
		if(attack.getEnemiesTimer.current){
			GetTargets();
		}
	}

	//Detect closest target.
	closestTargetInRange = null;
	var closestTargetInRangeDistance : float;
	for(var i = 0; i < targets.Length; i++){
		if(targets[i] == null) continue;
		var currentDistance : float = Vector3.Distance(transform.position, targets[i].position);
		if(currentDistance < targetDetectRange){
			if(closestTargetInRange == null){
				closestTargetInRange = targets[i];
				closestTargetInRangeDistance = currentDistance;
			}
			else{
				if(currentDistance < closestTargetInRangeDistance){
					closestTargetInRange = targets[i];
					closestTargetInRangeDistance = currentDistance;			
				}
			}
		}
	}
	
	if(closestTargetInRange == null){
		var hits : RaycastHit[] = Physics.RaycastAll(transform.position, Vector3.down, 10.0);
		//Debug.DrawLine(transform.position, wingedFlightAI.targetPosition, Color.red);
		//DebugUtility.DrawPoint(wingedFlightAI.targetPosition,.5,Color.red);
		for(var n = 0; n < hits.Length; n++){
			if(hits[n].collider.tag != groundTag) continue;
			//DebugUtility.DrawPoint(hits[n].point,.3,Color.cyan);
			if(hits[n].point.y > wingedFlightAI.targetPosition.y){
				wingedFlightAI.targetPosition = hits[n].point + Vector3(0,idleMinHeight,0);
				wingedFlightAI.addOffset = Vector3.zero;
			}
		}
	}
	else{
		attackTimer.Update();
		wingedFlightAI.targetPosition = closestTargetInRange.position + targetOffset;
		wingedFlightAI.addOffset = Vector3(0,attackOffetHeight,0);
		var targetDistance : float = Vector3.Distance(transform.position, closestTargetInRange.position);
		if(targetDistance < attackDistance){
			
			attack.performAttack = attackTimer.current;
		}
	}
	
	if(frameGroups != null){
		leftWingSwing.Update();
		rightWingSwing.Update();
		
		if(animationComponent[leftWingAnim.name].weight > .5)leftWingSwing.current = true;
		else leftWingSwing.current = false;
		
		if(animationComponent[rightWingAnim.name].weight > .5)rightWingSwing.current = true;
		else rightWingSwing.current = false;
		
		if(leftWingSwing.toggledTrue) frameGroups.SetFrame("Left Wing", "Blur");
		if(leftWingSwing.toggledFalse) frameGroups.SetFrame("Left Wing", "Normal");	
		
		if(rightWingSwing.toggledTrue) frameGroups.SetFrame("Right Wing", "Blur");
		if(rightWingSwing.toggledFalse) frameGroups.SetFrame("Right Wing", "Normal");	
		
	}
}

function OnCollisionEnter(c : Collision){
	if(c == null || c.collider == null){
		return;
	}
	if(IsPlayerTransform(c.collider.transform)){
		ApplyPlayerBump(c.collider.transform);
	}
}

function OnCollisionStay(c : Collision){
	OnCollisionEnter(c);
}

function TryPlayerCollisionBump(){
	if(Time.time < lastBumpTime + bumpCooldown){
		return;
	}
	if(beeBody == null){
		return;
	}
	if(player == null || Time.time > nextFindPlayerTime){
		nextFindPlayerTime = Time.time + 1.0;
		player = GameObject.FindGameObjectWithTag(playerTag);
	}
	if(player == null){
		return;
	}
	if(Vector3.Distance(beeBody.position, player.transform.position) > playerBumpRange){
		return;
	}
	ApplyPlayerBump(player.transform);
}

function ApplyPlayerBump(playerT : Transform){
	if(playerT == null || beeBody == null){
		return;
	}
	if(Time.time < lastBumpTime + bumpCooldown){
		return;
	}
	lastBumpTime = Time.time;
	knockbackUntil = Time.time + playerBumpStun;
	if(wingedFlightAI != null){
		wingedFlightAI.disableUntil = knockbackUntil;
		if(wingedFlightAI.wingedFlight != null){
			wingedFlightAI.wingedFlight.flapLeft = false;
			wingedFlightAI.wingedFlight.flapRight = false;
		}
	}
	if(attack != null){
		attack.performAttack = false;
	}
	var dirX : float = Mathf.Sign(beeBody.position.x - playerT.position.x);
	if(dirX == 0.0){
		dirX = 1.0;
	}
	PhysicsUtility.ApplyForceForVelocity(beeBody, Vector3(playerBumpSpeed * dirX, 0, 0), playerBumpForce);
}

function IsPlayerTransform(t : Transform) : boolean {
	var p : Transform = t;
	while(p != null){
		if(p.tag == playerTag){
			return true;
		}
		p = p.parent;
	}
	return false;
}