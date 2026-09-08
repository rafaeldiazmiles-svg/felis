#pragma strict

var getGlowChildren : boolean = true;
var glowItems : GlowItem[];

var defColor : Color[];
var defSize : float[];

var sizeMultiply : float = 2.0;
var alphaMultiply : float = 2.0;
var glowCurve : AnimationCurve;

var melee : MeleeAttackSimple;

function Start () {
	glowItems = GetComponentsInChildren.<GlowItem>();
	defColor = new Color[glowItems.Length];
	defSize = new float[glowItems.Length];
	for(var i = 0; i < glowItems.Length; i++){
		defColor[i] = glowItems[i].color;
		defSize[i] = glowItems[i].size;
	}
}

function Update () {
	if(Time.time > melee.attacking.toggledTrueTime && Time.time < melee.attacking.toggledTrueTime + glowCurve.keys[glowCurve.length -1].time){
		for(var i = 0; i < glowItems.Length; i++){
			var lerp : float = 	glowCurve.Evaluate(Time.time - melee.attacking.toggledTrueTime);
			glowItems[i].color.a = Mathf.Lerp(defColor[i].a, defColor[i].a * alphaMultiply, lerp);
			glowItems[i].size = Mathf.Lerp(defSize[i], defSize[i] * sizeMultiply, lerp);
		}
	}
}