import * as THREE from "three";
import { OrbitControls } from "three/examples/jsm/controls/OrbitControls.js";

// Image path correction for Vite
import img1 from '/img/earth_hd.jpg';

// Planets
let scene, camera, renderer, controls, skybox;
let planet_sun, planet_mercury, planet_venus, planet_earth, planet_mars, planet_jupiter, planet_saturn, planet_uranus, planet_neptune;

// Orbit radii and revolution speeds
let mercury_orbit_radius = 50;
let venus_orbit_radius = 60;
let earth_orbit_radius = 70;
let mars_orbit_radius = 80;
let jupiter_orbit_radius = 100;
let saturn_orbit_radius = 120;
let uranus_orbit_radius = 140;
let neptune_orbit_radius = 160;

let mercury_revolution_speed = 2;
let venus_revolution_speed = 1.5;
let earth_revolution_speed = 1;
let mars_revolution_speed = 0.8;
let jupiter_revolution_speed = 0.7;
let saturn_revolution_speed = 0.6;
let uranus_revolution_speed = 0.5;
let neptune_revolution_speed = 0.4;

let revolutionSpeedMultiplier = 1;

// Function to create the skybox materials
function createMaterialArray() {
  const skyboxImagepaths = [
    '/skybox/space_ft.png',
    '/skybox/space_bk.png',
    '/skybox/space_up.png',
    '/skybox/space_dn.png',
    '/skybox/space_rt.png',
    '/skybox/space_lf.png'
  ];
  const materialArray = skyboxImagepaths.map((image) => {
    let texture = new THREE.TextureLoader().load(image);
    return new THREE.MeshBasicMaterial({ map: texture, side: THREE.BackSide });
  });
  return materialArray;
}

// Setting the skybox
const sunLight = new THREE.PointLight(0xffffff, 5, 1000); // Increased intensity

// Update Load Planet Texture
function loadPlanetTexture(texture, radius, widthSegments, heightSegments) {
  const geometry = new THREE.SphereGeometry(radius, widthSegments, heightSegments);
  const loader = new THREE.TextureLoader();
  const planetTexture = loader.load(texture);
  // Use MeshBasicMaterial for consistent visibility
  const material = new THREE.MeshBasicMaterial({ map: planetTexture });

  return new THREE.Mesh(geometry, material);
}

// Update Skybox Size
function setSkyBox() {
  const materialArray = createMaterialArray();
  let skyboxGeo = new THREE.BoxGeometry(10000, 10000, 10000); // Increase size for better coverage
  skybox = new THREE.Mesh(skyboxGeo, materialArray);
  scene.add(skybox);
}

// Function to create orbital rings
function createRing(innerRadius, color) {
  let outerRadius = innerRadius - 0.1;
  let thetaSegments = 100;
  const geometry = new THREE.RingGeometry(innerRadius, outerRadius, thetaSegments);
  const material = new THREE.MeshBasicMaterial({ color: color, side: THREE.DoubleSide });
  const mesh = new THREE.Mesh(geometry, material);
  scene.add(mesh);
  mesh.rotation.x = Math.PI / 2;
  return mesh;
}

// Initializing scene, camera, planets, and renderer
function init() {
  scene = new THREE.Scene();
  camera = new THREE.PerspectiveCamera(85, window.innerWidth / window.innerHeight, 0.1, 1000);

  // setSkyBox();

  // Load planets (corrected paths)
  planet_earth = loadPlanetTexture(img1, 4, 100, 100);
  planet_sun = loadPlanetTexture("/img/sun_hd.jpg", 20, 100, 100);
  planet_mercury = loadPlanetTexture("/img/mercury_hd.jpg", 2, 100, 100);
  planet_venus = loadPlanetTexture("/img/venus_hd.jpg", 3, 100, 100);
  planet_mars = loadPlanetTexture("/img/mars_hd.jpg", 3.5, 100, 100);
  planet_jupiter = loadPlanetTexture("/img/jupiter_hd.jpg", 10, 100, 100);
  planet_saturn = loadPlanetTexture("/img/saturn_hd.jpg", 8, 100, 100);
  planet_uranus = loadPlanetTexture("/img/uranus_hd.jpg", 6, 100, 100);
  planet_neptune = loadPlanetTexture("/img/neptune_hd.jpg", 5, 100, 100);

  // Add planets to the scene
  scene.add(planet_earth);
  scene.add(planet_sun);
  scene.add(planet_mercury);
  scene.add(planet_venus);
  scene.add(planet_mars);
  scene.add(planet_jupiter);
  scene.add(planet_saturn);
  scene.add(planet_uranus);
  scene.add(planet_neptune);

  // Set up light (Point light at the Sun and Ambient light)
  const sunLight = new THREE.PointLight(0xffffff, 2, 1000);
  sunLight.position.copy(planet_sun.position);
  scene.add(sunLight);

  const ambientLight = new THREE.AmbientLight(0x404040); // Soft white light
  scene.add(ambientLight);

  // Define colors for the orbital rings
  const planetColors = {
    mercury: 0xaaaaaa,  // Grey
    venus: 0xffcc00,    // Yellow
    earth: 0x0033cc,    // Blue
    mars: 0xff4500,     // Red
    jupiter: 0xd7a86d,  // Brown
    saturn: 0xe8c69b,   // Light Brown
    uranus: 0x66b2e8,   // Light Blue
    neptune: 0x0000ff   // Dark Blue
  };

  // Create orbital rings for each planet
  createRing(mercury_orbit_radius, planetColors.mercury);
  createRing(venus_orbit_radius, planetColors.venus);
  createRing(earth_orbit_radius, planetColors.earth);
  createRing(mars_orbit_radius, planetColors.mars);
  createRing(jupiter_orbit_radius, planetColors.jupiter);
  createRing(saturn_orbit_radius, planetColors.saturn);
  createRing(uranus_orbit_radius, planetColors.uranus);
  createRing(neptune_orbit_radius, planetColors.neptune);

  // Set up renderer
  renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true });
  renderer.setSize(window.innerWidth, window.innerHeight);
  document.body.appendChild(renderer.domElement);
  renderer.domElement.id = "c";

  // Orbit controls
  controls = new OrbitControls(camera, renderer.domElement);
  controls.minDistance = 12;
  controls.maxDistance = 1000;

  camera.position.z = 100;

  // Handle window resize
  window.addEventListener('resize', onWindowResize);
}

// Function to handle planetary revolution around the sun
function planetRevolver(time, speed, planet, orbitRadius) {
  let orbitSpeedMultiplier = revolutionSpeedMultiplier * 0.001;  // Adjust based on user input
  const planetAngle = time * orbitSpeedMultiplier * speed;
  planet.position.x = planet_sun.position.x + orbitRadius * Math.cos(planetAngle);
  planet.position.z = planet_sun.position.z + orbitRadius * Math.sin(planetAngle);
}

// Animation function
function animate(time) {
  requestAnimationFrame(animate);

  // Rotate the planets
  const rotationSpeed = 0.005;
  planet_earth.rotation.y += rotationSpeed;
  planet_sun.rotation.y += rotationSpeed;
  planet_mercury.rotation.y += rotationSpeed;
  planet_venus.rotation.y += rotationSpeed;
  planet_mars.rotation.y += rotationSpeed;
  planet_jupiter.rotation.y += rotationSpeed;
  planet_saturn.rotation.y += rotationSpeed;
  planet_uranus.rotation.y += rotationSpeed;
  planet_neptune.rotation.y += rotationSpeed;

  // Revolve planets around the sun
  planetRevolver(time, mercury_revolution_speed, planet_mercury, mercury_orbit_radius);
  planetRevolver(time, venus_revolution_speed, planet_venus, venus_orbit_radius);
  planetRevolver(time, earth_revolution_speed, planet_earth, earth_orbit_radius);
  planetRevolver(time, mars_revolution_speed, planet_mars, mars_orbit_radius);
  planetRevolver(time, jupiter_revolution_speed, planet_jupiter, jupiter_orbit_radius);
  planetRevolver(time, saturn_revolution_speed, planet_saturn, saturn_orbit_radius);
  planetRevolver(time, uranus_revolution_speed, planet_uranus, uranus_orbit_radius);
  planetRevolver(time, neptune_revolution_speed, planet_neptune, neptune_orbit_radius);

  controls.update();
  renderer.render(scene, camera);
}

// Handle window resize
function onWindowResize() {
  camera.aspect = window.innerWidth / window.innerHeight;
  camera.updateProjectionMatrix();
  renderer.setSize(window.innerWidth, window.innerHeight);
}

// Call init and animate functions
init();
animate();
setSkyBox();