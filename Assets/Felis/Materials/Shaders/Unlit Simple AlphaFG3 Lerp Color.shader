// Upgrade NOTE: replaced 'mul(UNITY_MATRIX_MVP,*)' with 'UnityObjectToClipPos(*)'

Shader "Transparent/Simple Unlit Alpha FG3 Lerp Color" {
Properties {
	_Color ("Main Color", Color) = (1, 1, 1, 1)
	_MainTex ("Base (RGB) Alpha (A)", 2D) = "white" {}
}

SubShader {
	Tags { "Queue"="Transparent+3" "IgnoreProjector"="True"}
	Lighting off
	
	// Render both front and back facing polygons.
	//Cull Off
	
	// Second pass:
	//   render the semitransparent details.
	Pass {
		Stencil 
		{
			Ref 1
			Comp notequal
			Pass keep
			Fail keep
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
				float2 texcoord : TEXCOORD0;
			};

			struct v2f {
				float4 vertex : POSITION;
				float4 color : COLOR;
				float2 texcoord : TEXCOORD0;
			};

			sampler2D _MainTex;
			float4 _MainTex_ST;
			
			v2f vert (appdata_t v)
			{
				v2f o;
				o.vertex = UnityObjectToClipPos(v.vertex);
				o.color = v.color;
				o.texcoord = TRANSFORM_TEX(v.texcoord, _MainTex);
				return o;
			}
			
			float4 _Color;
			half4 frag (v2f i) : COLOR
			{
				half4 col = tex2D(_MainTex, i.texcoord);
				col.rgb = lerp(col.rgb, _Color.rgb, _Color.a);
				return col; //* _Color;
			}
		ENDCG
	}
}
}
