import { GameLogic, PlayerCollision, CollisionDirection } from "./GameLogic";
import { Player } from "../Player";
import { GameScene } from "../../scene/GameScene";
import _ = require("underscore");


export class DefaultGameLogic implements GameLogic {
    readonly game: GameScene;
    
    constructor(game: GameScene) {
        this.game = game;
    }

    onGameStart(players: Player[]): void {
        console.log('on game start');
        
        // choose a random catcher
        this.game.setCatcher(players[_.random(players.length - 1)]);

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
    onPlayerCollision(collisionA: PlayerCollision, collisionB: PlayerCollision): void {
        // if a player jumps on another he gets an extra push
        if (collisionA.direction === CollisionDirection.BOTTOM) {
            // player A jumped on player B
            collisionA.player.jump(500);
            if (collisionB.player.isCatcher) {
                collisionA.player.score += 1000;
            } else {
                collisionA.player.score += 500;
            }
            // allow catching by jumping on player
            if (collisionA.player.isCatcher) {
                this.handleCatcherCollision(collisionA.player, collisionB.player);
            }
        } else if (collisionB.direction === CollisionDirection.BOTTOM) {
            // player B jumped on player A
            collisionB.player.jump(500);
            if (collisionA.player.isCatcher) {
                collisionB.player.score += 1000;
            } else {
                collisionB.player.score += 500;
            }
            // allow catching by jumping on player
            if (collisionB.player.isCatcher) {
                this.handleCatcherCollision(collisionA.player, collisionB.player);
            }
        } else {
            // players might catch each other
            this.handleCatcherCollision(collisionA.player, collisionB.player);
        }
    }

    private handleCatcherCollision(playerA: Player, playerB: Player) {
        if (playerA.isFrozen || playerB.isFrozen) {
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

}