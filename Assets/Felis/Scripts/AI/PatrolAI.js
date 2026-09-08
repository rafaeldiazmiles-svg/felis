#pragma strict

//Patrol values
@Header("-------------Autoget Components------------")
var followAI : MovementAI;
var wingedFlightAI : WingedFlightAI;

@Header("-----------------Input---------------")
var enablePatrol : boolean;
@Space(30)
var points : Vector3[];
var stayTime : Vector2;
@Space(30)
var debug : boolean;

@Header("-----------------Values---------------")
var targetPoint : int;
var nextPointTime : float;
var lockPointTarget : boolean;
var previousEnablePatrol : boolean;


static var pointDebugSize : float = .5;
static var debugColor : Color = Color.yellow;


function Start () {
	if(transform.parent != null){
		followAI = transform.parent.GetComponentInChildren(MovementAI);
		wingedFlightAI = transform.parent.GetComponentInChildren(WingedFlightAI);
	}	
	else{
		followAI = GetComponentInChildren(MovementAI);
		wingedFlightAI = GetComponentInChildren(WingedFlightAI);		
	}

}

function Update () {
	if(enablePatrol){
		if(followAI != null){
			followAI.targetPosition = points[targetPoint];
			
			if(followAI.onTarget.toggledTrue){
				nextPointTime = Time.time + Random.Range(stayTime.x, stayTime.y);
				lockPointTarget = false;
			}
		}
		
		if(wingedFlightAI != null){
			wingedFlightAI.useExtraHeight = true;
			
			wingedFlightAI.targetTransform = null;
			
			wingedFlightAI.targetPosition = points[targetPoint];
		
			if(wingedFlightAI.onTarget.toggledTrue){
				nextPointTime = Time.time + Random.Range(stayTime.x, stayTime.y);
				lockPointTarget = false;		
			}
		}
		
		if(Time.time > nextPointTime && !lockPointTarget){
			targetPoint = (targetPoint + 1) % points.Length;
			lockPointTarget = true;
		}
	}
	
	
	//Debug
	if(debug) Debug.DrawLine(transform.position, points[targetPoint], Color.gray);
}

function StopPatrol(){
	enablePatrol = false;
	followAI.StopFollowing();
}

function StartPatrol(){
	enablePatrol = true;
	followAI.enableMovement = true;
}

function OnDrawGizmosSelected(){
	if(debug){
		Gizmos.color = debugColor;
		
		var guiStyle : GUIStyle = new GUIStyle();
		guiStyle.normal.textColor = debugColor;
		
		for(var i = 0; i < points.Length; i++){
			#if UNITY_EDITOR 
			DebugUtility.DrawGizmoPoint(points[i],pointDebugSize);
			Handles.Label(points[i] + Vector3.up * pointDebugSize, i.ToString(), guiStyle);
			#endif
		}
	}
}