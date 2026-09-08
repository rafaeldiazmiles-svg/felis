#pragma strict
var loadResources : boolean = true;
@Space(30)
var isCaged : boolean;
var wasCaged : boolean;
@Space(30)
var faceAnim : FaceAnim;
var sweat : SweatDropsParticles;
@Space(30)
var cry : boolean = true;
var askHelp : boolean = true;
@Space(30)
var uncageAudio : AudioSource;

function Caged_NoLoad(){
	loadResources = false;
}


function LoadResources(){
	if(uncageAudio == null){
		uncageAudio = gameObject.AddComponent.<AudioSource>();
		uncageAudio.clip =  Resources.Load("Audio/Jingles/Cage Success Tune", AudioClip);
	}

}

function Start(){
	if(loadResources){
		LoadResources();
	}

	faceAnim = GetComponentInChildren.<FaceAnim>();
	sweat = GetComponentInChildren.<SweatDropsParticles>();
}

function Update(){
	if(isCaged){
		if(faceAnim != null){
			if(askHelp){
				faceAnim.askHelpUntil = Time.time + .3;
			}
		}
		if(sweat != null){
			if(cry){
				sweat.forceSweatDropUntil = Time.time + .3;
			}
		}
	}

	if(isCaged != wasCaged){
		if(!isCaged){
			if(uncageAudio != null){
				uncageAudio.Play();
			}

			var p : CharacterParty;
			p = GetComponentInChildren.<CharacterParty>();
			if(p != null){
				p.charSaved.current = true;
			}

		}

		wasCaged = isCaged;
	}
}