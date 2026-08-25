'use client';

import React, { useState } from 'react';
import { 
  CustomerTrackingData, 
  CustomerTrackingShipment, 
  TrackingEvent 
} from '../../types/customer';
import { getTrackingStatusMeta } from '../../utils/trackingStatus';
import { 
  Truck, 
  MapPin, 
  Clock, 
  ExternalLink, 
  AlertCircle, 
  RefreshCw, 
  CheckCircle2, 
  Package,
  Layers
} from 'lucide-react';

export interface OrderTrackingTimelineProps {
  trackingData?: CustomerTrackingData | null;
  shipments?: CustomerTrackingShipment[];
  isLoading?: boolean;
  isFetching?: boolean;
  error?: Error | string | null;
  onRetry?: () => void;
  showExternalLink?: boolean;
  compact?: boolean;
}

export const OrderTrackingTimeline: React.FC<OrderTrackingTimelineProps> = ({
  trackingData,
  shipments: explicitShipments,
  isLoading = false,
  isFetching = false,
  error = null,
  onRetry,
  showExternalLink = true,
  compact = false,
}) => {
  // Normalize shipments list
  const shipmentsList: CustomerTrackingShipment[] = 
    explicitShipments || 
    trackingData?.shipments || 
    [];

  const [activeShipmentIndex, setActiveShipmentIndex] = useState<number>(0);
  const currentShipment = shipmentsList[activeShipmentIndex] || shipmentsList[0] || null;

  // Format date time helper
  const formatEventDate = (timestampStr?: string) => {
    if (!timestampStr) return null;
    try {
      const d = new Date(timestampStr);
      if (isNaN(d.getTime())) return timestampStr;
      return d.toLocaleDateString(undefined, {
        month: 'short',
        day: 'numeric',
        year: 'numeric',
        hour: '2-digit',
        minute: '2-digit',
      });
    } catch {
      return timestampStr;
    }
  };

  // Loading State
  if (isLoading) {
    return (
      <div className="space-y-4 animate-pulse">
        <div className="p-4 bg-gray-50 rounded-xl border border-gray-200 flex items-center justify-between">
          <div className="space-y-2">
            <div className="w-24 h-4 bg-gray-200 rounded" />
            <div className="w-36 h-5 bg-gray-200 rounded" />
          </div>
          <div className="w-20 h-6 bg-gray-200 rounded-md" />
        </div>
        <div className="space-y-6 pt-2 pl-4">
          <div className="flex items-start gap-4">
            <div className="w-6 h-6 rounded-full bg-gray-200" />
            <div className="space-y-2 flex-1">
              <div className="w-32 h-4 bg-gray-200 rounded" />
              <div className="w-48 h-3 bg-gray-100 rounded" />
            </div>
          </div>
          <div className="flex items-start gap-4">
            <div className="w-6 h-6 rounded-full bg-gray-200" />
            <div className="space-y-2 flex-1">
              <div className="w-28 h-4 bg-gray-200 rounded" />
              <div className="w-40 h-3 bg-gray-100 rounded" />
            </div>
          </div>
        </div>
      </div>
    );
  }

  // Error State
  if (error) {
    const errorMsg = typeof error === 'string' ? error : error.message || 'Unable to load real-time tracking information.';
    return (
      <div className="p-6 bg-rose-50/70 border border-rose-200 rounded-xl text-center space-y-3">
        <div className="w-10 h-10 bg-rose-100 text-rose-600 rounded-full flex items-center justify-center mx-auto">
          <AlertCircle size={20} />
        </div>
        <div>
          <h4 className="text-xs font-bold text-gray-900">Tracking Info Unavailable</h4>
          <p className="text-xs text-gray-600 mt-1 max-w-sm mx-auto">{errorMsg}</p>
        </div>
        {onRetry && (
          <button
            onClick={onRetry}
            disabled={isFetching}
            className="px-3 py-1.5 bg-white hover:bg-rose-100 text-rose-700 font-semibold text-xs rounded-lg border border-rose-200 transition-colors inline-flex items-center gap-1.5 cursor-pointer disabled:opacity-50"
          >
            <RefreshCw size={13} className={isFetching ? 'animate-spin' : ''} />
            <span>Retry Tracking</span>
          </button>
        )}
      </div>
    );
  }

  // No Shipments / Unshipped State
  if (!currentShipment || shipmentsList.length === 0) {
    return (
      <div className="p-6 sm:p-8 bg-gray-50/60 rounded-xl border border-dashed border-gray-200 text-center space-y-2">
        <div className="w-12 h-12 bg-white text-gray-400 rounded-full flex items-center justify-center mx-auto border border-gray-200 shadow-2xs">
          <Package size={22} className="text-gray-400" />
        </div>
        <h4 className="text-xs font-bold text-gray-900">Order Processing Initiated</h4>
        <p className="text-xs text-gray-500 max-w-sm mx-auto leading-relaxed">
          This order has not been dispatched yet. Live carrier tracking checkpoints will appear once the package is dispatched.
        </p>
      </div>
    );
  }

  // Resolve Carrier, Tracking ID, Status, and Events for selected shipment
  const carrier = currentShipment.carrier || currentShipment.carrierName || 'Courier Partner';
  const trackingNumber = currentShipment.trackingNumber || '';
  const trackingUrl = currentShipment.trackingUrl;
  const shipmentStatus = currentShipment.status || 'IN_TRANSIT';
  const statusMeta = getTrackingStatusMeta(shipmentStatus);
  const events: TrackingEvent[] = Array.isArray(currentShipment.events) ? currentShipment.events : [];

  return (
    <div className="space-y-5">
      
      {/* Multi-Package Selector Tabs (if multiple shipments exist) */}
      {shipmentsList.length > 1 && (
        <div className="flex items-center gap-2 overflow-x-auto pb-1 scrollbar-none border-b border-gray-100">
          <div className="flex items-center gap-1.5 text-xs font-bold text-gray-600 mr-2 flex-shrink-0">
            <Layers size={14} className="text-[#DC2B53]" />
            <span>Packages ({shipmentsList.length}):</span>
          </div>
          {shipmentsList.map((shp, idx) => {
            const isSelected = activeShipmentIndex === idx;
            const pkgCarrier = shp.carrier || shp.carrierName || `Package ${idx + 1}`;
            return (
              <button
                key={shp.id || idx}
                onClick={() => setActiveShipmentIndex(idx)}
                className={`px-3 py-1.5 rounded-lg text-xs font-semibold whitespace-nowrap transition-colors border cursor-pointer ${
                  isSelected
                    ? 'bg-[#111827] text-white border-[#111827] shadow-2xs'
                    : 'bg-white text-gray-700 border-gray-200 hover:bg-gray-50'
                }`}
              >
                <span>{pkgCarrier}</span>
                {shp.trackingNumber && (
                  <span className={`ml-1.5 text-[10px] font-mono ${isSelected ? 'text-gray-300' : 'text-gray-400'}`}>
                    #{shp.trackingNumber.slice(-6)}
                  </span>
                )}
              </button>
            );
          })}
        </div>
      )}

      {/* Shipment Header Banner */}
      <div className={`p-4 bg-gray-50 rounded-xl border border-gray-100 flex flex-col sm:flex-row sm:items-center justify-between gap-3 ${compact ? 'text-xs' : ''}`}>
        <div className="space-y-1">
          <div className="flex flex-wrap items-center gap-2">
            <span className="text-xs font-bold text-gray-900">{carrier}</span>
            <span className={`px-2 py-0.5 rounded-md text-[10px] font-bold border ${statusMeta.badgeClass}`}>
              {statusMeta.label}
            </span>
          </div>
          <div className="flex items-center gap-2 text-xs text-gray-500 font-medium">
            <span>Tracking #:</span>
            <span className="font-mono font-bold text-[#DC2B53]">
              {trackingNumber || 'Pending assignment'}
            </span>
          </div>
          {currentShipment.estimatedDeliveryDate && (
            <div className="text-[11px] text-gray-500 font-normal">
              Est. Delivery: <strong className="text-gray-800">{currentShipment.estimatedDeliveryDate}</strong>
            </div>
          )}
        </div>

        {/* External Courier Tracking Action */}
        {showExternalLink && trackingUrl && (
          <a
            href={trackingUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center justify-center gap-1.5 px-3 py-2 bg-white hover:bg-gray-50 text-gray-800 border border-gray-200 rounded-lg text-xs font-semibold transition-colors shadow-2xs group flex-shrink-0"
            title="Open tracking page in new tab"
          >
            <Truck size={14} className="text-[#DC2B53]" />
            <span>Track with Courier</span>
            <ExternalLink size={12} className="text-gray-400 group-hover:text-gray-700" />
          </a>
        )}
      </div>

      {/* Vertical Timeline of Events */}
      {events.length > 0 ? (
        <div className="space-y-6 pt-2 pl-2 relative before:absolute before:left-[19px] before:top-4 before:bottom-4 before:w-0.5 before:bg-gray-200">
          {events.map((event, idx) => {
            const eventMeta = getTrackingStatusMeta(event.status);
            const isLast = idx === events.length - 1;
            const isFirst = idx === 0;
            const isCompleted = event.completed ?? (idx < events.length - 1 || event.status?.toUpperCase() === 'DELIVERED');
            const isCurrent = event.current ?? (isFirst && !isCompleted);
            const eventDate = formatEventDate(event.timestamp || event.date || event.createdAt);

            return (
              <div key={event.id || idx} className="flex items-start gap-4 relative group">
                
                {/* Timeline Node Dot */}
                <div
                  className={`w-7 h-7 rounded-full flex items-center justify-center z-10 text-xs flex-shrink-0 transition-all ${
                    isCurrent
                      ? 'bg-[#DC2B53] text-white ring-4 ring-[#DC2B53]/20 shadow-xs'
                      : isCompleted
                      ? 'bg-emerald-600 text-white'
                      : 'bg-white border-2 border-gray-300 text-gray-400'
                  }`}
                >
                  {isCompleted ? (
                    <CheckCircle2 size={15} />
                  ) : isCurrent ? (
                    <Truck size={14} />
                  ) : (
                    <Clock size={13} />
                  )}
                </div>

                {/* Event Content */}
                <div className="flex-1 min-w-0 bg-white p-3.5 rounded-xl border border-gray-100 shadow-2xs group-hover:border-gray-200 transition-colors">
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-1">
                    <div className="flex items-center gap-2">
                      <span className={`text-xs font-bold ${isCurrent || isCompleted ? 'text-gray-900' : 'text-gray-500'}`}>
                        {event.label || event.title || eventMeta.label}
                      </span>
                      {isCurrent && (
                        <span className="px-1.5 py-0.5 bg-[#DC2B53]/10 text-[#DC2B53] rounded text-[10px] font-bold">
                          Latest Update
                        </span>
                      )}
                    </div>
                    {eventDate && (
                      <span className="text-[11px] text-gray-400 font-medium">
                        {eventDate}
                      </span>
                    )}
                  </div>

                  {event.description && (
                    <p className="text-xs text-gray-600 font-normal mt-1 leading-relaxed">
                      {event.description}
                    </p>
                  )}

                  {event.location && (
                    <div className="flex items-center gap-1.5 text-[11px] text-gray-500 font-medium mt-1.5">
                      <MapPin size={12} className="text-[#DC2B53]" />
                      <span>{event.location}</span>
                    </div>
                  )}
                </div>

              </div>
            );
          })}
        </div>
      ) : (
        <div className="py-6 px-4 bg-gray-50/50 rounded-xl border border-gray-100 text-center space-y-1.5">
          <Clock size={22} className="mx-auto text-gray-400" />
          <div className="text-xs font-bold text-gray-800">Tracking milestones registered</div>
          <p className="text-[11px] text-gray-500 max-w-xs mx-auto">
            Package details dispatched with {carrier}. Specific regional hub checkpoints will display as the driver scans the parcel barcode.
          </p>
        </div>
      )}

    </div>
  );
};
