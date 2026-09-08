// Upgrade NOTE: replaced 'mul(UNITY_MATRIX_MVP,*)' with 'UnityObjectToClipPos(*)'

Shader "Zerky Island/Loading Over Spiral" {
	Properties {
		_MainTex ("Base (RGB)", 2D) = "white" {}
		//_Color ("Color", Color) = (1,1,1,1)
	}
	SubShader {
		Tags { "Queue"="Overlay+13" "RenderType"="Transparent" }
		Lighting off
		
		Pass{
			Stencil 
			{
				Ref 3
				Comp equal
				Pass keep
				Fail keep
			}	
		
			Blend SrcAlpha OneMinusSrcAlpha
			
			zwrite off
																					
			CGPROGRAM
			#pragma vertex vert
			#pragma fragment frag
			#include "UnityCG.cginc"
			
			sampler2D _MainTex;
			float4 _MainTex_ST;
			//float4 _Color;
			
				struct vertexInput  {
					float4 pos : POSITION;
					float2 texcoord : TEXCOORD0;
					//float4 color : COLOR;
				};

				struct vertexOutput  {
					float4 pos : POSITION;
					float2 texcoord : TEXCOORD0; 
					//float4 color : COLOR; 
				};
				
				vertexOutput vert (vertexInput input){
					vertexOutput output;
					//output.color = input.color;
					output.pos = UnityObjectToClipPos(input.pos);
					output.texcoord = TRANSFORM_TEX(input.texcoord, _MainTex);
					return output;
				}
				
				half4 frag (vertexOutput input) : COLOR
				{
				
					half4 col = tex2D(_MainTex, input.texcoord); 

					return col;// * _Color;
	
				}
				
			ENDCG
		}
	} 
	FallBack "Diffuse"
}
