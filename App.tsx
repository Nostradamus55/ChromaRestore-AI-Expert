
import React, { useState, useCallback, useRef } from 'react';
import { Camera, Upload, Image as ImageIcon, Sparkles, History, Palette, Wrench, FileText, Check, Copy, AlertCircle, RefreshCw } from 'lucide-react';
import { GeminiService } from './geminiService';
import { AnalysisResponse, ImageFile, AppStatus } from './types';

const App: React.FC = () => {
  const [bwImage, setBwImage] = useState<ImageFile | null>(null);
  const [refImage, setRefImage] = useState<ImageFile | null>(null);
  const [status, setStatus] = useState<AppStatus>(AppStatus.IDLE);
  const [analysis, setAnalysis] = useState<AnalysisResponse | null>(null);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [copySuccess, setCopySuccess] = useState(false);

  const fileInputBw = useRef<HTMLInputElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFileUpload = async (event: React.ChangeEvent<HTMLInputElement>, isBw: boolean) => {
    const file = event.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onloadend = () => {
      const base64String = (reader.result as string).split(',')[1];
      const previewUrl = reader.result as string;
      const imgFile = { base64: base64String, preview: previewUrl, type: file.type };
      
      if (isBw) setBwImage(imgFile);
      else setRefImage(imgFile);
    };
    reader.readAsDataURL(file);
  };

  const startAnalysis = async () => {
    if (!bwImage) return;

    setStatus(AppStatus.LOADING);
    setErrorMessage(null);
    try {
      const service = new GeminiService();
      const result = await service.analyzePhotos(bwImage.base64, refImage?.base64);
      setAnalysis(result);
      setStatus(AppStatus.SUCCESS);
    } catch (error) {
      console.error(error);
      setStatus(AppStatus.ERROR);
      setErrorMessage("Nepodarilo sa vykonať analýzu. Skontrolujte prosím pripojenie alebo platnosť API kľúča.");
    }
  };

  const reset = () => {
    setBwImage(null);
    setRefImage(null);
    setAnalysis(null);
    setStatus(AppStatus.IDLE);
    setErrorMessage(null);
  };

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text);
    setCopySuccess(true);
    setTimeout(() => setCopySuccess(false), 2000);
  };

  return (
    <div className="min-h-screen pb-20">
      {/* Header */}
      <header className="bg-slate-900 border-b border-slate-800 py-6 sticky top-0 z-10 shadow-lg">
        <div className="max-w-6xl mx-auto px-4 flex justify-between items-center">
          <div className="flex items-center gap-3">
            <div className="bg-blue-600 p-2 rounded-lg">
              <Sparkles className="text-white w-6 h-6" />
            </div>
            <div>
              <h1 className="text-2xl font-bold tracking-tight text-white">ChromaRestore AI Expert</h1>
              <p className="text-slate-400 text-sm">Systém pre digitálnu rekonštrukciu historických fotografií</p>
            </div>
          </div>
          {status === AppStatus.SUCCESS && (
            <button 
              onClick={reset}
              className="flex items-center gap-2 bg-slate-800 hover:bg-slate-700 text-slate-300 py-2 px-4 rounded-lg transition-colors border border-slate-700"
            >
              <RefreshCw className="w-4 h-4" />
              Nová analýza
            </button>
          )}
        </div>
      </header>

      <main className="max-w-6xl mx-auto px-4 mt-10">
        {status === AppStatus.IDLE && (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8 animate-in fade-in duration-500">
            {/* B&W Upload */}
            <div className="bg-slate-900 rounded-2xl p-8 border-2 border-dashed border-slate-700 hover:border-blue-500 transition-all group flex flex-col items-center justify-center min-h-[400px]">
              {bwImage ? (
                <div className="relative w-full h-full flex flex-col items-center">
                  <img src={bwImage.preview} alt="B&W" className="max-h-64 rounded-lg shadow-xl mb-4 border border-slate-700" />
                  <p className="text-slate-300 font-medium">Hlavná ČB fotografia</p>
                  <button onClick={() => setBwImage(null)} className="mt-4 text-sm text-red-400 hover:text-red-300 underline">Odstrániť</button>
                </div>
              ) : (
                <div className="text-center">
                  <div className="bg-slate-800 w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4 group-hover:scale-110 transition-transform">
                    <ImageIcon className="text-slate-400 group-hover:text-blue-400" />
                  </div>
                  <h3 className="text-lg font-semibold mb-2">Nahrajte ČB fotografiu</h3>
                  <p className="text-slate-400 text-sm mb-6 max-w-[250px] mx-auto">Snímka, ktorú chcete analyzovať a farebne zrekonštruovať.</p>
                  <button 
                    onClick={() => fileInputBw.current?.click()}
                    className="bg-blue-600 hover:bg-blue-500 text-white py-2 px-6 rounded-lg font-medium transition-colors shadow-lg shadow-blue-900/20"
                  >
                    Vybrať súbor
                  </button>
                  <input type="file" ref={fileInputBw} onChange={(e) => handleFileUpload(e, true)} className="hidden" accept="image/*" />
                </div>
              )}
            </div>

            {/* Reference Upload */}
            <div className="bg-slate-900 rounded-2xl p-8 border-2 border-dashed border-slate-700 hover:border-emerald-500 transition-all group flex flex-col items-center justify-center min-h-[400px]">
              {refImage ? (
                <div className="relative w-full h-full flex flex-col items-center">
                  <img src={refImage.preview} alt="Reference" className="max-h-64 rounded-lg shadow-xl mb-4 border border-slate-700" />
                  <p className="text-slate-300 font-medium">Farebná referenčná predloha</p>
                  <button onClick={() => setRefImage(null)} className="mt-4 text-sm text-red-400 hover:text-red-300 underline">Odstrániť</button>
                </div>
              ) : (
                <div className="text-center">
                  <div className="bg-slate-800 w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4 group-hover:scale-110 transition-transform">
                    <Palette className="text-slate-400 group-hover:text-emerald-400" />
                  </div>
                  <h3 className="text-lg font-semibold mb-2">Referenčná predloha (voliteľné)</h3>
                  <p className="text-slate-400 text-sm mb-6 max-w-[250px] mx-auto">Farebná fotka pre analýzu pleťových tónov a atmosféry.</p>
                  <button 
                    onClick={() => fileInputRef.current?.click()}
                    className="bg-slate-800 hover:bg-slate-700 text-slate-300 py-2 px-6 rounded-lg font-medium transition-colors border border-slate-700"
                  >
                    Vybrať súbor
                  </button>
                  <input type="file" ref={fileInputRef} onChange={(e) => handleFileUpload(e, false)} className="hidden" accept="image/*" />
                </div>
              )}
            </div>

            {bwImage && (
              <div className="md:col-span-2 flex justify-center mt-6">
                <button 
                  onClick={startAnalysis}
                  className="bg-blue-600 hover:bg-blue-500 text-white py-4 px-12 rounded-xl font-bold text-lg transition-all shadow-2xl shadow-blue-600/30 flex items-center gap-3 animate-bounce-subtle"
                >
                  <Sparkles className="w-6 h-6" />
                  Spustiť Expertnú Analýzu
                </button>
              </div>
            )}
          </div>
        )}

        {status === AppStatus.LOADING && (
          <div className="flex flex-col items-center justify-center min-h-[500px] text-center">
            <div className="relative mb-8">
              <div className="w-24 h-24 border-4 border-blue-500/20 border-t-blue-500 rounded-full animate-spin"></div>
              <Sparkles className="absolute inset-0 m-auto w-8 h-8 text-blue-500 animate-pulse" />
            </div>
            <h2 className="text-2xl font-bold mb-4">ChromaRestore AI pracuje...</h2>
            <div className="max-w-md bg-slate-900 border border-slate-800 p-6 rounded-xl">
              <ul className="text-left text-slate-400 space-y-3 text-sm mono">
                <li className="flex items-center gap-2"><div className="w-1.5 h-1.5 bg-blue-500 rounded-full animate-ping" /> Detekcia sémantických vrstiev scény...</li>
                <li className="flex items-center gap-2"><div className="w-1.5 h-1.5 bg-blue-500 rounded-full animate-ping" /> Výpočet chromatickej mapy...</li>
                <li className="flex items-center gap-2"><div className="w-1.5 h-1.5 bg-blue-500 rounded-full animate-ping" /> Generovanie technického Imagen 3 promptu...</li>
              </ul>
            </div>
          </div>
        )}

        {status === AppStatus.ERROR && (
          <div className="max-w-2xl mx-auto bg-red-900/20 border border-red-900/50 p-8 rounded-2xl text-center">
            <AlertCircle className="w-16 h-16 text-red-500 mx-auto mb-4" />
            <h2 className="text-xl font-bold text-red-400 mb-2">Chyba systému</h2>
            <p className="text-slate-300 mb-6">{errorMessage}</p>
            <button onClick={reset} className="bg-red-600 hover:bg-red-500 text-white py-2 px-8 rounded-lg transition-colors">Skúsiť znova</button>
          </div>
        )}

        {status === AppStatus.SUCCESS && analysis && (
          <div className="space-y-8 animate-in slide-in-from-bottom-10 duration-700">
            {/* Section 1: Scene Detection */}
            <div className="bg-slate-900 rounded-2xl overflow-hidden border border-slate-800 shadow-xl">
              <div className="bg-slate-800/50 px-6 py-4 border-b border-slate-700 flex items-center gap-3">
                <History className="text-blue-400 w-5 h-5" />
                <h2 className="font-bold text-lg uppercase tracking-wider text-slate-300">[Detekcia scény]</h2>
              </div>
              <div className="p-8 grid grid-cols-1 md:grid-cols-3 gap-8">
                <div className="md:col-span-2 space-y-6">
                  <div>
                    <h3 className="text-slate-500 text-xs font-bold uppercase mb-2">Popis a Kontext</h3>
                    <p className="text-slate-200 leading-relaxed text-lg">{analysis.sceneDetection.description}</p>
                  </div>
                  <div className="grid grid-cols-2 gap-4">
                    <div className="bg-slate-800/40 p-4 rounded-xl border border-slate-700">
                      <h4 className="text-slate-500 text-xs font-bold mb-1 uppercase">Obdobie</h4>
                      <p className="text-blue-300 font-semibold">{analysis.sceneDetection.era}</p>
                    </div>
                    <div className="bg-slate-800/40 p-4 rounded-xl border border-slate-700">
                      <h4 className="text-slate-500 text-xs font-bold mb-1 uppercase">Lokalita/Kontext</h4>
                      <p className="text-emerald-300 font-semibold">{analysis.sceneDetection.context}</p>
                    </div>
                  </div>
                  {analysis.sceneDetection.textAnalysis && (
                    <div className="bg-amber-900/20 p-4 rounded-xl border border-amber-900/50">
                      <h4 className="text-amber-500 text-xs font-bold mb-1 uppercase flex items-center gap-2">
                        <FileText className="w-3 h-3" /> Analýza Textu
                      </h4>
                      <p className="text-amber-200 text-sm italic">{analysis.sceneDetection.textAnalysis}</p>
                    </div>
                  )}
                </div>
                <div>
                  <h3 className="text-slate-500 text-xs font-bold uppercase mb-4">Detekované Predmety</h3>
                  <div className="flex flex-wrap gap-2">
                    {analysis.sceneDetection.objects.map((obj, i) => (
                      <span key={i} className="px-3 py-1 bg-slate-800 rounded-full text-xs text-slate-300 border border-slate-700">
                        {obj}
                      </span>
                    ))}
                  </div>
                </div>
              </div>
            </div>

            {/* Section 2: Color Palette */}
            <div className="bg-slate-900 rounded-2xl overflow-hidden border border-slate-800 shadow-xl">
              <div className="bg-slate-800/50 px-6 py-4 border-b border-slate-700 flex items-center gap-3">
                <Palette className="text-emerald-400 w-5 h-5" />
                <h2 className="font-bold text-lg uppercase tracking-wider text-slate-300">[Farebná schéma]</h2>
              </div>
              <div className="p-8">
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
                  {analysis.colorPalette.map((color, i) => (
                    <div key={i} className="group relative">
                      <div 
                        className="w-full h-24 rounded-t-xl transition-transform group-hover:scale-[1.02]" 
                        style={{ backgroundColor: color.hex }}
                      />
                      <div className="bg-slate-800 p-4 rounded-b-xl border-x border-b border-slate-700">
                        <div className="flex justify-between items-center mb-1">
                          <span className="text-xs font-bold uppercase text-slate-500">{color.label}</span>
                          <code className="text-[10px] text-blue-400 font-mono">{color.hex}</code>
                        </div>
                        <p className="text-xs text-slate-400 line-clamp-2">{color.description}</p>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>

            {/* Section 3: Restoration Guide */}
            <div className="bg-slate-900 rounded-2xl overflow-hidden border border-slate-800 shadow-xl">
              <div className="bg-slate-800/50 px-6 py-4 border-b border-slate-700 flex items-center gap-3">
                <Wrench className="text-amber-400 w-5 h-5" />
                <h2 className="font-bold text-lg uppercase tracking-wider text-slate-300">[Pokyny pre rekonštrukciu]</h2>
              </div>
              <div className="p-8">
                <div className="space-y-6">
                  {analysis.restorationGuide.map((step, i) => (
                    <div key={i} className="flex gap-6 items-start">
                      <div className="bg-slate-800 w-10 h-10 rounded-full flex items-center justify-center shrink-0 border border-slate-700 text-blue-400 font-bold">
                        {i + 1}
                      </div>
                      <div className="space-y-1">
                        <h4 className="text-slate-100 font-bold flex items-center gap-2">
                          {step.step}
                          <span className="text-[10px] px-2 py-0.5 bg-slate-800 text-slate-400 rounded-md border border-slate-700 font-mono">{step.action}</span>
                        </h4>
                        <p className="text-slate-400 text-sm leading-relaxed">{step.details}</p>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>

            {/* Section 4: Imagen Prompt */}
            <div className="bg-blue-900/10 rounded-2xl overflow-hidden border border-blue-500/30 shadow-2xl">
              <div className="bg-blue-900/20 px-6 py-4 border-b border-blue-500/30 flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <Sparkles className="text-blue-400 w-5 h-5" />
                  <h2 className="font-bold text-lg uppercase tracking-wider text-blue-300">[Imagen 3 Prompt]</h2>
                </div>
                <button 
                  onClick={() => copyToClipboard(analysis.imagenPrompt)}
                  className="bg-blue-600 hover:bg-blue-500 text-white p-2 rounded-lg transition-colors flex items-center gap-2 text-sm"
                >
                  {copySuccess ? <Check className="w-4 h-4" /> : <Copy className="w-4 h-4" />}
                  {copySuccess ? "Skopírované" : "Kopírovať Prompt"}
                </button>
              </div>
              <div className="p-8">
                <div className="bg-slate-950 p-6 rounded-xl border border-slate-800 mono text-sm text-blue-100 leading-relaxed">
                  {analysis.imagenPrompt}
                </div>
                <p className="mt-4 text-xs text-slate-500 italic">
                  *Tento prompt je optimalizovaný pre moderné generatívne modely (Imagen 3, Stable Diffusion XL) pre zachovanie pôvodnej štruktúry pri doplnení realistických farieb.
                </p>
              </div>
            </div>
          </div>
        )}
      </main>

      {/* Footer Disclaimer */}
      <footer className="mt-20 border-t border-slate-800 py-10 px-4 text-center">
        <p className="text-slate-500 text-sm max-w-xl mx-auto">
          ChromaRestore AI Expert využíva pokročilé multimodálne modely Gemini Pro pre analýzu obrazových dát. 
          Všetky historické fakty a farby sú odhadované na základe sémantickej analýzy a tréningových dát modelu.
        </p>
      </footer>
    </div>
  );
};

export default App;
