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
            this.handlePlayerJumpOnHead(collisionA.player, collisionB.player);
        } else if (collisionB.direction === CollisionDirection.BOTTOM) {
            // player B jumped on player A
            this.handlePlayerJumpOnHead(collisionB.player, collisionA.player);
        } else {
            // players might catch each other
            this.handleCatcherCollision(collisionA.player, collisionB.player);
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
        if (bottomPlayer.isCatcher) {
            // catcher also catches if jumped on top...
            topPlayer.isCatcher = true;
            bottomPlayer.isCatcher = false;
            //collisionB.player.score += 1000;
        } else if (!topPlayer.isFrozen) { // do not freeze catcher
            // freeze bottom player
            bottomPlayer.freeze(500);
            //collisionB.player.score += 500;
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

}