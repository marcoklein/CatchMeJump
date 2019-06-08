
import * as Phaser from 'phaser';
import * as $ from 'jquery';
import { PlayerControllerContainer } from '../ui/elements/PlayerControllerContainer';

const INPUT_DEVICE_ID = 'inputDevices';

const HTML_INPUT_DEVICE_PANEL =`
<span>
    <img src="assets/sprites/ui/grey_panel.png">
</span>`;

/**
 * Manage adding and removing of controllers.
 */
export class InputDeviceScene extends Phaser.Scene {

    backgroundImage: Phaser.GameObjects.TileSprite;

    sceneHTML: Phaser.GameObjects.DOMElement;

    constructor() {
        super({ key: 'ControllerScene' });
    }

    preload() {
        // load background
        this.load.image('background', 'assets/backgrounds/bg.png');
        // load html
        this.load.html('controller_frame', 'assets/html/controller_frame.html');
        // load ui
        this.load.atlas('ui_pack', 'assets/sprites/uipack.png', 'assets/sprites/uipack.json');
        this.load.atlas('ui_icons', 'assets/sprites/ui_icons.png', 'assets/sprites/ui_icons.json');
    }

    create() {

        // load game scene to display player information
        //this.gameScene = <GameScene> this.game.scene.getScene('GameScene');

        // set background image
        this.backgroundImage = this.add.tileSprite(0, 0, this.game.scale.width * 2, this.game.scale.height * 2, 'background');


        // ensure game size is set properly
        this.scale.on('resize', (gameSize: {width: number; height: number}) => {
            this.cameras.resize(gameSize.width, gameSize.height);
            this.reposition();
        });

        // show html
        this.sceneHTML = this.add.dom(0, 0).createFromCache('controller_frame');
    
        //this.inputDeviceGroup = this.add.group();
        //this.add.image(0, 0, 'ui_icons', 'plus');
        this.addInputDevicePanel();
        this.addInputDevicePanel();
        this.addInputDevicePanel();
        this.addInputDevicePanel();
        this.addInputDevicePanel();

        // position all elements
        this.reposition();
    }

    /**
     * Adds a new input device panel to the input device html.
     */
    private addInputDevicePanel() {
        // find input devices container
        let $container = $('#' + INPUT_DEVICE_ID);
        // create device panel
        let $devicePanel = $(HTML_INPUT_DEVICE_PANEL);

        // append device panel to device container
        $container.append($devicePanel);

    }

    private reposition() {
        this.sceneHTML.setPosition(this.scale.width / 2, this.scale.height / 4);
        this.sceneHTML.updateSize();
        this.backgroundImage.width = this.game.scale.width * 2;
        this.backgroundImage.height = this.game.scale.height * 2;

        
    }

}