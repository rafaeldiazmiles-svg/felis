#pragma strict

var particlePrefab : GameObject;

function Start () {

}

function Update () {
	if(Input.GetMouseButtonDown(0) || Input.GetMouseButton(1)){
		var newParticlePosition : Vector3 = Camera.main.ScreenToWorldPoint(Vector3(Input.mousePosition.x, Input.mousePosition.y, Camera.main.transform.position.z));
		var newParticle : GameObject = Instantiate(particlePrefab, newParticlePosition, Quaternion.identity);
	}
}