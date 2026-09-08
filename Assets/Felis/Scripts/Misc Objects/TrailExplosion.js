#pragma strict

var explosion : PiecesExplosion;
var piecesDestroy : TimedDestroy[];
var piecesDurationRange : Vector2;

var explode : boolean;

function Start () {

}

function Update () {
	if(explode){
		explode = false;
		
		explosion.explode = true;
		for(var i = 0; i < piecesDestroy.Length; i++){
			piecesDestroy[i].destroyTriggerTime = Random.Range(piecesDurationRange.x, piecesDurationRange.y);
			piecesDestroy[i].activate = true;
		}
	}
}