#pragma strict

function Start() {
 	System.GC.Collect();
 
      var tmp = new System.Object[2048];

    // make allocations in smaller blocks to avoid them to be treated in a special way, which is designed for large blocks
        for (var i : int = 0; i < 2048; i++)
        tmp[i] = new byte[2048];

    // release reference
        tmp = null;
}

function Update () {
	/*if (Time.frameCount % 30 == 0)
	{
		System.GC.Collect();
	}*/
}