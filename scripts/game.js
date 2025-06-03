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
let thrustLeft, thrustRight;
let rocks;

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
    jet.setDrag(0.995); // Higher drag for more delay
    jet.setMaxVelocity(200, 200); // Lower max velocity for more control
    this.cursors = this.input.keyboard.createCursorKeys();
    this.thrustPower = 5; // Lower thrust for smoother acceleration

    // Thrust sprites (hidden by default, more apart horizontally, not as low vertically)
    thrustLeft = this.add.image(jet.x - 80, jet.y + 50, 'thrust').setScale(0.3).setVisible(false);
    thrustRight = this.add.image(jet.x + 80, jet.y + 50, 'thrust').setScale(0.3).setVisible(false);

    // Create rocks group at fixed positions
    rocks = this.physics.add.group();
    const rockPositions = [
      { x: 300, y: 250, key: 'rock1' },
      { x: 500, y: 320, key: 'rock2' },
      { x: 700, y: 270, key: 'rock3' },
      { x: 900, y: 300, key: 'rock4' },
      { x: 1100, y: 260, key: 'rock5' }
    ];
    for (let i = 0; i < rockPositions.length; i++) {
      const pos = rockPositions[i];
      const rock = rocks.create(pos.x, pos.y, pos.key);
      rock.setScale(Phaser.Math.FloatBetween(0.7, 1.2));
      rock.setImmovable(true);
      rock.body.allowGravity = false;
      rock.setVelocityX(0);
    }

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
        thrustLeft.setVisible(true);
        thrustRight.setVisible(true);
    } else if (right) {
        // Right thruster: up and left (diagonal)
        jet.setVelocity(
            jet.body.velocity.x - this.thrustPower,
            jet.body.velocity.y - this.thrustPower
        );
        targetAngle = -20;
        thrustLeft.setVisible(false);
        thrustRight.setVisible(true);
    } else if (left) {
        // Left thruster: up and right (diagonal)
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
    // Smoothly animate the angle
    jet.setAngle(Phaser.Math.Linear(jet.angle, targetAngle, 0.1));

    // Update thrust positions to follow the jet (more apart horizontally, not as low vertically)
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
    // jet.setPosition(width / 2, height / 2); // Removed to prevent jet from resetting
}
window.addEventListener('resize', () => {
    game.scale.resize(window.innerWidth, window.innerHeight);
});