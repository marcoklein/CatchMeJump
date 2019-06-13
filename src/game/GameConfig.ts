export type GameSceneConfig = {

    // name of map to be played
    tilemapPath: string,

    // array of players playing the game
    players: GamePlayerConfig[],

    options: {
        /**
         * Number of milliseconds a player is frozen if he was caught.
         */
        catcherFreezeTime: number,
        /**
         * Duration of a game.
         */
        duration: number
    }
};

export type GamePlayerConfig = {
    name?: string,
    texture?: string,
    input?: InputDeviceOptions
};

export enum InputDeviceType {
    KEYBOARD,
    GAMEPAD
}

export type InputDeviceOptions = {
    type: InputDeviceType,
    /**
     * Keys are set, if the type is KEYBOARD.
     */
    keys?: {
        left: string,
        right: string,
        jump: string,
        action1: string
    },
    /**
     * If the type is GAMEPAD the index specifies the gamepad.
     */
    index?: number
}