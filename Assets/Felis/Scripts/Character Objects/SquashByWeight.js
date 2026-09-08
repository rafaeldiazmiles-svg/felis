#pragma strict

var lowerMaxBounds : float = -.1;

var squashPhysics : SquashPhysics;

/*var testSquash : boolean;
var testInput : float = 100.0;*/

var weightSquashMultiplier : float = 20.0;

var blink : FaceAnim;

var sweatDrops : SweatDropsParticles;
var sweatDuration : float = .4;

var squeakSounds : AudioSource[];
var minSqueakVelocity : float = 8.0;
var disableSqueakSoundUntil : float;
var disableSqueakFor : float = 1.0;

var health : Health;
var damageFromWeight : float = 0.0;
var damageExp : boolean;
var minDamage : float = 5.0;

var debug : boolean;



function Start () {
	squashPhysics = GetComponentInChildren(SquashPhysics);
	blink = GetComponentInChildren(FaceAnim);
	sweatDrops = GetComponentInChildren(SweatDropsParticles);
	health = GetComponentInChildren.<Health>();
}

function Update () {

	/*if(testSquash){
		testSquash = false;
		squashPhysics.externalSquashInput = testInput;
	}*/
	
}

function OnCollisionEnter(collision : Collision){
	var topOfHead : boolean;
	
	var headLine : float = GetComponent.<Collider>().bounds.max.y + lowerMaxBounds;
	
	for(var i = 0; i < collision.contacts.Length; i++){
		//DebugUtility.DrawPoint(collision.contacts[i].point, .3, Color.yellow, .5);
		if(collision.contacts[i].point.y > headLine){
			topOfHead = true;
		}
	}
	if(topOfHead){
		if(collision.relativeVelocity.y  < 0){
			if(squashPhysics!= null){
				squashPhysics.externalSquashInput = -collision.relativeVelocity.y * weightSquashMultiplier;
			}
			if(blink != null){
				blink.blinking.B.current = true;
			}
			if(sweatDrops != null){
				sweatDrops.forceSweatDropUntil = Time.time + sweatDuration;
			}
			
			if(squeakSounds != null && Time.time > disableSqueakSoundUntil && squeakSounds.Length > 0 && collision.relativeVelocity.y < -minSqueakVelocity){
				squeakSounds[Random.value * squeakSounds.Length].Play();
				disableSqueakSoundUntil = Time.time + disableSqueakFor;
			}

			if(health != null){
				var damage : float = -collision.relativeVelocity.y * damageFromWeight;
				if(damageExp){
					damage *= damage;
				}
				if(damage > minDamage){
					health.health -= damage;
				}

			}
		}
	}
}

function OnDrawGizmosSelected(){
	if(debug){
		var headLine : float = GetComponent.<Collider>().bounds.max.y + lowerMaxBounds;
		Debug.DrawRay(Vector3(transform.position.x - 1, headLine, transform.position.z), Vector3(2,0,0), Color.red);
	}
		
}