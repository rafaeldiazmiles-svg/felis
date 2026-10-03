#pragma strict

@Header("-----------------Input------------------")
var player : GameObject;
var playerTag : String = "Player";
var freeMem : boolean = true;
var loadEverythingOnStart : boolean;
var setActiveManager : boolean;
var removeInactive : boolean = true;
@Space(30)
var prefabBoundsList : PrefabBounds[];
@Space(30)
var removeCloneWord : boolean;
var addNumber : boolean;
@Space(30)
var delayedMsg : Array;
@Space(30)
var newObjThisFrame : boolean;
@Space(30)
var debug : boolean;

function GetPlayer(){
	player = GameObject.FindGameObjectWithTag(playerTag);
}

function NewObj(){
	newObjThisFrame = true;
}

class PrefabBounds{
	var prefab : GameObject[];
	var playerInLoadBounds : boolean;
	var loadBounds : Bounds[];
	var forceLoad : boolean;
	var forceLoadTime : float;
	@Space(10)
	var leavePrefabDefaultPosition : boolean;
	var useThisAsTransformPos : boolean;
	var useTransformPosition : Transform;
	var useTransformRotation : boolean;
	var useTransformScale : boolean;
	var useTransformAsBoundsCenter : boolean;
	@Space(10)
	var usePrefabObjList : boolean;
	@Space(30)
	var setName : String;
	@Space(30)
	var destroyIfOutside : Bounds[];
	var loadBackIfDestroyed : boolean;
	var useTimedDestroy : boolean;
	var usingTimedDestroy : boolean;
	var timedDestroyDelay : float;
	@Space(30)
	var changeScale : boolean;
	var scale : Vector3;
	@Space(10)
	var bodyParts : BodyPartProportion[];
	@Space(10)
	var useChildren : boolean;
	var setEscapeLocation : boolean;
	var escapeLocation : Transform[];
	var setPatrolPoints : boolean;
	var patrolPoints : Transform[];
	@Space(10)
	var changeMaterial : Material;
	var changeMaterial_IgnoreString : String[];
	var changeMaterialByID : ChangeMaterialID[];
	@Space(10)
	var sendMsgFloat : SendMsgFloat[];
	var sendMsgSimple : SendMsgSimple[];
	var sendMsgVector3 : SendMsgVector3[];
	var sendMsgColor : SendMsgColor[];
	@Space(30)
	var ApplyLevelVColorShade : boolean;
	var dynamicShade : boolean;
	@Space(30)
	var connectAnchor : boolean;
	var connectAnchorOffset : Vector3;
	@Space(30)
	var skipActiveMng : boolean;
	var doNotRemove : boolean;
	@Space(30)
	var renderQueue : boolean;
	var renderQueue_Val : float;
	@Space(30)
	var disable : boolean;
	var debug : boolean;
	@Space(30)
	var loaded : boolean;
	var loadedOnce : boolean;
	var firstFrame : boolean;
	@Space(30)
	var instances : GameObject[];
	@Space(30)
	var ID : int;
	var sendMessageTo : Prefab_SendMsgObj[];
	@Space(30)
	var requireObjPresent : boolean;
	var requireObjP_obj : GameObject;
	var requireObjP_FindName : String;

	@Space(30)
	var requireGameVal : boolean;
	var addGameLevelString : int;
	var requireGameVal_Name : String;
	var requireGameVal_Value : int;
	var gotGameVal : boolean;
	var gameVal : int;
}

class Prefab_SendMsgObj{
	var message : String;
	var obj : GameObject;
	var valIsNewPrefab : boolean;

	@Space(30)
	var search : boolean;
	var searchString : String;
}

class ChangeMaterialID{
	var newMaterial : Material;
	var prefabID : int;
}

function ForceLoadID(ID :int){
	for(var i = 0; i < prefabBoundsList.Length; i++){
		if(prefabBoundsList[i].ID == ID){
			prefabBoundsList[i].forceLoad = true;
			prefabBoundsList[i].forceLoadTime = 0.0;
		}
	}
}

function SetPosID(ID : int, pos : Vector3){
	for(var i = 0; i < prefabBoundsList.Length; i++){
		if(prefabBoundsList[i].ID == ID){
			prefabBoundsList[i].useTransformPosition.position = pos;
		}
	}	
}


function Start () {
	GetPlayer();

	delayedMsg = new Array();
}

function ApplyChanges(ID : int, newPrefab : GameObject, prefabID : int){
	var charChildren : Transform[] = newPrefab.GetComponentsInChildren.<Transform>();
	//Change Scale.
	if(prefabBoundsList[ID].changeScale){
		newPrefab.transform.localScale = prefabBoundsList[ID].scale;
	}
	//Change Proportions.
	
	if(prefabBoundsList[ID].bodyParts != null){
		var charChangeProp : ChangeProportions = newPrefab.GetComponentInChildren.<ChangeProportions>();
		if(charChangeProp != null){
			charChangeProp.bodyParts = prefabBoundsList[ID].bodyParts;
			for(var i = 0; i < charChangeProp.bodyParts.Length; i++){
				var thisChangePropName : String =  charChangeProp.bodyParts[i].transformName.ToLower(); //The name to look for in the bones.
				for(var n = 0; n < charChildren.Length; n++){
					if(charChildren[n].name.ToLower().Contains(thisChangePropName)){
						charChangeProp.bodyParts[i].transform = charChildren[n];
						break;
					}
				}
			}
		}
	}
	
	//Escape Location
	var children : Transform[];
	if(prefabBoundsList[ID].useChildren){
		var childrenArray : Array = new Array();
		for(i = 0; i < prefabBoundsList[ID].useTransformPosition.childCount; i++){
			childrenArray.Push(prefabBoundsList[ID].useTransformPosition.GetChild(i));
		}
		children = childrenArray.ToBuiltin(Transform) as Transform[];
		prefabBoundsList[ID].escapeLocation = children;
	}
	
	
	if(prefabBoundsList[ID].setEscapeLocation){
		if(prefabBoundsList[ID].useChildren){
			prefabBoundsList[ID].escapeLocation = children;
		}
		var wPosArray : Array = new Array();
		for(i = 0; i < charChildren.Length; i++){
			 if(charChildren[i].name.ToLower().Contains("escape location")){
			 	var isWPos : IsWorldPosition = charChildren[i].GetComponent.<IsWorldPosition>();
			 	if(isWPos != null){
			 		wPosArray.Push(isWPos);
			 	}
			 }
		}
		for(i = 0; i < wPosArray.length; i++){
			if(i < prefabBoundsList[ID].escapeLocation.Length){
				var thisWPos : IsWorldPosition = wPosArray[i];
				thisWPos.worldPosition = prefabBoundsList[ID].escapeLocation[i].position;
				thisWPos.setExternally = true;
			}
			else{
				break;
			}
		}
	}
	
	//Patrol
	if(prefabBoundsList[ID].setPatrolPoints){
		if(prefabBoundsList[ID].useChildren){
			prefabBoundsList[ID].patrolPoints = children;
		}	
		var patrolAI : PatrolAI = newPrefab.GetComponentInChildren.<PatrolAI>();
		if(patrolAI != null){
			patrolAI.points = new Vector3[prefabBoundsList[ID].patrolPoints.Length];
			for(i = 0; i < patrolAI.points.Length; i++){
				patrolAI.points[i] = prefabBoundsList[ID].patrolPoints[i].position;
			}
		}
	}
	
	//Change Material
	var rends : Renderer[] = newPrefab.GetComponentsInChildren.<Renderer>();
	for(i = 0; i < rends.Length; i++){
		if(rends[i].gameObject.name == "Shadow"
		|| rends[i].gameObject.name.Contains("Baloon"))
		{
			continue;
		}

		var cont : boolean;
		for(n = 0; n < prefabBoundsList[ID].changeMaterial_IgnoreString.Length; n++){
			if(rends[i].gameObject.name.Contains(prefabBoundsList[ID].changeMaterial_IgnoreString[n])){
				cont = true;
			}
		}
		if(cont){
			continue;
		}

		if(prefabBoundsList[ID].changeMaterial != null){
			rends[i].material = prefabBoundsList[ID].changeMaterial;
		}
		
		if(prefabBoundsList[ID].changeMaterialByID != null){
			for(n = 0; n < prefabBoundsList[ID].changeMaterialByID.Length; n++){
				if(prefabID == prefabBoundsList[ID].changeMaterialByID[n].prefabID){
					rends[i].material = prefabBoundsList[ID].changeMaterialByID[n].newMaterial;
				}
			}
		}
	}
	
	//BroadCast Message with float value.
	if(prefabBoundsList[ID].sendMsgFloat != null){
		for(i = 0; i < prefabBoundsList[ID].sendMsgFloat.Length; i++){
			newPrefab.BroadcastMessage(prefabBoundsList[ID].sendMsgFloat[i].methodName, prefabBoundsList[ID].sendMsgFloat[i].methodValue, SendMessageOptions.DontRequireReceiver);
		}
	}
	
	//BroadCast Message
	if(prefabBoundsList[ID].sendMsgSimple != null){
		for(i = 0; i < prefabBoundsList[ID].sendMsgSimple.Length; i++){
			newPrefab.BroadcastMessage(prefabBoundsList[ID].sendMsgSimple[i].methodName, SendMessageOptions.DontRequireReceiver);
		}
	}

	//BroadCast Message with float value.
	if(prefabBoundsList[ID].sendMsgVector3 != null){
		for(i = 0; i < prefabBoundsList[ID].sendMsgVector3.Length; i++){
			newPrefab.BroadcastMessage(prefabBoundsList[ID].sendMsgVector3[i].methodName, prefabBoundsList[ID].sendMsgVector3[i].methodValue, SendMessageOptions.DontRequireReceiver);
		}
	}
	
	//BroadCast Message with Color
	if(prefabBoundsList[ID].sendMsgColor != null){
		for(i = 0; i < prefabBoundsList[ID].sendMsgColor.Length; i++){
			newPrefab.BroadcastMessage(prefabBoundsList[ID].sendMsgColor[i].methodName, prefabBoundsList[ID].sendMsgColor[i].methodValue, SendMessageOptions.DontRequireReceiver);
		}
	}
	
	//Set Name.
	if(prefabBoundsList[ID].setName != ""){
		newPrefab.name = prefabBoundsList[ID].setName;
	}

	var vCShade : VertexColorShade = GameObject.FindObjectOfType.<VertexColorShade>();
	if(vCShade != null){
		//Vertex Color Shade
		if( prefabBoundsList[ID].ApplyLevelVColorShade){
			var meshF : MeshFilter[] = newPrefab.GetComponentsInChildren.<MeshFilter>();
			if(meshF != null){
				for(i = 0; i < meshF.Length; i++){
					vCShade.ApplyColsToMesh(meshF[i]);
				}
			}
				
			var skinnedMesh : SkinnedMeshRenderer = newPrefab.GetComponentInChildren.<SkinnedMeshRenderer>();
			if(skinnedMesh != null){
				vCShade.ApplyColsToMesh(skinnedMesh);
			}
		}

		if(prefabBoundsList[ID].dynamicShade){
			meshF = newPrefab.GetComponentsInChildren.<MeshFilter>();
			if(meshF != null){
				for(i = 0; i < meshF.Length; i++){
					vCShade.AddDynamic(meshF[i]);
				}
			}
				
			skinnedMesh = newPrefab.GetComponentInChildren.<SkinnedMeshRenderer>();
			if(skinnedMesh != null){
				vCShade.AddDynamic(skinnedMesh);
			}
		}
	}
	
	//Register on Set Active Manager
	if(setActiveManager){
		if(!prefabBoundsList[ID].skipActiveMng){
			var actManager : SetActiveManager = GameObject.FindObjectOfType.<SetActiveManager>(); 
			if(actManager != null){
				if(prefabBoundsList[ID].doNotRemove){
					actManager.RegisterObj(newPrefab, false);
				}
				else{
					actManager.RegisterObj(newPrefab, removeInactive);
				}
			}
		}
	}

	//Connect Anchor
	if(prefabBoundsList[ID].connectAnchor){
		var cJ : ConfigurableJoint = newPrefab.GetComponent.<ConfigurableJoint>();
		if(cJ != null){
			cJ.autoConfigureConnectedAnchor = false;
			cJ.connectedAnchor = newPrefab.transform.position + prefabBoundsList[ID].connectAnchorOffset;
		}
	}

	//Send A Message
	if(prefabBoundsList[ID].sendMessageTo != null){
		for(i = 0; i < prefabBoundsList[ID].sendMessageTo.Length; i++){
			if(prefabBoundsList[ID].sendMessageTo[i].search){
				prefabBoundsList[ID].sendMessageTo[i].obj = GameObject.Find(prefabBoundsList[ID].sendMessageTo[i].searchString);
			}

			if(prefabBoundsList[ID].sendMessageTo[i].obj != null){
				if(prefabBoundsList[ID].sendMessageTo[i].valIsNewPrefab){
					prefabBoundsList[ID].sendMessageTo[i].obj.BroadcastMessage(prefabBoundsList[ID].sendMessageTo[i].message, newPrefab);
				}
				else{
					prefabBoundsList[ID].sendMessageTo[i].obj.BroadcastMessage(prefabBoundsList[ID].sendMessageTo[i].message);
				}
			}
			else{
				var newMsg : Obj_SendMsg_Delay = new Obj_SendMsg_Delay();
				newMsg.message = prefabBoundsList[ID].sendMessageTo[i].message;
				newMsg.searchString = prefabBoundsList[ID].sendMessageTo[i].searchString;
				newMsg.valIsNewPrefab = prefabBoundsList[ID].sendMessageTo[i].valIsNewPrefab;
				newMsg.newPrefab = newPrefab;
				delayedMsg.Add(newMsg);
				Debug.Log(prefabBoundsList[ID].prefab[0].name + " tried to send message to target obj but it is null. Waiting frame...");
			}
		}
	}

	//Render Queue
	if(prefabBoundsList[ID].renderQueue){
		var rendQ : RenderQueue;
		if(meshF == null){
			meshF = newPrefab.GetComponentsInChildren.<MeshFilter>();
		}
		if(meshF != null){
			for(i = 0; i < meshF.Length; i++){
				rendQ = meshF[i].GetComponent.<RenderQueue>();
				if(rendQ == null){
					rendQ = meshF[i].gameObject.AddComponent.<RenderQueue>();
				}
					rendQ.queue = prefabBoundsList[ID].renderQueue_Val;
			}
		}

		if(skinnedMesh == null){
			skinnedMesh = newPrefab.GetComponentInChildren.<SkinnedMeshRenderer>();
		}
		if(skinnedMesh != null){
			rendQ = skinnedMesh.GetComponent.<RenderQueue>();
			if(rendQ == null){
				rendQ = skinnedMesh.gameObject.AddComponent.<RenderQueue>();
			}
			rendQ.queue = prefabBoundsList[ID].renderQueue_Val;
		}
	}
}

class Obj_SendMsg_Delay{
	var searchString : String;
	var waitedFrame : boolean;
	@Space(30)
	var message : String;
	var valIsNewPrefab : boolean;
	var newPrefab : GameObject;
}

class SendMsgVector3{
	var methodName : String;
	var methodValue : Vector3;	
}

class SendMsgFloat{
	var methodName : String;
	var methodValue : float;	
}

class SendMsgColor{
	var methodName : String;
	var methodValue : Color;	
}


class SendMsgSimple{
	var methodName : String;
}

function Update () {
	for(var i = delayedMsg.length-1; i >= 0; i--){
		var thisMsg : Obj_SendMsg_Delay = delayedMsg[i];
		if(thisMsg.waitedFrame){
			var obj : GameObject = GameObject.Find(thisMsg.searchString);
			if(obj != null){
				if(thisMsg.valIsNewPrefab){
					obj.BroadcastMessage(thisMsg.message, thisMsg.newPrefab);
				}
				else{
					obj.BroadcastMessage(thisMsg.message);
				}
				delayedMsg.RemoveAt(i);
			}
			else{
				Debug.Log("Frame Wait failed. " + thisMsg.newPrefab.name + " tried to send message to target obj but it is null.");
			}
		}
		else{
			thisMsg.waitedFrame = true;
		}
	}

	if(player == null) GetPlayer();
	//if(player == null) return;
	
	var center : Vector3;
	for(i = 0; i < prefabBoundsList.Length; i++){
		if(prefabBoundsList[i].requireObjPresent){
			if(prefabBoundsList[i].requireObjP_obj == null){
				if(newObjThisFrame){
					prefabBoundsList[i].requireObjP_obj = GameObject.Find(prefabBoundsList[i].requireObjP_FindName);
				}
				continue;
			}
		}

		if(prefabBoundsList[i].disable) continue;

		prefabBoundsList[i].playerInLoadBounds = false;
		if(player != null){
			for(var n = 0; n < prefabBoundsList[i].loadBounds.Length; n++){
				center = prefabBoundsList[i].loadBounds[n].center;

				if(prefabBoundsList[i].useTransformAsBoundsCenter && prefabBoundsList[i].useTransformPosition != null){
					prefabBoundsList[i].loadBounds[n].center += prefabBoundsList[i].useTransformPosition.position;
				}

				if(prefabBoundsList[i].loadBounds[n].Contains(player.transform.position)){
					prefabBoundsList[i].playerInLoadBounds = true;
				}

				prefabBoundsList[i].loadBounds[n].center = center;

				if(prefabBoundsList[i].playerInLoadBounds){
					break;
				}
			}		
		}
		
		if(prefabBoundsList[i].forceLoad && Time.time > prefabBoundsList[i].forceLoadTime){
			prefabBoundsList[i].playerInLoadBounds = true;
		}
		
		if(!prefabBoundsList[i].loaded){
			//Require game value
			if(prefabBoundsList[i].requireGameVal){

				if(!prefabBoundsList[i].gotGameVal){
					prefabBoundsList[i].gotGameVal = true;

					var gameValString : String = "";
					if(prefabBoundsList[i].addGameLevelString > 0){
						var game : String = "0";

						var global : HoldGlobalValues = GameObject.FindObjectOfType.<HoldGlobalValues>();
						if(global != null){
							game = global.currentGame.ToString();;
						}

						gameValString += "Game " + game + " - Level " + prefabBoundsList[i].addGameLevelString.ToString() + " - ";				
					}

					gameValString +=  prefabBoundsList[i].requireGameVal_Name;

					prefabBoundsList[i].gameVal = PlayerPrefs.GetInt(gameValString);
				}

				if( prefabBoundsList[i].gameVal != prefabBoundsList[i].requireGameVal_Value ){
					continue;
				}
			}

			if(!(prefabBoundsList[i].loadedOnce && !prefabBoundsList[i].loadBackIfDestroyed)){
				//Create
				if(prefabBoundsList[i].playerInLoadBounds || loadEverythingOnStart){
					var newInstanceArray : Array = new Array();
						
					if(prefabBoundsList[i].usePrefabObjList){
						SpawnUsingPrefabObjList(i, newInstanceArray);
					}
					else{
						if(prefabBoundsList[i].prefab != null && prefabBoundsList[i].prefab.Length > 0){
							for(var m = 0 ; m < prefabBoundsList[i].prefab.Length; m++){
								var newPrefab : GameObject;
								newPrefab = Instantiate(prefabBoundsList[i].prefab[m]);
								if(removeCloneWord){
									newPrefab.name = newPrefab.name.Replace("(Clone)","");
								}
								if(addNumber){
									newPrefab.name = newPrefab.name + " " + i.ToString();
								}
								if(prefabBoundsList[i].useTransformPosition != null && !prefabBoundsList[i].leavePrefabDefaultPosition){
									newPrefab.transform.position = prefabBoundsList[i].useTransformPosition.position;
									if(prefabBoundsList[i].useTransformRotation){
										newPrefab.transform.rotation = prefabBoundsList[i].useTransformPosition.rotation;
									}
									if(prefabBoundsList[i].useTransformScale){
										newPrefab.transform.localScale = prefabBoundsList[i].useTransformPosition.localScale;
									}
								}
								ApplyChanges(i, newPrefab, m);
								newInstanceArray.Push(newPrefab);
							}
						}
					}
				
					//Set loaded instances on array.
					prefabBoundsList[i].instances = new GameObject[newInstanceArray.length];
					prefabBoundsList[i].instances = newInstanceArray.ToBuiltin(GameObject) as GameObject[];	
				
					prefabBoundsList[i].loaded = true;
					prefabBoundsList[i].loadedOnce = true;

					//Let other LoadPrefabBounds.js know that object has been created
					var allLPB : LoadPrefabByBounds[] = GameObject.FindObjectsOfType.<LoadPrefabByBounds>();
					for(var w = 0; w < allLPB.Length; w++){
						allLPB[w].gameObject.SendMessage("NewObj");
					}

					//Revert timed destroy
					if(prefabBoundsList[i].useTimedDestroy){
						if(prefabBoundsList[i].usingTimedDestroy){
							prefabBoundsList[i].usingTimedDestroy = false;
							for(var z = 0; z < prefabBoundsList[i].instances.Length; z++){
								var td : TimedDestroy = prefabBoundsList[i].instances[z].GetComponent.<TimedDestroy>();
								if(td != null){
									Destroy(td);
								}
							}
						}
					}
				}
			}
		}
		else{
			//Destroy
			if(!loadEverythingOnStart && prefabBoundsList[i].instances != null && !prefabBoundsList[i].playerInLoadBounds && player != null){
				if(prefabBoundsList[i].destroyIfOutside != null && prefabBoundsList[i].destroyIfOutside.Length != 0){
					var playerOutSideDestroyBounds : boolean = true;
					for(n = 0; n < prefabBoundsList[i].destroyIfOutside.Length; n++){
						center = prefabBoundsList[i].destroyIfOutside[n].center;
						if(prefabBoundsList[i].useTransformAsBoundsCenter && prefabBoundsList[i].useTransformPosition != null){
							prefabBoundsList[i].destroyIfOutside[n].center += prefabBoundsList[i].useTransformPosition.position;
						}
						if(prefabBoundsList[i].destroyIfOutside[n].Contains(player.transform.position)){
							playerOutSideDestroyBounds = false;
						}
						prefabBoundsList[i].destroyIfOutside[n].center = center;
						if(!playerOutSideDestroyBounds) break;
					}
					
					if(playerOutSideDestroyBounds){
						if(prefabBoundsList[i].instances != null){
							var usedTimedDestroy : boolean;
							for(z = 0; z < prefabBoundsList[i].instances.Length; z++){
								if(!prefabBoundsList[i].useTimedDestroy){
									Destroy(prefabBoundsList[i].instances[z]);
								}
								else{
									if(!prefabBoundsList[i].usingTimedDestroy){
										usedTimedDestroy = true;
										td = prefabBoundsList[i].instances[z].AddComponent.<TimedDestroy>();
										td.destroyTriggerTime = prefabBoundsList[i].timedDestroyDelay;
									}
								}
							}

							if(usedTimedDestroy){
								prefabBoundsList[i].usingTimedDestroy = true;
							}

							if(!prefabBoundsList[i].firstFrame){
								prefabBoundsList[i].loaded = false;
							}
						}
						if(freeMem){
							Resources.UnloadUnusedAssets();
						}
						prefabBoundsList[i].loaded = false;
					}
				}
			}	
		}
		
		prefabBoundsList[i].firstFrame = true;
	}

	newObjThisFrame = false;
}


function SpawnUsingPrefabObjList(ID : int, addToArray : Array){
	var newPrefab : GameObject;

	if(prefabBoundsList[ID].useTransformPosition == null 
	|| prefabBoundsList[ID].useTransformPosition != null && prefabBoundsList[ID].useTransformPosition.childCount == 0){
		Debug.Log(transform.name + ": Can't use prefab obj list without asigning a parent to the prefab objs. ID: " + ID);
	}
	else{
		for(var q = 0; q < prefabBoundsList[ID].useTransformPosition.childCount; q++){
			var child : Transform = prefabBoundsList[ID].useTransformPosition.GetChild(q);
			var prefabObjs : PrefabObjs = child.GetComponent.<PrefabObjs>();
			if(prefabObjs != null){
				var prefabObjsList : GameObject[] = prefabObjs.prefabObjs;
				if(prefabObjsList != null){
					for(var w = 0; w < prefabObjsList.Length; w++){
						newPrefab = Instantiate(prefabObjsList[w]);
						if(removeCloneWord) newPrefab.name = newPrefab.name.Replace("(Clone)","");
						
						newPrefab.transform.position = child.position;
						if(prefabBoundsList[ID].useTransformRotation){
							newPrefab.transform.rotation = child.rotation;
						}
						if(prefabBoundsList[ID].useTransformScale){
							newPrefab.transform.localScale = child.localScale;
						}
						ApplyChanges(ID, newPrefab, q);
						addToArray.Push(newPrefab);
					}
					//prefabBoundsList[ID].instances = new GameObject[newInstanceArray.length];
					//prefabBoundsList[ID].instances = newInstanceArray.ToBuiltin(GameObject) as GameObject[];
					
				}
				else{
					Debug.Log(child.name + " has a prefabObj, but the script has no prefabs defined.");
				}
			}
			else{
				Debug.Log(child.name + " should have a prefabObj script attached.");
			}
		}
	}
	
}

function OnDrawGizmosSelected(){
	#if UNITY_EDITOR
	if(debug){
		var center : Vector3;
		for(var i = 0; i < prefabBoundsList.Length; i++){
			if(prefabBoundsList[i].debug){
				if(prefabBoundsList[i].loadBounds != null){
					for(var n = 0; n < prefabBoundsList[i].loadBounds.Length; n++){
						center = prefabBoundsList[i].loadBounds[n].center;
						if(prefabBoundsList[i].useTransformAsBoundsCenter && prefabBoundsList[i].useTransformPosition != null){
							prefabBoundsList[i].loadBounds[n].center += prefabBoundsList[i].useTransformPosition.position;
						}
;
						Gizmos.color = Color(0,.3 + i * .1,0);
						Gizmos.DrawWireCube(prefabBoundsList[i].loadBounds[n].center, prefabBoundsList[i].loadBounds[n].size);
						prefabBoundsList[i].loadBounds[n].center = center;
					}
				}
				
				if(prefabBoundsList[i].destroyIfOutside != null){
					for(n = 0; n < prefabBoundsList[i].destroyIfOutside.Length; n++){
						center = prefabBoundsList[i].destroyIfOutside[n].center;
						if(prefabBoundsList[i].useTransformAsBoundsCenter && prefabBoundsList[i].useTransformPosition != null){
							prefabBoundsList[i].destroyIfOutside[n].center += prefabBoundsList[i].useTransformPosition.position;
						}

						Gizmos.color = Color(.3 + i * .1,0,0);
						Gizmos.DrawWireCube(prefabBoundsList[i].destroyIfOutside[n].center, prefabBoundsList[i].destroyIfOutside[n].size);
						prefabBoundsList[i].destroyIfOutside[n].center = center;
					}
				}
			}
		}
	}
	#endif
}