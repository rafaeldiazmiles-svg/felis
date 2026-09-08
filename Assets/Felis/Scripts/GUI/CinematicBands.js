#pragma strict

var top : Transform;
var bottom : Transform;

var topName : String = "Cinematic Band Top";
var bottomName : String = "Cinematic Band Bottom ";

var defPosTop : Vector3;
var defPosBottom : Vector3;

var offset : float = .1;

var topPos : Vector3Lerp;
var bottomPos : Vector3Lerp;

var show : boolean;

var active : ToggleBoolean;

function Start () {
	defPosTop = top.localPosition;
	defPosBottom = bottom.localPosition;

	topPos.current = defPosTop;
	bottomPos.current = defPosBottom;

	if(topPos.speed == 0.0){
		topPos.speed = 4.0;
	}
	bottomPos.speed = topPos.speed;
}

function Update () {
	if(show){
		topPos.target = defPosTop;
		bottomPos.target = defPosBottom;
	}
	else{
		topPos.target = defPosTop + Vector3(0, offset, 0);
		bottomPos.target = defPosBottom + Vector3(0, -offset, 0); 
	}

	topPos.Lerp();
	bottomPos.Lerp();

	top.localPosition = topPos.current;
	bottom.localPosition = bottomPos.current;

	active.current = top.localPosition.y < defPosTop.y + offset - .01;
	active.Update();
	if(active.justToggled){
		top.gameObject.SetActive(active.current);
		bottom.gameObject.SetActive(active.current);
	}
}