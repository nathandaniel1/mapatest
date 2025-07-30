// script.js

// No 'import' statements needed here because ol.js from CDN
// makes everything available under the global 'ol' object.

// Create a new map instance with an OpenStreetMap base layer
const map = new ol.Map({
    target: 'map', // The ID of the div element where the map will be rendered
    layers: [
        new ol.layer.Tile({
            source: new ol.source.OSM(), // OpenStreetMap as the base layer
            className: 'ol-layer-osm-grayscale' // ADDED THIS LINE for grayscale
        })
    ],
    view: new ol.View({
        // Set an initial view. The fit function will override this later.
        center: ol.proj.fromLonLat([-70.0, -35.0]),
        zoom: 6
    })
});

// Create a vector source for your cable data
const cableSource = new ol.source.Vector({
    format: new ol.format.GeoJSON({
        dataProjection: 'EPSG:4326', // Your GeoJSON data is in WGS84 (longitude, latitude)
        featureProjection: 'EPSG:3857' // Your map's projection (Web Mercator)
    }),
    url: 'data/cable.geojson', // <--- VERIFY THIS PATH!
    wrapX: false
});

// Create a vector layer to display the cable data
const cableLayer = new ol.layer.Vector({
    source: cableSource,
    style: function(feature) {
        // Corrected: Use color and width directly from GeoJSON properties
        const geojsonColor = feature.get('color');
        const geojsonWidth = feature.get('width');
        const geojsonLineDash = feature.get('lineDash'); // Get lineDash property

        // Use GeoJSON color and width, or fall back to a default if not present
        const color = geojsonColor || 'rgba(255, 0, 0, 0.7)'; // Default red if no color in GeoJSON
        const width = geojsonWidth || 3; // Default width if no width in GeoJSON
        const lineDash = geojsonLineDash || undefined; // Use undefined if not present, OpenLayers will ignore

        return new ol.style.Style({
            stroke: new ol.style.Stroke({
                color: color,
                width: width,
                lineDash: lineDash // Apply lineDash here
            })
        });
    }
});


// Create a vector source for your point data
const pointSource = new ol.source.Vector({
    format: new ol.format.GeoJSON({
        dataProjection: 'EPSG:4326',
        featureProjection: 'EPSG:3857'
    }),
    url: 'data/puntos.geojson', // <--- VERIFY THIS PATH!
    wrapX: false
});

// Create a vector layer for points
const pointLayer = new ol.layer.Vector({
    source: pointSource,
    style: function(feature) {
        const shape = feature.get('shape');
        const color = feature.get('color');
        const size = feature.get('size');

        let fillColor = color || '#FFD700'; // Use GeoJSON color or default to gold
        let strokeColor = '#333'; // Dark border for points
        let pointSize = size || 5; // Use GeoJSON size or default to 5

        let pointStyle;

        // Determine shape and create appropriate style (case-insensitive check for shape)
        if (shape && shape.toLowerCase() === 'circle') {
            pointStyle = new ol.style.Style({
                image: new ol.style.Circle({
                    radius: pointSize,
                    fill: new ol.style.Fill({
                        color: fillColor
                    }),
                    stroke: new ol.style.Stroke({
                        color: strokeColor,
                        width: 1
                    })
                })
            });
        } else if (shape && shape.toLowerCase() === 'square') {
            pointStyle = new ol.style.Style({
                image: new ol.style.RegularShape({
                    points: 4,
                    radius: pointSize,
                    angle: Math.PI / 4, // Rotar para que parezca un cuadrado
                    fill: new ol.style.Fill({
                        color: fillColor
                    }),
                    stroke: new ol.style.Stroke({
                        color: strokeColor,
                        width: 1
                    })
                })
            });
        } else {
            // Default to a circle if shape is not specified or recognized
            pointStyle = new ol.style.Style({
                image: new ol.style.Circle({
                    radius: pointSize,
                    fill: new ol.style.Fill({
                        color: fillColor
                    }),
                    stroke: new ol.style.Stroke({
                        color: strokeColor,
                        width: 1
                    })
                })
            });
        }
        return pointStyle;
    }
});


const dataCenterSource = new ol.source.Vector({
    format: new ol.format.GeoJSON({
        dataProjection: 'EPSG:4326',
        featureProjection: 'EPSG:3857'
    }),
    url: 'data/data_centers.geojson', // <--- VERIFY THIS PATH!
    wrapX: false
});

const dataCenterLayer = new ol.layer.Vector({
    source: dataCenterSource,
    style: function(feature) {
        const shape = feature.get('shape');
        const color = feature.get('color');
        const size = feature.get('size');
        const opacity = feature.get('opacity');

        let fillColor = color || '#5DADE2'; // Default color for data centers
        let strokeColor = '#333';
        let pointSize = size || 8; // Default size for data centers

        let dataCenterStyle;

        // Apply shapes for data centers based on GeoJSON 'shape' property (similar to points)
        if (shape && shape.toLowerCase() === 'circle') {
            dataCenterStyle = new ol.style.Style({
                image: new ol.style.Circle({
                    radius: pointSize,
                    fill: new ol.style.Fill({
                        color: fillColor
                    }),
                    stroke: new ol.style.Stroke({
                        color: strokeColor,
                        width: 1
                    })
                })
            });
        } else if (shape && shape.toLowerCase() === 'square') {
            dataCenterStyle = new ol.style.Style({
                image: new ol.style.RegularShape({
                    points: 4,
                    radius: pointSize,
                    angle: Math.PI / 4, // Rotar para que parezca un cuadrado
                    fill: new ol.style.Fill({
                        color: fillColor
                    }),
                    stroke: new ol.style.Stroke({
                        color: strokeColor,
                        width: 1
                    })
                })
            });
        } else {
            // Default to a square if shape is not specified or recognized
            dataCenterStyle = new ol.style.Style({
                image: new ol.style.RegularShape({
                    points: 4,
                    radius: pointSize,
                    angle: Math.PI / 4,
                    fill: new ol.style.Fill({
                        color: fillColor
                    }),
                    stroke: new ol.style.Stroke({
                        color: strokeColor,
                        width: 1
                    })
                })
            });
        }
        return dataCenterStyle;
    }
});

const landCableSource = new ol.source.Vector({
    format: new ol.format.GeoJSON({
        dataProjection: 'EPSG:4326',
        featureProjection: 'EPSG:3857'
    }),
    url: 'data/land_cables.geojson', // <--- VERIFY THIS PATH!
    wrapX: false
});

const landCableLayer = new ol.layer.Vector({
    source: landCableSource,
    style: function(feature) {
        const geojsonColor = feature.get('color');
        const geojsonWidth = feature.get('width');
        const geojsonLineDash = feature.get('lineDash');

        const color = geojsonColor || 'rgba(0, 0, 255, 0.7)';
        const width = geojsonWidth || 3;
        const lineDash = geojsonLineDash || undefined;

        return new ol.style.Style({
            stroke: new ol.style.Stroke({
                color: color,
                width: width,
                lineDash: lineDash
            })
        });
    }
});

// Agrega las capas al mapa en un orden específico para que los puntos estén encima de las líneas
map.addLayer(cableLayer);
map.addLayer(landCableLayer);
map.addLayer(pointLayer);
map.addLayer(dataCenterLayer);


// === INFO PANEL LOGIC ===
const infoPanel = document.getElementById('info-panel');
const closePanelBtn = document.querySelector('.close-panel');
const panelContent = document.getElementById('panel-content');
let selectedFeature = null;

const translationDict = {
    'name': 'Nombre',
    'type': 'Tipo',
    'empresa': 'Empresa',
    'shape': 'Forma',
    'color': 'Color',
    'size': 'Tamaño',
    'address': 'Dirección',
    'pue': 'Eficiencia Energética (PUE)',
    'wue': 'Eficiencia Hídrica (WUE)',
    'dimensiones': 'Dimensiones Físicas',
    'tecnologias': 'Tecnologías Empleadas',
    'sistemas_refrigeracion': 'Sistemas de Refrigeración',
    'consumo_agua': 'Consumo de Agua',
    'uso_suelo': 'Uso de Suelo',
    'emisiones': 'Datos sobre Emisiones',
    'source': 'Fuente',
    'reference_link': 'Enlace de Referencia',
    'length_km': 'Longitud (km)',
    'image': 'Imagen',
    'width': 'Ancho'
};

const excludedKeys = ['name', 'type', 'shape', 'color', 'size', 'opacity', 'geometry', 'width'];

function getFormattedFeatureInfo(feature) {
    const properties = feature.getProperties();
    let content = '';

    // Handle title and subtitle
    const name = properties['name'] || 'Información del Elemento';
    const type = properties['type'] || 'Elemento';
    content += `<h2>${name}</h2>`;
    content += `<h4 class="subtitle">${type}</h4>`;

    // Loop through all properties and build the list
    for (const key in properties) {
        const lowercaseKey = key.toLowerCase();
        // Exclude properties based on the excludedKeys array and null/empty values
        if (properties.hasOwnProperty(key) && !excludedKeys.includes(lowercaseKey) && properties[key]) {
            // Get the translated key from the dictionary, or format it if not found
            const translatedKey = translationDict[lowercaseKey] || key.replace(/_/g, ' ').replace(/\b\w/g, c => c.toUpperCase());
            let value = properties[key];

            // Check for image links and format them as an <img> tag
            if (lowercaseKey === 'image' && value) {
                if (typeof value === 'string' && value.startsWith('http')) {
                    content += `<div class="info-item image-container"><img src="${value}" alt="${name}"></div>`;
                }
            } else if (lowercaseKey === 'reference_link' && value) {
                // Check for reference link and format as a clickable link
                content += `<div class="info-item"><strong>${translatedKey}:</strong> <a href="${value}" target="_blank" rel="noopener noreferrer">Ver Referencia</a></div>`;
            } else {
                // If the value is a number or string, format it as a simple list item
                if (value !== null && value !== undefined && value !== '') {
                    content += `<div class="info-item"><strong>${translatedKey}:</strong> ${value}</div>`;
                }
            }
        }
    }
    return content;
}

closePanelBtn.addEventListener('click', () => {
    infoPanel.classList.remove('open');
    // We can also clear the selected feature to be able to select it again
    selectedFeature = null;
});

// Event listener for map clicks to show the info panel
map.on('click', function(evt) {
    const feature = map.forEachFeatureAtPixel(evt.pixel, function(feature) {
        return feature;
    }, {
        hitTolerance: 5 // ADDED: Increase hit tolerance for better mobile touch response
    });

    if (feature) {
        selectedFeature = feature;
        const info = getFormattedFeatureInfo(selectedFeature);
        panelContent.innerHTML = info;
        infoPanel.classList.add('open');
    } else {
        // Only close the panel without changing content if no feature is clicked
        if (infoPanel.classList.contains('open')) {
            infoPanel.classList.remove('open');
        }
    }
});

// === TOOLTIP LOGIC ===
const tooltipElement = document.getElementById('tooltip');
const tooltip = new ol.Overlay({
    element: tooltipElement,
    offset: [10, 0],
    positioning: 'bottom-left'
});
map.addOverlay(tooltip);

map.on('pointermove', function(evt) {
    if (evt.dragging) {
        return;
    }
    const pixel = map.getEventPixel(evt.originalEvent);
    const hit = map.hasFeatureAtPixel(pixel);
    map.getTargetElement().style.cursor = hit ? 'pointer' : '';

    const feature = map.forEachFeatureAtPixel(evt.pixel, function(feature) {
        return feature;
    });

    if (feature) {
        const properties = feature.getProperties();
        const name = properties['name'] || 'Elemento';
        tooltipElement.innerHTML = name;
        tooltip.setPosition(evt.coordinate);
        tooltipElement.style.display = 'block';
    } else {
        tooltipElement.style.display = 'none';
    }
});


// === LAYER TOGGLE LOGIC ===

document.addEventListener('DOMContentLoaded', function() {
    // Ensure all elements are properly selected after the DOM is loaded
    const toggleCables = document.getElementById('toggle-cables');
    const togglePoints = document.getElementById('toggle-points');
    const toggleDataCenters = document.getElementById('toggle-data-centers');
    const toggleLandCables = document.getElementById('toggle-land-cables');
    
    const toggleLayerControlsButton = document.getElementById('toggle-layer-controls');
    const layerControls = document.querySelector('.layer-controls');


    // Set initial visibility based on checkbox state
    // We set 'checked' in HTML, so they should be visible initially.
    cableLayer.setVisible(toggleCables.checked);
    pointLayer.setVisible(togglePoints.checked);
    dataCenterLayer.setVisible(toggleDataCenters.checked);
    landCableLayer.setVisible(toggleLandCables.checked);


    // Add event listeners
    toggleCables.addEventListener('change', function() {
        cableLayer.setVisible(this.checked);
    });

    togglePoints.addEventListener('change', function() {
        pointLayer.setVisible(this.checked);
    });

    toggleDataCenters.addEventListener('change', function() {
        dataCenterLayer.setVisible(this.checked);
    });

    toggleLandCables.addEventListener('change', function() {
        landCableLayer.setVisible(this.checked);
    });
    
    // CORRECTED: Logic for toggling the layer panel and hiding the button
    if (toggleLayerControlsButton) {
        toggleLayerControlsButton.addEventListener('click', function() {
            if (layerControls) {
                const isPanelOpen = layerControls.classList.toggle('open');
                // Hide the button when the panel is open, show it when closed
                toggleLayerControlsButton.style.display = isPanelOpen ? 'none' : 'block';
            }
        });
    }

    // New, more robust logic to fit the map view to all features on load
    const allSources = [cableSource, pointSource, dataCenterSource, landCableSource];
    const sourcesToWaitFor = allSources.length;
    let sourcesLoaded = 0;

    const onSourceChange = function() {
        if (this.getState() === 'ready') {
            sourcesLoaded++;
            if (sourcesLoaded === sourcesToWaitFor) {
                let combinedExtent = ol.extent.createEmpty();
                allSources.forEach(s => {
                    if (s.getFeatures().length > 0) {
                        ol.extent.extend(combinedExtent, s.getExtent());
                    }
                });

                if (!ol.extent.isEmpty(combinedExtent)) {
                    map.getView().fit(combinedExtent, {
                        padding: [50, 50, 50, 50],
                        duration: 1000,
                        maxZoom: 10
                    });
                }
                // Remove the event listeners after they have served their purpose
                allSources.forEach(s => s.un('change', onSourceChange));
            }
        }
    };
    allSources.forEach(source => source.on('change', onSourceChange));
    
    // New logic to close panels on click outside
    document.addEventListener('click', function(event) {
        // Close the layer controls panel if it's open and the click is outside
        if (layerControls.classList.contains('open') && !layerControls.contains(event.target) && !toggleLayerControlsButton.contains(event.target)) {
            layerControls.classList.remove('open');
            toggleLayerControlsButton.style.display = 'block';
        }
        
        // Close the info panel if it's open and the click is outside
        if (infoPanel.classList.contains('open') && !infoPanel.contains(event.target) && !map.getTargetElement().contains(event.target.closest('.ol-viewport'))) {
            infoPanel.classList.remove('open');
            selectedFeature = null;
        }
    });

    // Stop propagation for clicks inside the info panel so they don't close it
    if (infoPanel) {
        infoPanel.addEventListener('click', function(event) {
            event.stopPropagation();
        });
    }

    // Stop propagation for clicks inside the layer controls panel so they don't close it
    if (layerControls) {
        layerControls.addEventListener('click', function(event) {
            event.stopPropagation();
        });
    }
});
