import * as THREE from 'three';
import { OrbitControls } from 'three/addons/controls/OrbitControls.js';
import { GLTFLoader } from 'three/addons/loaders/GLTFLoader.js';
import fragmentShader from './src/shaders/sphere/fragment.js';
import vertexShader from './src/shaders/sphere/vertex.js';

const scene = new THREE.Scene();
const camera = new THREE.PerspectiveCamera( 75, window.innerWidth / window.innerHeight, 0.1, 1000 );

const renderer = new THREE.WebGLRenderer();
renderer.setSize( window.innerWidth, window.innerHeight );
renderer.setClearColor(0xCCCCCC);
document.body.appendChild( renderer.domElement );

/**
 * Camera and Controls
 */
const controls = new OrbitControls( camera, renderer.domElement );
camera.position.set( 1.5, 1, 2 )
controls.enableDamping = true;
controls.dampingFactor = 0.05;
controls.maxPolarAngle = Math.PI / 2.2;
controls.update();

/**
 * Light
 */
const ambientLight = new THREE.AmbientLight(0xffffff, 0.5);
scene.add(ambientLight);

const directionalLight = new THREE.DirectionalLight(0xffffff, 1);
directionalLight.position.set(5, 5, 5);
scene.add(directionalLight);

const pointLight = new THREE.PointLight({color: 0x2211ff})
pointLight.position.set(0, 2, 1);
pointLight.intensity = 1
scene.add(pointLight);

/**
 * Texture
 */ 
const loader = new THREE.TextureLoader()
const texture1 = await loader.loadAsync("src/img/fire.png")
const texture2 = await loader.loadAsync("src/img/sea.jpg")
const transitionTexture1 = await loader.loadAsync("src/img/transition1.png");

const waterMelonNormal = await loader.loadAsync("src/img/NormalMap2.png")
waterMelonNormal.flipY = false

const waterMelonTexture = await loader.loadAsync("src/img/watermelontexture2.jpg")
waterMelonTexture.colorSpace = THREE.SRGBColorSpace;
waterMelonTexture.flipY = false
// waterMelonTexture.flipX = false

/**
 * Materials
 */
const waterMelonMaterial = new THREE.MeshPhysicalMaterial({ 
    map: waterMelonTexture, 
    normalMap: waterMelonNormal, 
    // normalScale: new THREE.Vector2(.1, .1), 
    // roughness: .7, 
    // metalness: .1 
})

// Load a 3D Model using GLTFLoader
const gltfLoader = new GLTFLoader();

gltfLoader.load('src/models/watermelon2.glb', (glb) => {
    const model = glb.scene;
    scene.add(model);

    glb.scene.traverse((child) => 
    {
        child.material = waterMelonMaterial
    })

    model.position.set(0, 0.182, 0);

    animate();
}, undefined, (error) => {
    console.error('An error happened while loading the model:', error);
});

// texture1.wrapS = THREE.RepeatWrapping
// texture1.wrapT = THREE.RepeatWrapping
texture2.wrapS = THREE.RepeatWrapping
texture2.wrapT = THREE.RepeatWrapping
transitionTexture1.wrapS = THREE.RepeatWrapping;
transitionTexture1.wrapT = THREE.RepeatWrapping;

/**
 * Plane
 */
const geometry = new THREE.PlaneGeometry(7, 5, 10 );
const planeMaterial = new THREE.ShaderMaterial( {
    uniforms: {
        uColor: new THREE.Uniform(new THREE.Color(0x0088FF)),
        uTexture1: new THREE.Uniform(texture2),
        uTexture2: new THREE.Uniform(texture1),
        uTransition: { value: 0.0 },
        uTransitionTexture: { value: transitionTexture1 },
        uTime: { value: 0 },
        uStrength: { value: 0.05 }
    },
    vertexShader: vertexShader,
    fragmentShader: fragmentShader,
    transparent: true,
    side: THREE.DoubleSide
} );
const plane = new THREE.Mesh( geometry, planeMaterial );
plane.rotation.x = -Math.PI / 2;
scene.add( plane );

/**
 * lil-gui Setup
 */
// const gui = new lil.GUI();

const params = {
    transition: 0.0,
    strength: 0.02,
    autoAnimate: false,
    startAnimation: function() {
        startAnimation();
    },
    stopAnimation: function() {
        stopAnimation();
    }
};

// Add slider for manual transition control
// gui.add(params, 'transition', 0, 1).onChange(value => {
//     planeMaterial.uniforms.uTransition.value = value;
// });

// // Add slider for strength control
// gui.add(params, 'strength', 0, 2).onChange(value => {
//     planeMaterial.uniforms.uStrength.value = value;
// });

// Checkbox to toggle auto animation
// gui.add(params, 'autoAnimate').name("Auto Animate").onChange(isAnimating => {
//     if (isAnimating) {
//         startAnimation();
//     } else {
//         stopAnimation();
//     }
// });

/**
 * Cycle the textures
 */
// let currentTextureIndex = 1;
// function cycleTexture() {
//     // Pass to the next texture and reset the transition
//     currentTextureIndex = currentTextureIndex === 1 ? 2 : 1; // Alternate between texture1 and texture2
//     planeMaterial.uniforms.uTexture1.value = currentTextureIndex === 1 ? texture1 : texture2;
//     planeMaterial.uniforms.uTexture2.value = currentTextureIndex === 1 ? texture2 : texture1;

//     // Reset transition to 0 after cycling
//     planeMaterial.uniforms.uTransition.value = 0;
// }

let mouseX = 0;
let mouseY = 0;

// Event listener for mouse movement
document.addEventListener('mousemove', (event) => {
    mouseX = (event.clientX / window.innerWidth) * 2 - 1;
    mouseY = -(event.clientY / window.innerHeight) * 2 + 1;
});

console.log(mouseX);
console.log(mouseY);


function animate() {
	renderer.render( scene, camera );

    // gsap.to(plane.position, {
    //     x: mouseX * 0.5,
    //     y: mouseY * 0.5,
    //     duration: 1.0,
    //     ease: "ease"
    // });

    // planeMaterial.uniforms.uTime.value += 0.005;

    controls.update();
    renderer.render(scene, camera);
}
renderer.setAnimationLoop(animate)

// animate()