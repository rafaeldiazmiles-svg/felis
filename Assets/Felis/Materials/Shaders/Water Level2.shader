// Upgrade NOTE: replaced 'mul(UNITY_MATRIX_MVP,*)' with 'UnityObjectToClipPos(*)'

// Upgrade NOTE: replaced '_Object2World' with 'unity_ObjectToWorld'

Shader "Zerky Island/Water Level 2" {
Properties {
	//_Color ("Main Color", Color) = (1, 1, 1, 1)
	_MainTex ("Base (RGB) Alpha (A)", 2D) = "white" {}
	_Cutoff ("Base Alpha cutoff", Range (0,.9)) = .5
	_WaterLevel("Water Level", float) = 1.0
	_Fade(" Fade", float) = 1.0
}

SubShader {
	Tags {"Queue"="Transparent+3" "IgnoreProjector"="True" "RenderType"="TransparentCutout" }
	Lighting off
	
	// Render both front and back facing polygons.
	//Cull Off
	
	// first pass:
	//   render any pixels that are more than [_Cutoff] opaque

	// Second pass:
	//   render the semitransparent details.
	Pass {
		Tags { "RequireOption" = "SoftVegetation" }
		
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
				float2 texcoord : TEXCOORD0;
				float4 worldPos : TEXCOORD1;
			};

			struct v2f {
				float4 vertex : POSITION;
				float4 color : COLOR;
				float2 texcoord : TEXCOORD0;
				float4 worldPos : TEXCOORD1;
			};

			sampler2D _MainTex;
			float4 _MainTex_ST;
			float _Cutoff;
			float _WaterLevel;
			float _Fade;
			
			v2f vert (appdata_t v)
			{
				v2f o;
				o.vertex = UnityObjectToClipPos(v.vertex);
				o.color = v.color;
				o.texcoord = TRANSFORM_TEX(v.texcoord, _MainTex);
				o.worldPos = mul(unity_ObjectToWorld, v.vertex);
				return o;
			}
			
			//float4 _Color;
			half4 frag (v2f i) : COLOR
			{
				half4 col = tex2D(_MainTex, i.texcoord);
				//if(i.worldPos.y < _WaterLevel) col.a = 0;
				col.a = clamp(col.a + i.worldPos.y * _Fade + _WaterLevel,0,1) * col.a; 
				//clip(-(col.a - _Cutoff));
				return col;
			}
		ENDCG
	}
}
}
