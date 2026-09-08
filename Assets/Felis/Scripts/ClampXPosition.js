#pragma strict

var bounds : Bounds;

@Space(30)
var useFirstLateFramePos : boolean;
var addOffset : Vector3;
@Space(30)

var setMinMax : boolean;

var minX : float;
var maxX : float;

var minY : float;
var maxY : float;

var minZ : float;
var maxZ : float;

var debug : boolean;

function Start () {
	//bounds.SetMinMax(Vector3(minX,minY,minZ), Vector3(maxX, maxY, maxZ));

}

function LateUpdate () {
	if(useFirstLateFramePos){
		bounds.center = transform.position + addOffset;
		useFirstLateFramePos = false;
	}
	
	if(setMinMax){
		setMinMax = false;
		bounds.SetMinMax(Vector3(minX,minY,minZ), Vector3(maxX, maxY, maxZ));
	}

	transform.position.x = Mathf.Clamp(transform.position.x, bounds.min.x, bounds.max.x);
	transform.position.y = Mathf.Clamp(transform.position.y, bounds.min.y, bounds.max.y);
	transform.position.z = Mathf.Clamp(transform.position.z, bounds.min.z, bounds.max.z);
}

function OnDrawGizmosSelected(){
	#if UNITY_EDITOR
	if(debug){
		Gizmos.color = Color.yellow;
		Gizmos.DrawWireCube(bounds.center, bounds.size);
	}
	#endif
}