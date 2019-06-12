import { Player } from "../Player";
import { GameScene } from "../../scene/GameScene";

export enum CollisionDirection {
    TOP = 'Top',
    LEFT = 'Left',
    BOTTOM = 'Bottom',
    RIGHT = 'Right'
}

export type PlayerCollision = {
    player: Player,
    direction: CollisionDirection
};

export interface GameLogic {

    readonly game: GameScene;
    
    /**
     * Game starts with given configuration.
     * @param players 
     */
    onGameStart(players: Player[]): void;
    /**
     * Game is stopped.
     * Reset status.
     */
    onGameStop(): void;

    /**
     * A player joins the game.
     * Only called if a player joins or leaves during an ongoing game.
     * 
     * @param player 
     */
    onPlayerJoin(player: Player): void;

    /**
     * A player leaves an ongoing game.
     * 
     * @param player 
     */
    onPlayerLeave(player: Player): void;

    /**
     * Called as two players collide.
     * Two collision objects give infomration about the collision.
     * 
     * No collisions are filtered (i.e. frozen players are overlaps)
     * 
     * @param collisionA 
     * @param collisionB 
     */
    onPlayerCollision(collisionA: PlayerCollision, collisionB: PlayerCollision): void;

}