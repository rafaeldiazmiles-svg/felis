#pragma strict
@Header("--------------------------Input-------------------")
var center : Vector3;
var centerIsPos : boolean;
var radius : float;
@Space(30)
var targets : Health[];
var targetsRB : Rigidbody[];
var rbVelocityOut : float;
var rbVelBiasSides : float;
var damage : float;
var explode : boolean;
var disableDuration : float;
var onlyFallingDamage : boolean;
@Space(30)
var impactPrefab : GameObject;
var impactOnTarget : boolean;
@Space(30)
var damageSounds : AudioSource[];
@Space(30)
var debug : boolean = true;
@Header("------------------------Values------------------")
var disableList : Array;
var removeAtID : Array;
var getTimer : Timer;

function SpikesDamage_ChangeRange(newRange : float){
	radius = newRange;
}

class SpikeDamageDisable{
	var health : Health;
	var disableUntil : float;
	function SpikeDamageDisable(useHealth : Health, setTime : float){
		health = useHealth;
		disableUntil = setTime;
	}


}

function Start () {
	GetTargets();
	disableList = new Array();
	removeAtID = new Array();

	if(getTimer.every == 0.0){
		getTimer.every = 4.0;
	}
}

function Update () {
	getTimer.Update();
	if(getTimer.current){
		GetTargets();
	}
	UpdateSpikes();
	
}

function UpdateSpikes(){
	var useCenter : Vector3 = center;
	if(centerIsPos) useCenter =  transform.TransformPoint(center);//transform.position + center;
	
	var thisDisable : SpikeDamageDisable;	
				
	for(var i = 0; i < targets.Length; i++){
		if(targets[i] == null){
			continue;
			//GetTargets();
			//UpdateSpikes();
			break;
		}
		
		if(targets[i].health <= 0){
			continue;

		}

		if(onlyFallingDamage && targetsRB[i] != null){
			if(targetsRB[i].velocity.y >= -1){
				continue;
			}
		}

		var cont : boolean = false;
		for(var n = 0; n < disableList.length; n++){
			thisDisable = disableList[n];
			if(targets[i] == thisDisable.health){
				cont = true;
			}
		}
		if(cont) continue;
		
		if(Vector3.Distance(useCenter, targets[i].transform.position) < radius){
			if(targets[i].transform.parent != null){
				var targetRB : Rigidbody = targets[i].transform.parent.GetComponentInChildren.<Rigidbody>();
				var hurt : Hurt = targets[i].transform.parent.GetComponentInChildren.<Hurt>();
			}
			
			if(targetRB != null){
				targetRB.velocity = (targetRB.transform.position - useCenter).normalized * rbVelocityOut;
				targetRB.velocity.x = Mathf.Lerp(targetRB.velocity.x, rbVelocityOut * Mathf.Sign(targetRB.velocity.x), rbVelBiasSides);
			}
			if(hurt != null && targets[i].health > 0){
				hurt.hurt.current = true;
			}

			if(damageSounds != null && damageSounds.Length > 0){
				damageSounds[Random.value * damageSounds.Length].Play();
			}

			if(impactPrefab != null){
				var newImpact : GameObject = Instantiate(impactPrefab);
				if(impactOnTarget){
					newImpact.transform.position = targets[i].transform.position;
				}
				else{
					newImpact.transform.position = useCenter;
				}
			}

			targets[i].health -= damage;

			if(explode && targets[i].health  < 1.0){
				targets[i].fakeDestroy = true;
				targets[i].destroyOnDeath = true;
				targets[i].delayDestroy = true;
				targets[i].delayDestroyDuration = .15;
			}

			var newDisable : SpikeDamageDisable = new SpikeDamageDisable(targets[i], Time.time + disableDuration);
			disableList.Push(newDisable);
		}
	}
	
	removeAtID.Clear(); 
	
	for(var m = 0; m < disableList.length; m++){
		thisDisable = disableList[m];
		if(Time.time > thisDisable.disableUntil){
			removeAtID.Push(m);
		}
	}

	for(var t = 0; t < removeAtID.length; t++){
		disableList.RemoveAt(removeAtID[t]);
	}		
}

function GetTargets(){
	targets = GameObject.FindObjectsOfType.<Health>() as Health[];
	targetsRB = new Rigidbody[targets.Length];
	for(var i = 0; i < targets.Length; i++){
		if(targets[i].transform.parent != null){
			targetsRB[i] = targets[i].transform.parent.GetComponent.<Rigidbody>();
		}
	}
}

function OnDrawGizmosSelected(){
	#if UNITY_EDITOR
	if(debug){
		var useCenter : Vector3 = center;
		if(centerIsPos) useCenter = transform.TransformPoint(center);// transform.position + center;
		DebugUtility.DrawCircle(useCenter, radius, Vector3.forward, Color.white, 16);
	}
	#endif
}