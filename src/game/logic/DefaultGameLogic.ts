import { GameLogic, PlayerCollision } from "./GameLogic";
import { Player } from "../Player";
import { GameScene } from "../../GameScene";


export class DefaultGameLogic implements GameLogic {
    readonly game: GameScene;
    
    constructor(game: GameScene) {
        this.game = game;
    }

    onGameStart(players: Player[]): void {
        console.log('on game start');
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
        this.handlePlayerCollision(collisionA.player, collisionB.player);
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