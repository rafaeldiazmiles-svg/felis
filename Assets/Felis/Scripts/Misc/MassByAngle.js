#pragma strict

//Changes mass according to angle. For heavy objects that need to be tipped over. Make it easy to tip but heavy enough when they're horizontal.

var rb : Rigidbody;
@Header("-------- Set curve to ping pong --------")
var angleMassCurve : AnimationCurve;

function Start () {
	rb = GetComponent.<Rigidbody>();
}

function Update () {
	var angle : float = Mathf.Atan2(transform.right.y, transform.right.x) * Mathf.Rad2Deg;

	rb.mass = angleMassCurve.Evaluate(angle);
}