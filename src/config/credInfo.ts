export enum ReadyBy
{
    Input,      // needs a manual input form and click on a submit button in UI (or max length is reached for PIN)
    Gesture,    // needs an explicit gesture (fingerprint swipe, card insert/tap, FIDO touch)
    Presence,   // needs only a user presence or device proximity (face, proximity card, Bluetooth)
}

export interface CredInfo {
    id: string;             // credential Id
    name: string;           // display name
    icon: string;           // icon
    strength: number;       // relative strength (and priority)
    ident: boolean;         // can identify user?
    readyBy: ReadyBy;       // when the credential is ready for submission?
}
