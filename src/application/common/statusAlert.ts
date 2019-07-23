export interface StatusAlert
{
    message: string;
}

export class Success implements StatusAlert
{
    constructor(
        public message: string,
    ){}
}

export class Warning implements StatusAlert
{
    constructor(
        public message: string,
    ){}
}

export class Info implements StatusAlert
{
    constructor(
        public message: string,
    ){}
}
