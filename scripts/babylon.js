//BABYLON JS
var canvas = document.getElementById("renderCanvas");
var engine = new BABYLON.Engine(canvas, true);

var scene = CreateScene();
var camera = CreateCamera();
var light = CreateLight();
var wall = CreateWall();
var horse = CreateHorse().then((mesh) => {
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

    mesh.rotation.y -= step;

    console.log(mesh.rotation)

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
  var camera = new BABYLON.ArcRotateCamera("Camera", 0, Math.PI / 3, 1, BABYLON.Vector3(0, 0, 0), scene);
	camera.attachControl(canvas, true);

  //camera.upperBetaLimit = Math.PI / 2;  
  //camera.lowerBetaLimit = Math.PI / 2;

  camera.minZ = .3;
  camera.wheelPrecision = 10;

  return camera;
}

function CreateLight() {
  var hemiLight = new BABYLON.HemisphericLight("hemiLight", new BABYLON.Vector3(0, 1, 0), scene);
  hemiLight.intensity = 0;

  return hemiLight;
}

async function CreateHorse() {
  var model = await BABYLON.SceneLoader.ImportMeshAsync("", "./models/", "horse.glb", scene);
  model.position = new BABYLON.Vector3.Zero();

  var material = new BABYLON.StandardMaterial("matHorse", scene);
  material.diffuseTexture = new BABYLON.Texture("textures/texture.jpg", scene);

  var color = new BABYLON.StandardMaterial("matBase", scene);
  color.diffuseColor = new BABYLON.Color4(0.1, 0.1, 0.1, 1);

  model.meshes[1].material = material;
  model.meshes[2].material = color;

  var mesh = model.meshes[1];

  var spotLight = new BABYLON.SpotLight("spotLight", new BABYLON.Vector3(3, 0, 0), new BABYLON.Vector3(-1, 0, 0), Math.PI/2, 100, scene);

  spotLight.intensity = 10;

  spotLight.shadowEnabled = true;
  //spotLight.shadowMinZ = 1;
  //spotLight.shadowMaxZ = 10;

  var shadowGen = new BABYLON.ShadowGenerator(2048, spotLight);
  shadowGen.useBlurCloseExponentialShadowMap = true;

  model.meshes.forEach(mesh => {
    mesh.receiveShadows = true;
    shadowGen.addShadowCaster(mesh);
  });
  //wall.receiveShadows = true;
  shadowGen.addShadowCaster(wall);
  console.log(shadowGen)

  return mesh;
}

function CreateWall() {
  var mesh = BABYLON.MeshBuilder.CreatePlane("ground", {width: 3, height: 3}, this.scene);

  var material = new BABYLON.StandardMaterial("matWall", scene);
  material.diffuseColor = new BABYLON.Color4(1, 1, 1, 1);
  //material.backFaceCulling = false;
  
  mesh.material = material;
  mesh.position = new BABYLON.Vector3(-0.1, 0, 0);
  mesh.rotation.y = -Math.PI/2;

  mesh.receiveShadows = true;

  return mesh;
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