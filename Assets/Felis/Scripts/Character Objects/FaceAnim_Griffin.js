#pragma strict
var faceAnim : FaceAnim;

var charMng : CharacterScriptMng;

var ride : Transform;
var angleHandle : Transform;

var side : int;
var angle : float;

var airAngleFrameCurve : AnimationCurve;
var airFrames : int[];

var groundedFrame : int;

function Start(){
	faceAnim = GetComponent.<FaceAnim>();

	charMng = transform.parent.GetComponent.<CharacterScriptMng>();
}

function Update(){
	side = charMng.wingedFlight.side;

	angle = Mathf.Atan2(angleHandle.position.y - ride.position.y, angleHandle.position.x - ride.position.x) * Mathf.Rad2Deg;
	if(side == -1){
		angle = 180 - angle;
	}
	angle = Mathf.DeltaAngle(0,angle);

	if(charMng.isGrounded.isGrounded){
		faceAnim.defaultEyes = groundedFrame;
	}
	else{
		faceAnim.defaultEyes = airFrames[Mathf.RoundToInt(airAngleFrameCurve.Evaluate(angle))];
	}


}