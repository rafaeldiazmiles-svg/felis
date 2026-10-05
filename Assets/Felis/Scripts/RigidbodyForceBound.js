#pragma strict

var bounds : Bounds;
var centerBounds : boolean;
@Space(15)

var forceAsSpeedTarget : boolean;
var speedForceMul : float = 1.0;

@Space(15)
var springAddForce : boolean; //Use to increment speed for springs
var springMul : float = .5;

@Space(15)
var forceEnabled : boolean = true;
var force : Vector3;
@Space(15)
var rigidbodies : Rigidbody[];
var friction : StopFrictionDrag[];
var frictionF : ForceFriction[];
var maxDeltaPos : MaxRigidbodyDeltaPos[];
var maxVel : MaxVelocity[];
var pickableRB : PickableRigidbody[];
var cartoonGrav : CartoonGravity[];
@Space(15)
var accel : Vector3[];
var prevVel : Vector3[];
@Space(30)
var getRBsTimer : Timer;
@Space(15)
var reduceXVel : float;
var reduceYVel : float;
var reduceZVel : float;
@Space(15)
var disableCartoonGrav : boolean;
@Space(15)
var debug : boolean;
@Space(15)
var dontLock : boolean;
var lockRB : Rigidbody;
var lockUntil : float;
var lockDuration : float = 1.0;
@Space(15)
var ignoreTags : String[];
@Space(10)
var onlyTags : String[];
@Space(40)
var DebugLineLenght : float = .1;
private var boulderSpeedMul : float = 2.0;
private var speedThisBoulder : boolean;


function Start () {
	var sceneName : String = UnityEngine.SceneManagement.SceneManager.GetActiveScene().name;
	speedThisBoulder = gameObject.name.IndexOf("Boulder") >= 0 && (sceneName.Contains("Level 4") || sceneName.Contains("Lost Temple"));
	GetRBs();
	
	if(getRBsTimer.every == 0.0){
		getRBsTimer.every = 4.0;
	}
}

function GetRBs(){
	rigidbodies = GameObject.FindObjectsOfType.<Rigidbody>() as Rigidbody[];
	friction = new StopFrictionDrag[rigidbodies.Length];
	frictionF = new ForceFriction[rigidbodies.Length];
	maxDeltaPos = new MaxRigidbodyDeltaPos[rigidbodies.Length];
	maxVel = new MaxVelocity[rigidbodies.Length];
	pickableRB = new PickableRigidbody[rigidbodies.Length];
	cartoonGrav = new CartoonGravity[rigidbodies.Length];
	for(var i = 0; i < rigidbodies.Length; i++){
		friction[i] = rigidbodies[i].GetComponentInChildren(StopFrictionDrag);
		frictionF[i] = rigidbodies[i].GetComponentInChildren(ForceFriction);
		maxDeltaPos[i] = rigidbodies[i].GetComponentInChildren(MaxRigidbodyDeltaPos);
		maxVel[i] = rigidbodies[i].GetComponentInChildren(MaxVelocity);
		pickableRB[i] = rigidbodies[i].GetComponentInChildren.<PickableRigidbody>();
		cartoonGrav[i] = rigidbodies[i].GetComponentInChildren.<CartoonGravity>();
	}

	accel = new Vector3[rigidbodies.length];
	prevVel = new Vector3[rigidbodies.length];
}

function Update(){
	getRBsTimer.Update();
	if(getRBsTimer.current){
		GetRBs();
	}
	
	if(Time.time > lockUntil){
		lockRB = null;
	}
}

function FixedUpdate () {
	var bCenter : Vector3 = bounds.center;
	if(centerBounds){
		bounds.center += transform.position;
	}

	if(forceEnabled){
		for(var i = 0; i < rigidbodies.Length; i++){
			if(rigidbodies[i] == null) continue;
			var cont : boolean;
			for(var n = 0; n < ignoreTags.Length; n++){
				if(rigidbodies[i].tag == ignoreTags[n]){
					cont = true;
					break;
				}
			}


			if(onlyTags != null && onlyTags.Length > 0){
				cont = true;
				for(n = 0; n < onlyTags.Length; n++){
					if(rigidbodies[i].tag == onlyTags[n]){
						cont = false;
						break;
					}
				}
			}

			if(pickableRB[i] != null){
				if(pickableRB[i].beingPicked.current){
					cont = true;
				}
			}
			if(cont) continue;
			
			if(lockRB != null && rigidbodies[i] != lockRB) continue;

			if(bounds.Contains(rigidbodies[i].position)){
				if(disableCartoonGrav){
					cartoonGrav[i].disableThisFrame_FixedUpdate = true;	
				}
				
				lockUntil = Time.time + lockDuration;
				if(!dontLock) lockRB = rigidbodies[i];

				var useForce : Vector3 = force;
				var chaseMul : float = speedForceMul;
				if(speedThisBoulder){
					useForce *= boulderSpeedMul;
					chaseMul *= boulderSpeedMul;
				}

				if(springAddForce){
					accel[i] = (rigidbodies[i].velocity - prevVel[i]) / Time.deltaTime;
					prevVel[i] = rigidbodies[i].velocity;

					useForce = useForce.normalized * useForce.magnitude * Mathf.Max(0, Vector3.Dot(useForce.normalized, rigidbodies[i].velocity.normalized) ) * Mathf.Clamp01(accel[i].magnitude * springMul);

				}

				if(forceAsSpeedTarget){
					PhysicsUtility.ApplyForceForVelocity(rigidbodies[i], useForce, rigidbodies[i].mass * chaseMul);
				}
				else{
					rigidbodies[i].AddForce(useForce);
				}
				
				if(reduceXVel > 0){
					rigidbodies[i].velocity.x = Mathf.MoveTowards(rigidbodies[i].velocity.x, 0, Time.deltaTime * reduceXVel);
				}
				if(reduceYVel > 0){
					rigidbodies[i].velocity.y = Mathf.MoveTowards(rigidbodies[i].velocity.y, 0, Time.deltaTime * reduceXVel);
				}
				if(reduceZVel > 0){
					rigidbodies[i].velocity.z = Mathf.MoveTowards(rigidbodies[i].velocity.z, 0, Time.deltaTime * reduceXVel);
				}
				
				////if(friction[i] == null) friction[i] = rigidbodies[i].GetComponentInChildren(StopFrictionDrag);
				if(friction[i] != null){
					friction[i].stopTime = 0.0;
				}
				if(frictionF[i] != null){
					frictionF[i].disableUntil = Time.time + .1;
				}
				if(maxDeltaPos[i] != null){
					maxDeltaPos[i].disableUntil = Time.time + .1;
				}
				if(maxVel[i] != null){
					maxVel[i].disableUntil = Time.time + .1;
				}
			}
			
		}
	}
	
	bounds.center = bCenter;
	
}

function OnDrawGizmosSelected(){
	#if UNITY_EDITOR
	if(debug){
		var bCenter : Vector3 = bounds.center;
		if(centerBounds){
			bounds.center += transform.position;
		}
	
		Gizmos.color = Color.gray;
		Gizmos.DrawWireCube(bounds.center, bounds.size);
		DebugUtility.DrawArrow(transform.position, force * DebugLineLenght, Color.blue);
		Handles.Label(transform.position + force * 0.05, "Force: " + force.magnitude.ToString());
		
		bounds.center = bCenter;
	}
	#endif
}