// Upgrade NOTE: replaced 'mul(UNITY_MATRIX_MVP,*)' with 'UnityObjectToClipPos(*)'

// Upgrade NOTE: replaced '_Object2World' with 'unity_ObjectToWorld'

Shader "Zerky Island/Water Rays" {
Properties {
	_Color ("Main Color", Color) = (1, 1, 1, 1)
	_RaysTex ("Rays", 2D) = "white" {}
}

SubShader {
	Tags { "Queue"="Transparent-1" "IgnoreProjector"="True" "RenderType"="Transparent" }
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

			//sampler2D _MainTex;
			//float4 _MainTex_ST; 
			
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
				o.texcoord.x += fmod(_Time*.5, 1.0) ;
				o.texcoord.z -= fmod(_Time*.5, 1.0) ;
				float3 worldPos = mul (unity_ObjectToWorld, v.vertex).xyz;
				o.color.r *= clamp(worldPos.y * .05,0.2,1);
				o.color.g *= clamp(worldPos.y * .1 + 1,0.2,1);
				o.color.b *= clamp(worldPos.y * .07 + 1,0.4,1);
				//o.color.a *= -worldPos.y * .1 + 2;
				return o;
			}
			
			float4 _Color;
			
			//float4 _Color;
			half4 frag (v2f i) : COLOR
			{
				float4 col = i.color * _Color;
				float4 col2 = tex2D(_RaysTex, i.texcoord.zw);
				float4 col3 = tex2D(_RaysTex, i.texcoord.xy);
				
				col.a *= ((col2.a + col3.a) *.5) + _Color.a;
				//col.a += col2.a;
				//col.rgb += col2.rgb*col2.a;
					return col;
				//return tex2D(_MainTex, i.texcoord);// * i.color;
			}
		ENDCG
	}

}
}
