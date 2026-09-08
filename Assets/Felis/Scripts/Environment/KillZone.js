#pragma strict

var useTransformCenter : boolean;
var bounds : Bounds;
var debug : boolean;

var healthComps : Health[];

var slowlyKillRate: float;

var freezePlayer : boolean;
var freezeDrag : float = 10.0;

var getTargets : ToggleBoolean;
var getTargetsDelay : float = .3;

var getTargetsTimer : Timer;

var killedThisFrame : ToggleBoolean;

var forceExplode : boolean;

static var arbitraryTimerVal : float = 4.0;

var onlyEnemies : boolean;
var enemyTag : String = "Enemy";



function Start () {
	GetTargets();//healthComps = GameObject.FindObjectsOfType.<Health>() as Health[];
	
	if(getTargetsTimer.every == 0.0) getTargetsTimer.every = arbitraryTimerVal;
}

function GetTargets(){
	if(onlyEnemies){
		var enemyObjs : GameObject[] = GameObject.FindGameObjectsWithTag(enemyTag);
		var healthCompsArray : Array = new Array();
		for(var i = 0; i < enemyObjs.Length; i++){
			var thisHealth : Health = enemyObjs[i].transform.parent.GetComponentInChildren.<Health>();
			if(thisHealth != null){
				healthCompsArray.Push(thisHealth);
			}
		}
		healthComps = healthCompsArray.ToBuiltin(Health);
	}
	else{
		healthComps = GameObject.FindObjectsOfType.<Health>() as Health[];
	}

}

function LateUpdate () {
	getTargetsTimer.Update();
	if(getTargetsTimer.current){
		GetTargets();
	}
	
	getTargets.Update();
	if(getTargets.current && Time.time > getTargets.toggledTrueTime + getTargetsDelay){
		GetTargets();
		getTargets.current = false;
	}
	
	UpdateHealthComps();
}

function UpdateHealthComps(){
	killedThisFrame.current = false;
	for(var i = 0; i < healthComps.Length; i++){
		if(healthComps[i] == null){
			GetTargets();
			UpdateHealthComps();
			break;	
		}
		
		if(healthComps[i] != null){
			if(useTransformCenter){
				var center : Vector3 = bounds.center;
				bounds.center += transform.position;
				if(bounds.Contains(healthComps[i].transform.position)){
					Kill(healthComps[i]);
				}
				bounds.center = center;			
			}
			else{
				if(bounds.Contains(healthComps[i].transform.position)){
					Kill(healthComps[i]);
				}
			}
		}
	}
	killedThisFrame.Update();
}

function Kill(h : Health){
	if(slowlyKillRate > 0){
		h.health -= slowlyKillRate * Time.deltaTime;
	}
	else{
		h.health = 0;
	}

	if(h.health <= 0){
		killedThisFrame.current = true;
		if(freezePlayer){
			FreezePlayer(h);
		}

		if(forceExplode){
			if(!h.destroyOnDeath){
				h.FakeDestroy();
			}
		}
	}
}


function FreezePlayer(healthComp : Health){
	var rb : Rigidbody = healthComp.transform.parent.GetComponent.<Rigidbody>();
	if(rb != null){
		//rb.velocity = Vector3.zero;
		rb.useGravity = false;
		rb.drag = freezeDrag;
		//Debug.Log("Tried to freeze player. - " + Time.time);
	}
}

function OnDrawGizmosSelected(){
	#if UNITY_EDITOR
	if(debug){
		Gizmos.color = Color.red;
		if(useTransformCenter){
			Gizmos.DrawWireCube(bounds.center + transform.position, bounds.size);
		}
		else{
			Gizmos.DrawWireCube(bounds.center, bounds.size);
		}
	}
	#endif
}