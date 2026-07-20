// ===============================================
// ARCHIVO: app.js (VERSIÓN INTERACTIVA CON FLORES)
// LÓGICA DE SECUENCIA Y ANIMACIÓN 3D (PC Y MÓVIL)
// ===============================================

let scene, camera, renderer, controls;
let celestialBodies = []; 
let spiralGroup;
let raycaster;
let mouse = new THREE.Vector2();
let meteorites = []; // Mantenemos el nombre del array interno para compatibilidad
let clock = new THREE.Clock();
let previousCameraPosition = new THREE.Vector3(); 
let previousCameraTarget = new THREE.Vector3(); 
let introMode = true;
let universeStarted = false;
let galaxyAppearing = false;
let galaxyProgress = 0;

// Frases románticas para las flores
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
    "Esta flor florece solo para ti en el vacío",
    "En la noche oscura, tu luz me guía",
    "Contigo, el infinito tiene fin",
    "Cada giro es un paso hacia ti",
    "Eres mi estrella polar, mi amor"
]; 

// ===============================================
// INICIALIZACIÓN DEL ENTORNO
// ===============================================
function initThreeJS() {
    // 1. ESCENA y FONDO
    scene = new THREE.Scene();
    scene.background = new THREE.Color(0x000000); 
    
    // 2. CÁMARA
    camera = new THREE.PerspectiveCamera(75, window.innerWidth / window.innerHeight, 0.1, 1000); 
    camera.position.set(60, 50, 60); 
    
    // 3. RENDERIZADOR
    renderer = new THREE.WebGLRenderer({ antialias: true, powerPreference: "high-performance" });
    renderer.setSize(window.innerWidth, window.innerHeight);
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    document.body.appendChild(renderer.domElement); 
    
    // 4. CONTROLES
    controls = new THREE.OrbitControls(camera, renderer.domElement);
    controls.enableDamping = true;
    controls.dampingFactor = 0.05;
    controls.minDistance = 10; 
    controls.maxDistance = 150; 
    controls.target.copy(new THREE.Vector3(0,0,0));

    // 5. LUCES
    const ambientLight = new THREE.AmbientLight(0x404040, 2); 
    scene.add(ambientLight);
    const sunLight = new THREE.DirectionalLight(0xffffff, 3); 
    sunLight.position.set(10, 5, 15);
    scene.add(sunLight);

    // Fondo de estrellas estables desde el inicio
    createStarField(500);

    // SOL 
    const sunParticles = createSunParticles(0, 0, 0, 5, 0xffaa44, 0xff4500);
    celestialBodies.push(sunParticles);

    raycaster = new THREE.Raycaster();
    
    // Listeners unificados (PC y Móviles)
    window.addEventListener('click', onMouseClick, false);
    window.addEventListener('mousemove', onMouseMove, false);
    window.addEventListener('touchstart', onTouchStart, { passive: false });
    window.addEventListener('resize', onWindowResize, false);

    animate();
}

// Detonador al interactuar con el Sol
function startUniverse() {
    if (universeStarted) return;
    universeStarted = true;
    introMode = false;

    const introOverlay = document.getElementById('intro-overlay');
    if (introOverlay) introOverlay.style.display = 'none';

    // Generar galaxia en el núcleo
    spiralGroup = createSpiralShuriken(55, 40000); 
    scene.add(spiralGroup);

    galaxyAppearing = true;
    galaxyProgress = 0;
}

// ===============================================
// CREACIÓN DE LA GALAXIA ESPIRAL
// ===============================================
function createSpiralShuriken(radius, starCount) {
    const group = new THREE.Group();
    const positions = new Float32Array(starCount * 3);
    const colors = new Float32Array(starCount * 3);
    const sizes = new Float32Array(starCount);
    const finalPositions = new Float32Array(starCount * 3); 
    
    const centerColor = new THREE.Color(0xdd99aa); 
    const outerColor = new THREE.Color(0xff6699); 
    
    const armCount = 4; 
    const startsPerArm = Math.floor(starCount / armCount);

    for (let arm = 0; arm < armCount; arm++) {
        const baseAngle = (arm / armCount) * Math.PI * 2;
        
        for (let j = 0; j < startsPerArm; j++) {
            const i = arm * startsPerArm + j;
            if (i >= starCount) break;
            
            const t = j / startsPerArm;
            const innerMin = 18; 
            const r = innerMin + Math.pow(t, 0.75) * (radius - innerMin);
            
            const armCurve = t * Math.PI * 1.2; 
            const angle = baseAngle + armCurve;
            
            const noise = (Math.random() - 0.5) * 1.8;
            const finalRadius = r + noise * (r * 0.14);
            const finalAngle = angle + noise * 0.2;
            
            const x = Math.cos(finalAngle) * finalRadius;
            const y = (Math.random() - 0.5) * (radius * 0.06);
            const z = Math.sin(finalAngle) * finalRadius;

            finalPositions[i * 3] = x;
            finalPositions[i * 3 + 1] = y;
            finalPositions[i * 3 + 2] = z;

            positions[i * 3] = 0;
            positions[i * 3 + 1] = 0;
            positions[i * 3 + 2] = 0;

            const sizeIntensity = Math.pow(1 - t, 1.3);
            sizes[i] = 0.2 + sizeIntensity * 0.3; 

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

    geometry.userData.finalPositions = finalPositions;

    const material = new THREE.ShaderMaterial({
        uniforms: {
            uProgress: { value: 0.0 }
        },
        vertexShader: `
            uniform float uProgress;
            attribute float size;
            varying vec3 vColor;
            varying float vAlpha;
            
            void main() {
                vColor = color;
                float distFromCenter = length(position);
                float growthFactor = smoothstep(0.0, 15.0, distFromCenter);
                gl_PointSize = size * growthFactor * (1.0 + (1.0 - uProgress) * 3.0);
                vAlpha = smoothstep(0.0, 10.0, distFromCenter);
                gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
            }
        `,
        fragmentShader: `
            varying vec3 vColor;
            varying float vAlpha;
            
            void main() {
                float dist = length(gl_PointCoord - vec2(0.5));
                if(dist > 0.5) discard;
                float alpha = smoothstep(0.5, 0.0, dist) * vAlpha;
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

// ===============================================
// 🌸 CREACIÓN DE FLORES EN ESPACIO 3D (SPRITES)
// ===============================================
function createMeteoritos() {
    meteorites.forEach(m => scene.remove(m.mesh));
    meteorites = [];

    const textureLoader = new THREE.TextureLoader();
    // Carga tu archivo local de flor.png
    const flowerTexture = textureLoader.load('flor.png'); 

    const flowerMaterial = new THREE.SpriteMaterial({
        map: flowerTexture,
        transparent: true,
        blending: THREE.AdditiveBlending, 
        depthWrite: false
    });

    const armCount = 4;
    const itemsPerArm = 4; 
    const radius = 55;
    
    for (let arm = 0; arm < armCount; arm++) {
        const baseAngle = (arm / armCount) * Math.PI * 2;
        
        for (let m = 0; m < itemsPerArm; m++) {
            const t = (m + 1) / (itemsPerArm + 1);
            const innerMin = 18;
            const r = innerMin + Math.pow(t, 0.75) * (radius - innerMin);
            
            const armCurve = t * Math.PI * 1.2;
            const angle = baseAngle + armCurve;
            
            const x = Math.cos(angle) * r;
            const y = (Math.random() - 0.5) * 2;
            const z = Math.sin(angle) * r;
            
            // Creamos Sprites que miran siempre a la cámara de frente
            const flowerSprite = new THREE.Sprite(flowerMaterial.clone());
            flowerSprite.position.set(x, y, z);
            
            // Tamaño base inicial de la flor (2.5 en X y Y)
            flowerSprite.scale.set(2.5, 2.5, 1); 
            flowerSprite.userData.phraseIndex = meteorites.length;
            
            scene.add(flowerSprite);
            meteorites.push({
                mesh: flowerSprite, 
                position: new THREE.Vector3(x, y, z),
                phraseIndex: meteorites.length
            });
        }
    }
}

// Interacciones combinadas de clics/taps
function checkInteractions() {
    raycaster.setFromCamera(mouse, camera);
    
    if (!universeStarted && celestialBodies[0]) {
        const sunHit = raycaster.intersectObject(celestialBodies[0]);
        if (sunHit.length > 0) {
            startUniverse();
            return;
        }
    }

    if (universeStarted && !galaxyAppearing) {
        const flowerMeshes = meteorites.map(m => m.mesh);
        const intersects = raycaster.intersectObjects(flowerMeshes);
        
        if (intersects.length > 0) {
            const clickedFlower = intersects[0].object;
            const phraseIndex = clickedFlower.userData.phraseIndex;
            
            const targetPosition = clickedFlower.position.clone();
            animateCameraTo(targetPosition, clickedFlower);
            showPhrase(romanticPhrases[phraseIndex % romanticPhrases.length]);
        }
    }
}

function onMouseClick(event) {
    mouse.x = (event.clientX / window.innerWidth) * 2 - 1;
    mouse.y = -(event.clientY / window.innerHeight) * 2 + 1;
    checkInteractions();
}

function onTouchStart(event) {
    if (event.touches.length > 0) {
        const touch = event.touches[0];
        mouse.x = (touch.clientX / window.innerWidth) * 2 - 1;
        mouse.y = -(touch.clientY / window.innerHeight) * 2 + 1;
        checkInteractions();
    }
}

function onMouseMove(event) {
    mouse.x = (event.clientX / window.innerWidth) * 2 - 1;
    mouse.y = -(event.clientY / window.innerHeight) * 2 + 1;
    
    raycaster.setFromCamera(mouse, camera);

    if (!universeStarted && celestialBodies[0]) {
        const intersects = raycaster.intersectObject(celestialBodies[0]);
        document.body.style.cursor = intersects.length > 0 ? 'pointer' : 'auto';
        return;
    }

    if (universeStarted && !galaxyAppearing) {
        const flowerMeshes = meteorites.map(m => m.mesh);
        const intersects = raycaster.intersectObjects(flowerMeshes);
        
        // Restablecer escala base de las flores
        meteorites.forEach(m => m.mesh.scale.set(2.5, 2.5, 1));
        
        if (intersects.length > 0) {
            // Animación de hover: agranda suavemente la flor apuntada en PC
            intersects[0].object.scale.set(3.5, 3.5, 1);
            document.body.style.cursor = 'pointer';
        } else {
            document.body.style.cursor = 'auto';
        }
    }
}

function animateCameraTo(targetPosition, element) {
    previousCameraPosition.copy(camera.position);
    previousCameraTarget.copy(controls.target);
    
    const startPosition = camera.position.clone();
    const direction = targetPosition.clone().sub(scene.position).normalize();
    const distance = 18; 
    const endPosition = targetPosition.clone().add(direction.multiplyScalar(distance));
    
    let progress = 0;
    const duration = 800; 
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
    let modal = document.getElementById('phrase-modal');
    if (!modal) {
        modal = document.createElement('div');
        modal.id = 'phrase-modal';
        modal.style.cssText = `
            position: fixed;
            top: 50%;
            left: 50%;
            transform: translate(-50%, -50%);
            background: rgba(0, 0, 0, 0.92);
            border: 2px solid #ff6699;
            border-radius: 12px;
            padding: 25px;
            width: 85%;
            max-width: 450px;
            box-sizing: border-box;
            text-align: center;
            z-index: 2000;
            color: #ff6699;
            font-size: 1.2em;
            font-family: sans-serif;
            box-shadow: 0 0 25px rgba(255, 102, 153, 0.4);
        `;
        document.body.appendChild(modal);
    }
    
    modal.innerHTML = `
        <p style="margin: 0 0 20px 0; line-height: 1.5; font-weight: 500;">"${phrase}"</p>
        <button id="close-modal" style="
            background: #ff6699;
            color: black;
            border: none;
            padding: 12px 28px;
            border-radius: 6px;
            cursor: pointer;
            font-weight: bold;
            font-size: 0.95em;
            width: 100%;
        ">Cerrar</button>
    `;
    
    modal.style.display = 'block';
    document.getElementById('close-modal').addEventListener('click', () => {
        modal.style.display = 'none';
        animateCameraBack();
    });
}

function animateCameraBack() {
    const startPosition = camera.position.clone();
    const startTarget = controls.target.clone();
    
    let progress = 0;
    const duration = 800; 
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

// ===============================================
// BUCLE PRINCIPAL DE RENDERIZADO (ANIMATE)
// ===============================================
function animate() {
    requestAnimationFrame(animate);
    
    // Rotación sutil de fondo
    if (scene.userData.backgroundStars) {
        scene.userData.backgroundStars.rotation.y += 0.0001;
    }

    if (galaxyAppearing && spiralGroup) {
        galaxyProgress += 0.006; 
        
        const stars = spiralGroup.children[0];
        if (stars.material.uniforms.uProgress) {
            stars.material.uniforms.uProgress.value = galaxyProgress;
        }
        
        const array = stars.geometry.attributes.position.array;
        const target = stars.geometry.userData.finalPositions;
        
        let reachedDestination = true;
        for (let i = 0; i < array.length; i++) {
            const diff = target[i] - array[i];
            if (Math.abs(diff) > 0.01) {
                array[i] += diff * 0.04; 
                reachedDestination = false;
            } else {
                array[i] = target[i];
            }
        }
        
        stars.geometry.attributes.position.needsUpdate = true;
        
        if (reachedDestination || galaxyProgress >= 1) {
            galaxyAppearing = false;
            // Al terminar la expansión se siembran las flores PNG
            createMeteoritos();
            const finalFrase = document.getElementById("frase-final-2d");
            if (finalFrase) finalFrase.style.opacity = 1;
        }
    }
    
    // Sol dinámico
    const sun = celestialBodies[0];
    if (sun) {
        sun.rotation.y += 0.002;
        sun.scale.setScalar(1 + Math.sin(Date.now() * 0.001) * 0.02); 
    }
    
    controls.update();
    renderer.render(scene, camera);
}

function onWindowResize() {
    camera.aspect = window.innerWidth / window.innerHeight;
    camera.updateProjectionMatrix();
    renderer.setSize(window.innerWidth, window.innerHeight);
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
}

// ===============================================
// GENERADORES AUXILIARES
// ===============================================
function createSunParticles(x, y, z, radius, color1, color2) {
    const particleCount = 4500; 
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
        size: 0.25, vertexColors: true, blending: THREE.AdditiveBlending, transparent: true, depthWrite: false 
    });
    const sunParticles = new THREE.Points(geometry, material);
    sunParticles.position.set(x, y, z);
    scene.add(sunParticles);
    return sunParticles; 
}

function createStarField(radius) {
    const starCount = 15000; 
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
        size: 0.5,
        vertexColors: true,
        transparent: true,
        opacity: 0.8, 
        blending: THREE.AdditiveBlending,
        depthWrite: false
    });
    
    const starField = new THREE.Points(geometry, material);
    scene.add(starField);
    scene.userData.backgroundStars = starField;
    
    return starField;
}

document.addEventListener('DOMContentLoaded', () => {
    initThreeJS();
    const canvas = renderer.domElement;
    if(canvas) canvas.style.opacity = 1; 
});
