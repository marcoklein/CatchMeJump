
import * as Phaser from 'phaser';

export class ControllerScene extends Phaser.Scene {

    backgroundImage: Phaser.GameObjects.TileSprite;
    constructor() {
        super({ key: 'ControllerScene' });
    }

    preload() {
        // load background
        this.load.image('background', 'assets/backgrounds/bg.png');
        // load html
        this.load.html('controller_frame', 'assets/html/controller_frame.html');
    }

    create() {

        // load game scene to display player information
        //this.gameScene = <GameScene> this.game.scene.getScene('GameScene');

        // set background image
        this.backgroundImage = this.add.tileSprite(0, 0, this.game.scale.width * 2, this.game.scale.height * 2, 'background');


        // ensure game size is set properly
        this.scale.on('resize', (gameSize: {width: number; height: number}) => {
            this.backgroundImage.width = this.game.scale.width * 2;
            this.backgroundImage.height = this.game.scale.height * 2;
            this.cameras.resize(gameSize.width, gameSize.height);
        });

        // show html
        let element = this.add.dom(100, 100).createFromCache('controller_frame');
        this.add.dom(50, 200).createFromHTML('<h1>Hallo</h1>');
        this.add.text(50, 300, 'blabla', { color: 'white', fontFamily: 'Arial', fontSize: '32px '});
    }

}