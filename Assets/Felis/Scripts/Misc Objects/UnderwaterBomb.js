#pragma strict

var rb : Rigidbody;

var sensitivity : float = 1.0;

var movementSensitivity : float = 2.0;
var touchSensitivity : float = 3.0;
var min : float = .1;

var alpha : VColorGroupAlpha;

var explode : boolean;

var explodePrefabs : GameObject[];

var explodeSound: AudioSource;

var explosionRadius : float = 4.0;
var explosionForce : float = 2000.0;
var upMod : float = 1.0;

var damage : float = 150;
var hurtDamage : float = 30.0;

var cForce : ConstantForce;
var setConstantForce : Vector3;

var sj : SpringJoint[];
var chainRandomize : float = 0.4;

var disableCols : Collider[];

function Start () {
	rb = GetComponent.<Rigidbody>();
	alpha = transform.parent.GetComponentInChildren.<VColorGroupAlpha>();
	cForce = GetComponent.<ConstantForce>();
	sj = transform.parent.GetComponentsInChildren.<SpringJoint>();
}

function Update () {

	var dist : float;
	
	if(rb.velocity.magnitude > min){
		sensitivity -= rb.velocity.magnitude * Time.deltaTime * movementSensitivity;
	}
	
	if(sensitivity < 0){
		if(!explode){
			
			//Alpha destroy
			alpha.setAlphaGroups[0].alpha = 0.0;
			
			//Explosion
			for(var i = 0; i < explodePrefabs.Length; i++){
				var newPrefab : GameObject = Instantiate(explodePrefabs[i]);
				newPrefab.transform.position = transform.position;
			}
			
			//Apply Force
			var allRB : Rigidbody[] = GameObject.FindObjectsOfType.<Rigidbody>();
			for(i = 0; i < allRB.Length; i++){
				allRB[i].AddExplosionForce(explosionForce, transform.position, explosionRadius, upMod);
			}
			
			//Sound
			if(explodeSound != null){
				explodeSound.Play();
			}
			
			//Apply Damage
			var allHealth : Health[] = GameObject.FindObjectsOfType.<Health>();
			for(i = 0; i < allHealth.Length; i++){
				dist = Vector3.Distance(transform.position, allHealth[i].transform.position);
				if(dist < explosionRadius){
					var range : float = 1 - (dist / explosionRadius);
					var thisDamage : float = damage * range;
					allHealth[i].health -= thisDamage;
					if(thisDamage > hurtDamage){
						if(allHealth[i].transform.parent != null){
							var hurt : Hurt = allHealth[i].transform.parent.GetComponentInChildren.<Hurt>();
							if(hurt != null){
								hurt.hurt.current = true;
							}
						}
					}
				}
			}

			for(var col : Collider in disableCols){
				col.enabled = false;
			}
			
			//Change constant force
			cForce.force = setConstantForce;
			
			//sj
			for(i = 0; i < sj.Length; i++){
				sj[i].autoConfigureConnectedAnchor = false;
				sj[i].connectedAnchor.y += Random.Range(-chainRandomize,chainRandomize);
				sj[i].connectedAnchor.x += Random.Range(-chainRandomize,chainRandomize);
			}
			

			
		}
		explode = true;
	}
}



function OnCollisionStay(col : Collision){
	if(col.contacts.Length > 0){
		sensitivity -= touchSensitivity * Time.deltaTime;
	}
}