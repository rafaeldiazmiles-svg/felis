#pragma strict

var leftWater : Transform;
var rightWater : Transform;

var offset : float;

//var waterObjects : Transform[];

function Start () {

}

function Update () {
	if(leftWater != null && rightWater != null){
		
		transform.position.y = Mathf.Lerp(leftWater.position.y, rightWater.position.y, (transform.position.y - leftWater.position.y) / (rightWater.position.y - leftWater.position.y));	
		transform.position.y += offset;
		DebugUtility.DrawArrow(leftWater.position + Vector3.up * 4, -Vector3.up * 4, Color.blue);
		DebugUtility.DrawArrow(rightWater.position + Vector3.up * 4, -Vector3.up * 4, Color.red);
	}
}

function SetLeftRightWaterObjects(waterObjects : Transform[]){
	for(var i = 0; i < waterObjects.Length; i++){
		if(leftWater == null && waterObjects[i].position.x < transform.position.x) leftWater = waterObjects[i];
		if(rightWater == null && waterObjects[i].position.x > transform.position.x) rightWater = waterObjects[i];
		
		if(waterObjects[i].position.x < transform.position.x && transform.position.x - waterObjects[i].position.x < transform.position.x - leftWater.position.x)
			leftWater = waterObjects[i];
		
		if(waterObjects[i].position.x > transform.position.x && waterObjects[i].position.x - transform.position.x < rightWater.position.x - transform.position.x)
			rightWater = waterObjects[i];
	}	
}