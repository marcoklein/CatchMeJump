
import * as Phaser from 'phaser';
import * as _ from 'underscore';
import { GameScene } from './GameScene';
import { MainScene } from './MainScene';

export class HudScene extends Phaser.Scene {

    /**
     * Shows remaining time in seconds.
     */
    timeText: Phaser.GameObjects.Text;

    gameScene: GameScene;

    gameFinishedText: Phaser.GameObjects.Text;

    leavingScene: boolean;

    // true if game is finished
    finished: boolean = false;

    showFps: boolean = false;
    fpsText: Phaser.GameObjects.Text;

    endingMusic: Phaser.Sound.BaseSound;

    /**
     * Used to go back to the main scene.
     */
    enterKey: Phaser.Input.Keyboard.Key;

    statsContainer: Phaser.GameObjects.Container;
    finishContainerTween: Phaser.Tweens.Tween;


    constructor() {
        super({ key: 'HudScene' });
    }

    preload() {
        // load players
        //this.load.atlas('players', 'assets/sprites/aliens.png', 'assets/sprites/aliens.json');
        
        // load music
        this.endingMusic = this.sound.add('music_game_ending', {loop: true});
    }

    create() {
        // create fps text
        this.fpsText = this.add.text(200, 5, '' + this.game.loop.actualFps, { fontSize: '32px', color: '#777' });
        this.fpsText.setVisible(this.showFps);
        
        //this.add.text(16, 16, 'score: 0', { fontSize: '32px', fill: '#555'});
        //let info = this.add.text(10, 10, 'Score: 0', { font: '48px Arial', fill: '#000000' });
        
        
        this.timeText = this.add.text(this.game.canvas.width / 2, 10, '300s', { font: '32px Arial', fill: '#DDD' });
        this.gameFinishedText = this.add.text(this.game.canvas.width / 2, this.game.canvas.height / 2, 'Game Finished!', { font: '64px Arial', fill: '#222'});
        this.gameFinishedText.setOrigin(0.5, 0.5);
        this.gameFinishedText.alpha = 0;
        this.gameFinishedText.depth = 1000;

        // load game scene to display player information
        this.gameScene = <GameScene> this.game.scene.getScene('GameScene');

        // init key
        this.enterKey = this.input.keyboard.addKey('ENTER');

        // create stats container
        // container is refreshed on each update to sort player highscore list
        this.statsContainer = this.add.container(10, 10);
        this.statsContainer.scale = 1;

        // ensure game size is set properly
        this.scale.on('resize', (gameSize: {width: number; height: number}) => {
            this.cameras.resize(gameSize.width, gameSize.height);
        });
    }

    private refreshPlayerStatsContainer() {
        let VERTICAL_OFFSET = 7;
        const HORIZONTAL_OFFSET = 7;
        const ENTRY_HEIGHT = 60;
        let statsWidth = 100;
        statsWidth += HORIZONTAL_OFFSET * 2;
        let statsHeight = 0;

        // create the player stats panel
        this.statsContainer.removeAll(true);
        
        // background graphics
        let backgroundGraphics = this.add.graphics();
        if (this.finished) {
            // use darker color if finished
            backgroundGraphics.fillStyle(0xDDDDDD, 0.9);
            statsWidth = this.gameFinishedText.width * (1 / 1.5) + 20;
            VERTICAL_OFFSET = this.gameFinishedText.height + 20;
            statsHeight += 20;
        } else {
            backgroundGraphics.fillStyle(0xDDDDDD, 0.7);
        }
        statsHeight += VERTICAL_OFFSET; // top and bottom offset
        statsHeight += this.gameScene.players.length * ENTRY_HEIGHT;


        backgroundGraphics.fillRect(0, 0, statsWidth, statsHeight);
        this.statsContainer.add(backgroundGraphics);

        let sortedPlayers = _.sortBy(this.gameScene.players, (player) => {
            return -player.score;
        });

        // player stats
        sortedPlayers.forEach((player, index) => {
            // get badge for player
            let badge = this.add.image(
                HORIZONTAL_OFFSET, // x
                VERTICAL_OFFSET + ENTRY_HEIGHT * index, // y
                'players', // texture
                player.animationPrefix + '_badge2'
            );
            badge.setDisplaySize(ENTRY_HEIGHT - 7, ENTRY_HEIGHT - 7);
            badge.setOrigin(0); // upper left corner

            // add text for points
            let statText = this.add.text(
                badge.getRightCenter().x + 10, // x
                badge.getRightCenter().y, // y
                '' + Math.round(player.score / 1000),
                { fontStyle: 'bold', font: '18px Arial', fill: '#222'}
            );
            statText.setOrigin(0, 0.5);

            // add to container
            this.statsContainer.add(badge);
            this.statsContainer.add(statText);

        });
    }

    update() {
        // update fps info
        if (this.showFps) this.fpsText.setText('' + this.game.loop.actualFps);

        // position time text at top right
        this.timeText.x = this.game.canvas.width - this.timeText.width - 10;
        this.timeText.text = Math.round(this.gameScene.remainingGameTime / 1000) + 's';

        // refresh highscore list
        if (!this.finished) {
            this.refreshPlayerStatsContainer();
        } else {
            // wait for tween to finish before repositioning the container
            if (this.finishContainerTween && !this.finishContainerTween.isPlaying()) {
                this.statsContainer.setPosition(
                    this.gameFinishedText.getTopLeft().x - 10,
                    this.gameFinishedText.getTopLeft().y - 10
                )
            }
        }

        // if time is up, show final stats!
        if (this.gameScene.remainingGameTime <= 0) {
            this.gameFinishedText.setPosition(
                this.scale.width / 2,
                this.scale.height * 0.3
            );
            //this.gameFinishedText.visible = true;

            // attach keydown event if finished to listen for new game
            if (!this.finished) {
                this.finished = true;
                // start ending music
                this.endingMusic.play();

                // update stats container for finished game
                this.refreshPlayerStatsContainer();

                // move highscore list to center of screen
                this.finishContainerTween = this.tweens.add({
                    targets: this.statsContainer,
                    x: this.gameFinishedText.getTopLeft().x - 10,
                    y: this.gameFinishedText.getTopLeft().y - 10,
                    scale: 1.5,
                    ease: 'Power2',       // 'Cubic', 'Elastic', 'Bounce', 'Back'
                    duration: 1000,
                    repeat: 0,            // -1: infinity
                    yoyo: false
                });

                this.tweens.add({
                    targets: this.gameFinishedText,
                    alpha: 1,
                    duration: 1500,
                    repeat: 0
                });

            }
            // listen for gamepad start button press to go to main scene
            this.input.gamepad.gamepads.forEach((pad) => {
                if (pad.buttons[9].pressed) {
                    this.goToMainScene();
                }
            });
            if (this.enterKey.isDown) {
                this.goToMainScene();
            }
        }
    }

    private goToMainScene() {
        if (this.leavingScene) return;
        this.leavingScene = true;

        // stop music
        this.endingMusic.destroy();

        // destroy game scenes
        this.scene.remove('GameScene');
        this.scene.remove('HudScene');
        // go to main scene
        this.scene.add('MainScene', MainScene, true);
    }
}