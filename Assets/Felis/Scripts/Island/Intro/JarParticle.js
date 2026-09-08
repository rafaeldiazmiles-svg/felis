#pragma strict

var rb : Rigidbody;
var isGrounded : IsGrounded;
@Space(40)
var gravitatePoint : Vector3;
var gravPointTag : String = "Grav Point";
var grabPointObj : GameObject;
var gravForce : float;
var gravForceAdd : float;
var sqrRootGravForce : boolean;
var sideForce : float;
var pointSpeed : Vector3;
var startVel : Vector3;
@Space(40)
var enableSpawn : boolean;
var enemySpawnPrefabLoader : LoadPrefabByBounds;
var spawnEnemyPrefab : int; 
var spawnEffectPrefab : GameObject;
var offsetSpawnEffectPosition : Vector3;
var spawnEffectSize : float = 1.0;
var spawnLocation : Vector3;
var spawnDelay : float;
var startTime : float;
var goToSpawnLoc : boolean;
var towardSpawnForce : float = 10.0;
var spawnDistTrigger : float = .3;
@Space(20)
@Header("Spawn At global spawn location instead of particle position.")
var spawnAtGlobalSL : boolean; 

function Start () {
	if(rb == null){
		rb = GetComponent.<Rigidbody>();
	}

	if(isGrounded == null){
		isGrounded = GetComponentInChildren.<IsGrounded>();
	}

	gravitatePoint += transform.position;

	rb.velocity = startVel;

	startTime = Time.time;

	grabPointObj = GameObject.FindGameObjectWithTag(gravPointTag);

	if(grabPointObj != null){
		gravitatePoint = grabPointObj.transform.position;
	}

}

function Update () {


	if(enableSpawn && Time.time > startTime + spawnDelay){
		goToSpawnLoc = true;
	}

	if(goToSpawnLoc){
		rb.AddForce((spawnLocation - transform.position).normalized * towardSpawnForce);

		if(Vector3.Distance(transform.position, spawnLocation) < spawnDistTrigger || isGrounded.isGrounded){
			Destroy(gameObject);

			var sPos : Vector3;
			if(spawnAtGlobalSL){
				sPos = spawnLocation;
			}
			else{
				sPos =transform.position;
			}

			if(enemySpawnPrefabLoader != null){
				enemySpawnPrefabLoader.ForceLoadID(spawnEnemyPrefab); //enemySpawnPrefabLoader.prefabBoundsList[spawnEnemyPrefab].forceLoad = true;
				//enemySpawnPrefabLoader.prefabBoundsList[spawnEnemyPrefab].forceLoadTime = 0.0;


				enemySpawnPrefabLoader.SetPosID(spawnEnemyPrefab, sPos);//enemySpawnPrefabLoader.prefabBoundsList[spawnEnemyPrefab].useTransformPosition.position = transform.position;
			}
			if(spawnEffectPrefab != null){
				var spawnEffect : GameObject = GameObject.Instantiate(spawnEffectPrefab);
				spawnEffect.transform.position = sPos + offsetSpawnEffectPosition;
				spawnEffect.transform.localScale *= spawnEffectSize;
			}
		}

		gravitatePoint = spawnLocation;
	}
	else{
		if(grabPointObj == null){
			gravitatePoint += pointSpeed * Time.deltaTime;
		}
		else{
			gravitatePoint = grabPointObj.transform.position;
		}

		var gravDelta: Vector3 = gravitatePoint - transform.position;

		var gravForceVector : Vector3 = gravDelta * gravForce;

		if(sqrRootGravForce){
			gravForceVector = gravForceVector.normalized * Mathf.Sqrt(gravForceVector.magnitude);
		}

		gravForceVector += gravForceVector.normalized * gravForceAdd;

		rb.AddForce(gravForceVector);

		rb.AddForce(Vector3(gravDelta.y, -gravDelta.x, 0).normalized * sideForce);
	}
}

function OnDrawGizmosSelected(){
	#if UNITY_EDITOR
	DebugUtility.DrawPoint(spawnLocation, 1.0);

	if(Application.isPlaying){
		var gravDelta: Vector3 = gravitatePoint - transform.position;

		DebugUtility.DrawPoint(gravitatePoint, 1.0, Color.magenta);
		Debug.DrawLine(transform.position, gravitatePoint, Color.yellow);
		DebugUtility.DrawArrow(gravitatePoint, pointSpeed, Color.gray);
		DebugUtility.DrawArrow(transform.position, gravDelta * gravForce, Color.red);
		DebugUtility.DrawArrow(transform.position, Vector3(gravDelta.y, -gravDelta.x, 0).normalized * sideForce, Color.blue);
	}
	else{

		DebugUtility.DrawPoint(gravitatePoint + transform.position, 1.0, Color.magenta);
		Debug.DrawLine(transform.position, gravitatePoint + transform.position, Color.yellow);
		DebugUtility.DrawArrow(gravitatePoint +  transform.position, pointSpeed, Color.gray);
		DebugUtility.DrawArrow(transform.position, startVel, Color.cyan);

		DebugUtility.DrawArrow(transform.position, gravitatePoint * gravForce, Color.red);
		DebugUtility.DrawArrow(transform.position, Vector3(gravitatePoint.y, -gravitatePoint.x, 0).normalized * sideForce, Color.blue);
	}
	#endif
}