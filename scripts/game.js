const config = {
    type: Phaser.AUTO,
    width: window.innerWidth,
    height: window.innerHeight,
    scale: {
        mode: Phaser.Scale.RESIZE,
        autoCenter: Phaser.Scale.CENTER_BOTH
    },
    physics: {
        default: 'arcade',
        arcade: {
            gravity: { y: 300 },
            debug: false
        }
    },
    scene: {
        preload: preload,
        create: create,
        update: update,
        extend: {
            resize: resize
        }
    }
};

let backgroundImage;
let jet;

const game = new Phaser.Game(config);

function preload() {
    this.load.image('jet', 'jet.png');
    this.load.image('background', 'background.png');
}

function create() {
    backgroundImage = this.add.image(0, 0, 'background').setOrigin(0);
    backgroundImage.setDisplaySize(this.sys.game.config.width, this.sys.game.config.height);

    jet = this.physics.add.sprite(this.sys.game.config.width / 2, this.sys.game.config.height / 2, 'jet');
    jet.setScale(0.3);
    jet.setCollideWorldBounds(true);
    this.cursors = this.input.keyboard.createCursorKeys();
    this.thrustPower = 300;

    this.scale.on('resize', resize, this);
}

function update() {
    // Reset acceleration
    jet.setAcceleration(0, 0);

    const left = this.cursors.left.isDown;
    const right = this.cursors.right.isDown;

    if (left && right) {
        // Both thrusters: go up
        jet.setAccelerationY(-this.thrustPower);
    } else if (right) {
        // Right thruster: go left
        jet.setAccelerationX(-this.thrustPower);
    } else if (left) {
        // Left thruster: go right
        jet.setAccelerationX(this.thrustPower);
    }
}

function resize(gameSize) {
    if (!backgroundImage || !jet) return;
    const width = gameSize.width;
    const height = gameSize.height;
    backgroundImage.setDisplaySize(width, height);
    jet.setPosition(width / 2, height / 2);
}
window.addEventListener('resize', () => {
    game.scale.resize(window.innerWidth, window.innerHeight);
});