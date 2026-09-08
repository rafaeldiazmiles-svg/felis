#pragma strict

var autoFindComponents : boolean = true;					
var startScreen : StartScreen;
var startScreenObjectName : String = "Start Screen";
var animComp : Animation;
@Space(20)
var griffinRideAnim : AnimationClip;

@Space(40)
var boatRend : Renderer;

var boatBounds : Bounds;
var boatSize : Vector3Lerp;
var boatSizeT : Vector3 = Vector3(0.33, .33, .54);

var boatAudioLoop : AudioSource;
var boatVolume : FloatLerp;
var boatVolumeT : float = .7;
@Space(40)
var griffin : GameObject;
var griffinRend : Renderer;
var griffinAnim : Animation;

var griffinFlyAnim : AnimationClip;

var griffinBounds : Bounds;
var griffinSize : Vector3Lerp;
var griffinSizeT : Vector3 = Vector3.one;

var griffinAudio : AudioSource;
var griffinAudioVolume : FloatLerp;
var griffinAudioVolumeY : float = 1.0;
@Space(40)
var islandAnimPath : Transform;
var islandAnimPathName : String = "Island Animation Path";
var islandAnimPathComp : Animation;

@Space(40)
@Header("--------------path anims----------------")
var path_House_Tower : AnimationClip;
var path_Tower_DarkForest : AnimationClip;
var path_DarkForest_LostTemple : AnimationClip;
var path_LostTemple_Crossroads : AnimationClip;
var path_Crossroads_DeepLake : AnimationClip;
var path_Crossroads_GriffinTower : AnimationClip;
var path_DeepLake_Mushrooms : AnimationClip;
var path_Mushrooms_Mines : AnimationClip;
var path_Mines_Ruins : AnimationClip;
var path_Mushrooms_TreeVillage : AnimationClip;
var path_Mushrooms_PirateShip : AnimationClip;
var path_GriffinTower_Dragon : AnimationClip;
@Space(40)
var idleAnimationClip : AnimationClip;
var runAnimationClip : AnimationClip;

var charRenderers : Renderer[];
var enableRender : boolean;

static var level_Prologue : int = 1;
static var level_Tower : int = 2;
static var level_DarkForest : int = 3;
static var level_LostTemple : int = 4;
static var level_CrossRoads : int = 5;
static var level_DeepLake: int = 6;
static var level_GriffinTower: int = 7;
static var level_Mushrooms: int = 8;
static var level_Mines: int = 9;
static var level_Ruins : int = 10;
static var level_TreeVillage : int = 11;
static var level_PirateShip : int = 12;
static var level_Dragon : int = 13;

static var forward : boolean = false;
static var backwards : boolean = true;

var prevXPos : float;

@Space(20)
var addFireBall : boolean;
var wizardHatPrefab : GameObject;
var wizardHatInstance : GameObject;
var wizardHatMaterial : Material;
@Space(20)
var addWings : boolean;
var mothWingsPrefab : GameObject;
var mothWingsInstance : GameObject;
var mothWingsMaterial : Material;


function Start () {
	if(autoFindComponents){
		var startScreenObject : GameObject = GameObject.Find(startScreenObjectName);
		startScreen = startScreenObject.GetComponent(StartScreen);
		animComp = GetComponent.<Animation>();
		
		islandAnimPath = GameObject.Find(islandAnimPathName).transform;
		islandAnimPathComp = islandAnimPath.GetComponent.<Animation>();
	}
	
	islandAnimPath.GetComponent.<Renderer>().enabled = false;
	
	//PathSetLevelPos(startScreen.currentLevel);
	
	charRenderers = GetComponentsInChildren.<Renderer>() as Renderer[];

	if(boatSize.speed == 0.0){
	    boatSize.speed = 10.0;
	}
	if(griffinSize.speed == 0.0){
		griffinSize.speed = 10.0;
	}

	if(boatVolume.speed == 0.0){
	    boatVolume.speed = 10.0;
	}

	if(griffinAudioVolume.speed == 0.0){
		griffinAudioVolume.speed = 10.0;
	}
}

function OnLevelWasLoaded(){
	
}

function Update () {
	if(addFireBall){
		addFireBall = false;
		wizardHatInstance = GameObject.Instantiate(wizardHatPrefab, transform.position, Quaternion.identity);
		var wHatRend : Renderer = wizardHatInstance.GetComponentInChildren.<Renderer>();
		wHatRend.material = wizardHatMaterial;
	}
	if(addWings){
		addWings = false;
		mothWingsInstance = GameObject.Instantiate(mothWingsPrefab, transform.position, Quaternion.identity);
		var mWingsRend : Renderer = mothWingsInstance.GetComponentInChildren.<Renderer>();
		mWingsRend.material = mothWingsMaterial;
	}


    transform.position = islandAnimPath.position;
	
	//Side
	var deltaPos : float = transform.position.x - prevXPos;
	prevXPos = transform.position.x;
	
	transform.localScale.x = Mathf.Abs(transform.localScale.x) * -Mathf.Sign(deltaPos);
	
	//Path Animation play
	if(startScreen.changedLevel){
		switch(startScreen.comingFromLevel){
			case level_Prologue: // <---- coming from
				if(startScreen.currentLevel == level_Tower){ //<---- going to
					PathAnimationPlay(path_House_Tower, forward);
				}
					
				break;
				
			case level_Tower:// <---- coming from
				if(startScreen.currentLevel == level_Prologue){//<---- going to
					PathAnimationPlay(path_House_Tower, backwards);
				}
				if(startScreen.currentLevel == level_DarkForest){//<---- going to
					PathAnimationPlay(path_Tower_DarkForest, forward);
				}			
				break;
				
			case level_DarkForest:// <---- coming from
				if(startScreen.currentLevel == level_Tower){ //<---- going to
					PathAnimationPlay(path_Tower_DarkForest, backwards);
				}
				if(startScreen.currentLevel == level_LostTemple){ //<---- going to
					PathAnimationPlay(path_DarkForest_LostTemple, forward);
				}
				break;
				
			case level_LostTemple:// <---- coming from
				if(startScreen.currentLevel == level_DarkForest){ //<---- going to
					PathAnimationPlay(path_DarkForest_LostTemple, backwards);
				}
				if(startScreen.currentLevel == level_CrossRoads){ //<---- going to
					PathAnimationPlay(path_LostTemple_Crossroads, forward);
				}
				break;
				
			case level_CrossRoads:// <---- coming from
				if(startScreen.currentLevel == level_LostTemple){ //<---- going to
					PathAnimationPlay(path_LostTemple_Crossroads, backwards);
				}
				if(startScreen.currentLevel == level_DeepLake){ //<---- going to
					PathAnimationPlay(path_Crossroads_DeepLake, forward);
				}
				if(startScreen.currentLevel == level_GriffinTower){ //<---- going to
					PathAnimationPlay(path_Crossroads_GriffinTower, forward);
				}
				break;	
				
			case level_DeepLake:// <---- coming from
				if(startScreen.currentLevel == level_CrossRoads){ //<---- going to
					PathAnimationPlay(path_Crossroads_DeepLake, backwards);
				}
				if(startScreen.currentLevel == level_Mushrooms){ //<---- going to
				    PathAnimationPlay(path_DeepLake_Mushrooms, forward);
				}					
				break;

			case level_GriffinTower:// <---- coming from
				if(startScreen.currentLevel == level_CrossRoads){ //<---- going to
					PathAnimationPlay(path_Crossroads_GriffinTower, backwards);
				}
				if(startScreen.currentLevel == level_Dragon){ //<---- going to
					PathAnimationPlay(path_GriffinTower_Dragon, forward);
				}					
				break;

		    case level_Mushrooms:// <---- coming from
		        if(startScreen.currentLevel == level_DeepLake){ //<---- going to
		            PathAnimationPlay(path_DeepLake_Mushrooms, backwards);
		        }					
		        if(startScreen.currentLevel == level_Mines){ //<---- going to
		            PathAnimationPlay(path_Mushrooms_Mines, forward);
		        }
		        if(startScreen.currentLevel == level_TreeVillage){ //<---- going to
		            PathAnimationPlay(path_Mushrooms_TreeVillage, forward);
		        }	
		        if(startScreen.currentLevel == level_PirateShip){ //<---- going to
		            PathAnimationPlay(path_Mushrooms_PirateShip, forward);
		        }	
	      	    break;

			case level_Mines:// <---- coming from
				if(startScreen.currentLevel == level_Mushrooms){ //<---- going to
					PathAnimationPlay(path_Mushrooms_Mines, backwards);
				}
				if(startScreen.currentLevel == level_Ruins){ //<---- going to
					PathAnimationPlay(path_Mines_Ruins, forward);
				}	
			break;

			case level_Ruins:// <---- coming from
				if(startScreen.currentLevel == level_Mines){ //<---- going to
					PathAnimationPlay(path_Mines_Ruins, backwards);
				}
			break;

			case level_TreeVillage:// <---- coming from
				if(startScreen.currentLevel == level_Mushrooms){ //<---- going to
					PathAnimationPlay(path_Mushrooms_TreeVillage, backwards);
				}
			break;

			case level_PirateShip:// <---- coming from
				if(startScreen.currentLevel == level_Mushrooms){ //<---- going to
					PathAnimationPlay(path_Mushrooms_PirateShip, backwards);
				}
			break;

			case level_Dragon:// <---- coming from
				if(startScreen.currentLevel == level_GriffinTower){ //<---- going to
					PathAnimationPlay(path_GriffinTower_Dragon, backwards);
				}
			break;
		}
	}

	//Boat
	var playerOnBoat : boolean = boatBounds.Contains(transform.position);


	boatSize.Lerp();
	boatRend.transform.parent.localScale = boatSize.current;

	if(playerOnBoat){
	    boatSize.target = boatSizeT;
	    boatVolume.target = boatVolumeT;
	}
	else{
	    boatSize.target = Vector3.zero;
	    boatVolume.target = 0.0;
	}
	if(boatRend.transform.parent.localScale.magnitude < .1){
	    boatRend.enabled = false;
	}
	else{
	    boatRend.enabled = true;
	}

	boatVolume.Lerp();
	boatAudioLoop.volume = boatVolume.current;

	//Griffin
	var playerOnGriffin : boolean = griffinBounds.Contains(transform.position);

	griffinSize.Lerp();
	griffin.transform.localScale = griffinSize.current;

	if(playerOnGriffin){
	    griffinSize.target = griffinSizeT;
	    griffinAudioVolume.target = boatVolumeT;
	}
	else{
	    griffinSize.target = Vector3.zero;
	    griffinAudioVolume.target = 0.0;
	}

	if(griffin.transform.localScale.magnitude < .1){
	    griffinRend.enabled = false;
	}
	else{
	    griffinRend.enabled = true;
	}

	griffinAudioVolume.Lerp();
	griffinAudio.volume = griffinAudioVolume.current;

	//Playe Anim
	if(islandAnimPathComp.isPlaying && !playerOnGriffin){
		animComp.Blend(griffinRideAnim.name, 0.0,.1);	

	    if(playerOnBoat){
	    	animComp.Blend(idleAnimationClip.name, 1.0,.1);
	        animComp.Blend(runAnimationClip.name,0.0,.1);
	       
	    }
	    else{

	        animComp.Blend(runAnimationClip.name,1.0,.1);
	        animComp.Blend(idleAnimationClip.name,0.0,.1);
        }

	}
	else{
		animComp.Blend(runAnimationClip.name,0.0,.1);
		animComp.Blend(idleAnimationClip.name, 1.0,.1);		
	}

	if(playerOnGriffin){
		animComp[griffinRideAnim.name].normalizedTime = griffinAnim[griffinFlyAnim.name].normalizedTime;
		animComp.Blend(griffinRideAnim.name, 1.0,.1);	
		animComp.Blend(runAnimationClip.name,0.0,.1);
		animComp.Blend(idleAnimationClip.name, 0.0,.1);	
	}

}

function LateUpdate(){
	for(var i = 0; i < charRenderers.Length; i++){
		charRenderers[i].enabled = enableRender;
	}
	if(startScreen.levels[1].completed && startScreen.currentLevel != -1){
		enableRender = true;
		//charRenderer.enabled = true;
	}
	else{
		enableRender = false;
		//charRenderer.enabled = false;
	}
}

function PathAnimationPlay(clip : AnimationClip, reverse : boolean){
	islandAnimPathComp[clip.name].enabled = true;
	islandAnimPathComp[clip.name].weight = 1.0;
	if(reverse){
		islandAnimPathComp[clip.name].normalizedTime = 1.0;
		islandAnimPathComp[clip.name].speed = -1.0;
		//transform.localScale.x = -Mathf.Abs(transform.localScale.x);
	}
	else{
		islandAnimPathComp[clip.name].normalizedTime = 0.0;
		islandAnimPathComp[clip.name].speed = 1.0;
		//transform.localScale.x = Mathf.Abs(transform.localScale.x);		
	}
}

function PathSetLevelPos(level : int){
	for(var state : AnimationState in islandAnimPathComp){
		state.weight = 0.0;
		state.enabled = false;
	}
	switch(startScreen.currentLevel){
		case level_Prologue:
			islandAnimPathComp[path_House_Tower.name].enabled = true;
			islandAnimPathComp[path_House_Tower.name].weight = 1.0;
			islandAnimPathComp[path_House_Tower.name].normalizedTime = 0.0;
			islandAnimPathComp[path_House_Tower.name].speed = -1.0;
			break;
		case level_Tower:
			islandAnimPathComp[path_House_Tower.name].enabled = true;
			islandAnimPathComp[path_House_Tower.name].weight = 1.0;
			islandAnimPathComp[path_House_Tower.name].normalizedTime = 1.0;
			islandAnimPathComp[path_House_Tower.name].speed = 1.0;	
			break;
		case level_DarkForest:
			islandAnimPathComp[path_Tower_DarkForest.name].enabled = true;
			islandAnimPathComp[path_Tower_DarkForest.name].weight = 1.0;
			islandAnimPathComp[path_Tower_DarkForest.name].normalizedTime = 1.0;
			islandAnimPathComp[path_Tower_DarkForest.name].speed = 1.0;	
			break;
		case level_LostTemple:
			islandAnimPathComp[path_DarkForest_LostTemple.name].enabled = true;
			islandAnimPathComp[path_DarkForest_LostTemple.name].weight = 1.0;
			islandAnimPathComp[path_DarkForest_LostTemple.name].normalizedTime = 1.0;
			islandAnimPathComp[path_DarkForest_LostTemple.name].speed = 1.0;	
			break;
		case level_CrossRoads:
			islandAnimPathComp[path_LostTemple_Crossroads.name].enabled = true;
			islandAnimPathComp[path_LostTemple_Crossroads.name].weight = 1.0;
			islandAnimPathComp[path_LostTemple_Crossroads.name].normalizedTime = 1.0;
			islandAnimPathComp[path_LostTemple_Crossroads.name].speed = 1.0;	
			break;
		case level_DeepLake:
			islandAnimPathComp[path_Crossroads_DeepLake.name].enabled = true;
			islandAnimPathComp[path_Crossroads_DeepLake.name].weight = 1.0;
			islandAnimPathComp[path_Crossroads_DeepLake.name].normalizedTime = 1.0;
			islandAnimPathComp[path_Crossroads_DeepLake.name].speed = 1.0;	
			break;
		case level_GriffinTower:
			islandAnimPathComp[path_Crossroads_GriffinTower.name].enabled = true;
			islandAnimPathComp[path_Crossroads_GriffinTower.name].weight = 1.0;
			islandAnimPathComp[path_Crossroads_GriffinTower.name].normalizedTime = 1.0;
			islandAnimPathComp[path_Crossroads_GriffinTower.name].speed = 1.0;	
			break;
	    case level_Mushrooms:
	        islandAnimPathComp[path_DeepLake_Mushrooms.name].enabled = true;
	        islandAnimPathComp[path_DeepLake_Mushrooms.name].weight = 1.0;
	        islandAnimPathComp[path_DeepLake_Mushrooms.name].normalizedTime = 1.0;
	        islandAnimPathComp[path_DeepLake_Mushrooms.name].speed = 1.0;	
	        break;
	    case level_Mines:
	        islandAnimPathComp[path_Mushrooms_Mines.name].enabled = true;
	        islandAnimPathComp[path_Mushrooms_Mines.name].weight = 1.0;
	        islandAnimPathComp[path_Mushrooms_Mines.name].normalizedTime = 1.0;
	        islandAnimPathComp[path_Mushrooms_Mines.name].speed = 1.0;	
	        break;
	    case level_Ruins:
	        islandAnimPathComp[path_Mines_Ruins.name].enabled = true;
	        islandAnimPathComp[path_Mines_Ruins.name].weight = 1.0;
	        islandAnimPathComp[path_Mines_Ruins.name].normalizedTime = 1.0;
	        islandAnimPathComp[path_Mines_Ruins.name].speed = 1.0;
	        break;
	    case level_TreeVillage:
	        islandAnimPathComp[path_Mushrooms_TreeVillage.name].enabled = true;
	        islandAnimPathComp[path_Mushrooms_TreeVillage.name].weight = 1.0;
	        islandAnimPathComp[path_Mushrooms_TreeVillage.name].normalizedTime = 1.0;
	        islandAnimPathComp[path_Mushrooms_TreeVillage.name].speed = 1.0;	
	        break;
	    case level_PirateShip:
	        islandAnimPathComp[path_Mushrooms_PirateShip.name].enabled = true;
	        islandAnimPathComp[path_Mushrooms_PirateShip.name].weight = 1.0;
	        islandAnimPathComp[path_Mushrooms_PirateShip.name].normalizedTime = 1.0;
	        islandAnimPathComp[path_Mushrooms_PirateShip.name].speed = 1.0;	
	        break;
	    case level_Dragon:
	        islandAnimPathComp[path_GriffinTower_Dragon.name].enabled = true;
	        islandAnimPathComp[path_GriffinTower_Dragon.name].weight = 1.0;
	        islandAnimPathComp[path_GriffinTower_Dragon.name].normalizedTime = 1.0;
	        islandAnimPathComp[path_GriffinTower_Dragon.name].speed = 1.0;	
	        break;	
	}	
}

function OnDrawGizmosSelected(){
    #if UNITY_EDITOR
        Gizmos.DrawWireCube(boatBounds.center, boatBounds.size);
        Handles.Label(boatBounds.center, "Boat");
        Gizmos.DrawWireCube(griffinBounds.center, griffinBounds.size);
        Handles.Label(griffinBounds.center, "Griffin");
    #endif
}