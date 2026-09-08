#pragma strict

var ignoreTags : String[];

var radius : float;

var wingedAITarget : boolean;
var lookAt2DTarget : boolean;

function Start () {
}

function Update () {

}

function OnDrawGizmosSelected(){
	#if UNITY_EDITOR
	DebugUtility.DrawCircle(transform.position, radius, Vector3.forward);
	#endif
}

static function GetSetParams(obj : GameObject) : SetParams[]{
	var levelParams : SetParams[] = GameObject.FindObjectsOfType.<SetParams>();
	var returnParams : Array = new Array();
	for(var i = 0; i < levelParams.Length; i++){
		var dist : float = Vector3.Distance(obj.transform.position, levelParams[i].transform.position);
		if(dist < levelParams[i].radius){
			var ignore : boolean;
			for(var n = 0; n < levelParams[i].ignoreTags.Length; n++){
				if(obj.transform.parent != null){
					if(levelParams[i].ignoreTags[n] == obj.transform.parent.tag){
						ignore = true;
						break;
					}
				}
			}

			if(ignore){
				continue;
			}

			returnParams.Add(levelParams[i]);		
		}
	}	

	return returnParams.ToBuiltin(SetParams);
}