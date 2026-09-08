#pragma strict

var prefab : GameObject;
var prefabRandom : GameObject[];
var onlyMatchPos : boolean;
@Space(30)
var everySeconds : float;
var onlyOnce : boolean;
var chance : float = 1.0;
var randomize : float;
var nextCreateTime : float;
@Space(30)
var emmitSound : boolean;
var soundList : AudioSource[];
var soundID : int;
@Space(30)
var changeScale : boolean = false;
var scale : Vector3;
@Space(30)
var requireTagsInBounds : boolean;
var tags : String[];
var tagObjs : GameObject[];
var bounds : Bounds;
var getTimer : Timer;
var tagReq_LookingTowards : boolean;
@Space(30)
var requireDoorState : DoorState;
var targetDoor : OpenDoor;
var targetDoor_FindRadius : float;
@Space(30)
var changeTexture : PrefabGen_ChangeTexture[];

class PrefabGen_ChangeTexture{
	var objName : String;
	var newTexture : Texture;
}

function ChangeTexture(newPrefab : GameObject){
	if(changeTexture != null){
		for(var i = 0;  i < changeTexture.Length; i++){
			var allPrefabChildren : Transform[] = newPrefab.GetComponentsInChildren.<Transform>();
			for(var n = 0; n < allPrefabChildren.Length; n++){
				if(allPrefabChildren[n].name == changeTexture[i].objName){
					var rend : Renderer = allPrefabChildren[n].GetComponent.<Renderer>();
					if(rend != null){
						rend.material.mainTexture = changeTexture[i].newTexture;
						break;
					}
				}
			}
		}
	}
}

function Start () {
	nextCreateTime = Time.time + everySeconds + Random.Range(-randomize*.5, randomize*.5);
	soundList = GetComponentsInChildren.<AudioSource>();
}

function GetTagObjs(){	
	var tagObjsArray : Array = new Array();
	for(var i = 0; i < tags.Length; i++){
		var thisTagObjs : GameObject[] = GameObject.FindGameObjectsWithTag(tags[i]);
		for(var n = 0; n < thisTagObjs.Length; n++){
			tagObjsArray.Add(thisTagObjs[n]);
		}
	}
	tagObjs = tagObjsArray.ToBuiltin(GameObject);
}

function GetDoor(){
	var allDoors : OpenDoor[] = GameObject.FindObjectsOfType.<OpenDoor>();
	for(var i = 0; i < allDoors.Length; i++){
		var dist : float = Vector3.Distance(transform.position, allDoors[i].transform.position);
		if(dist < targetDoor_FindRadius){
			targetDoor = allDoors[i];
			break;
		}
	}
}

function Update () {
	var tagInBounds : boolean;
	getTimer.Update();
	if(getTimer.current){
		GetTagObjs();

		if(targetDoor == null && targetDoor_FindRadius > 0){
			GetDoor();
		}
	}
	for(var i = 0; i < tagObjs.Length; i++){
		if(tagObjs[i] == null){
			continue;
		}
		if(bounds.Contains(tagObjs[i].transform.position - transform.position)){
			if(tagReq_LookingTowards){
				if(Mathf.Sign(tagObjs[i].transform.localScale.x) == Mathf.Sign(transform.position.x - tagObjs[i].transform.position.x)){
					continue;
				}
			}
			tagInBounds = true;
			break;
		}
	}

	var doorStateMet : boolean;
	if(targetDoor != null){
		if(targetDoor.alreadyOpened && requireDoorState == DoorState.Open){
			doorStateMet = true;
		}
		if(!targetDoor.alreadyOpened && requireDoorState == DoorState.Close){
			doorStateMet = true;
		}
	}

	if((!requireTagsInBounds || tagInBounds) && (targetDoor == null || doorStateMet)){
		if(Time.time > nextCreateTime && Random.value < chance){
			var newPrefab : GameObject;
			if(prefabRandom != null && prefabRandom.Length > 0){
				if(onlyMatchPos){
					newPrefab = Instantiate(prefabRandom[Mathf.Round(Random.value * (prefabRandom.Length-1))]);
					newPrefab.transform.position = transform.position;
				}
				else{
					newPrefab = Instantiate(prefabRandom[Mathf.Round(Random.value * (prefabRandom.Length-1))], transform.position, transform.rotation);
				}
			}
			else{
				if(onlyMatchPos){
					newPrefab = Instantiate(prefab);
					newPrefab.transform.position = transform.position;
				}
				else{
					newPrefab = Instantiate(prefab, transform.position, transform.rotation);
				}
			}

			ChangeTexture(newPrefab);

			if(changeScale)
				newPrefab.transform.localScale = scale;
			nextCreateTime = Time.time + everySeconds + Random.Range(-randomize*.5, randomize*.5);
			
			if(emmitSound){
				soundList[soundID].Play();
				soundID++;
				soundID = soundID % soundList.Length;
				
			}

			if(onlyOnce){
				Destroy(gameObject);
			}
		}
	}
}

function OnDrawGizmosSelected(){
	#if UNITY_EDITOR
	Gizmos.DrawWireCube(bounds.center + transform.position, bounds.size);
	DebugUtility.DrawCircle(transform.position, targetDoor_FindRadius, Vector3.forward, Color.gray);
	if(targetDoor_FindRadius > .2){
		Handles.Label(transform.position + Vector3(targetDoor_FindRadius,0,0), "Target Door - Find Radius: " + targetDoor_FindRadius.ToString());
	}
	#endif
}