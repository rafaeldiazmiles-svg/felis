#pragma strict

private var rigidbodyList : Rigidbody[];

var landPoints : Transform[];
var ladybug : Transform;

var currentLandPoint : int = 0;
var changeLandPointEverySeconds : Vector2 = Vector2(4,8);
private var nextLandpointTime : float;

var ladybugInLandPoint : boolean;
var ladybugWasInLandPoint : boolean;
var landPointDistanceCheck : float = .3;

var idleAnimation : AnimationClip; 
var flyAnimation : AnimationClip;
var wingsOutAnimation : AnimationClip;
var wingsInAnimation : AnimationClip;
var fallAnimation : AnimationClip;

var animationBlendTime : float;

private var flyAnimationBlend : FloatSmoothDamp;
private var wingsOutAnimationBlend : FloatSmoothDamp;
private var wingsInAnimationBlend : FloatSmoothDamp;
private var fallAnimationBlend : FloatSmoothDamp;

private var takeOffTime : float;

var fly : boolean;

var isGrounded : boolean;
var groundDistance : float;
var groundCheckDistance : float = .1;
var groundCheckRayOffset : float = 1.0;
var landPointLength : float = .3;
private var groundPoint : Vector3;
var standHeight : float = .1;

var velocity : Vector3;
var flyPower : float = 12.0;
var flyUpTargetSpeed : float = 1.0;
var gravity : float = 5.0;
var maxVerticalVelocity : float = 3.0;
var cartoonGravity : float = 1.0;

var flySideTargetSpeed : float = 2.0;

var flyHeight : float = 2.0;
var flyHeightWaveSize : float = .3;
var flyHeightWaveSpeed : float = 2.0;

var beginLandDistance : float = 1.2;
var landDistance : float = .4;

var sideDrag : float = 1.0;
var friction : float = 10.0;

var readyToFly : boolean = false;

var scareDistance : float = 1.5;

var body : Transform;
var head : Transform;
var leftWing : Transform;
var rightWing : Transform;
var leftWingTop : Transform;
var rightWingTop : Transform;

var bodyXIncline : float = 5.0;
var verticalIncline : float = 5.0;

var maxGroundDistance : float = 2.0;
var maintainYPosition : float; // In case ground distance is too big.

function Start () {
	var landPointsArray = new Array();
	for(var i = 0; i < transform.childCount; i++){
		if(transform.GetChild(i).name.StartsWith("Land Point")) landPointsArray.push(transform.GetChild(i));
		if(transform.GetChild(i).name.StartsWith("Ladybug")) ladybug = transform.GetChild(i);
	}
	landPoints = landPointsArray.ToBuiltin(Transform) as Transform[];
	
	flyAnimationBlend = new FloatSmoothDamp();
	wingsOutAnimationBlend = new FloatSmoothDamp();
	wingsInAnimationBlend = new FloatSmoothDamp();
	fallAnimationBlend  = new FloatSmoothDamp();
	
	ladybug.GetComponent.<Animation>()[idleAnimation.name].layer = 0;
	ladybug.GetComponent.<Animation>()[flyAnimation.name].layer = 2;
	ladybug.GetComponent.<Animation>()[wingsOutAnimation.name].layer = 1;
	ladybug.GetComponent.<Animation>()[wingsInAnimation.name].layer = 1;
	ladybug.GetComponent.<Animation>()[fallAnimation.name].layer = 2;
	
	ladybug.GetComponent.<Animation>()[idleAnimation.name].enabled = true;
	ladybug.GetComponent.<Animation>()[flyAnimation.name].enabled = true;
	ladybug.GetComponent.<Animation>()[wingsOutAnimation.name].enabled = true;
	ladybug.GetComponent.<Animation>()[wingsInAnimation.name].enabled = true;
	ladybug.GetComponent.<Animation>()[fallAnimation.name].enabled = true;
	
	var affectGrassTags : GameObject[] = GameObject.FindGameObjectsWithTag("Affect Grass");
	rigidbodyList = new Rigidbody[affectGrassTags.Length];
	for(i = 0; i < rigidbodyList.Length; i++)
		rigidbodyList[i] = affectGrassTags[i].transform.parent.GetComponent(Rigidbody);
	
	var boneRoot : Transform = ladybug.GetChild(0);
	for(i = 0; i < boneRoot.childCount; i++)
		if(boneRoot.GetChild(i).name.StartsWith("Body")){body = boneRoot.GetChild(i); break;}

	for(i = 0; 	i < body.childCount;  i++){
		if(body.GetChild(i).name.StartsWith("Head")){head = body.GetChild(i); continue;} 
		if(body.GetChild(i).name.StartsWith("Left Wing Top")){leftWingTop = body.GetChild(i); continue;} 
		if(body.GetChild(i).name.StartsWith("Right Wing Top")){rightWingTop = body.GetChild(i); continue;} 
		if(body.GetChild(i).name.StartsWith("Left Wing")){leftWing = body.GetChild(i); continue;} 
		if(body.GetChild(i).name.StartsWith("Right Wing")){rightWing = body.GetChild(i); continue;} 
	}
}

function LateUpdate () {
	CheckGround();
	
	//Target Behaviour.
	var ladybugJustLanded : boolean = false; if(ladybugInLandPoint && !ladybugWasInLandPoint) ladybugJustLanded = true;
	ladybugWasInLandPoint = ladybugInLandPoint;
	
	if(ladybugJustLanded) nextLandpointTime = Time.time + Random.Range(changeLandPointEverySeconds.x, changeLandPointEverySeconds.y);
	
	if(ladybugInLandPoint && Time.time > nextLandpointTime){
		currentLandPoint = Mathf.RoundToInt(Random.value * (landPoints.Length-1));
		takeOffTime = Time.time;
	}
	
	if(Vector3.Distance(ladybug.position, landPoints[currentLandPoint].position) < landPointDistanceCheck) ladybugInLandPoint = true; else ladybugInLandPoint = false;
	
	for(var i = 0; i < rigidbodyList.Length; i++){
		if(rigidbodyList[i] == null) continue;
		if(Vector3.Distance(rigidbodyList[i].position, landPoints[currentLandPoint].position) < scareDistance){
			currentLandPoint = Mathf.RoundToInt(Random.value * (landPoints.Length-1));
		}
	}

	//Physics.
	if(groundDistance > standHeight) velocity.y -= gravity * Time.deltaTime;
	if(groundDistance < standHeight )
		{ladybug.position.y = Mathf.Lerp(ladybug.position.y, groundPoint.y + standHeight, Time.deltaTime * 5.0); velocity.y = Mathf.Max(0,velocity.y);}
	
	var useDrag : float; if(isGrounded) useDrag = friction; else useDrag = sideDrag;
	velocity.x = Mathf.Lerp(velocity.x, 0, useDrag * Time.deltaTime);
	
	if(fly)	if(velocity.y < flyUpTargetSpeed) velocity.y += flyPower * Time.deltaTime;
	
	if(velocity.y < 0) velocity.y *= cartoonGravity;
	
	velocity.y = Mathf.Min(Mathf.Abs(velocity.y), maxVerticalVelocity) * Mathf.Sign(velocity.y);
	
	ladybug.position += velocity * Time.deltaTime;	
	
	DebugUtility.DrawArrow(ladybug.position, velocity, Color.Lerp(Color.blue, Color.red, velocity.magnitude*.3));
	
	//Behaviour.
	var wingsOut : boolean = false;
	
	var scared : boolean = false;
	
	for(i = 0; i < rigidbodyList.Length; i++){
		if(rigidbodyList[i] == null) continue;
		if(Vector3.Distance(ladybug.position, rigidbodyList[i].position) < scareDistance){
			scared = true;
			if(ladybug.position.y > rigidbodyList[i].position.y + flyHeight * .6)
				velocity.x += flyPower * Time.deltaTime * Mathf.Sign(ladybug.position.x - rigidbodyList[i].position.x);
			else velocity.x += flyPower * Time.deltaTime * .2* Mathf.Sign(ladybug.position.x - rigidbodyList[i].position.x);
			
			fly = true;
		}
	}
	
	if(!ladybugInLandPoint && !scared){
		if(readyToFly){
			ladybug.position.z = Mathf.Lerp(ladybug.position.z, landPoints[currentLandPoint].position.z, Time.deltaTime);
			
			var landPointDistance : float = Mathf.Abs(ladybug.position.x - landPoints[currentLandPoint].position.x);
			var useFlyHeight : float;
			if(landPointDistance > beginLandDistance)
				useFlyHeight = flyHeight + Mathf.Sin(Time.time * flyHeightWaveSpeed) * flyHeightWaveSize;
				
			if(landPointDistance <= beginLandDistance)
				useFlyHeight = flyHeight - (beginLandDistance - landPointDistance);
			
			if(landPointDistance > landDistance){
				if(groundDistance > maxGroundDistance){
					if(ladybug.position.y + velocity.y < maintainYPosition + Mathf.Sin(Time.time * flyHeightWaveSpeed) * flyHeightWaveSize) fly = true;
					else fly = false;
				}
				else{
					if(groundDistance + velocity.y * .05 - .4 < useFlyHeight) fly = true;
					else fly = false;
				}	
				
				if(groundDistance > useFlyHeight *.2 && fly){
					if(ladybug.position.x + velocity.x < landPoints[currentLandPoint].position.x) if(velocity.x < flySideTargetSpeed) velocity.x += flyPower * Time.deltaTime;
					if(ladybug.position.x + velocity.x > landPoints[currentLandPoint].position.x) if(velocity.x > -flySideTargetSpeed) velocity.x -= flyPower * Time.deltaTime;
				}		
			}
			else fly = false;

			Debug.DrawLine(Vector3(ladybug.position.x - .5, useFlyHeight,0), Vector3(ladybug.position.x + .5, useFlyHeight,0));
		}
		else{
			wingsOut = true;
			if(ladybug.GetComponent.<Animation>()[wingsOutAnimation.name].time > ladybug.GetComponent.<Animation>()[wingsOutAnimation.name].length)
				readyToFly = true;
		}
		
	}
	else{
		readyToFly = false;
	}
	
	//Secondary Motion.
	if(velocity.x < .3) ladybug.localScale.x = -Mathf.Abs(ladybug.localScale.x);
	if(velocity.x > .3) ladybug.localScale.x = Mathf.Abs(ladybug.localScale.x);
	
	body.RotateAround(body.position, Vector3.forward, velocity.x * -Mathf.Sign(ladybug.localScale.x) * bodyXIncline);
	
	body.RotateAround(body.position, Vector3.forward, -velocity.y * verticalIncline);
	
	head.RotateAround(head.position, Vector3.forward, -velocity.y * verticalIncline);
	leftWing.RotateAround(leftWing.position, Vector3.forward, velocity.y * verticalIncline);
	leftWingTop.RotateAround(leftWingTop.position, Vector3.forward, velocity.y * verticalIncline);
	rightWing.RotateAround(rightWing.position, Vector3.forward, -velocity.y * verticalIncline);
	rightWingTop.RotateAround(rightWingTop.position, Vector3.forward, -velocity.y * verticalIncline);
		
	//Animation Behavior.
	if(Time.time > takeOffTime  && Time.time < takeOffTime + ladybug.GetComponent.<Animation>()[wingsOutAnimation.name].length - animationBlendTime)
		wingsOutAnimationBlend.target = 1.0; else wingsOutAnimationBlend.target = 0.0;
		
	if(Time.time > takeOffTime && !ladybugInLandPoint){
		if(fly) {flyAnimationBlend.target = 1.0; fallAnimationBlend.target = 0.0;}
		else {fallAnimationBlend.target = 1.0; flyAnimationBlend.target = 0.0;}
	}
	else{flyAnimationBlend.target = 0.0; fallAnimationBlend.target = 0.0;}
	
	if(!isGrounded && !fly) fallAnimationBlend.target = 1.0;
	if(!fly && isGrounded) fallAnimationBlend.target = 0.0;
	if(fly) {flyAnimationBlend.target = 1.0;fallAnimationBlend.target = 0.0;}
	else flyAnimationBlend.target = 0.0;
	
	if(ladybugJustLanded){
		ladybug.GetComponent.<Animation>()[wingsInAnimation.name].time = 0.0;
		wingsInAnimationBlend.target = 1.0;
	}
	if(ladybug.GetComponent.<Animation>()[wingsInAnimation.name].time > ladybug.GetComponent.<Animation>()[wingsInAnimation.name].length - animationBlendTime)
		wingsInAnimationBlend.target = 0.0;
	
	if(wingsOut){
		//ladybug.animation[wingsOutAnimation.name].time = 0.0;
		wingsOutAnimationBlend.target = 1.0;	
	}	
	else ladybug.GetComponent.<Animation>()[wingsOutAnimation.name].time = 0.0;
		
	if(ladybug.GetComponent.<Animation>()[wingsOutAnimation.name].time > ladybug.GetComponent.<Animation>()[wingsOutAnimation.name].length - animationBlendTime)
		wingsOutAnimationBlend.target = 0.0;
	
	//Apply Animation Values.
	flyAnimationBlend.time = animationBlendTime; wingsOutAnimationBlend.time = animationBlendTime; 
	wingsInAnimationBlend.time = animationBlendTime; fallAnimationBlend.time = animationBlendTime;
	
	flyAnimationBlend.SmoothDamp();	wingsOutAnimationBlend.SmoothDamp(); wingsInAnimationBlend.SmoothDamp(); fallAnimationBlend.SmoothDamp();
	
	ladybug.GetComponent.<Animation>()[idleAnimation.name].weight = 1.0;
	ladybug.GetComponent.<Animation>()[flyAnimation.name].weight = flyAnimationBlend.current;
	ladybug.GetComponent.<Animation>()[wingsOutAnimation.name].weight = wingsOutAnimationBlend.current;
	ladybug.GetComponent.<Animation>()[wingsInAnimation.name].weight = wingsInAnimationBlend.current;
	ladybug.GetComponent.<Animation>()[fallAnimation.name].weight = fallAnimationBlend.current;
	
	//Debug.
	var debugColor : Color; if(ladybugInLandPoint) debugColor = Color.red; else debugColor = Color.blue;
	Debug.DrawLine(ladybug.position, landPoints[currentLandPoint].position, Color.gray);
	DebugUtility.DrawPoint(landPoints[currentLandPoint].position, 1.5, debugColor);
}

function CheckGround(){
	
	isGrounded = false;
	var hits : RaycastHit[] = Physics.RaycastAll(ladybug.position + Vector3.up * groundCheckRayOffset, Vector3.down, 10.0);
	groundDistance = Mathf.Infinity;
	for(var i = 0; i < hits.Length; i++)
		if(hits[i].distance - groundCheckRayOffset < groundDistance) groundDistance = hits[i].distance - groundCheckRayOffset;

	for(var n = 0; n < landPoints.Length; n++) 
		if(Mathf.Abs(ladybug.position.x - landPoints[n].position.x) < landPointLength) groundDistance = ladybug.position.y - landPoints[n].position.y;

	if(Mathf.Abs(groundDistance) < groundCheckDistance + standHeight) isGrounded = true;
	groundPoint = ladybug.position - Vector3.up * groundDistance;
										
	var debugColor : Color; if(isGrounded) debugColor = Color.green; else debugColor = Color.gray;
	DebugUtility.DrawPoint(groundPoint, 1.0, debugColor);
	
	if(groundDistance < maxGroundDistance) maintainYPosition = ladybug.position.y;
	else maintainYPosition -= Time.deltaTime *.4;
}