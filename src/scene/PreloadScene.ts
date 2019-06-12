

/**
 * Initial game screen loading all needed assets.
 */
export class PreloadScene extends Phaser.Scene {


    preload() {
        // uncomment to show preload screen
        //if ((<any> this.game.config).showPreloadScreen) {
            this.initPreloadScreen();
        //}

        // load music
        this.load.audio('music_menu', 'assets/music/awesomeness.wav');
        this.load.audio('music_game_1', 'assets/music/retro_music_level1.wav');
        this.load.audio('music_game_2', 'assets/music/retro_music_level2.wav');
        this.load.audio('music_game_3', 'assets/music/retro_music_level3.wav');
        this.load.audio('music_game_ending', 'assets/music/retro_music_ending.wav');
        // load background
        this.load.image('background', 'assets/backgrounds/bg.png');
        // load html
        this.load.html('controller_frame', 'assets/html/controller_frame.html');
        // load ui
        this.load.image('keyboard_icon', 'assets/sprites/keyboard.svg');
        this.load.atlas('ui_pack', 'assets/sprites/uipack.png', 'assets/sprites/uipack.json');
        this.load.atlas('ui_icons', 'assets/sprites/ui_icons.png', 'assets/sprites/ui_icons.json');
        this.load.atlas('gameicons', 'assets/sprites/gameicons.png', 'assets/sprites/gameicons.json');

        
        // load players
        this.load.atlas('players', 'assets/sprites/aliens.png', 'assets/sprites/aliens.json');

        // load items
        this.load.image('jetpack_item', 'assets/sprites/jetpack_item.png');

        // load particles
        this.load.image('particle_blue', 'assets/particles/blue.png');
        this.load.image('particle_red', 'assets/particles/red.png');

        // load tilemap tiles
        this.load.image('base_tiles', 'assets/tiles/base_spritesheet.png');
        this.load.image('building_tiles', 'assets/tiles/buildings.png');
        this.load.image('candy_tiles', 'assets/tiles/candy.png');
        this.load.image('ice_tiles', 'assets/tiles/ice.png');
        this.load.image('mushroom_tiles', 'assets/tiles/mushroom.png');
        this.load.image('request_tiles', 'assets/tiles/request.png');
        this.load.image('industrial_tiles', 'assets/tiles/industrial.png');
    }

    create() {
        // switch to main scene after loading
        this.scene.stop();
        this.scene.start('MainScene');
    }

    
    private initPreloadScreen() {
        
        var progressBar = this.add.graphics();
        var progressBox = this.add.graphics();
        progressBox.fillStyle(0x222222, 0.8);
        progressBox.fillRect(240, 270, 320, 50);
        
        var width = this.cameras.main.width;
        var height = this.cameras.main.height;
        var loadingText = this.make.text({
            x: width / 2,
            y: height / 2 - 50,
            text: 'Loading...',
            style: {
                font: '20px monospace',
                fill: '#ffffff'
            }
        });
        loadingText.setOrigin(0.5, 0.5);
        
        var percentText = this.make.text({
            x: width / 2,
            y: height / 2 - 5,
            text: '0%',
            style: {
                font: '18px monospace',
                fill: '#ffffff'
            }
        });
        percentText.setOrigin(0.5, 0.5);
        
        var assetText = this.make.text({
            x: width / 2,
            y: height / 2 + 50,
            text: '',
            style: {
                font: '18px monospace',
                fill: '#ffffff'
            }
        });

        assetText.setOrigin(0.5, 0.5);
        
        this.load.on('progress', function (value: number) {
            percentText.setText(value * 100 + '%');
            progressBar.clear();
            progressBar.fillStyle(0xffffff, 1);
            progressBar.fillRect(250, 280, 300 * value, 30);
        });
        
        this.load.on('fileprogress', function (file: any) {
            assetText.setText('Loading asset: ' + file.key);
        });

        this.load.on('complete', function () {
            progressBar.destroy();
            progressBox.destroy();
            loadingText.destroy();
            percentText.destroy();
            assetText.destroy();
        });
    }

}