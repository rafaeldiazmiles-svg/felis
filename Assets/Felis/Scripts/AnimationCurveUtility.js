#pragma strict

static function SetLinear(smoothCurve : AnimationCurve) : AnimationCurve{
 
  var linearCurve: AnimationCurve = new AnimationCurve();
  
    for (var i = 0; i < smoothCurve.keys.Length; i++)
    {
        var intangent: float = 0;
        var outtangent: float = 0;
        var intangent_set: boolean = false;
        var outtangent_set: boolean = false;
        var point1: Vector2;
        var point2: Vector2;
        var deltapoint: Vector2;
        var key: Keyframe = smoothCurve[i];
        
        if (i == 0){intangent = 0;intangent_set = true;}
        if (i == smoothCurve.keys.Length -1){outtangent = 0;outtangent_set = true;}
        
        if (!intangent_set)
        {
            point1.x = smoothCurve.keys[i-1].time;
            point1.y = smoothCurve.keys[i-1].value;
            point2.x = smoothCurve.keys[i].time;
            point2.y = smoothCurve.keys[i].value;
                
            deltapoint = point2-point1;
            
            intangent = deltapoint.y/deltapoint.x;
        }
        if (!outtangent_set)
        {
            point1.x = smoothCurve.keys[i].time;
            point1.y = smoothCurve.keys[i].value;
            point2.x = smoothCurve.keys[i+1].time;
            point2.y = smoothCurve.keys[i+1].value;
                
            deltapoint = point2-point1;
                
            outtangent = deltapoint.y/deltapoint.x;
        }
                
        key.inTangent = intangent;
        key.outTangent = outtangent;
        linearCurve.AddKey(key);
    }
    
    return linearCurve;	
}

static function GetLength(curve : AnimationCurve){
	return curve.keys[curve.keys.Length - 1].time;
}