import React, { useEffect, useRef, useState } from 'react';
import ForceGraph3D from '3d-force-graph';
import * as THREE from 'three';
import data from './data.json';

const brandColors = {
  'EltaMD': '#f59e0b',
  'Neutrogena': '#3b82f6',
  'zoskinhealth': '#10b981',
  'Skinceuticals': '#8b5cf6',
  'Supergoop': '#ec4899'
};

const BrandThemeGraph3D = () => {
  const containerRef = useRef(null);
  const graphRef = useRef(null);
  const [stats, setStats] = useState({ reviews: 0, products: 0, themes: 0 });

  useEffect(() => {
    const maxRows = 2000;
    const sampleData = (Array.isArray(data) ? data : data.default).slice(0, maxRows);
    console.log('Loaded JSON records:', sampleData.length);

    // -------------------------
    // 1️⃣ NODE / LINK CREATION
    // -------------------------
    const nodes = [];
    const links = [];
    const nodeMap = new Map();

    const addNode = (id, label, type, color, parent = null, sentiment = null) => {
      if (!nodeMap.has(id)) {
        nodeMap.set(id, nodes.length);
        nodes.push({ id, label, type, color, parent, sentiment });
      }
      return nodeMap.get(id);
    };

    const themeColumns = [
      'Suits all skin types', 'Packaging Issues', 'Price Performance',
      'Customer Satisfaction', 'Age and Skin Benefits', 'Effectiveness',
      'Promotions', 'Convenience', 'Diverse Options'
    ];

    const subthemeMapping = {
      'Suits all skin types': 'Suits all skin types_Subtheme',
      'Packaging Issues': 'Packaging Issues_Subtheme',
      'Price Performance': 'Price Performance_Subtheme',
      'Customer Satisfaction': 'Customer Satisfaction_Subtheme',
      'Age and Skin Benefits': 'Age and Skin Benefits_Subtheme',
      'Effectiveness': 'Effectiveness_Subtheme',
      'Promotions': 'Promotions_Subtheme',
      'Convenience': 'Convenience_Subtheme',
      'Diverse Options': 'Diverse Options_Subtheme'
    };

    const uniqueProducts = new Set();
    const uniqueThemes = new Set();

    sampleData.forEach((row, idx) => {
      const brand = row.Brand || 'Unknown';
      const sku = row.SKU || 'Unknown SKU';
      const sentiment = row.Sentiment || 'neutral';

      const brandColor = brandColors[brand] || '#6b7280';
      addNode(brand, brand, 'brand', brandColor);

      const productId = `${brand}_${sku}`;
      uniqueProducts.add(sku);
      addNode(productId, sku, 'product', brandColor, brand);
      links.push({ source: brand, target: productId });

      themeColumns.forEach(theme => {
        if (row[theme]) {
          uniqueThemes.add(theme);
          const themeId = `${productId}_${theme}`;

          const themeValue = row[theme];
          let themeSentiment = 'neutral';
          if (themeValue.includes('positive')) themeSentiment = 'positive';
          else if (themeValue.includes('negative')) themeSentiment = 'negative';

          addNode(themeId, theme, 'theme', '#8b5cf6', productId);
          links.push({ source: productId, target: themeId });

          const subthemeCol = subthemeMapping[theme];
          if (subthemeCol && row[subthemeCol]) {
            const subtheme = row[subthemeCol];
            const subthemeId = `${themeId}_${subtheme}_${idx}`;

            const sentimentColor =
              themeSentiment === 'positive' ? '#22c55e' :
              themeSentiment === 'negative' ? '#ef4444' : '#64748b';

            const subthemeLabel = `${subtheme} (${themeSentiment})`;
            addNode(subthemeId, subthemeLabel, 'subtheme', sentimentColor, themeId, themeSentiment);
            links.push({ source: themeId, target: subthemeId });
          }
        }
      });

      const sentimentColor =
        sentiment === 'positive' ? '#22c55e' :
        sentiment === 'negative' ? '#ef4444' : '#64748b';
      const sentimentNodeId = `${productId}_sentiment_${sentiment}_${idx}`;
      addNode(sentimentNodeId, `Overall: ${sentiment}`, 'sentiment', sentimentColor, productId, sentiment);
      links.push({ source: productId, target: sentimentNodeId });
    });

    setStats({
      reviews: sampleData.length,
      products: uniqueProducts.size,
      themes: uniqueThemes.size
    });

    const graphData = { nodes, links };

    // -------------------------
    // 2️⃣ GEOMETRY REUSE
    // -------------------------
    const geometries = {
      brand: new THREE.SphereGeometry(12, 16, 16),
      product: new THREE.SphereGeometry(7, 16, 16),
      theme: new THREE.SphereGeometry(5, 16, 16),
      subtheme: new THREE.SphereGeometry(3.5, 16, 16),
      sentiment: new THREE.SphereGeometry(2.5, 16, 16)
    };

    // -------------------------
    // 3️⃣ 3D FORCE GRAPH SETUP
    // -------------------------
    const elem = containerRef.current;
    const Graph = ForceGraph3D()(elem)
      .graphData(graphData)
      .nodeAutoColorBy('type')
      .nodeLabel(node => {
  const matchedData = sampleData.find(record => {
    if (!node.parent) return false;
    const [brand, sku] = (node.parent || '').split('_');
    return record.Brand === brand && record.SKU === sku;
  });

  let html = `<div style="font-size:12px; line-height:1.4; color:#fff;">`;
  html += `<strong>${node.label}</strong><br>`;
  html += `<span style="opacity:0.8;">Type:</span> ${node.type}<br>`;

  if (node.parent) {
    const parentNode = nodes.find(n => n.id === node.parent);
    if (parentNode && parentNode.type === 'product') {
      html += `<span style="opacity:0.8;">Product:</span> ${parentNode.label}<br>`;
    }
  }

  if (matchedData) {
    if (matchedData.Text)
      html += `<span style="opacity:0.8;">Review Text:</span> ${matchedData.Text}<br>`;
    if (matchedData.Stars)
      html += `<span style="opacity:0.8;">Rating:</span> ${matchedData.Stars} stars<br>`;
    if (matchedData.Sentiment)
      html += `<span style="opacity:0.8;">Sentiment:</span> ${matchedData.Sentiment}<br>`;
  }

  if (node.parent) {
    const parentNode = nodes.find(n => n.id === node.parent);
    if (parentNode && parentNode.type === 'theme') {
      html += `<span style="opacity:0.8;">Parent:</span> ${parentNode.label}`;
    }
  }

  html += `</div>`;
  return html;
})

      .nodeThreeObject(node => {
        const material = new THREE.MeshBasicMaterial({ color: node.color });
        const mesh = new THREE.Mesh(geometries[node.type], material);
        node.__threeObj = mesh;
        return mesh;
      })
      .linkColor(() => 'rgba(255,255,255,0.3)')
      .linkOpacity(0.3)
      .linkDirectionalParticles(0)
      .backgroundColor('#0f172a')
      .onNodeClick(node => {
        const info = `Node: ${node.label}\nType: ${node.type}${node.sentiment ? `\nSentiment: ${node.sentiment}` : ''}`;
        alert(info);
      });

    Graph.cameraPosition({ z: 300 });
    graphRef.current = Graph;

    // -------------------------
    // 4️⃣ CLEANUP
    // -------------------------
    return () => {
      if (graphRef.current) {
        graphRef.current._destructor();
        graphRef.current = null;
      }
      // Dispose geometries
      Object.values(geometries).forEach(geometry => {
        geometry.dispose();
      });
      // Dispose materials
      nodes.forEach(node => {
        if (node.__threeObj && node.__threeObj.material) {
          node.__threeObj.material.dispose();
        }
      });
      elem.innerHTML = '';
    };
  }, []);

  return (
    <div className="w-full h-screen bg-slate-900 relative">
      <div ref={containerRef} className="w-full h-full" />
      
      {/* overlay stats panel */}
      <div className="absolute top-2 left-2 text-white p-2 bg-slate-800/70 rounded">
        <div>Reviews: {stats.reviews}</div>
        <div>Products: {stats.products}</div>
        <div>Themes: {stats.themes}</div>
      </div>

      {/* legend panel */}
      <div className="absolute top-2 right-2 text-white p-3 bg-slate-800/90 rounded text-sm max-w-xs z-50 shadow-lg">
        <div className="font-bold mb-3 text-base">Legend</div>
        
        <div className="mb-3">
          <div className="text-xs text-slate-300 mb-2 font-semibold">Node Types</div>
          <div className="flex items-center gap-2 mb-1.5">
            <div className="w-4 h-4 rounded-full bg-slate-400"></div>
            <span className="text-xs">Brand (Large)</span>
          </div>
          <div className="flex items-center gap-2 mb-1.5">
            <div className="w-3 h-3 rounded-full bg-slate-400"></div>
            <span className="text-xs">Product (Medium)</span>
          </div>
          <div className="flex items-center gap-2 mb-1.5">
            <div className="w-2.5 h-2.5 rounded-full bg-purple-500"></div>
            <span className="text-xs">Theme (Small)</span>
          </div>
          <div className="flex items-center gap-2 mb-1.5">
            <div className="w-2 h-2 rounded-full bg-slate-400"></div>
            <span className="text-xs">Subtheme (Tiny)</span>
          </div>
        </div>

        <div className="mb-3">
          <div className="text-xs text-slate-300 mb-2 font-semibold">Sentiment</div>
          <div className="flex items-center gap-2 mb-1.5">
            <div className="w-2.5 h-2.5 rounded-full bg-green-500"></div>
            <span className="text-xs">Positive</span>
          </div>
          <div className="flex items-center gap-2 mb-1.5">
            <div className="w-2.5 h-2.5 rounded-full bg-red-500"></div>
            <span className="text-xs">Negative</span>
          </div>
          <div className="flex items-center gap-2 mb-1.5">
            <div className="w-2.5 h-2.5 rounded-full bg-slate-500"></div>
            <span className="text-xs">Neutral</span>
          </div>
        </div>

        <div className="pt-3 border-t border-slate-600">
          <div className="text-xs text-slate-300 mb-2 font-semibold">Brands</div>
          {Object.entries(brandColors).map(([brand, color]) => (
            <div key={brand} className="flex items-center gap-2 mb-1.5">
              <div className="w-2.5 h-2.5 rounded-full" style={{backgroundColor: color}}></div>
              <span className="text-xs">{brand}</span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default BrandThemeGraph3D;