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
            gravity: { y: 400 },
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
    jet.setDamping(true);
    jet.setDrag(0.995); // Higher drag for more delay
    jet.setMaxVelocity(200, 200); // Lower max velocity for more control
    this.cursors = this.input.keyboard.createCursorKeys();
    this.thrustPower = 5; // Lower thrust for smoother acceleration

    this.scale.on('resize', resize, this);
}

function update() {
    const left = this.cursors.left.isDown;
    const right = this.cursors.right.isDown;

    let targetAngle = 0;
    if (left && right) {
        // Both thrusters: go straight up
        jet.setVelocityY(jet.body.velocity.y - this.thrustPower);
        targetAngle = 0;
    } else if (right) {
        // Right thruster: up and left (diagonal)
        jet.setVelocity(
            jet.body.velocity.x - this.thrustPower,
            jet.body.velocity.y - this.thrustPower
        );
        targetAngle = -20;
    } else if (left) {
        // Left thruster: up and right (diagonal)
        jet.setVelocity(
            jet.body.velocity.x + this.thrustPower,
            jet.body.velocity.y - this.thrustPower
        );
        targetAngle = 20;
    }
    // Smoothly animate the angle
    jet.setAngle(Phaser.Math.Linear(jet.angle, targetAngle, 0.1));
}

function resize(gameSize) {
    if (!backgroundImage) return;
    const width = gameSize.width;
    const height = gameSize.height;
    backgroundImage.setDisplaySize(width, height);
    // jet.setPosition(width / 2, height / 2); // Removed to prevent jet from resetting
}
window.addEventListener('resize', () => {
    game.scale.resize(window.innerWidth, window.innerHeight);
});