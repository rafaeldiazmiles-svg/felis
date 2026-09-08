// Upgrade NOTE: replaced 'mul(UNITY_MATRIX_MVP,*)' with 'UnityObjectToClipPos(*)'

// Upgrade NOTE: replaced '_Object2World' with 'unity_ObjectToWorld'

Shader "Zerky Island/Island Water Waves" {
Properties {
	//_Color ("Main Color", Color) = (1, 1, 1, 1)
	_MainTex ("Base", 2D) = "white" {}
	_Overlay ("Overlay", 2D) = "white" {}
	_ScrollSpeed ("Scroll Speed", Vector) = (0,0,0,0)
	_Fog ("Fog", float) = 0
	
}

SubShader {
	Tags { "Queue"="AlphaTest-5" "IgnoreProjector"="True"}
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

			struct appdata_t {
				float4 vertex : POSITION;
				float4 color : COLOR;
				float4 texcoord : TEXCOORD0;
			};

			struct v2f {
				float4 vertex : POSITION;
				float4 color : COLOR;
				float4 texcoord : TEXCOORD0;
				float4 pos : TEXCOORD1;
			};

			sampler2D _MainTex;
			float4 _MainTex_ST;
			
			sampler2D _Overlay;
			float4 _Overlay_ST;
			
			float4 _ScrollSpeed;

			float _Fog;
									
			v2f vert (appdata_t v)
			{
				v2f o;
				o.vertex = UnityObjectToClipPos(v.vertex);
				o.color = v.color;
				o.texcoord.xy = TRANSFORM_TEX(v.texcoord, _MainTex);
				o.texcoord.zw = TRANSFORM_TEX(v.texcoord, _Overlay);
				
				//o.texcoord.x -= fmod(_Time* _ScrollSpeed.x, 1.0) ;
				//o.texcoord.y -= fmod(_Time* _ScrollSpeed.y, 1.0) ;
				o.texcoord.z -= fmod(_Time* _ScrollSpeed.z, 1.0) ;
				o.texcoord.w -= fmod(_Time* _ScrollSpeed.w, 1.0) ;
				
				o.pos = mul(unity_ObjectToWorld, v.vertex);
				
				return o;
			}
			
			//float4 _Color;
			half4 frag (v2f i) : COLOR
			{
				//float dist = distance(_WorldSpaceCameraPos, mul(_Object2World, i.pos));
				half4 col = tex2D(_MainTex, i.texcoord.xy);
				col.a *= i.color.r;
				half4 col2 = tex2D(_Overlay, i.texcoord.zw);
				col2.a *= i.color.a;
				col += col2 * col2.a;
				return col;// * _Color;
			}
		ENDCG
	}
}
}
