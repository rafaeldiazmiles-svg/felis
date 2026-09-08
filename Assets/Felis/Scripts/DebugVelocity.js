#pragma strict

var rb : Rigidbody;

function Start () {
	rb = GetComponent.<Rigidbody>();
}

function Update () {

}

function OnDrawGizmos(){
	#if UNITY_EDITOR
	if(rb != null){
		Handles.Label(transform.position, "x: " + rb.velocity.x.ToString());
		Handles.Label(transform.position + Vector3(0,-.3,0),"y: " +  rb.velocity.y.ToString());
		Handles.Label(transform.position + Vector3(0,-.6,0),"z: " +  rb.velocity.z.ToString());
		DebugUtility.DrawArrow(transform.position, rb.velocity);
	}
	#endif
}