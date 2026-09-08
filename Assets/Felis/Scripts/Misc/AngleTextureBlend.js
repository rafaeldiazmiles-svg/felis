#pragma strict

var lerp1 : String = "_Lerp1";
var lerp2 : String = "_Lerp2";
var lerp3 : String = "_Lerp3";
var lerp4 : String = "_Lerp4";

var lerp1val : float;
var lerp2val : float;
var lerp3val : float;
var lerp4val : float;

var angle : float;

var rend : Renderer;

function Start () {
	if(rend == null){
		rend = GetComponent.<Renderer>();
	}
}

function Update () {
	angle = Mathf.Atan2(transform.right.y, transform.right.x) * Mathf.Rad2Deg;
	if(angle < 0){
		angle += 360;
	}

	if(angle < 90){
		lerp1val = 1.0;
		lerp2val = angle / 90;
		lerp3val = 0.0;
		lerp4val = 0.0;
	}
	if(angle >= 90 && angle < 180){
		lerp2val = 1.0;
		lerp3val = (angle -90) / 90;
		lerp4val = 0.0;
	}
	if(angle >= 180 && angle < 270){
		lerp3val = 1.0;
		lerp4val = (angle - 180) / 90;
	}
	if(angle >= 270){
		lerp1val = 1.0;
		lerp2val = 0.0;
		lerp3val = 0.0;
		lerp4val = 1 - ((angle - 270) / 90);
	}

	rend.material.SetFloat(lerp1, lerp1val);
	rend.material.SetFloat(lerp2, lerp2val);
	rend.material.SetFloat(lerp3, lerp3val);
	rend.material.SetFloat(lerp4, lerp4val);
}