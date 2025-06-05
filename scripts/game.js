const config = {
    type: Phaser.AUTO,
    width: window.innerWidth,
    height: window.innerHeight,
    scale: {
        mode: Phaser.Scale.FIT,
        autoCenter: Phaser.Scale.CENTER_BOTH
    },
    physics: {
        default: 'arcade',
        arcade: {
            gravity: { y: 400 },
            debug: false
        }
    },
    scene: {
        preload: preload,
        create: create,
        update: update
    }
};

let backgroundImage;
let jet;
let thrustLeft, thrustRight;
let levelEditor;
let isEditMode = false;

const game = new Phaser.Game(config);

function preload() {
    this.load.image('jet', 'jet.png');
    this.load.image('background', 'background.png');
    this.load.image('thrust', 'thrust.png');
    this.load.image('rock', 'rock.png');
    this.load.image('rock1', 'rock1.png');
    this.load.image('rock2', 'rock2.png');
    this.load.image('rock3', 'rock3.png');
    this.load.image('rock4', 'rock4.png');
    this.load.image('rock5', 'rock5.png');
}

function create() {
    backgroundImage = this.add.image(0, 0, 'background').setOrigin(0);
    backgroundImage.setDisplaySize(this.sys.game.config.width, this.sys.game.config.height);

    jet = this.physics.add.sprite(this.sys.game.config.width / 2, this.sys.game.config.height / 2, 'jet');
    jet.setScale(0.3);
    jet.setCollideWorldBounds(true);
    jet.setDamping(true);
    jet.setDrag(0.995);
    jet.setMaxVelocity(200, 200);
    this.cursors = this.input.keyboard.createCursorKeys();
    this.thrustPower = 5;

    thrustLeft = this.add.image(jet.x - 80, jet.y + 50, 'thrust').setScale(0.3).setVisible(false);
    thrustRight = this.add.image(jet.x + 80, jet.y + 50, 'thrust').setScale(0.3).setVisible(false);

    // Initialize level editor
    levelEditor = new LevelEditor(this);
    levelEditor.create();

    // Add edit mode toggle
    const editButton = document.createElement('button');
    editButton.textContent = 'Toggle Edit Mode';
    editButton.style.position = 'absolute';
    editButton.style.top = '10px';
    editButton.style.right = '10px';
    editButton.style.zIndex = '1000';
    editButton.onclick = () => {
        isEditMode = !isEditMode;
        levelEditor.toggleEditMode();
        jet.setVisible(!isEditMode);
        thrustLeft.setVisible(false);
        thrustRight.setVisible(false);
    };
    document.body.appendChild(editButton);

    this.scale.on('resize', resize, this);
}

function update() {
    if (isEditMode) return;

    const left = this.cursors.left.isDown;
    const right = this.cursors.right.isDown;

    let targetAngle = 0;
    if (left && right) {
        jet.setVelocityY(jet.body.velocity.y - this.thrustPower);
        targetAngle = 0;
        thrustLeft.setVisible(true);
        thrustRight.setVisible(true);
    } else if (right) {
        jet.setVelocity(
            jet.body.velocity.x - this.thrustPower,
            jet.body.velocity.y - this.thrustPower
        );
        targetAngle = -20;
        thrustLeft.setVisible(false);
        thrustRight.setVisible(true);
    } else if (left) {
        jet.setVelocity(
            jet.body.velocity.x + this.thrustPower,
            jet.body.velocity.y - this.thrustPower
        );
        targetAngle = 20;
        thrustLeft.setVisible(true);
        thrustRight.setVisible(false);
    } else {
        thrustLeft.setVisible(false);
        thrustRight.setVisible(false);
    }

    jet.setAngle(Phaser.Math.Linear(jet.angle, targetAngle, 0.1));

    const offsetX = 80 * jet.scaleX;
    const offsetY = 85 * jet.scaleY;
    thrustLeft.setPosition(jet.x - offsetX, jet.y + offsetY);
    thrustRight.setPosition(jet.x + offsetX, jet.y + offsetY);
    thrustLeft.setRotation(jet.rotation);
    thrustRight.setRotation(jet.rotation);
}

function resize(gameSize) {
    if (!backgroundImage) return;
    const width = gameSize.width;
    const height = gameSize.height;
    backgroundImage.setDisplaySize(width, height);
}

window.addEventListener('resize', () => {
    game.scale.resize(window.innerWidth, window.innerHeight);
});