#pragma strict

var pieces : ExplosionPiece[];
var useAllChildren : boolean;

var explode : boolean;
var exploded : boolean;
var explodeTime : float;

var explosionForce : Vector2;
var randomizeForce : float;

var gravity: Vector3;

var angularXSpeed : Vector2;
var angularYSpeed : Vector2;
var angularZSpeed : Vector2;

var scaleOverTime : AnimationCurve;
var scaleOverTimeMultiply : float = 1.0;;

var drag : float;

var destroyAfterUse : boolean;
var destroyTimeTrigger : float;

var parentInertia : Vector3;

class ExplosionPiece{
	var piece : Transform;
	var speed : Vector3;
	var angularSpeed : Vector3;
	
	var defaultLocalPosition : Vector3;
	var defaultLocalRotation : Quaternion;
	var defaultLocalScale : Vector3;
}

function Start () {
	if(useAllChildren){
		var piecesWParent : Transform[]= GetComponentsInChildren.<Transform>() as Transform[];
		pieces = new ExplosionPiece[piecesWParent.Length - 1];
		for(var i = 0; i<piecesWParent.Length - 1; i++){
			pieces[i] = new ExplosionPiece();
			pieces[i].piece = piecesWParent[i+1];
			if(pieces[i].piece.GetComponent(MeshRenderer) != null)
				pieces[i].piece.GetComponent(MeshRenderer).enabled = false;
			pieces[i].defaultLocalPosition = pieces[i].piece.localPosition;
			pieces[i].defaultLocalRotation = pieces[i].piece.localRotation;
			pieces[i].defaultLocalScale = pieces[i].piece.localScale;
		}
	}

}

function Update () {
	
	for(var i = 0; i < pieces.Length; i++){
		if(pieces[i].piece == null) continue;
		
		if(explode){
			pieces[i].piece.localPosition = pieces[i].defaultLocalPosition;
			pieces[i].piece.localRotation = pieces[i].defaultLocalRotation;
			pieces[i].angularSpeed.x = Random.Range(angularXSpeed.x,angularXSpeed.y);
			pieces[i].angularSpeed.y = Random.Range(angularYSpeed.x,angularYSpeed.y);
			pieces[i].angularSpeed.z = Random.Range(angularZSpeed.x,angularZSpeed.y);
			if(pieces[i].piece.GetComponent(MeshRenderer) != null)
				pieces[i].piece.GetComponent(MeshRenderer).enabled = true;
			pieces[i].speed = (pieces[i].piece.localPosition + Random.insideUnitSphere * randomizeForce).normalized * Random.Range(explosionForce.x, explosionForce.y);
			pieces[i].speed += parentInertia;
		}
		
		if(exploded){
			pieces[i].piece.rotation *= Quaternion.AngleAxis(pieces[i].angularSpeed.x * Time.deltaTime, Vector3.right) ;
			pieces[i].piece.rotation *= Quaternion.AngleAxis(pieces[i].angularSpeed.y * Time.deltaTime, Vector3.up);
			pieces[i].piece.rotation *= Quaternion.AngleAxis(pieces[i].angularSpeed.z * Time.deltaTime, Vector3.forward);
			
			pieces[i].piece.position += pieces[i].speed * Time.deltaTime;
			
			pieces[i].speed += gravity * Time.deltaTime;
			
			pieces[i].speed = Vector3.Lerp(pieces[i].speed, Vector3.zero, Time.deltaTime * pieces[i].speed.magnitude * drag);
			
			pieces[i].piece.localScale = pieces[i].defaultLocalScale * scaleOverTime.Evaluate((Time.time - explodeTime) * scaleOverTimeMultiply);
		}
	}

	
	if(explode){
		explode = false;
		exploded = true;
		explodeTime = Time.time;
	}
	
	if(destroyAfterUse && exploded && Time.time > explodeTime + destroyTimeTrigger){
		Destroy(gameObject);
	}
}

function Reset(){
	explode = true;
}
