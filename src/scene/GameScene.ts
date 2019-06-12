
import * as Phaser from 'phaser';
import * as _ from 'underscore';

import { Player } from '../game/Player';
import { KeyboardController, GamepadController, InputController } from '../game/InputController';
import { GameLogic, CollisionDirection } from '../game/logic/GameLogic';
import { DefaultGameLogic } from '../game/logic/DefaultGameLogic';
import { GameSceneConfig, InputDeviceOptions } from '../game/GameConfig';


export class GameScene extends Phaser.Scene {

    /**
     * Game configuration given by the previous scene that started the game.
     */
    gameConfig: GameSceneConfig;

    // list of all players
    players: Player[] = [];
    /**
     * Game time.
     */
    remainingGameTime = 4 * 60 * 1000;

    // effect that marks catcher
    private catcherEmitter = null;
    /**
     * The player with the highest score is marked with stars.
     */
    private bestPlayerEmitter: Phaser.GameObjects.Particles.ParticleEmitter;
    private bestPlayerIcon: Phaser.GameObjects.Image;

    /* Map related */

    /**
     * Loaded tilemap.
     */
    private map: Phaser.Tilemaps.Tilemap;
    /**
     * World layer of the tilemap.
     */
    private worldLayer: Phaser.Tilemaps.StaticTilemapLayer;
    private objectLayer: Phaser.Tilemaps.DynamicTilemapLayer;
    /**
     * All colliding tiles.
     */
    private collisionTiles: Phaser.Tilemaps.Tile[];

    objectGroup: any;//Phaser.Physics.Arcade.StaticGroup = null;
    private itemGroup: any;
    private itemSpawnLocations: [
        {
            x: number,
            y: number
        }
    ];
    // time till next item is spawned
    private nextItemSpawn: number = 15000;

    gameMusic: Phaser.Sound.BaseSound;

    /**
     * Game Logic
     */
    gameLogic: GameLogic = new DefaultGameLogic(this);

    constructor() {
        super({
            key: 'GameScene',
            physics: {
                default: 'arcade',
                arcade: {
                    gravity: { y: 900 },
                    //fps: 60,
                    timeScale: 1,
                    debug: false,
                    tileBias: 70 // prevent falling through tiles... (tile size of tilemap)
                    //overlapBias: 16
                }
            }
        });
    }
    
    preload() {
        // load game config
        this.gameConfig = this.registry.get('gameConfig');
        
        // load configured map
        this.cache.tilemap.remove('tilemap');
        this.load.tilemapTiledJSON('tilemap', this.gameConfig.tilemapPath);
    }

    
    create() {
        this.startMusic();
        this.createEffects();
        this.createMap();
        this.createPlayers(this.gameConfig);
        this.initPhysics();
        this.enableMap();
        
        // ensure game size is set properly
        this.scale.on('resize', (gameSize: {width: number; height: number}) => {
            this.cameras.resize(gameSize.width, gameSize.height);
        });

        // notify game logic about start
        this.gameLogic.onGameStart(this.players);
    }

    /**
     * Creates player with given parameters.
     * @param x 
     * @param y 
     * @param imageName 
     * @param controller 
     */
    private createPlayer(x: number, y: number, imageName: string, inputOptions: InputDeviceOptions) {
        let sprite = this.physics.add.sprite(x, y, 'players', imageName + '_stand');
        sprite.setCollideWorldBounds(true);
        sprite.setSize(56, 88);
        sprite.setMaxVelocity(1000, 1200);

        let player = new Player(this, sprite, imageName, inputOptions);

        return player;

    }

    /**
     * Create all player and add them to this.players
     */
    private createPlayers(gameConfig: GameSceneConfig) {
        this.players = [];
        // create players of config
        gameConfig.players.forEach((playerConfig, index) => {
            let player = this.createPlayer(300 + 200 * index, 300, playerConfig.texture, playerConfig.input);
            this.players.push(player);
        });
    }
    
    private startMusic() {
        let musicNumber = _.random(1, 3);
        this.gameMusic = this.sound.add('music_game_' + musicNumber, {
            loop: true
        });
        this.gameMusic.play();
    }

    private stopMusic() {
        this.gameMusic.destroy();
    }

    private createEffects() {
        //  First create a particle manager
        //  A single manager can be responsible for multiple emitters
        //  The manager also controls which particle texture is used by _all_ emitter
        let redParticles = this.add.particles('particle_red');

        this.catcherEmitter = redParticles.createEmitter({});
        this.catcherEmitter.setScale(0.5, 0.5);
        this.catcherEmitter.setSpeed(50);
        this.catcherEmitter.setBlendMode(Phaser.BlendModes.ADD);

        let starParticles = this.add.particles('gameicons');
        starParticles.setDepth(100);
        this.bestPlayerEmitter = starParticles.createEmitter({
            tint: 0xffff00,
            frame: 'medal1',
            scale: 1,
            speed: 50,
            frequency: 1000,
            quantity: 3,
            lifespan: 1000,
            blendMode: Phaser.BlendModes.NORMAL
        });
        //this.bestPlayerEmitter.setGravityY(-10);
        this.bestPlayerEmitter.pause();

        // init best player icon
        this.bestPlayerIcon = this.add.image(0, 0, 'gameicons', 'trophy');
        this.bestPlayerIcon.setScale(1.3);
        this.bestPlayerIcon.setTintFill(0xffff00);
        this.bestPlayerIcon.setDepth(100);
        this.bestPlayerIcon.setVisible(false);
        this.bestPlayerIcon.setOrigin(0.5, 1);
        
    }

    private createMap() {
        
        // Parameters are the name you gave the tileset in Tiled and then the key of the tileset image in
        // Phaser's cache (i.e. the name you used in preload)
        this.map = this.make.tilemap({key: 'tilemap'});
        let map = this.map;
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
        this.objectLayer = map.createDynamicLayer('Objects', tilesets, 0, 0);

        if (this.objectLayer) {
            console.log('Object layer loaded');
        }

        // unwalkable tiles are marked as collidable
        this.worldLayer.setCollisionByProperty({collides: true});
        this.collisionTiles = this.worldLayer.filterTiles((tile) => {
            if (tile.properties && tile.properties.collides) {
                return tile;
            }
        });
        
        // debug graphics for tilemap collisions
        /*const debugGraphics = this.add.graphics().setAlpha(0.75);
        worldLayer.renderDebug(debugGraphics, {
            tileColor: null, // Color of non-colliding tiles
            collidingTileColor: new Phaser.Display.Color(243, 134, 48, 255), // Color of colliding tiles
            faceColor: new Phaser.Display.Color(40, 39, 37, 255) // Color of colliding face edges
        });*/


    }

    private initPhysics() {
        // enable collision between platforms and player
        this.players.forEach(player => {
            this.physics.add.collider(player.sprite, this.worldLayer);
        });
        // listen to player to player events
        for (let i = 0; i < this.players.length; i++) {
            for (let j = i; j < this.players.length; j++) {
                if (i != j) {
                    this.physics.add.collider(this.players[i].sprite, this.players[j].sprite, this.playersCollided, null, this);
                    //this.physics.add.overlap(this.players[i].sprite, this.players[j].sprite, this.playersOverlap, null, this);
                }
            }
        }

        // set bounds
        this.physics.world.setBounds(0, 0, this.map.width * this.map.tileWidth, this.map.height * this.map.tileHeight);
        //this.cameras.main.setBounds(-200, -200, 1600, 1600);

    }

    private enableMap() {
        
        //console.log('props: ', map.properties);
        if (_.find(<any> this.map.properties, (prop: any) => {return prop.name === 'noBorders' && prop.value === true})) {
            //console.log('playing map without borders');
            this.players.forEach(player => {
                // players are placed on top if they fall down
                player.sprite.setCollideWorldBounds(false);
            })
        }

        
        // enable special map objects if layer is available
        if (this.objectLayer) {
            // Create a physics group - useful for colliding the player against all the spikes
            this.objectGroup = this.physics.add.staticGroup();
            this.itemGroup = this.physics.add.staticGroup();


            // Loop over each Tile and replace spikes (tile index 77) with custom sprites
            this.objectLayer.forEachTile(tile => {
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
                    this.objectLayer.removeTileAt(tile.x, tile.y);
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


    /**
     * Spawns a jetpack item at the given location.
     * 
     * @param x 
     * @param y 
     */
    spawnItem(x: number, y: number) {
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
        // attach catcher effect to playerB
        this.catcherEmitter.startFollow(player.sprite);
        player.freeze(2500);
    }

    /**
     * Callback function of the physics engine.
     * 
     * @param spritePlayerA 
     * @param spritePlayerB 
     */
    private playersCollided(spritePlayerA: Phaser.Physics.Arcade.Sprite, spritePlayerB: Phaser.Physics.Arcade.Sprite) {
        // find catcher player object
        let playerA = _.find(this.players, player => {return player.sprite === spritePlayerA});
        let playerB = _.find(this.players, player => {return player.sprite === spritePlayerB});

        // custom separation function of two players to prevent pushing into a wall
        this.separateBodies(playerA, playerB);

        this.notifiyGameLogicPlayerCollision(playerA, playerB);
    }

    /**
     * Called after player collision to notify the game logic about the collision.
     * 
     * @param playerA 
     * @param playerB 
     */
    private notifiyGameLogicPlayerCollision(playerA: Player, playerB: Player) {
        // determine direction by considering player position
        let directionA: CollisionDirection = null;
        let directionB: CollisionDirection = null;
        if (playerA.physicsBody.y >= playerB.physicsBody.bottom) {
            // playerA is under playerB
            directionA = CollisionDirection.TOP;
            directionB = CollisionDirection.BOTTOM;
        } else if (playerB.physicsBody.y >= playerA.physicsBody.bottom) {
            // playerB is under playerA
            directionB = CollisionDirection.TOP;
            directionA = CollisionDirection.BOTTOM;
        } else if (playerA.physicsBody.x <= playerB.physicsBody.x) {
            // playerA is left from playerB
            directionA = CollisionDirection.RIGHT;
            directionB = CollisionDirection.LEFT;
        } else {
            // playerA is right from playerB
            directionA = CollisionDirection.LEFT;
            directionB = CollisionDirection.RIGHT;
        }

        // handle collision
        this.gameLogic.onPlayerCollision(
            {
                player: playerA,
                direction: directionA
            },
            {
                player: playerB,
                direction: directionB
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
    private updateCameraPosition(cam: Phaser.Cameras.Scene2D.Camera) {
        
        const CAM_OFFSET = 600;
        const MIN_OFFSET = 400;

        // determine player bounds (area all players lay in)
        var playerBounds = {
            x1: <any> null, y1: <any> null, x2: <any> null, y2: <any> null,
            get width() {
                return Math.max(this.x2 - this.x1, MIN_OFFSET) + CAM_OFFSET;
            },
            get height() {
                return Math.max(this.y2 - this.y1, MIN_OFFSET) + CAM_OFFSET;
            }
        }
        // determine edges of player area
        this.players.forEach(playerItem => {
            let playerSprite = playerItem.sprite;

            if (playerBounds.x1 === null || playerSprite.x < playerBounds.x1) {
                // player is further to the left
                playerBounds.x1 = playerSprite.x;
            }
            if (playerBounds.x2 === null || playerSprite.x > playerBounds.x2) {
                // player is further to the right
                playerBounds.x2 = playerSprite.x;
            }
            if (playerBounds.y1 === null || playerSprite.y < playerBounds.y1) {
                // player is further to the top
                playerBounds.y1 = playerSprite.y;
            }
            if (playerBounds.y2 === null || playerSprite.y > playerBounds.y2) {
                // player is further to the bottom
                playerBounds.y2 = playerSprite.y;
            }
        });

        // calculate center point
        cam.centerOn(
            (playerBounds.x2 - playerBounds.x1) / 2 + playerBounds.x1, // x position
            (playerBounds.y2 - playerBounds.y1) / 2 + playerBounds.y1 // y position
        );

        // calculate scale ratio
        let zoomX = playerBounds.width / cam.width;
        let zoomY = playerBounds.height / cam.height;

        cam.setZoom(
            1 / Math.max(zoomX, zoomY)
        );

    }

    /**
     * Custom player update to handle falling off world and do custom physics handling.
     * 
     * @param time 
     * @param delta 
     * @param scene 
     */
    private playerPhysicsUpdate(time: number, delta: number, scene: GameScene) {
        this.players.forEach(player => {
            if (player.sprite.y > this.physics.world.bounds.height) {
                player.sprite.x = 200;
                player.sprite.y = 200;
                this.setCatcher(player);
            }
        });
        // manual player collision check as overlap is not called every time
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

        this.notifiyGameLogicPlayerCollision(playerA, playerB);
    }

    private updateItemSpawner(time, delta) {
        this.nextItemSpawn -= delta;
        if (this.itemSpawnLocations && this.itemSpawnLocations.length > 0 && this.nextItemSpawn < 0) {
            this.nextItemSpawn = 15000;

            // spawn an item at a item spawner
            let location = this.itemSpawnLocations[_.random(this.itemSpawnLocations.length - 1)];
            this.spawnItem(location.x, location.y);
        }
    }

    private updatePlayers(time: number, delta: number) {
        let highestScore: number = -1;
        let bestPlayer: Player = null;
        this.players.forEach(player => {
            player.update(time, delta, this);
            // best player effect follows best player
            if (highestScore !== null) {
                if (Math.round(player.score / 1000) === highestScore) {
                    // detach highest score effect from everybody
                    this.bestPlayerEmitter.pause();
                    this.bestPlayerIcon.setVisible(false);
                    bestPlayer = null;
                    highestScore = null;
                } else if (Math.round(player.score / 1000) > highestScore) {
                    highestScore = Math.round(player.score / 1000);
                    bestPlayer = player;
                }
            }
        });
        // update best player effect
        if (bestPlayer) {
            this.bestPlayerIcon.setVisible(true);
            this.bestPlayerIcon.x = bestPlayer.sprite.x;
            this.bestPlayerIcon.y = bestPlayer.sprite.y - 30;
            //this.bestPlayerEmitter.resume();
            //this.bestPlayerEmitter.startFollow(bestPlayer.sprite, 0, -30);
        }
    }

    update(time: number, delta: number) {
        //this.physics.world.gravity = new Phaser.Math.Vector2(0, 400);
        if (this.remainingGameTime > 0) {
            // game is running
            this.remainingGameTime -= delta;

            // update players
            this.updatePlayers(time, delta);
            this.playerPhysicsUpdate(time, delta, this);
            this.updateCameraPosition(this.cameras.main);
            this.updateItemSpawner(time, delta);
        } else {
            // game finished - do nothing
            this.stopMusic();
            this.scene.pause();
        }

    }

}