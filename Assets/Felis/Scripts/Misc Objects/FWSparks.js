#pragma strict

var sparksPrefab : GameObject;

var explode : boolean;
var explodeTime : float;

var sparkAmount : int; //Sparks create every explosion.
var sparkRate : float; 

var sparks = new Array();

var defaultRotation : Quaternion;
var occilateAngle : float;
var occilateRange : float;
var occilateSpeed : float;

var startColor : Color;
var endColor : Color;

var startScale : Vector3 = Vector3.one;
var endScale : Vector3 = Vector3.one;

class FWSpark{
	var triggerTime : float;
	var color : Color;
	var scale : Vector3;
	function FWSpark(newTime : float){
		triggerTime = newTime;
	}
}

function Start () {
	defaultRotation = transform.rotation;
	
	
}

function Update () {
	transform.rotation = defaultRotation;
	occilateAngle = Mathf.Sin(Time.time * occilateSpeed) * occilateRange;
	transform.RotateAround(transform.position, Vector3.forward, occilateAngle);
	
	if(explode){
		explodeTime = Time.time;
		
		for(var i = 0; i < sparkAmount; i++){
			var newSpark : FWSpark = new FWSpark(Time.time + (i*sparkRate));
			var lerpValue : float = i*1.0 / (sparkAmount-1);
			newSpark.color = Color.Lerp(startColor, endColor, lerpValue);
			newSpark.scale = Vector3.Lerp(startScale, endScale, lerpValue);
			sparks.Push(newSpark);
		}
		
		explode = false;
	}
}

function FixedUpdate(){
	for(var i = sparks.length-1; i >= 0; i--){
		var spark : FWSpark = sparks[i] as FWSpark;
		if(Time.time > spark.triggerTime){
			CreateSpark(spark.color, spark.scale);
			sparks.RemoveAt(i);
		}
	}
}

function CreateSpark(color : Color, scale : Vector3){
	var newSpark : GameObject = Instantiate(sparksPrefab, transform.position, transform.rotation);
	newSpark.GetComponentInChildren.<ColorAnimation>().multiplyColor = color;
	newSpark.transform.localScale = scale;
}