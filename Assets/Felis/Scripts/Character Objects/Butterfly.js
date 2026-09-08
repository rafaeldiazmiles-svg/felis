#pragma strict

private var rigidbodyList : Rigidbody[];

var landPoints : Transform[];
var butterfly : Transform;

var currentLandPoint : int = 0;
var changeLandPointEverySeconds : Vector2 = Vector2(4,8);
private var nextLandpointTime : float;

var butterflyInLandPoint : boolean;
var butterflyWasInLandPoint : boolean;
var landPointDistanceCheck : float = .3;

var idleAnimation : AnimationClip; 
var flyAnimation : AnimationClip;

var animationBlendTime : float;

private var flyAnimationBlend : FloatSmoothDamp;

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

var scareDistance : float = 1.5;

var maxGroundDistance : float = 2.0;
var maintainYPosition : float; // In case ground distance is too big.

var flyVariationSpeed : float = 2.5;
var flyVariationRange : float = .3;
var flySpeedOffset : float = .2;

var color : int = 0;
private var currentColor : int = 0;;

var textures : Texture[];
var texturesDOF : Texture[];
var colors : Color[];

private var FG : boolean; //Foreground.
private var currentFG : boolean;

private var defaultLocalScale : Vector3;

var debug : boolean;

var getRBTimer : Timer;

function Start () {
	
	var landPointsArray = new Array();
	for(var i = 0; i < transform.childCount; i++){
		if(transform.GetChild(i).name.StartsWith("Land Point")) landPointsArray.push(transform.GetChild(i));
		if(transform.GetChild(i).name.StartsWith("Butterfly")) butterfly = transform.GetChild(i);
	}
	landPoints = landPointsArray.ToBuiltin(Transform) as Transform[];
	
	flyAnimationBlend = new FloatSmoothDamp();
	
	butterfly.GetComponent.<Animation>()[idleAnimation.name].layer = 0;
	butterfly.GetComponent.<Animation>()[flyAnimation.name].layer = 1;

	butterfly.GetComponent.<Animation>()[idleAnimation.name].enabled = true;
	butterfly.GetComponent.<Animation>()[flyAnimation.name].enabled = true;

	
	if(getRBTimer.every == 0.0) getRBTimer.every = 2.0;
		
	butterfly.GetComponent.<Animation>()[flyAnimation.name].normalizedTime = Random.value;
	
	defaultLocalScale = butterfly.localScale;
	
	GetRBs();
}

function GetRBs(){
	var affectGrassTags : GameObject[] = GameObject.FindGameObjectsWithTag("Affect Grass");
	rigidbodyList = new Rigidbody[affectGrassTags.Length];
	for(var i = 0; i < rigidbodyList.Length; i++){
		rigidbodyList[i] = affectGrassTags[i].transform.parent.GetComponent(Rigidbody);
	}
}

function LateUpdate () {
	getRBTimer.Update();
	if(getRBTimer.current){
		GetRBs();
	}
	
	CheckGround();
	//Bias size.
	if(transform.position.z > 1){
		butterfly.localScale = defaultLocalScale * 1.5;
		if(debug) Debug.DrawRay(butterfly.position, Vector3.up);
		FG = true;
	}
	else{
		FG = false;
	}
				
	//Target Behaviour.
	var butterflyJustLanded : boolean = false; if(butterflyInLandPoint && !butterflyWasInLandPoint) butterflyJustLanded = true;
	butterflyWasInLandPoint = butterflyInLandPoint;
	
	if(butterflyJustLanded) nextLandpointTime = Time.time + Random.Range(changeLandPointEverySeconds.x, changeLandPointEverySeconds.y);
	
	if(butterflyInLandPoint && Time.time > nextLandpointTime){
		currentLandPoint = Mathf.RoundToInt(Random.value * (landPoints.Length-1));
		takeOffTime = Time.time;
	}
	
	if(Vector3.Distance(butterfly.position, landPoints[currentLandPoint].position) < landPointDistanceCheck) butterflyInLandPoint = true; else butterflyInLandPoint = false;
	
	for(var i = 0; i < rigidbodyList.Length; i++){
		if(rigidbodyList[i] == null) continue;
		
		if(Vector3.Distance(rigidbodyList[i].position, landPoints[currentLandPoint].position) < scareDistance) 
			currentLandPoint = Mathf.RoundToInt(Random.value * (landPoints.Length-1));
	}

	//Physics.
	if(groundDistance > standHeight) velocity.y -= gravity * Time.deltaTime;
	if(groundDistance < standHeight )
		{butterfly.position.y = Mathf.Lerp(butterfly.position.y, groundPoint.y + standHeight, Time.deltaTime * 5.0); velocity.y = Mathf.Max(0,velocity.y);}
	
	var useDrag : float; if(isGrounded) useDrag = friction; else useDrag = sideDrag;
	velocity.x = Mathf.Lerp(velocity.x, 0, useDrag * Time.deltaTime);
	
	if(fly)	if(velocity.y < flyUpTargetSpeed) velocity.y += flyPower * Time.deltaTime;
	
	if(velocity.y < 0) velocity.y *= cartoonGravity;
	
	velocity.y = Mathf.Min(Mathf.Abs(velocity.y), maxVerticalVelocity) * Mathf.Sign(velocity.y);
	
	butterfly.position += velocity * Time.deltaTime;	
	
	if(debug) DebugUtility.DrawArrow(butterfly.position, velocity, Color.Lerp(Color.blue, Color.red, velocity.magnitude*.3));
	
	//Behaviour.
	var wingsOut : boolean = false;
	
	var scared : boolean = false;
	
	for(i = 0; i < rigidbodyList.Length; i++){
		if(rigidbodyList[i] == null) continue;
		
		if(Vector3.Distance(butterfly.position, rigidbodyList[i].position) < scareDistance){
			scared = true;
			if(butterfly.position.y > rigidbodyList[i].position.y + flyHeight * .6)
				velocity.x += flyPower * Time.deltaTime * Mathf.Sign(butterfly.position.x - rigidbodyList[i].position.x);
			else velocity.x += flyPower * Time.deltaTime * .2* Mathf.Sign(butterfly.position.x - rigidbodyList[i].position.x);
			
			fly = true;
		}
	}
	
	if(!butterflyInLandPoint && !scared){
		butterfly.position.z = Mathf.Lerp(butterfly.position.z, landPoints[currentLandPoint].position.z, Time.deltaTime);
			
		var landPointDistance : float = Mathf.Abs(butterfly.position.x - landPoints[currentLandPoint].position.x);
		var useFlyHeight : float;
		if(landPointDistance > beginLandDistance)
			useFlyHeight = flyHeight + Mathf.Sin(Time.time * flyHeightWaveSpeed) * flyHeightWaveSize;
			
		if(landPointDistance <= beginLandDistance)
			useFlyHeight = flyHeight - (beginLandDistance - landPointDistance);
		
		if(landPointDistance > landDistance){
			if(groundDistance > maxGroundDistance){
				if(butterfly.position.y + velocity.y < maintainYPosition + Mathf.Sin(Time.time * flyHeightWaveSpeed) * flyHeightWaveSize) fly = true;
				else fly = false;
			}
			else{
				if(groundDistance + velocity.y * .05 - .4 < useFlyHeight) fly = true;
				else fly = false;
			}	
			
			if(groundDistance > useFlyHeight *.2 && fly){
				if(butterfly.position.x + velocity.x < landPoints[currentLandPoint].position.x) if(velocity.x < flySideTargetSpeed) velocity.x += flyPower * Time.deltaTime;
				if(butterfly.position.x + velocity.x > landPoints[currentLandPoint].position.x) if(velocity.x > -flySideTargetSpeed) velocity.x -= flyPower * Time.deltaTime;
			}		
		}
		else fly = false;
		Debug.DrawLine(Vector3(butterfly.position.x - .5, useFlyHeight,0), Vector3(butterfly.position.x + .5, useFlyHeight,0));
	}

	
	//Secondary Motion.
	if(velocity.x < .3) butterfly.localScale.x = -Mathf.Abs(butterfly.localScale.x);
	if(velocity.x > .3) butterfly.localScale.x = Mathf.Abs(butterfly.localScale.x);

		
	//Animation Behavior.
	if(!isGrounded) flyAnimationBlend.target = 1.0;
	else flyAnimationBlend.target = 0.0;
	
	butterfly.GetComponent.<Animation>()[flyAnimation.name].speed = 1.0 + Mathf.Sin(Time.time * flyVariationSpeed) * flyVariationRange + flySpeedOffset;
	
	//Apply Animation Values.
	flyAnimationBlend.time = animationBlendTime; 

		flyAnimationBlend.SmoothDamp();
	
	butterfly.GetComponent.<Animation>()[idleAnimation.name].weight = 1.0;
	butterfly.GetComponent.<Animation>()[flyAnimation.name].weight = flyAnimationBlend.current;
	
	//Use other colors.
	if(currentColor != color || currentFG != FG){
		currentColor = color;
		currentFG = FG;
		currentColor = Mathf.Min(textures.Length-1, currentColor);	
		
		
		if(currentFG){
			butterfly.Find("Butterfly").GetComponent.<Renderer>().material.shader = Shader.Find("Transparent/Simple Unlit Alpha");
			butterfly.Find("Butterfly").GetComponent.<Renderer>().material.SetTexture("_MainTex", texturesDOF[currentColor]);
			butterfly.Find("Body/Left Wing/Glow Item").gameObject.GetComponent(GlowItem).color = colors[currentColor];
		}
		else{
			butterfly.Find("Butterfly").GetComponent.<Renderer>().material.SetTexture("_MainTex", textures[currentColor]);
			//butterfly.Find("Body/Left Wing/Glow Item").gameObject.GetComponent(GlowItem).color = colors[currentColor];			
		}
	}
	

	//Debug.
	if(debug){
		var debugColor : Color; if(butterflyInLandPoint) debugColor = Color.red; else debugColor = Color.blue;
		Debug.DrawLine(butterfly.position, landPoints[currentLandPoint].position, Color.gray);
		DebugUtility.DrawPoint(landPoints[currentLandPoint].position, 1.5, debugColor);
	}
}

function CheckGround(){
	isGrounded = false;
	var hits : RaycastHit[] = Physics.RaycastAll(butterfly.position + Vector3.up * groundCheckRayOffset, Vector3.down, 10.0);
	groundDistance = Mathf.Infinity;
	for(var i = 0; i < hits.Length; i++)
		if(hits[i].distance - groundCheckRayOffset < groundDistance) groundDistance = hits[i].distance - groundCheckRayOffset;

	for(var n = 0; n < landPoints.Length; n++) 
		if(Mathf.Abs(butterfly.position.x - landPoints[n].position.x) < landPointLength) groundDistance = butterfly.position.y - landPoints[n].position.y;

	if(Mathf.Abs(groundDistance) < groundCheckDistance + standHeight) isGrounded = true;
	groundPoint = butterfly.position - Vector3.up * groundDistance;
	
	if(debug){
		var debugColor : Color; if(isGrounded) debugColor = Color.green; else debugColor = Color.gray;
		DebugUtility.DrawPoint(groundPoint, 1.0, debugColor);
	}
			
	if(groundDistance < maxGroundDistance) maintainYPosition = butterfly.position.y;
	else maintainYPosition -= Time.deltaTime *.4;
}