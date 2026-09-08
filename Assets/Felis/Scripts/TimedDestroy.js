#pragma strict

var activate : boolean = true;
var startTime : float;
var destroyTriggerTime : float;

var currentlyActive : boolean = true;

var createPrefab : GameObject;

var multiplySize : Vector3 = Vector3.one;

var destroyParent : boolean;
var destroyChildren : boolean;

var destroyOther : GameObject[];

@Space(40)

var disableParticleEmit : boolean = true;
var defaultParticleRate : float;
var ps : ParticleSystem;

function Start () {
	if(destroyChildren){
		var allChildren : Transform[] = GetComponentsInChildren.<Transform>();
		destroyOther = new GameObject[allChildren.Length];
		for(var i = 0; i < allChildren.Length; i++){
			destroyOther[i] = allChildren[i].gameObject;
		}
	}


	if(disableParticleEmit){
		if(ps == null){
			ps = GetComponentInChildren.<ParticleSystem>();
		}
		if(ps != null){
			defaultParticleRate = ps.emission.rate.constantMax;
			var emission : ParticleSystem.EmissionModule = ps.emission;
			emission.rate.constantMax = 0.0;
		}
	}
}

function Update () {
	if(activate){
		activate = false;
		Reset();
	}
	
	if(currentlyActive &&Time.time > startTime + destroyTriggerTime){
		if(createPrefab != null){
			var newPrefab : GameObject = GameObject.Instantiate(createPrefab);
			newPrefab.transform.position = transform.position;
			newPrefab.transform.localScale.x *= multiplySize.x;
			newPrefab.transform.localScale.y *= multiplySize.y;
			newPrefab.transform.localScale.z *= multiplySize.z;
		}
		
		if(destroyOther != null){
			for(var i = 0; i < destroyOther.Length; i++){
				Destroy(destroyOther[i]);
				//destroyOther[i].SetActive(false);
			}
		}
		
		if(destroyParent){
			Destroy(transform.parent.gameObject);
			//transform.parent.gameObject.SetActive(false);
		}
		else{
			//gameObject.SetActive(false);
			Destroy(gameObject);
		}
	}
}

function Reset(){
	startTime = Time.time;
	currentlyActive = true;
}