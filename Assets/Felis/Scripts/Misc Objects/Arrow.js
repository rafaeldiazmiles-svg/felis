#pragma strict

var velocity : Vector2;
var angle : float;

var gravity : float;

var damage : float = 20.0;

var vertexAlpha : VColorGroupAlpha;

var inPlaceTags : String[];

var bounceChance : float = .3;
var forceBounceDelay : float = 2.0;

var stuck : boolean;
var inPlace : boolean;
var stuckRot : Quaternion;
var stuckAngleRandom : float = 6.0;
var stuckObj : Transform;
var arrowHitMng : ArrowHitManager; 
//var stuckObjDist : float;
var stuckLocalPos : Vector3;
var stuckTime : float;
var sink : float = .2;
var stuckObjXScaleSign : int;

var defaultRot : Quaternion;

var arrowHitShake : AnimationCurve;

var handle : Transform;
var handleString : String = "Arrow Handle";
var handleAngle : float;
var stuckHandleAngle : float;

var arrowLoopSound : VelocityVolume;

var hitSound : PlayRandomSound;

var bounce : ToggleBoolean;
var bounceSpinVelRnd : float = 360;
var bounceVelRnd : Vector2 = Vector2(1,5);
var bounceSpinVel : float;

var rend : Renderer;

var arrowCenter : Vector3;

var td : TimedDestroy;

function Start () {
	vertexAlpha = GetComponent.<VColorGroupAlpha>();

	arrowLoopSound = GetComponentInChildren.<VelocityVolume>();

	hitSound = GetComponent.<PlayRandomSound>();

	defaultRot = transform.rotation;

	rend = GetComponent.<Renderer>();

	td = GetComponent.<TimedDestroy>();
}

function FixedUpdate () {
	bounce.Update();

	if(bounce.toggledTrue){
		stuck = false;
		bounceSpinVel = Random.Range(-bounceSpinVelRnd,bounceSpinVelRnd);
		velocity = Vector2(Random.Range(-bounceVelRnd.x, bounceVelRnd.x), Random.Range(0,bounceVelRnd.y));
		//Destroy
		if(td != null){
			td.activate = true;
		}
	}
	
	if(!stuck){
		velocity.y += gravity * Time.deltaTime;

		if(!bounce.current){
			transform.rotation = defaultRot;
			angle = Mathf.Atan2(-velocity.y, velocity.x) * Mathf.Rad2Deg;
			transform.RotateAround(transform.position, Vector3.forward, angle);
		}
		else{
			transform.RotateAround(transform.TransformPoint(arrowCenter), Vector3.forward, bounceSpinVel * Time.deltaTime);
		}

		transform.position.x -= velocity.x * Time.deltaTime;
		transform.position.y += velocity.y * Time.deltaTime;


		var ray : Ray = new Ray(transform.position, Vector3(-velocity.x, velocity.y, 0));
		var hit : RaycastHit;

		//SEE IF IT HITS SOMETHING
		if(!bounce.current && Physics.Raycast(ray, hit, velocity.magnitude * Time.deltaTime)){
			//play hit sound
			hitSound.PlaySound();

			if(Random.value < bounceChance){
				bounce.current = true;
			}
			else{
				//Test if hit ground or moving object.
				inPlace = false;
				for(var i = 0; i < inPlaceTags.Length; i++){
					if(hit.collider.tag == inPlaceTags[i]){
						inPlace = true;
						break;
					}
				}

				//Store stuck info
				stuck = true;
				stuckTime = Time.time;
				transform.position = hit.point;

				transform.RotateAround(transform.position, Vector3.forward, Random.Range(-stuckAngleRandom, stuckAngleRandom));
				stuckRot = transform.rotation;

				//sink arrow tip
				if(vertexAlpha != null){
					vertexAlpha.setAlphaGroups[0].alpha = 0.0;
				}

				//Hit moving object
				if(!inPlace){
					arrowHitMng = hit.collider.gameObject.GetComponent.<ArrowHitManager>();

					if(arrowHitMng == null){
						stuckObj = hit.collider.transform;
						stuckObjXScaleSign = Mathf.Sign(stuckObj.localScale.x);
					}
					else{
						stuckObj = arrowHitMng.GetClosestBone(transform.position);
						stuckObjXScaleSign = Mathf.Sign(arrowHitMng.transform.localScale.x);
						transform.position += Vector3(-velocity.x, velocity.y, 0).normalized * sink;
					}

					//stuckObjDist = Vector3.Distance(transform.position, stuckObj.position);
					stuckLocalPos = stuckObj.InverseTransformPoint(transform.position);

					handle = stuckObj.Find(handleString);
					if(handle == null){
						handle = new GameObject(handleString).transform;
						handle.position = transform.position;
						handle.parent = stuckObj;

					}

					stuckHandleAngle = Mathf.Atan2(-stuckObj.position.y + handle.position.y, -handle.position.x + stuckObj.position.x) * Mathf.Rad2Deg;

				}

				//Health
				var health : Health = hit.collider.gameObject.GetComponentInChildren.<Health>();
				if(health != null){
					var crouch : Crouch = hit.collider.gameObject.GetComponentInChildren.<Crouch>();
					var dodge : boolean;
					if(crouch != null){
						dodge = crouch.IsDodging();
					}
					if(!dodge){
						health.health -= damage;
						if(health.health <= 0.0){
							if(health.fakeDestroy){
								bounce.current = true;
							}
						}
					}
					else{
						stuck = false;
					}
				}

			}
		}
	}
	else{
		//ARROW HIT SOMETHING
		if(Time.time > stuckTime + forceBounceDelay){
			bounce.current = true;
		}

		if(arrowLoopSound != null){
			arrowLoopSound.volumeMultiplier = 0.0;
		}
		transform.rotation = stuckRot;
		var shakeAngle : float = arrowHitShake.Evaluate(Time.time - stuckTime);

		if(inPlace){ //stuck in ground or static object.
			transform.RotateAround(transform.position, Vector3.forward, shakeAngle);
		}
		else{
			if(stuckObj != null){
				handleAngle = Mathf.Atan2(-stuckObj.position.y + handle.position.y, -handle.position.x + stuckObj.position.x) * Mathf.Rad2Deg;
				
				transform.position = stuckObj.TransformPoint(stuckLocalPos);

				var dHandleAngle : float = Mathf.DeltaAngle(handleAngle, stuckHandleAngle);

				angle = shakeAngle + dHandleAngle;

				if(Swapped()){
					angle += 180;;
				}

				transform.RotateAround(transform.position, Vector3.forward, angle);

			}
			else{
				bounce.current = true;
				//stuck = false;
				//velocity = Vector2.zero;
			}
		}
	}
}

function Swapped() : boolean{
		var currentSuckObjScaleSign : int;
		if(arrowHitMng == null){
			currentSuckObjScaleSign = Mathf.Sign(stuckObj.localScale.x);
		}
		else{
			currentSuckObjScaleSign = Mathf.Sign(arrowHitMng.transform.localScale.x);
		}


		if(currentSuckObjScaleSign == stuckObjXScaleSign){
			return false;
		}	
		else{
			return true;
		}
}


function OnDrawGizmosSelected(){
	#if UNITY_EDITOR

	DebugUtility.DrawArrow(transform.position, .3 * Vector3(-velocity.x, velocity.y, 0));
	DebugUtility.DrawPoint(transform.TransformPoint(arrowCenter), .2);

	#endif
}
