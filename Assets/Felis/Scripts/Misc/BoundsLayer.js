#pragma strict

var layerChangeBounds : Bounds;

var setLayer : int;

var tags : String[];

var getTimer : Timer;

var bLayerChars : BLayerChar[];

class BLayerChar{
	var col : Collider;
	var inside : ToggleBoolean;
	var prevLayer : int;
}

function GetChars(){
	var gatherChars : Array = new Array();
	for (var i = 0; i < tags.Length; i++){
		var tagObjs : GameObject[] = GameObject.FindGameObjectsWithTag(tags[i]);
		if(tagObjs != null){
			for(var n = 0; n < tagObjs.Length; n++){
				gatherChars.Push(tagObjs[n]);
			}
		}
		else{
			return;
		}
	}

	var newbLayerChars : BLayerChar[] = new BLayerChar[gatherChars.length];
	for(var m = 0; m < gatherChars.length; m++){
		var charObj : GameObject = gatherChars[m];
		newbLayerChars[m] = new BLayerChar();
		newbLayerChars[m].col = charObj.GetComponentInChildren.<Collider>();
		newbLayerChars[m].inside = new ToggleBoolean();
	}

	if(bLayerChars != null){
		for(var w = 0; w < newbLayerChars.Length; w++){
			for(var r = 0; r < bLayerChars.Length; r++){
				if(newbLayerChars[w].col == bLayerChars[r].col){
					newbLayerChars[w].inside.GetValues(bLayerChars[r].inside);
					newbLayerChars[w].prevLayer = bLayerChars[r].prevLayer;
					break;
				}
			}
		}
	}

	bLayerChars = newbLayerChars;
}

function Start () {
	if(getTimer.every == 0.0){
		getTimer.every = 6.0;
	}
}

function LateUpdate () {
	getTimer.Update();
	if(getTimer.current){
		GetChars();
	}

	if(bLayerChars != null){
		for(var i = 0; i < bLayerChars	.Length; i++){
			if(bLayerChars[i] != null && bLayerChars[i].col != null){
				if(layerChangeBounds.Contains(bLayerChars[i].col.transform.position - transform.position)){
					bLayerChars[i].inside.current = true;
				}
				else{
					bLayerChars[i].inside.current = false;
				}
				bLayerChars[i].inside.Update();

				if(bLayerChars[i].inside.toggledTrue){
					bLayerChars[i].prevLayer = bLayerChars[i].col.gameObject.layer; 
					bLayerChars[i].col.gameObject.layer = setLayer;
				}

				if(bLayerChars[i].inside.toggledFalse){
					bLayerChars[i].col.gameObject.layer = bLayerChars[i].prevLayer;				
				}
			}
		}

	}
}

function OnDrawGizmosSelected(){
	#if UNITY_EDITOR
		
	Gizmos.color = Color.blue;
	Gizmos.DrawWireCube(layerChangeBounds.center + transform.position, layerChangeBounds.size);


	#endif
}