#pragma strict

var catchMaxVelBounds : Bounds;
var catchUpSpeed : float = 5.0;
var catchDownSpeed : float = 1.0;
@Space(30)
var reduceRate : float = .3;
@Space(30)
var maintainVelBounds : Bounds;

@Space(30)
var objs : MaintainVelMag_Obj[];

@Space(30)
var addUpSpeed : float; //Adds velocity directly up. 0 adds nothing. 1 adds a vector upward.
@Space(30)
var searchTags : String[];
var getTimer : Timer;
@Space(30)
var disableFrictionDrag : boolean = true;
var noFricDuration : float = 4.0;
@Space(30)
var disableFeetParticle : boolean = true;
@Space(30)
var requireMainTagProximity : boolean; //All objs must be together
var mainTag : String;
var mainTagObj : GameObject;
var proximityRange : float = 1.0;

class MaintainVelMag_Obj{
	var rb : Rigidbody;
	var maxVel : float;
	var fFric : ForceFriction;
	var feetPart : FeetParticle;
	var inMaintainVelBounds : ToggleBoolean;
	@Space(10)
	var distToMainTagObj : float;
	var proximity : boolean;
}

function GetRbs(){
	var allTagObjsArray : Array = new Array();
	for(var i = 0; i < searchTags.Length; i++){
		var thisTagObjs : GameObject[] = GameObject.FindGameObjectsWithTag(searchTags[i]);
		for(var n = 0; n < thisTagObjs.Length; n++){
			allTagObjsArray.Add(thisTagObjs[n]);
		}
	}

	var objsArray : Array = new Array();
	for(i = 0; i < allTagObjsArray.length; i++){
		var thisObj : GameObject = allTagObjsArray[i];
		var rb : Rigidbody = thisObj.GetComponent.<Rigidbody>();

		if(rb != null){
			if(thisObj.tag == mainTag && mainTagObj == null){
				mainTagObj = thisObj;
			}

			var hasObj : boolean;
			if(objs != null){
				for(n = 0; n < objs.Length; n++){
					if(objs[n].rb == null){
						continue;
					}
					if(rb == objs[n].rb){
						objsArray.Add(objs[n]);
						hasObj = true;
						break;
					}
				}
			}
			if(!hasObj){
				var newObj : MaintainVelMag_Obj =  new MaintainVelMag_Obj();
				newObj = new MaintainVelMag_Obj();
				newObj.rb = rb;
				newObj.fFric = thisObj.GetComponentInChildren.<ForceFriction>();
				newObj.feetPart = thisObj.GetComponentInChildren.<FeetParticle>();
				newObj.inMaintainVelBounds = new ToggleBoolean();
				objsArray.Add(newObj);
			}
		}
	}

	objs = objsArray.ToBuiltin(MaintainVelMag_Obj);
}


function Start () {
	if(getTimer.every == 0.0){
		getTimer.every = 4.0;
	}
}

function Update () {
	getTimer.Update();
	if(getTimer.current){
		GetRbs();
	}

	var noProximity : boolean;

	if(objs != null){
		for(var i = 0; i < objs.Length; i++){
			if(objs[i].rb == null){
				continue;
			}

			if(requireMainTagProximity){
				if(mainTagObj != null) {
					objs[i].distToMainTagObj = Vector3.Distance(mainTagObj.transform.position, objs[i].rb.position);
					objs[i].proximity = objs[i].distToMainTagObj < proximityRange;
				}
			}

			if(requireMainTagProximity && !objs[i].proximity){
				continue;
			}

			//Slowly reduce maintained velocity
			objs[i].maxVel = Mathf.MoveTowards(objs[i].maxVel, 0, Time.deltaTime * reduceRate);
			var velMag : float = objs[i].rb.velocity.magnitude;

			if(catchMaxVelBounds.Contains(objs[i].rb.transform.position - transform.position)){
				if(objs[i].maxVel < velMag){
					objs[i].maxVel  = velMag;//Mathf.Lerp(objs[i].maxVel, Mathf.Max(objs[i].maxVel, velMag), Time.deltaTime * catchUpSpeed);
				}
				/*else{
					objs[i].maxVel = Mathf.Lerp(objs[i].maxVel, Mathf.Max(objs[i].maxVel, velMag), Time.deltaTime * catchDownSpeed);
				}*/

			}

			objs[i].inMaintainVelBounds.current = maintainVelBounds.Contains(objs[i].rb.transform.position - transform.position);
			objs[i].inMaintainVelBounds.Update();

			/*if(objs[i].inMaintainVelBounds.toggledTrue){
				if(disableFrictionDrag){
					if(objs[i].fFric != null){
						objs[i].fFric.gameObject.SetActive(false);
						//objs[i].fFric.noFricUntil = Time.time + noFricDuration;
					}
				}				
			}
			if(objs[i].inMaintainVelBounds.toggledFalse){
				if(disableFrictionDrag){
					if(objs[i].fFric!= null){
						objs[i].fFric.gameObject.SetActive(true);
						//objs[i].fFric.noFricUntil = Time.time + noFricDuration;
					}
				}				
			}*/

			if(objs[i].inMaintainVelBounds.current){
				if(velMag < objs[i].maxVel){
					objs[i].rb.velocity = objs[i].rb.velocity.normalized * objs[i].maxVel;
					DebugUtility.DrawArrow(objs[i].rb.position, objs[i].rb.velocity.normalized * objs[i].maxVel);

					objs[i].rb.velocity += Vector3.up * velMag * Time.deltaTime *  addUpSpeed;

					if(disableFrictionDrag){
						if(objs[i].fFric != null){
							objs[i].fFric.noFricUntil = Time.time + noFricDuration;
						}
					}	

					if(disableFeetParticle){
						if(objs[i].feetPart != null){
							objs[i].feetPart.disableUntil = Time.time + noFricDuration;
						}						
					}
				}
			}
		}
	}
}

function OnDrawGizmosSelected(){
	#if UNITY_EDITOR
		
	Gizmos.color = Color.blue;
	Gizmos.DrawWireCube(catchMaxVelBounds.center + transform.position, catchMaxVelBounds.size);
	Gizmos.color = Color.red;
	Gizmos.DrawWireCube(maintainVelBounds.center + transform.position, maintainVelBounds.size);

	#endif
}