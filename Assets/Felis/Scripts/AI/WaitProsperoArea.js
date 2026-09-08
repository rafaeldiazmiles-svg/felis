#pragma strict

var waitArea : WaitProspero[];
var catTag : String = "Cat";

function Start () {
	var allCats : WaitForProspero[] = GameObject.FindObjectsOfType.<WaitForProspero>();

	for(var i = 0; i < allCats.Length; i++){
		allCats[i].GetWaitAreas();
	}

}

var debug : boolean;

function OnDrawGizmosSelected(){
	#if UNITY_EDITOR
	if(debug){
		var center : Vector3;
		for(var i = 0; i < waitArea.Length; i++){
			Gizmos.color = Color.white;
			center = waitArea[i].waitBounds.center;
			if(waitArea[i].useCenter != null){
				waitArea[i].waitBounds.center = center + waitArea[i].useCenter.position;
			}
			Gizmos.DrawWireCube(waitArea[i].waitBounds.center, waitArea[i].waitBounds.size);
			waitArea[i].waitBounds.center = center;
			
			Gizmos.color = Color.blue;
			for(var n = 0; n < waitArea[i].followProsperoOn.Length; n++){
				center = waitArea[i].followProsperoOn[n].center;
				if(waitArea[i].useCenter != null){
					waitArea[i].followProsperoOn[n].center = center + waitArea[i].useCenter.position;
				}
				Gizmos.DrawWireCube(waitArea[i].followProsperoOn[n].center, waitArea[i].followProsperoOn[n].size);
				waitArea[i].followProsperoOn[n].center = center;
			}
			
			Gizmos.color = Color.red;
			center = waitArea[i].helpAnimBounds.center;
			if(waitArea[i].useCenter != null){
				waitArea[i].helpAnimBounds.center = center + waitArea[i].useCenter.position;
			}	
			Gizmos.DrawWireCube(waitArea[i].helpAnimBounds.center, waitArea[i].helpAnimBounds.size);
			waitArea[i].helpAnimBounds.center = center;
			
			center = waitArea[i].disableWObject.center;
			if(waitArea[i].useCenter != null){
				waitArea[i].disableWObject.center = center + waitArea[i].useCenter.position;
			}
			Gizmos.color = Color.gray;
			Gizmos.DrawWireCube(waitArea[i].disableWObject.center, waitArea[i].disableWObject.size);
			waitArea[i].disableWObject.center = center;
			
			Gizmos.color += Color(.2,.2,.2);
			Gizmos.DrawWireCube(waitArea[i].objSearchGlobalBound.center, waitArea[i].objSearchGlobalBound.size);
		}
	}
	#endif
}