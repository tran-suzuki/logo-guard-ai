import React from 'react';
import { AnalysisResult, DefectVerdict } from '../types';
import { DefectOverlay } from './DefectOverlay';

interface ResultViewProps {
  result: AnalysisResult;
  inspectionImage: string; // Added prop to display overlay
  onReset: () => void;
}

export const ResultView: React.FC<ResultViewProps> = ({ result, inspectionImage, onReset }) => {
  const isPass = result.verdict === DefectVerdict.PASS;
  const isFail = result.verdict === DefectVerdict.FAIL;
  
  const borderColor = isPass ? 'border-success' : isFail ? 'border-danger' : 'border-yellow-500';
  const bgColor = isPass ? 'bg-success/10' : isFail ? 'bg-danger/10' : 'bg-yellow-500/10';
  const textColor = isPass ? 'text-success' : isFail ? 'text-danger' : 'text-yellow-600';
  
  return (
    <div className="w-full animate-fade-in-up grid grid-cols-1 gap-6">
      
      {/* Verdict Card */}
      <div className={`relative rounded-2xl overflow-hidden border-2 ${borderColor} bg-white shadow-lg`}>
        {/* Header Banner */}
        <div className={`p-6 text-center ${bgColor}`}>
          <h2 className={`text-4xl font-black tracking-tighter uppercase ${textColor}`}>
            {result.verdict}
          </h2>
          <p className="text-slate-500 font-medium mt-1">
            確信度: {Math.round(result.confidence)}%
          </p>
        </div>

        {/* Details Body */}
        <div className="p-6 space-y-4">
          <div>
            <h3 className="text-sm uppercase tracking-wide text-slate-500 font-semibold mb-2">
              AI分析結果
            </h3>
            <p className="text-slate-800 leading-relaxed whitespace-pre-wrap">
              {result.reasoning}
            </p>
          </div>

          {result.defects.length > 0 && (
            <div className="bg-red-50 rounded-lg p-4 border border-red-100">
              <h3 className="text-sm uppercase tracking-wide text-red-800 font-semibold mb-2 flex items-center gap-2">
                <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" className="w-4 h-4">
                  <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-8-5a.75.75 0 01.75.75v4.5a.75.75 0 01-1.5 0v-4.5A.75.75 0 0110 5zm0 10a1 1 0 100-2 1 1 0 000 2z" clipRule="evenodd" />
                </svg>
                検出された欠陥
              </h3>
              <ul className="list-disc list-inside space-y-1">
                {result.defects.map((defect, idx) => (
                  <li key={idx} className="text-red-700 text-sm">
                    <span className="font-semibold">{defect.description}</span>
                  </li>
                ))}
              </ul>
            </div>
          )}
        </div>
      </div>

      {/* Visual Overlay Card - Only shown if there are defects or for context on PASS */}
      <div className="bg-white rounded-2xl p-4 shadow-md border border-slate-200">
         <h3 className="text-sm uppercase tracking-wide text-slate-500 font-semibold mb-3">
            視覚的検査
         </h3>
         <div className="rounded-lg overflow-hidden border border-slate-200 bg-slate-50">
            <DefectOverlay imageSrc={inspectionImage} defects={result.defects} />
         </div>
         <p className="text-xs text-center text-slate-400 mt-2">
           {result.defects.length > 0 
             ? "赤枠はAIが検出した欠陥箇所を示しています。" 
             : "この画像に視覚的な欠陥は見つかりませんでした。"}
         </p>
      </div>

      {/* Actions */}
      <div className="flex justify-center pt-2">
        <button
          onClick={onReset}
          className="px-8 py-3 bg-white border border-slate-300 text-slate-700 font-bold rounded-xl shadow-sm hover:bg-slate-50 hover:border-slate-400 transition-colors"
        >
          新しい検査を開始
        </button>
      </div>
    </div>
  );
};