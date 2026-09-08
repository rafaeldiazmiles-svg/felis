#pragma strict
var offset : float;
var speed : float = 1.0;
var length : float = .25;
var x : boolean = true;
@Space(30)
var phase : float;
var defScale : Vector3;

function Start () {
	defScale = transform.localScale;
}

function Update () {
	phase += Time.deltaTime * speed;
	var scale : float = defScale.x + Mathf.Sin(phase + offset) * length;
	if(x)transform.localScale.x = scale;
}