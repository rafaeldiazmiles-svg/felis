// Upgrade NOTE: replaced 'mul(UNITY_MATRIX_MVP,*)' with 'UnityObjectToClipPos(*)'


Shader "Stencils/Masks/StencilMask_2"
{
	SubShader 
	{
		Tags { "RenderType"="Opaque" "Queue"="Geometry-100"}
		ColorMask 0
		ZWrite off
		Stencil 
		{
			Ref 2
			Comp always
			Pass replace
		}
		
		Pass
		{
		CGPROGRAM
			#pragma vertex vert
			#pragma fragment frag
			
			struct appdata 
			{
				float4 vertex : POSITION;
				float4 color : COLOR;
			};
			
			struct v2f 
			{
				float4 pos : SV_POSITION;
				float4 color : COLOR;
			};
			
			v2f vert(appdata v) 
			{
				v2f o;
				o.pos = UnityObjectToClipPos(v.vertex);
				o.color = v.color;
				return o;
			}
			
			half4 frag(v2f i) : COLOR 
			{
				if (i.color.a<0.1) discard;  
				return half4(1,1,1,1);
			}
		ENDCG
		}
	}
}

