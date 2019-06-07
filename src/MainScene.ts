import { GameScene } from "./GameScene";
import { HudScene } from "./HudScene";
import { TextButton } from "./ui/TextButton";

/**
 * Starting scene allowing player to make game configurations and enter the game.
 */
export class MainScene extends Phaser.Scene {

    gameFinishedText: Phaser.GameObjects.Text;
    backgroundImage: Phaser.GameObjects.TileSprite;

    // user interface
    incrementButton: TextButton;
    decrementButton: TextButton;
    playerCountText: Phaser.GameObjects.Text;

    mainContainer: Phaser.GameObjects.Container;


    constructor() {
        super('MainScene');
    }

    preload() {
        // load background
        this.load.image('background', 'assets/backgrounds/bg.png');
        // load ui
        this.load.atlas('ui_pack', 'assets/sprites/uipack.png', 'assets/sprites/uipack.json');
        this.load.atlas('ui_icons', 'assets/sprites/ui_icons.png', 'assets/sprites/ui_icons.json');
    }

    create() {
        // be sure to set default registry keys
        if (!this.registry.get('playerCount')) {
            // two players per default
            this.registry.set('playerCount', 2);
        }


        // ensure game size is set properly
        this.scale.on('resize', (gameSize: {width: number; height: number}) => {
            this.cameras.resize(gameSize.width, gameSize.height);
        });


        // set background image
        this.backgroundImage = this.add.tileSprite(0, 0, window.innerWidth * 2, window.innerHeight * 2, 'background');



        // add menu buttons
        this.incrementButton = new TextButton(this, this.game.canvas.width / 2, 110, 'Add Player', { fill: '#111 ', fontSize: '18px' }, () => this.incrementClickCount());
        this.incrementButton.setOrigin(0.5);
        this.add.existing(this.incrementButton);

        this.playerCountText = this.add.text(this.game.canvas.width / 2, 150, '', { fill: '#222', fontSize: '24px' });
        this.playerCountText.setOrigin(0.5);

        this.decrementButton = new TextButton(this, this.game.canvas.width / 2, 190, 'Remove Player', { fill: '#111 ', fontSize: '18px' }, () => this.decrementClickCount());
        this.decrementButton.setOrigin(0.5);
        this.add.existing(this.decrementButton);

        this.updateClickCountText();

        this.gameFinishedText = new TextButton(this, this.game.canvas.width / 2, 250, 'Play', { fontSize: '64px', fill: '#222' }, () => this.startGame());
        this.add.existing(this.gameFinishedText);
        this.gameFinishedText.setOrigin(0.5);


        this.input.keyboard.once('keyup_ENTER', () => {
            this.startGame();
        });
    }

    /**
     * Starts a new game by create a game scene.
     */
    startGame() {
        console.log('new game')

        //this.scene.start('GameScene');
        //this.scene.start('HudScene');
        // start game
        this.scene.stop('MainScene');
        this.scene.add('GameScene', GameScene, true);
        this.scene.add('HudScene', HudScene, true);
    }

    incrementClickCount() {
        // increase player count but do not allow more than 5 players
        // and do not allow more players than available gamepads (two can play with keyboard)
        if (this.registry.values.playerCount < 5 && this.registry.values.playerCount < this.input.gamepad.gamepads.length + 2) {
            this.registry.set('playerCount', this.registry.get('playerCount') + 1);
        }
        this.updateClickCountText();
    }

    decrementClickCount() {
        if (this.registry.values.playerCount > 0) {
            this.registry.set('playerCount', this.registry.get('playerCount') - 1);
        }
        this.updateClickCountText();
    }

    updateClickCountText() {
        this.playerCountText.setText(`${this.registry.values.playerCount} players`);
    }
}