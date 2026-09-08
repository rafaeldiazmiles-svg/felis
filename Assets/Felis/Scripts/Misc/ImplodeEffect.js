#pragma strict

var defScale : Vector3;

var scale : Vector3SmoothDamp;

var imploding : boolean;;

var imploded : ToggleBoolean;

var rend : Renderer;

var scaleMagImplode : float = .2;

var implodePrefab : GameObject;

var implodeAudio : AudioSource;

@Space(30)
var onImplode_SendMsg : ImplodeEffect_OnImplodeSendMsg[];
var getTimer : Timer;

class ImplodeEffect_OnImplodeSendMsg{
	var msg : String;
	var tags : String[];
	var tagObjs : GameObject[];
	var range : float;
}

function OnImplode_SendMsg_Send(){
	for(var i = 0; i < onImplode_SendMsg.Length; i++){
		for(var n = 0; n < onImplode_SendMsg[i].tagObjs.Length; n++){
			var inRange : boolean = true;
			if(onImplode_SendMsg[i].range > 0){
				var dist : float = Vector3.Distance(transform.position, onImplode_SendMsg[i].tagObjs[n].transform.position);
				inRange = dist < onImplode_SendMsg[i].range;

			}
			onImplode_SendMsg[i].tagObjs[n].BroadcastMessage(onImplode_SendMsg[i].msg);
		}
	}
}

function OnImplode_SendMsg_GetObjs(){
	for(var i = 0; i < onImplode_SendMsg.Length; i++){
		var tagObjsArray : Array = new Array();
		for(var n = 0; n < onImplode_SendMsg[i].tags.Length; n++){
			var theseTagObjs : GameObject[] = GameObject.FindGameObjectsWithTag(onImplode_SendMsg[i].tags[n]);
			for(var m = 0; m < theseTagObjs.Length; m++){
				tagObjsArray.Add(theseTagObjs[m]);
			}
		}
		onImplode_SendMsg[i].tagObjs = tagObjsArray.ToBuiltin(GameObject);
	}
}

function Start () {
	defScale = transform.localScale;

	rend = GetComponentInChildren.<Renderer>();
}

function Update () {
	getTimer.Update();
	if(getTimer.current){
		OnImplode_SendMsg_GetObjs();
	}

	if(imploding){
		scale.target = Vector3.zero;
	}
	else{
		scale.target = defScale;
	}

	scale.SmoothDamp();

	transform.localScale = scale.current;

	rend.enabled = scale.current.magnitude > scaleMagImplode;

	imploded.current = !rend.enabled;

	imploded.Update();

	if(imploded.toggledTrue){
		if(implodePrefab != null){
			var prefabInstance : GameObject = GameObject.Instantiate(implodePrefab);
			prefabInstance.transform.position = transform.position;
		}

		if(implodeAudio != null){
			implodeAudio.Play();
		}

		OnImplode_SendMsg_Send();
	}
}