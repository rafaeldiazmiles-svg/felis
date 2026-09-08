#pragma strict

var pointRenderer : Renderer;
var sizeHiding : boolean = true;
var size : Vector3Lerp;
var disable : boolean;
var disablePrev : boolean;

var broadcastMessage : String;

var disableUntil : float;
var enableAfter : boolean;

var useArea : boolean;
var areaSize : Vector2;

var onlyTgtObj : boolean;
var sendMsgObj : GameObject;

var debugColor : Color = Color.white;

function Start () {
    if(size.speed == 0.0){
        size.speed = 8.0;
    }
}

function Update () {
    if(Time.time < disableUntil){
        disable = true;
    }
    else{
    	if(enableAfter){
    		disable = false;
    	}
    }
    
    //Size control
    if(sizeHiding){
        //Size
        size.Lerp();
        if(disable){
            size.target = Vector3.zero;
        }
        else{
            size.target = Vector3.one;
        }
        //Renderer
		if(pointRenderer != null){
	        if(size.current.magnitude < .1){
	            pointRenderer.enabled = false;
	        }
	        else{
	            pointRenderer.enabled = true;
	        }
        }
        //Set Size
        transform.localScale = size.current;
    }
}

function Use(){
	//Debug.Log(broadcastMessage);
	if(sendMsgObj == null){
    	gameObject.BroadcastMessage(broadcastMessage);
    }
    else{
    	if(onlyTgtObj){
    		sendMsgObj.SendMessage(broadcastMessage);
    	}
    	else{
    		sendMsgObj.BroadcastMessage(broadcastMessage);
    	}
    }
}

function DisableFor(duration : float){
    disable = true;
    disableUntil = Time.time + duration;
}

function OnDrawGizmosSelected(){
	#if UNITY_EDITOR
	if(useArea){
		var center : Vector3 = Camera.main.WorldToViewportPoint(transform.position);

		var leftVP : float = center.x - areaSize.x;
		var rightVP : float = center.x + areaSize.x;
		var topVP : float = center.y + areaSize.y;
		var bottomVP : float = center.y - areaSize.y;

		var topLeftWorld : Vector3 = Camera.main.ViewportToWorldPoint(Vector3(leftVP, topVP, Camera.main.nearClipPlane));
		var topRightWorld : Vector3 = Camera.main.ViewportToWorldPoint(Vector3(rightVP, topVP, Camera.main.nearClipPlane));
		var bottomLeftWorld : Vector3 = Camera.main.ViewportToWorldPoint(Vector3(leftVP, bottomVP, Camera.main.nearClipPlane));
		var bottomRightWorld : Vector3 = Camera.main.ViewportToWorldPoint(Vector3(rightVP, bottomVP, Camera.main.nearClipPlane));

		Gizmos.color = debugColor;
		Gizmos.DrawLine(topLeftWorld, topRightWorld);
		Gizmos.DrawLine(bottomLeftWorld, bottomRightWorld);
		Gizmos.DrawLine(topRightWorld, bottomRightWorld);
		Gizmos.DrawLine(topLeftWorld, bottomLeftWorld);
	}
	#endif
}

function TestAreaPos(vPPos : Vector3) : boolean{
	var center : Vector3 = Camera.main.WorldToViewportPoint(transform.position);

	var x : float = center.x - areaSize.x;
	var y : float = center.y - areaSize.y;

	var area : Rect = Rect(x, y, areaSize.x * 2.0, areaSize.y * 2.0);

	return area.Contains(vPPos);
}