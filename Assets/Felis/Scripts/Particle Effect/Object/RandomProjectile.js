#pragma strict

var minVelocity : float = 2.0;
var maxVelocity : float = 3.0;
var minAngle : float = 0.0;
var maxAngle : float = 90.0;
var side : int = 1.0;

private var velocity : Vector2;

var gravity : float = 10.0;

function Start () {
	var angle : float = Random.Range(minAngle, maxAngle);
	var startVelocity : float = Random.Range(minVelocity, maxVelocity);
	
	velocity.x = startVelocity * Mathf.Cos(angle * Mathf.Deg2Rad);
	velocity.y = startVelocity * Mathf.Sin(angle * Mathf.Deg2Rad);
	
	velocity.x *= side;
	
	transform.rotation = Quaternion.identity;
	transform.RotateAround(transform.position, Vector3.forward, Mathf.Atan2(-velocity.y, -velocity.x) * Mathf.Rad2Deg);

}

function Update () {
	velocity.y -= gravity * Time.deltaTime;
	
	transform.position.x += velocity.x * Time.deltaTime;
	transform.position.y += velocity.y * Time.deltaTime;
	
	transform.rotation = Quaternion.identity;
	transform.RotateAround(transform.position, Vector3.forward, Mathf.Atan2(-velocity.y, -velocity.x) * Mathf.Rad2Deg);

}