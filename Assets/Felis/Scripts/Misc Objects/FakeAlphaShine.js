#pragma strict

var rend : Renderer;

var scaleObj: Transform;
var scaleObj_useRoot : boolean = true;;

var posWaveLength : Vector2 = Vector2.one;;

var min : float = .2;

var powCurve : float = 1.0;

function Start () {
	rend = GetComponent.<Renderer>();
}

function Update () {
	var alphaShine : float;

	if(scaleObj_useRoot){
		scaleObj = transform.root;
	}

	var side : int = 1;

	if(scaleObj != null){
		side = Mathf.Sign(scaleObj.localScale.x);
	}

	if(side > 0){
		alphaShine = Mathf.Sin(transform.position.x * posWaveLength.x + transform.position.y * posWaveLength.y);
	}
	else{
		alphaShine = Mathf.Cos(transform.position.x * posWaveLength.x + transform.position.y * posWaveLength.y);
	}

	alphaShine = Mathf.Abs(alphaShine);

	alphaShine = Mathf.Pow(alphaShine, powCurve);

	alphaShine = Mathf.Max(alphaShine, min);

	rend.material.color.a = alphaShine;
}