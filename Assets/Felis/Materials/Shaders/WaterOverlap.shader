// Upgrade NOTE: replaced 'mul(UNITY_MATRIX_MVP,*)' with 'UnityObjectToClipPos(*)'

Shader "Zerky Island/Water Overlap " {
Properties {
	//_Color ("Main Color", Color) = (1, 1, 1, 1)
	_MainTex ("Base (RGB) Alpha (A)", 2D) = "white" {}
	//_OverlapTex ("Overlap", 2D) = "white" {}
	//_Scroll ("Scroll", Range (0,1)) = .5
}

SubShader {
	Tags { "Queue"="Transparent" "IgnoreProjector"="True" "RenderType"="Transparent" }
	Lighting off
	
	ZWrite off
	Blend SrcAlpha OneMinusSrcAlpha

	Pass {  
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
			};

			sampler2D _MainTex;
			float4 _MainTex_ST;
			
			//sampler2D _OverlapTex;
			// _OverlapTex_ST;
			
			v2f vert (appdata_t v) 
			{
				v2f o;
				o.vertex = UnityObjectToClipPos(v.vertex);
				o.color = v.color;
				o.texcoord.xy = TRANSFORM_TEX(v.texcoord, _MainTex);
				o.texcoord.zw = TRANSFORM_TEX(v.texcoord, _MainTex);
				o.texcoord.y += fmod(_Time, 1.0) ;
				o.texcoord.w -= fmod(_Time, 1.0) ;
				o.texcoord.z -= fmod(sin(_Time*30) *0.1, 1.0) ;
				o.texcoord.x -= 1 - fmod(sin(_Time*30) *0.1, 1.0) ;
				return o;
			}
			
			//float4 _Color;
			half4 frag (v2f i) : COLOR
			{
				float4 col = tex2D(_MainTex, i.texcoord.xy);
				float4 col2 =tex2D(_MainTex, i.texcoord.zw);
				
				col.a *= i.color.a;
				col2.a *= i.color.a;
				return col * col2;
			}
		ENDCG
	}

}
}
