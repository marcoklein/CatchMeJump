export type GameSceneConfig = {

    // name of map to be played
    tilemapPath?: string,

    // array of players playing the game
    players?: Array<{
        name?: string,
        texture?: string,
        input?: InputDeviceOptions
    }>
};

export enum InputDeviceType {
    KEYBOARD,
    GAMEPAD
}

export type InputDeviceOptions = {
    type?: InputDeviceType,
    keys?: {
        left: string,
        right: string,
        action1: string,
        action2: string
    }, // for type keyboard
    id?: string, // for type gamepad
    index?: number
}