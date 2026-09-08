#pragma strict

var bonesRoot : Transform;

var excludeString : String[];

function Start () {

}

function Update () {

}

function GetClosestBone(hitPoint : Vector3){
	var allBones : Transform[] = bonesRoot.GetComponentsInChildren.<Transform>();
	var closestBone : Transform;
	var closestBoneDist : float = Mathf.Infinity;
	for(var i = 0; i < allBones.Length; i++){

		var exclude : boolean;
		for(var n = 0; n < excludeString.Length; n++){
			if(allBones[i].name.Contains(excludeString[n])){
				exclude = true;
				break;
			}
		}
		if(exclude){
			continue;
		}

		var dist : float = Vector3.Distance(hitPoint, allBones[i].position);
		if(dist < closestBoneDist){
			closestBoneDist = dist;
			closestBone = allBones[i];
		}
	}
	return closestBone;
}