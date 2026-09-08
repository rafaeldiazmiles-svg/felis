#pragma strict

var shakeRange : float = 1.0;
var shakeMultiplier : float = 1.0;

var damageMultiplier : float = 1.0;
  
var allHealth : Health[];
var allHealthRB : Rigidbody[];
var allHurt : Hurt[];

var currentShakeValue : float;

var shakeSettleSpeed : float = 1.0;

var shakeComponents : Shakiness[];

var shakeValueHurt : float;

var hurtSound : AudioSource[];
var plantSound : AudioSource[];

var shakePlantSound : float = .1;
var shakePlantSoundTimer : Timer;

var getTimer : Timer;

function Start () {
	GetTargets();

	if(getTimer.every == 0.0){
		getTimer.every = 4.0;
	}

	shakeComponents = GetComponentsInChildren.<Shakiness>() as Shakiness[];
}

function Update () {
	getTimer.Update();
	if(getTimer.current){
		GetTargets();
	}

	for(var i = 0; i < allHealth.Length; i++){
		if(allHealthRB[i] == null) continue;
		var charDistance : float = Vector3.Distance(allHealth[i].transform.parent.position, transform.position);
		var thisShakeValue : float = Mathf.Max(0,shakeRange - charDistance) / shakeRange;
		thisShakeValue *= allHealthRB[i].velocity.magnitude;
		thisShakeValue *= shakeMultiplier;
		
		if(currentShakeValue < thisShakeValue){
			currentShakeValue = thisShakeValue;
		}
		
		allHealth[i].health -= thisShakeValue * Time.deltaTime * damageMultiplier;
		
		if(thisShakeValue > shakeValueHurt && allHurt[i] != null){
			if(!allHurt[i].hurt.current && hurtSound != null && hurtSound.Length > 0){
				hurtSound[Random.value * hurtSound.Length].Play();
			}
			allHurt[i].hurt.current = true;
		}
	}
	
	currentShakeValue = Mathf.MoveTowards(currentShakeValue, 0.0, Time.deltaTime * shakeSettleSpeed);
	
	shakePlantSoundTimer.Update();
	if(shakePlantSoundTimer.current && currentShakeValue > shakePlantSound){
		if(plantSound != null && plantSound.Length > 0){
			plantSound[Random.value * plantSound.Length].Play();
		}		
	}
	
	for(var n = 0; n < shakeComponents.Length; n++){
		shakeComponents[n].multiplier = currentShakeValue;
	}

}

function GetTargets(){
	allHealth = GameObject.FindObjectsOfType.<Health>() as Health[];
	allHealthRB = new Rigidbody[allHealth.Length];
	allHurt = new Hurt[allHealth.Length];
	for(var i = 0; i < allHealth.Length; i++){
		allHealthRB[i] = allHealth[i].transform.parent.GetComponentInChildren.<Rigidbody>();
		allHurt[i] = allHealth[i].transform.parent.GetComponentInChildren.<Hurt>();
	}
}

function ChangeRange(newRadius : float){
	shakeRange = newRadius;
}

function ChangeShake(newVal : float){
	shakeMultiplier = newVal;
}

function OnDrawGizmosSelected(){
	#if UNITY_EDITOR
	DebugUtility.DrawCircle(transform.position, shakeRange, Vector3.forward, Color.red,16);
	#endif
}