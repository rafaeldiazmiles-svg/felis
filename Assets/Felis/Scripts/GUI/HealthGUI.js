#pragma strict

var autoFindComponents : boolean = true;
var frameGroups : UVFrameGroups;

var healthSmooth : FloatLerp;
var healthSmoothSpeed : float = 5.0;

var shakyHearts : Shakiness[];
var shakeAmount : FloatLerp[];
var shakeSpeed : FloatLerp[];
var shakeAmountSpeed : float = 2.0;

var beatingShakeAmount : float = .5;
var beatingShakeSpeed : float = 6;
var hurtShakeAmount : float = 1.0;
var hurtShakeSpeed : float = 30;

var health : Health;
var playerTag : String = "Player";

var screenPosition : Vector2;
var cameraDistance : float;

var maxHealth : float;

function Start () {
	if(autoFindComponents){
		frameGroups = GetComponentInChildren(UVFrameGroups);
		GetPlayerHealth();// health = GameObject.FindGameObjectWithTag(playerTag).GetComponentInChildren(Health);
		shakyHearts = GetComponentsInChildren.<Shakiness>();
		shakeAmount = new FloatLerp[shakyHearts.Length];
		for(var i = 0; i < shakeAmount.Length; i++) shakeAmount[i] = new FloatLerp();
		shakeSpeed = new FloatLerp[shakyHearts.Length];
		for(var n = 0; n < shakeAmount.Length; n++) shakeSpeed[n] = new FloatLerp();
	}
}

function GetPlayerHealth(){
	var playerObj : GameObject = GameObject.FindGameObjectWithTag(playerTag);
	if(playerObj != null){
		health = GameObject.FindGameObjectWithTag(playerTag).GetComponentInChildren(Health);
	}
}

function Update () {
	if(health == null){
		GetPlayerHealth();
	}
	
	transform.position = Camera.main.ScreenToWorldPoint(Vector3(Screen.width * screenPosition.x, Screen.height * screenPosition.y,cameraDistance));
	
	var changed : boolean;

	var characterHealth : float;
	if(health != null){
		if(health.riding){
			characterHealth = health.mountHealth;
		}
		else{
			characterHealth = health.health;
		}
	}

	healthSmooth.target = characterHealth - 5.0;
	healthSmooth.speed = healthSmoothSpeed;
	healthSmooth.Lerp();
	
	if(health != null) maxHealth = health.maxHealth;
	
	//Heart 1
	changed = false;
	if		(healthSmooth.current> maxHealth * (0.0625*15.0)) changed = frameGroups.SetFrame(3,0);
	else if (healthSmooth.current> maxHealth * (0.0625*14.0)) changed = frameGroups.SetFrame(3,1);
	else if (healthSmooth.current> maxHealth * (0.0625*13.0)) changed = frameGroups.SetFrame(3,2);
	else if (healthSmooth.current> maxHealth * (0.0625*12.0)) changed = frameGroups.SetFrame(3,3);
	else changed = frameGroups.SetFrame(3,4);
	
	if(changed){
		shakeAmount[3].current = hurtShakeAmount;
		shakeSpeed[3].current = hurtShakeSpeed;
	}
	if (healthSmooth.current> maxHealth * (0.0625*12.0)){
		shakeAmount[3].target = beatingShakeAmount;
		shakeSpeed[3].target = beatingShakeSpeed;
	}
	else{
		shakeAmount[3].target = 0;
		shakeSpeed[3].target = 0;	
	}
		
	//Heart 2
	changed = false;
	if		(healthSmooth.current> maxHealth * (0.0625*11.0)) changed = frameGroups.SetFrame(2,0);
	else if (healthSmooth.current> maxHealth * (0.0625*10.0)) changed = frameGroups.SetFrame(2,1);
	else if (healthSmooth.current> maxHealth * (0.0625*9.0)) changed = frameGroups.SetFrame(2,2);
	else if (healthSmooth.current> maxHealth * (0.0625*8.0)) changed = frameGroups.SetFrame(2,3);
	else changed = frameGroups.SetFrame(2,4);
	
	if(changed){
		shakeAmount[2].current = hurtShakeAmount;
		shakeSpeed[2].current = hurtShakeSpeed;
	}
	if (healthSmooth.current> maxHealth * (0.0625*8.0)){
		shakeAmount[2].target = beatingShakeAmount;
		shakeSpeed[2].target = beatingShakeSpeed;
	}
	else{
		shakeAmount[2].target = 0;
		shakeSpeed[2].target = 0;	
	}
		
	//Heart 3
	changed = false;
	if		(healthSmooth.current> maxHealth * (0.0625*7.0)) changed = frameGroups.SetFrame(1,0);
	else if (healthSmooth.current> maxHealth * (0.0625*6.0)) changed = frameGroups.SetFrame(1,1);
	else if (healthSmooth.current> maxHealth * (0.0625*5.0)) changed = frameGroups.SetFrame(1,2);
	else if (healthSmooth.current> maxHealth * (0.0625*4.0)) changed = frameGroups.SetFrame(1,3);
	else changed = frameGroups.SetFrame(1,4);
	
	if(changed){
		shakeAmount[1].current = hurtShakeAmount;
		shakeSpeed[1].current = hurtShakeSpeed;
	}
	if (healthSmooth.current> maxHealth * (0.0625*4.0)){
		shakeAmount[1].target = beatingShakeAmount;
		shakeSpeed[1].target = beatingShakeSpeed;
	}
	else{
		shakeAmount[1].target = 0;
		shakeSpeed[1].target = 0;	
	}
	
	//Heart 4
	changed = false;
	if		(healthSmooth.current> maxHealth * (0.0625*3.0)) changed = frameGroups.SetFrame(0,0);
	else if (healthSmooth.current> maxHealth * (0.0625*2.0)) changed = frameGroups.SetFrame(0,1);
	else if (healthSmooth.current> maxHealth * (0.0625*1.0)) changed = frameGroups.SetFrame(0,2);
	else if (healthSmooth.current> maxHealth * (0.0625*0.0)) changed = frameGroups.SetFrame(0,3);
	else changed = frameGroups.SetFrame(0,4);
	
	if(changed){
		shakeAmount[0].current = hurtShakeAmount;
		shakeSpeed[0].current = hurtShakeSpeed;
	}
	if (healthSmooth.current> maxHealth * (0.0625*0.0)){
		shakeAmount[0].target = beatingShakeAmount;
		shakeSpeed[0].target = beatingShakeSpeed;
	}
	else{
		shakeAmount[0].target = 0;
		shakeSpeed[0].target = 0;	
	}
	
	for(var i = 0; i < shakyHearts.Length; i++){
		shakeAmount[i].speed = shakeAmountSpeed;
		shakeSpeed[i].speed = shakeAmountSpeed;
		shakeAmount[i].Lerp();
		shakeSpeed[i].Lerp();
		shakyHearts[i].multiplier = shakeAmount[i].current;
		shakyHearts[i].changeSpeed = shakeSpeed[i].current;
	}
}