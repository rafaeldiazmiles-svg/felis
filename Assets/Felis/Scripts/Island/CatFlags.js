#pragma strict

var catFlags : CatFlag[]; 

var animSpeed : float = 3.0;
var animBlendSpeed : float = 5.0;

var updateWithLevelID : boolean = true;
var startScreenName : String = "Start Screen";
var startScreen : StartScreen;

var flagDropAnimName : String = "Flag Drop";
var flagIdleAnimName : String = "Flag Idle";

var showTimeVariation : float = .3;

var prosperoFrameGroupName : String = "Prospero";
var frameShowName : String = "Show";
var frameHideName : String = "Hide";

var catOneFrameGroupName : String = "Cat One Saved";
var catTwoFrameGroupName : String = "Cat Two Saved";
var catThreeFrameGroupName : String = "Cat Three Saved";
var catOneFrameName   : String = "Cat 1";
var catTwoFrameName   : String = "Cat 2";
var catThreeFrameName : String = "Cat 3";

var flagSound : AudioSource;

function Start () {
	startScreen = GameObject.Find(startScreenName).GetComponent(StartScreen);

	for(var i = 0; i < catFlags.Length; i++){
		catFlags[i].startScreen = startScreen;
		catFlags[i].flagSound = flagSound;
	}
}

class CatFlag{
	var startScreen : StartScreen;
	var flagSound : AudioSource;
	@Space(30)
	var show : ToggleBoolean;
	var showTime : float;
	var showTimeVariation : float;
	var animComp : Animation;
	var animClip : AnimationClip;
	var animTimeControl : FloatMoveTowards;
	@Space(30)
	var flagPrefabFull : GameObject;
	var flagPrefabTwoCats : GameObject;
	var flagPrefabOneCat : GameObject;
	var flagPrefabNoCats : GameObject;
	@Space(15)
	var usePrefabCombination : boolean;
	var flagPrefabTwoCats_AB : GameObject;
	var flagPrefabTwoCats_AC : GameObject;
	var flagPrefabTwoCats_BC : GameObject;
	var flagPrefabOneCat_A : GameObject;
	var flagPrefabOneCat_B : GameObject;
	var flagPrefabOneCat_C : GameObject;

	@Space(30)
	var currentFlagPrefab : GameObject;
	var rend : Renderer;
	var flagAnimComp : Animation;
	var flagDropAnimName : String;
	var flagIdleAnimName : String;
	var flagIdleWeightControl : FloatLerp;
	
	var cat1_Texture : Texture;
	var cat2_Texture : Texture;
	var cat3_Texture : Texture;
		
	var setHidden : boolean;

	var levelID : int;
	
	var setCatFaceTexture : boolean;
	var setFlag : boolean;

	function Update(){
		show.Update();
		animTimeControl.MoveTowards();
		flagIdleWeightControl.Lerp();
		
		if(show.toggledTrue){
			showTime = Time.time + Random.value * showTimeVariation;

			SetFlagObject();
			if(!usePrefabCombination){
				SetCatFaceTexture();
			}
			flagSound.Play();
		}
		if(show.toggledFalse){
			setHidden = true;
		}
		
		if(show.current && Time.time > showTime){
			animTimeControl.target = 1.0;
			
		}
		
		if(setHidden){
			setHidden = false;
			animTimeControl.current = 0.0;
			animTimeControl.target = 0.0;
			show.current = false;
		}
		
		animComp[animClip.name].speed = 0.0;
		animComp[animClip.name].enabled = true;
		animComp[animClip.name].weight = 1.0;
		animComp[animClip.name].normalizedTime = animTimeControl.current;

		if(currentFlagPrefab != null){
			if(flagAnimComp == null){
				flagAnimComp = currentFlagPrefab.GetComponentInChildren(Animation);
			}
			
			if(flagAnimComp != null){
				flagAnimComp[flagDropAnimName].enabled = true;
				flagAnimComp[flagDropAnimName].weight = 1.0;
				flagAnimComp[flagDropAnimName].normalizedTime = animTimeControl.current;
			}
			
			flagAnimComp[flagIdleAnimName].enabled = true;
			flagAnimComp[flagIdleAnimName].layer = 2;
			flagAnimComp[flagIdleAnimName].weight = flagIdleWeightControl.current;
			
			if(flagAnimComp[flagDropAnimName].normalizedTime > .5){
				flagIdleWeightControl.target = 1.0;
			}
			else{
				flagIdleWeightControl.target = 0.0;
			}
		}

	}
	
	function SetFlagObject(){
		var catsSaved : int;

		var A : boolean = startScreen.levels[levelID].catOneSaved;
		var B : boolean = startScreen.levels[levelID].catTwoSaved;
		var C : boolean = startScreen.levels[levelID].catThreeSaved;

		if(startScreen.levels[levelID].catOneSaved){
			catsSaved++;
		}
		if(startScreen.levels[levelID].catTwoSaved){
			catsSaved++;
		}
		if(startScreen.levels[levelID].catThreeSaved){
			catsSaved++;
		}

		if(currentFlagPrefab != null){
			GameObject.Destroy(currentFlagPrefab);
		}
		if(!usePrefabCombination){
			switch(catsSaved){
				case 0:
					currentFlagPrefab = GameObject.Instantiate(flagPrefabNoCats, animComp.transform.position, animComp.transform.rotation);
					break;
				case 1:
					currentFlagPrefab = GameObject.Instantiate(flagPrefabOneCat, animComp.transform.position, animComp.transform.rotation);
					break;
				case 2:
					currentFlagPrefab = GameObject.Instantiate(flagPrefabTwoCats, animComp.transform.position, animComp.transform.rotation);
					break;
				case 3:
					currentFlagPrefab = GameObject.Instantiate(flagPrefabFull, animComp.transform.position, animComp.transform.rotation);
					break;
			}
		}
		else{
			if(catsSaved == 3){
				currentFlagPrefab = GameObject.Instantiate(flagPrefabFull, animComp.transform.position, animComp.transform.rotation);
			}
			if(catsSaved == 2){
				if(A && B){
					currentFlagPrefab = GameObject.Instantiate(flagPrefabTwoCats_AB, animComp.transform.position, animComp.transform.rotation);
				}
				if(A && C){
					currentFlagPrefab = GameObject.Instantiate(flagPrefabTwoCats_AC, animComp.transform.position, animComp.transform.rotation);
				}
				if(B && C){
					currentFlagPrefab = GameObject.Instantiate(flagPrefabTwoCats_BC, animComp.transform.position, animComp.transform.rotation);
				}
			}
			if(catsSaved == 1){
				if(A){
					currentFlagPrefab = GameObject.Instantiate(flagPrefabOneCat_A, animComp.transform.position, animComp.transform.rotation);
				}
				if(B){
					currentFlagPrefab = GameObject.Instantiate(flagPrefabOneCat_B, animComp.transform.position, animComp.transform.rotation);
				}
				if(C){
					currentFlagPrefab = GameObject.Instantiate(flagPrefabOneCat_C, animComp.transform.position, animComp.transform.rotation);
				}
			}
			if(catsSaved == 0){
				currentFlagPrefab = GameObject.Instantiate(flagPrefabNoCats, animComp.transform.position, animComp.transform.rotation);
			}
		}

		currentFlagPrefab.transform.parent = animComp.transform;

		//Hide Prospero Face
		rend = currentFlagPrefab.GetComponentInChildren(Renderer);
		if(startScreen.levels[levelID].completed){ 
			rend.materials[1].color.a = 1.0;
		}
		else{
			rend.materials[1].color.a = 0.0;
		}
	}

	function SetCatFaceTexture(){
		var catOneSaved : boolean = startScreen.levels[levelID].catOneSaved;
		var catTwoSaved : boolean = startScreen.levels[levelID].catTwoSaved;
		var catThreeSaved : boolean = startScreen.levels[levelID].catThreeSaved;
		
		if(catOneSaved){
			if(cat1_Texture != null){
				rend.materials[2].mainTexture = cat1_Texture;
			}
			if(catTwoSaved){
				if(cat2_Texture != null){
					rend.materials[3].mainTexture = cat2_Texture;
				}
				if(catThreeSaved){
					if(cat3_Texture != null){
						rend.materials[4].mainTexture = cat3_Texture;
					}
				}
			}
			else{
				if(catThreeSaved){
					if(cat3_Texture != null){
						rend.materials[3].mainTexture = cat3_Texture;
					}
				}
			}
		}
		else{
			if(catTwoSaved){
				if(cat2_Texture != null){
					rend.materials[2].mainTexture = cat2_Texture;
				}
				if(catThreeSaved){
					if(cat3_Texture != null){
						rend.materials[3].mainTexture = cat3_Texture;
					}
				}
			}
			else{
				if(catThreeSaved){
					if(cat3_Texture != null){
						rend.materials[2].mainTexture = cat3_Texture;
					}
				}
			}
		}
		

	}

}



function Update () {
	for(var i = 0; i < catFlags.Length; i++){
		catFlags[i].animTimeControl.speed = animSpeed;
		catFlags[i].showTimeVariation = showTimeVariation;
		catFlags[i].flagDropAnimName = flagDropAnimName;
		catFlags[i].flagIdleAnimName = flagIdleAnimName;
		catFlags[i].flagIdleWeightControl.speed = animBlendSpeed;

		if(startScreen.currentLevel != -1){
			catFlags[i].show.current = startScreen.IsLevelAvailable(catFlags[i].levelID);
		}
		else{
			catFlags[i].show.current = false;
		}
		
		catFlags[i].Update();
		
	}
}



