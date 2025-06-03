const config = {
    type: Phaser.AUTO,
    width: 800,
    height: 600,
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
        update: update
    }
};

const game = new Phaser.Game(config);

function preload() {
    this.load.image('jet', 'assets/images/jet.png');
}

function create() {
    this.jet = this.physics.add.sprite(400, 300, 'jet');
    this.jet.setCollideWorldBounds(true);
}

function update() {
    // Oyun döngüsü
} 