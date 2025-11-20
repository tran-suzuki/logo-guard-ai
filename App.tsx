import React, { useState } from 'react';
import { ImageUploader } from './components/ImageUploader';
import { ResultView } from './components/ResultView';
import { analyzeLogoDefects } from './services/geminiService';
import { AnalysisStatus, AnalysisResult } from './types';

const App: React.FC = () => {
  const [referenceImage, setReferenceImage] = useState<string | null>(null);
  const [inspectionImage, setInspectionImage] = useState<string | null>(null);
  const [status, setStatus] = useState<AnalysisStatus>(AnalysisStatus.IDLE);
  const [result, setResult] = useState<AnalysisResult | null>(null);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  const handleAnalyze = async () => {
    if (!referenceImage || !inspectionImage) return;

    setStatus(AnalysisStatus.ANALYZING);
    setErrorMessage(null);

    try {
      const analysisResult = await analyzeLogoDefects(referenceImage, inspectionImage);
      setResult(analysisResult);
      setStatus(AnalysisStatus.SUCCESS);
    } catch (error) {
      setStatus(AnalysisStatus.ERROR);
      setErrorMessage(error instanceof Error ? error.message : "予期せぬエラーが発生しました。");
    }
  };

  const handleReset = () => {
    setInspectionImage(null);
    // We typically keep the reference image as users might check multiple items against one master
    setResult(null);
    setStatus(AnalysisStatus.IDLE);
    setErrorMessage(null);
  };

  const handleFullReset = () => {
    setReferenceImage(null);
    handleReset();
  };

  const isReadyToAnalyze = referenceImage && inspectionImage && status !== AnalysisStatus.ANALYZING;

  return (
    <div className="min-h-screen bg-slate-100 flex flex-col font-sans text-slate-900">
      {/* Navbar */}
      <header className="bg-primary shadow-md sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="bg-accent/20 p-2 rounded-lg">
              <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor" className="w-6 h-6 text-accent">
                <path strokeLinecap="round" strokeLinejoin="round" d="M2.036 12.322a1.012 1.012 0 010-.639C3.423 7.51 7.36 4.5 12 4.5c4.638 0 8.573 3.007 9.963 7.178.07.207.07.431 0 .639C20.577 16.49 16.64 19.5 12 19.5c-4.638 0-8.573-3.007-9.963-7.178z" />
                <path strokeLinecap="round" strokeLinejoin="round" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
              </svg>
            </div>
            <h1 className="text-xl font-bold text-white tracking-tight">LogoGuard AI</h1>
          </div>
          <div className="text-xs text-slate-400 font-medium hidden sm:block">
            外観品質検査システム
          </div>
        </div>
      </header>

      <main className="flex-grow p-4 sm:p-6 lg:p-8">
        <div className="max-w-5xl mx-auto space-y-8">
          
          {/* Top Instructions / Status */}
          <div className="text-center max-w-2xl mx-auto mb-8">
            <h2 className="text-2xl sm:text-3xl font-bold text-primary mb-3">
              外観欠陥検知
            </h2>
            <p className="text-slate-600">
              CAD/マスターデータをアップロードし、製造ラインの現場写真と比較します。
              AIが回転、反射、照明の調整を行い判定します。
            </p>
          </div>

          {/* Main Content Grid - Only show if no result yet */}
          {status !== AnalysisStatus.SUCCESS && (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 lg:gap-12 items-start animate-fade-in">
              
              {/* Left: Reference Input */}
              <div className="flex flex-col h-full space-y-4">
                <div className="bg-white p-4 rounded-2xl shadow-sm border border-slate-200 h-full flex flex-col">
                  <div className="flex justify-between items-center mb-2">
                      <span className="text-xs font-bold text-slate-400 uppercase tracking-wider">マスターデータ</span>
                      {referenceImage && (
                        <button onClick={() => setReferenceImage(null)} className="text-xs text-red-500 hover:underline">クリア</button>
                      )}
                  </div>
                  <div className="flex-grow">
                    <ImageUploader 
                      label="参照ロゴ (SVG/PNG)" 
                      imageSrc={referenceImage} 
                      onImageSelected={setReferenceImage}
                    />
                  </div>
                </div>
              </div>

              {/* Right: Inspection Input */}
              <div className="flex flex-col h-full space-y-4">
                <div className="bg-white p-4 rounded-2xl shadow-sm border border-slate-200 h-full flex flex-col">
                  <div className="flex justify-between items-center mb-2">
                      <span className="text-xs font-bold text-slate-400 uppercase tracking-wider">現場写真</span>
                      {inspectionImage && (
                        <button onClick={() => setInspectionImage(null)} className="text-xs text-red-500 hover:underline">クリア</button>
                      )}
                  </div>
                  <div className="flex-grow">
                    <ImageUploader 
                      label="現場写真 (カメラ/ファイル)" 
                      imageSrc={inspectionImage} 
                      onImageSelected={setInspectionImage}
                      isCapture={true}
                      allowGallery={true}
                    />
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* Action Area */}
          <div className="flex flex-col items-center justify-center pt-4 space-y-6">
            {errorMessage && (
              <div className="w-full max-w-md bg-red-100 border-l-4 border-red-500 text-red-700 p-4 rounded shadow-sm" role="alert">
                <p className="font-bold">分析エラー</p>
                <p className="text-sm">{errorMessage}</p>
              </div>
            )}

            {status === AnalysisStatus.ANALYZING ? (
               <div className="flex flex-col items-center space-y-4">
                 <div className="relative w-24 h-24">
                   <div className="absolute inset-0 border-4 border-slate-200 rounded-full"></div>
                   <div className="absolute inset-0 border-4 border-accent border-t-transparent rounded-full animate-spin"></div>
                 </div>
                 <div className="text-center space-y-1 animate-pulse">
                    <p className="text-lg font-medium text-slate-700">AI思考中...</p>
                    <p className="text-sm text-slate-500">形状比較と欠陥分析を実行中</p>
                 </div>
               </div>
            ) : (
              !result && (
                <button
                  onClick={handleAnalyze}
                  disabled={!isReadyToAnalyze}
                  className={`
                    w-full max-w-xs py-4 px-8 rounded-xl font-bold text-lg shadow-lg transition-all transform
                    ${isReadyToAnalyze 
                      ? 'bg-accent text-white hover:bg-blue-600 hover:shadow-xl hover:-translate-y-1' 
                      : 'bg-slate-300 text-slate-500 cursor-not-allowed'}
                  `}
                >
                  検査を実行
                </button>
              )
            )}

            {/* Result Display */}
            {status === AnalysisStatus.SUCCESS && result && inspectionImage && (
              <div className="w-full max-w-3xl">
                <ResultView 
                  result={result} 
                  inspectionImage={inspectionImage}
                  onReset={handleReset} 
                />
              </div>
            )}
          </div>
        </div>
      </main>
      
      {/* Sticky Footer */}
      <footer className="bg-slate-200 py-6 mt-auto">
        <div className="max-w-7xl mx-auto px-4 text-center text-slate-500 text-sm">
          &copy; {new Date().getFullYear()} LogoGuard AI. Powered by Gemini 3 Pro.
        </div>
      </footer>
    </div>
  );
};

export default App;