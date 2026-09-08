#pragma strict

var player : GameObject;
var playerTag : String = "Player";

var catRescueDist : float = 5.0;

var frameGroups : UVFrameGroups;

var damp : float = 1.0;
var springForce : float = 2.0;

var catIcons : CatIcon[];

var catRescueDelay : float = 1.0;
var showDeadDelay : float = 1.0;

var catSaved : TriggerAnimation;
var catSavedHeadRend : Renderer;
var disableCatSavedUntil : float;
var disableCatSavedDuration : float = 4.0;

var catDead : TriggerAnimation;
var catDeadHeadRend : Renderer;
var disableCatDeadUntil : float;
var disableCatDeadDuration : float = 4.0;

@Space(10)
var rescueAudio : AudioSource[];
var currentRescueAudio : int;

function GetCatNumber(cat : Transform) : int{
	for(var i = 0; i < catIcons.Length; i++){
		if(catIcons[i].cat == cat){
			if(catIcons[i].bone == catIcons[0].bone)    return 1;
			if(catIcons[i].bone == catIcons[1].bone )    return 2;
			if(catIcons[i].bone == catIcons[2].bone )  return 3;
		}
	}
	return 0;
}

class CatIcon{
	var scale : Vector3Spring;
	var skullScale : Vector3Spring;
	@Space(30)
	var bone : Transform;
	var catSkull : Transform;
	@Space(30)
	var show : ToggleBoolean;
	var catDead : ToggleBoolean;
	@Space(30)
	var cat : Transform;
	var catHealth : Health;
	var caged : Caged;
	var tied : CatTied;
	var rescued : ToggleBoolean;
	var catSavedMsg : ToggleBoolean;
	var catDeadMsg : ToggleBoolean;
	@Space(30)
	var defaultScale : Vector3;
	@Space(30)
	var changedMesh : boolean;

	function Update(){
		show.Update();

		//Cat Head
		if(show.toggledTrue){
			if(defaultScale == Vector3.zero){
				defaultScale = Vector3.one;
			}

			scale.target = defaultScale;
		}


		if(show.toggledFalse){
			scale.target = Vector3.zero;
		}


		scale.Spring();
		bone.localScale = scale.current;

		if(Mathf.Abs(bone.localScale.x) < .2){
			bone.localScale = Vector3.zero;
		}

		//Dead
		if(rescued.current && (catHealth.health != null && catHealth.health <= 0 || cat == null)){
			catDead.current = true;
		}
		catDead.Update();


		skullScale.Spring();


		if(catSkull != null){
			catSkull.localScale = skullScale.current;


			if(Mathf.Abs(catSkull.localScale.x) < .2){
				catSkull.localScale = Vector3.zero;
			}
		}


	}

	var nextBlinkTime : float;
	var blinking : ToggleBoolean;


}

function Start () {
	frameGroups = GetComponentInChildren(UVFrameGroups);
	GetPlayer();

	for(var i = 0; i < catIcons.Length; i ++){
		catIcons[i].defaultScale = catIcons[i].bone.localScale;
	}

}

function GetPlayer(){
	player = GameObject.FindGameObjectWithTag(playerTag);

}

function Update () {
	if(player == null){
		GetPlayer();
	}


	
	for(var i : int = 0; i < catIcons.Length; i++){
		if(catIcons[i].catSkull == null){
			catIcons[i].catSkull = transform.Find("Cat Skull " + (i+1).ToString());
		}

		if(catIcons[i].cat != null && player != null){

			if(Vector3.Distance(catIcons[i].cat.position, player.transform.position) < catRescueDist){
				var tied : boolean;
				if(catIcons[i].tied != null && catIcons[i].tied.tied.current){
					tied = true;
				}
				var caged : boolean;
				if(catIcons[i].caged != null && catIcons[i].caged.isCaged){
					caged = true;
				}

				if(!tied && !caged){
					//catIcons[i].show.current = true;
					catIcons[i].rescued.current = true;
				}
			}
		}
		catIcons[i].rescued.Update();

		if(catIcons[i].rescued.current && Time.time > catIcons[i].rescued.toggledTrueTime + catRescueDelay){
			catIcons[i].show.current = true;
			if(Time.time > disableCatSavedUntil){
				catIcons[i].catSavedMsg.current = true;
				//catSaved.play = true;
			}
		}
		catIcons[i].catSavedMsg.Update();
		if(catIcons[i].catSavedMsg.toggledTrue){
			catSaved.gameObject.SetActive(true);
			catSaved.play = true;
			disableCatSavedUntil = Time.time + disableCatSavedDuration;
			catSavedHeadRend.material.mainTexture = catIcons[i].bone.GetComponentInChildren.<Renderer>().material.mainTexture;

			if(catIcons[i].changedMesh){
				catSavedHeadRend.gameObject.GetComponent.<MeshFilter>().mesh = catIcons[i].bone.GetComponent.<MeshFilter>().mesh;
				catSavedHeadRend.gameObject.GetComponentInChildren.<TriggerAnimation>().triggerUVAnim = null;
			}

			if(rescueAudio != null && rescueAudio.Length > 0){
				catSaved.soundSequence[1].sound = rescueAudio[currentRescueAudio];
				currentRescueAudio++;
				currentRescueAudio = Mathf.Min(rescueAudio.Length - 1, currentRescueAudio);
			}
		}

		//Skull
		if(catIcons[i].catDead.current && Time.time > catIcons[i].catDead.toggledTrueTime + showDeadDelay){
			catIcons[i].skullScale.target = Vector3.one;
			catIcons[i].scale.target = Vector3.zero;
			catIcons[i].catDeadMsg.current = true;
		}

		catIcons[i].catDeadMsg.Update();
		if(catIcons[i].catDeadMsg.toggledTrue){
			catDead.gameObject.SetActive(true);
			catDead.play = true;
			disableCatDeadUntil = Time.time + disableCatDeadDuration;
			catDeadHeadRend.material.mainTexture = catIcons[i].bone.GetComponentInChildren.<Renderer>().material.mainTexture;

			if(catIcons[i].changedMesh){
				catDeadHeadRend.gameObject.GetComponent.<MeshFilter>().mesh = catIcons[i].bone.GetComponent.<MeshFilter>().mesh;
				catSavedHeadRend.gameObject.GetComponentInChildren.<TriggerAnimation>().triggerUVAnim = null;
			}
		}

		catIcons[i].Update();
		catIcons[i].scale.damp = damp;
		catIcons[i].scale.springForce = springForce;
		catIcons[i].skullScale.damp = damp;
		catIcons[i].skullScale.springForce = springForce;
	}
}