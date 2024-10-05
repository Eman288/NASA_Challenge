import * as THREE from 'three';
import { OrbitControls } from 'three/addons/controls/OrbitControls.js';

// إنشاء المشهد والكاميرا
const scene = new THREE.Scene();
const camera = new THREE.PerspectiveCamera(
    35,
    window.innerWidth / window.innerHeight,
    0.1,
    1000
);

// وضع الكاميرا بحيث تكون قريبة من خط الأفق
camera.position.set(0, 20, 100); 

// إعداد Renderer
const canvas = document.querySelector('canvas.threejs');
const renderer = new THREE.WebGLRenderer({
    canvas: canvas,
    antialias: true
});

renderer.setSize(window.innerWidth, window.innerHeight);

// تحديث العرض عند تغيير حجم نافذة المتصفح
window.addEventListener('resize', () => {
    camera.aspect = window.innerWidth / window.innerHeight;
    camera.updateProjectionMatrix();
    renderer.setSize(window.innerWidth, window.innerHeight);
});

// الأرض

// إنشاء الـ TextureLoader
const textureLoader = new THREE.TextureLoader();
const texture = textureLoader.load(
    'images/ground.png',
    () => {
        console.log('Texture loaded successfully');
    },
    undefined,
    (error) => {
        console.error('An error occurred while loading the texture:', error);
    }
);

// إنشاء الأرضية
const planeGeometry = new THREE.PlaneGeometry(400, 400);
const planeMaterial = new THREE.MeshBasicMaterial({ map: texture, side: THREE.DoubleSide });
const plane = new THREE.Mesh(planeGeometry, planeMaterial);
plane.rotation.x = -Math.PI / 2;
plane.position.y = 0;
scene.add(plane);

// إعداد عناصر التحكم
const controls = new OrbitControls(camera, renderer.domElement);
controls.enableZoom = false;
controls.enablePan = false;
controls.maxPolarAngle = Math.PI / 2; // السماح بالنظر للأعلى

// دالة لإضافة قبة النجوم
async function createStarDome() {
    try {
        // تحميل بيانات النجوم من ملف stars_json.json
        const response = await fetch("stars_json.json");
        const starsData = await response.json();

        // إنشاء مجموعة النجوم على شكل قبة حول المشهد
        const starDomeGroup = new THREE.Group();
        starDomeGroup.name = 'starDome';

        // إضافة النجوم إلى القبة السماوية
        starsData.forEach(star => {
            const starPosition = new THREE.Vector3(star.x, star.y, star.z);
            const skyDistance = 500;

            // تكبير النسبة بحيث تشكل النجوم قبة سماوية كبيرة ثابتة في السماء
            const starSkyPosition = starPosition.normalize().multiplyScalar(skyDistance);

            // إنشاء خامة النجم
            const starMaterial = new THREE.MeshBasicMaterial({ color: star._3d.color });
            const starGeometry = new THREE.SphereGeometry(0.5, 8, 8); // حجم النجم في السماء

            // إنشاء شبكة النجم وإضافتها إلى المجموعة
            const starMesh = new THREE.Mesh(starGeometry, starMaterial);
            starMesh.position.set(starSkyPosition.x, starSkyPosition.y, starSkyPosition.z);

            starMesh.userData.id = `${star.id}`;

            // إضافة النجم إلى مجموعة النجوم
            starDomeGroup.add(starMesh);
        });

        // إضافة مجموعة النجوم إلى المشهد
        scene.add(starDomeGroup);

    } catch (error) {
        console.error("Error loading stars:", error);
    }
}

// إنشاء القبة السماوية للنجوم
createStarDome();

// async function createStarsAndConstellations() {
//     try {
//         // تحميل بيانات النجوم من ملف stars_json.json
//         const response = await fetch("constellations.json");
//         const starsData = await response.json();

//         // إنشاء مجموعة لحفظ النجوم التي تظهر في السماء
//         const starGroup = new THREE.Group();
//         starGroup.name = 'starGroup';

//         // تخزين النجوم باستخدام معرّفها (id) للوصول إليها عند رسم الأبراج
//         const starsById = {};

//         // إنشاء النجوم في المشهد
//         starsData.forEach((star, index) => {
//             const starPosition = new THREE.Vector3(star.x, star.y, star.z);
//             const skyDistance = 500; // جعل النجوم جزء من القبة السماوية
//             const starSkyPosition = starPosition.normalize().multiplyScalar(skyDistance);

//             // إنشاء خامة النجم
//             const starMaterial = new THREE.MeshBasicMaterial({ color: star._3d.color });
//             const starGeometry = new THREE.SphereGeometry(0.5, 8, 8); // حجم النجم في السماء

//             // إنشاء شبكة النجم
//             const starMesh = new THREE.Mesh(starGeometry, starMaterial);
//             starMesh.position.set(starSkyPosition.x, starSkyPosition.y, starSkyPosition.z);

//             // تعيين المعرف (id) للنجم
//             starMesh.userData.id = star.id;
//             starsById[star.id] = starMesh;

//             // إضافة النجم إلى المجموعة
//             starGroup.add(starMesh);
//         });

//         // إضافة مجموعة النجوم إلى المشهد
//         scene.add(starGroup);

//         // استدعاء دالة لإنشاء الأبراج
//         createConstellations(starsById);

//     } catch (error) {
//         console.error("Error loading stars:", error);
//     }
// }


// دالة لإضافة النجوم ورسم الأبراج
async function createStarsAndConstellations() {
    try {
        // تحميل بيانات الأبراج من ملف constellations.json
        const response = await fetch("main_con.json");
        const constellationsData = await response.json();

        // إنشاء مجموعة لحفظ النجوم التي تظهر في السماء
        const starGroup = new THREE.Group();
        starGroup.name = 'starGroup';

        // تخزين النجوم باستخدام معرفها (id) للوصول إليها عند رسم الأبراج
        const starsById = {};

        // إنشاء النجوم في المشهد من البيانات المجمعة
        constellationsData.constellations.forEach(constellation => {
            constellation.stars.forEach(star => {
                const { id, name, x, y, z, color, size } = star;

                // إنشاء خامة وجيومتري النجم
                const starMaterial = new THREE.MeshBasicMaterial({ color: color });
                const starGeometry = new THREE.SphereGeometry(size, 8, 8); // حجم النجم يعتمد على المعطيات من البيانات

                // إنشاء شبكة النجم
                const starMesh = new THREE.Mesh(starGeometry, starMaterial);
                starMesh.position.set(x, y, z);

                // تعيين المعرف (id) والاسم للنجم لسهولة الوصول إليه
                starMesh.userData.id = id;
                starMesh.userData.name = name;
                starsById[id] = starMesh;

                // إضافة النجم إلى مجموعة النجوم
                starGroup.add(starMesh);
            });
        });

        // إضافة مجموعة النجوم إلى المشهد
        scene.add(starGroup);

        // رسم الأبراج بعد إضافة النجوم
        drawConstellations(constellationsData, starsById);

    } catch (error) {
        console.error("Error loading constellations:", error);
    }
}

// دالة لرسم الأبراج عن طريق ربط النجوم بخطوط
function drawConstellations(constellationsData, starsById) {
    constellationsData.constellations.forEach(constellation => {
        const starIds = constellation.stars.map(star => star.id);

        // قائمة نقاط البرج (مواضع النجوم المكونة للبرج)
        const points = [];

        // تجميع النقاط من مواضع النجوم بالترتيب الصحيح
        starIds.forEach(starId => {
            if (starsById[starId]) {
                points.push(starsById[starId].position.clone()); // استخدام .clone() لتجنب التأثير على مواضع النجوم الأصلية
            }
        });

        // التأكد من أن هناك نقاط كافية لرسم البرج
        if (points.length > 1) {
            // إنشاء خط يمثل البرج باستخدام النقاط المتجمعة
            const lineGeometry = new THREE.BufferGeometry().setFromPoints(points);
            const lineMaterial = new THREE.LineBasicMaterial({ color: 0xffffff, linewidth: 1 });
            const line = new THREE.Line(lineGeometry, lineMaterial);

            // إضافة الخط إلى المشهد
            scene.add(line);
        }
    });
}

// استدعاء الدالة لإنشاء النجوم والأبراج
createStarsAndConstellations();



// دالة لرسم الأبراج عن طريق ربط النجوم بخطوط
// دالة لرسم الأبراج عن طريق ربط النجوم بخطوط
// function createConstellations(starsById) {
//     // تعريف الأبراج النجمية كمجموعة من النجوم التي يتم ربطها (علاقات النجوم)
//     const constellations = [
//         { name: 'Orion', stars: [388910, 433710, 435703, 448767, 463434, 427355, 419386] }, // برج الجبار (Orion)
//         { name: 'Taurus', stars: [333847, 350878, 368017, 368829, 375368, 392532, 409060, 412544] }, // برج الثور (Taurus)
//         { name: 'Ursa Major', stars: [1304800, 1343569, 1083342, 1151532, 1154608, 1087501, 1345331] }, // الدب الأكبر (Ursa Major)
//         { name: 'Ursa Minor', stars: [191390, 1466797, 1733502, 1515856, 1509654, 1504124, 2280054] }, // الدب الأصغر (Ursa Minor)
//         { name: 'Cassiopeia', stars: [52707, 108256, 17696, 143900, 89000] }, // كاسيوبيا (Cassiopeia)
//         { name: 'Leo', stars: [1063525, 1170001, 1417320, 1198837, 1220290, 1218019, 1036347] }, // برج الأسد (Leo)
//         { name: 'Gemini', stars: [767229, 735275, 748861, 713289, 774070, 778244] }, // برج الجوزاء (Gemini)
//         { name: 'Scorpius', stars: [1620181, 1571952, 1587231, 1579861, 1730564, 1736373, 1590330] }, // برج العقرب (Scorpius)
//         { name: 'Sagittarius', stars: [1860159, 1851931, 1864772, 1892152, 1869896, 1936851] }, // برج القوس (Sagittarius)
//         { name: 'Lyra', stars: [1892152, 1925862, 1949264, 1984515, 2089783] }, // برج القيثارة (Lyra)
//         { name: 'Cygnus', stars: [2220894, 2174213, 2104188, 2158647, 2099705] }, // برج الدجاجة (Cygnus)
//         { name: 'Aquila', stars: [2089783, 2076374, 2058478, 2102729] }, // برج العقاب (Aquila)
//         { name: 'Andromeda', stars: [11289, 24500, 89000, 104137, 107538] }, // برج المرأة المسلسلة (Andromeda)
//         { name: 'Pegasus', stars: [11289, 12359, 17696, 107538, 104137, 87352, 90273] }, // برج الفرس الأعظم (Pegasus)
//         { name: 'Canis Major', stars: [584955, 624992, 528279, 522429] }, // برج الكلب الأكبر (Canis Major)
//         { name: 'Canis Minor', stars: [749263, 749430] }, // برج الكلب الأصغر (Canis Minor)
//         { name: 'Pisces', stars: [115103, 153727, 93808, 93775, 1078526] }, // برج الحوت (Pisces)
//         { name: 'Virgo', stars: [1345269, 1169812, 1417791, 1418295, 1401228, 1413399] }, // برج العذراء (Virgo)
//         { name: 'Libra', stars: [1467018, 1504124, 1507251, 1485300, 1470456] }, // برج الميزان (Libra)
//         { name: 'Capricornus', stars: [2352054, 2293929, 2339523, 2335058, 2299133] }, // برج الجدي (Capricornus)
//         { name: 'Aquarius', stars: [2403906, 2384866, 2412000, 2464399, 2439425] }, // برج الدلو (Aquarius)
//         { name: 'Aries', stars: [13328, 15668, 132421, 115103, 140225] }, // برج الحمل (Aries)
//         { name: 'Cancer', stars: [940655, 913598, 910644, 913633] }, // برج السرطان (Cancer)
//     ];

//     constellations.forEach(constellation => {
//         const starIds = constellation.stars;

//         // قائمة نقاط البرج (مواضع النجوم المكونة للبرج)
//         const points = [];

//         // تجميع النقاط من مواضع النجوم المعروفة
//         starIds.forEach(starId => {
//             if (starsById[starId]) {
//                 points.push(starsById[starId].position);
//             }
//         });

//         // التأكد من أن هناك نقاط كافية لرسم البرج
//         if (points.length > 1) {
//             // إنشاء خط يمثل البرج باستخدام النقاط المتجمعة
//             const lineGeometry = new THREE.BufferGeometry().setFromPoints(points);
//             const lineMaterial = new THREE.LineBasicMaterial({ color: 'red', linewidth: 100 });
//             const line = new THREE.Line(lineGeometry, lineMaterial);

//             // إضافة الخط إلى المشهد
//             scene.add(line);
//         }
//     });
// }


// // استدعاء الدالة لإنشاء النجوم والأبراج
// createStarsAndConstellations();


// دالة التحريك
function animate() {
    requestAnimationFrame(animate);
    controls.update();
    renderer.render(scene, camera);
}

animate();

