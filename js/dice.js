// Constants
const GRAVITY = -9.82;
const FRAME_RATE = 30;

// Helper function
const createCanvas = (width, height) => {
    const canvas = document.createElement("canvas");
    canvas.width = width;
    canvas.height = height;
    return canvas;
};

class SceneManager {
    constructor() {
        this.scene = new THREE.Scene();
        this.camera = new THREE.PerspectiveCamera(
            75,
            window.innerWidth / window.innerHeight,
            0.1,
            1000
        );
        this.renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true });
        this.init();
    }

    init() {
        this.setupRenderer();
        this.setupCamera();
        this.setupLights();
        window.addEventListener("resize", () => this.onWindowResize());
    }

    setupRenderer() {
        const { innerWidth, innerHeight } = window;
        this.renderer.setSize(innerWidth, innerHeight);
        this.renderer.setClearColor(0x000000, 0);
        document.body.appendChild(this.renderer.domElement);
        this.renderer.domElement.id = "3Dcanvas";
    }

    setupCamera() {
        this.camera.position.set(0, 7, 0);
        this.camera.lookAt(0, 0, 0);
    }

    setupLights() {
        const ambientLight = new THREE.AmbientLight(0xffffff, 0.5);
        const directionalLight = new THREE.DirectionalLight(0xffffff, 0.8);
        directionalLight.position.set(5, 10, 7);
        this.scene.add(ambientLight, directionalLight);
    }

    onWindowResize() {
        const { innerWidth, innerHeight } = window;
        this.camera.aspect = innerWidth / innerHeight;
        this.camera.updateProjectionMatrix();
        this.renderer.setSize(innerWidth, innerHeight);
    }
}

class PhysicsWorld {
    constructor() {
        this.world = new CANNON.World();
        this.world.gravity.set(0, GRAVITY, 0);
        this.createFloor();
    }

    createFloor() {
        const floorShape = new CANNON.Plane();
        const floorBody = new CANNON.Body({ mass: 0 });
        floorBody.addShape(floorShape);
        floorBody.quaternion.setFromAxisAngle(
            new CANNON.Vec3(1, 0, 0), -Math.PI / 2
        );
        this.world.addBody(floorBody);
    }

    step() {
        this.world.step(1 / FRAME_RATE);
    }
}

class Dice {
    constructor(faces, scene, world) {
        this.faces = faces;
        this.scene = scene;
        this.world = world;
        this.mesh = null;
        this.body = null;
        this.shadow = null;
        this.color = this.generateRandomColor();
        this.clickPosition = null;
        this.create();
    }

    generateRandomColor() {
        const randomComponent = () => Math.floor(Math.random() * 156) + 100;
        return `rgba(${randomComponent()}, ${randomComponent()}, ${randomComponent()}, 1)`;
    }

    create() {
        this.updateResultText("Clique na tela para lançar o dado!");
        const { geometry, shape } = this.getGeometryAndShape();
        const materials = this.createMaterials();

        this.mesh = new THREE.Mesh(geometry, materials);
        this.body = new CANNON.Body({ mass: 1, shape });

        this.scene.add(this.mesh);
        this.world.addBody(this.body);

        this.createShadow();
        this.reset();
        this.setVisibility(false);
    }

    createMaterials() {
        return Array.from({ length: this.faces }, (_, i) => {
            const isTriangular = [4, 8, 20].includes(this.faces);
            const canvas = document.createElement("canvas");
            canvas.width = canvas.height = 128;
            const context = canvas.getContext("2d");

            isTriangular ? this.createTriangularTexture(context, i + 1) : this.createSquareTexture(context, i + 1);

            const texture = new THREE.CanvasTexture(canvas);
            return new THREE.MeshStandardMaterial({ map: texture });
        });
    }

    createSquareTexture(context, number) {
        context.fillStyle = this.color;
        context.fillRect(0, 0, 128, 128);
        context = this.drawBG(context);
        this.drawNumber(context, number);
    }

    createTriangularTexture(context, number) {
        context.fillStyle = this.color;
        context.beginPath();
        context.moveTo(64, 0);
        context.lineTo(0, 128);
        context.lineTo(128, 128);
        context.closePath();
        context = this.drawBG(context);
        this.drawNumber(context, number, 40, 256 / 3);
    }

    drawBG(context) {
        context.fillStyle = this.color;
        context.strokeStyle = this.color;
        context.stroke();
        context.fill();
        return context;
    }

    drawNumber(context, number, fontSize = 64, yPosition = 64) {
        context.fillStyle = "black";
        context.font = `bold ${fontSize}px Arial`;
        context.textAlign = "center";
        context.textBaseline = "middle";
        context.fillText(number.toString(), 64, yPosition);
    }

    setupGeometryUVs(geometry) {
        const isTriangular = [4, 8, 20].includes(this.faces);
        const faceUVs = isTriangular ? [0.5, 1, 0, 0, 1, 0] : [0, 1, 1, 1, 1, 0, 0, 1, 1, 0, 0, 0];

        const expandFactor = 0.89;

        // Function to expand UV coordinates
        function expandUVs(uvs) {
            const centerX = (uvs[0] + uvs[2] + uvs[4]) / 3;
            const centerY = (uvs[1] + uvs[3] + uvs[5]) / 3;

            for (let i = 0; i < uvs.length; i += 2) {
                uvs[i] = centerX + (uvs[i] - centerX) * expandFactor;
                uvs[i + 1] = centerY + (uvs[i + 1] - centerY) * expandFactor;
            }
            return uvs;
        }

        // Apply expansion to the UVs if the geometry is triangular
        const adjustedUVs = isTriangular ? expandUVs([...faceUVs]) : faceUVs;

        const uvs = [];
        const faceCount = geometry.attributes.position.count / 3;

        for (let face = 0; face < faceCount; face++) {
            uvs.push(...adjustedUVs);
        }

        geometry.setAttribute("uv", new THREE.Float32BufferAttribute(uvs, 2));

        for (let face = 0; face < this.faces; face++) {
            geometry.addGroup(face * 3, 3, face);
        }
    }

    getGeometryAndShape() {
        switch (this.faces) {
            case 4:
                return this.createPolyhedron(THREE.TetrahedronGeometry, 0.8);
            case 6:
                return this.createCube();
            case 8:
                return this.createPolyhedron(THREE.OctahedronGeometry, 0.7);
            case 12:
                return this.createPolyhedron(THREE.DodecahedronGeometry, 0.7);
            case 20:
                return this.createPolyhedron(THREE.IcosahedronGeometry, 0.7);
            default:
                console.error("Unsupported number of faces");
                return this.createCube();
        }
    }

    createPolyhedron(GeometryClass, radius) {
        const geometry = new GeometryClass(radius);
        this.setupGeometryUVs(geometry);
        const vertices = this.arrayToVec3Array(geometry.attributes.position.array);
        const faces = this.getFaces(geometry);
        const shape = new CANNON.ConvexPolyhedron(vertices, faces);
        return { geometry, shape };
    }

    createCube() {
        const geometry = new THREE.BoxGeometry(1, 1, 1);
        const shape = new CANNON.Box(new CANNON.Vec3(0.5, 0.5, 0.5));
        return { geometry, shape };
    }

    arrayToVec3Array(array) {
        const vec3Array = [];
        for (let i = 0; i < array.length; i += 3) {
            vec3Array.push(new CANNON.Vec3(array[i], array[i + 1], array[i + 2]));
        }
        return vec3Array;
    }

    getFaces(geometry) {
        return geometry.index ? this.getIndexedFaces(geometry) : this.getNonIndexedFaces(geometry);
    }

    getIndexedFaces(geometry) {
        const indexArray = geometry.index.array;
        const faces = [];
        for (let i = 0; i < indexArray.length; i += 3) {
            faces.push([indexArray[i], indexArray[i + 1], indexArray[i + 2]]);
        }
        return faces;
    }

    getNonIndexedFaces(geometry) {
        const positionAttribute = geometry.attributes.position;
        const faces = [];
        for (let i = 0; i < positionAttribute.count; i += 3) {
            faces.push([i, i + 1, i + 2]);
        }
        return faces;
    }

    createShadow() {
        const canvas = createCanvas(128, 128);
        const context = canvas.getContext("2d");
        const gradient = context.createRadialGradient(64, 64, 0, 64, 64, 64);
        gradient.addColorStop(0, "rgba(0, 0, 0, 0.4)");
        gradient.addColorStop(1, "rgba(0, 0, 0, 0)");
        context.fillStyle = gradient;
        context.fillRect(0, 0, 128, 128);

        const texture = new THREE.CanvasTexture(canvas);
        const material = new THREE.MeshBasicMaterial({ map: texture, transparent: true, depthWrite: false });
        const geometry = new THREE.PlaneGeometry(2, 2);

        this.shadow = new THREE.Mesh(geometry, material);
        this.shadow.rotation.x = -Math.PI / 2;
        this.shadow.position.y = 0.01;
        this.scene.add(this.shadow);
    }

    reset() {
        const startY = 3;
        const position = this.clickPosition ?
            new CANNON.Vec3(this.clickPosition.x, startY, this.clickPosition.z) :
            new CANNON.Vec3(0, startY, 0);

        this.body.position.copy(position);
        this.body.velocity.setZero();
        this.body.angularVelocity.setZero();

        const randomQuaternion = new CANNON.Quaternion();
        randomQuaternion.setFromEuler(
            Math.random() * Math.PI * 2,
            Math.random() * Math.PI * 2,
            Math.random() * Math.PI * 2
        );
        this.body.quaternion.copy(randomQuaternion);

        this.updateMesh();
    }

    spin() {
        const impulse = calculateImpulse(this.clickPosition);
        this.body.applyImpulse(impulse, this.body.position);

        const angularImpulse = new CANNON.Vec3(
            Math.random() - 0.5,
            Math.random() * 2 - 0.5,
            Math.random() - 0.5
        );
        angularImpulse.scale(10, angularImpulse);
        this.body.angularVelocity.copy(angularImpulse);
    }

    applyCenteringForce() {
        const centeringForce = new CANNON.Vec3();
        centeringForce.copy(this.body.position);
        centeringForce.scale(-0.5, centeringForce);
        this.body.applyForce(centeringForce, this.body.position);
    }

    applyDamping() {
        const dampingFactor = 0.99;
        this.body.velocity.scale(dampingFactor, this.body.velocity);
        this.body.angularVelocity.scale(dampingFactor, this.body.angularVelocity);
    }

    updateMesh() {
        this.mesh.position.copy(this.body.position);
        this.mesh.quaternion.copy(this.body.quaternion);
        this.updateShadow();
    }

    updateShadow() {
        this.shadow.position.x = this.body.position.x;
        this.shadow.position.z = this.body.position.z;
        const shadowScale = Math.max(0.5, 1 - this.body.position.y / 5);
        this.shadow.scale.set(shadowScale, shadowScale, 1);
    }

    isStopped() {
        const velocityThreshold = 0.01;
        return (
            this.body.velocity.lengthSquared() < velocityThreshold &&
            this.body.angularVelocity.lengthSquared() < velocityThreshold
        );
    }

    getResult() {
        const downVector = new THREE.Vector3(0, -1, 0);
        let minDot = Infinity;
        let result = 0;
        const faceNormals = this.mesh.geometry.attributes.normal;
        const tempVector = new THREE.Vector3();

        for (let i = 0; i < faceNormals.count; i += faceNormals.itemSize) {
            tempVector.fromBufferAttribute(faceNormals, i);
            tempVector.applyQuaternion(this.mesh.quaternion);
            const dot = tempVector.dot(downVector);
            if (dot < minDot) {
                minDot = dot;
                result = Math.floor(i / (faceNormals.count / this.faces)) + 1;
            }
        }

        return result;
    }

    setVisibility(visible) {
        this.mesh.visible = visible;
        this.shadow.visible = visible;
    }

    updateResultText(text) {
        document.getElementById("result").textContent = text;
    }
}

const calculateImpulse = (clickPosition) => {
    const baseForce = 2;
    const randomFactor = 0.3;
    const verticalForce = 3;

    const getForceComponent = (value) => {
        const magnitude = baseForce + Math.abs(value);
        const direction = value > 0 ? -1 : 1;
        return magnitude * direction * (randomFactor + Math.random() * randomFactor);
    };

    return new CANNON.Vec3(
        getForceComponent(clickPosition.x),
        verticalForce * Math.random(),
        getForceComponent(clickPosition.z)
    );
};

class DiceSpinner {
    constructor() {
        this.sceneManager = new SceneManager();
        this.physicsWorld = new PhysicsWorld();
        this.dice = null;
        this.isRolling = false;
        this.isFirstSpin = true;

        this.setupEventListeners();
        this.createDice(20); // Start with a 20-sided die
        this.animate();
    }

    createDice(faces) {
        if (this.dice) {
            this.removeDice();
        }
        this.dice = new Dice(faces, this.sceneManager.scene, this.physicsWorld.world);
    }

    removeDice() {
        this.sceneManager.scene.remove(this.dice.mesh);
        this.sceneManager.scene.remove(this.dice.shadow);
        this.physicsWorld.world.removeBody(this.dice.body);
    }

    spinDice() {
        if (this.isRolling) return;

        this.isRolling = true;
        document.getElementById("faces").disabled = true;
        this.updateResultText("Lançando o dado...");

        this.dice.reset();
        this.dice.spin();

        if (this.isFirstSpin) {
            this.dice.setVisibility(true);
            this.isFirstSpin = false;
        }
    }

    animate() {
        requestAnimationFrame(() => this.animate());
        this.updatePhysics();
        this.renderScene();
    }

    updatePhysics() {
        this.physicsWorld.step();
        if (this.dice) {
            this.dice.applyCenteringForce();
            this.dice.applyDamping();
            this.dice.updateMesh();
            this.checkRollStatus();
        }
    }

    checkRollStatus() {
        if (this.isRolling && this.dice.isStopped()) {
            this.isRolling = false;
            document.getElementById("faces").disabled = false;
            this.showResult();
        }
    }

    renderScene() {
        this.sceneManager.renderer.render(this.sceneManager.scene, this.sceneManager.camera);
    }

    showResult() {
        const result = this.dice.getResult();
        this.updateResultText(`Resultado: ${result}`);

        const message = { result: result };

        //wait a bit then send "closeDice"
        setTimeout(() => {
            window.parent.postMessage(message, "*");
            window.parent.postMessage("closeDice", "*");
        }, 500);

    }

    handleMouseClick(event) {
        const clickPosition = this.calculateClickPosition(event);
        this.dice.clickPosition = clickPosition;
        this.spinDice();
    }

    calculateClickPosition(event) {
        const canvas = document.getElementById("3Dcanvas");
        const rect = canvas.getBoundingClientRect();
        const normalizedX = ((event.clientX - rect.left) / canvas.clientWidth) * 2 - 1;
        const normalizedY = -((event.clientY - rect.top) / canvas.clientHeight) * 2 + 1;

        const worldZ = -(5 * normalizedY) + 3;
        const x = 2 * normalizedX * (worldZ < 0 ? 2 : 1);
        const z = worldZ > 2 ? worldZ / 1.5 : worldZ;

        //return { x, y: 3, z };
        return { x: normalizedX * 5, y: 3, z: normalizedY * -5 };
    }

    setupEventListeners() {
        document.getElementById("3Dcanvas").addEventListener("click", event => this.handleMouseClick(event));
        document.getElementById("faces").addEventListener("change", event => this.handleFacesChange(event));
    }

    handleFacesChange(event) {
        const faces = parseInt(event.target.value);
        if ([4, 6, 8, 12, 20].includes(faces)) {
            this.createDice(faces);
            this.isFirstSpin = true;
            this.dice.setVisibility(false);
        } else {
            console.error("Unsupported number of faces");
        }
    }

    updateResultText(text) {
        document.getElementById("result").textContent = text;
    }
}

// Initialize the application
window.onload = function() {

    let spinner = new DiceSpinner();
    //get "faces" from url parameter
    const urlParams = new URLSearchParams(window.location.search);
    const faces = urlParams.get('faces');
    if (faces) {
        document.getElementById("faces").value = faces;
        let event = { target: { value: faces } };
        spinner.handleFacesChange(event)
    }
}