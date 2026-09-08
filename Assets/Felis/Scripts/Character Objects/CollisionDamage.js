#pragma strict

var damagePower : float = 10.0;

var exp : boolean;
var explode : boolean = true;

var minSpeed : float = .5;

var sType : SpeedType;

var sound : PlayRandomSound;

var isGrounded : IsGrounded;
var onlyAirDamage : boolean;

var maxDamage : float = 9999;
var minDamage : float = 0.0;


var dotMultiply : boolean;
var dotMultiply_Min : float = .2;

var crushCollidingH: Health;
var lastCollidingTime : float;

var crushKill : CollisionDamage;

var quake : boolean;
var cameraShakiness : Shakiness;
var quakeMul : float;
var rb : Rigidbody;
var useQuakeRange : boolean = true;
var qRange : float = 10.0;
var playerTag : String = "Player";
var player : GameObject;
var getTimer : Timer;
var qSound : PlayRandomSound;
var qSoundMul : float = 2.0;

var ignoreRB : Rigidbody[];

var effectPrefab : GameObject;
var ef_DisableUntil : float;
var ef_DisableDuration : float = .5;
var ef_MinDamage : float = 10.0;

enum SpeedType{Relative, This, Other}

function Start () {
	sound = GetComponentInChildren.<PlayRandomSound>();

	if(Camera.main.transform.parent != null){
		cameraShakiness = Camera.main.transform.parent.GetComponent(Shakiness);
	}

	if(rb == null){
		rb = GetComponent.<Rigidbody>();
	}

	if(getTimer.every == 0.0){
		getTimer.every = 1.0;
	}
}

function Update () {
	if(crushKill != null){
		if(crushKill.crushCollidingH != null && crushKill.crushCollidingH == crushCollidingH && Mathf.Abs(lastCollidingTime - crushKill.lastCollidingTime) < .2){
			if(crushCollidingH.fakeDestroy){
				crushCollidingH.FakeDestroy();
			}
			else{
				crushCollidingH.health = 0.0;
			}
		}
	}

	getTimer.Update();
	if(getTimer.current){
		player = GameObject.FindGameObjectWithTag(playerTag);
	}
}

function OnCollisionEnter(c : Collision){
	for(var i = 0; i < ignoreRB.Length; i++){
		if(c.rigidbody == ignoreRB[i]){
			return;
		}
	}


	var speed : float;

	switch(sType){
		case SpeedType.Relative:
			speed = c.relativeVelocity.magnitude;
			break;
		case SpeedType.This:
			speed = rb.velocity.magnitude;
			break;
		case SpeedType.Other:
			speed = c.rigidbody.velocity.magnitude;
			break;
	}

	var rangeMul : float = 1.0;

	if(useQuakeRange){
		rangeMul = 0.0;
		if(player != null){
			var dist : float = Vector3.Distance(transform.position, player.transform.position);
			rangeMul = (Mathf.Max(0,qRange - dist)) / qRange;
	
		}
	}

	if(quake && cameraShakiness != null && rb != null){
		cameraShakiness.multiplier = rb.velocity.magnitude * quakeMul * rangeMul;
		if(qSound != null){
			qSound.PlaySound(cameraShakiness.multiplier * qSoundMul);
		}
	}

	var health : Health = c.gameObject.GetComponentInChildren.<Health>();

	 if(health != null){
	 	crushCollidingH = health;

	 	var damage : float = speed * damagePower;

	 	if(exp){
	 		damage *= damage;
	 	}

		if(dotMultiply){
			var dotMul : float = (Vector3.Dot(rb.velocity.normalized, (health.transform.position - transform.position).normalized) + 1) / 2.0;
			if(dotMul > dotMultiply_Min){
				damage *= dotMul;
			}
			else{
				damage = 0.0;
			}
		}

	 	if(speed > minSpeed && damage > minDamage){
		 	if(isGrounded != null && !isGrounded.isGrounded && onlyAirDamage || isGrounded == null || !onlyAirDamage){
	 			health.health -= Mathf.Min(maxDamage,damage);

	 			if(effectPrefab != null && damage > ef_MinDamage && Time.time > ef_DisableUntil){
	 				ef_DisableUntil = Time.time + ef_DisableDuration;
	 				var newEffect : GameObject = GameObject.Instantiate(effectPrefab);
	 				newEffect.transform.position = c.contacts[0].point;
	 			}

			 	if(sound != null){
			 		sound.PlaySound();
			 	}
	 		}

	 	}

	 	if(explode && health.health < 1.0){
	 		if(health.fakeDestroy){
				health.FakeDestroy();
			}
	 	}

	 }
	 else{
	 	crushCollidingH = null;
	 }
}

function OnCollisionStay(c : Collision){
	lastCollidingTime = Time.time;
}