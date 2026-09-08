#pragma strict

var text : String[];
@Space(20)
var chars : Transform[];
var charsPrefab : GameObject;
@Space(20)
var centerText : boolean = true;
@Space(20)
var invertCharOrder : boolean;
@Space(20)
var addIsometricHeight : float;
@Space(20)
var textWidth : float = .1;
var lineHeight : float = .4;
@Space(20)
var combineMesh : CombineMesh;
@Space(20)
var textObj : GameObject;
@Space(20)
var addRenderQueue : boolean;
var queue : int = 3020;
@Space(20)
var parentToCamera : boolean;
var camLocalPos : Vector3 = Vector3(0,0,5);
var camScale : Vector3 = Vector3(.6,.6,.6);
var camLocalRot : Vector3 = Vector3(0,180,0);
@Space(20)
var parentTo : Transform;
@Space(20)
var sendRendMsgs : FontMeshArrange_SendMsg[]; //When Renderer is created, send message passing Renderer 

@Space(20)
var materialSetStartColor : boolean;
var startColor : Color;
var disableRend : boolean;

@Space(20)
var setLocalScale : boolean;
var setScale : Vector3 = Vector3.one;
var setLocalPos : boolean;
var localPos : Vector3;
var setLocalRot : boolean;
var localRot : Vector3;

@Space(20)
var updateText : boolean;

class FontMeshArrange_SendMsg{
	var msgs : String[];
	var sendObjs : GameObject[];
	@Space(15)
	var searchSendObjs : boolean;
	var searchNames : String[];	
}

function Start () {
	SetText();
}

function Update(){
	if(updateText){
		updateText = false;
		if(charsPrefab == null){
			charsPrefab = Resources.Load("Prefabs/GUI/Chars", GameObject);
		}
		SetText();
	}
}

function SetText(){
	var cleared : boolean;
	if(combineMesh != null){
		combineMesh.Clear();
		cleared = true;
	}

	if(cleared){
		yield;
	}

	transform.eulerAngles = Vector3.zero;
	transform.localScale = Vector3.one;

	if(charsPrefab == null){
		chars = GetComponentsInChildren.<Transform>();
	}
	else{
		var charsPrefabInstance : GameObject = GameObject.Instantiate(charsPrefab);
		chars = charsPrefabInstance.GetComponentsInChildren.<Transform>();
		for(var charTransform : Transform in chars){
			charTransform.parent = transform;
		}
		Destroy(charsPrefabInstance);	
	}

	var firstChar : int;
	var lastChar : int;
	var charAdd : int;

	for(var m = 0; m < text.Length; m++){
		var textLength : float = text[m].Length * textWidth;

		if(invertCharOrder){
			firstChar = text[m].Length - 1;
			lastChar = -1;
			charAdd = -1;			
		}
		else{
			firstChar = 0;
			lastChar = text[m].Length;
			charAdd = 1;
		}

		for(var i = firstChar; i != lastChar; i += charAdd){
			var currentChar : String = text[m].Substring(i, 1);
			for(var n = 0; n < chars.Length; n++){
				if(currentChar == chars[n].name){
					var newChar : Transform = GameObject.Instantiate(chars[n]);
					newChar.position = transform.position + Vector3(-i * textWidth, -m * lineHeight + i * addIsometricHeight, 0);
					if(centerText){
						newChar.position.x += textLength * .5;
					}
					newChar.parent = transform;
					break;
				}
			}
		}
	}

	for(i = 0; i < chars.Length; i++){
		if(chars[i] != transform){
			chars[i].parent = null;
			Destroy(chars[i].gameObject);
		}
	}

	combineMesh = GetComponent.<CombineMesh>();
	if(combineMesh == null){
		combineMesh = gameObject.AddComponent.<CombineMesh>();
	}
	textObj = combineMesh.CombineChildren();

	textObj.transform.parent = transform;

	if(addRenderQueue){
		var queueComp : RenderQueue = gameObject.AddComponent.<RenderQueue>();
		queueComp.queue = queue;
	}

	if(parentToCamera){
		transform.parent = Camera.main.transform;
		transform.localPosition = camLocalPos;
		transform.localEulerAngles = camLocalRot;
		transform.localScale = camScale;
	}
	else{
		if(parentTo != null){
			transform.parent = parentTo;
		}
	}

	var textObjRend : Renderer = textObj.GetComponent.<Renderer>();

	if(sendRendMsgs != null){
		for(i = 0; i < sendRendMsgs.Length; i++){
			for(n = 0; n < sendRendMsgs[i].msgs.Length; n++){
				for(m = 0; m < sendRendMsgs[i].sendObjs.Length; m++){
					if(sendRendMsgs[i].sendObjs[m] != null){
						sendRendMsgs[i].sendObjs[m].SendMessage(sendRendMsgs[i].msgs[n], textObjRend);
					}
				}

				if(sendRendMsgs[i].searchSendObjs){
					for(var w = 0; w < sendRendMsgs[i].searchNames.Length; w++){
						var msgObj : GameObject = GameObject.Find(sendRendMsgs[i].searchNames[w]);
						if(msgObj != null) {
							msgObj.SendMessage(sendRendMsgs[i].msgs[n], textObjRend);
						}
					}	
				}
			}
		}
	}

	if(materialSetStartColor){
		textObjRend.material.color = startColor;
	}

	if(disableRend){
		textObjRend.enabled = false;	
	}

	if(setLocalScale){
		textObj.transform.localScale = setScale;
	}

	if(setLocalPos){
		textObj.transform.localPosition = localPos;
	}

	if(setLocalRot){
		textObj.transform.localEulerAngles = localRot;
	}
}