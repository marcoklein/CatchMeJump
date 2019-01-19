
import * as Phaser from 'phaser';
import * as _ from 'underscore';

import { Player } from './Player';
import { KeyboardController, GamepadController, InputController } from './InputController';

abstract class Item {

}

class JetpackItem {

}

export class GameScene extends Phaser.Scene {
    // list of all players
    players: Player[] = [];
    // effect that marks catcher
    catcherEmitter = null;

    remainingGameTime = 5 * 60 * 1000;

    // index of loaded map
    mapIndex: number = -1;

    worldLayer;

    objectGroup: any;//Phaser.Physics.Arcade.StaticGroup = null;
    itemGroup: any;
    itemSpawnLocations: [
        {
            x: number,
            y: number
        }
    ];
    // time till next item is spawned
    nextItemSpawn: number = 15000;

    constructor() {
        super({ key: 'GameScene' });
    }
    
    preload() {
        // load players
        this.load.atlas('players', 'assets/sprites/aliens.png', 'assets/sprites/aliens.json');

        // load items
        this.load.image('jetpack_item', 'assets/sprites/jetpack_item.png');

        // load particles
        this.load.image('particle_blue', 'assets/particles/blue.png');
        this.load.image('particle_red', 'assets/particles/red.png');

        // load tilemap
        this.load.image('base_tiles', 'assets/tiles/base_spritesheet.png');
        this.load.image('building_tiles', 'assets/tiles/buildings.png');
        this.load.image('candy_tiles', 'assets/tiles/candy.png');
        this.load.image('ice_tiles', 'assets/tiles/ice.png');
        this.load.image('mushroom_tiles', 'assets/tiles/mushroom.png');
        this.load.image('request_tiles', 'assets/tiles/request.png');
        this.load.image('industrial_tiles', 'assets/tiles/industrial.png');

        let maps = [
            '/assets/tilemaps/marcs_world.json',
            '/assets/tilemaps/standard.json',
            '/assets/tilemaps/flat.json',
            '/assets/tilemaps/catchmejump1.json',
            '/assets/tilemaps/catchmejump2.json',
            '/assets/tilemaps/catchmejump3.json',
            '/assets/tilemaps/catchmejump4.json',
            '/assets/tilemaps/superjump.json',
            '/assets/tilemaps/mighty.json',
            '/assets/tilemaps/megamap.json',
            '/assets/tilemaps/spring.json',
            '/assets/tilemaps/lost.json',
            '/assets/tilemaps/itemize.json',
            '/assets/tilemaps/ultimate.json'
        ];
        // load a random map
        this.mapIndex = _.random(maps.length - 1);
        maps.forEach((mapKey, index) => {
            this.load.tilemapTiledJSON("map_" + index, mapKey);
        });

    }

    /**
     * Creates player with given parameters.
     * @param x 
     * @param y 
     * @param imageName 
     * @param controller 
     */
    createPlayer(x, y, imageName, controller: InputController) {
        let sprite = this.physics.add.sprite(x, y, 'players', imageName + '_stand');
        sprite.setCollideWorldBounds(true);
        sprite.setSize(56, 88);
        sprite.setMaxVelocity(1000, 1200);

        let player = new Player(controller, sprite, imageName);

        return player;

    }

    /**
     * Create all player and add them to this.players
     */
    createPlayers() {
        
        //let player1InputController = new KeyboardController(this.input.keyboard.createCursorKeys());
        let player1InputController = new GamepadController(0);
        /*let player2InputController = new KeyboardController(
            this.input.keyboard.addKeys(
                {
                    up: Phaser.Input.Keyboard.KeyCodes.W,
                    down: Phaser.Input.Keyboard.KeyCodes.S,
                    left: Phaser.Input.Keyboard.KeyCodes.A,
                    right: Phaser.Input.Keyboard.KeyCodes.D
                }
            )
        );*/
        let player2InputController = new GamepadController(1);
        let player3InputController = new KeyboardController(
            this.input.keyboard.addKeys(
                {
                    up: Phaser.Input.Keyboard.KeyCodes.UP,
                    down: Phaser.Input.Keyboard.KeyCodes.SPACE,
                    left: Phaser.Input.Keyboard.KeyCodes.LEFT,
                    right: Phaser.Input.Keyboard.KeyCodes.RIGHT
                }
            )
        );

        this.players.push(this.createPlayer(300, 300, 'alienGreen', player1InputController));
        this.players.push(this.createPlayer(500, 300, 'alienBlue', player2InputController));
        //this.players.push(this.createPlayer(700, 300, 'alienBeige', player3InputController));
        //this.players.push(this.createPlayer(900, 300, 'alienPink', player3InputController));
        //this.players.push(this.createPlayer(1100, 300, 'alienYellow', player3InputController));

    }

    create() {

        //  First create a particle manager
        //  A single manager can be responsible for multiple emitters
        //  The manager also controls which particle texture is used by _all_ emitter
        var particles = this.add.particles('particle_blue');

        this.catcherEmitter = particles.createEmitter({});
        this.catcherEmitter.setScale(0.5, 0.5);
        this.catcherEmitter.setSpeed(50);
        this.catcherEmitter.setBlendMode(Phaser.BlendModes.ADD);

        


        // Parameters are the name you gave the tileset in Tiled and then the key of the tileset image in
        // Phaser's cache (i.e. the name you used in preload)
        const map = this.make.tilemap({key: 'map_' + this.mapIndex});
        const baseTiles = map.addTilesetImage('base_platformer', 'base_tiles');
        const buildingTiles = map.addTilesetImage('building', 'building_tiles');
        const candyTiles = map.addTilesetImage('candy', 'candy_tiles');
        const iceTiles = map.addTilesetImage('ice', 'ice_tiles');
        const mushroomTiles = map.addTilesetImage('mushroom', 'mushroom_tiles');
        const requestTiles = map.addTilesetImage('request', 'request_tiles');
        const industrialTiles = map.addTilesetImage('industrial', 'industrial_tiles');

        const tilesets = [
            baseTiles,
            buildingTiles,
            candyTiles,
            iceTiles,
            mushroomTiles,
            requestTiles,
            industrialTiles
        ]
    
        // Parameters: layer name (or index) from Tiled, tileset, x, y
        const belowLayer = map.createStaticLayer('Below Player', tilesets, 0, 0);
        this.worldLayer = map.createStaticLayer('World', tilesets, 0, 0);
        const aboveLayer = map.createStaticLayer('Above Player', tilesets, 0, 0);
        const objectLayer = map.createDynamicLayer('Objects', tilesets, 0, 0);

        if (objectLayer) {
            console.log('Object layer loaded');
        }

        // unwalkable tiles are marked as collidable
        this.worldLayer.setCollisionByProperty({collides: true});

        // debug graphics for tilemap collisions
        /*const debugGraphics = this.add.graphics().setAlpha(0.75);
        worldLayer.renderDebug(debugGraphics, {
            tileColor: null, // Color of non-colliding tiles
            collidingTileColor: new Phaser.Display.Color(243, 134, 48, 255), // Color of colliding tiles
            faceColor: new Phaser.Display.Color(40, 39, 37, 255) // Color of colliding face edges
        });*/


        this.createPlayers();

        console.log('props: ', map.properties);
        if (_.find(<any>map.properties, (prop: any) => {return prop.name === 'noBorders' && prop.value === true})) {
            console.log('playing map without borders');
            this.players.forEach(player => {
                // players are placed on top if they fall down
                player.sprite.setCollideWorldBounds(false);
            })
        }

        // choose a random catcher
        this.setCatcher(this.players[_.random(this.players.length - 1)]);

        // load player animations
        this.players.forEach(player => {
            player.createAnimations(this.anims);
        });


        // enable collision between platforms and player
        this.players.forEach(player => {
            this.physics.add.collider(player.sprite, this.worldLayer);
        });
        // listen to player to player events
        for (let i = 0; i < this.players.length; i++) {
            for (let j = i; j < this.players.length; j++) {
                if (i != j) {
                    this.physics.add.collider(this.players[i].sprite, this.players[j].sprite, this.playersCollided, null, this);
                }
            }
        }



        // set bounds
        this.physics.world.setBounds(0, 0, map.width * map.tileWidth, map.height * map.tileHeight);
        //this.cameras.main.setBounds(-200, -200, 1600, 1600);


        // ensure game size is set properly
        this.game.resize(window.innerWidth, window.innerHeight);
        this.cameras.main.setSize(window.innerWidth, window.innerHeight);
        // add resize listener
        window.addEventListener('resize', () => {
            this.game.resize(window.innerWidth, window.innerHeight);
            this.cameras.main.setSize(window.innerWidth, window.innerHeight);
        });


        // enable special map objects if layer is available
        if (objectLayer) {
            // Create a physics group - useful for colliding the player against all the spikes
            this.objectGroup = this.physics.add.staticGroup();
            this.itemGroup = this.physics.add.staticGroup();


            // Loop over each Tile and replace spikes (tile index 77) with custom sprites
            objectLayer.forEachTile(tile => {
                if (tile.index === 360) {
                    // A sprite has its origin at the center, so place the sprite at the center of the tile
                    const x = tile.getCenterX();
                    const y = tile.getCenterY();
                    const spike = this.objectGroup.create(x, y, 'spring');
                    spike.width = tile.width;
                    spike.height = tile.height;
                    spike.visible = false;

                    // And lastly, remove the spike tile from the layer
                    //objectLayer.removeTileAt(tile.x, tile.y);
                } else if (tile.index === 1 || (<any>tile.properties).spawn_item) {
                    // extract spawn points for items
                    console.log('found spawn point', tile.properties);
                    objectLayer.removeTileAt(tile.x, tile.y);
                    // add item spawner location
                    if (!this.itemSpawnLocations) {
                        this.itemSpawnLocations = [{x: tile.x * tile.width, y: tile.y * tile.height}];
                    } else {
                        this.itemSpawnLocations.push({x: tile.x * tile.width, y: tile.y * tile.height});
                    }
                }
            });
        }
    }

    spawnItem(x, y, item: Item) {
        let itemSprite = this.physics.add.sprite(x, y, 'jetpack_item');
        
        this.physics.add.collider(itemSprite, this.worldLayer);
        this.players.forEach(
            player => {
                this.physics.add.overlap(player.sprite, itemSprite, () => {
                    itemSprite.destroy();
                    // apply jetpack effect if picked up by player
                    player.activateJetpack(5000, this);
                });
            }
        );
    }

    setCatcher(player: Player) {
        // sets given player as catcher
        // loops through all players to mark "old" catcher as no catcher

        let currentCatcher = _.find(this.players, player => {return player.isCatcher});
        if (currentCatcher) currentCatcher.isCatcher = false;
        // promote playerB as catcher
        player.isCatcher = true;
        player.isFrozen = true;
        // attach catcher effect to playerB
        this.catcherEmitter.startFollow(player.sprite);
        this.time.delayedCall(3000, () => { player.isFrozen = false; }, [], this);
    }

    playersCollided(playerA: any, playerB: any) {
        // find catcher player object
        playerA = _.find(this.players, player => {return player.sprite === playerA});
        playerB = _.find(this.players, player => {return player.sprite === playerB});
        if (playerA.isFrozen || playerB.isFrozen) {
            // do not allow catches during freeze time
            return;
        }
        if (playerA.isCatcher) {
            this.setCatcher(playerB);
        } else if (playerB.isCatcher) {
            this.setCatcher(playerA);
        }
    }

    /**
     * Updates camera position too always see all players.
     */
    updateCameraPosition(cam) {
        // find center point of all players
        const CAM_OFFSET = 600;
        const MIN_OFFSET = 400;

        // determine player bounds (area all players lay in)
        var playerBounds = {
            x1: null,
            y1: null,
            x2: null,
            y2: null,
            get width() {
                return Math.max(this.x2 - this.x1, MIN_OFFSET) + CAM_OFFSET;
            },
            get height() {
                return Math.max(this.y2 - this.y1, MIN_OFFSET) + CAM_OFFSET;
            }
        }
        // determine edges of player area
        this.players.forEach(player => {
            if (playerBounds.x1 === null || player.sprite.x < playerBounds.x1) {
                // player is further to the left
                playerBounds.x1 = player.sprite.x;
            }
            if (playerBounds.x2 === null || player.sprite.x > playerBounds.x2) {
                // player is further to the right
                playerBounds.x2 = player.sprite.x;
            }
            if (playerBounds.y1 === null || player.sprite.y < playerBounds.y1) {
                // player is further to the top
                playerBounds.y1 = player.sprite.y;
            }
            if (playerBounds.y2 === null || player.sprite.y > playerBounds.y2) {
                // player is further to the bottom
                playerBounds.y2 = player.sprite.y;
            }
        });

        // calculate center point
        cam.pan(
            (playerBounds.x2 - playerBounds.x1) / 2 + playerBounds.x1, // x position
            (playerBounds.y2 - playerBounds.y1) / 2 + playerBounds.y1, // y position
            100,
            'Linear'
        );

        // calculate scale ratio
        let zoomX = playerBounds.width / cam.width;
        let zoomY = playerBounds.height / cam.height;

        // zoom smoothly to desired scale
        cam.zoomTo(
            1 / Math.max(zoomX, zoomY),
            100,
            'Linear'
        );

    }

    playerPhysicsUpdate(time, delta, scene: GameScene) {
        this.players.forEach(player => {
            if (player.sprite.y > this.physics.world.bounds.height) {
                player.sprite.x = 200;
                player.sprite.y = 200;
                this.setCatcher(player);
            }
        });
    }

    updateItemSpawner(time, delta) {
        this.nextItemSpawn -= delta;
        if (this.itemSpawnLocations && this.itemSpawnLocations.length > 0 && this.nextItemSpawn < 0) {
            this.nextItemSpawn = 15000;

            // spawn an item at a item spawner
            let location = this.itemSpawnLocations[_.random(this.itemSpawnLocations.length - 1)];
            this.spawnItem(location.x, location.y, null);
        }
    }

    update(time, delta) {
        //this.physics.world.gravity = new Phaser.Math.Vector2(0, 400);
        if (this.remainingGameTime > 0) {
            // game is running
            this.remainingGameTime -= delta;
            // update players
            this.players.forEach(player => {
                player.update(time, delta, this);
            });
            this.playerPhysicsUpdate(time, delta, this);
            // update camera
            this.updateCameraPosition(this.cameras.main);
            this.updateItemSpawner(time, delta);
        } else {
            // game finished - do nothing
            this.scene.pause();
        }

    }

}