// Upgrade NOTE: replaced 'mul(UNITY_MATRIX_MVP,*)' with 'UnityObjectToClipPos(*)'

Shader "Transparent/Hide/Hide FG6" {
Properties {
	//_Color ("Main Color", Color) = (1, 1, 1, 1)
	//_MainTex ("Base (RGB) Alpha (A)", 2D) = "white" {}
}

SubShader {
	Tags { "Queue"="Transparent+1" "IgnoreProjector"="True"}
	Lighting off
	
	// Render both front and back facing polygons.
	//Cull On
	
	// Second pass:
	//   render the semitransparent details.
	Pass {
		//Tags { "RequireOption" = "SoftVegetation" }
		
		// Dont write to the depth buffer
		ZWrite on
		
		//ColorMask On
		
		// Set up alpha blending
		Blend SrcAlpha OneMinusSrcAlpha
		
		CGPROGRAM
			#pragma vertex vert
			#pragma fragment frag
			
			#include "UnityCG.cginc"

			struct appdata_t {
				float4 vertex : POSITION;
				float4 color : COLOR;
			};

			struct v2f {
				float4 vertex : POSITION;
				float4 color : COLOR;
			};

			
			v2f vert (appdata_t v)
			{
				v2f o;
				o.vertex = UnityObjectToClipPos(v.vertex);
				o.color = v.color;
				return o;
			}
			
			//float4 _Color;
			half4 frag (v2f i) : COLOR
			{
				//half4 col = tex2D(_MainTex, i.texcoord);
				float4 transparent = float4(1,1,1,0);
				return transparent;// * _Color;
			}
		ENDCG
	}
}
}
