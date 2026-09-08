#pragma strict

static var arrowSize : float = .05;

static function DrawArrow(start : Vector3, dir : Vector3, color: Color, duration : float){
	if(dir == Vector3.zero) return;
	Debug.DrawRay(start, dir, color, duration);
	var arrowMatrix : Matrix4x4;
	arrowMatrix.SetTRS(start, Quaternion.LookRotation(dir), Vector3.one);
	
	Debug.DrawRay(start + dir, arrowMatrix.MultiplyVector(Vector3(arrowSize * dir.magnitude,0,-arrowSize* dir.magnitude)), color, duration);
	Debug.DrawRay(start + dir, arrowMatrix.MultiplyVector(Vector3(-arrowSize* dir.magnitude,0,-arrowSize* dir.magnitude)), color, duration); 
	Debug.DrawRay(start + dir, arrowMatrix.MultiplyVector(Vector3(0,arrowSize* dir.magnitude,-arrowSize* dir.magnitude)), color, duration);
	Debug.DrawRay(start + dir, arrowMatrix.MultiplyVector(Vector3(0,-arrowSize* dir.magnitude,-arrowSize* dir.magnitude)), color, duration); 
}

static function DrawArrow(start : Vector3, dir : Vector3, color: Color){
	if(dir == Vector3.zero) return;
	Debug.DrawRay(start, dir, color);
	var arrowMatrix : Matrix4x4;
	arrowMatrix.SetTRS(start, Quaternion.LookRotation(dir), Vector3.one);
	
	Debug.DrawRay(start + dir, arrowMatrix.MultiplyVector(Vector3(arrowSize* dir.magnitude,0,-arrowSize* dir.magnitude)), color);
	Debug.DrawRay(start + dir, arrowMatrix.MultiplyVector(Vector3(-arrowSize* dir.magnitude,0,-arrowSize* dir.magnitude)), color); 
	Debug.DrawRay(start + dir, arrowMatrix.MultiplyVector(Vector3(0,arrowSize* dir.magnitude,-arrowSize* dir.magnitude)), color);
	Debug.DrawRay(start + dir, arrowMatrix.MultiplyVector(Vector3(0,-arrowSize* dir.magnitude,-arrowSize* dir.magnitude)), color); 
}

static function DrawArrow(start : Vector3, dir : Vector3){
	if(dir == Vector3.zero) return;
	Debug.DrawRay(start, dir);
	var arrowMatrix : Matrix4x4;
	arrowMatrix.SetTRS(start, Quaternion.LookRotation(dir), Vector3.one);
	
	Debug.DrawRay(start + dir, arrowMatrix.MultiplyVector( Vector3(arrowSize * dir.magnitude,0,-arrowSize* dir.magnitude))  );
	Debug.DrawRay(start + dir, arrowMatrix.MultiplyVector( Vector3(-arrowSize* dir.magnitude,0,-arrowSize* dir.magnitude)) ); 
	Debug.DrawRay(start + dir, arrowMatrix.MultiplyVector( Vector3(0,arrowSize* dir.magnitude,-arrowSize* dir.magnitude))  );
	Debug.DrawRay(start + dir, arrowMatrix.MultiplyVector( Vector3(0,-arrowSize* dir.magnitude,-arrowSize* dir.magnitude)) );
}

///////////////////////////////////

static function DrawPoint(pointPosition : Vector3, size : float, color : Color, duration : float){
	Debug.DrawLine(pointPosition - Vector3.right * size*.5, pointPosition + Vector3.right * size*.5, color, duration);
	Debug.DrawLine(pointPosition - Vector3.up * size*.5, pointPosition + Vector3.up * size*.5, color, duration);
	Debug.DrawLine(pointPosition - Vector3.forward * size*.5, pointPosition + Vector3.forward * size*.5, color, duration);
}

static function DrawPoint(pointPosition : Vector3, size : float, color : Color){
	Debug.DrawLine(pointPosition - Vector3.right * size*.5, pointPosition + Vector3.right * size*.5, color);
	Debug.DrawLine(pointPosition - Vector3.up * size*.5, pointPosition + Vector3.up * size*.5, color);
	Debug.DrawLine(pointPosition - Vector3.forward * size*.5, pointPosition + Vector3.forward * size*.5, color);
}

static function DrawPoint(pointPosition : Vector3, size : float){
	Debug.DrawLine(pointPosition - Vector3.right * size*.5, pointPosition + Vector3.right * size*.5);
	Debug.DrawLine(pointPosition - Vector3.up * size*.5, pointPosition + Vector3.up * size*.5);
	Debug.DrawLine(pointPosition - Vector3.forward * size*.5, pointPosition + Vector3.forward * size*.5);
}

//////////////////////////////////

static function DrawGizmoPoint(pointPosition : Vector3, size : float){
	Gizmos.DrawLine(pointPosition - Vector3.right * size*.5, pointPosition + Vector3.right * size*.5);
	Gizmos.DrawLine(pointPosition - Vector3.up * size*.5, pointPosition + Vector3.up * size*.5);
	Gizmos.DrawLine(pointPosition - Vector3.forward * size*.5, pointPosition + Vector3.forward * size*.5);	
}


static function DrawCircle(center : Vector3, radius : float, axis : Vector3){
	var circleMatrix : Matrix4x4;
	if(axis != Vector3.up && axis != Vector3.down){
		circleMatrix.SetTRS(center, Quaternion.LookRotation(axis, Vector3.Cross(axis, Vector3.up)), Vector3.one);
	}
	else{
		circleMatrix.SetTRS(center, Quaternion.LookRotation(axis, Vector3.Cross(axis, Vector3.forward)), Vector3.one);
	}
	var points : float = 20;
	for(var i = 0; i < points; i++){
		var thisPoint : Vector3 = Vector3(Mathf.Cos(i * (360.0 / points) * Mathf.Deg2Rad ) , Mathf.Sin(i * (360.0 / points) * Mathf.Deg2Rad),0);
		var nextPoint : Vector3 = Vector3(Mathf.Cos((i+1) * (360.0 / points) * Mathf.Deg2Rad), Mathf.Sin((i+1) * (360.0 / points) * Mathf.Deg2Rad),0);
		thisPoint *= radius;
		nextPoint *= radius;
		thisPoint = circleMatrix.MultiplyPoint(thisPoint);
		nextPoint = circleMatrix.MultiplyPoint(nextPoint);
		Debug.DrawLine(thisPoint,nextPoint);

	}
}

static function DrawCircle(center : Vector3, radius : float, axis : Vector3, color : Color){
	var circleMatrix : Matrix4x4;
	if(axis != Vector3.up && axis != Vector3.down){
		circleMatrix.SetTRS(center, Quaternion.LookRotation(axis, Vector3.Cross(axis, Vector3.up)), Vector3.one);
	}
	else{
		circleMatrix.SetTRS(center, Quaternion.LookRotation(axis, Vector3.Cross(axis, Vector3.forward)), Vector3.one);
	}
	var points : float = 20;
	for(var i = 0; i < points; i++){
		var thisPoint : Vector3 = Vector3(Mathf.Cos(i * (360.0 / points) * Mathf.Deg2Rad ) , Mathf.Sin(i * (360.0 / points) * Mathf.Deg2Rad),0);
		var nextPoint : Vector3 = Vector3(Mathf.Cos((i+1) * (360.0 / points) * Mathf.Deg2Rad), Mathf.Sin((i+1) * (360.0 / points) * Mathf.Deg2Rad),0);
		thisPoint *= radius;
		nextPoint *= radius;
		thisPoint = circleMatrix.MultiplyPoint(thisPoint);
		nextPoint = circleMatrix.MultiplyPoint(nextPoint);
		Debug.DrawLine(thisPoint,nextPoint,color);
	}
}

static function DrawCircle(center : Vector3, radius : float, axis : Vector3, color : Color, points : float){
	var circleMatrix : Matrix4x4;
	if(axis != Vector3.up && axis != Vector3.down){
		circleMatrix.SetTRS(center, Quaternion.LookRotation(axis, Vector3.Cross(axis, Vector3.up)), Vector3.one);
	}
	else{
		circleMatrix.SetTRS(center, Quaternion.LookRotation(axis, Vector3.Cross(axis, Vector3.forward)), Vector3.one);
	}
	for(var i = 0; i < points; i++){
		var thisPoint : Vector3 = Vector3(Mathf.Cos(i * (360.0 / points) * Mathf.Deg2Rad ) , Mathf.Sin(i * (360.0 / points) * Mathf.Deg2Rad),0);
		var nextPoint : Vector3 = Vector3(Mathf.Cos((i+1) * (360.0 / points) * Mathf.Deg2Rad), Mathf.Sin((i+1) * (360.0 / points) * Mathf.Deg2Rad),0);
		thisPoint *= radius;
		nextPoint *= radius;
		thisPoint = circleMatrix.MultiplyPoint(thisPoint);
		nextPoint = circleMatrix.MultiplyPoint(nextPoint);
		Debug.DrawLine(thisPoint,nextPoint,color);
	}
}


	/*void DrawCircle(Vector3 center, float radius, Vector3 axis, Color color, int points){
		Matrix4x4 circleMatrix = new Matrix4x4();
		axis.Normalize ();
		if(axis != Vector3.up && axis != Vector3.down){
			circleMatrix.SetTRS(center, Quaternion.LookRotation(axis, Vector3.Cross(axis, Vector3.up)), Vector3.one);
		}
		else{
			circleMatrix.SetTRS(center, Quaternion.LookRotation(axis, Vector3.Cross(axis, Vector3.forward)), Vector3.one);
		}
		for(int i = 0; i < points; i++){
			Vector3 thisPoint = new Vector3(Mathf.Cos(i * (360.0f / points) * Mathf.Deg2Rad ) , Mathf.Sin(i * (360.0f / points) * Mathf.Deg2Rad),0);
			Vector3 nextPoint = new Vector3(Mathf.Cos((i+1) * (360.0f / points) * Mathf.Deg2Rad), Mathf.Sin((i+1) * (360.0f / points) * Mathf.Deg2Rad),0);
			thisPoint *= radius;
			nextPoint *= radius;
			thisPoint = circleMatrix.MultiplyPoint(thisPoint);
			nextPoint = circleMatrix.MultiplyPoint(nextPoint);
			Debug.DrawLine(thisPoint,nextPoint,color);
		}
	}*/