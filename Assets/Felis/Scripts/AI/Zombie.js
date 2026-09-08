#pragma strict

var animationComponent : Animation;
var playAnimation : PlayStillAnimation;
var ratEnemyAI : RatEnemy;
var sideMovementAnimation : SideMovementAnimation;
var spineBalance : SpineBalance;
var characterCollider : Collider;
var characterRB : Rigidbody;
var player : Transform;
var playerTag : String = "Player";

var underGround : ToggleBoolean;;

var comeFromGround : ToggleBoolean;

var debug : boolean;

var triggerZombieBounds : Bounds;
var triggerZombie : ToggleBoolean;
var triggerZombieDelay : float;
var triggerZombieDelayRange : Vector2;
var centerBounds : boolean;
var centerOffset : Vector3;

var deleteMask : GameObject;
var deleteMask_Delay : float = 4.0;


function GetPlayer(){
	var playerObj : GameObject = GameObject.FindGameObjectWithTag(playerTag);
	if(playerObj != null) player = playerObj.transform;
}

function Start () {
	animationComponent = transform.parent.GetComponent.<Animation>();
	ratEnemyAI = transform.parent.GetComponentInChildren.<RatEnemy>();
	playAnimation = GetComponent.<PlayStillAnimation>();
	sideMovementAnimation = transform.parent.GetComponentInChildren.<SideMovementAnimation>();
	spineBalance = transform.parent.GetComponentInChildren.<SpineBalance>();
	characterCollider = transform.parent.GetComponent.<Collider>();
	characterRB = transform.parent.GetComponent.<Rigidbody>();
	GetPlayer();//player = GameObject.FindGameObjectWithTag(playerTag).transform;
	
	spineBalance.enabled = false;
	
	triggerZombieDelay = Random.Range(triggerZombieDelayRange.x, triggerZombieDelayRange.y);
	
	if(centerBounds){
		triggerZombieBounds.center = transform.position + centerOffset;
	}
}

function Update () {
	if(player == null) GetPlayer();
	
	underGround.Update();
	comeFromGround.Update();
	triggerZombie.Update();
	
	if(underGround.toggledTrue){
		animationComponent[playAnimation.stillAnimation.name].enabled = true;
		animationComponent[playAnimation.stillAnimation.name].weight = 1.0;
		animationComponent[playAnimation.stillAnimation.name].speed = 0.0;
		animationComponent[playAnimation.stillAnimation.name].time = 0.0;
		animationComponent[playAnimation.stillAnimation.name].layer = playAnimation.layer;
		playAnimation.stillAnimationWeightControl.target = 1.0;
		playAnimation.stillAnimationWeightControl.current = 1.0;
		sideMovementAnimation.cancelAnimations = true;
		characterCollider.enabled = false;
		
		spineBalance.enabled = true;

	}
	
	if(underGround.current){
		animationComponent[playAnimation.stillAnimation.name].enabled = true;
		animationComponent[playAnimation.stillAnimation.name].weight = 1.0;
		animationComponent[playAnimation.stillAnimation.name].speed = 0.0;
		animationComponent[playAnimation.stillAnimation.name].time = 0.0;
		animationComponent[playAnimation.stillAnimation.name].layer = playAnimation.layer;

		ratEnemyAI.enabled = false;
		characterRB.useGravity = false;
		characterRB.isKinematic = true;
		characterRB.velocity = Vector3.zero;
		if(player != null && triggerZombieBounds.Contains(player.position)){
			triggerZombie.current = true;
			//comeFromGround.current = true;
		}
	}
	
	if(!comeFromGround.current && triggerZombie.current && Time.time > triggerZombie.toggledTrueTime + triggerZombieDelay){
		comeFromGround.current = true;
		triggerZombie.current = false;
	}

	if(comeFromGround.toggledTrue){
		playAnimation.animationPlay.current = true;
		sideMovementAnimation.cancelAnimations = false;
		underGround.current = false;
		triggerZombie.current = false;

		if(deleteMask != null){
			var td : TimedDestroy = deleteMask.AddComponent.<TimedDestroy>();
			td.destroyTriggerTime = deleteMask_Delay;
		}
	}
	
	if(comeFromGround.current && playAnimation.animationPlay.toggledFalse){
		comeFromGround.current = false;
		ratEnemyAI.enabled = true;
		characterRB.useGravity = true;
		characterRB.isKinematic = false;
		characterCollider.enabled = true;
	}
}

function OnDrawGizmosSelected(){
	#if UNITY_EDITOR
	if(debug){
		Gizmos.DrawWireCube(triggerZombieBounds.center, triggerZombieBounds.size);
	}
	#endif
}