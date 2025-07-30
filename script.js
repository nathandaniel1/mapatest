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
        center: [-70.0, -35.0], // Initial center coordinates [longitude, latitude] for Chile
        zoom: 6 // Initial zoom level
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
                    points: 4, // Number of points for a square
                    radius: pointSize,
                    angle: Math.PI / 4, // Rotate by 45 degrees to make it a square
                    fill: new ol.style.Fill({
                        color: fillColor
                    }),
                    stroke: new ol.style.Stroke({
                        color: strokeColor,
                        width: 1
                    })
                })
            });
        } else if (shape && shape.toLowerCase() === 'triangle') {
            pointStyle = new ol.style.Style({
                image: new ol.style.RegularShape({
                    points: 3, // Number of points for a triangle
                    radius: pointSize,
                    rotateWithView: true,
                    fill: new ol.style.Fill({
                        color: fillColor
                    }),
                    stroke: new ol.style.Stroke({
                        color: strokeColor,
                        width: 1
                    })
                })
            });
        } else if (shape && shape.toLowerCase() === 'star') {
            pointStyle = new ol.style.Style({
                image: new ol.style.RegularShape({
                    points: 5, // Number of points for a star
                    radius1: pointSize, // Outer radius
                    radius2: pointSize / 2.5, // Inner radius (adjust for star sharpness)
                    angle: 0, // No rotation needed for a typical star
                    fill: new ol.style.Fill({
                        color: fillColor
                    }),
                    stroke: new ol.style.Stroke({
                        color: strokeColor,
                        width: 1
                    })
                })
            });
        } else { // Default to circle if shape is not recognized or not specified
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


// Create a vector source for your data_centers data
const dataCenterSource = new ol.source.Vector({
    format: new ol.format.GeoJSON({
        dataProjection: 'EPSG:4326',
        featureProjection: 'EPSG:3857'
    }),
    url: 'data/data_centers.geojson', // <--- VERIFY THIS PATH!
    wrapX: false
});

// Create a vector layer for data_centers
const dataCenterLayer = new ol.layer.Vector({
    source: dataCenterSource,
    style: function(feature) {
        const shape = feature.get('shape'); // NEW: Get shape property
        const color = feature.get('color');
        const size = feature.get('size');

        let fillColor = color || '#FF4500'; // Use GeoJSON color or default to orange
        let strokeColor = '#333'; // Dark border
        let pointSize = size || 8; // Use GeoJSON size or default to 8

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
        } else if (shape && shape.toLowerCase() === 'triangle') {
            dataCenterStyle = new ol.style.Style({
                image: new ol.style.RegularShape({
                    points: 3,
                    radius: pointSize,
                    rotateWithView: true,
                    fill: new ol.style.Fill({
                        color: fillColor
                    }),
                    stroke: new ol.style.Stroke({
                        color: strokeColor,
                        width: 1
                    })
                })
            });
        } else if (shape && shape.toLowerCase() === 'star') {
            dataCenterStyle = new ol.style.Style({
                image: new ol.style.RegularShape({
                    points: 5,
                    radius1: pointSize,
                    radius2: pointSize / 2.5,
                    angle: 0,
                    fill: new ol.style.Fill({
                        color: fillColor
                    }),
                    stroke: new ol.style.Stroke({
                        color: strokeColor,
                        width: 1
                    })
                })
            });
        } else { // Default to circle if shape is not recognized or not specified
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
        }
        return dataCenterStyle;
    }
});

// Create a vector source for your land_cables data
const landCableSource = new ol.source.Vector({
    format: new ol.format.GeoJSON({
        dataProjection: 'EPSG:4326',
        featureProjection: 'EPSG:3857'
    }),
    url: 'data/land_cables.geojson', // <--- VERIFY THIS PATH!
    wrapX: false
});

// Create a vector layer for land_cables
const landCableLayer = new ol.layer.Vector({
    source: landCableSource,
    style: function(feature) {
        const color = feature.get('color');
        const width = feature.get('width');
        const geojsonLineDash = feature.get('lineDash'); // Get lineDash property

        const lineDash = geojsonLineDash || undefined; // Use undefined if not present

        return new ol.style.Style({
            stroke: new ol.style.Stroke({
                color: color || 'rgba(128, 128, 128, 0.7)', // Default grey
                width: width || 2,
                lineDash: lineDash // Apply lineDash here
            })
        });
    }
});


// Add layers to the map in the desired order (base map first, then vector layers)
map.addLayer(cableLayer);
map.addLayer(pointLayer);
map.addLayer(dataCenterLayer);
map.addLayer(landCableLayer);

// === LAYER TOGGLE LOGIC ===
// Ensure the elements are properly selected after the DOM is loaded
document.addEventListener('DOMContentLoaded', function() {
    const toggleCables = document.getElementById('toggle-cables');
    const togglePoints = document.getElementById('toggle-points');
    const toggleDataCenters = document.getElementById('toggle-data-centers');
    const toggleLandCables = document.getElementById('toggle-land-cables');

    // Set initial visibility based on checkbox state
    // We set 'checked' in HTML, so they should be visible initially.
    cableLayer.setVisible(toggleCables.checked);
    pointLayer.setVisible(togglePoints.checked);
    dataCenterLayer.setVisible(toggleDataCenters.checked);
    landCableLayer.setVisible(toggleLandCables.checked);

    // Add event listeners
    toggleCables.addEventListener('change', function(event) {
        cableLayer.setVisible(event.target.checked);
    });

    togglePoints.addEventListener('change', function(event) {
        pointLayer.setVisible(event.target.checked);
    });

    toggleDataCenters.addEventListener('change', function(event) {
        dataCenterLayer.setVisible(event.target.checked);
    });

    toggleLandCables.addEventListener('change', function(event) {
        landCableLayer.setVisible(event.target.checked);
    });

    // === NEW LAYER CONTROLS TOGGLE LOGIC (Mobile-only) ===
    const toggleLayerControlsButton = document.getElementById('toggle-layer-controls');
    const layerControlsPanel = document.getElementById('layer-controls');

    if (toggleLayerControlsButton) {
        toggleLayerControlsButton.addEventListener('click', function(event) {
            // Prevent the click from propagating to the map
            event.stopPropagation();
            
            // Toggle the 'open' class on the layer controls panel
            layerControlsPanel.classList.toggle('open');
            
            // Explicitly hide the button when the panel is open
            if (layerControlsPanel.classList.contains('open')) {
                toggleLayerControlsButton.style.display = 'none';
            } else {
                toggleLayerControlsButton.style.display = 'block';
            }
        });
    }
    // === END OF NEW LOGIC ===

    // === INFO PANEL LOGIC ===
    const infoPanel = document.getElementById('info-panel');
    const closePanelButton = document.getElementById('close-panel');
    const panelContent = document.getElementById('panel-content');

    closePanelButton.addEventListener('click', function() {
        infoPanel.classList.remove('open');
        panelContent.innerHTML = '<p>Haz click en un punto o cable para ver más información.</p>';
    });

    /**
     * Generates formatted HTML content for the info panel based on feature properties.
     * @param {ol.Feature} feature The OpenLayers feature.
     * @returns {string} HTML string for the info panel.
     */
    function getFormattedFeatureInfo(feature) {
        const properties = feature.getProperties();
        const type = properties.type; // Get the 'type' property (e.g., "Submarino", "Landing Station", "Data Center", "Cable Terrestre")
        let htmlContent = '<div>'; // Use a div as a container for better styling flexibility

        // Common properties for all features
        if (properties.name) {
            htmlContent += `<p><strong>Nombre:</strong> ${properties.name}</p>`;
        }
        if (properties.type) {
            htmlContent += `<p><strong>Tipo:</strong> ${properties.type}</p>`;
        }

        // Specific properties based on feature type
        switch (type) {
            case 'Submarino':
            case 'Cable Terrestre':
                // Properties for Cables
                if (properties.length_km) {
                    htmlContent += `<p><strong>Longitud (km):</strong> ${properties.length_km.toLocaleString()}</p>`;
                }
                if (properties.operator) {
                    htmlContent += `<p><strong>Operador:</strong> ${properties.operator}</p>`;
                }
                if (properties.route_description) {
                    htmlContent += `<p><strong>Descripción de Ruta:</strong> ${properties.route_description}</p>`;
                }
                break;

            case 'Landing Station':
                // Properties for Landing Points (Puntos de Aterrizaje)
                if (properties.address) {
                    htmlContent += `<p><strong>Dirección:</strong> ${properties.address}</p>`;
                }
                if (properties.capacity) {
                    htmlContent += `<p><strong>Capacidad:</strong> ${properties.capacity}</p>`;
                }
                if (properties.date_commissioned) {
                    htmlContent += `<p><strong>Fecha de Puesta en Servicio:</strong> ${properties.date_commissioned}</p>`;
                }
                if (properties.operator) {
                    htmlContent += `<p><strong>Operador:</strong> ${properties.operator}</p>`;
                }
                if (properties.connections) {
                    htmlContent += `<p><strong>Conexiones:</strong> ${properties.connections}</p>`;
                }
                if (properties.source) {
                    htmlContent += `<p><strong>Fuente de Información:</strong> ${properties.source}</p>`;
                }
                if (properties.reference_link) {
                    htmlContent += `<p><strong>Más Información:</strong> <a href="${properties.reference_link}" target="_blank">Ver Documento</a></p>`;
                }
                break;

            case 'Data Center':
                // Properties for Data Centers
                if (properties.address) {
                    htmlContent += `<p><strong>Dirección:</strong> ${properties.address}</p>`;
                }
                if (properties.pue) {
                    htmlContent += `<p><strong>Power Usage Effectiveness (PUE):</strong> ${properties.pue.toFixed(2)}</p>`;
                }
                if (properties.wue) {
                    htmlContent += `<p><strong>Water Usage Effectiveness (WUE):</strong> ${properties.wue.toFixed(2)}</p>`;
                }
                if (properties.source) {
                    htmlContent += `<p><strong>Fuente de Información:</strong> ${properties.source}</p>`;
                }
                if (properties.reference_link) {
                    htmlContent += `<p><strong>Más Información:</strong> <a href="${properties.reference_link}" target="_blank">Ver Detalle</a></p>`;
                }
                break;

            default:
                // Fallback for any other feature type or if 'type' is missing
                htmlContent += '<p>No hay información detallada disponible para este elemento.</p>';
                // You can also loop through all properties here, excluding specific ones
                for (const key in properties) {
                    // Exclude internal OpenLayers properties and styling attributes
                    if (properties.hasOwnProperty(key) &&
                        key !== 'geometry' &&
                        key !== 'color' &&
                        key !== 'width' &&
                        key !== 'shape' &&
                        key !== 'size' &&
                        key !== 'name' && // Already added above
                        key !== 'type' && // Already added above
                        key !== 'style' // If you have a 'style' property
                    ) {
                        let displayKey = key.replace(/_/g, ' ').replace(/\b\w/g, c => c.toUpperCase()); // Convert 'some_key' to 'Some Key'
                        let value = properties[key];

                        // Special handling for links that might appear in other properties
                        if (typeof value === 'string' && (value.startsWith('http://') || value.startsWith('https://'))) {
                            value = `<a href="${value}" target="_blank">${value}</a>`;
                        }
                        htmlContent += `<p><strong>${displayKey}:</strong> ${value}</p>`;
                    }
                }
                break;
        }

        htmlContent += '</div>';
        return htmlContent;
    }

    map.on('click', function(evt) {
        // Hide tooltip on click
        tooltipElement.style.display = 'none';

        const feature = map.forEachFeatureAtPixel(evt.pixel, function(feature, layer) {
            // Only return features from your specific layers (cables, points, data_centers, land_cables)
            if (layer === cableLayer || layer === pointLayer || layer === dataCenterLayer || layer === landCableLayer) {
                return feature;
            }
            return undefined;
        }, {
            hitTolerance: 5 // Adjust hit tolerance as needed
        });

        // ===========================================
        // START OF NEW LOGIC: Close layer panel on outside click
        // ===========================================
        const layerControlsPanel = document.getElementById('layer-controls');
        const toggleLayerControlsButton = document.getElementById('toggle-layer-controls');

        // Check if the click target is inside the layer controls panel or the button
        const isClickInsideLayerPanel = layerControlsPanel.contains(evt.originalEvent.target);
        const isClickInsideToggleButton = toggleLayerControlsButton.contains(evt.originalEvent.target);

        // If the panel is open and the click was outside of it and the button, close the panel
        if (layerControlsPanel.classList.contains('open') && !isClickInsideLayerPanel && !isClickInsideToggleButton) {
            layerControlsPanel.classList.remove('open');
            toggleLayerControlsButton.style.display = 'block'; // Show the button again
            // Do not process other clicks (e.g., feature clicks) if the goal was to close the panel
            return; 
        }
        // ===========================================
        // END OF NEW LOGIC
        // ===========================================

        const infoPanel = document.getElementById('info-panel');
        const panelContent = document.getElementById('panel-content');


        if (feature) {
            // Use the new function to get formatted content
            panelContent.innerHTML = getFormattedFeatureInfo(feature);
            infoPanel.classList.add('open'); // Show the panel
        } else {
            infoPanel.classList.remove('open'); // Hide the panel if no feature clicked
            panelContent.innerHTML = '<p>Haz click en un punto o cable para ver más información.</p>'; // Reset content
        }
    });


}); // End DOMContentLoaded

// === TOOLTIP LOGIC ===
const tooltipElement = document.getElementById('tooltip');
const tooltip = new ol.Overlay({
    element: tooltipElement,
    offset: [0, -15],
    positioning: 'bottom-center'
});
map.addOverlay(tooltip);

let hoveredFeature = null; // Track the currently hovered feature

// Debounce function to limit how often a function is called
const debounce = (func, delay) => {
    let timeoutId;
    return (...args) => {
        clearTimeout(timeoutId);
        timeoutId = setTimeout(() => {
            func.apply(null, args);
        }, delay);
    };
};

// This function will be debounced to check for features and update tooltip content/visibility
const updateTooltipContentAndVisibility = (pixel) => {
    let featureFoundAtPixel = false;
    map.forEachFeatureAtPixel(pixel, function(feature, layer) {
        // Check if the feature belongs to one of your custom layers
        if (layer === cableLayer || layer === pointLayer || layer === dataCenterLayer || layer === landCableLayer) {
            // Only update if it's a new feature or if we just started hovering
            if (feature !== hoveredFeature) {
                const properties = feature.getProperties();
                let tooltipContent = '';
                const name = properties['name'];
                const type = properties['type'];

                // REVERTED TOOLTIP FORMAT: Bold name on top, normal type below
                if (name && type) {
                    tooltipContent = `<strong>${name}</strong><br>${type}`;
                } else if (name) {
                    tooltipContent = `<strong>${name}</strong>`;
                } else if (type) {
                    tooltipContent = type;
                }

                if (tooltipContent) { // Only show if there's content to display
                    tooltipElement.innerHTML = tooltipContent;
                    tooltipElement.style.display = 'block';
                    hoveredFeature = feature; // Set the hovered feature for potential future use
                } else { // Feature found but no relevant info for tooltip
                    tooltipElement.style.display = 'none';
                    tooltipElement.innerHTML = '';
                    hoveredFeature = null;
                }
            }
            featureFoundAtPixel = true; // A relevant feature was found at this pixel
            return true; // Stop iterating over features once one is found on our layer
        }
    }, {
        hitTolerance: 5
    }); // hitTolerance makes it easier to select features

    // If no relevant feature was found at the pixel, hide the tooltip and clear the hovered feature
    if (!featureFoundAtPixel) {
        tooltipElement.style.display = 'none';
        tooltipElement.innerHTML = ''; // Clear content
        hoveredFeature = null;
    }
};

// Create a debounced version of the feature checking function
const debouncedUpdateTooltip = debounce(updateTooltipContentAndVisibility, 50); // 50ms debounce

// Main pointermove event listener
map.on('pointermove', function(event) {
    if (event.dragging) {
        tooltipElement.style.display = 'none';
        hoveredFeature = null;
        return;
    }

    // Always update tooltip position immediately
    tooltip.setPosition(event.coordinate);

    // Call the debounced function to check for features and update content/visibility
    debouncedUpdateTooltip(event.pixel);
});


// Optional: Change mouse cursor to a pointer when hovering over a feature
map.on('pointermove', function(evt) {
    const hit = map.hasFeatureAtPixel(evt.pixel, {
        layerFilter: function(layer) {
            // Check if the layer is one of our custom layers (cableLayer or pointLayer, etc.).
            return layer === cableLayer || layer === pointLayer || layer === dataCenterLayer || layer === landCableLayer;
        },
        hitTolerance: 5
    });
    map.getTargetElement().style.cursor = hit ? 'pointer' : '';
});

// === END OF TOOLTIP AND CURSOR LOGIC ===


// Optional: Fly to the extent of your features after they load
// This logic waits for all data sources to load before zooming.
let loadedSources = 0;
const totalSources = 4; // We have four sources: cable, points, data_centers, land_cables

const fitMapToAllFeatures = () => {
    if (loadedSources === totalSources) {
        const cableExtent = cableSource.getExtent();
        const pointExtent = pointSource.getExtent();
        const dataCenterExtent = dataCenterSource.getExtent();
        const landCableExtent = landCableSource.getExtent();

        // Combine all extents
        const combinedExtent = ol.extent.createEmpty();
        ol.extent.extend(combinedExtent, cableExtent);
        ol.extent.extend(combinedExtent, pointExtent);
        ol.extent.extend(combinedExtent, dataCenterExtent);
        ol.extent.extend(combinedExtent, landCableExtent);


        if (combinedExtent && combinedExtent[0] !== Infinity) { // Check if extent is valid
            map.getView().fit(combinedExtent, {
                padding: [50, 50, 50, 50], // Add padding around the features
                duration: 1000 // Smooth animation
            });
        }
    }
};

// Listen for 'addfeature' event on all sources
cableSource.on('addfeature', function() {
    loadedSources++;
    fitMapToAllFeatures();
});
pointSource.on('addfeature', function() {
    loadedSources++;
    fitMapToAllFeatures();
});
dataCenterSource.on('addfeature', function() {
    loadedSources++;
    fitMapToAllFeatures();
});
landCableSource.on('addfeature', function() {
    loadedSources++;
    fitMapToAllFeatures();
});