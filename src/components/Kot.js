import React from "react";

export default function Kot({ kotData, onClose, onPrint }) {
  if (!kotData) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-4">
      {/* Modal */}
      <div className="flex max-h-[95vh] w-full max-w-md flex-col overflow-hidden rounded-xl bg-white shadow-2xl">

        {/* Modal Header */}
        <div className="flex items-center justify-between border-b bg-gray-50 px-5 py-4">
          <div>
            <h2 className="text-lg font-semibold text-gray-900">
              KOT Preview
            </h2>

            <p className="text-xs text-gray-500">
              Review before printing
            </p>
          </div>

          <button
            onClick={onClose}
            className="rounded-lg p-2 text-gray-500 hover:bg-gray-200 hover:text-gray-800"
          >
            ✕
          </button>
        </div>

        {/* Preview Area */}
        <div className="flex-1 overflow-y-auto bg-gray-200 p-5">

          {/* Thermal paper */}
          <div
            id="kot-print"
            className="mx-auto w-[80mm] max-w-full bg-white p-4 font-mono text-sm text-black shadow-md"
          >

            {/* KOT Header */}
            <div className="border-b-2 border-black pb-3 text-center">
              <h1 className="text-xl font-bold tracking-widest">
                KITCHEN ORDER
              </h1>

              <p className="mt-1 text-xs">
                KOT
              </p>
            </div>

            {/* Order Information */}
            <div className="border-b border-dashed border-black py-3 text-xs">
              <div className="flex justify-between">
                <span className="font-bold">Time: {new Date().toLocaleString()}</span>
                <span></span>
              </div>
            </div>

            {/* Items Header */}
            <div className="grid grid-cols-2 border-b border-black py-2 font-bold">
              <span>ITEM</span>
              <span>QTY</span>
              
            </div>

            {/* Items */}
            <div>
              {kotData?.map((item, index) => (
                <div
                  key={item.id || index}
                  className="border-b border-dashed border-gray-400 py-3"
                >
                  <div className="grid grid-cols-2">
                   

                    <span className="font-bold uppercase">
                      {item.name}
                    </span>

                     <span className="text-lg font-bold">
                      {item.kotQty}
                    </span>
                  </div>

                
                  
                
                </div>
              ))}

                <div className="mt-1 text-xs">
                      <span className="font-bold">NOTE:</span>{" "}
                      <textarea className="text-gray-200 border-gray-600 border-gray-300 w-full">

                      </textarea>
                    </div>
            </div>

            {/* Footer */}
            <div className="border-t-2 border-black pt-3 text-center">
              <p className="font-bold">
                *** KITCHEN COPY ***
              </p>
            </div>
          </div>
        </div>

        {/* Footer Buttons */}
        <div className="flex gap-3 border-t bg-white px-5 py-4">

          <button
            type="button"
            onClick={onClose}
            className="flex-1 rounded-lg border border-gray-300 px-4 py-3 font-medium text-gray-700 hover:bg-gray-100"
          >
            Close
          </button>

          <button
            type="button"
            onClick={onPrint}
            className="flex-1 rounded-lg bg-black px-4 py-3 font-semibold text-white hover:bg-gray-800"
          >
            🖨 Print KOT
          </button>

        </div>
      </div>
    </div>
  );
}