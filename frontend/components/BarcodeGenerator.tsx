'use client';

import { useEffect, useRef } from 'react';
import { Download } from 'lucide-react';

interface BarcodePreviewProps {
  text: string;
  label?: string;
  showDownload?: boolean;
}

export default function BarcodePreview({ text, label, showDownload = true }: BarcodePreviewProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    if (!text || !canvasRef.current) return;
    // Dynamically import JsBarcode to avoid SSR issues
    import('jsbarcode').then(({ default: JsBarcode }) => {
      try {
        JsBarcode(canvasRef.current, text, {
          format: 'CODE128',
          lineColor: '#1a1a2e',
          width: 2,
          height: 60,
          displayValue: true,
          fontSize: 13,
          fontOptions: 'bold',
          textMargin: 4,
          margin: 10,
          background: '#ffffff',
        });
      } catch (e) {
        console.error('Barcode generation error:', e);
      }
    });
  }, [text]);

  const handleDownload = () => {
    if (!canvasRef.current) return;
    const url = canvasRef.current.toDataURL('image/png');
    const a = document.createElement('a');
    a.href = url;
    a.download = `barcode-${text}.png`;
    a.click();
  };

  return (
    <div className="card p-6">
      <div className="flex items-center justify-between mb-4">
        <div>
          <h3 className="font-semibold text-[#1a1a2e] text-lg">Order Barcode</h3>
          {label && <p className="text-sm text-gray-500 mt-0.5">{label}</p>}
        </div>
        {showDownload && (
          <button
            onClick={handleDownload}
            className="flex items-center gap-1.5 text-sm text-[#1a1a2e] hover:text-[#0f3460] font-medium"
          >
            <Download className="w-4 h-4" /> Download
          </button>
        )}
      </div>
      <div className="flex justify-center bg-white rounded-xl border border-gray-100 p-4">
        <canvas ref={canvasRef} />
      </div>
      <p className="text-xs text-center text-gray-400 mt-3">
        Scan this barcode to track production and delivery
      </p>
    </div>
  );
}
