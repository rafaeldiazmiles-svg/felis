#pragma strict

var rooms : CameraRoom[];

var debug : boolean;

//var character : Transform;
var characterLocalPoint : Vector3;
var characterGlobalPoint : Vector3;

var cameraPosition : Vector3SmoothDamp;
var inDoorSmoothTime : float = .2;
var inDoorTransitionSpeed : float = .1;

var currentRoom : int;

var inDoors : ToggleBoolean;

var followChar : FollowCharacter;

class CameraRoom{
	@Header("----------------Input----------------------")
	var bounds : Bounds;
	var forceRoom : boolean;
	var useMovingTarget : Transform;
	var useMovingT_AvgPos : boolean;
	var cameraPosition : Vector3;

	var useRangeCenter : boolean;
	var rangeCenter : Vector3;

	var range : float;
	
	var ignoreX : boolean;
	var ignoreY : boolean;
	
	var addZoom : float;

	var priority : int;

	var disable : boolean;

	@Header("----------------Values----------------------")
	var influence : float;
	var characterPointDistance : float;
}

function Start () {
	cameraPosition.current = transform.position;
	
	followChar = transform.parent.GetComponent(FollowCharacter);
}

function Update () {
	if(followChar.lockX) return;
	
	cameraPosition.target = transform.parent.position;
	
	if(followChar.character != null){
		characterGlobalPoint = followChar.character.TransformPoint(characterLocalPoint);
	}
	
	currentRoom = -1;	

	var priority : int = 0;

	for(var i = 0; i < rooms.Length; i ++){
		if(rooms[i].priority < priority || rooms[i].disable){
			continue;
		}

		if(rooms[i].useMovingTarget != null ){
			if(rooms[i].useMovingT_AvgPos){
				rooms[i].cameraPosition = (rooms[i].useMovingTarget.position + characterGlobalPoint) * .5;
			}
			else{
				rooms[i].cameraPosition = rooms[i].useMovingTarget.position;
			}
		}

		if(rooms[i].useRangeCenter){
			rooms[i].characterPointDistance = Vector3.Distance(characterGlobalPoint, rooms[i].rangeCenter);
		}
		else{
			rooms[i].characterPointDistance = Vector3.Distance(characterGlobalPoint, rooms[i].cameraPosition);
		}

		rooms[i].influence = Mathf.Max(0, rooms[i].range - rooms[i].characterPointDistance) / rooms[i].range;
		
		if(rooms[i].bounds.Contains(characterGlobalPoint) || rooms[i].forceRoom){
			currentRoom = i;

			priority = rooms[i].priority;

			if(rooms[i].ignoreX){
			
			}
			else{
				cameraPosition.target.x = Mathf.Lerp(transform.parent.position.x, rooms[i].cameraPosition.x, rooms[i].influence);
			}
			if(rooms[i].ignoreY){
			
			}
			else{
				cameraPosition.target.y = Mathf.Lerp(transform.parent.position.y, rooms[i].cameraPosition.y, rooms[i].influence);
			}
			
			followChar.SetAddZoom(rooms[i].addZoom * rooms[i].influence, 1);
		}
	}
	
	if(currentRoom == -1){
		inDoors.current = false;
	}
	else{
		inDoors.current = true;
	}
	inDoors.Update();
	
	if(!inDoors.current){
		cameraPosition.time = Mathf.MoveTowards(cameraPosition.time, 0, Time.deltaTime * inDoorTransitionSpeed);
	}

	if(inDoors.toggledTrue){
		cameraPosition.time = cameraPosition.time = inDoorSmoothTime;
	}
	
	cameraPosition.target.x = Mathf.Clamp(cameraPosition.target.x, followChar.minX, followChar.maxX);
				
	cameraPosition.SmoothDamp();
	
	transform.position = cameraPosition.current;
	
	 
}

function OnDrawGizmosSelected(){
	#if UNITY_EDITOR
	if(debug){
		DebugUtility.DrawPoint(cameraPosition.target, .8, Color.red);
		DebugUtility.DrawPoint(cameraPosition.current, .8, Color.green);
		
		DebugUtility.DrawPoint(characterGlobalPoint, 1, Color.white);
		
		for(var i = 0; i < rooms.Length; i++){
			Gizmos.color = Color.blue;
			Gizmos.DrawWireCube(rooms[i].bounds.center, rooms[i].bounds.size);
			DebugUtility.DrawPoint(rooms[i].cameraPosition, .5, Color.yellow);


			if(rooms[i].useRangeCenter){
				DebugUtility.DrawCircle(rooms[i].rangeCenter, rooms[i].range, Vector3.forward, Color.green, 20);
			}
			else{
				DebugUtility.DrawCircle(rooms[i].cameraPosition, rooms[i].range, Vector3.forward, Color.green, 20);
			}
		}
	}
	#endif
}