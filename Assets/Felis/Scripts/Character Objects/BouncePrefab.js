#pragma strict

@Header("-------Autoget Components-------")
var isGrounded : IsGrounded;

@Header ("-------Input-------")
var prefabs : GameObject[];
var offset : Vector3;

function Start () {
	isGrounded = transform.parent.GetComponentInChildren.<IsGrounded>();
}

function Update () {
	if(isGrounded.touchedGround){
		for(var i = 0; i < prefabs.Length; i++){
			var newPrefab : GameObject = Instantiate(prefabs[i]);
			newPrefab.transform.position = transform.position + offset;
		}
	}
}