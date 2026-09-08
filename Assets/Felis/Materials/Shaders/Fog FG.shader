// Upgrade NOTE: replaced 'mul(UNITY_MATRIX_MVP,*)' with 'UnityObjectToClipPos(*)'

Shader "Zerky Island/Fog" {
Properties {
	//_Color ("Main Color", Color) = (1, 1, 1, 1)
	_RaysTex ("Rays", 2D) = "white" {}
	//_RaysOverlapTex ("Rays Overlap", 2D) = "white" {}
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
				half4 texcoord : TEXCOORD0;
			};

			struct v2f {
				float4 vertex : POSITION;
				float4 color : COLOR;
				half4 texcoord : TEXCOORD0;
			};
			
			sampler2D _RaysTex;
			float4 _RaysTex_ST;
			
			//sampler2D _RaysOverlapTex;
			//float4 _RaysOverlapTex_ST; 
			
			v2f vert (appdata_t v)
			{
				v2f o;
				o.vertex = UnityObjectToClipPos(v.vertex);
				o.color = v.color;
				o.texcoord.xy = TRANSFORM_TEX(v.texcoord, _RaysTex);
				o.texcoord.zw = TRANSFORM_TEX(v.texcoord, _RaysTex);
				
				//o.texcoord.w -= fmod(sin(_Time*4) *0.1, 1.0) ;
				o.texcoord.x -= fmod(_Time* 1.0, 1.0) ;
				return o;
			}
			
			
			//float4 _Color;	
			half4 frag (v2f i) : COLOR
			{
				float4 col = tex2D(_RaysTex, i.texcoord.xy) * tex2D(_RaysTex, i.texcoord.zw);// * _Color;
				
				col.a *= i.color.a;
				return col;
				//return tex2D(_MainTex, i.texcoord);// * i.color;
			}
		ENDCG
	}

}
}
