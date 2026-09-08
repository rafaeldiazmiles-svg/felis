#pragma strict



function Start () {
	var rideGauge : RideGauge = GameObject.FindObjectOfType.<RideGauge>();
	if(rideGauge != null){
		rideGauge.SetRideGauge(true);
	}
}
