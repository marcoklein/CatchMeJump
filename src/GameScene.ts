
import * as Phaser from 'phaser';
import * as _ from 'underscore';

import { Player } from './game/Player';
import { KeyboardController, GamepadController, InputController } from './InputController';
import { GameLogic, CollisionDirection } from './game/logic/GameLogic';
import { DefaultGameLogic } from './game/logic/DefaultGameLogic';


export class GameScene extends Phaser.Scene {
    // list of all players
    players: Player[] = [];
    // effect that marks catcher
    catcherEmitter = null;

    remainingGameTime = 5 * 60 * 1000;

    // index of loaded map
    mapIndex: number = -1;

    worldLayer: Phaser.Tilemaps.StaticTilemapLayer;
    /**
     * All colliding tiles.
     */
    collisionTiles: Phaser.Tilemaps.Tile[];

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


    /**
     * Game Logic
     */
    gameLogic: GameLogic = new DefaultGameLogic(this);

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
        
        let keyboardInputs = [
            new KeyboardController(
                this.input.keyboard.addKeys(
                    {
                        up: Phaser.Input.Keyboard.KeyCodes.UP,
                        down: Phaser.Input.Keyboard.KeyCodes.ALT,
                        left: Phaser.Input.Keyboard.KeyCodes.LEFT,
                        right: Phaser.Input.Keyboard.KeyCodes.RIGHT
                    }
                )
            ),
            new KeyboardController(
                this.input.keyboard.addKeys(
                    {
                        up: Phaser.Input.Keyboard.KeyCodes.W,
                        down: Phaser.Input.Keyboard.KeyCodes.SPACE,
                        left: Phaser.Input.Keyboard.KeyCodes.A,
                        right: Phaser.Input.Keyboard.KeyCodes.D
                    }
                )
            )
        ];
        let alienNames = ['alienGreen', 'alienBlue', 'alienBeige', 'alienPink', 'alienYellow'];
        // add input controllers depending on available gamepads
        let playerCount = this.registry.values.playerCount;
        let gamepadCount = this.input.gamepad.gamepads.length;
        console.log('gamepad enables', this.input.gamepad.enabled);
        console.log('Adding %i players.', playerCount);
        console.log(this.input.gamepad.gamepads);
        console.log('%i gamepads are available.', gamepadCount);
        let originalGamepadCount = 0;
        gamepadCount = 0;
        /*for (let i = 0; i < gamepadCount; i++) {
            this.players.push(this.createPlayer(300 + 200 * i, 300, alienNames[i], new GamepadController(i)));
        }*/
        for (let i = 0; i < playerCount; i++) {
            // add gamepad controllers first, then add keyboard controllers
            if (gamepadCount > 0) {
                this.players.push(this.createPlayer(300 + 200 * i, 300, alienNames[i], new GamepadController(gamepadCount - 1)));
                gamepadCount--;
            } else {
                // add keyboard
                console.log('adding keyboard', i - originalGamepadCount);
                this.players.push(this.createPlayer(300 + 200 * i, 300, alienNames[i], keyboardInputs[i - originalGamepadCount]));
            }
        }

    }
    create() {
        // needed because otherwise gamepads are not detected
        setTimeout(() => {
            this._create();
            this.gameLogic.onGameStart(this.players);
        }, 0);
    }
    _create() {

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
        this.collisionTiles = this.worldLayer.filterTiles((tile) => {
            if (tile.properties && tile.properties.collides) {
                return tile;
            }
        });
        console.log('collidable tiles', this.collisionTiles.length);

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
        //this.physics.add.collider(_.pluck(this.players, 'sprite'), _.pluck(this.players, 'sprite'));
        // listen to player to player events
        for (let i = 0; i < this.players.length; i++) {
            for (let j = i; j < this.players.length; j++) {
                if (i != j) {
                    this.physics.add.collider(this.players[i].sprite, this.players[j].sprite, this.playersCollided, null, this);
                    //this.physics.add.overlap(this.players[i].sprite, this.players[j].sprite, this.playersOverlap, null, this);
                }
            }
        }

        //this.physics.add.collider(_.pluck(this.players, 'sprite'), _.pluck(this.players, 'sprite'), this.playersCollided, null, this);
        //this.physics.add.overlap(_.pluck(this.players, 'sprite'), _.pluck(this.players, 'sprite'), this.playersOverlap, null, this);



        // set bounds
        this.physics.world.setBounds(0, 0, map.width * map.tileWidth, map.height * map.tileHeight);
        //this.cameras.main.setBounds(-200, -200, 1600, 1600);


        // ensure game size is set properly
        /*this.game.resize(window.innerWidth, window.innerHeight);
        this.cameras.main.setSize(window.innerWidth, window.innerHeight);
        // add resize listener
        window.addEventListener('resize', () => {
            this.game.resize(window.innerWidth, window.innerHeight);
            this.cameras.main.setSize(window.innerWidth, window.innerHeight);
        });*/


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

    spawnItem(x, y) {
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


    playersCollided(spritePlayerA: Phaser.Physics.Arcade.Sprite, spritePlayerB: Phaser.Physics.Arcade.Sprite) {
        // find catcher player object
        let playerA = _.find(this.players, player => {return player.sprite === spritePlayerA});
        let playerB = _.find(this.players, player => {return player.sprite === spritePlayerB});

        // custom separation function of two players to prevent pushing into a wall
        this.separateBodies(playerA, playerB);

        // handle collision
        this.gameLogic.onPlayerCollision(
            {
                player: playerA,
                direction: null
            },
            {
                player: playerB,
                direction: null
            }
        )
    }


    /**
     * Custom separation function of two (player) bodies, to prevent pushing into obstacles.
     * 
     * @param bodyA 
     * @param bodyB 
     * @returns True if bodies got separated.
     */
    private separateBodies(playerA: Player, playerB: Player): boolean {
        let bodyA = <Phaser.Physics.Arcade.Body> playerA.physicsBody;
        let bodyB = <Phaser.Physics.Arcade.Body> playerB.physicsBody;

        const OVERLAP = 3;

        let prevBodyABottom = bodyA.prev.y + bodyA.height - OVERLAP;
        let prevBodyBBottom = bodyB.prev.y + bodyB.height - OVERLAP;

        // check if players are on top of each other
        if (prevBodyBBottom <= bodyA.prev.y + OVERLAP) {
            // player b is on top of player a
            // adjust position of player b
            bodyB.y = bodyA.y - bodyB.height;
            // copy velocity
            //bodyB.setVelocityY(bodyA.velocity.y);
            // set touching parameters
            bodyB.touching.down = true;
            bodyA.touching.up = true;
            return true;
        } else if (prevBodyABottom <= bodyB.prev.y + OVERLAP) {
            // player a is on top of player b
            // adjust position of player a
            bodyA.y = bodyB.y - bodyA.height;
            // copy velocity
            //sbodyA.setVelocityY(bodyB.velocity.y);
            // set touching parameters
            bodyA.touching.down = true;
            bodyB.touching.up = true;
            return true;
        } else {
            //console.log('next to each other');
            

            // if one is colliding with a tile - reset the position
            // TODO check for horizontal tiles only (performance boost)
            if (
                this.physics.overlapTiles(playerB.sprite, this.collisionTiles) ||
                this.physics.overlapTiles(playerA.sprite, this.collisionTiles)) {
                // reset - move before tile
                bodyA.x = bodyA.prev.x;
                bodyB.x = bodyB.prev.x;
                bodyA.setVelocityX(0);
                bodyB.setVelocityX(0);
                return true;
            }
        }



    }

    /**
     * Updates camera position too always see all players.
     */
    updateCameraPosition(cam) {
        const CAM_OFFSET = 600;
        const MIN_OFFSET = 400;

        // determine player bounds (area all players lay in)
        var playerBounds = {
            x1: null, y1: null, x2: null, y2: null,
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
        // manual player collision check, as overlap is not called every time
        for (let i = 0; i < this.players.length; i++) {
            let playerA = this.players[i];
            for (let j = i; j < this.players.length; j++) {
                let playerB = this.players[j];
                if (i != j) {
                    const OVERLAP_DEPTH = 5;
                    if (playerA.sprite.body.x + OVERLAP_DEPTH < playerB.sprite.body.right && playerA.sprite.body.right - OVERLAP_DEPTH > playerB.sprite.body.x &&
                        playerA.sprite.body.y + OVERLAP_DEPTH < playerB.sprite.body.bottom && playerA.sprite.body.bottom - OVERLAP_DEPTH > playerB.sprite.body.y) {
                        // players overlap => reset positions
                        this.internalPlayersOverlap(playerA.sprite, playerB.sprite);
                    }
                }
            }
        }
    }
    
    private internalPlayersOverlap(spritePlayerA: Phaser.Physics.Arcade.Sprite, spritePlayerB: Phaser.Physics.Arcade.Sprite) {
        // find catcher player object
        let playerA = _.find(this.players, player => {return player.sprite === spritePlayerA});
        let playerB = _.find(this.players, player => {return player.sprite === spritePlayerB});

        let bodyA = <Phaser.Physics.Arcade.Body> playerA.physicsBody;
        let bodyB = <Phaser.Physics.Arcade.Body> playerB.physicsBody;

        if (!this.separateBodies(playerA, playerB)) {
            // not separated yet
            // => reset position of left or right body (depends on moved body...)
            let leftBody: Phaser.Physics.Arcade.Body = bodyA;
            let rightBody: Phaser.Physics.Arcade.Body = bodyB;
            if (bodyB.x <= bodyA.x) {
                leftBody = bodyB;
                rightBody = bodyA;
            }
            let moveLeftBody = (leftBody.x - leftBody.prev.x);
            let moveRightBody = (rightBody.x - rightBody.prev.x);

            if (moveLeftBody > -moveRightBody) {
                // left body moved right
                // => adjust position of left body
                leftBody.x = rightBody.x - leftBody.width;
            } else {
                // right body moved left
                // => adjust position of right body
                rightBody.x = leftBody.x + leftBody.width;
            }
        }

        this.gameLogic.onPlayerCollision({
            player: playerA,
            direction: null
        }, {
            player: playerB,
            direction: null
        })
    }

    updateItemSpawner(time, delta) {
        this.nextItemSpawn -= delta;
        if (this.itemSpawnLocations && this.itemSpawnLocations.length > 0 && this.nextItemSpawn < 0) {
            this.nextItemSpawn = 15000;

            // spawn an item at a item spawner
            let location = this.itemSpawnLocations[_.random(this.itemSpawnLocations.length - 1)];
            this.spawnItem(location.x, location.y);
        }
    }

    preUpdate() {
        console.log('pre update');
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