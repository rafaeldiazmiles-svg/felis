#pragma strict

var glow : GlowItem;
var glowColor : Color;
var glowDefColor : Color;

@Space(30)
var putOn : boolean;
var hairLocks : Transform[];
var shrinkAmount : float = .2;
var shrinkCenterOffset : Vector3;
var useOtherHairShrinkCenter : Transform;

@Space(30)
var playerTag : String = "Player";
var player : GameObject;

@Space(30)
var attack : MeleeAttack;
var hurt : Hurt;
var movement : SideMovement;

@Space(30)
var hatRend : Renderer;

@Space(30)
var putOnPuffPrefab : GameObject;
var puffSound : AudioSource;

@Space(30)
var globalValues : HoldGlobalValues;
var globalValuesName : String = "Hold Global Values";

function Start () {
	hatRend = GetComponentInChildren.<Renderer>();

	var gVals : GameObject = GameObject.Find(globalValuesName);
	if(gVals != null){
		globalValues = gVals .GetComponent(HoldGlobalValues);
	}
}

function LateUpdate () {
	var puff : GameObject;
	
	if(!putOn && transform.parent != null){
		putOn = true;
		
		glow = transform.parent.GetComponentInChildren.<GlowItem>();
		if(glow != null){
			glowDefColor = glow.startColor;
			glow.startColor = glowColor;
		}

		
		var hairLocksArray : Array = new Array();
		for(var i = 0; i < transform.parent.childCount; i++){	
			if(transform.parent.GetChild(i).name.Contains("Hair")){
				hairLocksArray.Push(transform.parent.GetChild(i));
			}
		}
		hairLocks = hairLocksArray.ToBuiltin(Transform);
		
		player = GameObject.FindGameObjectWithTag(playerTag);
		attack = player.GetComponentInChildren.<MeleeAttack>();
		
		movement = player.GetComponentInChildren.<SideMovement>();
		if(movement != null){
			movement.disableMovementUntil = Time.time + .5;
		}

		if(attack != null){
			attack.lockPunch = true;
			attack.throwFireball = true;
		}

		hurt = player.GetComponentInChildren.<Hurt>();
		
		hatRend.enabled = true;
		
		puff = GameObject.Instantiate(putOnPuffPrefab);
		puff.transform.position = transform.position;
		
		for(i = 0; i < transform.parent.childCount; i++){
			if(transform.parent.GetChild(i).name.Contains("Antennas")){
				player.BroadcastMessage("AntennaHat", SendMessageOptions.DontRequireReceiver);
				break;
			}
		}

		if(globalValues != null){
			globalValues.hasFireball = 1;
		}
	}
	
	if(hairLocks != null){
		for(i = 0; i < hairLocks.Length; i++){
			var useCenter : Transform;
			if(useOtherHairShrinkCenter == null){
				useCenter = transform;
			}
			else{
				useCenter = useOtherHairShrinkCenter;
			}
			hairLocks[i].position = Vector3.Lerp(hairLocks[i].position, useCenter.TransformPoint(shrinkCenterOffset), shrinkAmount);
		}
	}
	
	if(hurt != null && hurt.hurt.toggledTrue){
		puff = GameObject.Instantiate(putOnPuffPrefab);
		puff.transform.position = transform.position;
		attack.lockPunch = false;
		attack.throwFireball = false;
		puffSound.Play();
		var td : TimedDestroy = puffSound.gameObject.AddComponent.<TimedDestroy>();
		td.startTime = Time.time;
		td.destroyTriggerTime = 1.5;
		puffSound.transform.parent = null;
		
		glow.startColor = glowDefColor;

		if(globalValues != null){
			globalValues.hasFireball = 0;
		}


		Destroy(gameObject);			
	}	
}