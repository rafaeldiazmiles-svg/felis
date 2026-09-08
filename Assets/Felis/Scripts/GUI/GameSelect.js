#pragma strict

var show : boolean;

var currentGame : int;
var currentRow : int;

var cursor : GameSelect_Cursor;

var selectedGameBoneSize : float = 1.2;
var selectedGameBonePushOffset : float = 0.06;

var controlSpeed : float = 10.0;
var boneA_scaleControl : Vector3Lerp;
var boneB_scaleControl : Vector3Lerp;
var boneC_scaleControl : Vector3Lerp;

var boneA_posControl : Vector3Lerp;
var boneB_posControl : Vector3Lerp;
var boneC_posControl : Vector3Lerp;

var boneA_DefaultLocalPos : Vector3;
var boneB_DefaultLocalPos : Vector3;
var boneC_DefaultLocalPos : Vector3;

var boneA : Transform;
var boneB : Transform;
var boneC : Transform;

var menuRenderer : Renderer;
var propName : String = "_Color";
var menuColorBlendSpeed : float = 10.0;
var menuCurrentColor : Color;
var menuTargetColor : Color;

var textARenderer : Renderer;
var textBRenderer : Renderer;
var textCRenderer : Renderer;
var textA : UVFrameText;
var textB : UVFrameText;
var textC : UVFrameText;

function Start () {
	cursor = GetComponentInChildren(GameSelect_Cursor);

	boneA_scaleControl.speed = controlSpeed;
	boneB_scaleControl.speed = controlSpeed;
	boneC_scaleControl.speed = controlSpeed;

	boneA_posControl.speed = controlSpeed;
	boneB_posControl.speed = controlSpeed;
	boneC_posControl.speed = controlSpeed;

	boneA_DefaultLocalPos = boneA.localPosition;
	boneB_DefaultLocalPos = boneB.localPosition;
	boneC_DefaultLocalPos = boneC.localPosition;
}

function Update () {
	if(currentGame == 0){
		boneA_scaleControl.target = Vector3.one * selectedGameBoneSize;
		boneB_scaleControl.target = Vector3.one;
		boneC_scaleControl.target = Vector3.one;

		boneA_posControl.target = boneA_DefaultLocalPos;
		boneB_posControl.target = boneB_DefaultLocalPos + Vector3(-selectedGameBonePushOffset,0,0);
		boneC_posControl.target = boneC_DefaultLocalPos + Vector3(-selectedGameBonePushOffset,0,0);
	}
	if(currentGame == 1){
		boneA_scaleControl.target = Vector3.one;
		boneB_scaleControl.target = Vector3.one * selectedGameBoneSize;
		boneC_scaleControl.target = Vector3.one;

		boneA_posControl.target = boneA_DefaultLocalPos + Vector3(selectedGameBonePushOffset,0,0);
		boneB_posControl.target = boneB_DefaultLocalPos;
		boneC_posControl.target = boneC_DefaultLocalPos + Vector3(-selectedGameBonePushOffset,0,0);
	}
	if(currentGame == 2){
		boneA_scaleControl.target = Vector3.one;
		boneB_scaleControl.target = Vector3.one;
		boneC_scaleControl.target = Vector3.one * selectedGameBoneSize;

		boneA_posControl.target = boneA_DefaultLocalPos + Vector3(selectedGameBonePushOffset,0,0);
		boneB_posControl.target = boneB_DefaultLocalPos + Vector3(selectedGameBonePushOffset,0,0);
		boneC_posControl.target = boneC_DefaultLocalPos;
	}

	boneA_scaleControl.Lerp();
	boneB_scaleControl.Lerp();
	boneC_scaleControl.Lerp();

	boneA_posControl.Lerp();
	boneB_posControl.Lerp();
	boneC_posControl.Lerp();

	boneA.localScale = boneA_scaleControl.current;
	boneB.localScale = boneB_scaleControl.current;
	boneC.localScale = boneC_scaleControl.current;

	boneA.localPosition = boneA_posControl.current;
	boneB.localPosition = boneB_posControl.current;
	boneC.localPosition = boneC_posControl.current;
	
	cursor.currentGame = currentGame;
	cursor.currentRow = currentRow;
	
	cursor.show = show;
	if(show){
		menuTargetColor = Color.white;
	}
	else{
		menuTargetColor = Color.white;
		menuTargetColor.a = 0.0;
	}
	menuCurrentColor = Color.Lerp(menuCurrentColor, menuTargetColor, Time.deltaTime * menuColorBlendSpeed);
	menuRenderer.material.SetColor(propName, menuCurrentColor);
	textARenderer.material.SetColor(propName, menuCurrentColor);
	textBRenderer.material.SetColor(propName, menuCurrentColor);
	textCRenderer.material.SetColor(propName, menuCurrentColor);
	
	if(menuCurrentColor.a < .1){
		textARenderer.enabled = false;
		textBRenderer.enabled = false;
		textCRenderer.enabled = false;
		menuRenderer.enabled = false;
	}
	else{
		textARenderer.enabled = true;
		textBRenderer.enabled = true;
		textCRenderer.enabled = true;
		menuRenderer.enabled = true;		
	}
}

function IsVisible() : boolean{
	return menuTargetColor.a > .05;
}
