// Upgrade NOTE: replaced 'mul(UNITY_MATRIX_MVP,*)' with 'UnityObjectToClipPos(*)'

Shader "Blend/Blend 4 textures" {
Properties {
	_Color ("Main Color", Color) = (1, 1, 1, 1)
	_Blend1 ("Base (RGB) Alpha (A)", 2D) = "white" {}
	_Blend2 ("Blend (RGB) Alpha (A)", 2D) = "white" {}
	_Blend3 ("Blend (RGB) Alpha (A)", 2D) = "white" {}
	_Blend4 ("Blend (RGB) Alpha (A)", 2D) = "white" {}
	_Lerp1 ("Lerp1", Range(0,1.0)) = 0
	_Lerp2 ("Lerp2", Range(0,1.0)) = 0
	_Lerp3 ("Lerp3", Range(0,1.0)) = 0
	_Lerp4 ("Lerp4", Range(0,1.0)) = 0
}

SubShader {
	Tags { "Queue"="Transparent+2" "IgnoreProjector"="True" "RenderType"="TransparentCutout" }
	Lighting off

	// first pass:
	Pass {
		Stencil 
		{
			Ref 1
			Comp notequal
			Pass keep
			Fail keep
		} 	 
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

			sampler2D _Blend1;
			float4 _Blend1_ST;
			sampler2D _Blend2;
			float4 _Blend2_ST;
			sampler2D _Blend3;
			float4 _Blend3_ST;
			sampler2D _Blend4;
			float4 _Blend4_ST;
			float _Lerp1;
			float _Lerp2;
			float _Lerp3;
			float _Lerp4;
						
			v2f vert (appdata_t v)
			{
				v2f o;
				o.vertex = UnityObjectToClipPos(v.vertex);
				o.color = v.color;
				o.texcoord = TRANSFORM_TEX(v.texcoord, _Blend1);
				return o;
			}
			
			float4 _Color;
			half4 frag (v2f i) : COLOR
			{
				half4 col = _Color;


				half4 col1 = tex2D(_Blend1, i.texcoord);
				half4 col2 = tex2D(_Blend2, i.texcoord);
				half4 col3 = tex2D(_Blend3, i.texcoord);
				half4 col4 = tex2D(_Blend4, i.texcoord);

				if(_Lerp4 < 1){
					if(_Lerp3 < 1){
							if(_Lerp2 < 1){
								col = lerp(col, col1, _Lerp1) * _Color;
							}
						col = lerp(col, col2, _Lerp2) * _Color;
					}
					col = lerp(col, col3, _Lerp3) * _Color;
				}

				if(_Lerp4 > 0){
					col = lerp(col, col4, _Lerp4) * _Color;
				}
				return col;
			}
		ENDCG
	}
}
}
