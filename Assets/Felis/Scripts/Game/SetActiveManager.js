#pragma strict


var player : GameObject;
var disableOnDist : float = 15.0;
var playerTag : String = "Player";

var manageObjs : Array;

var debug : boolean = true;

var getTimer : Timer;

var objNames : String[];

var removeInactiveDelay : float = 5.0;

var ignoreTags : String[];

var doNotRemoveTags : String[];


function Start () {
	 GetPlayer();
	
	if(getTimer.every == 0.0){
		getTimer.every = 6.0;
	}
	
	if(manageObjs == null){
		manageObjs = new Array();
	}
}

class SetActiveObj{
	var obj : GameObject;
	var rend : Renderer;
	var center : Transform;
	var inRange : ToggleBoolean;
	var firstFrame : boolean;
	var name : String;
	var removeInactive : boolean;

	var disableOnDist : float;

	var noRend : boolean;
	var seen : boolean;

}

function GetPlayer(){
	 player = GameObject.FindGameObjectWithTag(playerTag);
}

function RegisterObj(obj : GameObject, center : Transform, removeInactive : boolean, disableOnDist : float){
	//Ignore tags
	if(ignoreTags != null){
		for(var n = 0; n < ignoreTags.Length; n++){
			if(obj.tag == ignoreTags[n]){
				return;
			}
		}
	}

	//Proceed to register obj...
	var newObj : SetActiveObj = new SetActiveObj();
	newObj.obj = obj;
	newObj.rend = obj.GetComponentInChildren.<Renderer>();
	newObj.name = obj.name;
	newObj.inRange = new ToggleBoolean();
	if(center != null){
		newObj.center = center;
	}
	else{
		newObj.center = obj.transform;
	}
	newObj.removeInactive = removeInactive;

	if(manageObjs == null){
		manageObjs = new Array();
	}
	manageObjs.Push(newObj);

	newObj.disableOnDist = disableOnDist;

	#if UNITY_EDITOR
	objNames = new String[manageObjs.length];
	for(var i = 0; i < manageObjs.length; i++){
		var thisObj : SetActiveObj = manageObjs[i];
		objNames[i] = thisObj.name;
	}
	#endif

}

function RegisterObj(obj : GameObject){
	RegisterObj(obj, obj.transform, true, 0.0);
}

function RegisterObj(obj : GameObject, removeInactive : boolean){
	RegisterObj(obj, obj.transform, removeInactive, 0.0);	
}

function LateUpdate () {
	if(player == null){
		getTimer.Update();
		if(getTimer.current){
			GetPlayer();
		}
	}
	
	if(player != null && manageObjs != null){
		for(var i = manageObjs.length - 1; i >= 0; i--){
			var thisObj : SetActiveObj = manageObjs[i];
			if(thisObj.obj == null){
				
				if(debug){
					//Debug.Log("The object " + thisObj.name + " has been removed from Active Manager.");
				}
				manageObjs.RemoveAt(i);

			}
			else{
				

				//var xDist : float = Mathf.Abs(thisObj.obj.transform.position.x - player.transform.position.x);
				//var dist : float = Vector3.Distance(thisObj.center.position, player.transform.position);
				var dist : float = Vector2.Distance(Vector2(thisObj.center.position.x, thisObj.center.position.y), Vector2(player.transform.position.x, player.transform.position.y));

				var useDisableOnDist : float;

				if(thisObj.disableOnDist > 0){
					useDisableOnDist = thisObj.disableOnDist;
				}
				else{
					thisObj.disableOnDist = disableOnDist;
				}

				if(dist < useDisableOnDist){
					thisObj.inRange.current = true;
				}
				else{
					thisObj.inRange.current = false;
				}
				thisObj.inRange.Update();
				
				
				if(!thisObj.firstFrame){
					thisObj.firstFrame = true;
					if(dist < useDisableOnDist){
						thisObj.obj.SetActive(true);
					}
					else{
						thisObj.obj.SetActive(false);
					}
				}
				
				if(thisObj.inRange.toggledTrue){
					thisObj.obj.SetActive(true);

				}

				if(thisObj.inRange.current){
					if(thisObj.rend == null){
						thisObj.rend = thisObj.obj.GetComponentInChildren.<Renderer>();
					}

					if(!thisObj.noRend){
						if(thisObj.rend != null){
							if(thisObj.rend.isVisible){
								thisObj.seen = true;
							}
						}
						else{
							thisObj.noRend = true;
							//Debug.Log("SetActiveManager.js - " + thisObj.obj.name + " has no renderer.");
						}
					}
				}

				if(thisObj.inRange.toggledFalse){
					thisObj.obj.SetActive(false);
				}

				if(thisObj.seen && thisObj.removeInactive){
					if(!thisObj.inRange.current && Time.time > thisObj.inRange.toggledFalseTime + removeInactiveDelay){
						var forbiddenTag : boolean;
						for(var n = 0; n < doNotRemoveTags.Length; n++){
							if(thisObj.obj.tag == doNotRemoveTags[n]){
								forbiddenTag = true;
							}
						}

						if(!forbiddenTag){
							if(debug){
								//Debug.Log("The object " + thisObj.name + " has been removed from Active Manager (Inactive).");
							}
							Destroy(thisObj.obj);
							manageObjs.RemoveAt(i);
						}				
					}
				}

				#if UNITY_EDITOR
				if(debug){
					if(Selection.Contains(gameObject)){
						var debugColor : Color;
						if(thisObj.inRange.current){
							debugColor = Color.blue;
						}
						else{
							debugColor = Color.red;
						}
						Debug.DrawLine(transform.position, thisObj.center.position, debugColor);
					}
				}
				#endif
			}
			
		}
	}
}