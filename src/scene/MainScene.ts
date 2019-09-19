
import * as Phaser from 'phaser';
import { InputDevicePanel } from '../ui/InputDevicePanel';
import { ImageButton } from '../ui/ImageButton';
import { InputDeviceType, InputDeviceOptions, GameSceneConfig, GamePlayerConfig } from '../game/GameConfig';
import { InputDeviceGrid } from '../ui/InputDeviceGrid';
import { GameScene } from './GameScene';
import { HudScene } from './HudScene';
import _ = require('underscore');

const PLAYER_TEXTURES = ['alienGreen', 'alienBlue', 'alienBeige', 'alienPink', 'alienYellow'];

declare var remoteGamepadAPI: any;

/**
 * Manage adding and removing of controllers.
 */
export class MainScene extends Phaser.Scene {

    titleText: Phaser.GameObjects.Text;
    connectionCodeText: Phaser.GameObjects.Text;
    controllerlyInstructions: Phaser.GameObjects.Text;
    backgroundImage: Phaser.GameObjects.Image;
    inputDeviceGrid: InputDeviceGrid;

    startingGame: boolean = false;
    startButton: ImageButton;

    /**
     * Stores all players for the game.
     */
    gamePlayerConfig: GamePlayerConfig[];

    menuMusic: Phaser.Sound.BaseSound;

    sceneStartTime: number;


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
        super({ key: 'MainScene' });
    }

    preload() {
    }

    create() {
        this.startingGame = false;
        this.sceneStartTime = this.time.now;
        this.startMusic();
        this.initUserInterface();
        _.defer(() => {
            this.initGamepadListeners();
        });
        this.initResizing();
    }

    update(time: number, delta: number) {
        // listen for gamepad start button
        this.input.gamepad.gamepads.forEach((pad) => {
            if (pad.buttons[9].pressed) {
                this.startGame();
                return;
            }
        })
    }

    private startMusic() {
        this.menuMusic = this.sound.add('music_menu', {
            loop: true
        });
        this.menuMusic.play();
    }

    private stopMusic() {
        this.menuMusic.destroy();
    }


    private initGamepadListeners() {
        this.input.gamepad.on('connected', this.onGamepadConnected, this);
        this.input.gamepad.on('disconnected', this.onGamepadDisconnected, this);

        this.input.gamepad.gamepads.forEach((pad) => {
            this.onGamepadConnected(pad);
        });
    }


    /**
     * The user interface has a background image that is always resized to the current game size.
     * 
     * Additionally, there are fields to configure the remote gamepad for the smartphone (instructions).
     */
    private initUserInterface() {
        // set background image
        this.backgroundImage = this.add.image(0, 0, 'background');
        this.backgroundImage.setOrigin(0, 0);

        // add title "Add Input Devices"
        this.titleText = this.add.text(
            800, // center
            200,
            'Add Input Devices',
            { fontStyle: 'bold', fontSize: '32px', fontFamily: '"Roboto Condensed"', color: '#000'}
        );
        this.titleText.setOrigin(0.5, 0.5); // center title text

        // show information about remote gamepads if the api is available
        if (remoteGamepadAPI && remoteGamepadAPI.server.connectionCode) {
            this.connectionCodeText = this.add.text(
                800, // x
                230, // y
                'Connection Code: ' + remoteGamepadAPI.server.connectionCode,
                { fontStyle: 'bold', fontSize: '22px', fontFamily: '"Roboto Condensed"', color: '#000' }
            );
            this.connectionCodeText.setOrigin(0.5, 0.5);
            this.controllerlyInstructions = this.add.text(
                800, 270,
                'Go to pad.kleinprojects.com with your smartphone and enter the code\nto use your mobile device as a remote gamepad!',
                { fontStyle: 'bold', fontSize: '16px', fontFamily: '"Roboto Condensed"', color: '#633', align: 'center' }
            );
            this.controllerlyInstructions.setOrigin(0.5, 0.5);
        }
        
        const gameWidth = this.scale.width;

        // the input device grid holds 5 panels á 100 width and 10 offset
        // widthGrid = 100 * 5 + 10 * 5
        this.inputDeviceGrid = new InputDeviceGrid(this,
            gameWidth / 2 - 250 - 10 * 5 + 20, // x
            320, // y
            100 * 5 + 10 * 4  // width
        );
        this.inputDeviceGrid.centering = false;
        // add five panels
        for (let i = 0; i < 5; i++) {
            let panel = new InputDevicePanel(this, i + 1);
            panel.on('pointerup', () => {
                this.handleInputDevicePanelClick(panel);
            }, this);
            this.inputDeviceGrid.add(panel);
        }
        this.add.existing(this.inputDeviceGrid);


        // add buttons
        this.startButton = new ImageButton(this,
            800,
            400,
            'ui_icons', 'buttonStart', () => {
                this.startGame();
            }
        );
        this.startButton.setOrigin(0.5, 0.5);
        this.add.existing(this.startButton);
    }

    private initResizing() {
        // ensure game size is set properly
        this.scale.on('resize', (gameSize: {width: number; height: number}) => {
            this.cameras.resize(gameSize.width, gameSize.height);
            this.reposition(gameSize.width, gameSize.height);
        });

        // position all elements
        this.reposition(this.scale.width, this.scale.height);
    }

    private reposition(width: number, height: number) {
        const topPos = height * 0.1;

        // position title text on top
        this.titleText.setPosition(
            width / 2,
            topPos
        );
        if (this.connectionCodeText) {
            this.connectionCodeText.setPosition(
                width / 2,
                topPos + 60
            );
            this.controllerlyInstructions.setPosition(
                width / 2,
                topPos + 100
            )
        }

        // background image
        this.backgroundImage.setDisplaySize(width, height);

        // position grid
        this.inputDeviceGrid.y = topPos + 220;
        this.inputDeviceGrid.x = width / 2 - this.inputDeviceGrid.width / 2 + 50; // don't know why you have to add 50

        // position start button under grid
        this.startButton.setPosition(
            width * 0.5,
            this.inputDeviceGrid.y + this.inputDeviceGrid.height + 10
        );
    }

    /**
     * A gamepad connected to the input manager.
     * Called for each gamepad when the scene is created.
     * 
     * Adds a gamepad control to the input device list.
     * 
     * @param pad Connected gamepad.
     */
    private onGamepadConnected(pad: Phaser.Input.Gamepad.Gamepad) {
        // update panels
        let panel = this.inputDeviceGrid.findNextFreePanel();
        if (!panel) {
            // no free space
            console.warn('Gamepad connected, but there is not enough space.');
            return;
        }
        // assign gamepad to panel
        panel.deviceOptions = {
            type: InputDeviceType.GAMEPAD,
            index: pad.index
        };
    }

    private onGamepadDisconnected(pad: Phaser.Input.Gamepad.Gamepad) {
        let panel = (<InputDevicePanel[]> this.inputDeviceGrid.list).find((panel) => {
            // find panel with device options type gamepad and index of the pad
            return panel.deviceOptions && panel.deviceOptions.type === InputDeviceType.GAMEPAD &&
                panel.deviceOptions.index === pad.index;
        });
        // remove gamepad
        panel.deviceOptions = null;
    }

    /**
     * Handles the click on an input device panel.
     * Adds a keyboard control if possible.
     * 
     * @param panel 
     */
    private handleInputDevicePanelClick(panel: InputDevicePanel) {
        // count available keyboards
        if (!panel.deviceOptions && this.usedKeyboards < this.defaultKeyboardConfigurations.length) {
            // add new keyboard
            panel.deviceOptions = this.defaultKeyboardConfigurations.shift();
        } else if (panel.deviceOptions.type === InputDeviceType.KEYBOARD) {
            // add keyboard options to available list
            this.defaultKeyboardConfigurations.push(panel.deviceOptions);
            // remove existing keyboard
            panel.deviceOptions = null;
        }
    }
    
    /**
     * Starts a new game by create a game scene.
     */
    private startGame() {
        if (this.time.now - this.sceneStartTime < 1000) {
            // do not allow immediate start as this may be due to a long button press
            return;
        }
        if (this.startingGame) {
            return;
        }
        this.startingGame = true;

        // select random map
        let maps = [
            //'assets/tilemaps/marcs_world.json',
            'assets/tilemaps/standard.json',
            'assets/tilemaps/flat.json',
            'assets/tilemaps/catchmejump1.json',
            'assets/tilemaps/catchmejump2.json',
            'assets/tilemaps/catchmejump3.json',
            'assets/tilemaps/catchmejump4.json',
            'assets/tilemaps/superjump.json',
            'assets/tilemaps/mighty.json',
            'assets/tilemaps/megamap.json',
            'assets/tilemaps/spring.json',
            'assets/tilemaps/lost.json',
            'assets/tilemaps/itemize.json',
            'assets/tilemaps/ultimate.json',
            'assets/tilemaps/little_mushroom_island.json',
            'assets/tilemaps/thenewnew.json',
            'assets/tilemaps/thefall.json',
            'assets/tilemaps/capturetheflag.json'
        ];
        // load a random map
        let mapIndex = _.random(maps.length - 1);

        // prepare game config
        let gameConfig: GameSceneConfig = {
            tilemapPath: maps[mapIndex],
            players: [],
            options: {
                catcherFreezeTime: 2500,
                duration: 4 * 60 * 1000
            }
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
            console.warn('Cannot start game without players.');
            this.startingGame = false;
            return;
        }

        this.stopMusic();
        this.scene.add('GameScene', GameScene, true);
        this.scene.add('HudScene', HudScene, true);
        // start game
        this.scene.remove('MainScene');
    }


    /**
     * Calculates the actual viewport to place elements in corners of screen disregarding potential scaling through envelop.
     * 
     * Inspired by rexrainbow:
     * https://phaser.discourse.group/t/how-to-place-game-objects-align-left-right-bounds-of-visible-game-window-in-envelop-scale-mode/1103
     * 
     * @param scaleManager 
     * @param out 
     */
    private getViewport(scaleManager: Phaser.Scale.ScaleManager, out?: Phaser.Geom.Rectangle) {
        if (out === undefined) {
            out = new Phaser.Geom.Rectangle();
        }
        let bounds = scaleManager.canvasBounds;
        let scale = scaleManager.displayScale;
        let autoCenter = scaleManager.autoCenter;
    
        out.x = (bounds.x >= 0) ? 0 : -(bounds.x * scale.x);
        out.y = (bounds.y >= 0) ? 0 : -(bounds.y * scale.y);
        out.width = (bounds.width * scale.x) - out.x;
        out.height = (bounds.height * scale.y) - out.y;
        if ((autoCenter === 1) || (autoCenter === 2)) {
            out.width -= out.x;
        }
        if ((autoCenter === 1) || (autoCenter === 3)) {
            out.height -= out.y;
        }
        return out;
    };

}