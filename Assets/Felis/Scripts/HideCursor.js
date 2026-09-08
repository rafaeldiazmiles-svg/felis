#pragma strict

var hideTimer : Timer;

function Start () {
	#if !UNITY_EDITOR
	Cursor.visible = false;
	#endif
}

function Update () {
	#if !UNITY_EDITOR
	hideTimer.Update();
	if(hideTimer.current){
		Cursor.visible = false;
	}
	#endif
}