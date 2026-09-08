#pragma strict

var room : CameraRoom;

var center : boolean;

function Start () {
	var stayInRoom : StayInRoom = GameObject.FindObjectOfType.<StayInRoom>();
	if(stayInRoom != null){
		var roomsArray : Array = new Array();
		for(var i = 0; i < stayInRoom.rooms.Length; i++){
			roomsArray.Push(stayInRoom.rooms[i]);
		}
		
		var exists : boolean = false;
		if(center){
			room.bounds.center += transform.position;
			room.cameraPosition += transform.position;
			room.rangeCenter += transform.position;
		}		
		
		for(i = 0; i < stayInRoom.rooms.Length; i++){
			var newRoomBounds : Bounds = room.bounds;
			var existingRoomBounds: Bounds = stayInRoom.rooms[i].bounds;
			if(newRoomBounds.center == existingRoomBounds.center){ //Assuming there will never be two room areas at the same pos.
				exists = true;
				break;
			}
		}
		if(!exists){

			roomsArray.Push(room);
		}
		
		stayInRoom.rooms = roomsArray.ToBuiltin(CameraRoom) as CameraRoom[];
	}
}

function OnDrawGizmosSelected(){
	#if UNITY_EDITOR
	if(center){
		
	}
	Gizmos.color = Color.blue;
	if(room == null) return;
	var useCenter : Vector3 = room.bounds.center;
	if(center){
		useCenter += transform.position;
	}
	Gizmos.DrawWireCube(useCenter, room.bounds.size);
	
	var useCameraPos : Vector3 = room.cameraPosition;
	var useRangeCenter : Vector3 = room.rangeCenter;
	if(center){
		useCameraPos += transform.position;
		useRangeCenter += transform.position; 
	}
	DebugUtility.DrawPoint(useCameraPos, .5, Color.yellow);
	if(room.useRangeCenter){
		DebugUtility.DrawCircle(useRangeCenter, room.range, Vector3.forward, Color.green, 20);
		DebugUtility.DrawCircle(useRangeCenter, room.range, Vector3.right, Color.green, 20);
	}
	else{
		DebugUtility.DrawCircle(useCameraPos, room.range, Vector3.forward, Color.green, 20);
		DebugUtility.DrawCircle(useCameraPos, room.range, Vector3.right, Color.green, 20);
	}

	#endif
}