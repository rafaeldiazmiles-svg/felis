#pragma strict

static function BoundsContainsWithCenter(bounds : Bounds, point : Vector3, center : Vector3) : boolean{
	var contains : boolean;
	var bCenter : Vector3 = bounds.center;
	bounds.center += center;
	contains = bounds.Contains(point);
	bounds.center = bCenter;
	return contains;
}

static function BoundsContainsWithCenter(bounds : Bounds, point : Vector3, center : Transform) : boolean{
	var contains : boolean;
	var bCenter : Vector3 = bounds.center;
	bounds.center += center.position;
	contains = bounds.Contains(point);
	bounds.center = bCenter;
	return contains;
}

static function BoundsContainsWithCenterMultiple(bounds : Bounds[], point : Vector3, center : Vector3) : boolean{
	for(var i = 0; i < bounds.Length; i++){
		var bCenter : Vector3 = bounds[i].center;
		bounds[i].center += center;
		var thisContains : boolean = bounds[i].Contains(point);
		bounds[i].center = bCenter;
		if(thisContains){
			return true;
		}
	}
	return false;
}

class BoundsArray{
	var bounds : Bounds[];

	function Contains(point : Vector3){
		for(var i = 0; i < bounds.Length; i++){
			if(bounds[i].Contains(point)){
				return true;
			}
		}

		return false;
	}

	function ContainsWithCenter(point : Vector3, center : Vector3){
		return BoundsUtility.BoundsContainsWithCenterMultiple(bounds, point, center);
	}

	function DrawWireCubes(){
		for(var i = 0; i < bounds.Length; i++){
			if(bounds != null){
				Gizmos.DrawWireCube(bounds[i].center, bounds[i].size);
			}
		}
	}

	function DrawWireCubesWithCenter(center : Vector3){
		if(bounds != null){
			for(var i = 0; i < bounds.Length; i++){
				var bCenter : Vector3 = bounds[i].center;
				bounds[i].center += center;
				Gizmos.DrawWireCube(bounds[i].center, bounds[i].size);
				bounds[i].center = bCenter;

			}
		}
	}
}