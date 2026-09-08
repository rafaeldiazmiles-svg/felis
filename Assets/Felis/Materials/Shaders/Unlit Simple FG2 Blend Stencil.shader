// Upgrade NOTE: replaced 'mul(UNITY_MATRIX_MVP,*)' with 'UnityObjectToClipPos(*)'

Shader "Transparent/Clip/Simple Unlit FG2 Blend Stencil" {
Properties {
	_Color ("Main Color", Color) = (1, 1, 1, 1)
	_MainTex ("Base (RGB) Alpha (A)", 2D) = "white" {}
	_BlendTex ("Blend (RGB) Alpha (A)", 2D) = "white" {}
	_Cutoff ("Base Alpha cutoff", Range (0,.9)) = .5
	_Lerp ("Lerp", Range(0,1.0)) = 0
}

SubShader {
	Tags { "Queue"="Transparent+2" "IgnoreProjector"="True" "RenderType"="TransparentCutout" }
	Lighting off
	
	// Render both front and back facing polygons.
	//Cull Off
	
	// first pass:
	//   render any pixels that are more than [_Cutoff] opaque
	Pass {
		Stencil 
		{
			Ref 1
			Comp notequal
			Pass keep
			Fail keep
		} 	  
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
			sampler2D _BlendTex;
			float4 _BlendTex_ST;
			float _Cutoff;
			float _Lerp;
			
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
				half4 col2 = tex2D(_BlendTex, i.texcoord);
				clip(col.a - _Cutoff);
				//clip(col2.a - _Cutoff);
				return lerp(col, col2, _Lerp) * _Color;
				//return col2;
			}
		ENDCG
	}

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
			};

			struct v2f {
				float4 vertex : POSITION;
				float4 color : COLOR;
				float2 texcoord : TEXCOORD0;
			};

			sampler2D _MainTex;
			float4 _MainTex_ST;
			sampler2D _BlendTex;
			float4 _BlendTex_ST;
			float _Cutoff;
			float _Lerp;
			
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
				half4 col2 = tex2D(_BlendTex, i.texcoord);
				clip(-(col.a - _Cutoff));
				//clip(-(col2.a - _Cutoff));
				//return col2;
				return lerp(col, col2, _Lerp) * _Color;
			}
		ENDCG
	}
}
}
