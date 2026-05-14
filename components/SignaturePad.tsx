'use client';

import { useEffect, useRef } from 'react';

export type SignatureMode = 'draw' | 'type' | 'upload';

export interface SignatureValue {
  mode: SignatureMode;
  data: string | null; // dataURL for draw/upload, text for type
}

interface Props {
  value: SignatureValue;
  onChange: (next: SignatureValue) => void;
}

export default function SignaturePad({ value, onChange }: Props) {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const drawingRef = useRef(false);
  const lastPointRef = useRef<{ x: number; y: number } | null>(null);

  // Initialize canvas with white background + restore prior data if any
  useEffect(() => {
    if (value.mode !== 'draw') return;
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    // Set the canvas backing store size to match its CSS size × DPR for crisp lines
    const dpr = window.devicePixelRatio || 1;
    const rect = canvas.getBoundingClientRect();
    canvas.width = rect.width * dpr;
    canvas.height = rect.height * dpr;
    ctx.scale(dpr, dpr);
    ctx.fillStyle = '#ffffff';
    ctx.fillRect(0, 0, rect.width, rect.height);
    ctx.lineWidth = 2;
    ctx.lineCap = 'round';
    ctx.strokeStyle = '#111827';

    if (value.data) {
      const img = new Image();
      img.onload = () => {
        ctx.drawImage(img, 0, 0, rect.width, rect.height);
      };
      img.src = value.data;
    }
  }, [value.mode]); // eslint-disable-line react-hooks/exhaustive-deps

  const getPos = (e: React.MouseEvent | React.TouchEvent) => {
    const canvas = canvasRef.current;
    if (!canvas) return { x: 0, y: 0 };
    const rect = canvas.getBoundingClientRect();
    if ('touches' in e) {
      const t = e.touches[0] ?? e.changedTouches[0];
      return { x: t.clientX - rect.left, y: t.clientY - rect.top };
    }
    return { x: e.clientX - rect.left, y: e.clientY - rect.top };
  };

  const startDraw = (e: React.MouseEvent | React.TouchEvent) => {
    e.preventDefault();
    drawingRef.current = true;
    lastPointRef.current = getPos(e);
  };

  const draw = (e: React.MouseEvent | React.TouchEvent) => {
    if (!drawingRef.current) return;
    e.preventDefault();
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;
    const point = getPos(e);
    const last = lastPointRef.current;
    if (last) {
      ctx.beginPath();
      ctx.moveTo(last.x, last.y);
      ctx.lineTo(point.x, point.y);
      ctx.stroke();
    }
    lastPointRef.current = point;
  };

  const endDraw = () => {
    if (!drawingRef.current) return;
    drawingRef.current = false;
    lastPointRef.current = null;
    const canvas = canvasRef.current;
    if (canvas) {
      onChange({ mode: 'draw', data: canvas.toDataURL('image/png') });
    }
  };

  const clearCanvas = () => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;
    const rect = canvas.getBoundingClientRect();
    ctx.fillStyle = '#ffffff';
    ctx.fillRect(0, 0, rect.width, rect.height);
    onChange({ mode: 'draw', data: null });
  };

  const setMode = (mode: SignatureMode) => {
    onChange({ mode, data: null });
  };

  const onTypeChange = (text: string) => {
    onChange({ mode: 'type', data: text });
  };

  const onUpload = (file: File | null) => {
    if (!file) {
      onChange({ mode: 'upload', data: null });
      return;
    }
    const reader = new FileReader();
    reader.onload = () => {
      onChange({ mode: 'upload', data: typeof reader.result === 'string' ? reader.result : null });
    };
    reader.readAsDataURL(file);
  };

  const tabBtn = (mode: SignatureMode, label: string) => (
    <button
      type="button"
      onClick={() => setMode(mode)}
      className={`px-4 py-2 text-sm font-bold rounded-lg transition-colors ${
        value.mode === mode
          ? 'bg-gray-900 text-white shadow'
          : 'bg-white text-gray-700 hover:bg-gray-100 border border-gray-200'
      }`}
    >
      {label}
    </button>
  );

  return (
    <div className="space-y-3">
      <div className="flex flex-wrap gap-2">
        {tabBtn('draw', 'Draw')}
        {tabBtn('type', 'Type')}
        {tabBtn('upload', 'Upload')}
      </div>

      {value.mode === 'draw' && (
        <div>
          <div className="rounded-xl border-2 border-dashed border-gray-300 bg-white overflow-hidden">
            <canvas
              ref={canvasRef}
              className="block w-full h-40 sm:h-48 touch-none cursor-crosshair"
              onMouseDown={startDraw}
              onMouseMove={draw}
              onMouseUp={endDraw}
              onMouseLeave={endDraw}
              onTouchStart={startDraw}
              onTouchMove={draw}
              onTouchEnd={endDraw}
            />
          </div>
          <div className="flex items-center justify-between mt-2">
            <p className="text-xs text-gray-500">Sign above using your mouse, trackpad, or touch screen.</p>
            <button
              type="button"
              onClick={clearCanvas}
              className="text-xs font-bold text-red-600 hover:text-red-700"
            >
              Clear
            </button>
          </div>
        </div>
      )}

      {value.mode === 'type' && (
        <div>
          <input
            type="text"
            value={value.data ?? ''}
            onChange={(e) => onTypeChange(e.target.value)}
            placeholder="Type your full legal name"
            className="w-full px-4 py-3 border border-gray-300 rounded-xl text-2xl text-gray-900 focus:ring-2 focus:ring-red-500 focus:border-red-500 outline-none transition-colors"
            style={{ fontFamily: '"Brush Script MT", "Lucida Handwriting", cursive' }}
          />
          <p className="text-xs text-gray-500 mt-2">
            Typing your full legal name above counts as your electronic signature.
          </p>
        </div>
      )}

      {value.mode === 'upload' && (
        <div>
          <div className="rounded-xl border-2 border-dashed border-gray-300 bg-white p-6 text-center">
            {value.data ? (
              // eslint-disable-next-line @next/next/no-img-element
              <img src={value.data} alt="Uploaded signature" className="mx-auto max-h-32 object-contain" />
            ) : (
              <p className="text-sm text-gray-500">Upload an image of your signature (PNG or JPG).</p>
            )}
          </div>
          <div className="flex items-center justify-between mt-2 gap-3">
            <input
              type="file"
              accept="image/png,image/jpeg"
              onChange={(e) => onUpload(e.target.files?.[0] ?? null)}
              className="text-xs file:mr-3 file:py-2 file:px-4 file:rounded-lg file:border-0 file:bg-gray-900 file:text-white file:font-bold file:cursor-pointer hover:file:bg-black text-gray-600"
            />
            {value.data && (
              <button
                type="button"
                onClick={() => onUpload(null)}
                className="text-xs font-bold text-red-600 hover:text-red-700"
              >
                Remove
              </button>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
