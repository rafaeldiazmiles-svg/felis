#pragma strict
@Header("-------------Input---------------")
var additive : boolean;
var rotation : Vector3;

@Header("-------------Values---------------")
var addRot : Vector3;

function Start () {

}

function Update () {
    if(additive){
        addRot += rotation * Time.deltaTime;
        transform.rotation *= Quaternion.Euler(addRot * Time.deltaTime); 
    }
    else{
        transform.rotation *= Quaternion.Euler(rotation * Time.deltaTime); 
    }
   
}