#pragma strict

var drop : boolean;

var anim : Animation;
var idleAnim : AnimationClip;


var configurableJoint : ConfigurableJoint;
var health : Health;
var healthDropPoint : float = 1800;

var dropHealthItem : boolean = true;
var healthItemResource : String = "Prefabs/Animals/Fruits/Fruit A";

var isGrounded : IsGrounded;
var breakNest : boolean;
var breakAnimationClip : AnimationClip;

var impactPrefab : GameObject;

var spitBee : boolean;
var lastSpitBeeTime : float;
var spitBeeAnimationClip : AnimationClip;
var createNewBee : boolean;

var beePrefab : GameObject;
var honeySplashPrefab : GameObject;
var honeyStartSpeed : Vector2;

var spitDelay : float;
var spitLocalPosition : Vector3;

var startingBeeVelocity : Vector3;

//var beeRecount: Timer;
//var beeCount : int;
//var beeTag : String = "Bee";
//var beeCountDist : float = 7;

var beeArray : Array = new Array();

var desiredBeeCount : int = 3;
var spitBeeTimer : Timer;

var spitBeeSound : AudioSource[];

var debug : boolean;

var breakHoneySplashes : BeeNestBreakHoneySplash[];

var branch : MeshRenderer;

var actManager : SetActiveManager;

function NoBranch(){
	branch.enabled = false;
}

class BeeNestBreakHoneySplash{
	var startLocalPosition : Vector3;
	var startSpeed : Vector2;
}

function Start () {
	anim = GetComponent.<Animation>();
	configurableJoint = GetComponent(ConfigurableJoint);
	health = GetComponentInChildren(Health);
	isGrounded = GetComponentInChildren(IsGrounded);
	if(health != null){
		health.health *= 0.5;
		health.maxHealth *= 0.5;
		healthDropPoint *= 0.5;

		//Smashing the hive gives a heart back, through the existing drop-on-death plumbing.
		if(dropHealthItem && health.transform.parent != null){
			var dropper : DropCollectibles = health.transform.parent.GetComponentInChildren(DropCollectibles);
			if(dropper == null){
				dropper = health.transform.parent.gameObject.AddComponent(DropCollectibles);
			}
			if(dropper.dropPrefab == null){
				dropper.dropPrefab = Resources.Load(healthItemResource, GameObject);
			}
		}
	}
	actManager  = GameObject.FindObjectOfType.<SetActiveManager>(); 

	beeArray = new Array();
}

function Update () {
	if(health != null && health.health < healthDropPoint){
		drop = true;
	}
	
	if(drop && configurableJoint != null){
		drop = false;
		configurableJoint.xDrive.positionSpring = 0.0;
		configurableJoint.xDrive.positionDamper = 0.0;
		configurableJoint.yDrive.positionSpring = 0.0;
		configurableJoint.yDrive.positionDamper = 0.0;
		configurableJoint.angularYZDrive.positionSpring = 0.0;
		configurableJoint.angularYZDrive.positionDamper = 0.0;
	}

	if(!breakNest && isGrounded != null && isGrounded.isGrounded){
		breakNest = true;
		var col : CapsuleCollider = GetComponent(CapsuleCollider);
		col.direction = 0;
		col.center = Vector3.zero;
		col.radius = .3;
		//anim.Play(breakAnimationClip.name);
		anim[breakAnimationClip.name].enabled = true;
		anim[breakAnimationClip.name].speed = 1.0;
		anim[breakAnimationClip.name].weight = 1.0;
		spitBeeSound[Random.value * spitBeeSound.Length].Play();
		
		anim[spitBeeAnimationClip.name].weight = 0.0;
		anim[spitBeeAnimationClip.name].enabled = false;
		anim[idleAnim.name].weight = 0.0;
		anim[idleAnim.name].enabled = false;
		
		var newImpact : GameObject = Instantiate(impactPrefab, transform.position, Quaternion.identity);
		
		for(var n = 0; n < breakHoneySplashes.Length; n++){
			var newHoneySplash : GameObject = Instantiate(honeySplashPrefab);
			newHoneySplash.transform.position = transform.TransformPoint(breakHoneySplashes[n].startLocalPosition);
			newHoneySplash.GetComponent(ParticleSpeed).startSpeed = breakHoneySplashes[n].startSpeed;
		}
	}
	
	if(spitBee){
		spitBee = false;
		lastSpitBeeTime = Time.time;
		anim[spitBeeAnimationClip.name].enabled = true;
		anim[spitBeeAnimationClip.name].layer = 2;
		anim[spitBeeAnimationClip.name].time = 0.0;
		anim[spitBeeAnimationClip.name].weight = 1.0;
		
		createNewBee = true;
	}
	
	if(createNewBee){
		if(Time.time > lastSpitBeeTime + spitDelay){
			createNewBee = false;
			spitBeeSound[Random.value * spitBeeSound.Length].Play();
			
			var newBee : GameObject = Instantiate(beePrefab, transform.TransformPoint(spitLocalPosition), Quaternion.identity);
			newBee.GetComponent.<Rigidbody>().velocity = startingBeeVelocity;
			
			var honeySplash : GameObject = Instantiate(honeySplashPrefab, transform.TransformPoint(spitLocalPosition), Quaternion.identity);
			honeySplash.GetComponent(ParticleSpeed).startSpeed = honeyStartSpeed;
			
			var allMeleeAttacks : MeleeAttack[] = GameObject.FindObjectsOfType.<MeleeAttack>() as MeleeAttack[];
			for(var i = 0; i < allMeleeAttacks.Length; i++){
				allMeleeAttacks[i].GetAllEnemies();
			}
			
			var allCatFollowOrder : CatFollowOrder[] = GameObject.FindObjectsOfType.<CatFollowOrder>() as CatFollowOrder[];
			for(i = 0; i < allCatFollowOrder.Length; i++){
				allCatFollowOrder[i].GetAllEnemies();
			}

			if(actManager != null){
				actManager.RegisterObj(newBee);
			}

			beeArray.Add(newBee);
		}
	}

	/*beeRecount.Update();
	if(beeRecount.current){
		var allBees : GameObject[] = GameObject.FindGameObjectsWithTag(beeTag);
		beeCount = 0;
		for(var beeID = 0; beeID < allBees.Length; beeID++){
			if(Vector3.Distance(transform.position, allBees[beeID].transform.position) < beeCountDist){
				beeCount++;
			}
		} 
	}*/
	
	spitBeeTimer.Update();
	if(!breakNest && spitBeeTimer.current){
		if(beeArray.length < desiredBeeCount){
			spitBee = true;
			
		}
	}

	if(beeArray == null){
		beeArray = new Array();
	}
	for(var bi = beeArray.length - 1; bi >= 0; bi--){
		var thisBee : GameObject = beeArray[bi];
		if(thisBee == null){
			beeArray.RemoveAt(bi);
		}
	}
}

function OnDrawGizmosSelected(){
	if(debug){
		//DebugUtility.DrawCircle(transform.position, beeCountDist, Vector3.forward, Color.red);
		
		DebugUtility.DrawPoint(transform.TransformPoint(spitLocalPosition),.2,Color.white);
		for(var i = 0; i < breakHoneySplashes.Length; i++){
			DebugUtility.DrawPoint(transform.TransformPoint(breakHoneySplashes[i].startLocalPosition),.1,Color.yellow);
			DebugUtility.DrawArrow(transform.TransformPoint(breakHoneySplashes[i].startLocalPosition),breakHoneySplashes[i].startSpeed/5,Color.yellow);
		}
	}	
}
