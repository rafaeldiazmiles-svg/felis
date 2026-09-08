#pragma strict

var rb : Rigidbody;

var colors : Color[];

var velocityAcceleration : float = 10.0;

var velocityMagnitudeMul : float = 1.2;

var debugSize : float = 10.0;

function Start () {
	rb = GetComponent.<Rigidbody>();

}

function Update () {

}

function OnCollisionStay(cInfo : Collision){
	for(var i = 0; i < cInfo.contacts.Length; i++){
		if(cInfo.rigidbody != null){
			var pointVel : Vector3 = rb.GetPointVelocity(cInfo.contacts[i].point);
			var mag : float = pointVel.magnitude;
			var normalMatrix : Matrix4x4 = Matrix4x4.TRS(Vector3.zero, Quaternion.LookRotation(cInfo.contacts[i].normal, Vector3.forward), Vector3.one);
			pointVel = normalMatrix.inverse.MultiplyVector(pointVel);
			pointVel.z = 0;
			pointVel = normalMatrix.MultiplyVector(pointVel);
			pointVel = pointVel.normalized * mag;

			if(cInfo.rigidbody.velocity.magnitude < pointVel.magnitude * velocityMagnitudeMul){
				cInfo.rigidbody.velocity = Vector3.Lerp(cInfo.rigidbody.velocity, pointVel * velocityMagnitudeMul, Time.deltaTime * velocityAcceleration);
				DebugUtility.DrawArrow(cInfo.rigidbody.position, pointVel * debugSize);
			}
		}
	}
}