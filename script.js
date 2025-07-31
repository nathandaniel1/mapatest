// script.js

// Crea una nueva instancia del mapa con una capa base de OpenStreetMap.
const map = new ol.Map({
    target: 'map', // El ID del elemento div donde se renderizará el mapa.
    layers: [
        new ol.layer.Tile({
            source: new ol.source.OSM(), // OpenStreetMap como capa base.
            className: 'ol-layer-osm-grayscale' // Aplica una clase CSS para el efecto de escala de grises.
        })
    ],
    view: new ol.View({
        // Define una vista inicial del mapa.
        center: ol.proj.fromLonLat([-70.0, -35.0]), // Centro inicial del mapa (aproximadamente Chile).
        zoom: 6 // Nivel de zoom inicial.
    })
});

// >>> INICIO DE CAMBIOS PARA LA ROTACIÓN <<<
// Obtiene las interacciones predeterminadas del mapa.
const interactions = map.getInteractions().getArray();

// Encuentra la interacción PinchRotate (gesto de pinza para rotar) y la desactiva.
// Esto evita la rotación del mapa con gestos táctiles.
interactions.forEach(function(interaction) {
    if (interaction instanceof ol.interaction.PinchRotate) {
        interaction.setActive(false);
    }
});
// >>> FIN DE CAMBIOS PARA LA ROTACIÓN <<<


// Crea una fuente vectorial para los datos de cables.
const cableSource = new ol.source.Vector({
    format: new ol.format.GeoJSON({
        dataProjection: 'EPSG:4326', // La proyección de los datos GeoJSON (longitud, latitud - WGS84).
        featureProjection: 'EPSG:3857' // La proyección del mapa (Web Mercator).
    }),
    url: 'data/cable.geojson', // Ruta al archivo GeoJSON de cables.
    wrapX: false // Evita que las características se dupliquen al cruzar el antimeridiano.
});

// Crea una capa vectorial para mostrar los datos de cables.
const cableLayer = new ol.layer.Vector({
    source: cableSource,
    // Función de estilo para cada característica de cable.
    style: function(feature) {
        // Obtiene el color, ancho y estilo de línea directamente de las propiedades GeoJSON.
        const geojsonColor = feature.get('color');
        const geojsonWidth = feature.get('width');
        const geojsonLineDash = feature.get('lineDash');

        // Usa las propiedades GeoJSON o valores predeterminados si no están presentes.
        const color = geojsonColor || 'rgba(255, 0, 0, 0.7)'; // Rojo por defecto.
        const width = geojsonWidth || 3; // Ancho por defecto.
        const lineDash = geojsonLineDash || undefined; // Sin estilo de guiones por defecto.

        return new ol.style.Style({
            stroke: new ol.style.Stroke({
                color: color, // Aplica el color.
                width: width, // Aplica el ancho.
                lineDash: lineDash // Aplica el estilo de línea (punteado/guiones).
            })
        });
    }
});


// Crea una fuente vectorial para los datos de puntos.
const pointSource = new ol.source.Vector({
    format: new ol.format.GeoJSON({
        dataProjection: 'EPSG:4326',
        featureProjection: 'EPSG:3857'
    }),
    url: 'data/puntos.geojson', // Ruta al archivo GeoJSON de puntos.
    wrapX: false
});

// Crea una capa vectorial para mostrar los puntos.
const pointLayer = new ol.layer.Vector({
    source: pointSource,
    // Función de estilo para cada característica de punto.
    style: function(feature) {
        const shape = feature.get('shape'); // Forma del punto (ej. 'circle', 'square').
        const color = feature.get('color'); // Color del punto.
        const size = feature.get('size'); // Tamaño del punto.

        let fillColor = color || '#FFD700'; // Color de relleno por defecto (dorado).
        let strokeColor = '#333'; // Color del borde.
        let pointSize = size || 5; // Tamaño del punto por defecto.

        let pointStyle;

        // Determina la forma y crea el estilo adecuado (insensible a mayúsculas/minúsculas).
        if (shape && shape.toLowerCase() === 'circle') {
            pointStyle = new ol.style.Style({
                image: new ol.style.Circle({
                    radius: pointSize, // Radio del círculo.
                    fill: new ol.style.Fill({
                        color: fillColor // Color de relleno.
                    }),
                    stroke: new ol.style.Stroke({
                        color: strokeColor, // Color del borde.
                        width: 1
                    })
                })
            });
        } else if (shape && shape.toLowerCase() === 'square') {
            pointStyle = new ol.style.Style({
                image: new ol.style.RegularShape({
                    points: 4, // 4 puntos para una forma cuadrada.
                    radius: pointSize, // Radio para el tamaño del cuadrado.
                    angle: Math.PI / 4, // Rota para que parezca un cuadrado.
                    fill: new ol.style.Fill({
                        color: fillColor // Color de relleno del cuadrado.
                    }),
                    stroke: new ol.style.Stroke({
                        color: strokeColor, // Color del borde.
                        width: 1
                    })
                })
            });
        } else {
            // Por defecto, se renderiza como un círculo si la forma no está especificada o reconocida.
            pointStyle = new ol.style.Style({
                image: new ol.style.Circle({
                    radius: pointSize, // Radio del círculo por defecto.
                    fill: new ol.style.Fill({
                        color: fillColor // Color de relleno por defecto.
                    }),
                    stroke: new ol.style.Stroke({
                        color: strokeColor, // Color del borde por defecto.
                        width: 1
                    })
                })
            });
        }
        return pointStyle;
    }
});


// Crea una fuente vectorial para los datos de centros de datos.
const dataCenterSource = new ol.source.Vector({
    format: new ol.format.GeoJSON({
        dataProjection: 'EPSG:4326',
        featureProjection: 'EPSG:3857'
    }),
    url: 'data/data_centers.geojson', // Ruta al archivo GeoJSON de centros de datos.
    wrapX: false
});

// Crea una capa vectorial para mostrar los centros de datos.
const dataCenterLayer = new ol.layer.Vector({
    source: dataCenterSource,
    // Función de estilo para cada característica de centro de datos.
    style: function(feature) {
        const geometryType = feature.getGeometry().getType(); // Tipo de geometría de la característica.
        const zoom = map.getView().getZoom(); // Nivel de zoom actual del mapa.
        const color = feature.get('color'); // Color del centro de datos.
        const size = feature.get('size'); // Tamaño del centro de datos.
        const shape = feature.get('shape'); // Forma del marcador (ej. 'square', 'circle').

        let fillColor = color || '#5DADE2'; // Color de relleno por defecto (azul claro).
        let strokeColor = '#333'; // Color del borde.
        let pointSize = size || 8; // Tamaño del marcador por defecto.

        const styles = []; // Array para almacenar los estilos (puede haber múltiples estilos por característica).

        // Siempre añade un estilo de punto para los Centros de Datos.
        // Para Polígonos, usa el centroide para colocar el ícono del punto.
        let pointGeometry = feature.getGeometry();
        if (geometryType === 'Polygon' || geometryType === 'MultiPolygon') {
            // Obtiene el punto interior (centroide) del polígono para el marcador.
            pointGeometry = ol.geom.Polygon.prototype.getInteriorPoint.call(feature.getGeometry());
        }

        let pointImage;
        // Determina la forma del marcador (círculo o cuadrado).
        if (shape && shape.toLowerCase() === 'circle') {
            pointImage = new ol.style.Circle({
                radius: pointSize,
                fill: new ol.style.Fill({ color: fillColor }),
                stroke: new ol.style.Stroke({ color: strokeColor, width: 1 })
            });
        } else { // Por defecto, es un cuadrado para centros de datos.
            pointImage = new ol.style.RegularShape({
                points: 4,
                radius: pointSize,
                angle: Math.PI / 4, // Rota para que el cuadrado esté alineado.
                fill: new ol.style.Fill({ color: fillColor }),
                stroke: new ol.style.Stroke({ color: strokeColor, width: 1 })
            });
        }
        styles.push(new ol.style.Style({
            image: pointImage,
            geometry: pointGeometry // Aplica el estilo de punto en el punto real o en el centroide del polígono.
        }));

        // Añade el estilo de Polígono/MultiPolígono solo si la característica tiene una geometría de polígono
        // Y el nivel de zoom es suficiente para ver los detalles del polígono.
        if ((geometryType === 'Polygon' || geometryType === 'MultiPolygon') && zoom >= 13) { // Ajusta el 13 según sea necesario.
            styles.push(new ol.style.Style({
                // Sin propiedad de relleno para un interior transparente.
                stroke: new ol.style.Stroke({
                    color: '#2BAB64', // Color verde.
                    width: 2,
                    lineDash: [10, 10] // Línea discontinua (10 píxeles encendidos, 10 píxeles apagados).
                })
            }));
        }
        return styles; // Devuelve todos los estilos aplicables a la característica.
    }
});

// Crea una fuente vectorial para los datos de cables terrestres.
const landCableSource = new ol.source.Vector({
    format: new ol.format.GeoJSON({
        dataProjection: 'EPSG:4326',
        featureProjection: 'EPSG:3857'
    }),
    url: 'data/land_cables.geojson', // Ruta al archivo GeoJSON de cables terrestres.
    wrapX: false
});

// Crea una capa vectorial para mostrar los cables terrestres.
const landCableLayer = new ol.layer.Vector({
    source: landCableSource,
    // Función de estilo para cada característica de cable terrestre.
    style: function(feature) {
        const geojsonColor = feature.get('color');
        const geojsonWidth = feature.get('width');
        const geojsonLineDash = feature.get('lineDash');

        const color = geojsonColor || 'rgba(0, 0, 255, 0.7)'; // Color por defecto (azul).
        const width = geojsonWidth || 3; // Ancho por defecto.
        const lineDash = geojsonLineDash || undefined; // Sin estilo de guiones por defecto.

        return new ol.style.Style({
            stroke: new ol.style.Stroke({
                color: color, // Aplica el color.
                width: width, // Aplica el ancho.
                lineDash: lineDash // Aplica el estilo de línea.
            })
        });
    }
});

// Agrega las capas al mapa en un orden específico para asegurar que los puntos y centros
// de datos se muestren por encima de las líneas de cables.
map.addLayer(cableLayer);
map.addLayer(landCableLayer);
map.addLayer(pointLayer);
map.addLayer(dataCenterLayer);


// === LÓGICA DEL PANEL DE INFORMACIÓN ===
const infoPanel = document.getElementById('info-panel'); // Referencia al elemento HTML del panel de información.
const closePanelBtn = document.querySelector('.close-panel'); // Referencia al botón de cerrar el panel.
const panelContent = document.getElementById('panel-content'); // Referencia al div donde se mostrará el contenido.
let selectedFeature = null; // Almacena la característica del mapa que está actualmente seleccionada.

// Diccionario de traducción para las claves de las propiedades de las características GeoJSON.
// Esto permite mostrar nombres de propiedades más amigables en el panel de información.
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
    'width': 'Ancho',
    'año': 'Año',
    'consultora': 'Consultora',
    'superficie_predial': 'Superficie Predial',
    'superficie_construida': 'Superficie Construida',
    'inversion': 'Inversión',
    'tipo_de_refrigeracion': 'Tipo de Refrigeración', // Nota: Verifica la clave exacta de tu GeoJSON.
    'evaluacion_ambiental': 'Evaluación Ambiental',
    'comuna': 'Comuna' // Agregada comuna para la visualización.
};

// Lista de claves de propiedades que deben ser excluidas y no se mostrarán en el panel de información.
const excludedKeys = ['name', 'type', 'shape', 'color', 'size', 'opacity', 'geometry', 'width'];

/**
 * Genera el contenido HTML formateado para mostrar la información de una característica
 * en el panel lateral.
 * @param {ol.Feature} feature - La característica de OpenLayers de la cual extraer la información.
 * @returns {string} - Una cadena HTML con los detalles de la característica.
 */
function getFormattedFeatureInfo(feature) {
    const properties = feature.getProperties(); // Obtiene todas las propiedades de la característica.
    let content = '';

    // Maneja el título y subtítulo del panel usando las propiedades 'name' y 'type'.
    const name = properties['name'] || 'Información del Elemento';
    const type = properties['type'] || 'Elemento';
    content += `<h2>${name}</h2>`; // Título principal del panel.
    content += `<h4 class="subtitle">${type}</h4>`; // Subtítulo del panel.

    // Itera sobre todas las propiedades de la característica para construir la lista de información.
    for (const key in properties) {
        const lowercaseKey = key.toLowerCase(); // Convierte la clave a minúsculas para una comparación consistente.
        // Excluye propiedades basándose en la lista `excludedKeys` y valores nulos/vacíos.
        if (properties.hasOwnProperty(key) && !excludedKeys.includes(lowercaseKey) && properties[key]) {
            // Obtiene la clave traducida del diccionario, o la formatea si no se encuentra.
            const translatedKey = translationDict[lowercaseKey] || key.replace(/_/g, ' ').replace(/\b\w/g, c => c.toUpperCase());
            let value = properties[key];

            // Verifica si la propiedad es una URL de imagen y la formatea como una etiqueta <img>.
            if (lowercaseKey === 'image' && value) {
                if (typeof value === 'string' && value.startsWith('http')) {
                    content += `<div class="info-item image-container"><img src="${value}" alt="${name}"></div>`;
                }
            }
            // Verifica si la propiedad es un enlace de referencia y la formatea como un enlace cliqueable.
            else if (lowercaseKey === 'reference_link' && value) {
                content += `<div class="info-item"><strong>${translatedKey}:</strong> <a href="${value}" target="_blank" rel="noopener noreferrer">Ver Referencia</a></div>`;
            }
            // Para cualquier otra propiedad, la formatea como un elemento de lista simple.
            else {
                if (value !== null && value !== undefined && value !== '') {
                    content += `<div class="info-item"><strong>${translatedKey}:</strong> ${value}</div>`;
                }
            }
        }
    }
    return content;
}

// Añade un escuchador de eventos al botón de cerrar el panel de información.
closePanelBtn.addEventListener('click', () => {
    infoPanel.classList.remove('open'); // Remueve la clase 'open' para ocultar el panel.
    selectedFeature = null; // Limpia la característica seleccionada para permitir una nueva selección.
});

// Escuchador de eventos para los clics en el mapa para mostrar el panel de información.
map.on('click', function(evt) {
    // Busca una característica en el píxel donde se hizo clic.
    const feature = map.forEachFeatureAtPixel(evt.pixel, function(feature) {
        return feature;
    }, {
        hitTolerance: 5 // Aumenta la tolerancia de clic para una mejor respuesta táctil en móviles.
    });

    if (feature) {
        selectedFeature = feature; // Almacena la característica clicada.
        const info = getFormattedFeatureInfo(selectedFeature); // Obtiene la información formateada.
        panelContent.innerHTML = info; // Muestra la información en el panel.
        infoPanel.classList.add('open'); // Añade la clase 'open' para mostrar el panel.

        const featureGeometry = selectedFeature.getGeometry(); // Obtiene la geometría de la característica.
        if (featureGeometry) {
            let currentMaxZoom = 16; // Zoom máximo predeterminado para características más grandes (ej. cables).
            const featureType = selectedFeature.get('type'); // Obtiene la propiedad 'type' de la característica.

            // Ajusta el zoom máximo según el tipo de característica para una mejor experiencia de usuario.
            if (featureType && (featureType.toLowerCase() === 'point' || featureType.toLowerCase() === 'data center')) {
                currentMaxZoom = 15; // Menos zoom para puntos/centros de datos.
            } else if (featureType && (featureType.toLowerCase() === 'landing point')) {
                currentMaxZoom = 13; // Menos zoom para puntos de aterrizaje.
            }

            // Determina el padding para el ajuste de la vista del mapa según el tamaño de la pantalla (responsive).
            let fitPadding = [100, 100, 100, 100]; // Padding predeterminado.
            const mobileBreakpoint = 768; // Punto de quiebre para dispositivos móviles (debe coincidir con CSS).

            if (window.innerWidth <= mobileBreakpoint) {
                // En móviles, el panel está en la parte inferior, así que aumenta el padding inferior.
                fitPadding = [100, 100, 450, 100]; // Padding ajustado para móviles.
            } else {
                // En escritorio, el panel está a la derecha, así que aumenta el padding derecho.
                // Se asume que el panel tiene aproximadamente 300px de ancho en escritorio.
                fitPadding = [100, 350, 100, 100];
            }

            // Ajusta la vista del mapa para que la extensión de la característica sea visible,
            // con animación, padding y zoom máximo.
            map.getView().fit(featureGeometry.getExtent(), {
                duration: 700, // Duración de la animación en milisegundos.
                padding: fitPadding, // Padding dinámico.
                maxZoom: currentMaxZoom // Zoom máximo aplicado.
            });
        }

    } else {
        // Si no se hizo clic en ninguna característica, pero el panel está abierto, lo cierra.
        if (infoPanel.classList.contains('open')) {
            infoPanel.classList.remove('open');
        }
    }
});

// === LÓGICA DEL TOOLTIP AL PASAR EL RATÓN ===
const tooltipElement = document.getElementById('tooltip'); // Referencia al elemento HTML del tooltip.
const tooltip = new ol.Overlay({
    element: tooltipElement, // El elemento HTML del overlay.
    offset: [10, 0], // Desplazamiento del tooltip respecto al puntero.
    positioning: 'bottom-left' // Posicionamiento del tooltip.
});
map.addOverlay(tooltip); // Añade el overlay del tooltip al mapa.

// Escucha el evento de movimiento del puntero sobre el mapa.
map.on('pointermove', function(evt) {
    if (evt.dragging) { // Si el mapa se está arrastrando, no muestra el tooltip.
        return;
    }
    const pixel = map.getEventPixel(evt.originalEvent); // Obtiene las coordenadas del píxel del evento.
    const hit = map.hasFeatureAtPixel(pixel); // Verifica si hay una característica en el píxel.
    map.getTargetElement().style.cursor = hit ? 'pointer' : ''; // Cambia el cursor a 'pointer' si hay una característica.

    // Busca la característica en el píxel actual.
    const feature = map.forEachFeatureAtPixel(evt.pixel, function(feature) {
        return feature;
    });

    if (feature) {
        const properties = feature.getProperties(); // Obtiene las propiedades de la característica.
        const name = properties['name'] || 'Elemento'; // Nombre de la característica.
        const type = properties['type']; // Tipo de la característica.

        let tooltipContent = `<strong>${name}</strong>`; // Contenido base del tooltip con el nombre.
        if (type) {
            tooltipContent += `<br>${type}`; // Añade el tipo en una nueva línea si existe.
        }

        tooltipElement.innerHTML = tooltipContent; // Establece el contenido formateado del tooltip.
        tooltip.setPosition(evt.coordinate); // Posiciona el tooltip en las coordenadas del puntero.
        tooltipElement.style.display = 'block'; // Hace visible el tooltip.
    } else {
        tooltipElement.style.display = 'none'; // Oculta el tooltip si no hay característica.
    }
});


// === LÓGICA DE VISIBILIDAD DE CAPAS ===

// Se ejecuta una vez que el DOM está completamente cargado.
document.addEventListener('DOMContentLoaded', function() {
    // Asegura que todos los elementos se seleccionen correctamente después de cargar el DOM.
    const toggleCables = document.getElementById('toggle-cables');
    const togglePoints = document.getElementById('toggle-points');
    const toggleDataCenters = document.getElementById('toggle-data-centers');
    const toggleLandCables = document.getElementById('toggle-land-cables');

    const toggleLayerControlsButton = document.getElementById('toggle-layer-controls'); // Botón para abrir/cerrar controles de capa.
    const layerControls = document.querySelector('.layer-controls'); // Panel de controles de capa.


    // Establece la visibilidad inicial de las capas según el estado de los checkboxes en el HTML.
    cableLayer.setVisible(toggleCables.checked);
    pointLayer.setVisible(togglePoints.checked);
    dataCenterLayer.setVisible(toggleDataCenters.checked);
    landCableLayer.setVisible(toggleLandCables.checked);


    // Añade escuchadores de eventos 'change' a cada checkbox para alternar la visibilidad de la capa.
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

    // Lógica para alternar la visibilidad del panel de controles de capa y ocultar/mostrar el botón.
    if (toggleLayerControlsButton) {
        toggleLayerControlsButton.addEventListener('click', function() {
            if (layerControls) {
                const isPanelOpen = layerControls.classList.toggle('open'); // Alterna la clase 'open'.
                // Oculta el botón cuando el panel está abierto, lo muestra cuando está cerrado.
                toggleLayerControlsButton.style.display = isPanelOpen ? 'none' : 'block';
            }
        });
    }

    // Nueva lógica más robusta para ajustar la vista del mapa a todas las características al cargar.
    const allSources = [cableSource, pointSource, dataCenterSource, landCableSource]; // Todas las fuentes de datos.
    const sourcesToWaitFor = allSources.length; // Número total de fuentes a esperar.
    let sourcesLoaded = 0; // Contador de fuentes cargadas.

    const onSourceChange = function() {
        if (this.getState() === 'ready') { // Si la fuente está en estado 'ready' (cargada).
            sourcesLoaded++; // Incrementa el contador.
            if (sourcesLoaded === sourcesToWaitFor) { // Si todas las fuentes han cargado.
                let combinedExtent = ol.extent.createEmpty(); // Crea una extensión geográfica vacía.
                // Extiende la extensión combinada con la extensión de cada fuente que tenga características.
                allSources.forEach(s => {
                    if (s.getFeatures().length > 0) {
                        ol.extent.extend(combinedExtent, s.getExtent());
                    }
                });

                // Si la extensión combinada no está vacía (hay datos), ajusta la vista del mapa.
                if (!ol.extent.isEmpty(combinedExtent)) {
                    map.getView().fit(combinedExtent, {
                        padding: [50, 50, 50, 50], // Padding alrededor de la extensión.
                        duration: 1000, // Duración de la animación.
                        maxZoom: 10 // Zoom máximo permitido al ajustar la vista.
                    });
                }
                // Remueve los escuchadores de eventos después de que han cumplido su propósito.
                allSources.forEach(s => s.un('change', onSourceChange));
            }
        }
    };
    // Asigna el escuchador de eventos 'change' a cada fuente para detectar cuándo están listas.
    allSources.forEach(source => source.on('change', onSourceChange));

    // Nueva lógica para cerrar paneles al hacer clic fuera de ellos.
    document.addEventListener('click', function(event) {
        // Cierra el panel de controles de capa si está abierto y el clic no fue dentro de él o de su botón.
        if (layerControls.classList.contains('open') && !layerControls.contains(event.target) && !toggleLayerControlsButton.contains(event.target)) {
            layerControls.classList.remove('open');
            toggleLayerControlsButton.style.display = 'block'; // Asegura que el botón sea visible al cerrar.
        }

        // Cierra el panel de información si está abierto y el clic no fue dentro de él.
        // También evita cerrar si el clic fue dentro del área del mapa (que tiene su propia lógica de clic).
        if (infoPanel.classList.contains('open') && !infoPanel.contains(event.target) && !map.getTargetElement().contains(event.target.closest('.ol-viewport'))) {
            infoPanel.classList.remove('open');
            selectedFeature = null; // Deselecciona la característica.
        }
    });

    // Detiene la propagación de eventos de clic dentro del panel de información
    // para evitar que los clics internos (ej. en enlaces) cierren el panel.
    if (infoPanel) {
        infoPanel.addEventListener('click', function(event) {
            event.stopPropagation();
        });
    }

    // Detiene la propagación de eventos de clic dentro del panel de controles de capa.
    if (layerControls) {
        layerControls.addEventListener('click', function(event) {
            event.stopPropagation();
        });
    }
});
