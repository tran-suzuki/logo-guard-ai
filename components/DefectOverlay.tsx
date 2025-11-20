import React from 'react';
import { Defect } from '../types';

interface DefectOverlayProps {
  imageSrc: string;
  defects: Defect[];
}

export const DefectOverlay: React.FC<DefectOverlayProps> = ({ imageSrc, defects }) => {
  return (
    <div className="relative w-full h-full group">
      {/* Base Image */}
      <img 
        src={imageSrc} 
        alt="Inspection with defects" 
        className="w-full h-auto block rounded-lg"
      />
      
      {/* Bounding Boxes Layer */}
      <div className="absolute inset-0 pointer-events-none">
        {defects.map((defect, idx) => {
          if (!defect.box_2d || defect.box_2d.length !== 4) return null;

          const [ymin, xmin, ymax, xmax] = defect.box_2d;
          
          // Convert 0-1000 scale to percentages
          const top = ymin / 10;
          const left = xmin / 10;
          const height = (ymax - ymin) / 10;
          const width = (xmax - xmin) / 10;

          return (
            <div
              key={idx}
              className="absolute border-2 border-red-500 bg-red-500/20 hover:bg-red-500/10 transition-all duration-200"
              style={{
                top: `${top}%`,
                left: `${left}%`,
                height: `${height}%`,
                width: `${width}%`,
              }}
            >
              {/* Tooltip-like label appearing on hover or if large enough */}
              <div className="absolute -top-7 left-0 bg-red-600 text-white text-xs font-bold px-2 py-1 rounded shadow-md whitespace-nowrap opacity-0 group-hover:opacity-100 transition-opacity z-10">
                {defect.description}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};