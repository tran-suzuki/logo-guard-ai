import { GoogleGenAI, Type } from "@google/genai";
import { AnalysisResult, DefectVerdict } from "../types";

// Helper to strip the Data URL prefix for API consumption
const stripBase64Prefix = (dataUrl: string): string => {
  return dataUrl.split(',')[1] || "";
};

export const analyzeLogoDefects = async (
  referenceImageBase64: string,
  inspectionImageBase64: string
): Promise<AnalysisResult> => {
  const apiKey = process.env.API_KEY;
  if (!apiKey) {
    throw new Error("APIキーが見つかりません。環境設定を確認してください。");
  }

  const ai = new GoogleGenAI({ apiKey });

  // Upgrading to Pro model for better reasoning on visual defects
  const modelName = "gemini-3-pro-preview";

  const systemInstruction = `
    あなたは高精度な外観検査（AOI）のAIエキスパートです。
    あなたの唯一の目的は、「参照マスター画像」と「現場の写真」を比較し、印刷されたロゴの製造欠陥を検出することです。

    タスク:
    1. 参照画像を分析し、完全な幾何学形状、トポロジー、色を理解してください。
    2. 検査対象の写真を分析し、以下の要因を考慮してください：
       - 遠近法の歪み（傾き、回転、ズーム）。
       - 環境照明（グレア、影、反射）。
       - カメラノイズ。
    3. 検査写真を脳内で参照画像に位置合わせしてください。
    4. 物理的な不一致（インクの欠け、傷、形状異常、誤った色）のみを特定してください。
    
    重要なルール:
    - 照明によるアーティファクト（反射や光の当たり方）は欠陥として報告しないでください。
    - 遠近法による歪みは形状欠陥として報告しないでください。
    - 印刷物の「存在」と「完全性」にのみ焦点を当ててください。
    - 部品の欠落（例：文字の一部欠け、ロゴの一部の消失）には厳格であってください。
    - 照明によるわずかな色の変化には寛容であってください。
    - 出力言語は「日本語」です。

    出力:
    - 判定 (Verdict): 物理的な完全性が100%保たれている場合はPASS、それ以外はFAIL。
    - 欠陥リスト (Defects): 発見されたすべての物理的欠陥をリストアップしてください。
    - バウンディングボックス: 各欠陥に対して正確な [ymin, xmin, ymax, xmax] (0-1000スケール) を提供してください。
  `;

  const prompt = "これら2つの画像を比較してください。欠けや物理的な損傷がないか詳細な視覚分析を行ってください。結果を構造化されたJSONレポート（日本語）で返してください。";

  try {
    const response = await ai.models.generateContent({
      model: modelName,
      contents: {
        parts: [
          { text: prompt },
          {
            inlineData: {
              mimeType: "image/png", 
              data: stripBase64Prefix(referenceImageBase64),
            },
          },
          {
            inlineData: {
              mimeType: "image/png",
              data: stripBase64Prefix(inspectionImageBase64),
            },
          },
        ],
      },
      config: {
        systemInstruction: systemInstruction,
        // Optimized thinking budget: 1024 tokens allows for reasoning but is faster than 4096
        thinkingConfig: { thinkingBudget: 1024 }, 
        responseMimeType: "application/json",
        responseSchema: {
          type: Type.OBJECT,
          properties: {
            verdict: {
              type: Type.STRING,
              enum: ["PASS", "FAIL", "UNCERTAIN"],
              description: "最終判定。物理的に無傷であればPASS。",
            },
            confidence: {
              type: Type.NUMBER,
              description: "0から100の間の確信度スコア。",
            },
            reasoning: {
              type: Type.STRING,
              description: "なぜ合格または不合格なのか、環境要因をどのように除外したかを含めた詳細な説明（日本語）。",
            },
            defects: {
              type: Type.ARRAY,
              items: { 
                type: Type.OBJECT, 
                properties: {
                  description: { type: Type.STRING, description: "物理的欠陥の具体的な説明（例：「文字Aの一部が欠けている」など日本語で）。" },
                  box_2d: {
                    type: Type.ARRAY,
                    items: { type: Type.INTEGER },
                    description: "検査画像に対するバウンディングボックス [ymin, xmin, ymax, xmax] (0-1000スケール)。"
                  }
                },
                required: ["description", "box_2d"]
              },
              description: "有効な物理的欠陥のリスト。PASSの場合は空。",
            },
          },
          required: ["verdict", "confidence", "reasoning", "defects"],
        },
      },
    });

    const text = response.text;
    if (!text) {
      throw new Error("AIからの応答がありませんでした。");
    }

    const parsed = JSON.parse(text);
    
    let verdictEnum = DefectVerdict.UNCERTAIN;
    if (parsed.verdict === 'PASS') verdictEnum = DefectVerdict.PASS;
    if (parsed.verdict === 'FAIL') verdictEnum = DefectVerdict.FAIL;

    return {
      verdict: verdictEnum,
      confidence: parsed.confidence,
      reasoning: parsed.reasoning,
      defects: parsed.defects || [],
    };

  } catch (error) {
    console.error("Analysis failed:", error);
    throw error;
  }
};