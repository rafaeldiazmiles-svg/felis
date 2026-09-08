#pragma strict

var targets : ExplodeObjectTarget[];
var explodeDist : float = 2.0;

function Start () {
	targets = GameObject.FindObjectsOfType.<ExplodeObjectTarget>();
	for(var i = 0; i < targets.Length; i++){
		var dist : float = Vector3.Distance(transform.position, targets[i].transform.position);
		if(dist < explodeDist){
			targets[i].explode.current = true;
		}
	}
	Destroy(this);
}