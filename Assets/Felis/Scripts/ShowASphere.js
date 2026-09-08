#pragma strict
var radius : float = .05;
var color : Color = Color.white;
var show : boolean;

function OnDrawGizmos() {
	// Draw a yellow sphere at the transform's position
	if(show){
		//if(!Application.isPlaying){
			Gizmos.color = color;
			Gizmos.DrawSphere (transform.position, radius);
		//}
	}
}