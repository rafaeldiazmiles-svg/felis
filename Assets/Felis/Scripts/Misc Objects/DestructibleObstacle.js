#pragma strict


var explosionPrefab : GameObject;

var bombs : Fuse[];

var bombDetectRange : float;

var killRange : float;

var getTimer : Timer;

var player : Health;
var playerTag : String = "Player";

var fogBlow : ExplosionFog;

function GetPlayer(){
	var playerObj : GameObject = GameObject.FindGameObjectWithTag(playerTag);
	if(playerObj != null){
		player = playerObj.GetComponentInChildren.<Health>();
	}
}

function GetBombs(){
	bombs = GameObject.FindObjectsOfType.<Fuse>();
}

function Start () {
	if(getTimer.every == 0.0){
		getTimer.every = 4.0;
	}

	fogBlow = GetComponentInChildren.<ExplosionFog>();
}

function Update () {
	getTimer.Update();

	if(getTimer.current){
		GetBombs();
		//GetPlayer();
	}

	for(var i = 0; i < bombs.Length; i++){
		if(bombs[i] == null) continue;

		if(bombs[i].destroy.toggledTrue){
			var dist : float = Vector3.Distance(transform.position, bombs[i].transform.position);
			if(dist < bombDetectRange){
				var explosion : GameObject = GameObject.Instantiate(explosionPrefab);
				explosion.transform.position = transform.position;

				GetPlayer();
				if(player != null){
					var playerDist : float = Vector3.Distance(transform.position, player.transform.position);
					if(playerDist < killRange){
						player.health = 0.0;
					}
				}

				fogBlow.explode.current = true;
				fogBlow.transform.parent = null;

				Destroy(gameObject);
			}
		}
	}
}

function OnDrawGizmosSelected(){
	#if UNITY_EDITOR
	DebugUtility.DrawCircle(transform.position, bombDetectRange, Vector3.forward, Color.white, 20);
	DebugUtility.DrawCircle(transform.position, killRange, Vector3.forward, Color.red, 20);
	#endif
}