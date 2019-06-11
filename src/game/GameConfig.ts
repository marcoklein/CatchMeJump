export type GameSceneConfig = {

    // name of map to be played
    tilemapPath?: string,

    // array of players playing the game
    players?: GamePlayerConfig[]
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
    keys?: {
        left: string,
        right: string,
        jump: string,
        action1: string
    }, // for type keyboard
    id?: string, // for type gamepad
    index?: number
}