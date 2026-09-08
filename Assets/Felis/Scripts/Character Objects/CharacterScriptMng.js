#pragma strict

var rb : Rigidbody;
var animComp : Animation;

var idleAnimation : IdleAnimation;
var sideMovement : SideMovement;
var sideMovementAnimation : SideMovementAnimation;
var jumpSwim : JumpSwim;
var jumpSwimAnimation : JumpSwimAnimation;
var lookUp : LookUp;
var crouch : Crouch;

var isGrounded : IsGrounded;
var sideDetection : SideDetection;

var frictionDrag : StopFrictionDrag;
var forceFriction : ForceFriction;

var meleeAttack : MeleeAttack;
var meleeAttackSimple : MeleeAttackSimple;

var health : Health;

var wingedFlight : WingedFlight;
var wingedFlightAI : WingedFlightAI;

var spineBalance : SpineBalance;
var groundAngle : GroundAngle;

var input : ControllerInput;

var frameGroups : UVFrameGroups;
var feetParticle: FeetParticle;

var death : Death;

var maxRBDelta : MaxRigidbodyDeltaPos;

var bounceSound : BounceSound;

function Start(){
	rb = GetComponentInChildren.<Rigidbody>();
	animComp = GetComponentInChildren.<Animation>();

	idleAnimation = GetComponentInChildren.<IdleAnimation>();
	sideMovement = GetComponentInChildren.<SideMovement>();
	sideMovementAnimation = GetComponentInChildren.<SideMovementAnimation>();
	jumpSwim = GetComponentInChildren.<JumpSwim>();
	jumpSwimAnimation = GetComponentInChildren.<JumpSwimAnimation>();
	lookUp = GetComponentInChildren.<LookUp>();
	crouch = GetComponentInChildren.<Crouch>();

	isGrounded = GetComponentInChildren.<IsGrounded>();
	sideDetection = GetComponentInChildren.<SideDetection>();

	frictionDrag = GetComponentInChildren.<StopFrictionDrag>();
	forceFriction = GetComponentInChildren.<ForceFriction>();

	meleeAttack = GetComponentInChildren.<MeleeAttack>();
	meleeAttackSimple = GetComponentInChildren.<MeleeAttackSimple>();

	health = GetComponentInChildren.<Health>();

	wingedFlight = GetComponentInChildren.<WingedFlight>();
	wingedFlightAI = GetComponentInChildren.<WingedFlightAI>();

	spineBalance = GetComponentInChildren.<SpineBalance>();
	groundAngle = GetComponentInChildren.<GroundAngle>();

	input = GetComponentInChildren.<ControllerInput>(); 

	frameGroups = GetComponentInChildren.<UVFrameGroups>();
	feetParticle = GetComponentInChildren.<FeetParticle>(); 

	death = GetComponentInChildren.<Death>();

	maxRBDelta = GetComponentInChildren.<MaxRigidbodyDeltaPos>();

	bounceSound = GetComponentInChildren.<BounceSound>();
}
