// ============================================================================
// ARCHIVO COMPLETO: app.js
// CARACTERÍSTICAS: Corazón Wireframe Tamaño Grande, Espaciado del Espiral Aumentado,
//                  Giro Sincronizado Galaxia/Flores y Modals Interactivos.
// ============================================================================

let scene, camera, renderer, controls;
let celestialBodies = []; 
let spiralGroup;
let raycaster;
let mouse = new THREE.Vector2();
let meteorites = []; 
let clock = new THREE.Clock();
let previousCameraPosition = new THREE.Vector3(); 
let previousCameraTarget = new THREE.Vector3(); 
let introMode = true;
let universeStarted = false;
let galaxyAppearing = false;
let galaxyProgress = 0;
let heartMesh; 

// Frases románticas para las flores
const romanticPhrases = [
    "Si el universo es infinito 🌠, yo quiero perderme contigo en cada galaxia 🪐",
    "Eres mi estrella favorita ⭐... y eso que hay millones ✨",
    "Contigo hasta Marte se me hace cerca 🔴, porque a tu lado todo es hogar 🏠💕",
    "Quisiera ser gravedad 🌍 para no soltarte nunca 🤝",
    "¿Crees en amor a primera órbita? 🛰️ Porque desde que te vi quedé girando alrededor tuyo 🔄",
    "Oye astronauta 👨‍🚀, ¿me das permiso para invadir tu espacio personal? 😉",
    "Si me das tu mano ✋, te prometo que hacemos nuestro propio sistema solar ☀️🪐",
    "El universo tardó 13.8 mil millones de años ⏳ en hacer algo tan perfecto como tú 💖",
    "En toda esta inmensidad 🌌, de todos los planetas te elegí a ti 🌍➡️❤️",
    "Me encantas en versión supernova 💥: cuando explotas de risa y me iluminas todo 😂✨",
    "Si somos polvo de estrellas 🌟, entonces ya estamos hechos del mismo material 🫶",
    "Tú eres mi constelación favorita ✨♍",
    "¿Vemos estrellas 🌙 o las hacemos nosotros? 😉🔥",
    "¿Vemos estrellas 🌙 o las hacemos nosotros? 😉🔥",
    "Prométeme que seremos eternos como las galaxias 🌀💞",
    "Esta flor florece solo para ti en el vacío"
 
]; 

// ===============================================
// INICIALIZACIÓN DEL ENTORNO
// ===============================================
function initThreeJS() {
    scene = new THREE.Scene();
    scene.background = new THREE.Color(0x05010a); 
    
    camera = new THREE.PerspectiveCamera(75, window.innerWidth / window.innerHeight, 0.1, 1000); 
    const initialCamZ = window.innerWidth < 600 ? 85 : 70;
    camera.position.set(initialCamZ, initialCamZ * 0.8, initialCamZ); 
    
    renderer = new THREE.WebGLRenderer({ antialias: true, powerPreference: "high-performance" });
    renderer.setSize(window.innerWidth, window.innerHeight);
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    document.body.appendChild(renderer.domElement); 
    
    controls = new THREE.OrbitControls(camera, renderer.domElement);
    controls.enableDamping = true;
    controls.dampingFactor = 0.05;
    controls.minDistance = 10; 
    controls.maxDistance = 220; 
    controls.target.copy(new THREE.Vector3(0,0,0));

    // Iluminación neón ambiental y direccional
    const ambientLight = new THREE.AmbientLight(0x220011, 1.2); 
    scene.add(ambientLight);

    const cornerLight1 = new THREE.DirectionalLight(0xff0066, 2.0); 
    cornerLight1.position.set(-30, 40, 20);
    scene.add(cornerLight1);

    const cornerLight2 = new THREE.DirectionalLight(0xff00aa, 1.5); 
    cornerLight2.position.set(30, -40, -20);
    scene.add(cornerLight2);

    // Fondo de estrellas estáticas
    createStarField(500);

    // 💖 CORAZÓN MÁS GRANDE
    heartMesh = createPinkHeart(0, 0, 0, 1.0); 
    celestialBodies.push(heartMesh);

    raycaster = new THREE.Raycaster();
    
    window.addEventListener('click', onMouseClick, false);
    window.addEventListener('mousemove', onMouseMove, false);
    window.addEventListener('touchstart', onTouchStart, { passive: false });
    window.addEventListener('resize', onWindowResize, false);

    animate();
}

function startUniverse() {
    if (universeStarted) return;
    universeStarted = true;
    introMode = false;

    const introOverlay = document.getElementById('intro-overlay');
    if (introOverlay) introOverlay.style.display = 'none';

    const galaxyRadius = window.innerWidth < 600 ? 60 : 75;
    spiralGroup = createSpiralShuriken(galaxyRadius, 35000); 
    scene.add(spiralGroup);

    galaxyAppearing = true;
    galaxyProgress = 0;
}

// ============================================================================
// CREACIÓN DEL CORAZÓN (TAMAÑO MÁS GRANDE)
// ============================================================================
function createPinkHeart(x, y, z, scaleFactor) {
    const group = new THREE.Group();

    // Forma con proporciones armónicas
    const heartShape = new THREE.Shape();
    heartShape.moveTo(0, 0);
    heartShape.bezierCurveTo(0, 0.4, -0.6, 0.9, -1.3, 0.9);
    heartShape.bezierCurveTo(-2.3, 0.9, -2.3, -0.4, -2.3, -0.4);
    heartShape.bezierCurveTo(-2.3, -1.5, -1.3, -2.5, 0, -3.3);
    heartShape.bezierCurveTo(1.3, -2.5, 2.3, -1.5, 2.3, -0.4);
    heartShape.bezierCurveTo(2.3, -0.4, 2.3, 0.9, 1.3, 0.9);
    heartShape.bezierCurveTo(0.6, 0.9, 0, 0.4, 0, 0);

    const extrudeSettings = {
        depth: 1.2,
        bevelEnabled: true,
        bevelSegments: 6,
        steps: 4,
        bevelSize: 0.5,
        bevelThickness: 0.5
    };

    const geometry = new THREE.ExtrudeGeometry(heartShape, extrudeSettings);
    geometry.center();

    // Aumentado el tamaño global del corazón
    const finalScale = scaleFactor * 2.6;
    group.scale.set(finalScale, finalScale, finalScale);

    // Malla Wireframe
    const wireframeGeometry = new THREE.WireframeGeometry(geometry);
    const lineMaterial = new THREE.LineBasicMaterial({
        color: 0xff0055,
        transparent: true,
        opacity: 0.85,
        blending: THREE.AdditiveBlending
    });
    const wireframe = new THREE.LineSegments(wireframeGeometry, lineMaterial);
    group.add(wireframe);

    // Nodos brillantes
    const isMobile = window.innerWidth < 600;
    const pointsMaterial = new THREE.PointsMaterial({
        color: 0xff33aa,
        size: isMobile ? 0.35 : 0.25,
        transparent: true,
        opacity: 0.9,
        blending: THREE.AdditiveBlending
    });
    const points = new THREE.Points(geometry, pointsMaterial);
    group.add(points);

    // Polvo estelar alrededor
    const particleCount = 350;
    const particleGeo = new THREE.BufferGeometry();
    const particlePos = new Float32Array(particleCount * 3);

    for (let i = 0; i < particleCount * 3; i += 3) {
        particlePos[i] = (Math.random() - 0.5) * 12;
        particlePos[i + 1] = (Math.random() - 0.5) * 12;
        particlePos[i + 2] = (Math.random() - 0.5) * 12;
    }

    particleGeo.setAttribute('position', new THREE.BufferAttribute(particlePos, 3));
    const sparkMaterial = new THREE.PointsMaterial({
        color: 0xff66cc,
        size: 0.18,
        transparent: true,
        opacity: 0.8,
        blending: THREE.AdditiveBlending
    });
    const sparks = new THREE.Points(particleGeo, sparkMaterial);
    group.add(sparks);

    group.position.set(x, y, z);
    scene.add(group);

    return group;
}

// ============================================================================
// CREACIÓN DE LA GALAXIA ESPIRAL (AJUSTADA AL CORAZÓN GRANDE)
// ============================================================================
function createSpiralShuriken(radius, starCount) {
    const group = new THREE.Group();
    const positions = new Float32Array(starCount * 3);
    const colors = new Float32Array(starCount * 3);
    const sizes = new Float32Array(starCount);
    const finalPositions = new Float32Array(starCount * 3); 
    
    const centerColor = new THREE.Color(0xff66bb); 
    const outerColor = new THREE.Color(0xff1493); 
    
    const armCount = 4; 
    const startsPerArm = Math.floor(starCount / armCount);
    const isMobile = window.innerWidth < 600;

    for (let arm = 0; arm < armCount; arm++) {
        const baseAngle = (arm / armCount) * Math.PI * 2;
        
        for (let j = 0; j < startsPerArm; j++) {
            const i = arm * startsPerArm + j;
            if (i >= starCount) break;
            
            const t = j / startsPerArm;
            // 💡 Aumentado a 35 para que el espiral comience fuera del área del corazón grande
            const innerMin = 35; 
            const r = innerMin + Math.pow(t, 0.75) * (radius - innerMin);
            
            const armCurve = t * Math.PI * 1.2; 
            const angle = baseAngle + armCurve;
            
            const noise = (Math.random() - 0.5) * 1.8;
            const finalRadius = r + noise * (r * 0.14);
            const finalAngle = angle + noise * 0.2;
            
            const x = Math.cos(finalAngle) * finalRadius;
            const y = (Math.random() - 0.5) * (radius * 0.08);
            const z = Math.sin(finalAngle) * finalRadius;

            finalPositions[i * 3] = x;
            finalPositions[i * 3 + 1] = y;
            finalPositions[i * 3 + 2] = z;

            positions[i * 3] = 0;
            positions[i * 3 + 1] = 0;
            positions[i * 3 + 2] = 0;

            const baseSize = isMobile ? 0.6 : 0.35;
            const sizeIntensity = Math.pow(1 - t, 1.2);
            sizes[i] = baseSize + sizeIntensity * (isMobile ? 0.6 : 0.4); 

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
                float growthFactor = smoothstep(0.0, 10.0, distFromCenter);
                gl_PointSize = size * growthFactor * (1.0 + (1.0 - uProgress) * 2.5);
                vAlpha = smoothstep(0.0, 12.0, distFromCenter);
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

// ============================================================================
// 🌸 FLORES INTEGRADAS
// ============================================================================
function createMeteoritos() {
    meteorites.forEach(m => {
        if (m.mesh.parent) m.mesh.parent.remove(m.mesh);
    });
    meteorites = [];

    const textureLoader = new THREE.TextureLoader();
    const flowerTexture = textureLoader.load('flor.png'); 

    const flowerMaterial = new THREE.SpriteMaterial({
        map: flowerTexture,
        transparent: true,
        blending: THREE.AdditiveBlending, 
        depthWrite: false
    });

    const armCount = 4;
    const itemsPerArm = 4; 
    const radius = window.innerWidth < 600 ? 60 : 75;
    const isMobile = window.innerWidth < 600;
    
    for (let arm = 0; arm < armCount; arm++) {
        const baseAngle = (arm / armCount) * Math.PI * 2;
        
        for (let m = 0; m < itemsPerArm; m++) {
            const t = (m + 1) / (itemsPerArm + 1);
            // 💡 Aumentado a 38 para despejar totalmente la vista del corazón
            const innerMin = 38;
            const r = innerMin + Math.pow(t, 0.75) * (radius - innerMin);
            
            const armCurve = t * Math.PI * 1.2;
            const angle = baseAngle + armCurve;
            
            const x = Math.cos(angle) * r;
            const y = (Math.random() - 0.5) * 2;
            const z = Math.sin(angle) * r;
            
            const flowerSprite = new THREE.Sprite(flowerMaterial.clone());
            flowerSprite.position.set(x, y, z);
            
            const spriteScale = isMobile ? 3.8 : 3.0;
            flowerSprite.scale.set(spriteScale, spriteScale, 1); 
            flowerSprite.userData.phraseIndex = meteorites.length;
            
            if (spiralGroup) {
                spiralGroup.add(flowerSprite);
            } else {
                scene.add(flowerSprite);
            }

            meteorites.push({
                mesh: flowerSprite, 
                radius: r,               
                angle: angle,             
                phraseIndex: meteorites.length,
                baseScale: spriteScale
            });
        }
    }
}

// ===============================================
// INTERACCIONES Y EVENTOS
// ===============================================
function checkInteractions() {
    raycaster.setFromCamera(mouse, camera);
    
    if (!universeStarted && celestialBodies[0]) {
        const heartHits = raycaster.intersectObjects(celestialBodies[0].children);
        if (heartHits.length > 0) {
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
            
            const worldPosition = new THREE.Vector3();
            clickedFlower.getWorldPosition(worldPosition);

            animateCameraTo(worldPosition, clickedFlower);
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
        const intersects = raycaster.intersectObjects(celestialBodies[0].children);
        document.body.style.cursor = intersects.length > 0 ? 'pointer' : 'auto';
        return;
    }

    if (universeStarted && !galaxyAppearing) {
        const flowerMeshes = meteorites.map(m => m.mesh);
        const intersects = raycaster.intersectObjects(flowerMeshes);
        
        meteorites.forEach(m => m.mesh.scale.set(m.baseScale, m.baseScale, 1));
        
        if (intersects.length > 0) {
            intersects[0].object.scale.set(4.8, 4.8, 1);
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
            background: rgba(15, 5, 20, 0.94);
            border: 2px solid #ff0055;
            border-radius: 14px;
            padding: 25px;
            width: 85%;
            max-width: 420px;
            box-sizing: border-box;
            text-align: center;
            z-index: 2000;
            color: #ffb6c1;
            font-size: 1.15em;
            font-family: sans-serif;
            box-shadow: 0 0 30px rgba(255, 0, 85, 0.4);
        `;
        document.body.appendChild(modal);
    }
    
    modal.innerHTML = `
        <p style="margin: 0 0 20px 0; line-height: 1.5; font-weight: 500; color: #ffffff;">"${phrase}"</p>
        <button id="close-modal" style="
            background: linear-gradient(45deg, #ff0055, #ff33aa);
            color: white;
            border: none;
            padding: 12px 28px;
            border-radius: 8px;
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
// BUCLE DE RENDERIZADO PRINCIPAL
// ===============================================
function animate() {
    requestAnimationFrame(animate);
    
    if (scene.userData.backgroundStars) {
        scene.userData.backgroundStars.rotation.y += 0.0001;
    }

    // Rotación y latido del corazón central grande
    if (heartMesh) {
        heartMesh.rotation.y += 0.006;
        heartMesh.rotation.x = Math.sin(Date.now() * 0.001) * 0.08;
        
        const pulse = 1 + Math.sin(Date.now() * 0.0025) * 0.04;
        const currentScale = pulse * 2.6;
        heartMesh.scale.set(currentScale, currentScale, currentScale);
    }

    // Rotación sincronizada de galaxia y flores
    if (spiralGroup) {
        spiralGroup.rotation.y += 0.0012;
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
            createMeteoritos();
            const finalFrase = document.getElementById("frase-final-2d");
            if (finalFrase) finalFrase.style.opacity = 1;
        }
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
