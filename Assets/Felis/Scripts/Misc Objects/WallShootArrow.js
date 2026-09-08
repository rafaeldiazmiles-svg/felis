#pragma strict

var player : GameObject;
var playerTag : String = "Player";

var getTimer : Timer;

var playerInside : ToggleBoolean;
var targetBounds : Bounds;

var arrowShooters : Transform[];
var arrowPrefab : GameObject;
var arrowShootersNextArrow : float[];
var arrowDelayOffset : float = .1;
var arrowShootInterval : float = 3.0;

var velocity : Vector2;

var velocityRND : Vector2;

function Start () {
	if(transform.localScale.x < 0){
		velocity.x = -velocity.x;
	}

	if(getTimer.every == 0.0){
		getTimer.every = 3.0;
	}

	arrowShootersNextArrow = new float[arrowShooters.Length];
}

function Update () {
	//Look for player periodically.
	getTimer.Update();
	if(getTimer.current){
		if(player == null){
			GetPlayer();
		}
	}

	//Check if player inside.
	var center : Vector3 = targetBounds.center;
	targetBounds.center = transform.TransformPoint(targetBounds.center);
	if(player != null && targetBounds.Contains(player.transform.position)){
		playerInside.current = true;
	}
	else{
		playerInside.current = false;
	}
	targetBounds.center = center;
	playerInside.Update();

	if(playerInside.toggledTrue){
		for(var i = 0; i < arrowShootersNextArrow.Length; i++){
			arrowShootersNextArrow[i] = Time.time + i * arrowDelayOffset;
		}
	}

	if(playerInside.current){
		for(i = 0; i < arrowShootersNextArrow.Length; i++){
			if(Time.time > arrowShootersNextArrow[i]){
				arrowShootersNextArrow[i] = Time.time + arrowShootInterval;
				var newArrow : GameObject = GameObject.Instantiate(arrowPrefab);
				newArrow.transform.position = arrowShooters[i].position;
				var arrowScript : Arrow = newArrow.GetComponent.<Arrow>();

				var localVel : Vector3 = transform.TransformDirection(Vector3(velocity.x, velocity.y, 0));
				var localVelRND : Vector3 = transform.TransformDirection(Vector3(velocityRND.x, velocityRND.y, 0));

				arrowScript.velocity = Vector2(-localVel.x, localVel.y);
				arrowScript.velocity.x += Random.Range(-localVelRND.x, localVelRND.x);
				arrowScript.velocity.y += Random.Range(-localVelRND.y, localVelRND.y);
				arrowShooters[i].GetComponent.<AudioSource>().Play();
			}
		}
	}
}

function GetPlayer(){
	player = GameObject.FindGameObjectWithTag(playerTag);
}

function OnDrawGizmosSelected(){
	#if UNITY_EDITOR

	Gizmos.color = Color.red;
	var center : Vector3 = targetBounds.center;
	targetBounds.center = transform.TransformPoint(targetBounds.center);
	Gizmos.DrawWireCube(targetBounds.center, targetBounds.size);
	targetBounds.center = center;


	if(arrowShooters != null) {
		for(var i = 0; i < arrowShooters.Length; i++){
			if(arrowShooters[i] == null){
				continue;
			}
			var sg : int = Mathf.Sign(transform.localScale.x);

			var localVel : Vector3 = transform.TransformDirection(Vector3(velocity.x, velocity.y, 0));
			var localVelRND : Vector3 = transform.TransformDirection(Vector3(velocityRND.x, velocityRND.y, 0));

			DebugUtility.DrawArrow(arrowShooters[i].position, .3 * Vector3(localVel.x , localVel.y, 0));
			DebugUtility.DrawArrow(arrowShooters[i].position, .3 * Vector3(localVel.x+localVelRND.x, localVel.y+localVelRND.y, 0), Color.blue);
			DebugUtility.DrawArrow(arrowShooters[i].position, .3 * Vector3(localVel.x-localVelRND.x, localVel.y+localVelRND.y, 0), Color.blue);
			DebugUtility.DrawArrow(arrowShooters[i].position, .3 * Vector3(localVel.x+localVelRND.x, localVel.y-localVelRND.y, 0), Color.blue);
			DebugUtility.DrawArrow(arrowShooters[i].position, .3 * Vector3(localVel.x-localVelRND.x, localVel.y-localVelRND.y, 0), Color.blue);
		}
	}
	#endif
}
