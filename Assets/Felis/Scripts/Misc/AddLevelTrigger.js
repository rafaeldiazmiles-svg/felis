#pragma strict

@Header("-------------------Autoget Components---------------")
var player : Transform;


@Header("----------------------Input---------------------")
var loadBounds : Bounds[];
var unloadBounds : Bounds[];
var levelName : String;
@Space(30)
var playerTag : String = "Player";
@Space(30)
var debug : boolean = true;

@Header("----------------------Values---------------------")
var levelLoaded : boolean;
//@Space(30)
//var playerInLoadBounds : ToggleBoolean;
//var playerInUnloadBounds : ToggleBoolean;

function Start () {
	GetPlayer();
}

function Update () {
	if(player == null) GetPlayer();
	if(player == null) return;
	
	//playerInLoadBounds.Update();
	//playerInUnloadBounds.Update();
	
	if(!levelLoaded){
		for(var i = 0; i < loadBounds.Length; i++){
			if(loadBounds[i].Contains(player.position)){
			    UnityEngine.SceneManagement.SceneManager.LoadScene(levelName, UnityEngine.SceneManagement.LoadSceneMode.Additive);
                //Application.LoadLevelAdditive(levelName);
				levelLoaded = true;
			}
			
		}
	}
}

function GetPlayer(){
	var playerObj : GameObject = GameObject.FindGameObjectWithTag(playerTag);
	if(playerObj != null) player = playerObj.transform;
}

function OnDrawGizmosSelected(){
	#if UNITY_EDITOR
	if(debug){
		Gizmos.color = Color.green;
		if(loadBounds){
			for(var i = 0; i < loadBounds.Length; i++){
				Gizmos.DrawWireCube(loadBounds[i].center, loadBounds[i].size);
			}
		}
		Gizmos.color = Color.red;
		if(unloadBounds != null){
			for(i = 0; i < unloadBounds.Length; i++){
				Gizmos.DrawWireCube(unloadBounds[i].center, unloadBounds[i].size);
			}
		}
	}
	#endif
}