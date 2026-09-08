#pragma strict

var staminaGauge : GaugeGUI;

var dropShow : BlinkMaterial;

function Start () {
	if(staminaGauge == null){
		staminaGauge = transform.parent.GetComponentInChildren.<GaugeGUI>();
	}

	dropShow = GetComponent.<BlinkMaterial>();
}

function Update () {
	if(staminaGauge != null && staminaGauge.stamina != null && staminaGauge.stamina.underwater != null){
		dropShow.show.current = staminaGauge.stamina.underwater.isUnderwater.current;
	} 
}