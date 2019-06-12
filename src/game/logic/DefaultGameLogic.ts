import { GameLogic, PlayerCollision, CollisionDirection } from "./GameLogic";
import { Player } from "../Player";
import { GameScene } from "../../scene/GameScene";
import _ = require("underscore");


export class DefaultGameLogic implements GameLogic {
    readonly game: GameScene;

    /**
     * Player carrying the star.
     */
    private starPlayer: Player;
    private starIcon: Phaser.GameObjects.Image;
    /**
     * The player with the highest score is marked with stars.
     */
    private starEmitter: Phaser.GameObjects.Particles.ParticleEmitter;
    private bestPlayerIcon: Phaser.GameObjects.Image;
    
    constructor(game: GameScene) {
        this.game = game;
        this.init();
    }

    private init() {
        // init best player icon
        this.bestPlayerIcon = this.game.add.image(0, 0, 'gameicons', 'trophy');
        this.bestPlayerIcon.setScale(1.3);
        this.bestPlayerIcon.setTintFill(0xffff00);
        this.bestPlayerIcon.setDepth(100);
        this.bestPlayerIcon.setVisible(false);
        this.bestPlayerIcon.setOrigin(0.5, 1);

        // init star icon
        this.starIcon = this.game.add.image(0, 0, 'gameicons', 'star');
        this.starIcon.setScale(1.3);
        this.starIcon.setTintFill(0xffff00);
        this.starIcon.setDepth(100);
        this.starIcon.setVisible(false);
        this.starIcon.setOrigin(0.5, 1);

        // init star effect
        let starParticles = this.game.add.particles('gameicons');
        starParticles.setDepth(100);
        this.starEmitter = starParticles.createEmitter({
            tint: 0xffff00,
            frame: 'star',
            scale: 0.5,
            speed: 50,
            frequency: 1000,
            quantity: 3,
            lifespan: 500,
            blendMode: Phaser.BlendModes.NORMAL
        });
        //this.bestPlayerEmitter.setGravityY(-10);
        this.starEmitter.stop();
    }

    onGameStart(players: Player[]): void {
        console.log('on game start');
        
        // choose a random catcher
        let catcher = players[_.random(players.length - 1)];
        this.game.setCatcher(catcher);
        catcher.score = 15000;

        this.starPlayer = players[_.random(players.length - 1)];
    }

    update(time: number, delta: number) {
        // update player score
        this.game.players.forEach((player) => {
            // update player score
            if (!player.isCatcher) {
                player.score += delta;
            }
        });

        // update star player
        if (this.starPlayer) {
            this.starPlayer.score += delta / 2;
            this.starIcon.setVisible(true);
            this.starIcon.x = this.starPlayer.sprite.x;
            this.starIcon.y = this.starPlayer.sprite.y - 30;
        }
    }

    onPlayerCollision(collisionA: PlayerCollision, collisionB: PlayerCollision): void {
        // if a player jumps on another he gets an extra push
        if (collisionA.direction === CollisionDirection.BOTTOM) {
            // player A jumped on player B
            this.handlePlayerJumpOnHead(collisionA.player, collisionB.player);
        } else if (collisionB.direction === CollisionDirection.BOTTOM) {
            // player B jumped on player A
            this.handlePlayerJumpOnHead(collisionB.player, collisionA.player);
        } else {
            // players might catch each other
            this.handleCatcherCollision(collisionA.player, collisionB.player);
        }
    }

    private updateBestPlayerTrophy() {
        let highestScore: number = -1;
        let bestPlayer: Player = null;

        this.game.players.forEach((player) => {
            // best player effect follows best player
            if (highestScore !== null) {
                if (Math.round(player.score / 1000) === highestScore) {
                    // detach highest score effect from everybody
                    this.starEmitter.pause();
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
            //this.bestPlayerIcon.setVisible(true);
            this.bestPlayerIcon.x = bestPlayer.sprite.x;
            this.bestPlayerIcon.y = bestPlayer.sprite.y - 30;
        }
    }

    /**
     * Define what happens when a player jumps on another player.
     * 
     * @param topPlayer 
     * @param bottomPlayer 
     */
    private handlePlayerJumpOnHead(topPlayer: Player, bottomPlayer: Player) {
        topPlayer.jump(500);

        // catch or freeze bottom player
        if (bottomPlayer.isCatcher) {
            if (!bottomPlayer.isFrozen) {
                // catcher also catches if jumped on top...
                topPlayer.isCatcher = true;
                bottomPlayer.isCatcher = false;
            }
        } else if (!topPlayer.isFrozen) { // do not freeze catcher
            // freeze bottom player
            bottomPlayer.freeze(500);
        }

        // retrieve star
        if (this.starPlayer === bottomPlayer) {
            this.starPlayer = topPlayer;
        }


        // allow catching by jumping on player
        if (topPlayer.isCatcher) {
            this.handleCatcherCollision(bottomPlayer, topPlayer);
        }
    }

    private handleCatcherCollision(playerA: Player, playerB: Player) {
        if ((playerA.isCatcher && playerA.isFrozen) || (playerB.isCatcher && playerB.isFrozen)) {
            // do not allow catches during freeze time
            return;
        }
        // switch catchers
        if (playerA.isCatcher) {
            this.game.setCatcher(playerB);
        } else if (playerB.isCatcher) {
            this.game.setCatcher(playerA);
        }
    }

    onGameStop(): void {
        console.log('on game stop');
    }
    onPlayerJoin(player: Player): void {
        console.log('on player join');
    }
    onPlayerLeave(player: Player): void {
        console.log('on player leave');
    }

}