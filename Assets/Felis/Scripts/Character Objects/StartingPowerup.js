#pragma strict

var fireballPrefab : GameObject;
var wingsPrefab : GameObject;

var globalValues : HoldGlobalValues;
var globalValuesName : String = "Hold Global Values";

function Start () {
	var gVals : GameObject = GameObject.Find(globalValuesName);
	if(gVals != null){
		globalValues = gVals .GetComponent(HoldGlobalValues);
	}

	if(globalValues != null){
		if(globalValues.hasFireball == 1){
			var fireBall : GameObject = GameObject.Instantiate(fireballPrefab, transform.position, Quaternion.identity);
		}
		if(globalValues.hasWings == 1){
			var wings : GameObject = GameObject.Instantiate(wingsPrefab, transform.position, Quaternion.identity);
		}
	}


	Destroy(gameObject);
}