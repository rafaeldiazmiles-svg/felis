#pragma strict

static function ApplyForceForPointVelocity(targetRigidbody : Rigidbody, desiredVelocity : Vector3, forceMuliplier : float, point : Vector3){
	var force : Vector3 = desiredVelocity - targetRigidbody.GetPointVelocity(point);
	
	//Don't reduce velocity.
	if(targetRigidbody.velocity != 0){
		if(Mathf.Sign(desiredVelocity.x) == Mathf.Sign(targetRigidbody.velocity.x) && Mathf.Abs(desiredVelocity.x) < Mathf.Abs(targetRigidbody.velocity.x)) force.x = 0;
		if(Mathf.Sign(desiredVelocity.y) == Mathf.Sign(targetRigidbody.velocity.y) && Mathf.Abs(desiredVelocity.y) < Mathf.Abs(targetRigidbody.velocity.y)) force.y = 0;
		if(Mathf.Sign(desiredVelocity.z) == Mathf.Sign(targetRigidbody.velocity.z) && Mathf.Abs(desiredVelocity.z) < Mathf.Abs(targetRigidbody.velocity.z)) force.z = 0;
	}
				
	force *= forceMuliplier;
	
	targetRigidbody.AddForceAtPosition(force, point);
}


static function ApplyForceForVelocity(targetRigidbody : Rigidbody, desiredVelocity : Vector3, forceMuliplier : float, curve : float){
	var force : Vector3 = desiredVelocity - targetRigidbody.velocity;
	
	if(targetRigidbody.velocity != 0){
		if(Mathf.Sign(desiredVelocity.x) == Mathf.Sign(targetRigidbody.velocity.x) && Mathf.Abs(desiredVelocity.x) < Mathf.Abs(targetRigidbody.velocity.x)) force.x = 0;
		if(Mathf.Sign(desiredVelocity.y) == Mathf.Sign(targetRigidbody.velocity.y) && Mathf.Abs(desiredVelocity.y) < Mathf.Abs(targetRigidbody.velocity.y)) force.y = 0;
		if(Mathf.Sign(desiredVelocity.z) == Mathf.Sign(targetRigidbody.velocity.z) && Mathf.Abs(desiredVelocity.z) < Mathf.Abs(targetRigidbody.velocity.z)) force.z = 0;
	}
	
	force *= forceMuliplier;
	
	force.x = Mathf.Pow(Mathf.Abs(force.x), curve) * Mathf.Sign(force.x);
	force.y = Mathf.Pow(Mathf.Abs(force.y), curve) * Mathf.Sign(force.y);
	force.z = Mathf.Pow(Mathf.Abs(force.z), curve) * Mathf.Sign(force.z);
	
	targetRigidbody.AddForce(force);
}

static function ApplyForceForVelocity(targetRigidbody : Rigidbody, desiredVelocity : Vector3, forceMuliplier : float){
	var force : Vector3 = desiredVelocity - targetRigidbody.velocity;

	if(targetRigidbody.velocity != 0){
		if(Mathf.Sign(desiredVelocity.x) == Mathf.Sign(targetRigidbody.velocity.x) && Mathf.Abs(desiredVelocity.x) < Mathf.Abs(targetRigidbody.velocity.x)) force.x = 0;
		if(Mathf.Sign(desiredVelocity.y) == Mathf.Sign(targetRigidbody.velocity.y) && Mathf.Abs(desiredVelocity.y) < Mathf.Abs(targetRigidbody.velocity.y)) force.y = 0;
		if(Mathf.Sign(desiredVelocity.z) == Mathf.Sign(targetRigidbody.velocity.z) && Mathf.Abs(desiredVelocity.z) < Mathf.Abs(targetRigidbody.velocity.z)) force.z = 0;
	}
				
	force *= forceMuliplier;
	
	targetRigidbody.AddForce(force);
}

static function GetForceForVelocity(currentVelocity : Vector3, desiredVelocity : Vector3, forceMuliplier : float, curve : float) : Vector3{
	var force : Vector3 = desiredVelocity - currentVelocity;

	if(Mathf.Sign(desiredVelocity.x) == Mathf.Sign(currentVelocity.x) && Mathf.Abs(desiredVelocity.x) > Mathf.Abs(currentVelocity.x)) force.x = 0;
	if(Mathf.Sign(desiredVelocity.y) == Mathf.Sign(currentVelocity.y) && Mathf.Abs(desiredVelocity.y) > Mathf.Abs(currentVelocity.y)) force.y = 0;
	if(Mathf.Sign(desiredVelocity.z) == Mathf.Sign(currentVelocity.z) && Mathf.Abs(desiredVelocity.z) > Mathf.Abs(currentVelocity.z)) force.z = 0;

	force *= forceMuliplier;
	
	force.x = Mathf.Pow(Mathf.Abs(force.x), curve) * Mathf.Sign(force.x);
	force.y = Mathf.Pow(Mathf.Abs(force.y), curve) * Mathf.Sign(force.y);
	force.z = Mathf.Pow(Mathf.Abs(force.z), curve) * Mathf.Sign(force.z);
	
	return force;
}

static function GetForceForVelocity(currentVelocity : Vector3, desiredVelocity : Vector3, forceMuliplier : float) : Vector3{
	var force : Vector3 = desiredVelocity - currentVelocity;

	if(Mathf.Sign(desiredVelocity.x) == Mathf.Sign(currentVelocity.x) && Mathf.Abs(desiredVelocity.x) > Mathf.Abs(currentVelocity.x)) force.x = 0;
	if(Mathf.Sign(desiredVelocity.y) == Mathf.Sign(currentVelocity.y) && Mathf.Abs(desiredVelocity.y) > Mathf.Abs(currentVelocity.y)) force.y = 0;
	if(Mathf.Sign(desiredVelocity.z) == Mathf.Sign(currentVelocity.z) && Mathf.Abs(desiredVelocity.z) > Mathf.Abs(currentVelocity.z)) force.z = 0;
			
	force *= forceMuliplier;
	
	return force;
}

////////////////////////////////////////////

static function ApplyForceForXVelocity(targetRigidbody : Rigidbody, desiredVelocity : float, forceMuliplier : float, curve : float){
	var force : float = desiredVelocity - targetRigidbody.velocity.x;
	
	force *= forceMuliplier;
	
	force = Mathf.Pow(Mathf.Abs(force), curve) * Mathf.Sign(force);
	
	targetRigidbody.AddForce(Vector3.right * force);
}

static function ApplyForceForYVelocity(targetRigidbody : Rigidbody, desiredVelocity : float, forceMuliplier : float, curve : float){
	var force : float = desiredVelocity - targetRigidbody.velocity.y;
	
	force *= forceMuliplier;
	
	force = Mathf.Pow(Mathf.Abs(force), curve) * Mathf.Sign(force);
	
	targetRigidbody.AddForce(Vector3.up* force);
}

static function ApplyForceForZVelocity(targetRigidbody : Rigidbody, desiredVelocity : float, forceMuliplier : float, curve : float){
	var force : float = desiredVelocity - targetRigidbody.velocity.z;
	
	force *= forceMuliplier;
	
	force = Mathf.Pow(Mathf.Abs(force), curve) * Mathf.Sign(force);
	
	targetRigidbody.AddForce(Vector3.forward * force);
}

static function ApplyForceForXVelocity(targetRigidbody : Rigidbody, desiredVelocity : float, forceMuliplier : float){
	var force : float = desiredVelocity - targetRigidbody.velocity.x;
	
	force *= forceMuliplier;
	
	targetRigidbody.AddForce(Vector3.right * force);
}

static function ApplyForceForYVelocity(targetRigidbody : Rigidbody, desiredVelocity : float, forceMuliplier : float){
	var force : float = desiredVelocity - targetRigidbody.velocity.y;
	
	force *= forceMuliplier;
	
	targetRigidbody.AddForce(Vector3.up* force);
}

static function ApplyForceForZVelocity(targetRigidbody : Rigidbody, desiredVelocity : float, forceMuliplier : float){
	var force : float = desiredVelocity - targetRigidbody.velocity.z;
	
	force *= forceMuliplier;
	
	targetRigidbody.AddForce(Vector3.forward * force);
}

////////////////////////////////////////////

static function GetForceForXVelocity(targetRigidbody : Rigidbody, desiredVelocity : float, forceMuliplier : float, curve : float) : float{
	var force : float = desiredVelocity - targetRigidbody.velocity.x;
	
	force *= forceMuliplier;
	
	force = Mathf.Pow(Mathf.Abs(force), curve) * Mathf.Sign(force);
	
	return force;
}

static function GetForceForYVelocity(targetRigidbody : Rigidbody, desiredVelocity : float, forceMuliplier : float, curve : float) : float{
	var force : float = desiredVelocity - targetRigidbody.velocity.y;
	
	force *= forceMuliplier;
	
	force = Mathf.Pow(Mathf.Abs(force), curve) * Mathf.Sign(force);
	
	return force;
}

static function GetForceForZVelocity(targetRigidbody : Rigidbody, desiredVelocity : float, forceMuliplier : float, curve : float) : float{
	var force : float = desiredVelocity - targetRigidbody.velocity.z;
	
	force *= forceMuliplier;
	
	force = Mathf.Pow(Mathf.Abs(force), curve) * Mathf.Sign(force);
	
	return force;
}

static function GetForceForXVelocity(targetRigidbody : Rigidbody, desiredVelocity : float, forceMuliplier : float) : float{
	var force : float = desiredVelocity - targetRigidbody.velocity.x;
	
	force *= forceMuliplier;
	
	return force;
}

static function GetForceForYVelocity(targetRigidbody : Rigidbody, desiredVelocity : float, forceMuliplier : float) : float{
	var force : float = desiredVelocity - targetRigidbody.velocity.y;
	
	force *= forceMuliplier;
	
	return force;
}

static function GetForceForZVelocity(targetRigidbody : Rigidbody, desiredVelocity : float, forceMuliplier : float) : float{
	var force : float = desiredVelocity - targetRigidbody.velocity.z;
	
	force *= forceMuliplier;
	
	return force;
}


///////



static function ApplyForceForPosition(targetRigidbody : Rigidbody, targetPosition : Vector3, forceMuliplier : float){
	var force : Vector3 = (targetPosition - targetRigidbody.position) * forceMuliplier;
	
	targetRigidbody.AddForce(force);
}

static function ApplyForceForPosition(targetRigidbody : Rigidbody, targetPosition : Vector3, forceMuliplier : float, curve : float){
	var force : Vector3 = (targetPosition - targetRigidbody.position) * forceMuliplier;
	
	force.x = Mathf.Pow(Mathf.Abs(force.x), curve) * Mathf.Sign(force.x);
	force.y = Mathf.Pow(Mathf.Abs(force.y), curve) * Mathf.Sign(force.y);
	force.z = Mathf.Pow(Mathf.Abs(force.z), curve) * Mathf.Sign(force.z);
	
	targetRigidbody.AddForce(force);
}