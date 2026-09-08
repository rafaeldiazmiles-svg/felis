#pragma strict

var minX : float;
var maxX : float;

function OnDrawGizmosSelected(){
	#if UNITY_EDITOR
	Debug.DrawLine(Vector3(minX,-100,0), Vector3(minX, 100,0), Color.green);
	Debug.DrawLine(Vector3(maxX,-100,0), Vector3(maxX, 100,0), Color.red);
	#endif
}