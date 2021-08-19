import { Engine, Scene, ArcRotateCamera, HemisphericLight, Vector3, MeshBuilder,StandardMaterial  } from 'babylonjs';
import { Box, Cylinder, Sphere } from './src/geometry';
import 'babylonjs-loaders';

const canvas = document.getElementById("canvas");
if (!(canvas instanceof HTMLCanvasElement)) throw new Error("Couldn't find a canvas. Aborting the demo")

const engine = new Engine(canvas, true, {});
const scene = new Scene(engine);


function prepareScene() {
	// Camera
	const camera = new ArcRotateCamera("camera", Math.PI / 2, Math.PI / 2.5, 4, new Vector3(0, 0, 0), scene);
	camera.attachControl(canvas, true);

	// Light
	new HemisphericLight("light", new Vector3(0.5, 1, 0.8).normalize(), scene);

	// Objects
	const plane = new Box("Box", new Vector3(0,0,0), scene);
	const icosphere = new Sphere("Sphere", new Vector3(-4,0,0), scene);
	const cylinder = new Cylinder("Cylinder", new Vector3(4,0,0), scene);

	// Ground
	let ground = MeshBuilder.CreateGround("ground", {width:10, height:6}, scene);
	// to prevent faces merging
	ground.position.y = -0.01;

    let mat = new StandardMaterial('red-mat', scene);
    mat.diffuseColor = BABYLON.Color3.Gray();
    mat.backFaceCulling = false;
    ground.material = mat;
}

prepareScene();

engine.runRenderLoop(() => {
	scene.render();
});

window.addEventListener("resize", () => {
	engine.resize();
})