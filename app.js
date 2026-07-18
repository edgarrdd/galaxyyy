// ===============================================
// ARCHIVO: app.js
// LÓGICA DE SECUENCIA Y ANIMACIÓN 3D
// ===============================================

// Variables principales de Three.js
let scene, camera, renderer, controls;
let celestialBodies = []; // Para rotación propia de los cuerpos (Sol y Luna)
let saturnBody, saturnRings; // Referencias para la rotación propia de Saturno
let saturnSystem; // Referencia para la órbita de Saturno alrededor del Sol
let moonParticleReference; // Referencia para la luna (AHORA SIN GRUPO DE ÓRBITA)
const TEXT_3D_COLOR = 0xFF4500; 

// ===============================================
// INICIALIZACIÓN Y ANIMACIÓN DEL UNIVERSO 3D
// ===============================================

function initThreeJS() {
    // 1. ESCENA y FONDO
    scene = new THREE.Scene();
    scene.background = new THREE.Color(0x000000); // Fondo negro
    
    // 2. CÁMARA
    camera = new THREE.PerspectiveCamera(75, window.innerWidth / window.innerHeight, 0.1, 1000); 
    camera.position.z = 80; 
    
    // 3. RENDERIZADOR
    renderer = new THREE.WebGLRenderer({ antialias: true, powerPreference: "high-performance" });
    renderer.setSize(window.innerWidth, window.innerHeight);
    document.body.appendChild(renderer.domElement); 
    
    // 4. CONTROLES DE ÓRBITA (Pantalla movible 3D)
    controls = new THREE.OrbitControls(camera, renderer.domElement);
    controls.enableDamping = true;
    controls.dampingFactor = 0.05;
    controls.minDistance = 10; 
    controls.maxDistance = 150; 

    // 5. LUCES
    const ambientLight = new THREE.AmbientLight(0x404040, 2); 
    scene.add(ambientLight);
    const sunLight = new THREE.DirectionalLight(0xffffff, 3); 
    sunLight.position.set(10, 5, 15);
    scene.add(sunLight);

    // 6. CREACIÓN DE CUERPOS CELESTES (SOL, SATURNO y LUNA)
    
    // --- EL SOL ---
    const sunParticles = createSunParticles(0, 0, 0, 10, 0xffaa00, 0xff0000); 
    celestialBodies.push(sunParticles); 
    
    // 7. AÑADIR FRASE ALREDEDOR DEL SOL 🌟
    const sunText = "Hay millones de estrellas pero yo decidí girar alrededor de la más grande y hermosa: el sol";
    // Posicionar el texto por encima y ligeramente a un lado del Sol (radio 10)
    addSimpleText(sunText, 0, 15, 0, TEXT_3D_COLOR, 1.2); // El tamaño se aumentó a 1.2
    // ------------------------------------

    // --- SISTEMA DE SATURNO (para que orbite el Sol) ---
    saturnSystem = new THREE.Group();
    scene.add(saturnSystem); 

    const saturnDistanceFromSun = 40; 
    const saturnInitialX = saturnDistanceFromSun;
    const saturnInitialY = 0;
    const saturnInitialZ = 0;

    const saturnObjects = createSaturn(new THREE.Vector3(saturnInitialX, saturnInitialY, saturnInitialZ));
    saturnSystem.add(saturnObjects.body);
    saturnSystem.add(saturnObjects.rings);
    saturnBody = saturnObjects.body; 
    saturnRings = saturnObjects.rings; 
    
    addSimpleText("tú y yo contra el mundo ♥", saturnInitialX - 5.5, saturnInitialY + 7, saturnInitialZ, TEXT_3D_COLOR); 
    
    // --- UNA LUNA (cerca de Saturno, sin órbita) ---
    const moonDistanceFromSaturn = 8; 
    const moonHeightOffset = 4; 

    // La luna se añade directamente al saturnSystem. Su posición se define en el sistema de coordenadas
    // que se mueve alrededor del Sol, pero no tiene un grupo propio para la órbita alrededor de Saturno.
    const moonParticles = addSmallMoon(saturnInitialX + moonDistanceFromSaturn, saturnInitialY + moonHeightOffset, saturnInitialZ, 1.0, 0xaaaaaa, 0xcccccc, "Mi Luna");
    saturnSystem.add(moonParticles); 
    moonParticleReference = moonParticles; // Guardamos referencia para la rotación propia
    celestialBodies.push(moonParticles); // Para rotación propia (index 1)
    
    addSimpleText("Mi Luna", saturnInitialX + moonDistanceFromSaturn + 1.5, saturnInitialY + moonHeightOffset, saturnInitialZ, 0xcccccc); 

    // --- CAMPO DE ESTRELLAS ---
    createStarField(300); // Crea un campo de estrellas simples y brillantes

    window.addEventListener('resize', onWindowResize, false);
    animate();
}

function animate() {
    requestAnimationFrame(animate);
    
    // Rotación propia del Sol
    const sun = celestialBodies[0];
    if (sun) {
          sun.rotation.y += 0.003; 
          sun.scale.setScalar(1 + Math.sin(Date.now() * 0.0005) * 0.02); 
    }
    
    // Rotación propia de Saturno y sus anillos
    if (saturnBody) {
        saturnBody.rotation.y += 0.005; 
        saturnRings.rotation.y += 0.005; 
    }
    
    // Rotación propia de la Luna
    const moon = celestialBodies[1]; 
    if (moon) {
        moon.rotation.y += 0.008;
    }

    // --- MOVIMIENTOS ORBITALES ---

    // ÓRBITA LENTA DE SATURNO ALREDEDOR DEL SOL
    if (saturnSystem) {
        saturnSystem.rotation.y += 0.0005; 
    }
    
    // CAMBIO CLAVE: Se ha eliminado el código de órbita de la luna alrededor de Saturno

    controls.update();
    renderer.render(scene, camera);
}

function onWindowResize() {
    camera.aspect = window.innerWidth / window.innerHeight;
    camera.updateProjectionMatrix();
    renderer.setSize(window.innerWidth, window.innerHeight);
}

// ===============================================
// FUNCIONES DE CREACIÓN DE CUERPOS Y ESTRELLAS
// (Se mantienen sin cambios)
// ===============================================

function createSunParticles(x, y, z, radius, color1, color2) {
    const particleCount = 7000; 
    const positions = new Float32Array(particleCount * 3);
    const colors = new Float32Array(particleCount * 3);
    const c1 = new THREE.Color(color1); 
    const c2 = new THREE.Color(color2); 
    for (let i = 0; i < particleCount; i++) {
        const r = radius * Math.cbrt(Math.random()) * (0.8 + Math.random() * 0.4); 
        const theta = Math.random() * Math.PI * 2; 
        const phi = Math.acos((Math.random() * 2) - 1);
        positions[i * 3] = r * Math.sin(phi) * Math.cos(theta);
        positions[i * 3 + 1] = r * Math.sin(phi) * Math.sin(theta);
        positions[i * 3 + 2] = r * Math.cos(phi);
        const mixedColor = c1.clone().lerp(c2, r / radius);
        colors[i * 3] = mixedColor.r;
        colors[i * 3 + 1] = mixedColor.g;
        colors[i * 3 + 2] = mixedColor.b;
    }
    const geometry = new THREE.BufferGeometry();
    geometry.setAttribute('position', new THREE.BufferAttribute(positions, 3));
    geometry.setAttribute('color', new THREE.BufferAttribute(colors, 3));
    const material = new THREE.PointsMaterial({
        size: 0.2, vertexColors: true, blending: THREE.AdditiveBlending, transparent: true, depthWrite: false 
    });
    const sunParticles = new THREE.Points(geometry, material);
    sunParticles.position.set(x, y, z);
    scene.add(sunParticles);
    return sunParticles; 
}

function createSaturn(position) {
    const planetRadius = 4;
    const planetParticleCount = 5000; 
    const planetPositions = new Float32Array(planetParticleCount * 3);
    const planetColors = new Float32Array(planetParticleCount * 3);
    const colorCore = new THREE.Color(0xccaa88); 
    const colorSurface = new THREE.Color(0xffddaa); 
    for (let i = 0; i < planetParticleCount; i++) {
        const r = planetRadius * Math.cbrt(Math.random()); 
        const theta = Math.random() * Math.PI * 2; 
        const phi = Math.acos((Math.random() * 2) - 1);
        planetPositions[i * 3] = r * Math.sin(phi) * Math.cos(theta);
        planetPositions[i * 3 + 1] = r * Math.sin(phi) * Math.sin(theta);
        planetPositions[i * 3 + 2] = r * Math.cos(phi);
        const mixedColor = colorCore.clone().lerp(colorSurface, r / planetRadius);
        planetColors[i * 3] = mixedColor.r;
        planetColors[i * 3 + 1] = mixedColor.g;
        planetColors[i * 3 + 2] = mixedColor.b;
    }
    const planetGeometry = new THREE.BufferGeometry();
    planetGeometry.setAttribute('position', new THREE.BufferAttribute(planetPositions, 3));
    planetGeometry.setAttribute('color', new THREE.BufferAttribute(planetColors, 3));
    const planetMaterial = new THREE.PointsMaterial({
        size: 0.1, vertexColors: true, blending: THREE.AdditiveBlending, transparent: true, depthWrite: false
    });
    const planetParticles = new THREE.Points(planetGeometry, planetMaterial);
    planetParticles.position.copy(position);
    
    const ringParticleCount = 10000; 
    const ringPositions = new Float32Array(ringParticleCount * 3);
    const ringColors = new Float32Array(ringParticleCount * 3);
    const innerRadius = planetRadius * 1.2; 
    const outerRadius = planetRadius * 2.5; 
    const ringThickness = 0.5; 
    const colorRingInner = new THREE.Color(0x888877); 
    const colorRingOuter = new THREE.Color(0xbb9977); 
    for (let i = 0; i < ringParticleCount; i++) {
        const r = innerRadius + (Math.random() * (outerRadius - innerRadius));
        const angle = Math.random() * Math.PI * 2; 
        ringPositions[i * 3] = r * Math.cos(angle);
        ringPositions[i * 3 + 1] = (Math.random() - 0.5) * ringThickness;
        ringPositions[i * 3 + 2] = r * Math.sin(angle);
        const mixedColor = colorRingInner.clone().lerp(colorRingOuter, (r - innerRadius) / (outerRadius - innerRadius));
        ringColors[i * 3] = mixedColor.r;
        ringColors[i * 3 + 1] = mixedColor.g;
        ringColors[i * 3 + 2] = mixedColor.b;
    }
    const ringGeometry = new THREE.BufferGeometry();
    ringGeometry.setAttribute('position', new THREE.BufferAttribute(ringPositions, 3));
    ringGeometry.setAttribute('color', new THREE.BufferAttribute(ringColors, 3));
    const ringMaterial = new THREE.PointsMaterial({
        size: 0.05, vertexColors: true, blending: THREE.AdditiveBlending, transparent: true, depthWrite: false 
    });
    const ringParticles = new THREE.Points(ringGeometry, ringMaterial);
    ringParticles.position.copy(position);
    
    return {body: planetParticles, rings: ringParticles};
}

function addSmallMoon(x, y, z, radius, color1, color2, message) {
    const particleCount = 500; 
    const positions = new Float32Array(particleCount * 3);
    const colors = new Float32Array(particleCount * 3);
    const c1 = new THREE.Color(color1);
    const c2 = new THREE.Color(color2);
    for (let i = 0; i < particleCount; i++) {
        const r = radius * Math.cbrt(Math.random()); 
        const theta = Math.random() * Math.PI * 2; 
        const phi = Math.acos((Math.random() * 2) - 1);
        positions[i * 3] = r * Math.sin(phi) * Math.cos(theta);
        positions[i * 3 + 1] = r * Math.sin(phi) * Math.sin(theta);
        positions[i * 3 + 2] = r * Math.cos(phi);
        const mixedColor = c1.clone().lerp(c2, r / radius);
        colors[i * 3] = mixedColor.r;
        colors[i * 3 + 1] = mixedColor.g;
        colors[i * 3 + 2] = mixedColor.b;
    }
    const geometry = new THREE.BufferGeometry();
    geometry.setAttribute('position', new THREE.BufferAttribute(positions, 3));
    geometry.setAttribute('color', new THREE.BufferAttribute(colors, 3));
    const material = new THREE.PointsMaterial({
        size: 0.1, vertexColors: true, blending: THREE.AdditiveBlending, transparent: true, depthWrite: false
    });
    const moon = new THREE.Points(geometry, material);
    moon.position.set(x, y, z);
    addSimpleText(message, x + radius + 0.5, y, z, color2);
    return moon;
}

// NUEVA FUNCIÓN: crea un campo de estrellas simples
function createStarField(radius) {
    const starCount = 80000; // Más estrellas para un campo denso
    const positions = new Float32Array(starCount * 3);
    const colors = new Float32Array(starCount * 3);
    const colorStar = new THREE.Color(0xffffff); // Estrellas blancas
    
    for (let i = 0; i < starCount; i++) {
        // Generar estrellas aleatoriamente en un volumen esférico
        const r = radius * Math.cbrt(Math.random());
        const theta = Math.random() * Math.PI * 2;
        const phi = Math.acos((Math.random() * 2) - 1);
        
        positions[i * 3] = r * Math.sin(phi) * Math.cos(theta);
        positions[i * 3 + 1] = r * Math.sin(phi) * Math.sin(theta);
        positions[i * 3 + 2] = r * Math.cos(phi);
        
        colors[i * 3] = colorStar.r;
        colors[i * 3 + 1] = colorStar.g;
        colors[i * 3 + 2] = colorStar.b;
    }
    const geometry = new THREE.BufferGeometry();
    geometry.setAttribute('position', new THREE.BufferAttribute(positions, 3));
    geometry.setAttribute('color', new THREE.BufferAttribute(colors, 3));
    const material = new THREE.PointsMaterial({
        size: 0.15, 
        vertexColors: true, 
        blending: THREE.AdditiveBlending, // Esto las hace más brillantes
        transparent: true, 
        depthWrite: false, 
        sizeAttenuation: true 
    });
    const starField = new THREE.Points(geometry, material);
    scene.add(starField);
    return starField;
}


// Se modificó la función para aceptar un parámetro opcional de tamaño (fontSize)
function addSimpleText(text, x, y, z, color, fontSize = 0.8) {
    if (typeof THREE.TextSprite !== 'undefined') {
        const sprite = new THREE.TextSprite({
            material: { color: color, fog: true },
            fontFamily: 'Arial',
            fontSize: fontSize, // Usa el nuevo tamaño
            text: text,
            alignment: 'center',
            
        });
        sprite.position.set(x, y, z);
        scene.add(sprite);
    } else {
        console.warn("THREE.TextSprite no está cargado. Asegúrate de incluir la librería en tu HTML.");
    }
}


// ===============================================
// LÓGICA DE LA SECUENCIA DE CRÉDITOS (MODIFICADA)
// ===============================================


    // 🌟 NUEVA REFERENCIA: Obtiene el elemento de la frase 2D
    const finalFrase2D = document.getElementById('frase-final-2d'); 
    
    const blockDisplayTime = 3500; 

    let index = 0;
    
    
         

                // 🌟 FASE 2: MOSTRAR LA FRASE 2D DESPUÉS DE LA GALAXIA 🌟
                // Retraso de 3 segundos para que la galaxia 'aparezca' y se asiente.
                setTimeout(() => {
                    if (finalFrase2D) {
                        finalFrase2D.style.opacity = 1; // La hace visible usando la transición CSS
                    }
                }, 3000); // 🚀 AJUSTA este tiempo (en milisegundos) si quieres que aparezca antes o después.
                
            }, 2000); 
        }
    }

    showNextWord();
});
