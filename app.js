// ===============================================
// ARCHIVO: app.js
// LÓGICA DE SECUENCIA Y ANIMACIÓN 3D (CON PLANETA INTERACTIVO)
// ===============================================

// Variables principales de Three.js
let scene, camera, renderer, controls;
let celestialBodies = []; // Para rotación propia de los cuerpos (Sol)
let spiralGroup;
let raycaster;
let mouse = new THREE.Vector2();
let meteorites = []; // Array de meteoritos interactivos
let clock = new THREE.Clock();
let previousCameraPosition = new THREE.Vector3(); // Para guardar posición anterior
let previousCameraTarget = new THREE.Vector3(); // Para guardar target anterior

const TEXT_3D_COLOR = 0xFF4500;

// Frases románticas para los meteoritos
const romanticPhrases = [
    "Cada estrella en este espiral representa un momento contigo",
    "En la vastedad del universo, tú eres mi punto de referencia",
    "Tu luz brilla más que mil soles",
    "Girar a tu alrededor es mi destino",
    "Eres el centro de mi universo",
    "Entre millones de estrellas, elegí la más bella",
    "Mi corazón orbita alrededor de ti",
    "Eres mi constelación favorita",
    "En este cosmos, eres mi galaxia",
    "Tu amor es infinito como el espacio",
    "Cada brazo del espiral te lleva a mí",
    "Eres la razón de todas mis órbitas",
    "En la eternidad, encontré tu nombre",
    "Giro junto a ti en este universo mágico",
    "Tu belleza eclipsa a todas las estrellas",
    "Eres el meteorito que cambió mi órbita",
    "En la noche oscura, tu luz me guía",
    "Contigo, el infinito tiene fin",
    "Cada giro es un paso hacia ti",
    "Eres mi estrella polar, mi amor"
]; 

// ===============================================
// INICIALIZACIÓN Y ANIMACIÓN DEL UNIVERSO 3D
// ===============================================

function initThreeJS() {
    // 1. ESCENA y FONDO
    scene = new THREE.Scene();
    scene.background = new THREE.Color(0x000000); // Fondo negro
    
    // 2. CÁMARA - Posición inclinada desde arriba para ver bien el espiral
    camera = new THREE.PerspectiveCamera(75, window.innerWidth / window.innerHeight, 0.1, 1000); 
    camera.position.set(60, 50, 60); // Inclinada desde arriba 
    
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
    controls.target.copy(new THREE.Vector3(0,0,0)); // Asegurarse de que el target inicial sea el centro

    // 5. LUCES
    const ambientLight = new THREE.AmbientLight(0x404040, 2); 
    scene.add(ambientLight);
    const sunLight = new THREE.DirectionalLight(0xffffff, 3); 
    sunLight.position.set(10, 5, 15);
    scene.add(sunLight);

    // 6. CREACIÓN DE CUERPOS CELESTES 
    
    // --- EL SOL ---
    const sunParticles = createSunParticles(0, 0, 0, 15, 0xff88bb, 0xdd3366); 
    celestialBodies.push(sunParticles); 
    
    // 7. AÑADIR FRASE ALREDEDOR DEL SOL 🌟
    const sunText = "Hay millones de estrellas pero yo decidí girar alrededor de la más grande y hermosa: el sol";
    addSimpleText(sunText, 0, 15, 0, TEXT_3D_COLOR, 1.2); 
    
    // --- ESPIRAL SHURIKEN DE ESTRELLAS ALREDEDOR DEL SOL ---
    spiralGroup = createSpiralShuriken(55, 50000); // Espiral compacto con brazos cortos
    scene.add(spiralGroup);
    
    // --- METEORITOS INTERACTIVOS EN EL ESPIRAL ---
    createMeteoritos();

    // --- CAMPO DE ESTRELLAS ---
    createStarField(500); // Estrellas lejanas como fondo 

    // 🌟 INICIALIZACIÓN DEL RAYCASTER 🌟
    raycaster = new THREE.Raycaster();
    
    // Event listeners para interacción
    window.addEventListener('click', onMouseClick, false);
    window.addEventListener('mousemove', onMouseMove, false);
    window.addEventListener('resize', onWindowResize, false);

    animate();
}

// ===============================================
// FUNCIÓN: Crea un espiral de estrellas tipo shuriken
// ===============================================
// FUNCIÓN: Crea un espiral de estrellas tipo galaxia con brazos curvados
// ===============================================
function createSpiralShuriken(radius, starCount) {
    const group = new THREE.Group();
    const positions = new Float32Array(starCount * 3);
    const colors = new Float32Array(starCount * 3);
    const sizes = new Float32Array(starCount);
    
    const centerColor = new THREE.Color(0xdd99aa); // Rosa muy suave al inicio
    const outerColor = new THREE.Color(0xff6699); // Rosa oscuro al final
    
    const armCount = 4; // 4 brazos curvados
    const startsPerArm = Math.floor(starCount / armCount);

    for (let arm = 0; arm < armCount; arm++) {
        const baseAngle = (arm / armCount) * Math.PI * 2; // Cada brazo separado 90 grados
        
        for (let j = 0; j < startsPerArm; j++) {
            const i = arm * startsPerArm + j;
            if (i >= starCount) break;
            
            // Progresión suave desde el centro hacia afuera
            const t = j / startsPerArm;
            const innerMin = 18; // Comienza más lejos del sol
            const r = innerMin + Math.pow(t, 0.75) * (radius - innerMin);
            
            // Curvatura del brazo (spiral arm logarítmico)
            const armCurve = t * Math.PI * 1.2; // Brazos más cortos
            const angle = baseAngle + armCurve;
            
            // Variación natural pero concentrada en el brazo
            const noise = (Math.random() - 0.5) * 1.8;
            const finalRadius = r + noise * (r * 0.14);
            const finalAngle = angle + noise * 0.2;
            
            const x = Math.cos(finalAngle) * finalRadius;
            const y = (Math.random() - 0.5) * (radius * 0.06);
            const z = Math.sin(finalAngle) * finalRadius;

            positions[i * 3] = x;
            positions[i * 3 + 1] = y;
            positions[i * 3 + 2] = z;

            // Tamaño decrece conforme avanza el brazo (más intensidad al inicio)
            const sizeIntensity = Math.pow(1 - t, 1.3);
            sizes[i] = 0.1 + sizeIntensity * 0.2; // De 0.3 al inicio a 0.1 al final

            // Gradiente de color: Blanco brillante al inicio, rosa oscuro al final
            const mix = Math.pow(t, 0.6);
            const color = centerColor.clone().lerp(outerColor, mix);
            colors[i * 3] = color.r;
            colors[i * 3 + 1] = color.g;
            colors[i * 3 + 2] = color.b;
        }
    }

    const geometry = new THREE.BufferGeometry();
    geometry.setAttribute('position', new THREE.BufferAttribute(positions, 3));
    geometry.setAttribute('color', new THREE.BufferAttribute(colors, 3));
    geometry.setAttribute('size', new THREE.BufferAttribute(sizes, 1));

    const material = new THREE.ShaderMaterial({
        uniforms: {},
        vertexShader: `
            attribute float size;
            varying vec3 vColor;
            void main() {
                vColor = color;
                gl_PointSize = size;
                gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
            }
        `,
        fragmentShader: `
            varying vec3 vColor;
            void main() {
                float dist = length(gl_PointCoord - vec2(0.5));
                if(dist > 0.5) discard;
                float alpha = smoothstep(0.5, 0.0, dist);
                gl_FragColor = vec4(vColor, alpha);
            }
        `,
        vertexColors: true,
        blending: THREE.AdditiveBlending,
        transparent: true,
        depthWrite: false
    });

    const stars = new THREE.Points(geometry, material);
    group.add(stars);

    return group;
}

function createMeteoritos() {
    const armCount = 4;
    const meteoritesPerArm = 5;
    const radius = 55;
    
    for (let arm = 0; arm < armCount; arm++) {
        const baseAngle = (arm / armCount) * Math.PI * 2;
        
        for (let m = 0; m < meteoritesPerArm; m++) {
            // Distribuir meteoritos a lo largo del brazo
            const t = (m + 1) / (meteoritesPerArm + 1);
            const innerMin = 18;
            const r = innerMin + Math.pow(t, 0.75) * (radius - innerMin);
            
            const armCurve = t * Math.PI * 1.2;
            const angle = baseAngle + armCurve;
            
            const x = Math.cos(angle) * r;
            const y = (Math.random() - 0.5) * 2;
            const z = Math.sin(angle) * r;
            
            // Crear geometría del meteorito (pequeña esfera)
            const meteoriteGeometry = new THREE.SphereGeometry(0.8, 8, 8);
            const meteoriteMaterial = new THREE.MeshPhongMaterial({
                color: 0xff6600,
                emissive: 0xff3300,
                shininess: 100
            });
            
            const meteorite = new THREE.Mesh(meteoriteGeometry, meteoriteMaterial);
            meteorite.position.set(x, y, z);
            meteorite.userData.phraseIndex = meteorites.length;
            
            scene.add(meteorite);
            meteorites.push({
                mesh: meteorite,
                position: new THREE.Vector3(x, y, z),
                phraseIndex: meteorites.length
            });
        }
    }
}

function onMouseClick(event) {
    mouse.x = (event.clientX / window.innerWidth) * 2 - 1;
    mouse.y = -(event.clientY / window.innerHeight) * 2 + 1;
    
    raycaster.setFromCamera(mouse, camera);
    
    const meteoriteMeshes = meteorites.map(m => m.mesh);
    const intersects = raycaster.intersectObjects(meteoriteMeshes);
    
    if (intersects.length > 0) {
        const clickedMeteorite = intersects[0].object;
        const phraseIndex = clickedMeteorite.userData.phraseIndex;
        
        const targetPosition = clickedMeteorite.position.clone();
        animateCameraTo(targetPosition, clickedMeteorite);
        showPhrase(romanticPhrases[phraseIndex % romanticPhrases.length]);
    }
}

function onMouseMove(event) {
    mouse.x = (event.clientX / window.innerWidth) * 2 - 1;
    mouse.y = -(event.clientY / window.innerHeight) * 2 + 1;
    
    raycaster.setFromCamera(mouse, camera);
    const meteoriteMeshes = meteorites.map(m => m.mesh);
    const intersects = raycaster.intersectObjects(meteoriteMeshes);
    
    meteorites.forEach(m => {
        m.mesh.scale.set(1, 1, 1);
    });
    
    if (intersects.length > 0) {
        intersects[0].object.scale.set(1.5, 1.5, 1.5);
        document.body.style.cursor = 'pointer';
    } else {
        document.body.style.cursor = 'auto';
    }
}

function animateCameraTo(targetPosition, meteorite) {
    // Guardar posición actual antes de animar
    previousCameraPosition.copy(camera.position);
    previousCameraTarget.copy(controls.target);
    
    const startPosition = camera.position.clone();
    const direction = targetPosition.clone().sub(scene.position).normalize();
    const distance = 15;
    const endPosition = targetPosition.clone().add(direction.multiplyScalar(distance));
    
    let progress = 0;
    const duration = 1000; // ms
    const startTime = Date.now();
    
    function animateFrame() {
        const elapsed = Date.now() - startTime;
        progress = Math.min(elapsed / duration, 1);
        
        camera.position.lerpVectors(startPosition, endPosition, progress);
        controls.target.lerpVectors(scene.position, targetPosition, progress);
        controls.update();
        
        if (progress < 1) {
            requestAnimationFrame(animateFrame);
        }
    }
    
    animateFrame();
}

function showPhrase(phrase) {
    // Crear o actualizar modal
    let modal = document.getElementById('phrase-modal');
    if (!modal) {
        modal = document.createElement('div');
        modal.id = 'phrase-modal';
        modal.style.cssText = `
            position: fixed;
            top: 50%;
            left: 50%;
            transform: translate(-50%, -50%);
            background: rgba(0, 0, 0, 0.9);
            border: 2px solid #ff6699;
            border-radius: 10px;
            padding: 30px;
            max-width: 600px;
            text-align: center;
            z-index: 2000;
            color: #ff6699;
            font-size: 1.5em;
            font-family: Arial, sans-serif;
            box-shadow: 0 0 30px rgba(255, 102, 153, 0.5);
            animation: fadeIn 0.5s ease-in;
        `;
        document.body.appendChild(modal);
    }
    
    modal.innerHTML = `
        <p style="margin: 0 0 20px 0; line-height: 1.6;">"${phrase}"</p>
        <button id="close-modal" style="
            background: #ff6699;
            color: black;
            border: none;
            padding: 10px 20px;
            border-radius: 5px;
            cursor: pointer;
            font-weight: bold;
            font-size: 1em;
        ">Cerrar</button>
    `;
    
    modal.style.display = 'block';
    document.getElementById('close-modal').addEventListener('click', () => {
        modal.style.display = 'none';
        // Regresar a la posición anterior
        animateCameraBack();
    });
}

function animateCameraBack() {
    const startPosition = camera.position.clone();
    const startTarget = controls.target.clone();
    
    let progress = 0;
    const duration = 1000; // ms
    const startTime = Date.now();
    
    function animateFrame() {
        const elapsed = Date.now() - startTime;
        progress = Math.min(elapsed / duration, 1);
        
        camera.position.lerpVectors(startPosition, previousCameraPosition, progress);
        controls.target.lerpVectors(startTarget, previousCameraTarget, progress);
        controls.update();
        
        if (progress < 1) {
            requestAnimationFrame(animateFrame);
        }
    }
    
    animateFrame();
}

function animate() {
    requestAnimationFrame(animate);
    
    const deltaTime = clock.getDelta();

    // Animación del Sol
    const sun = celestialBodies[0];
    if (sun) {
        sun.rotation.y += 0.001;
        sun.scale.setScalar(1 + Math.sin(Date.now() * 0.0005) * 0.02); 
    }
    
    controls.update();
    renderer.render(scene, camera);
}

function onWindowResize() {
    camera.aspect = window.innerWidth / window.innerHeight;
    camera.updateProjectionMatrix();
    renderer.setSize(window.innerWidth, window.innerHeight);
}

// ===============================================
// FUNCIONES DE CREACIÓN DE CUERPOS (Mantenidas)
// ===============================================

function createPinkPlanet(position, radius, coreColor, surfaceColor) {
    const particleCount = 4000; 
    const positions = new Float32Array(particleCount * 3);
    const colors = new Float32Array(particleCount * 3);
    const cCore = new THREE.Color(coreColor); 
    const cSurface = new THREE.Color(surfaceColor); 

    for (let i = 0; i < particleCount; i++) {
        const r = radius * Math.cbrt(Math.random()); 
        const theta = Math.random() * Math.PI * 2; 
        const phi = Math.acos((Math.random() * 2) - 1);
        
        positions[i * 3] = r * Math.sin(phi) * Math.cos(theta);
        positions[i * 3 + 1] = r * Math.sin(phi) * Math.sin(theta);
        positions[i * 3 + 2] = r * Math.cos(phi);

        let colorMixFactor = r / radius; 
        const spotFactor = Math.abs(Math.sin(theta * 5) * Math.cos(phi * 3) * 0.3); 
        colorMixFactor = THREE.MathUtils.clamp(colorMixFactor + spotFactor * 0.5, 0.0, 1.0);

        const mixedColor = cCore.clone().lerp(cSurface, colorMixFactor);
        
        colors[i * 3] = mixedColor.r;
        colors[i * 3 + 1] = mixedColor.g;
        colors[i * 3 + 2] = mixedColor.b;
    }
    
    const geometry = new THREE.BufferGeometry();
    geometry.setAttribute('position', new THREE.BufferAttribute(positions, 3));
    geometry.setAttribute('color', new THREE.BufferAttribute(colors, 3));
    
    const material = new THREE.PointsMaterial({
        size: 0.1, 
        vertexColors: true, 
        blending: THREE.AdditiveBlending, 
        transparent: true, 
        depthWrite: false
    });
    
    const pinkPlanet = new THREE.Points(geometry, material);
    pinkPlanet.position.copy(position);
    return pinkPlanet;
}

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

function createStarField(radius) {
    const starCount = 80000; 
    const positions = new Float32Array(starCount * 3);
    const colors = new Float32Array(starCount * 3);
    const colorStar = new THREE.Color(0xffffff); 
    
    for (let i = 0; i < starCount; i++) {
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
        blending: THREE.AdditiveBlending, 
        transparent: true, 
        depthWrite: false, 
        sizeAttenuation: true 
    });
    const starField = new THREE.Points(geometry, material);
    scene.add(starField);
    return starField;
}


function addSimpleText(text, x, y, z, color, fontSize = 0.8) {
    if (typeof THREE.TextSprite !== 'undefined') {
        const sprite = new THREE.TextSprite({
            material: { color: color, fog: true },
            fontFamily: 'Arial',
            fontSize: fontSize, 
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
// LÓGICA DE INICIO (Créditos removidos)
// ===============================================

document.addEventListener('DOMContentLoaded', () => {
    const finalFrase2D = document.getElementById('frase-final-2d'); 
    
    // Inicia directamente Three.js sin créditos
    initThreeJS();
    const canvas = renderer.domElement;
    canvas.style.opacity = 1; 

    // Muestra el texto después de un breve delay
    setTimeout(() => {
        if (finalFrase2D) {
            finalFrase2D.style.opacity = 1; 
        }
    }, 1000); 
});
