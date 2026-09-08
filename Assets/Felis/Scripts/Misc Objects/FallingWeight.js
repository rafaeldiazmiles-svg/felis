#pragma strict

var dontCollideWFallingWeight : int = 20;

var playerTag : String = "Player";

var damageHorizontalRange : float = .5;
var damageVerticalRange : float;

var damageRate : float;
var speedAffectsDamageRage : boolean;

var minFallingSpeedForDamage : float = .1;
var minSpeedForDamage : float = 0.1;

var onlyDamageGroundedObjs : boolean;

var debug : boolean;

var allHealth : Health[];
var pickableRB : PickableRigidbody[];

var cameraShakiness : Shakiness;

var isGrounded : IsGrounded;
var wasGrounded : boolean;

var minSpeed : float = 1.0;
var rb : Rigidbody;

var renderOnGravity : boolean = true;
var rend : Renderer;

var getTimer : Timer;

function Start () {
	GetTargets();//allHealth = GameObject.FindObjectsOfType.<Health>() as Health[];
	isGrounded = GetComponentInChildren(IsGrounded);

	if(Camera.main.transform.parent != null){
		cameraShakiness = Camera.main.transform.parent.GetComponent(Shakiness);
	}
	
	rb = FindUtility.ReverseFindRigidbody(transform);
	
	rend = GetComponentInChildren.<Renderer>();
	
	if(getTimer.every == 0.0){
		getTimer.every = 2.0;
	}


}

function GetTargets(){
	allHealth = GameObject.FindObjectsOfType.<Health>() as Health[];
	pickableRB = new PickableRigidbody[allHealth.Length];
	for(var i = 0; i < allHealth.Length; i ++){
		pickableRB[i] = allHealth[i].transform.parent.GetComponentInChildren.<PickableRigidbody>();
	}
}

function Update () {

	getTimer.Update();
	if(getTimer.current){
		GetTargets();
	}
	
	if(isGrounded.isGrounded && !wasGrounded){
		if(rb != null && rb.velocity.magnitude > minSpeed){
			if(cameraShakiness != null){
				cameraShakiness.lowQuake = true;
			}
		}
	}
	wasGrounded = isGrounded.isGrounded;
	
	UpdateAllHealth();
	
	if(renderOnGravity){
		if(rend != null && rb != null){
			rend.enabled = rb.useGravity;
		}
	}
}

function SetHRange(newRange : float){
	damageHorizontalRange = newRange;
}

function SetVRange(newRange : float){
	damageVerticalRange = newRange;
}

function UpdateAllHealth(){
	for(var i = 0; i < allHealth.Length; i ++){
		if(allHealth[i] == null){
			continue;
		}
		if(allHealth[i].immuneToFallingWeight){
			continue;
		}


		if(pickableRB[i] != null && pickableRB[i].beingPicked.current) continue;

		var debugColor : Color = Color.white;
		debugColor = Color.red;
		if(allHealth[i].transform.position.x < transform.position.x + damageHorizontalRange && allHealth[i].transform.position.x > transform.position.x - damageHorizontalRange //Check horizontal range
		&& allHealth[i].transform.position.y < transform.position.y && allHealth[i].transform.position.y > transform.position.y + damageVerticalRange){ //Check vertical range
			if(rb.velocity.y < -minFallingSpeedForDamage && rb.velocity.magnitude > minSpeedForDamage){ //Speed check

				if(onlyDamageGroundedObjs ){
					if(allHealth[i].isGrounded != null){
						if(!allHealth[i].isGrounded.isGrounded){
							continue;
						}
					}
				}

				if(damageRate > 0){
					var useDmgRate : float = damageRate;
					if(speedAffectsDamageRage){
						useDmgRate *= rb.velocity.magnitude;
					}
					allHealth[i].health -= useDmgRate * Time.deltaTime;
				}
				else{
					allHealth[i].health = 0.0;
				}

				if(allHealth[i].health <= 0.0){
					if(allHealth[i].transform.parent.tag == playerTag){
						allHealth[i].fakeDestroy = true;
						allHealth[i].destroyOnDeath = true;
					}
					allHealth[i].transform.parent.gameObject.layer = dontCollideWFallingWeight;
				}
			}
		}

		DebugUtility.DrawPoint(allHealth[i].transform.position, .3, debugColor);
	}
}

/*function OnCollisionStay(c : Collision){
	for(var i = 0; i < c.contacts.Length; i++){
		var health : Health = c.contacts[i].otherCollider.gameObject.GetComponentInChildren.<Health>();
		if(health != null && !health.immuneToFallingWeight){
			var noDMG : boolean;
			if(onlyDamageGroundedObjs ){
				if(health.isGrounded != null){
					if(!health.isGrounded.isGrounded){
						noDMG = true;
					}
				}
			}

			if(!noDMG){
				var pRB : PickableRigidbody = c.contacts[i].otherCollider.gameObject.GetComponentInChildren.<PickableRigidbody>();
				
				if(pRB == null || pRB != null && !pRB.beingPicked.current){
					if(rb.velocity.y < -minFallingSpeedForDamage && rb.velocity.magnitude > minSpeedForDamage){ //Speed check

						if(damageRate > 0){
							var useDmgRate : float = damageRate;
							if(speedAffectsDamageRage){
								useDmgRate *= rb.velocity.magnitude;
							}
							health.health -= useDmgRate * Time.deltaTime;
						}
						else{
							health.health = 0.0;
						}

						if(health.health <= 0.0){
							if(health.transform.parent.tag == playerTag){
								health.fakeDestroy = true;
								health.destroyOnDeath = true;
							}
							health.transform.parent.gameObject.layer = dontCollideWFallingWeight;
						}
					}
				}
			}
		}
	}
}*/

function OnDrawGizmosSelected(){
	#if UNITY_EDITOR
	if(debug){
		if(rb != null){
			Handles.Label(transform.position, "Falling Weight - Y speed: " + rb.velocity.y);
		}
		Debug.DrawRay(transform.position + Vector3(damageHorizontalRange, 2,0), Vector3.down * 10.0, Color.cyan);
		Debug.DrawRay(transform.position + Vector3(-damageHorizontalRange, 2,0), Vector3.down * 10.0, Color.cyan);
		
		Debug.DrawLine(transform.position + Vector3(-1,0,0), transform.position + Vector3(1, 0,0), Color.green);
		Debug.DrawLine(transform.position + Vector3(-1,damageVerticalRange,0), transform.position + Vector3(1, damageVerticalRange,0), Color.green);
	}
	#endif
}