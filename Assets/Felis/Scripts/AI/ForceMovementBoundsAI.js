
var forceMovementBounds : ForceMovementBounds[];

var debug : boolean;

var playerTag : String = "Player";

@Header("Recenter values")
@Space(30)

var bCenter : Vector3;
var moreBCenter : Vector3[];
var pBCenter : Vector3;
var morePBCenter : Vector3[]; 
var dJBCenter : Vector3[];
var fJBCenter : Vector3[];
var tPos : Vector3;
var sTPos : Vector3[];

class ForceMovementBounds{
	var priority : int;
	@Space(30)
	var centerBounds : boolean;
	@Space(30)
	var bounds : Bounds;
	var moreBounds : Bounds[];
	var searchTag : String;
	var ignore : boolean;
	var ignoreString : String;
	var searchTimer : Timer;
	var movementAI : MovementAI[];
	var wForProsperoAI : WaitForProspero[];
	@Space(30)
	var targetPos : Vector3;
	@Space(30)
	var secondaryTPos : Vector3[];
	@Space(30)
	var requirePlayerPos : boolean;
	var player : Transform;
	var playerBounds : Bounds;
	var morePlayerBounds : Bounds[];
	@Space(30)
	var requirePlayerDist : boolean;
	var playerDist : float;
	@Space(30)
	var disableMovementBounds : Bounds[];
	var dontJumpBounds : Bounds[];
	var forceJumpBounds : Bounds[];
	@Space(30)
	var requireTrigger : Trigger;
	@Space(30)
	var baloonDuration : float;
	var baloonTimeLeft : float;

	function SearchAI(){
		var tagObjs : GameObject[] = GameObject.FindGameObjectsWithTag(searchTag);
		var movementAIArray : Array = new Array();
		for(var i = 0; i < tagObjs.Length; i++){
			if(ignore && tagObjs[i].name.ToLower().Contains(ignoreString.ToLower())) continue;
			var movementAIComp : MovementAI = tagObjs[i].GetComponentInChildren.<MovementAI>();
			if(movementAIComp != null){
				movementAIArray.Push(movementAIComp);
			}
		}
		movementAI = new MovementAI[movementAIArray.length];
		movementAI = movementAIArray.ToBuiltin(MovementAI);
		
		wForProsperoAI = new WaitForProspero[movementAI.Length];
		for(i = 0; i < wForProsperoAI.Length; i ++){
			wForProsperoAI[i] = movementAI[i].gameObject.GetComponent.<WaitForProspero>();
		}

		//currentPriority = new int[movementAIArray.length];
	}
}

function Start () {

}

function Update () {
	for(var i = 0; i < forceMovementBounds.Length; i++){
		if(forceMovementBounds[i] == null) continue;
		
		ReCenterBounds(forceMovementBounds[i]);
		
		if(forceMovementBounds[i].player == null){
			var playerObj : GameObject = GameObject.FindGameObjectWithTag(playerTag);
			if(playerObj != null){
				forceMovementBounds[i].player = playerObj.transform;
			}
		}
		
		if(forceMovementBounds[i].searchTag == ""){
			Debug.Log(gameObject.name + " Force Movement Bounds AI script has no search tag.");
		} 
		
		forceMovementBounds[i].searchTimer.Update();
		if(forceMovementBounds[i].searchTimer.current && forceMovementBounds[i].searchTag != ""){
			if(forceMovementBounds[i].searchTimer.every == 0.0){
				forceMovementBounds[i].searchTimer.every = 2.0;
			}
			forceMovementBounds[i].SearchAI();
		}

		if(forceMovementBounds[i].player != null){
			if(forceMovementBounds[i].movementAI != null){
				for(var n = 0; n < forceMovementBounds[i].movementAI.Length; n++){
					if(forceMovementBounds[i].movementAI[n] == null) continue;

					if(forceMovementBounds[i].priority >= forceMovementBounds[i].movementAI[n].forceMovementAI_CurrentPriority){
						forceMovementBounds[i].movementAI[n].forceMovementAI_CurrentPriority = forceMovementBounds[i].priority;
					}
					else{
						continue;
					}

					var tPos : Vector3 = forceMovementBounds[i].targetPos;
					
					if(forceMovementBounds[i].secondaryTPos != null){
						if( n > 0 && n <= forceMovementBounds[i].secondaryTPos.Length){
							tPos = forceMovementBounds[i].secondaryTPos[n-1];
						}
					}
					
					var inBounds : boolean = false;
					for(var m = 0; m < forceMovementBounds[i].moreBounds.Length; m++){
						if(forceMovementBounds[i].moreBounds[m].Contains(forceMovementBounds[i].movementAI[n].transform.position)){
							inBounds = true;
							break;
						}
					}	

					if(forceMovementBounds[i].requireTrigger != null && !forceMovementBounds[i].requireTrigger.stepped.current){
						inBounds = false;
					}																						
																																																		
					if(inBounds || forceMovementBounds[i].bounds.Contains(forceMovementBounds[i].movementAI[n].transform.position)){
						var playerInBounds : boolean;
						var playerWithinDist : boolean;
						if(forceMovementBounds[i].player != null){
							for(var w = 0; w < forceMovementBounds[i].morePlayerBounds.Length; w++){
								if(forceMovementBounds[i].morePlayerBounds[w].Contains(forceMovementBounds[i].player.position)){
									playerInBounds = true;
									break;
								}
							}

							if(forceMovementBounds[i].playerBounds.Contains(forceMovementBounds[i].player.position)){
								playerInBounds = true;
							}

							if(forceMovementBounds[i].requirePlayerDist){
								var dist : float = Vector3.Distance(forceMovementBounds[i].movementAI[n].transform.position, forceMovementBounds[i].player.position);
								if(dist < forceMovementBounds[i].playerDist){
									playerWithinDist = true;
								}
							}
						}



						if((!forceMovementBounds[i].requirePlayerPos || playerInBounds) && (!forceMovementBounds[i].requirePlayerDist || playerWithinDist)){
							if(forceMovementBounds[i].movementAI[n] != null){
								forceMovementBounds[i].movementAI[n].preciseUntil = Time.time + .5;
								forceMovementBounds[i].movementAI[n].targetPosition = tPos;
								if(forceMovementBounds[i].wForProsperoAI[n] != null){
									forceMovementBounds[i].wForProsperoAI[n].disableUntil = Time.time + .5;
								}

								if(forceMovementBounds[i].baloonDuration == 0.0 || forceMovementBounds[i].baloonTimeLeft > 0){
									forceMovementBounds[i].baloonTimeLeft -= Time.deltaTime;
									forceMovementBounds[i].movementAI[n].ShowThoughtBaloon();
									if(forceMovementBounds[i].movementAI[n].baloonThought_Show.toggledTrue){
										if(forceMovementBounds[i].movementAI[n].baloonThought_IconRend != null){
											forceMovementBounds[i].movementAI[n].baloonThought_IconRend.material.mainTexture = forceMovementBounds[i].movementAI[n].baloonThought_LightbulbTexture;
										}
									}
								}
							}
							
							//Disable Jump
							for(var q = 0; q < forceMovementBounds[i].dontJumpBounds.Length; q++){
								if(forceMovementBounds[i].dontJumpBounds[q].Contains(forceMovementBounds[i].movementAI[n].transform.position)){
									forceMovementBounds[i].movementAI[n].disableJumpUntil = Time.time + .3;
									break;
								}
							}
							
							//Force Jump
							for(q = 0; q < forceMovementBounds[i].forceJumpBounds.Length; q++){
								if(forceMovementBounds[i].forceJumpBounds[q].Contains(forceMovementBounds[i].movementAI[n].transform.position)){
									forceMovementBounds[i].movementAI[n].PressB();
									break;
								}
							}

							for(q = 0; q < forceMovementBounds[i].disableMovementBounds.Length; q++){
								if(forceMovementBounds[i].disableMovementBounds[q].Contains(forceMovementBounds[i].movementAI[n].transform.position - transform.position)){
									forceMovementBounds[i].movementAI[n].sideMovement.disableMovementUntil = Time.time + .5;
									break;
								}								
							}
						}
						else{
							forceMovementBounds[i].baloonTimeLeft = forceMovementBounds[i].baloonDuration;
						}
					}
				}

			}
		}
		
		RestoreBounds(forceMovementBounds[i]);	
	}
}

/*function GetPlayer() : Transform{
	var charObj : GameObject = GameObject.FindGameObjectWithTag(playerTag);
	if(charObj != null){
		return charObj.transform;
	}
}*/

function OnDrawGizmosSelected(){
	#if UNITY_EDITOR
	if(debug){
		for(var i = 0; i < forceMovementBounds.Length; i++){
			ReCenterBounds(forceMovementBounds[i]);
			
			Gizmos.color = Color.cyan;
			Gizmos.DrawWireCube(forceMovementBounds[i].bounds.center, forceMovementBounds[i].bounds.size);
			for(var m = 0; m < forceMovementBounds[i].moreBounds.Length; m++){
				Gizmos.DrawWireCube(forceMovementBounds[i].moreBounds[m].center, forceMovementBounds[i].moreBounds[m].size);
			}
			Handles.Label(forceMovementBounds[i].bounds.center, "Force Movement Bounds");
			DebugUtility.DrawPoint(forceMovementBounds[i].targetPos, .5,Color.cyan);
			Handles.Label(forceMovementBounds[i].targetPos,"Force Movement Bounds - Target Position");
			for(var n = 0; n < forceMovementBounds[i].secondaryTPos.Length; n++){
				DebugUtility.DrawPoint(forceMovementBounds[i].secondaryTPos[n], .35,Color.cyan);
				Handles.Label(forceMovementBounds[i].secondaryTPos[n],"Force Movement Bounds - Secondary Target Position: " + n.ToString());
			}
			
			
			if(forceMovementBounds[i].requirePlayerPos){
				Gizmos.color = Color.gray;
				Gizmos.DrawWireCube(forceMovementBounds[i].playerBounds.center, forceMovementBounds[i].playerBounds.size);
				Handles.Label(forceMovementBounds[i].playerBounds.center, "Force Movement Bounds - Player Bounds");
				for(var w = 0; w < forceMovementBounds[i].morePlayerBounds.Length; w++){
					Gizmos.DrawWireCube(forceMovementBounds[i].morePlayerBounds[w].center, forceMovementBounds[i].morePlayerBounds[w].size);
				}
			}
			
			Gizmos.color = Color(.5,.1,.1);
			for(var q = 0; q < forceMovementBounds[i].dontJumpBounds.Length; q++){
				Gizmos.DrawWireCube(forceMovementBounds[i].dontJumpBounds[q].center, forceMovementBounds[i].dontJumpBounds[q].size);
			}
			Gizmos.color = Color(.1,.5,.1);
			for(q = 0; q < forceMovementBounds[i].forceJumpBounds.Length; q++){
				Gizmos.DrawWireCube(forceMovementBounds[i].forceJumpBounds[q].center, forceMovementBounds[i].forceJumpBounds[q].size);
			}

			Gizmos.color = Color(.7,.2,.5);
			if(forceMovementBounds[i].disableMovementBounds != null){
				for(q = 0; q < forceMovementBounds[i].disableMovementBounds.Length; q++){
					Gizmos.DrawWireCube(forceMovementBounds[i].disableMovementBounds[q].center + transform.position, forceMovementBounds[i].disableMovementBounds[q].size);
				}
			}
		
			RestoreBounds(forceMovementBounds[i]);	
		}
	}
	#endif
}



function ReCenterBounds(forceMovementBounds : ForceMovementBounds){
	if(forceMovementBounds.centerBounds){
		bCenter = forceMovementBounds.bounds.center;
		forceMovementBounds.bounds.center += transform.position;
		
		moreBCenter = new Vector3[forceMovementBounds.moreBounds.Length];
		for(var j = 0; j < moreBCenter.Length; j++){
			moreBCenter[j] = forceMovementBounds.moreBounds[j].center;
			forceMovementBounds.moreBounds[j].center += transform.position;
		}
		
		pBCenter = forceMovementBounds.playerBounds.center;
		forceMovementBounds.playerBounds.center += transform.position;
		
		morePBCenter = new Vector3[forceMovementBounds.morePlayerBounds.Length];
		for(j = 0; j < morePBCenter.Length; j++){
			morePBCenter[j] = forceMovementBounds.morePlayerBounds[j].center;
			forceMovementBounds.morePlayerBounds[j].center += transform.position;
		}
		
		dJBCenter = new Vector3[forceMovementBounds.dontJumpBounds.Length];
		for(j = 0; j < dJBCenter.Length; j++){
			dJBCenter[j] = forceMovementBounds.dontJumpBounds[j].center;
			forceMovementBounds.dontJumpBounds[j].center +=  transform.position;
		}
		
		fJBCenter = new Vector3[forceMovementBounds.forceJumpBounds.Length];
		for(j = 0; j < fJBCenter.Length; j++){
			fJBCenter[j] = forceMovementBounds.forceJumpBounds[j].center;
			forceMovementBounds.forceJumpBounds[j].center += transform.position;
		}
		
		tPos = forceMovementBounds.targetPos;
		forceMovementBounds.targetPos += transform.position;
		
		sTPos = new Vector3[forceMovementBounds.secondaryTPos.Length];
		for(j = 0; j < sTPos.Length; j++){
			sTPos[j] = forceMovementBounds.secondaryTPos[j];
			forceMovementBounds.secondaryTPos[j] += transform.position;
		}
	}
}

function RestoreBounds(forceMovementBounds : ForceMovementBounds){
	if(forceMovementBounds.centerBounds){
		forceMovementBounds.bounds.center = bCenter;
		
		for(var j = 0; j < moreBCenter.Length; j++){
			forceMovementBounds.moreBounds[j].center = moreBCenter[j];
		}
		
		forceMovementBounds.playerBounds.center = pBCenter;
		
		for(j = 0; j < morePBCenter.Length; j++){
			forceMovementBounds.morePlayerBounds[j].center = morePBCenter[j];
		}
		
		for(j = 0; j < dJBCenter.Length; j++){
			forceMovementBounds.dontJumpBounds[j].center = dJBCenter[j];
		}
		
		for(j = 0; j < fJBCenter.Length; j++){
			forceMovementBounds.forceJumpBounds[j].center = 	fJBCenter[j];
		}
		
		forceMovementBounds.targetPos = tPos;
		
		for(j = 0; j < sTPos.Length; j++){
			forceMovementBounds.secondaryTPos[j] = sTPos[j];
		}

	}
}