#pragma strict


var bubbleEmit : ParticleEmitter;

var bubbleTrailSeparation : float = .3;
var bubbleBrightness : float = 0.7;

var lastBubblePos : Vector3[];
var rigidbodyList : Rigidbody[];
var underWaterScript : UnderWater[];

var waterAreasTimer : Timer;
var waterAreas : WaterArea[];
var getWaterObjectsTimer : Timer;

function Start () {
	GetWaterObjects();

	GetWaterAreas();
	
	bubbleEmit = GetComponent.<ParticleEmitter>();
	bubbleEmit.emit = false;

}

function Update () {
	waterAreasTimer.Update();
	if(waterAreasTimer.current){
		GetWaterAreas();
	}
	
	getWaterObjectsTimer.Update();
	if(getWaterObjectsTimer.current){
		GetWaterObjects();
	}

	for(var m = 0; m < rigidbodyList.Length; m++){
		if(rigidbodyList[m] == null){
			continue;
		}

		if(!underWaterScript[m].emitBubbles){
			continue;
		}

		if(underWaterScript[m].pickable != null){
			if(underWaterScript[m].pickable.beingPicked.current){
				continue;
			}
		}
		
		//Bubbles
		if( underWaterScript[m].isUnderwater.current ){
			if(Vector3.Distance( lastBubblePos[m],  rigidbodyList[m].position) > bubbleTrailSeparation){
				var newColor : Color = Color.white;
				newColor.a = 0.0;
				bubbleEmit.Emit( rigidbodyList[m].position+Vector3.up * Random.value, 
				rigidbodyList[m].velocity, Random.Range(.5,1.2), Random.Range(2,3), newColor);
				lastBubblePos[m] =  rigidbodyList[m].position;
				
				var newParticles : Particle[] = bubbleEmit.particles;
				newParticles[newParticles.Length-1].rotation = Random.value *360;
				bubbleEmit.particles = newParticles;
			}
			
		}
	}
	
	//Update bubbles.
	
	var particles : Particle[] = bubbleEmit.particles;
	for(var i = 0; i < particles.Length; i++){
		particles[i].energy -= Time.deltaTime;
		particles[i].velocity = Vector3.Lerp(particles[i].velocity,Vector3.up * .2, Time.deltaTime * 20.0);
		particles[i].rotation += Mathf.Sin(Time.time + particles[i].position.x)*Time.deltaTime * 15;
		particles[i].position += particles[i].velocity * Time.deltaTime;
		if(particles[i].energy > 1.0) particles[i].color.a += Time.deltaTime;
		else particles[i].color.a = particles[i].energy*.3;
		
		particles[i].color.a = Mathf.Min(particles[i].color.a,Mathf.Pow(particles[i].size* bubbleBrightness,2.5));
		
		for(var n = 0; n < waterAreas.Length; n++){
			if(!waterAreas[n].IsPointInWater(particles[i].position)){
				particles[i].color.a = 0.0;
				break;
			}
		}
		
		/*var surfaceDist : float = Mathf.Abs(particles[i].position.y - waterLevel);
		if(surfaceDist < .5)particles[i].color.a -= 1 - surfaceDist * 2.0;
		if(particles[i].position.y > waterLevel) particles[i].color.a = 0.0;*/
	}
	bubbleEmit.particles = particles;
}


function GetWaterAreas(){
	waterAreas = GameObject.FindObjectsOfType.<WaterArea>();
}

function GetWaterObjects(){
	underWaterScript = GameObject.FindObjectsOfType.<UnderWater>();
	rigidbodyList = new Rigidbody[underWaterScript.Length];
	
	for(var i = 0; i < underWaterScript.Length; i++){
		if(underWaterScript[i].transform.parent != null){
			rigidbodyList[i] = underWaterScript[i].transform.parent.GetComponent(Rigidbody);
		}
	}
	
	lastBubblePos = new Vector3[rigidbodyList.Length];

}