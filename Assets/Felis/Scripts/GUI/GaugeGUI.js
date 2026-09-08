#pragma strict

var autoFindComponents : boolean = true;
var frameGroups : UVFrameGroups;

var gaugeIcons : int = 3;
var iconFrames : int = 4;

var gaugeValSmooth : FloatLerp;
var gaugeValSmoothSpeed : float = 5.0;

var shakyHearts : Shakiness[];
var shakeAmount : FloatLerp[];
var shakeSpeed : FloatLerp[];

var shakeAmountSpeed : float = 4.0;

var beatingShakeAmount : AnimationCurve;
var beatingShakeTimeOffset : float = .08;
var beatingShakeSpeed : float = 5;

var hurtShakeAmount : float = 1.0;
var hurtShakeSpeed : float = 20;

var type : GaugeType;

var health : Health;
var stamina : Stamina;
var gaugeTargetTag : String = "Player";

var maxValue : float;

var getTimer : Timer;

enum GaugeType{Health, Stamina}

var showGUIHead : Transform;
var showGUIHeadRend : Renderer;
var gHead_Scale : Vector3Lerp;
var guiHeadDefScale : Vector3;

function Start () {
	if(showGUIHead != null){
		guiHeadDefScale = showGUIHead.localScale;
	}

	if(gHead_Scale.speed == 0.0){
		gHead_Scale.speed = 5.0;
	}

	if(autoFindComponents){
		frameGroups = GetComponentInChildren(UVFrameGroups);
		GetTargetGaugeValue();
		shakyHearts = GetComponentsInChildren.<Shakiness>();

		shakeAmount = new FloatLerp[shakyHearts.Length];
		shakeSpeed = new FloatLerp[shakyHearts.Length];
		for(var i = 0; i < shakyHearts.Length; i++){
			shakeAmount[i] = new FloatLerp();
			shakeSpeed[i] = new FloatLerp();
		}

	}

	if(getTimer.every == 0.0){
		getTimer.every = 1.0;
	}
}

function GetTargetGaugeValue(){
	var tgtHealthObj : GameObject = GameObject.FindGameObjectWithTag(gaugeTargetTag);
	if(tgtHealthObj != null){
		health = tgtHealthObj.GetComponentInChildren(Health);
		stamina = tgtHealthObj.GetComponentInChildren(Stamina);
	}
}

function Update () {
	if(showGUIHead != null){
		if(health != null && health.health > 0){
			gHead_Scale.target = guiHeadDefScale;
		}
		else{
			gHead_Scale.target = Vector3.zero;
		}
		gHead_Scale.Lerp();

		showGUIHead.localScale = gHead_Scale.current;

		if(showGUIHeadRend == null){
			showGUIHeadRend = showGUIHead.GetComponent.<Renderer>();
		}

		showGUIHeadRend.enabled = gHead_Scale.current.x > .05;
	}

	getTimer.Update();
	if(getTimer.current){
		if(health == null){
			GetTargetGaugeValue();
		}
	}

	var changed : boolean;

	var gaugeVal : float;

	switch(type){
		case GaugeType.Health:
			if(health != null){
				gaugeVal = health.health;
				maxValue = health.maxHealth;
			}
			else{
				gaugeVal = 0.0;
				//maxValue = 100.0;
			}
		break;

		case GaugeType.Stamina:
			if(stamina != null){
				gaugeVal = stamina.stamina;
				maxValue = stamina.maxStamina;
			}	
			else{
				gaugeVal = 0.0;
				//maxValue = 100.0;
			}
		break;
	}


	gaugeValSmooth.target = gaugeVal - 5.0;
	gaugeValSmooth.speed = gaugeValSmoothSpeed;
	gaugeValSmooth.Lerp();

	
	//Heart 1
	for(var i = 0; i < gaugeIcons; i++){
		changed = false;
		var chunkTotal: int = gaugeIcons*iconFrames;
		var chunkSize : float = 1.0 / chunkTotal;

		var currentIcon : int = gaugeIcons - i - 1;
		var currentChunk : int;

		for(var n = 0; n < iconFrames; n++){
			currentChunk = chunkTotal - i*iconFrames - n -1;

			if(gaugeValSmooth.current> maxValue * chunkSize * currentChunk){
				changed = frameGroups.SetFrame(currentIcon, n);
				break;
			}
		}

		if(changed){
			shakeAmount[currentIcon].current = hurtShakeAmount;
			shakeSpeed[currentIcon].current = hurtShakeSpeed;
		}


		var minimumIconValue : float = maxValue * (chunkSize * currentChunk);

		if (gaugeValSmooth.current > minimumIconValue && gaugeValSmooth.current > 0.0){
			shakeAmount[currentIcon].target = beatingShakeAmount.Evaluate(Time.time + currentIcon * beatingShakeTimeOffset);
			shakeSpeed[currentIcon].target = beatingShakeSpeed;
			shakyHearts[currentIcon].defaultLocalRotation = Quaternion.Euler(0,0,0);
		}
		else{
			shakeAmount[currentIcon].target = 0;
			shakeSpeed[currentIcon].target = 0;	
			shakyHearts[currentIcon].defaultLocalRotation = Quaternion.Euler(0,180,0);
		}
	}
		
	
	for(i = 0; i < shakyHearts.Length; i++){
		shakeAmount[i].speed = shakeAmountSpeed;
		shakeSpeed[i].speed = shakeAmountSpeed;
		shakeAmount[i].Lerp();
		shakeSpeed[i].Lerp();
		shakyHearts[i].multiplier = shakeAmount[i].current;
		shakyHearts[i].changeSpeed = shakeSpeed[i].current;
	}
}