#pragma strict

var velocity : Vector2;

var xSinWaveAmplitude : float;
var xSinWaveSpeed : float;
var xSinWaveOffset : float;

var ySinWaveAmplitude : float;
var ySinWaveSpeed : float;
var ySinWaveOffset : float;

var startTime : float;
var randomize : float;
var randomizeRange : Vector2;

var size : float;
var sizeRandomRange : Vector2;
var sizeCurve : AnimationCurve;

var currentBubbleEffect : float;

var bubbleEffectSpeed : float;
var bubbleEffectAmplitude : float;
var bubbleEffectOffset : float;

var bubbleEffectAmplitude_Speed : float;
var bubbleEffectAmplitude_Amplitude : float;
var bubbleEffectAmplitude_Offset : float;


function Start () {
	randomize = Random.Range(randomizeRange.x, randomizeRange.y);
	size = Random.Range(sizeRandomRange.x, sizeRandomRange.y);
	
	startTime = Time.time;
	
	transform.localScale = Vector3.one * size * sizeCurve.Evaluate(0.0);
}

function Update () {
	transform.position.x += velocity.x * Time.deltaTime;
	transform.position.y += velocity.y * Time.deltaTime;
	
	velocity.x = Mathf.Sin(xSinWaveSpeed * Time.time - startTime + randomize) * xSinWaveAmplitude + xSinWaveOffset;
	
	velocity.y = Mathf.Sin(ySinWaveSpeed * Time.time - startTime + randomize) * ySinWaveAmplitude + ySinWaveOffset;
	
	transform.localScale = Vector3.one * size * sizeCurve.Evaluate(Time.time - startTime);
	
	bubbleEffectAmplitude = Mathf.Sin(Time.time * bubbleEffectAmplitude_Speed - startTime) * bubbleEffectAmplitude_Amplitude + bubbleEffectAmplitude_Offset;
	currentBubbleEffect = Mathf.Sin(Time.time * bubbleEffectSpeed - startTime) * bubbleEffectAmplitude + bubbleEffectOffset;
	
	
	if(currentBubbleEffect != 0){
		transform.localScale.x *= currentBubbleEffect;
		transform.localScale.y *= 1/currentBubbleEffect;
	}
	
	if(Time.time > sizeCurve[sizeCurve.length - 1].time + startTime){
		Destroy(gameObject);
		//gameObject.SetActive(false);
	}
}