// Upgrade NOTE: replaced 'mul(UNITY_MATRIX_MVP,*)' with 'UnityObjectToClipPos(*)'

// Upgrade NOTE: replaced '_Object2World' with 'unity_ObjectToWorld'

/*
Renders doubled sides objects without lighting. Useful for
grass, trees or foliage.

This shader renders two passes for all geometry, one
for opaque parts and one with semitransparent details.

This makes it possible to render transparent objects
like grass without them being sorted by depth.
*/

Shader "Zerky Island/Two Texture Lighting" {
	Properties {
		_Color("Color", Color) = (1,1,1,1)
		_MainTex ("Light Texture", 2D) = "white" {}
		_SecondTex ("Dark Texture", 2D) = "white" {}
		_Cutoff ("Base Alpha cutoff", Range (0,.9)) = .5
		
	}

	SubShader {
		Tags { "Queue"="AlphaTest" "RenderType"="TransparentCutout" }
		Lighting off
		
		Pass { 
			CGPROGRAM
				#pragma vertex vert
				#pragma fragment frag
				#pragma exclude_renderers flash
				#include "UnityCG.cginc" 
				
				sampler2D _MainTex;
				sampler2D _SecondTex;
				float4 _MainTex_ST;
				float4 _SecondTex_ST;
				float _Cutoff;
				
				float4 _Color;
				
				int _HasLight;
				float _LightRange;
				float4 _LightColor;
				float4 _LightPos;
				float _BackLight;
				float _Attenuate;
				
				int _HasSecondLight;
				float _SecondLightRange;
				float4 _SecondLightColor;
				float4 _SecondLightPos;
				float _SecondBackLight;
				float _SecondLightAttenuate;
				
				int _HasThirdLight;
				float _ThirdLightRange;
				float4 _ThirdLightColor;
				float4 _ThirdLightPos;
				float _ThirdBackLight;
				float _ThirdLightAttenuate;
				
		
				float _AmbientBackLight;
				//float _MaxLight;
				
				struct vertexInput  {
					float4 pos : POSITION;
					//float4 color : COLOR;
					float2 texcoord : TEXCOORD0; 
					float4 worldPos : TEXCOORD1;
				};

				struct vertexOutput  {
					float4 pos : POSITION;
					//float4 color : COLOR;
					float2 texcoord : TEXCOORD0;
					float4 worldPos : TEXCOORD1;
				};


				
				vertexOutput vert (vertexInput input)
				{
					vertexOutput output;
					output.pos = UnityObjectToClipPos(input.pos);
					//output.color = input.color;
					output.texcoord = TRANSFORM_TEX(input.texcoord, _MainTex);
					output.worldPos = mul(unity_ObjectToWorld, input.pos);
					return output;
				}
				
				
				half4 frag (vertexOutput input) : COLOR
				{
					half4 ambientLight = float4(UNITY_LIGHTMODEL_AMBIENT.r*1.8,UNITY_LIGHTMODEL_AMBIENT.g*1.8,UNITY_LIGHTMODEL_AMBIENT.b*2,1);
					float backLight = _AmbientBackLight;
					half4 col = ambientLight * _Color;
					
					//Light 1
					float blendValue = clamp(_LightRange  - distance( input.worldPos, _LightPos),0,1);
					col += _LightColor * blendValue * _Attenuate *_HasLight;
					backLight +=  _BackLight * blendValue * _HasLight;
					
					//Light 2
					float secondBlendValue = clamp(_SecondLightRange  - distance( input.worldPos, _SecondLightPos),0,1);
					col += _SecondLightColor * secondBlendValue * _SecondLightAttenuate * _HasSecondLight;
					backLight += _SecondBackLight * secondBlendValue * _HasSecondLight;
					
					//Light 3
					float thirdBlendValue = clamp(_ThirdLightRange  - distance( input.worldPos, _ThirdLightPos),0,1);
					col += _ThirdLightColor * thirdBlendValue * _ThirdLightAttenuate * _HasThirdLight;
					backLight += _ThirdBackLight * thirdBlendValue * _HasThirdLight;
							
					backLight = clamp(backLight,0,1);
					col *= lerp(tex2D(_MainTex, input.texcoord), tex2D(_SecondTex, input.texcoord), backLight) ;
														 									 									 								 									 									 
					clip(tex2D(_MainTex, input.texcoord).a - _Cutoff);
					return col ;
				}
			ENDCG
		}
		Pass {
		
				Zwrite off
				Blend SrcAlpha OneMinusSrcAlpha	
				
			CGPROGRAM
				#pragma vertex vert
				#pragma fragment frag
				#pragma exclude_renderers flash
				#include "UnityCG.cginc" 
				

				
				sampler2D _MainTex;
				sampler2D _SecondTex;
				float4 _MainTex_ST;
				float4 _SecondTex_ST;
				float _Cutoff;
				
				float4 _Color;
				
				int _HasLight;
				float _LightRange;
				float4 _LightColor;
				float4 _LightPos;
				float _BackLight;
				float _Attenuate;
				
				int _HasSecondLight;
				float _SecondLightRange;
				float4 _SecondLightColor;
				float4 _SecondLightPos;
				float _SecondBackLight;
				float _SecondLightAttenuate;
				
				int _HasThirdLight;
				float _ThirdLightRange;
				float4 _ThirdLightColor;
				float4 _ThirdLightPos;
				float _ThirdBackLight;
				float _ThirdLightAttenuate;
				
		
				float _AmbientBackLight;
				//float _MaxLight;
				
				struct vertexInput  {
					float4 pos : POSITION;
					//float4 color : COLOR;
					float2 texcoord : TEXCOORD0; 
					float4 worldPos : TEXCOORD1;
				};

				struct vertexOutput  {
					float4 pos : POSITION;
					//float4 color : COLOR;
					float2 texcoord : TEXCOORD0;
					float4 worldPos : TEXCOORD1;
				};


				
				vertexOutput vert (vertexInput input)
				{
					vertexOutput output;
					output.pos = UnityObjectToClipPos(input.pos);
					//output.color = input.color;
					output.texcoord = TRANSFORM_TEX(input.texcoord, _MainTex);
					output.worldPos = mul(unity_ObjectToWorld, input.pos);
					return output;
				}
				
				
				half4 frag (vertexOutput input) : COLOR
				{
					half4 ambientLight = float4(UNITY_LIGHTMODEL_AMBIENT.r*1.8,UNITY_LIGHTMODEL_AMBIENT.g*1.8,UNITY_LIGHTMODEL_AMBIENT.b*2,1);
					float backLight = _AmbientBackLight;
					half4 col = ambientLight * _Color;
					
					//Light 1
					float blendValue = clamp(_LightRange  - distance( input.worldPos, _LightPos),0,1);
					col += _LightColor * blendValue * _Attenuate *_HasLight;
					backLight +=  _BackLight * blendValue * _HasLight;
					
					//Light 2
					float secondBlendValue = clamp(_SecondLightRange  - distance( input.worldPos, _SecondLightPos),0,1);
					col += _SecondLightColor * secondBlendValue * _SecondLightAttenuate * _HasSecondLight;
					backLight += _SecondBackLight * secondBlendValue * _HasSecondLight;
					
					//Light 3
					float thirdBlendValue = clamp(_ThirdLightRange  - distance( input.worldPos, _ThirdLightPos),0,1);
					col += _ThirdLightColor * thirdBlendValue * _ThirdLightAttenuate * _HasThirdLight;
					backLight += _ThirdBackLight * thirdBlendValue * _HasThirdLight;
							
					backLight = clamp(backLight,0,1);
					col *= lerp(tex2D(_MainTex, input.texcoord), tex2D(_SecondTex, input.texcoord), backLight) ;
														 									 									 								 									 									 
					clip(-(tex2D(_MainTex, input.texcoord).a - _Cutoff)); 
					return col ;
				}
			ENDCG
		}
	}
}