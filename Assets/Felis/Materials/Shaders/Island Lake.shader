// Upgrade NOTE: replaced 'mul(UNITY_MATRIX_MVP,*)' with 'UnityObjectToClipPos(*)'

Shader "Zerky Island/Island Lake" {
Properties {
	//_Color ("Main Color", Color) = (1, 1, 1, 1)
	_MainTex ("Base (RGB) Alpha (A)", 2D) = "white" {}
	_LakeWaves ("Lake Waves", 2D) = "white" {}
	
	_WaveSpeed("Wave Speed", Float) = 1
}

SubShader {
	Tags { "Queue"="AlphaTest-3" "RenderType"="Transparent"}
	Lighting off
	
	// Render both front and back facing polygons.
	//Cull Off
	
	// Second pass:
	//   render the semitransparent details.
	Pass {
		Stencil 
		{
			Ref 1
			Comp always
			Pass replace
		}
		//Tags { "RequireOption" = "SoftVegetation" }
		
		// Dont write to the depth buffer
		ZWrite off
		
		// Set up alpha blending
		Blend SrcAlpha OneMinusSrcAlpha
		
		CGPROGRAM
			#pragma vertex vert
			#pragma fragment frag
			
			#include "UnityCG.cginc"

			struct appdata_t {
				float4 vertex : POSITION; 
				float4 color : COLOR;
				float4 texcoord : TEXCOORD0;
			};

			struct v2f {
				//float4 pos : SV_POSITION;
				
				float4 vertex : POSITION;
				float4 color : COLOR;
				float4 texcoord : TEXCOORD0;
			};

				sampler2D _MainTex;
			float4 _MainTex_ST;
			
			sampler2D _LakeWaves;
			float4 _LakeWaves_ST;
			
			float _WaveSpeed;
			
	
			v2f vert (appdata_t v)
			{
				v2f o;
				o.vertex = UnityObjectToClipPos(v.vertex);
				o.color = v.color;
				o.texcoord.xy = TRANSFORM_TEX(v.texcoord, _MainTex);
				
				o.texcoord.zw = TRANSFORM_TEX(v.texcoord, _LakeWaves);
				o.texcoord.z += fmod(_Time* _WaveSpeed, 1.0) ;

				return o;
			}
			
			//float4 _Color;
			half4 frag (v2f i) : COLOR
			{
	
				half4 col = tex2D(_MainTex, i.texcoord.xy);
				if (col.a<0.1) discard;  

				half4 waves =  tex2D(_LakeWaves, i.texcoord.zw);
				waves.a *= col .a;
				col += waves.a;
				return col;
			}
		ENDCG
	}
}
}
