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
    // Asset yüklemeleri burada yapılacak
}

function create() {
    // Oyun başlangıç ayarları
}

function update() {
    // Oyun döngüsü
} 