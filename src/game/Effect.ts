import { Player } from "./Player";

/**
 * An effect changes player attributes for a certain time.
 * The effect is activated and deactivated.
 */
export abstract class Effect {
    protected player: Player;

    /**
     * Internally used by the player to activate the effect.
     * 
     * @param player 
     */
    setPlayer(scene: Phaser.Scene, player: Player): boolean {
        if (this.player) {
            console.warn('Cannot add effect to second player.');
            return false;
        }
        // activate effect
        this.player = player;
        //this.onActivate(player);
    }

    /**
     * Activate the player effect.
     * 
     * @param player 
     */
    protected abstract onActivate(scene: Phaser.Scene, player: Player): void;
    /**
     * Deactivate the effect restoring the original state.
     * 
     * @param player 
     */
    protected abstract onDeactivate(scene: Phaser.Scene, player: Player): void;
    /**
     * Update logic for an effect.
     * Returning false will deactivate the effect.
     * 
     * @param time 
     * @param delta 
     */
    abstract onUpdate(time: number, delta: number): boolean;

}