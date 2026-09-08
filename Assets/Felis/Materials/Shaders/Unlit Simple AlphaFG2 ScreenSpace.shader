// Upgrade NOTE: replaced 'mul(UNITY_MATRIX_MVP,*)' with 'UnityObjectToClipPos(*)'

Shader "Transparent/Screen Space/Simple Unlit Alpha FG2 Screen Space" {
Properties {
	//_Color ("Main Color", Color) = (1, 1, 1, 1)
	_MainTex ("Base (RGB) Alpha (A)", 2D) = "white" {}
	_X ("X", Float) =  0.0
	_Y ("Y", Float) = 0.0
	_Width ("Width", Float) = 1
	_Height("Height", Float) = 1
}

SubShader {
	Tags { "Queue"="Transparent+2" "IgnoreProjector"="True"}
	Lighting off
	
	// Render both front and back facing polygons.
	//Cull Off
	
	// Second pass:
	//   render the semitransparent details.
	Pass {
		//Tags { "RequireOption" = "SoftVegetation" }
		
		// Dont write to the depth buffer
		ZWrite off
		
		// Set up alpha blending
		Blend SrcAlpha OneMinusSrcAlpha
		
		CGPROGRAM
			#pragma vertex vert
			#pragma fragment frag
			
			#include "UnityCG.cginc"

			uniform sampler2D _MainTex;
			uniform float4 _MainTex_ST;
			uniform float _X;
			uniform float _Y;
			uniform float _Width;
			uniform float _Height;

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


			
			v2f vert (appdata_t v)
			{
				v2f o;
				o.vertex = UnityObjectToClipPos(v.vertex);
				o.color = v.color;
				//o.texcoord = TRANSFORM_TEX(v.texcoord, _MainTex);
				o.texcoord = UnityObjectToClipPos(v.vertex);
				
				o.texcoord.x /= _Width;
				o.texcoord.y /= _Height;
				o.texcoord.x += _X;
				o.texcoord.y += _Y;
				
				return o;
			}
			
			float4 _Color;
			half4 frag (v2f i) : COLOR
			{
				half4 col = tex2D(_MainTex, i.texcoord.xy);
				return col;// * _Color;
			}
		ENDCG
	}
}
}
