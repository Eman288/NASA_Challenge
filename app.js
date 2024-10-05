// Create the scene
const scene = new THREE.Scene();

// Create the camera (PerspectiveCamera)
const camera = new THREE.PerspectiveCamera(75, window.innerWidth / window.innerHeight, 0.1, 1000);
camera.position.z = 50;

// Create the renderer
const renderer = new THREE.WebGLRenderer({ canvas: document.getElementById('canvas') });
renderer.setSize(window.innerWidth, window.innerHeight);
document.body.appendChild(renderer.domElement);

// lighting
const ambientLight = new THREE.AmbientLight(0x404040);
scene.add(ambientLight);

// Generate the stars (point cloud)
const starGeometry = new THREE.BufferGeometry();
const starCount = 1000; // Number of stars
const starPositions = new Float32Array(starCount * 3);

for (let i = 0; i < starCount; i++) {
  const x = (Math.random() - 0.5) * 1000;
  const y = (Math.random() - 0.5) * 1000;
  const z = (Math.random() - 0.5) * 1000;

  starPositions[i * 3] = x;
  starPositions[i * 3 + 1] = y;
  starPositions[i * 3 + 2] = z;
}

starGeometry.setAttribute('position', new THREE.BufferAttribute(starPositions, 3));

// Create material for the stars
const starMaterial = new THREE.PointsMaterial({
  color: 0xffffff,
  size: 1.5,
});

// Create the star point cloud and add to scene
const stars = new THREE.Points(starGeometry, starMaterial);
scene.add(stars);

// Handle window resize
window.addEventListener('resize', () => {
  renderer.setSize(window.innerWidth, window.innerHeight);
  camera.aspect = window.innerWidth / window.innerHeight;
  camera.updateProjectionMatrix();
  controls.enableDamping = true; // Smoother camera movement
  controls.dampingFactor = 0.05; // Adjust the damping factor for smoother interaction
  controls.rotateSpeed = 0.1; // Control the speed of rotation, reducing it may feel smoother
  controls.zoomSpeed = 0.5; // Adjust
});



  // Animate the scene
  function animate() {
    requestAnimationFrame(animate);
    scene.rotation.y += 0.0005;
    renderer.render(scene, camera);
  }
  animate();