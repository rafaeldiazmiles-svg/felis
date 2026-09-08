#pragma strict

var physicsPrefab : GameObject;

var physicsPrefabInstance : GameObject;

var addPhysics : boolean;
var removeCollider : boolean;

var applyForce : Vector3;
var applyForceRnd : Vector3;
var applyTorque : Vector3;
var applyTorqueRnd : Vector3;

var destroyMonoBehaviours : MonoBehaviour[];
var enableMonoBehaviours  : MonoBehaviour[];
@Space(50)

var setFriction : boolean;
var ff_newFriction : float;
var sfdrag_drag : float;
var sfdrap_minSpeed : float;



@Space(50)
var autoFindClosestHealth : boolean;;
var applyOnHealth : Health;
var applyOnHealthNormalized : float;
@Space(50)
var playerTag : String = "Player";
var player : GameObject;
var applyOnBounds : boolean;
var bounds : Bounds;
var centerBounds : boolean;
var getTimer : Timer;
var addQuake : boolean;
var addQuakeBig : boolean;

@Space(50)
var wScaleUseEditor : boolean;
var wScale : Vector3 = Vector3.one;

var setLayer : boolean;
var layer : int;

@Space(50)
var linkDestroyToThis : boolean;

function GetPlayer(){
	player = GameObject.FindGameObjectWithTag(playerTag);
}

function Start () {
	if(autoFindClosestHealth){
		var healths : Health[] = GameObject.FindObjectsOfType.<Health>();
		var thisDist : float;
		var closestDist : float = Mathf.Infinity;
		for(var i = 0; i < healths.Length; i++){
			thisDist = Vector3.Distance(transform.position, healths[i].transform.position	);
			if(thisDist < closestDist){
				applyOnHealth = healths[i];
				closestDist = thisDist;
			}
		}
	}
	
	if(getTimer.every ==  0.0){
		getTimer.every = 2.0;
	}
}

function LateUpdate () {
	//apply on health
	if(applyOnHealth != null){
		var healthNormalized : float = applyOnHealth.health / applyOnHealth.maxHealth;
		if(healthNormalized < applyOnHealthNormalized){
			if(physicsPrefabInstance == null){
				addPhysics = true;
			}
		}
	}
	
	//apply on bounds
	getTimer.Update();
	if(getTimer.current){
		GetPlayer();
	}
	if(player != null){
		var bCenter : Vector3 = bounds.center;
		if(centerBounds){
			bounds.center += transform.position;
		}
		if(bounds.Contains(player.transform.position)){
			addPhysics = true;
			if(addQuake){
				var cameraShakiness : Shakiness = Camera.main.transform.parent.GetComponent(Shakiness);
				if(cameraShakiness != null){
					cameraShakiness.lowQuake = true;
				}
			}
			if(addQuakeBig){
				cameraShakiness = Camera.main.transform.parent.GetComponent(Shakiness);
				if(cameraShakiness != null){
					cameraShakiness.highQuake = true;
				}
			}
		}
		bounds.center = bCenter;
	}
	
	if(addPhysics && physicsPrefabInstance == null){
		addPhysics = false;
		
		for(var i = 0; i < destroyMonoBehaviours.Length; i++){
			if(destroyMonoBehaviours[i] == null){
				continue;
			}
			
			destroyMonoBehaviours[i].enabled = false;
			Destroy(destroyMonoBehaviours[i]);
		}
		
		for(i = 0; i < enableMonoBehaviours.Length; i++){
			if(enableMonoBehaviours[i] == null){
				continue;
			}
			
			enableMonoBehaviours[i].enabled = true;
		}


		
		physicsPrefabInstance = GameObject.Instantiate(physicsPrefab);
		physicsPrefabInstance.transform.position = transform.position;
		transform.parent = physicsPrefabInstance.transform;

		if(linkDestroyToThis){
			var ld : LinkedDestroy = physicsPrefabInstance.AddComponent.<LinkedDestroy>();
			ld.otherObject = gameObject;
		}

		if(setFriction){
			var ff : ForceFriction = physicsPrefabInstance.GetComponentInChildren.<ForceFriction>();
			var sfdrag : StopFrictionDrag = physicsPrefabInstance.GetComponentInChildren.<StopFrictionDrag>();
			
			ff.friction = ff_newFriction;
			sfdrag.stopDragFriction = sfdrag_drag;
			sfdrag.minSpeed = sfdrap_minSpeed;
		}

	
		transform.parent = null;
		if(wScaleUseEditor){
			wScale = transform.localScale;
		}
		transform.localScale = wScale;
		transform.parent = physicsPrefabInstance.transform;
		
		var rb : Rigidbody = physicsPrefabInstance.GetComponent.<Rigidbody>();
		rb.AddForce(applyForce + Vector3.Scale(Random.insideUnitSphere, applyForceRnd));
		rb.AddTorque(applyTorque + Vector3.Scale(Random.insideUnitSphere, applyTorqueRnd));
		
		if(setLayer){
			physicsPrefabInstance.layer = layer;
		}
		
		if(removeCollider){
			var col : Collider = physicsPrefabInstance.GetComponent.<Collider>();
			Destroy(col);
		}
		

		Destroy(this);
	}
}

function OnDrawGizmosSelected(){
	#if UNITY_EDITOR
	var bCenter : Vector3 = bounds.center;
	if(centerBounds){
		bounds.center += transform.position;
	}
	Gizmos.DrawWireCube(bounds.center, bounds.size);
	bounds.center = bCenter;
	#endif
}