import * as THREE from "./libs/three.module.js"
import {OrbitControls} from "./libs/OrbitControls.js";
import {addConnection, addConvLayer, addNeuralLayer, addPoolLayer} from "./nn/tensor.js";


let canvas, camera, controls, scene, renderer;

//全局的神经元层的id
let layer_id = 1;

init();
// animate();
render();

function init() {

    scene = new THREE.Scene();
    scene.background = new THREE.Color(0xcccccc);
    // scene.fog = new THREE.FogExp2(0xcccccc, 0.002);
    canvas = document.getElementById("mainCanvas");

    renderer = new THREE.WebGLRenderer({canvas: canvas, antialias: true});
    renderer.setPixelRatio(window.devicePixelRatio);
    renderer.setSize(window.innerWidth, window.innerHeight);

    camera = new THREE.PerspectiveCamera(60, window.innerWidth / window.innerHeight, 1, 1000);
    camera.position.set(-100, 60, 180);

    // controls

    controls = new OrbitControls(camera, renderer.domElement);

    controls.addEventListener( 'change', render ); // call this only in static scenes (i.e., if there is no animation loop)

    controls.minDistance = 60;
    controls.maxDistance = 300;

    controls.maxPolarAngle = Math.PI / 2;

    // lights

    let light1 = new THREE.DirectionalLight(0xffffff);
    light1.position.set(1, 1, 1);
    scene.add(light1);

    let light2 = new THREE.DirectionalLight(	0xAFEEEE);
    light2.position.set(-1, -1, -1);
    scene.add(light2);

    let light3 = new THREE.AmbientLight(0x222222);
    scene.add(light3);

    //添加神经网络层
    let input_layer_id =  addNeuralLayer(scene, 28, 28, 1);

    //添加卷积层
    let conv_layer1_id = addConvLayer(scene, 3, 3, 25, 1, 20);

    //添加神经层
    let neural_layer1_id = addNeuralLayer(scene, 26, 26, 25, 40);

    addConnection(scene, neural_layer1_id, conv_layer1_id);

    //添加池化层
    let pool_layer1_id = addPoolLayer(scene, 2, 2, 0, "max", 60);


    //添加神经层
    let neural_layer2_id = addNeuralLayer(scene, 13, 13, 25, 80);

    //添加卷积层
    let conv_layer2_id = addConvLayer(scene, 4, 4, 50, 1, 100);

    //添加神经层
    let neural_layer3_id = addNeuralLayer(scene, 10, 10, 50, 120);

    addConnection(scene, neural_layer3_id, conv_layer2_id);

    //添加池化层
    let pool_layer2_id = addPoolLayer(scene, 2, 2, 0, "max", 140);

    //添加神经层                                                       
    let neural_layer4_id = addNeuralLayer(scene, 5, 5, 50, 160);

    //添加全连接层
    let fully_layer1_id = addNeuralLayer(scene, 32, 32, 1, 180, 1);
    addConnection(scene, neural_layer4_id, fully_layer1_id);

    let fully_layer2_id = addNeuralLayer(scene, 16, 16, 1, 200, 0);
    addConnection(scene, fully_layer1_id, fully_layer2_id);

    let fully_layer3_id = addNeuralLayer(scene, 47, 1, 1, 220, 1);
    addConnection(scene, fully_layer2_id, fully_layer3_id);
    

    window.addEventListener('resize', onWindowResize, false);

}

function onWindowResize() {
    let canvas = document.getElementById("mainCanvas");
    camera.aspect = canvas.offsetWidth / canvas.offsetHeight;
    camera.updateProjectionMatrix();

    renderer.setSize(canvas.offsetWidth, canvas.offsetHeight);

}

function animate() {

    requestAnimationFrame(animate);

    // controls.update(); // only required if controls.enableDamping = true, or if controls.autoRotate = true

    render();

}

function render() {

    renderer.render(scene, camera);

}