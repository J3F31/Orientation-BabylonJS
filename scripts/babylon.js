//BABYLON JS
var canvas = document.getElementById("renderCanvas");
var engine = new BABYLON.Engine(canvas, true);

var scene = CreateScene();
var camera = CreateCamera();
var wall = CreateWall();
var light = CreateLight();
var arrows = CreateArrows();
var shadowLight = CreateShadowLight();
var shadowGen = CreateShadowGen();
var statue = CreateHorse().then((mesh) => {
  mesh.getChildren().forEach((mesh) => {
    shadowLight.excludedMeshes.push(mesh);
    shadowGen.addShadowCaster(mesh);
  });
  var horse = mesh.getChildren()[0];
  var base = mesh.getChildren()[1];
  var mousePosX = 0;
  var mouseClicked = false;

  canvas.addEventListener("pointerdown", function(event) {
    mouseClicked = true;
    mousePosX = event.clientX;
  })
  
  canvas.addEventListener("pointermove", function(event) {
    if (!mouseClicked) return
  
    var dx = mousePosX - event.clientX;
  
    var step = dx * .008;

    
    horse.rotation.y -= step;
    base.rotation.y -= step;

    mousePosX = event.clientX;
  })
  
  canvas.addEventListener("pointerup", function(event) {
    mouseClicked = false;
  })
});

// Register a render loop to repeatedly render the scene
engine.runRenderLoop(function () {
  scene.render();
});

// Watch for browser/canvas resize events
window.addEventListener("resize", function () {
  engine.resize();
});

function CreateScene() {
  var scene = new BABYLON.Scene(engine);
  scene.clearColor = new BABYLON.Color4(0, 0, 0, 0);

  return scene;
}

function CreateCamera() {
  var camera = new BABYLON.ArcRotateCamera("Camera", 0, Math.PI/2 - .5, 0, BABYLON.Vector3(0, 0, 0), scene);
  camera.position = new BABYLON.Vector3(1, 0, 0);
	//camera.attachControl(canvas, true);

  camera.radius = .6;
  //camera.upperBetaLimit = Math.PI / 2;  
  //camera.lowerBetaLimit = Math.PI / 2;

  camera.minZ = .3;
  camera.wheelPrecision = 10;

  return camera;
}

function CreateLight() {
  var hemiLight = new BABYLON.HemisphericLight("hemiLight", new BABYLON.Vector3(0, 1, 0), scene);
  hemiLight.intensity = 1;

  hemiLight.excludedMeshes.push(wall);

  return hemiLight;
}

async function CreateHorse() {
  var model = await BABYLON.SceneLoader.ImportMeshAsync("", "./models/", "horse.glb");
  model.meshes[0].getChildren()[0].position = new BABYLON.Vector3(0, -.1, 0);

  var mesh = model.meshes[0].getChildren()[0];

  return mesh;
}

function CreateWall() {
  var mesh = BABYLON.MeshBuilder.CreatePlane("wall", {width: 3, height: 3}, this.scene);

  var material = new BABYLON.StandardMaterial("matWall", scene);
  material.diffuseColor = new BABYLON.Color4(1, 1, 1, 1);
  //material.backFaceCulling = false;
  
  mesh.material = material;
  mesh.position = new BABYLON.Vector3(-0.1, 0, 0);
  mesh.rotation.y = -Math.PI/2;

  mesh.receiveShadows = true;

  return mesh;
}

function CreateShadowLight() {
  var shadowLight = new BABYLON.DirectionalLight("shadowLight", new BABYLON.Vector3(-1, -0.05, -0.4), scene);
  shadowLight.position = new BABYLON.Vector3(3, 0, 3);
  shadowLight.intensity = 3;

  return shadowLight;
}

function CreateShadowGen() {
	var shadowGenerator = new BABYLON.ShadowGenerator(4096, shadowLight);
	shadowGenerator.useBlurExponentialShadowMap = true;
  shadowGenerator.useKernelBlur = true;
  shadowGenerator.blurKernel = 16;
  
  return shadowGenerator;
}

async function CreateArrows() {
  var model = await BABYLON.SceneLoader.ImportMeshAsync("", "./models/", "arrow.glb");

  var mat = new BABYLON.StandardMaterial("arrowMat", scene);
  mat.emissiveColor = new BABYLON.Color4(.8, .8, .8, 1);
  mat.alpha = .5;
  mat.disableLighting = true;

  var left = model.meshes[1];
  left.material = mat;
  left.position = new BABYLON.Vector3(-.1, -.1, -.08)
  left.rotation = new BABYLON.Vector3(ToRadians(60), ToRadians(65), ToRadians(-120));
  left.scaling = new BABYLON.Vector3(.005, .005, .005);

  var right = left.clone("Arrow2");
  right.position = new BABYLON.Vector3(-.1, -.1, .08)
  right.rotation = new BABYLON.Vector3(ToRadians(-60), ToRadians(-65), ToRadians(-120));

  return model;
}

function ToRadians(deg) {
  return (deg * Math.PI)/180
}

//Inspector
debug = (state) => {
  if (state)
    scene.debugLayer.show({ embedMode: true });
  else
    scene.debugLayer.hide();
}
window.addEventListener("keydown", (e) => {
  if (e.key == "r")
    debug(!scene.debugLayer.isVisible())
})