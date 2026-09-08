#pragma strict

var minSize : Vector3 = Vector3.one;
var maxSize : Vector3 = Vector3.one * 2.0;

var newScale : Vector3;

var side : int = 1.0;


var relativeSize : boolean;

var everyFrame : boolean;

function Start () {
	Reset();
	/*if(relativeSize){
		newScale = Vector3.Scale(transform.localScale, Vector3.Lerp(minSize, maxSize, Random.value));
	}
	else{
		newScale = Vector3.Lerp(minSize, maxSize, Random.value);
	}
	
	transform.localScale = newScale;
	transform.localScale.x *= side;*/
}

function LateUpdate(){
	if(everyFrame){
		transform.localScale = newScale;
		transform.localScale.x *= side;	
	}
}

function Reset(){
	if(relativeSize){
		newScale = Vector3.Scale(transform.localScale, Vector3.Lerp(minSize, maxSize, Random.value));
	}
	else{
		newScale = Vector3.Lerp(minSize, maxSize, Random.value);
	}
	
	transform.localScale = newScale;
	transform.localScale.x *= side;	
}