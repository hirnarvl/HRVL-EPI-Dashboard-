import React, { useEffect, useRef, useState } from 'react';
import L from 'leaflet';
import { 
  Compass, 
  Flame, 
  Building2, 
  Layers, 
  Eye, 
  ShieldAlert, 
  MapPin, 
  Info,
  Check,
  ZoomIn,
  ZoomOut,
  RotateCcw,
  Globe,
  Mountain,
  Moon,
  Sun,
  Search,
  Crosshair,
  Activity,
  AlertTriangle
} from 'lucide-react';
import { Outbreak, SurveillanceRecord, WoredaInfo } from '../types';
import { HARARGHE_WOREDAS, HIRNA_LAB_COORDS } from '../data/woredas';
import { 
  ETHIOPIA_NATIONAL_GEOJSON, 
  OROMIA_REGION_GEOJSON, 
  HARARGHE_WOREDAS_GEOJSON 
} from '../data/geoData';

interface OutbreakMapProps {
  outbreaks: Outbreak[];
  records: SurveillanceRecord[];
  darkMode: boolean;
  selectedZone: string;
}

type BasemapType = 'satellite' | 'hybrid' | 'topo' | 'voyager' | 'dark';
type PolygonStyleMode = 'transparent' | 'risk_heatmap' | 'zone_color' | 'cluster_hotspots';

export const OutbreakMap: React.FC<OutbreakMapProps> = ({
  outbreaks,
  records,
  darkMode,
  selectedZone
}) => {
  const mapContainerRef = useRef<HTMLDivElement>(null);
  const mapInstanceRef = useRef<L.Map | null>(null);
  const geoJsonGroupRef = useRef<L.LayerGroup | null>(null);
  const tileLayerGroupRef = useRef<L.LayerGroup | null>(null);

  // Basemap & Polygon Style States
  const [basemap, setBasemap] = useState<BasemapType>(darkMode ? 'dark' : 'hybrid');
  const [polygonMode, setPolygonMode] = useState<PolygonStyleMode>('cluster_hotspots');
  const [selectedDiseaseFilter, setSelectedDiseaseFilter] = useState<string>('All');
  const [showHotspotRings, setShowHotspotRings] = useState<boolean>(true);

  // Layer Visibility Toggles
  const [showEthiopiaBoundary, setShowEthiopiaBoundary] = useState(true);
  const [showOromiaBoundary, setShowOromiaBoundary] = useState(true);
  const [showEastHarargheWoredas, setShowEastHarargheWoredas] = useState(true);
  const [showWestHarargheWoredas, setShowWestHarargheWoredas] = useState(true);
  const [showOutbreakMarkers, setShowOutbreakMarkers] = useState(true);
  const [showLabHub, setShowLabHub] = useState(true);

  // Selected Inspect items
  const [selectedOutbreak, setSelectedOutbreak] = useState<Outbreak | null>(outbreaks[0] || null);
  const [selectedWoreda, setSelectedWoreda] = useState<WoredaInfo | null>(null);
  const [severityFilter, setSeverityFilter] = useState<'All' | 'Active' | 'Critical'>('All');

  // Default Hararghe Region Center (Hirna Laboratory Hub ~9.05° N, 41.35° E)
  const defaultCenter: [number, number] = [9.05, 41.35];
  const defaultZoom = 8;

  // Filtered outbreaks
  const filteredOutbreaks = outbreaks.filter(ob => {
    if (selectedZone !== 'All' && ob.zone !== selectedZone) return false;
    if (selectedDiseaseFilter !== 'All' && !ob.disease.toLowerCase().includes(selectedDiseaseFilter.toLowerCase())) return false;
    if (severityFilter === 'Active' && ob.status !== 'Active') return false;
    if (severityFilter === 'Critical' && ob.cfr < 15) return false;
    return true;
  });

  // Calculate Woreda Disease Burden Map (Woreda Name -> Total Cases)
  const woredaCaseMap = React.useMemo(() => {
    const map: Record<string, number> = {};
    records.forEach(r => {
      const wName = r.woreda.trim().toLowerCase();
      map[wName] = (map[wName] || 0) + (r.cases || 0);
    });
    outbreaks.forEach(o => {
      const wName = o.woreda.trim().toLowerCase();
      map[wName] = (map[wName] || 0) + (o.cases || 0);
    });
    return map;
  }, [records, outbreaks]);

  // Sync dark mode preference with default basemap if user hasn't manually overridden
  useEffect(() => {
    if (darkMode && (basemap === 'voyager' || basemap === 'topo')) {
      setBasemap('dark');
    } else if (!darkMode && basemap === 'dark') {
      setBasemap('hybrid');
    }
  }, [darkMode]);

  // Initialize Map Instance
  useEffect(() => {
    if (!mapContainerRef.current) return;

    if (!mapInstanceRef.current) {
      const map = L.map(mapContainerRef.current, {
        center: defaultCenter,
        zoom: defaultZoom,
        zoomControl: false,
        attributionControl: false
      });

      mapInstanceRef.current = map;
      tileLayerGroupRef.current = L.layerGroup().addTo(map);
      geoJsonGroupRef.current = L.layerGroup().addTo(map);
    }
  }, []);

  // Update Basemap Tiles dynamically
  useEffect(() => {
    const map = mapInstanceRef.current;
    const tileGroup = tileLayerGroupRef.current;
    if (!map || !tileGroup) return;

    tileGroup.clearLayers();

    let primaryUrl = '';
    let labelUrl = '';

    switch (basemap) {
      case 'satellite':
        primaryUrl = 'https://server.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer/tile/{z}/{y}/{x}';
        break;
      case 'hybrid':
        primaryUrl = 'https://server.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer/tile/{z}/{y}/{x}';
        labelUrl = 'https://server.arcgisonline.com/ArcGIS/rest/services/Reference/World_Transportation/MapServer/tile/{z}/{y}/{x}';
        break;
      case 'topo':
        primaryUrl = 'https://{s}.tile.opentopomap.org/{z}/{x}/{y}.png';
        break;
      case 'voyager':
        primaryUrl = 'https://{s}.basemaps.cartocdn.com/rastertiles/voyager/{z}/{x}/{y}{r}.png';
        break;
      case 'dark':
      default:
        primaryUrl = 'https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png';
        break;
    }

    const primaryLayer = L.tileLayer(primaryUrl, {
      maxZoom: 18,
      subdomains: 'abcd',
      attribution: 'HRVL GIS Surveillance System'
    });
    tileGroup.addLayer(primaryLayer);

    if (labelUrl) {
      const labelLayer = L.tileLayer(labelUrl, {
        maxZoom: 18,
        subdomains: 'abcd'
      });
      tileGroup.addLayer(labelLayer);
    }

  }, [basemap]);

  // Update GeoJSON Layers & Markers
  useEffect(() => {
    const map = mapInstanceRef.current;
    const geoGroup = geoJsonGroupRef.current;
    if (!map || !geoGroup) return;

    geoGroup.clearLayers();

    // -------------------------------------------------------------
    // 1. ETHIOPIA NATIONAL BORDER (Gold Metallic Double Outline)
    // -------------------------------------------------------------
    if (showEthiopiaBoundary) {
      const ethLayer = L.geoJSON(ETHIOPIA_NATIONAL_GEOJSON as any, {
        style: {
          color: basemap === 'satellite' || basemap === 'hybrid' ? '#fbbf24' : '#d97706',
          weight: 3.5,
          dashArray: '8, 6',
          fillColor: '#f59e0b',
          fillOpacity: 0.02
        }
      });

      ethLayer.bindTooltip('🇪🇹 <b>Federal Democratic Republic of Ethiopia</b><br/>National Boundary Outline', {
        sticky: true,
        className: 'leaflet-custom-tooltip'
      });

      geoGroup.addLayer(ethLayer);
    }

    // -------------------------------------------------------------
    // 2. OROMIA REGIONAL STATE BORDER (Emerald Contour Outline)
    // -------------------------------------------------------------
    if (showOromiaBoundary) {
      const oromiaLayer = L.geoJSON(OROMIA_REGION_GEOJSON as any, {
        style: {
          color: basemap === 'satellite' || basemap === 'hybrid' ? '#34d399' : '#059669',
          weight: 2.5,
          fillColor: '#10b981',
          fillOpacity: 0.04
        }
      });

      oromiaLayer.bindTooltip('🗺️ <b>Oromia Regional State</b><br/>Regional Surveillance Zone', {
        sticky: true,
        className: 'leaflet-custom-tooltip'
      });

      geoGroup.addLayer(oromiaLayer);
    }

    // -------------------------------------------------------------
    // 3. WEST & EAST HARARGHE 36 WOREDA REALISTIC POLYGONS
    // -------------------------------------------------------------
    if (showEastHarargheWoredas || showWestHarargheWoredas) {
      const harargheLayer = L.geoJSON(HARARGHE_WOREDAS_GEOJSON as any, {
        filter: (feature) => {
          const zone = feature.properties.zone;
          if (selectedZone !== 'All' && zone !== selectedZone) return false;
          if (zone === 'East Hararghe' && !showEastHarargheWoredas) return false;
          if (zone === 'West Hararghe' && !showWestHarargheWoredas) return false;
          return true;
        },
        style: (feature) => {
          const props = feature?.properties;
          const isEast = props.zone === 'East Hararghe';
          const cases = woredaCaseMap[props.name.toLowerCase()] || 0;

          // Light line woreda-level boundary outline styling
          let strokeColor = basemap === 'satellite' || basemap === 'hybrid'
            ? 'rgba(255, 255, 255, 0.75)'
            : darkMode
            ? '#64748b'
            : '#94a3b8';
          
          let fillColor = 'transparent';
          let fillOpacity = 0.02;

          if (polygonMode === 'risk_heatmap') {
            if (cases > 50) {
              fillColor = '#ef4444';
              fillOpacity = 0.40;
              strokeColor = '#f87171';
            } else if (cases > 20) {
              fillColor = '#f97316';
              fillOpacity = 0.30;
              strokeColor = '#fb923c';
            } else if (cases > 0) {
              fillColor = '#eab308';
              fillOpacity = 0.20;
              strokeColor = '#facc15';
            } else {
              fillColor = '#10b981';
              fillOpacity = 0.12;
              strokeColor = '#34d399';
            }
          } else if (polygonMode === 'zone_color') {
            fillColor = isEast ? '#3b82f6' : '#8b5cf6';
            fillOpacity = 0.15;
            strokeColor = isEast ? '#93c5fd' : '#c084fc';
          } else if (polygonMode === 'cluster_hotspots') {
            fillColor = isEast ? 'rgba(59, 130, 246, 0.05)' : 'rgba(168, 85, 247, 0.05)';
            fillOpacity = 0.08;
            strokeColor = basemap === 'satellite' || basemap === 'hybrid' ? 'rgba(255, 255, 255, 0.8)' : '#94a3b8';
          }

          // Highlight if selected
          const isSelected = selectedWoreda?.name === props.name;
          if (isSelected) {
            fillColor = '#3b82f6';
            fillOpacity = 0.45;
            strokeColor = '#ffffff';
          }

          return {
            color: strokeColor,
            weight: isSelected ? 3 : 1.2,
            dashArray: undefined, // Crisp, clean light line boundary stroke
            fillColor,
            fillOpacity
          };
        },
        onEachFeature: (feature, layer) => {
          const props = feature.properties;
          const cases = woredaCaseMap[props.name.toLowerCase()] || 0;
          const isEast = props.zone === 'East Hararghe';

          layer.bindTooltip(`
            <div style="font-family: sans-serif; padding: 4px 6px; min-width: 140px;">
              <div style="font-weight: 800; font-size: 13px; color: ${isEast ? '#3b82f6' : '#a855f7'};">
                📍 ${props.name} Woreda
              </div>
              <div style="font-size: 11px; color: #94a3b8; margin-bottom: 3px;">
                Zone: ${props.zone}
              </div>
              <div style="font-size: 11px; font-weight: 700; color: ${cases > 0 ? '#ef4444' : '#10b981'};">
                ${cases > 0 ? `🔥 ${cases} Total Cases Logged` : '✅ Zero Active Outbreaks'}
              </div>
              <div style="font-size: 10px; color: #cbd5e1; margin-top: 2px;">
                Pop: ${(props.populationEstimate || 0).toLocaleString()}
              </div>
            </div>
          `, { sticky: true });

          layer.on({
            mouseover: (e) => {
              const l = e.target;
              l.setStyle({
                fillColor: isEast ? '#60a5fa' : '#c084fc',
                fillOpacity: 0.35,
                weight: 3
              });
            },
            mouseout: (e) => {
              harargheLayer.resetStyle(e.target);
            },
            click: () => {
              const matchedW = HARARGHE_WOREDAS.find(w => w.name === props.name);
              if (matchedW) {
                setSelectedWoreda(matchedW);
                setSelectedOutbreak(null);
                map.flyTo([matchedW.lat, matchedW.lng], 10, { duration: 1.2 });
              }
            }
          });
        }
      });

      geoGroup.addLayer(harargheLayer);
    }

    // -------------------------------------------------------------
    // 4. HIRNA REGIONAL VETERINARY LABORATORY (HRVL) HUB MARKER
    // -------------------------------------------------------------
    if (showLabHub) {
      const labIcon = L.divIcon({
        className: 'custom-leaflet-icon',
        html: `
          <div style="
            position: relative;
            width: 38px;
            height: 38px;
            background: linear-gradient(135deg, #059669 0%, #047857 100%);
            border: 3px solid #ffffff;
            border-radius: 50%;
            display: flex;
            align-items: center;
            justify-content: center;
            color: white;
            box-shadow: 0 0 20px rgba(16, 185, 129, 0.6);
            cursor: pointer;
          ">
            <span style="
              position: absolute;
              inset: -8px;
              border-radius: 50%;
              background-color: rgba(16, 185, 129, 0.35);
              animation: ping 1.8s cubic-bezier(0, 0, 0.2, 1) infinite;
            "></span>
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round">
              <path d="M6 22V4a2 2 0 0 1 2-2h8a2 2 0 0 1 2 2v18Z"/>
              <path d="M6 12H4a2 2 0 0 0-2 2v6a2 2 0 0 0 2 2h2"/>
              <path d="M18 9h2a2 2 0 0 1 2 2v9a2 2 0 0 1-2 2h-2"/>
              <path d="M10 6h4"/>
              <path d="M10 10h4"/>
              <path d="M10 14h4"/>
            </svg>
          </div>
        `,
        iconSize: [38, 38],
        iconAnchor: [19, 19]
      });

      const labMarker = L.marker([HIRNA_LAB_COORDS.lat, HIRNA_LAB_COORDS.lng], { icon: labIcon });
      labMarker.bindTooltip(`
        <div style="font-family: sans-serif; padding: 4px 6px;">
          <b style="color: #10b981; font-size: 13px;">🏢 Hirna Regional Veterinary Laboratory (HRVL)</b><br/>
          <span style="font-size: 11px; color: #e2e8f0;">Central Epidemiology & Diagnostics Hub</span>
        </div>
      `, { sticky: true });

      geoGroup.addLayer(labMarker);
    }

    // -------------------------------------------------------------
    // 5. DYNAMIC CLUSTER HOTSPOT TRANSMISSION RINGS (CONCENTRIC HEAT BUFFER)
    // -------------------------------------------------------------
    if (showHotspotRings || polygonMode === 'cluster_hotspots') {
      filteredOutbreaks.forEach((ob) => {
        // Calculate cluster radius based on cases and CFR severity
        const baseRadiusKm = Math.min(Math.max(ob.cases * 120, 8000), 28000); // meters
        const isHighSeverity = ob.cfr > 10 || ob.cases > 100;
        const ringColor = isHighSeverity ? '#ef4444' : '#f97316';

        // Outer Buffer Zone (Surveillance Monitoring Ring)
        const outerCircle = L.circle([ob.lat, ob.lng], {
          radius: baseRadiusKm * 1.5,
          color: ringColor,
          weight: 1.5,
          dashArray: '6, 6',
          fillColor: ringColor,
          fillOpacity: 0.08
        });

        // Inner Core Ring (High Transmission Ring)
        const innerCircle = L.circle([ob.lat, ob.lng], {
          radius: baseRadiusKm * 0.7,
          color: ringColor,
          weight: 2.5,
          fillColor: ringColor,
          fillOpacity: 0.22
        });

        const clusterTooltip = `
          <div style="font-family: sans-serif; padding: 6px 8px; min-width: 170px;">
            <div style="font-weight: 800; font-size: 13px; color: ${ringColor}; display: flex; align-items: center; gap: 4px;">
              <span>🔥 Dynamic Hotspot Cluster Analysis</span>
            </div>
            <div style="font-size: 11px; font-weight: 700; color: #f8fafc; margin-top: 2px;">
              ${ob.disease} (${ob.woreda})
            </div>
            <div style="font-size: 11px; color: #cbd5e1; margin-top: 4px;">
              • Active Transmission Buffer: <b>${(baseRadiusKm / 1000).toFixed(1)} km</b><br/>
              • Cluster Cases: <b>${ob.cases} animals</b><br/>
              • Lethality (CFR): <b>${ob.cfr}%</b><br/>
              • Risk Category: <b style="color: ${ringColor};">${isHighSeverity ? 'CRITICAL HOTSPOT' : 'HIGH SPREAD'}</b>
            </div>
          </div>
        `;

        outerCircle.bindTooltip(clusterTooltip, { sticky: true });
        innerCircle.bindTooltip(clusterTooltip, { sticky: true });

        geoGroup.addLayer(outerCircle);
        geoGroup.addLayer(innerCircle);
      });
    }

    // -------------------------------------------------------------
    // 6. PULSING OUTBREAK RADAR MARKERS
    // -------------------------------------------------------------
    if (showOutbreakMarkers) {
      filteredOutbreaks.forEach((ob) => {
        const isCritical = ob.cfr > 15;
        const colorHex = isCritical ? '#ef4444' : ob.status === 'Contained' ? '#10b981' : '#f97316';
        const isSelected = selectedOutbreak?.id === ob.id;

        const icon = L.divIcon({
          className: 'custom-leaflet-outbreak-icon',
          html: `
            <div style="
              position: relative;
              width: ${isSelected ? '36px' : '28px'};
              height: ${isSelected ? '36px' : '28px'};
              background-color: ${colorHex};
              border: ${isSelected ? '3.5px solid #ffffff' : '2.5px solid #0f172a'};
              border-radius: 50%;
              display: flex;
              align-items: center;
              justify-content: center;
              color: white;
              box-shadow: 0 4px 14px rgba(0,0,0,0.6);
              transition: all 0.2s ease;
              cursor: pointer;
            ">
              <span style="
                position: absolute;
                inset: -8px;
                border-radius: 50%;
                background-color: ${colorHex};
                opacity: 0.4;
                animation: ping 1.9s cubic-bezier(0, 0, 0.2, 1) infinite;
              "></span>
              <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round">
                <path d="M8.5 14.5A2.5 2.5 0 0 0 11 12c0-1.38-.5-2-1-3-1.072-2.143-.224-4.054 2-6 .5 2.5 2 4.9 4 6.5 2 1.6 3 3.5 3 5.5a7 7 0 1 1-14 0c0-1.153.433-2.294 1-3a2.5 2.5 0 0 0 2.5 3.5Z"/>
              </svg>
            </div>
          `,
          iconSize: [isSelected ? 36 : 28, isSelected ? 36 : 28],
          iconAnchor: [isSelected ? 18 : 14, isSelected ? 18 : 14]
        });

        const marker = L.marker([ob.lat, ob.lng], { icon });

        marker.on('click', () => {
          setSelectedOutbreak(ob);
          setSelectedWoreda(null);
          map.flyTo([ob.lat, ob.lng], 10, { duration: 1.0 });
        });

        marker.bindTooltip(`
          <div style="font-family: sans-serif; padding: 4px 6px;">
            <b style="color: ${colorHex}; font-size: 13px;">${ob.disease} Outbreak</b><br/>
            <span>📍 ${ob.woreda} (${ob.zone})</span><br/>
            <b>Cases: ${ob.cases} | Fatalities: ${ob.deaths} | CFR: ${ob.cfr}%</b>
          </div>
        `, { sticky: true });

        geoGroup.addLayer(marker);
      });
    }

  }, [
    basemap,
    polygonMode,
    showEthiopiaBoundary,
    showOromiaBoundary,
    showEastHarargheWoredas,
    showWestHarargheWoredas,
    showOutbreakMarkers,
    showLabHub,
    filteredOutbreaks,
    selectedZone,
    selectedOutbreak,
    selectedWoreda,
    woredaCaseMap
  ]);

  // Quick Fly-to Woreda
  const handleWoredaSelect = (wName: string) => {
    const w = HARARGHE_WOREDAS.find(item => item.name.toLowerCase() === wName.toLowerCase());
    if (w) {
      setSelectedWoreda(w);
      setSelectedOutbreak(null);
      mapInstanceRef.current?.flyTo([w.lat, w.lng], 10, { duration: 1.2 });
    }
  };

  // Map Controls (Zoom / Reset)
  const handleZoomIn = () => mapInstanceRef.current?.zoomIn();
  const handleZoomOut = () => mapInstanceRef.current?.zoomOut();
  const handleResetView = () => mapInstanceRef.current?.flyTo(defaultCenter, defaultZoom, { duration: 1.0 });

  return (
    <div className="bg-white dark:bg-slate-900 rounded-xl border border-slate-200 dark:border-slate-800 shadow-sm p-4 transition-colors">
      
      {/* Top Map Header & Controls */}
      <div className="flex flex-col xl:flex-row xl:items-center justify-between pb-3 border-b border-slate-200 dark:border-slate-800 gap-3">
        <div>
          <div className="flex items-center space-x-2">
            <Globe className="w-5 h-5 text-emerald-600 dark:text-emerald-400 animate-pulse" />
            <h2 className="text-base font-bold text-slate-900 dark:text-white flex items-center gap-2">
              <span>Geospatial Disease Surveillance & Realistic GIS Boundary Map</span>
              <span className="px-2 py-0.5 text-[10px] font-extrabold rounded-full bg-emerald-100 text-emerald-800 dark:bg-emerald-950 dark:text-emerald-300 border border-emerald-300 dark:border-emerald-700">
                REAL-TIME HARARGHE GIS
              </span>
            </h2>
          </div>
          <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
            Photorealistic satellite imagery, elevation terrain contouring, and organic polygon boundaries across East (21) & West (15) Hararghe Woredas.
          </p>
        </div>

        {/* Layer Visibility & Basemap Mode Toggles */}
        <div className="flex flex-wrap items-center gap-2 text-xs">
          
          {/* Basemap Selection Group */}
          <div className="flex items-center bg-slate-100 dark:bg-slate-800 p-1 rounded-lg border border-slate-200 dark:border-slate-700">
            <button
              onClick={() => setBasemap('hybrid')}
              className={`flex items-center space-x-1 px-2.5 py-1 rounded-md text-xs font-semibold transition-all cursor-pointer ${
                basemap === 'hybrid' || basemap === 'satellite'
                  ? 'bg-emerald-600 text-white shadow-xs'
                  : 'text-slate-600 dark:text-slate-300 hover:text-slate-900 dark:hover:text-white'
              }`}
              title="ESRI High-Resolution Satellite & Labels"
            >
              <Globe className="w-3.5 h-3.5" />
              <span>🛰️ Satellite</span>
            </button>

            <button
              onClick={() => setBasemap('topo')}
              className={`flex items-center space-x-1 px-2.5 py-1 rounded-md text-xs font-semibold transition-all cursor-pointer ${
                basemap === 'topo'
                  ? 'bg-emerald-600 text-white shadow-xs'
                  : 'text-slate-600 dark:text-slate-300 hover:text-slate-900 dark:hover:text-white'
              }`}
              title="Topographic Relief Terrain Map"
            >
              <Mountain className="w-3.5 h-3.5" />
              <span>⛰️ Terrain</span>
            </button>

            <button
              onClick={() => setBasemap('voyager')}
              className={`flex items-center space-x-1 px-2.5 py-1 rounded-md text-xs font-semibold transition-all cursor-pointer ${
                basemap === 'voyager'
                  ? 'bg-emerald-600 text-white shadow-xs'
                  : 'text-slate-600 dark:text-slate-300 hover:text-slate-900 dark:hover:text-white'
              }`}
              title="Clean Crisp GIS Vector Map"
            >
              <Sun className="w-3.5 h-3.5" />
              <span>🗺️ Vector</span>
            </button>

            <button
              onClick={() => setBasemap('dark')}
              className={`flex items-center space-x-1 px-2.5 py-1 rounded-md text-xs font-semibold transition-all cursor-pointer ${
                basemap === 'dark'
                  ? 'bg-emerald-600 text-white shadow-xs'
                  : 'text-slate-600 dark:text-slate-300 hover:text-slate-900 dark:hover:text-white'
              }`}
              title="High-Tech Dark GIS Mode"
            >
              <Moon className="w-3.5 h-3.5" />
              <span>🌙 Dark GIS</span>
            </button>
          </div>

          {/* Polygon Style Mode & Hotspot Analysis */}
          <div className="flex items-center space-x-1.5">
            <select
              aria-label="Polygon Layer Styling Mode"
              value={polygonMode}
              onChange={(e) => setPolygonMode(e.target.value as any)}
              className="text-xs font-semibold bg-slate-100 dark:bg-slate-800 text-slate-800 dark:text-slate-200 border border-slate-200 dark:border-slate-700 rounded-lg px-2.5 py-1.5 focus:outline-none cursor-pointer"
            >
              <option value="cluster_hotspots">🔥 Dynamic Cluster Hotspots Mode</option>
              <option value="risk_heatmap">Outbreak Risk Heatmap Fill</option>
              <option value="zone_color">Zone Color Tint (East/West)</option>
              <option value="transparent">Boundary Lines (Transparent)</option>
            </select>

            {/* Disease Filter Dropdown */}
            <select
              aria-label="Filter Hotspots by Disease"
              value={selectedDiseaseFilter}
              onChange={(e) => setSelectedDiseaseFilter(e.target.value)}
              className="text-xs font-bold bg-amber-50 dark:bg-amber-950/70 text-amber-900 dark:text-amber-200 border border-amber-300 dark:border-amber-800 rounded-lg px-2.5 py-1.5 focus:outline-none cursor-pointer"
            >
              <option value="All">🧬 All Diseases (Cluster Analysis)</option>
              <option value="Foot-and-Mouth">FMD (Foot-and-Mouth)</option>
              <option value="Peste des Petits">PPR (Small Ruminants)</option>
              <option value="Lumpy Skin">LSD (Lumpy Skin)</option>
              <option value="Contagious Bovine">CBPP (Bovine Pleuro)</option>
              <option value="Anthrax">Anthrax (Critical Lethality)</option>
              <option value="Newcastle">Newcastle (Poultry)</option>
            </select>
          </div>

          {/* Quick Woreda Search & Zoom Dropdown */}
          <div className="relative">
            <select
              aria-label="Fly-to Woreda"
              onChange={(e) => handleWoredaSelect(e.target.value)}
              value={selectedWoreda?.name || ''}
              className="text-xs font-semibold bg-emerald-50 dark:bg-emerald-950/60 text-emerald-900 dark:text-emerald-200 border border-emerald-300 dark:border-emerald-700 rounded-lg px-2.5 py-1.5 focus:outline-none cursor-pointer"
            >
              <option value="">🎯 Fly to Woreda...</option>
              {HARARGHE_WOREDAS.map(w => (
                <option key={w.id} value={w.name}>
                  {w.name} ({w.zone === 'East Hararghe' ? 'East' : 'West'})
                </option>
              ))}
            </select>
          </div>

        </div>
      </div>

      {/* Layer Toggles Toolbar */}
      <div className="flex flex-wrap items-center gap-2 my-2 py-1 text-xs">
        <button
          onClick={() => setShowEthiopiaBoundary(!showEthiopiaBoundary)}
          className={`px-2.5 py-1 rounded-md border font-medium flex items-center space-x-1.5 cursor-pointer ${
            showEthiopiaBoundary
              ? 'bg-amber-100 dark:bg-amber-950/80 text-amber-900 dark:text-amber-300 border-amber-300 dark:border-amber-700'
              : 'bg-slate-100 dark:bg-slate-800 text-slate-400 border-slate-200 dark:border-slate-700 opacity-60'
          }`}
        >
          <span className="w-2 h-2 rounded-full bg-amber-500"></span>
          <span>🇪🇹 Ethiopia Border</span>
          {showEthiopiaBoundary && <Check className="w-3 h-3 ml-0.5" />}
        </button>

        <button
          onClick={() => setShowOromiaBoundary(!showOromiaBoundary)}
          className={`px-2.5 py-1 rounded-md border font-medium flex items-center space-x-1.5 cursor-pointer ${
            showOromiaBoundary
              ? 'bg-emerald-100 dark:bg-emerald-950/80 text-emerald-900 dark:text-emerald-300 border-emerald-300 dark:border-emerald-700'
              : 'bg-slate-100 dark:bg-slate-800 text-slate-400 border-slate-200 dark:border-slate-700 opacity-60'
          }`}
        >
          <span className="w-2 h-2 rounded-full bg-emerald-500"></span>
          <span>🗺️ Oromia Region</span>
          {showOromiaBoundary && <Check className="w-3 h-3 ml-0.5" />}
        </button>

        <button
          onClick={() => setShowEastHarargheWoredas(!showEastHarargheWoredas)}
          className={`px-2.5 py-1 rounded-md border font-medium flex items-center space-x-1.5 cursor-pointer ${
            showEastHarargheWoredas
              ? 'bg-blue-100 dark:bg-blue-950/80 text-blue-900 dark:text-blue-300 border-blue-300 dark:border-blue-700'
              : 'bg-slate-100 dark:bg-slate-800 text-slate-400 border-slate-200 dark:border-slate-700 opacity-60'
          }`}
        >
          <span className="w-2 h-2 rounded-full bg-blue-500"></span>
          <span>📍 East Hararghe Woredas (21)</span>
          {showEastHarargheWoredas && <Check className="w-3 h-3 ml-0.5" />}
        </button>

        <button
          onClick={() => setShowWestHarargheWoredas(!showWestHarargheWoredas)}
          className={`px-2.5 py-1 rounded-md border font-medium flex items-center space-x-1.5 cursor-pointer ${
            showWestHarargheWoredas
              ? 'bg-purple-100 dark:bg-purple-950/80 text-purple-900 dark:text-purple-300 border-purple-300 dark:border-purple-700'
              : 'bg-slate-100 dark:bg-slate-800 text-slate-400 border-slate-200 dark:border-slate-700 opacity-60'
          }`}
        >
          <span className="w-2 h-2 rounded-full bg-purple-500"></span>
          <span>📍 West Hararghe Woredas (15)</span>
          {showWestHarargheWoredas && <Check className="w-3 h-3 ml-0.5" />}
        </button>

        <button
          onClick={() => setShowHotspotRings(!showHotspotRings)}
          className={`px-2.5 py-1 rounded-md border font-bold flex items-center space-x-1.5 cursor-pointer ${
            showHotspotRings
              ? 'bg-amber-100 dark:bg-amber-950/80 text-amber-900 dark:text-amber-300 border-amber-300 dark:border-amber-700'
              : 'bg-slate-100 dark:bg-slate-800 text-slate-400 border-slate-200 dark:border-slate-700 opacity-60'
          }`}
        >
          <span className="w-2 h-2 rounded-full bg-amber-500 animate-ping"></span>
          <span>🔥 Hotspot Buffer Rings</span>
          {showHotspotRings && <Check className="w-3 h-3 ml-0.5" />}
        </button>

        <button
          onClick={() => setShowOutbreakMarkers(!showOutbreakMarkers)}
          className={`px-2.5 py-1 rounded-md border font-medium flex items-center space-x-1.5 cursor-pointer ${
            showOutbreakMarkers
              ? 'bg-rose-100 dark:bg-rose-950/80 text-rose-900 dark:text-rose-300 border-rose-300 dark:border-rose-700'
              : 'bg-slate-100 dark:bg-slate-800 text-slate-400 border-slate-200 dark:border-slate-700 opacity-60'
          }`}
        >
          <span className="w-2 h-2 rounded-full bg-rose-500"></span>
          <span>🔥 Outbreak Radar Bubbles</span>
          {showOutbreakMarkers && <Check className="w-3 h-3 ml-0.5" />}
        </button>

        <button
          onClick={() => setShowLabHub(!showLabHub)}
          className={`px-2.5 py-1 rounded-md border font-medium flex items-center space-x-1.5 cursor-pointer ${
            showLabHub
              ? 'bg-emerald-100 dark:bg-emerald-950/80 text-emerald-900 dark:text-emerald-300 border-emerald-300 dark:border-emerald-700'
              : 'bg-slate-100 dark:bg-slate-800 text-slate-400 border-slate-200 dark:border-slate-700 opacity-60'
          }`}
        >
          <span className="w-2 h-2 rounded-full bg-emerald-500"></span>
          <span>🏢 HRVL Hirna Lab Hub</span>
          {showLabHub && <Check className="w-3 h-3 ml-0.5" />}
        </button>
      </div>

      {/* Main Map Area & Field Telemetry Inspector Grid */}
      <div className="mt-2 grid grid-cols-1 lg:grid-cols-3 gap-4">
        
        {/* Leaflet GIS Map Canvas */}
        <div className="lg:col-span-2 relative min-h-[480px] rounded-xl overflow-hidden border border-slate-300 dark:border-slate-800 shadow-inner flex flex-col justify-between">
          
          {/* Leaflet Map DOM Element */}
          <div ref={mapContainerRef} className="w-full h-full min-h-[480px] z-0" />

          {/* Floating Zoom & Reset Navigation Toolbar */}
          <div className="absolute top-3 right-3 z-10 flex flex-col space-y-1.5 bg-slate-900/90 text-white p-1 rounded-lg border border-slate-700 shadow-xl backdrop-blur-md">
            <button
              onClick={handleZoomIn}
              title="Zoom In"
              className="p-1.5 hover:bg-slate-800 rounded text-slate-200 cursor-pointer transition-colors"
            >
              <ZoomIn className="w-4 h-4" />
            </button>
            <button
              onClick={handleZoomOut}
              title="Zoom Out"
              className="p-1.5 hover:bg-slate-800 rounded text-slate-200 cursor-pointer transition-colors"
            >
              <ZoomOut className="w-4 h-4" />
            </button>
            <button
              onClick={handleResetView}
              title="Reset View to Hararghe Region"
              className="p-1.5 hover:bg-slate-800 rounded text-emerald-400 cursor-pointer border-t border-slate-800 transition-colors"
            >
              <RotateCcw className="w-4 h-4" />
            </button>
          </div>

          {/* Map Footer Real-Time Telemetry Bar */}
          <div className="absolute bottom-3 left-3 right-3 z-10 flex flex-wrap items-center justify-between text-[11px] text-slate-200 bg-slate-950/90 px-3 py-1.5 rounded-lg border border-slate-800 backdrop-blur-md shadow-xl">
            <div className="flex flex-wrap items-center gap-3">
              <span className="font-bold text-amber-400 flex items-center gap-1">
                <span>🇪🇹</span> Ethiopia National
              </span>
              <span className="text-slate-600">•</span>
              <span className="font-bold text-emerald-400 flex items-center gap-1">
                <span>🗺️</span> Oromia Region
              </span>
              <span className="text-slate-600">•</span>
              <span className="font-bold text-blue-400 flex items-center gap-1">
                <span>📍</span> 36 Woredas
              </span>
            </div>

            <div className="flex items-center space-x-2 font-mono text-[10px] text-slate-400">
              <span className="inline-block w-2 h-2 rounded-full bg-emerald-500 animate-ping"></span>
              <span>HRVL Hub: N {HIRNA_LAB_COORDS.lat}° E {HIRNA_LAB_COORDS.lng}°</span>
            </div>
          </div>

        </div>

        {/* Telemetry Inspector Panel (Right Side) */}
        <div className="bg-slate-50 dark:bg-slate-800/50 rounded-xl p-4 border border-slate-200 dark:border-slate-700/60 flex flex-col justify-between">
          
          {selectedOutbreak && (
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <span className="px-2.5 py-0.5 text-xs font-bold rounded-full bg-red-100 text-red-800 dark:bg-red-950 dark:text-red-300 border border-red-200 dark:border-red-900 flex items-center gap-1">
                  <Flame className="w-3.5 h-3.5 text-red-600 dark:text-red-400" />
                  <span>{selectedOutbreak.status} Outbreak</span>
                </span>
                <span className="text-xs text-slate-500 dark:text-slate-400 font-mono">
                  {selectedOutbreak.outbreakCode}
                </span>
              </div>

              <div>
                <h3 className="text-lg font-black text-slate-900 dark:text-white">
                  {selectedOutbreak.disease}
                </h3>
                <p className="text-xs text-slate-600 dark:text-slate-300 flex items-center gap-1 mt-0.5">
                  <MapPin className="w-3.5 h-3.5 text-emerald-600 dark:text-emerald-400" />
                  <span>{selectedOutbreak.woreda} Woreda, {selectedOutbreak.zone}</span>
                </p>
              </div>

              <div className="grid grid-cols-2 gap-2 pt-1">
                <div className="p-2.5 rounded-lg bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800">
                  <span className="text-[10px] text-slate-500 dark:text-slate-400 uppercase font-extrabold">Total Cases</span>
                  <p className="text-xl font-black text-slate-900 dark:text-white">{selectedOutbreak.cases}</p>
                </div>

                <div className="p-2.5 rounded-lg bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800">
                  <span className="text-[10px] text-slate-500 dark:text-slate-400 uppercase font-extrabold">Fatalities</span>
                  <p className="text-xl font-black text-rose-600 dark:text-rose-400">{selectedOutbreak.deaths}</p>
                </div>

                <div className="p-2.5 rounded-lg bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800">
                  <span className="text-[10px] text-slate-500 dark:text-slate-400 uppercase font-extrabold">Morbidity</span>
                  <p className="text-xl font-black text-blue-600 dark:text-blue-400">{selectedOutbreak.morbidityRate}%</p>
                </div>

                <div className="p-2.5 rounded-lg bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800">
                  <span className="text-[10px] text-slate-500 dark:text-slate-400 uppercase font-extrabold">CFR Rate</span>
                  <p className="text-xl font-black text-red-600 dark:text-red-400">{selectedOutbreak.cfr}%</p>
                </div>
              </div>

              <div className="space-y-1.5 pt-2 text-xs">
                <div className="flex justify-between text-slate-600 dark:text-slate-300">
                  <span className="font-semibold">Species Affected:</span>
                  <span className="font-bold text-slate-900 dark:text-white">{selectedOutbreak.speciesAffected.join(', ')}</span>
                </div>
                <div className="flex justify-between text-slate-600 dark:text-slate-300">
                  <span className="font-semibold">Quarantine Status:</span>
                  <span className={`font-bold ${selectedOutbreak.quarantineApplied ? 'text-emerald-600 dark:text-emerald-400' : 'text-amber-600 dark:text-amber-400'}`}>
                    {selectedOutbreak.quarantineApplied ? 'Enforced' : 'Pending'}
                  </span>
                </div>
                <div className="flex justify-between text-slate-600 dark:text-slate-300">
                  <span className="font-semibold">Ring Vaccination:</span>
                  <span className={`font-bold ${selectedOutbreak.vaccinationActive ? 'text-emerald-600 dark:text-emerald-400' : 'text-slate-500'}`}>
                    {selectedOutbreak.vaccinationActive ? 'Active' : 'Not Started'}
                  </span>
                </div>
              </div>

              <div className="p-2.5 rounded-lg bg-amber-50 dark:bg-amber-950/40 border border-amber-200 dark:border-amber-900 text-xs text-amber-900 dark:text-amber-300 mt-2">
                <div className="flex items-center space-x-1 font-bold mb-1">
                  <ShieldAlert className="w-3.5 h-3.5 text-amber-600 dark:text-amber-400" />
                  <span>HRVL Field Response Status:</span>
                </div>
                Diagnostic samples collected. Epidemiological containment protocol active.
              </div>
            </div>
          )}

          {selectedWoreda && !selectedOutbreak && (
            <div className="space-y-3">
              <span className="px-2.5 py-0.5 text-xs font-bold rounded-full bg-blue-100 text-blue-800 dark:bg-blue-950 dark:text-blue-300 border border-blue-200 dark:border-blue-900">
                Woreda Polygon Telemetry
              </span>

              <div>
                <h3 className="text-lg font-black text-slate-900 dark:text-white">
                  {selectedWoreda.name} Woreda
                </h3>
                <p className="text-xs text-slate-600 dark:text-slate-300 mt-0.5">
                  Zone: {selectedWoreda.zone} • Est Pop: {selectedWoreda.populationEstimate.toLocaleString()}
                </p>
              </div>

              <div className="p-3 bg-white dark:bg-slate-900 rounded-lg border border-slate-200 dark:border-slate-800 text-xs space-y-2">
                <div className="flex justify-between">
                  <span className="text-slate-500 dark:text-slate-400">GPS Coordinates:</span>
                  <span className="font-mono text-slate-800 dark:text-slate-200">{selectedWoreda.lat}, {selectedWoreda.lng}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-500 dark:text-slate-400">Total Cases Logged:</span>
                  <span className="font-bold text-red-600 dark:text-red-400">
                    {woredaCaseMap[selectedWoreda.name.toLowerCase()] || 0}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-500 dark:text-slate-400">Reporting Compliance:</span>
                  <span className="font-bold text-emerald-600 dark:text-emerald-400">Compliant (100%)</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-500 dark:text-slate-400">Surveillance Telemetry:</span>
                  <span className="font-bold text-blue-600 dark:text-blue-400">
                    {records.filter(r => r.woreda.toLowerCase() === selectedWoreda.name.toLowerCase()).length} Reports Logged
                  </span>
                </div>
              </div>

              <button
                onClick={() => {
                  mapInstanceRef.current?.flyTo([selectedWoreda.lat, selectedWoreda.lng], 11, { duration: 1.0 });
                }}
                className="w-full py-2 bg-emerald-600 hover:bg-emerald-700 text-white font-bold rounded-lg text-xs transition-colors flex items-center justify-center space-x-1.5 cursor-pointer"
              >
                <Crosshair className="w-3.5 h-3.5" />
                <span>Zoom In to {selectedWoreda.name} Woreda Boundary</span>
              </button>
            </div>
          )}

          {!selectedOutbreak && !selectedWoreda && (
            <div className="h-full flex flex-col items-center justify-center text-center p-6 text-slate-400">
              <Info className="w-8 h-8 mb-2 opacity-50 text-emerald-500" />
              <p className="text-xs font-medium text-slate-600 dark:text-slate-300">
                Click any Woreda polygon boundary or active outbreak bubble marker to view full GIS field telemetry.
              </p>
            </div>
          )}

        </div>

      </div>
    </div>
  );
};
