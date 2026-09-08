#pragma strict

var colAnim : ColorAnimation;
var scroll : ScrollMaterial;
var scale : ScaleOverTime;
var pSpeed : ParticleSpeed;
var td : TimedDestroy;

var sDamage : SpikesDamage;

var rend : Renderer;

var speed : float;

var reset : boolean;

var glowT : Transform;
var glowC : GlowItem;
var glowXPos : AnimationCurve;
var glowAlpha : AnimationCurve;
var glowRed : AnimationCurve;
var glowSize : AnimationCurve;

var startTime : float;

var f1_StartTime : float = -1;

var replicate : int = 6;
var replicated : boolean;
var replicateDelay : float = .1;
var replicateUV_Offset : float = -.2;

var rep_ScaleCurve : AnimationCurve;
var rep_Extend : float;

var rep_Gravity : float = -.5;

var damageStart : float = .05;
var damageEnd : float = .3;

function Start () {
	startTime = Time.time;
	glowC = glowT.GetComponent.<GlowItem>();
	if(f1_StartTime < 0){
		f1_StartTime = startTime;
	}
	scale.multiplier = rep_ScaleCurve.Evaluate(Time.time - f1_StartTime);


	scroll.addOffset.y = replicateUV_Offset * Mathf.Round(Random.value * (1 / Mathf.Abs(replicateUV_Offset)));

	scroll.addOffset.y = scroll.addOffset.y % 1.0;

	sDamage = GetComponentInChildren.<SpikesDamage>();
	sDamage.enabled = false;
}

function Update () {
	if(Time.time > startTime + damageStart && Time.time < startTime + damageEnd){
		sDamage.enabled = true;
	}
	if(Time.time > startTime + damageEnd){
		sDamage.enabled = false;
	}

	colAnim.speed = speed;
	scroll.curveSpeed = speed;
	scale.speed = speed;

	if(reset){
		reset = false;
		Reset();
	}

	glowT.localPosition.x = glowXPos.Evaluate((Time.time - startTime) * speed);
	glowC.color.a = glowAlpha.Evaluate((Time.time - startTime) * speed);
	glowC.startColor.r = glowRed.Evaluate((Time.time - startTime) * speed);
	glowC.size = glowSize.Evaluate((Time.time - startTime) * speed);

	if(replicate > 0 && !replicated && Time.time > startTime + replicateDelay){
		var repl_Flame : GameObject = GameObject.Instantiate(gameObject);
		repl_Flame.transform.position = transform.position;

		var rf_flame : Flame = repl_Flame.GetComponent.<Flame>();

		rf_flame.pSpeed.startSpeed.y += rep_Gravity;

		rf_flame.Reset();
		rf_flame.replicate = replicate - 1;

		rf_flame.scroll.addOffset.y += replicateUV_Offset;
		rf_flame.scroll.addOffset.y = rf_flame.scroll.addOffset.y % 1.0;

		rf_flame.scale.defaultScale = scale.defaultScale;
		repl_Flame.transform.localScale = rf_flame.scale.defaultScale;

		repl_Flame.transform.position.x += rf_flame.pSpeed.startSpeed.x * rep_Extend;
		repl_Flame.transform.position.y += rf_flame.pSpeed.startSpeed.y * rep_Extend;

		rf_flame.pSpeed.lockToSource = transform;



		rf_flame.pSpeed.SetSL();

		rf_flame.scroll.rendererComp.material.renderQueue = 3001 + (replicate % 3);

		replicated = true;
	}

}

function Reset(){
	colAnim.resetStartTimeNow = true;
	//scroll.resetStartTimeNow = true;
	scroll.Reset();
	scale.resetStartTimeNow = true;
	pSpeed.velocity = pSpeed.startSpeed; 
	td.Reset();

	startTime = Time.time;	
}