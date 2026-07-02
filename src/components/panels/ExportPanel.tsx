import React, { FC } from 'react';
import { Image, Save, Download, Smartphone, CheckCircle } from 'lucide-react';

interface ExportPanelProps {
  onDownloadPng: () => void;
  onSaveProject: () => void;
  isInstallable?: boolean;
  isInstalled?: boolean;
  onInstallApp?: () => void;
}

export const ExportPanel: FC<ExportPanelProps> = ({
  onDownloadPng,
  onSaveProject,
  isInstallable = false,
  isInstalled = false,
  onInstallApp
}) => {
  return (
    <div className="p-4 bg-white shadow-sm border-b border-gray-200 flex flex-col gap-5">
      <div>
        <h3 className="font-semibold text-gray-800 text-sm mb-2">Export Canvas</h3>
        <div className="flex gap-2">
          <button 
            onClick={onDownloadPng}
            className="px-3 py-2 bg-blue-50 text-blue-600 rounded-md hover:bg-blue-100 transition flex-1 text-xs font-medium flex items-center justify-center gap-1.5"
          >
            <Image size={15} />
            <span>Download PNG</span>
          </button>
          <button 
            onClick={onSaveProject}
            className="px-3 py-2 bg-purple-50 text-purple-600 rounded-md hover:bg-purple-100 transition flex-1 text-xs font-medium flex items-center justify-center gap-1.5"
          >
            <Save size={15} />
            <span>Save Project</span>
          </button>
        </div>
      </div>

      <div className="border-t border-gray-100 pt-4">
        <h3 className="font-semibold text-gray-800 text-sm mb-2 flex items-center gap-1.5">
          <Smartphone size={16} className="text-pink-500" />
          <span>Offline & Install</span>
        </h3>
        <p className="text-xs text-gray-500 mb-3 leading-relaxed">
          Install SketchFlow to run as a fast, offline-capable application directly on your home screen or desktop.
        </p>

        {isInstalled ? (
          <div className="flex items-center gap-2 p-2.5 bg-green-50 text-green-700 rounded-md text-xs border border-green-100 font-medium">
            <CheckCircle size={15} className="shrink-0" />
            <span>App installed and running offline mode enabled!</span>
          </div>
        ) : isInstallable ? (
          <button
            onClick={onInstallApp}
            className="w-full px-3 py-2 bg-gradient-to-r from-pink-500 to-indigo-600 hover:from-pink-600 hover:to-indigo-700 text-white rounded-md transition text-xs font-semibold flex items-center justify-center gap-1.5 shadow-sm hover:shadow cursor-pointer"
          >
            <Download size={15} />
            <span>Install App on Device</span>
          </button>
        ) : (
          <div className="p-2.5 bg-gray-50 text-gray-600 rounded-md text-xs border border-gray-100 leading-normal">
            <span className="font-medium text-gray-700">How to install manually:</span>
            <ul className="list-disc list-inside mt-1 space-y-1 text-gray-500">
              <li>On <strong className="text-gray-700">iOS Safari</strong>: tap Share <span className="inline-block px-1">⎋</span> and select <strong className="text-gray-700">Add to Home Screen</strong>.</li>
              <li>On <strong className="text-gray-700">Chrome/Edge</strong>: click the install icon <span className="inline-block px-1 font-mono text-[10px] bg-gray-200 rounded">⊕</span> in the address bar.</li>
            </ul>
          </div>
        )}
      </div>
    </div>
  );
};
