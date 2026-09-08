#pragma strict

var showingSign : ToggleBoolean;

var scaleControl : Vector3Lerp;
var defaultScale : Vector3;
@Space(30)
var textObj : GameObject;
var textRenderer : Renderer;
var textWidth : float;
var lineHeight : float;
var textMaterialID : int;
var textObj_DefaultLocalPos : Vector3;
var textObj_DefaultLocalRot : Quaternion;
var textObj_DefaultLocalScale : Vector3;

@Space(30)

var buttonsRenderer : Renderer;
var dialogRenderers : Renderer[];
var textFade : FloatLerp;
var textFadeDelayDuration : float = 1.0;
var propertyName : String = "_Color";


var questionAudio : AudioSource;

var ready : boolean;
var hidden : boolean;

var pause : Pause;

@Space(30)

var textPrefab : GameObject;
var setNewText : boolean;
var setText : String[];

function AddDialogRend(newRend : Renderer){
	var dialogRendsArray : Array = new Array();
	for(var dRend : Renderer in dialogRenderers){
		if(dRend != null){
			dialogRendsArray.Add(dRend);
		}
	}
	dialogRendsArray.Add(newRend);
	dialogRenderers = dialogRendsArray.ToBuiltin(Renderer);
}


function SetTextLine(newText : String){
	setText = new String[1];
	setText[0] = newText;
	setNewText = true;
}

function ChangeText(){
	if(textPrefab == null){
		textPrefab = Resources.Load("Prefabs/GUI/Text", GameObject);
	}
	var newTextObj : GameObject = GameObject.Instantiate(textPrefab);
	var fontMesh : FontMeshArrange = newTextObj.GetComponent.<FontMeshArrange>();
	newTextObj.transform.parent = textObj.transform.parent;
	fontMesh.setLocalScale = true;
	fontMesh.setLocalRot = true;
	fontMesh.setLocalPos = false;
	if(textObj == null){
		newTextObj.transform.localPosition = textObj_DefaultLocalPos;
		//newTextObj.transform.localRotation = textObj_DefaultLocalRot;

		fontMesh.setScale = textObj_DefaultLocalScale;
	}
	else{
		newTextObj.transform.localPosition = textObj.transform.localPosition;
		//newTextObj.transform.localRotation = textObj.transform.localRotation;
		fontMesh.setLocalScale = true;
		fontMesh.setScale = textObj.transform.localScale;
	}
	fontMesh.text = setText;
	fontMesh.sendRendMsgs[0].msgs[0] = "GetText";
	fontMesh.sendRendMsgs[0].sendObjs[0] = gameObject;
	fontMesh.textWidth = textWidth;
	fontMesh.lineHeight = lineHeight;

	Destroy(textObj);
}

function GetText(newRend : Renderer){
	textRenderer = newRend;
	textObj = newRend.gameObject;

	textObj_DefaultLocalPos = textObj.transform.localPosition;
	textObj_DefaultLocalRot = textObj.transform.localRotation;
	textObj_DefaultLocalScale = textObj.transform.localScale;

	var fontMR : FontMeshArrange = textObj.GetComponent.<FontMeshArrange>();
	if(fontMR){
		textWidth = fontMR.textWidth;
		lineHeight = fontMR.lineHeight;
	}

}

function Start () {
	pause = GameObject.FindObjectOfType.<Pause>();

	defaultScale = transform.localScale;
	
	var menuSoundObj : GameObject = GameObject.Find("Menu Sound");
	
	if(menuSoundObj != null){
		var questionObj : GameObject = menuSoundObj.Find("Question");
		if(questionObj != null){
			questionAudio = questionObj.GetComponent.<AudioSource>();
		}
	}
	else{
		questionAudio = GetComponent.<AudioSource>();
		//Debug.Log("Input question can't find Start Screen. Cant retrieve Audio");
	}


}

function FixedUpdate () {
	ready = scaleControl.current.x > defaultScale.x * .9;
	
	if(setNewText && ready){
		setNewText = false;
		ChangeText();
	}

	hidden = scaleControl.current.x < defaultScale.x * .05;

	showingSign.Update();
	scaleControl.Lerp();
	textFade.Lerp();
	
	if(showingSign.toggledTrue){
		scaleControl.target = defaultScale;
		if(questionAudio != null){
			questionAudio.Play();
		}
		//pause.StopGame();
		if(!pause.pause.current && !pause.inventory.show.current){
			pause.Darken();
		}
	}
	
	if(showingSign.toggledFalse){
		scaleControl.target = Vector3.zero;
		//pause.UnStopGame();
		if(!pause.pause.current && !pause.inventory.show.current){
			pause.UnDarken();
		}
	}

	if(textRenderer != null){
		textRenderer.materials[textMaterialID].SetColor(propertyName, Color(1,1,1,textFade.current));
	}
	if(buttonsRenderer != null){
		buttonsRenderer.material.SetColor(propertyName, Color(1,1,1,textFade.current));
	}
	for(var dialogRenderer : Renderer in dialogRenderers){
		if(dialogRenderer != null){
			dialogRenderer.material.SetColor(propertyName, Color(1,1,1,textFade.current));
		}
	}
	
	if(showingSign.current && Time.time > showingSign.toggledTrueTime + textFadeDelayDuration){
		textFade.target = 1.0;
	}
	else{
		textFade.target = 0.0;
	}
	
	transform.localScale = scaleControl.current;
	
	if(transform.localScale.magnitude < .1){
		if(textRenderer != null){
			textRenderer.enabled = false;
		}
		if(buttonsRenderer != null){
			buttonsRenderer.enabled = false;
		}
		for(var dialogRenderer : Renderer in dialogRenderers){
				if(dialogRenderer == null){
					continue;
				}
			dialogRenderer.enabled = false;
		}
	}
	else{
		if(textRenderer != null){
			textRenderer.enabled = true;
		}
		if(buttonsRenderer != null){
			buttonsRenderer.enabled = true;
		}	
		for(var dialogRenderer : Renderer in dialogRenderers){
			if(dialogRenderer == null){
				continue;
			}
			dialogRenderer.enabled = true;
		}
	}
}