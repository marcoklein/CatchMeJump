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
            collisionA.player.jump(500);
        } else if (collisionB.direction === CollisionDirection.BOTTOM) {
            collisionB.player.jump(500);
        } else {
            // players might catch each other
            this.handlePlayerCollision(collisionA.player, collisionB.player);
        }
    }

    private handlePlayerCollision(playerA: Player, playerB: Player) {
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