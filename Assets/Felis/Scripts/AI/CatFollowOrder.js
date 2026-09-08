#pragma strict

var playerTag : String = "Player";
var player : Transform;
var followList : CatFollowOrder[];

var selectDistance : float = 7.0;

var levelHeight : float = 2.0;
var levelHeightOffset : float = 1.0;

var movementAI : MovementAI;

var avoidEnemy : boolean = true;
var enemyTags : String[];
var useEnemyChildTag : boolean;
var allEnemies : GameObject[];
var enemyHealth : Health[];

var enemyDetectRange : float = 4.0;
var stayBehindDistance : float = 1.0;
var enemyNearby : Transform;

var currentTargetPos : Vector3;

var disable : boolean;

var debug : boolean;

var order : int;

var dontFollowCat : boolean;

var getEnemyTimer : Timer;
static var arbitraryTimerVal : float = 2.0;

function DontFollowCat(){
	dontFollowCat = true;
}

function SetSelectDistance(newDist : float){
	selectDistance = newDist;
}

function GetPlayer(){
	var targetCharacterObj : GameObject = GameObject.FindGameObjectWithTag(playerTag);
	if(targetCharacterObj != null) player = targetCharacterObj.transform;
}

function GetFollowList(){
	var allFollowOrder : CatFollowOrder[] = GameObject.FindObjectsOfType.<CatFollowOrder>();
	order = allFollowOrder.Length;
	var followListArray : Array = new Array();
	for(var i = 0; i < allFollowOrder.Length; i++){
		if(allFollowOrder[i] == this){
			continue;
		}

		var cont : boolean;
		if(allFollowOrder[i].followList != null){
			for(var n = 0; n < allFollowOrder[i].followList.Length; n++){
				if(allFollowOrder[i].followList[n] == this){
					cont = true;
				}
			}
		}
		if(cont) continue;

		followListArray.Push(allFollowOrder[i]);
	}
	followList = followListArray.ToBuiltin(CatFollowOrder);// as Transform[];

	if(getEnemyTimer.every == 0.0){
		getEnemyTimer.every = arbitraryTimerVal;
	}
}

function Awake () {
	movementAI = transform.parent.GetComponentInChildren(MovementAI);
	GetAllEnemies();
	GetPlayer();
	GetFollowList();
	
}

function Update () {
	if(player == null){
		GetPlayer();
		if(player == null) return;
	}
	
	getEnemyTimer.Update();
	if(getEnemyTimer.current){
		GetAllEnemies();
	}
	
	var closestCat : CatFollowOrder;
	if(followList != null){
		for(var i = followList.Length - 1; i >= 0; i--){
			if(followList[i] == null){
				continue;
			}

			if(!followList[i].movementAI.enableMovement){
				continue;
			}

			if(Vector3.Distance(player.position, followList[i].transform.position) < selectDistance){
				closestCat = followList[i];
			}	 
		}
	}
	
	var couldFollow : boolean;
	if(!dontFollowCat && closestCat != null){
		couldFollow = FollowThis(closestCat.transform);
	}
	
	if(closestCat == null || !couldFollow){
		if(Vector3.Distance(player.position, transform.position) < selectDistance){
			FollowThis(player);
		}
		else{
			movementAI.targetPosition = transform.position;
		}
	}

	
	//Avoid enemy nearby.
	enemyNearby = null;
	for(var n = 0; n < allEnemies.Length; n++){
		if(allEnemies[n] == null) continue;
		if(enemyHealth[n] != null && enemyHealth[n].health <= 0) continue;
		if(Vector3.Distance(allEnemies[n].transform.position, transform.position) < enemyDetectRange){
			enemyNearby = allEnemies[n].transform;
			break;
		}
	}
	
	if(enemyNearby != null && avoidEnemy){
		if(enemyNearby.position.x > transform.position.x){ 
			DebugUtility.DrawArrow(transform.position + Vector3(0,3,0), Vector3.down * 2.0, Color.yellow);
			DebugUtility.DrawArrow(transform.position + Vector3(0,3,0), Vector3.left * 0.5, Color.yellow);
			movementAI.targetPosition.x -= stayBehindDistance;
		}
		if(enemyNearby.position.x < transform.position.x){
			DebugUtility.DrawArrow(transform.position + Vector3(0,3,0), Vector3.down * 2.0, Color.yellow);
			DebugUtility.DrawArrow(transform.position + Vector3(0,3,0), Vector3.right * 0.5, Color.yellow);
			movementAI.targetPosition.x += stayBehindDistance;
		}
	}
	
		
}

function FollowThis(t : Transform) : boolean{
	if(Mathf.Abs(transform.position.y + levelHeightOffset - t.position.y) < levelHeight){
		movementAI.targetPosition = t.position;
		currentTargetPos = t.position;
		return true;
	}		
	else{
		return false;
	}
}

function GetAllEnemies(){
	var length : int;
	for(var i = 0; i < enemyTags.Length; i++){
		length += GameObject.FindGameObjectsWithTag(enemyTags[i]).Length;
	}
	
	allEnemies = new GameObject[length];
	enemyHealth = new Health[length];
	var current : int;
	for(i = 0; i < enemyTags.Length; i++){
		var thisSet : GameObject[] = GameObject.FindGameObjectsWithTag(enemyTags[i]);
		for(var n = 0; n < thisSet.Length; n++){
			allEnemies[current] = thisSet[n];
			enemyHealth[current] = allEnemies[current].transform.GetComponentInChildren(Health);
			current ++;
		}
	}	
}

function OnDrawGizmosSelected(){
	#if UNITY_EDITOR
	if(debug){
		DebugUtility.DrawCircle(transform.position, selectDistance, Vector3.forward, Color.yellow, 32);
		
		Debug.DrawLine(Vector3(transform.position.x-20,transform.position.y + levelHeight + levelHeightOffset,transform.position.z),
		Vector3(transform.position.x+20,transform.position.y + levelHeight + levelHeightOffset,transform.position.z), Color.cyan);
		
		Debug.DrawLine(Vector3(transform.position.x-20,transform.position.y - levelHeight + levelHeightOffset,transform.position.z),
		Vector3(transform.position.x+20,transform.position.y - levelHeight + levelHeightOffset,transform.position.z), Color.cyan);
		
		Handles.Label(Vector3(transform.position.x, transform.position.y + levelHeight +  levelHeightOffset, transform.position.z), "Cat Follow Order. Upper limit.");
		Handles.Label(Vector3(transform.position.x, transform.position.y - levelHeight + levelHeightOffset, transform.position.z), "Cat Follow Order. Lower limit.");
		Handles.Label(Vector3(transform.position.x, transform.position.y + selectDistance, transform.position.z), "Cat Follow Order. Range.");
		
		DebugUtility.DrawCircle(transform.position, enemyDetectRange, Vector3.forward, Color.red, 32);
		Handles.Label(Vector3(transform.position.x, transform.position.y + enemyDetectRange, transform.position.z), "Enemy detect range.");
		
		if(enemyNearby != null){
			Debug.DrawLine(transform.position, enemyNearby.transform.position, Color.red);
		}
	}
	#endif
}