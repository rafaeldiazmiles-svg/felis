#pragma strict

var triggerAnim : TriggerAnimation;

var radius : float;

var damage : float = 100.0;

var targets : Health[];
var getTimer : Timer;

var trapActivated : boolean;
var activatedTime : float;

var damageDelay : float;
var damageApplied : boolean;

var damagePrefab : GameObject;

var stopTarget : boolean = true;

function GetTargets(){
	targets = GameObject.FindObjectsOfType.<Health>() as Health[];
}

function Start () {
	GetTargets();
	triggerAnim = GetComponent.<TriggerAnimation>();
	
	if(getTimer.every == 0.0){
		getTimer.every = 3.0;
	}
}

function Update () {
	getTimer.Update();
	if(getTimer.current){
		GetTargets();
	}
	
	if(!trapActivated){
		for(var i = 0; i < targets.Length; i++){
			if(targets[i] == null){
				continue;
			}
			if(Vector3.Distance(transform.position, targets[i].transform.position) < radius){
				trapActivated = true;
				activatedTime = Time.time;
				triggerAnim.play = true;
				if(targets[i].transform.parent != null){
					if(stopTarget){
						var rb : Rigidbody = targets[i].transform.parent.GetComponentInChildren.<Rigidbody>();
						if(rb != null){
							rb.velocity = Vector3.zero;
						}
					}
				}
				//break;
			}
		}
	}
	else{
		if(!damageApplied && Time.time > activatedTime + damageDelay){
			damageApplied = true;
			for(i = 0; i < targets.Length; i++){
				if(targets[i] == null){
					continue;
				}
				if(Vector3.Distance(transform.position, targets[i].transform.position) < radius){
					targets[i].health -= damage;
					if(targets[i].transform.parent != null){
						var hurt : Hurt = targets[i].transform.parent.GetComponentInChildren.<Hurt>();
						if(hurt != null){
							hurt.hurt.current = true;
						}
					}
					if(damagePrefab != null){
						GameObject.Instantiate(damagePrefab, transform.position, Quaternion.identity);
					}
				}
			}		
		}
		
	}
	
	
}

function OnDrawGizmosSelected(){
	#if UNITY_EDITOR
	DebugUtility.DrawCircle(transform.position, radius, Vector3.forward, Color.white, 16);
	#endif
}