#pragma strict

var tombCover : Transform;
var tombCoverStartX : float;
var tombCoverOpenX : float;

var open : ToggleBoolean;

var movementAI : MovementAI;
var rb : Rigidbody;
var controller : ControllerInput;

var sideMovementAnimation : SideMovementAnimation;
var jumpSwimAnimation : JumpSwimAnimation;
var spineBalance : SpineBalance;

var setZ : float = .1;
var zpos : Lock2D;
var zPosSpeed : float = .5;

var end : boolean;

var caged : Caged;

var cancelTomb : boolean;

function CancelTomb(){
	cancelTomb = true;
}

function GetTombCover(){
	yield WaitForSeconds(1.0);

	var allRBs : Rigidbody[] = FindObjectsOfType.<Rigidbody>() as Rigidbody[];
	for(var i = 0; i < allRBs.Length; i++){
		if(allRBs[i].name == "Tomb Cover"){
			if(tombCover == null){
				tombCover = allRBs[i].transform;
			}
			else{
				if(Vector3.Distance(transform.position, allRBs[i].transform.position) < Vector3.Distance(transform.position, tombCover.position)){
					tombCover = allRBs[i].transform;
				}
			}
		}
	}
}

function Start () {
	movementAI = transform.parent.GetComponentInChildren.<MovementAI>();
	controller = transform.parent.GetComponentInChildren.<ControllerInput>();
	sideMovementAnimation = transform.parent.GetComponentInChildren.<SideMovementAnimation>();
	jumpSwimAnimation = transform.parent.GetComponentInChildren.<JumpSwimAnimation>();
	spineBalance = transform.parent.GetComponentInChildren.<SpineBalance>();
	rb = transform.parent.GetComponent.<Rigidbody>();
	caged = transform.parent.GetComponent.<Caged>();
	zpos = transform.parent.GetComponentInChildren.<Lock2D>();

	if(cancelTomb){
		SetNormalValues();
		zpos.zPosition = 0.0;
		Destroy(this);
		return;
	}

	GetTombCover();

	tombCoverStartX = transform.position.x;
	

	
	sideMovementAnimation.cancelAnimations = true;
	jumpSwimAnimation.cancelAnimations = true;
	spineBalance.disable = true;


	caged.isCaged = true;
	caged.cry = false;
	caged.askHelp = false;
}

function Update () {
	if(tombCover == null) GetTombCover();
	
	if(end) return;
	
	open.Update();
	
	if(open.toggledTrue){
		//controller.inputButtonB.pressed = false;
	}
	
	if(open.current){
		zpos.zPosition = Mathf.MoveTowards(zpos.zPosition, setZ, Time.deltaTime * zPosSpeed);
		
		if(Time.time < open.toggledTrueTime + 1){
			controller.inputButtonB.pressed = true;
			jumpSwimAnimation.cancelAnimations = false;
		}
		
		if(Time.time > open.toggledTrueTime + 1){
			SetNormalValues();
		}
	}
	
	if(tombCover != null && Mathf.Abs(tombCover.transform.position.x - tombCoverStartX) > tombCoverOpenX){
		//open.current = true;
		Invoke("OpenTomb", .1);
	}
}

function OpenTomb(){
	if(tombCover != null && Mathf.Abs(tombCover.transform.position.x - tombCoverStartX) > tombCoverOpenX){
		open.current = true;
	}
}

function SetNormalValues(){
	movementAI.disable = false;
	end = true;
	sideMovementAnimation.cancelAnimations = false;
	jumpSwimAnimation.cancelAnimations = false;
	spineBalance.disable = false;
	caged.isCaged = false;
	rb.isKinematic = false;
	rb.useGravity = true;
}