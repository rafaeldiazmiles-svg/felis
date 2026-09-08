#pragma strict

var explode : ToggleBoolean;

var explodeDelay : float;

var explodePrefab : GameObject;
var prefabOffset : Vector3;

function Start () {

}

function Update () {
	explode.Update();

	if(explode.current && Time.time > explode.toggledTrueTime + explodeDelay){
		var explosion : GameObject = GameObject.Instantiate(explodePrefab);
		explosion.transform.position = transform.position + prefabOffset;
		Destroy(gameObject);
	}
}