
import * as Phaser from 'phaser';
import { InputDevicePanel } from '../ui/InputDevicePanel';
import { ImageButton } from '../ui/ImageButton';
import { InputDeviceType, InputDeviceOptions, GameSceneConfig, GamePlayerConfig } from '../game/GameConfig';
import { InputDeviceGrid } from '../ui/InputDeviceGrid';
import { GameScene } from '../GameScene';
import { HudScene } from '../HudScene';

const PLAYER_TEXTURES = ['alienGreen', 'alienBlue', 'alienBeige', 'alienPink', 'alienYellow'];

/**
 * Manage adding and removing of controllers.
 */
export class InputDeviceScene extends Phaser.Scene {

    titleText: Phaser.GameObjects.Text;
    backgroundImage: Phaser.GameObjects.TileSprite;
    inputDeviceGrid: InputDeviceGrid;

    startButton: ImageButton;

    /**
     * Stores all players for the game.
     */
    gamePlayerConfig: GamePlayerConfig[];


    /**
     * Default keyboard configurations as input device.
     */
    defaultKeyboardConfigurations: InputDeviceOptions[] = [
        {
            type: InputDeviceType.KEYBOARD,
            keys: {
                left: 'A',
                right: 'D',
                jump: 'W',
                action1: 'E'
            }
        },
        {
            type: InputDeviceType.KEYBOARD,
            keys: {
                left: 'LEFT',
                right: 'RIGHT',
                jump: 'UP',
                action1: 'SPACE'
            }
        },
        {
            type: InputDeviceType.KEYBOARD,
            keys: {
                left: 'H',
                right: 'K',
                jump: 'U',
                action1: 'I'
            }
        }
    ];
    usedKeyboards: number = 0;

    constructor() {
        super({ key: 'InputDeviceScene' });
    }

    preload() {
        // load background
        this.load.image('background', 'assets/backgrounds/bg.png');
        // load html
        this.load.html('controller_frame', 'assets/html/controller_frame.html');
        // load ui
        this.load.image('keyboard_icon', 'assets/sprites/keyboard.png');
        this.load.atlas('ui_pack', 'assets/sprites/uipack.png', 'assets/sprites/uipack.json');
        this.load.atlas('ui_icons', 'assets/sprites/ui_icons.png', 'assets/sprites/ui_icons.json');
    }

    create() {

        // set background image
        this.backgroundImage = this.add.tileSprite(0, 0, this.game.scale.width * 2, this.game.scale.height * 2, 'background');

        // add title
        this.titleText = this.add.text(this.scale.width / 2, 20, 'Input Devices', { fontStyle: 'bold', fontSize: '32px', fontFamily: '"Roboto Condensed"', color: '#000'});

        // add buttons
        this.startButton = new ImageButton(this, 0, 0, 'ui_icons', 'buttonStart', () => {
            this.startGame();
        });
        this.add.existing(this.startButton);


        // ensure game size is set properly
        this.scale.on('resize', (gameSize: {width: number; height: number}) => {
            this.cameras.resize(gameSize.width, gameSize.height);
            this.reposition(gameSize.width, gameSize.height);
        });

        this.inputDeviceGrid = new InputDeviceGrid(this, 150, 200, 400);
        // add five panels
        for (let i = 0; i < 5; i++) {
            let panel = new InputDevicePanel(this, i + 1);
            panel.on('pointerup', () => {
                this.handleInputDevicePanelClick(panel);
            }, this);
            this.inputDeviceGrid.add(panel);
        }
        this.add.existing(this.inputDeviceGrid);

        // position all elements
        this.reposition(this.scale.width, this.scale.height);
    }

    private reposition(width: number, height: number) {
        // position title text on top
        this.titleText.setPosition(
            width / 2 - this.titleText.width / 2,
            20
        );

        // position grid
        this.inputDeviceGrid.width = width * 0.8;
        this.inputDeviceGrid.x = width / 2 - this.inputDeviceGrid.width / 2;

        // position start button under grid
        this.startButton.setPosition(
            width * 0.5,
            this.inputDeviceGrid.y + this.inputDeviceGrid.height
        );
    }

    /**
     * Handles the click on an input device panel.
     * Adds a keyboard control if possible.
     * 
     * @param panel 
     */
    private handleInputDevicePanelClick(panel: InputDevicePanel) {
        // count available keyboards
        if (panel.deviceType === null && this.usedKeyboards < this.defaultKeyboardConfigurations.length) {
            // add new keyboard
            panel.deviceType = InputDeviceType.KEYBOARD;
            panel.deviceOptions = this.defaultKeyboardConfigurations.shift();
        } else if (panel.deviceType === InputDeviceType.KEYBOARD) {
            // remove existing keyboard
            panel.deviceType = null;
            // add keyboard options to available list
            this.defaultKeyboardConfigurations.push(panel.deviceOptions);
            panel.deviceOptions = null;
        }
    }
    
    /**
     * Starts a new game by create a game scene.
     */
    private startGame() {
        // prepare game config
        let gameConfig: GameSceneConfig = {
            //tilemapPath: '/assets/tilemaps/flat.json',
            players: []
        };
        // fill game config with players
        this.inputDeviceGrid.list.forEach((panel: InputDevicePanel, index: number) => {
            if (panel.deviceOptions) {
                // add player configs
                gameConfig.players.push({
                    name: 'Player ' + (index + 1),
                    texture: PLAYER_TEXTURES[index],
                    input: panel.deviceOptions
                });
            }
        });
        this.registry.set('gameConfig', gameConfig);

        // do not start game without players
        if (gameConfig.players.length < 1) {
            return;
        }

        //this.scene.start('GameScene');
        //this.scene.start('HudScene');
        // start game
        this.scene.stop('InputDeviceScene');
        this.scene.add('GameScene', GameScene, true);
        this.scene.add('HudScene', HudScene, true);
    }

}