import { timingSafeEqual } from 'crypto'

// const ENCODING = 'utf8'

export class CTF {
    private flags = new Map<String, Buffer>()

    private initChallenges(flags: Flags): void {
        console.log(`Flag for example_challenge: ${flags.example_challenge}`)
        console.log(`Flag for challenge_2: ${flags.challenge_2}`)
    }
    
    constructor(flags: Flags) {
        for (const [chal_name, flag] of Object.entries(flags)) {
            let flagstr = flag as string
            this.flags.set(chal_name, Buffer.from(flagstr))
        }
        this.initChallenges(flags)
    }

    public validateChallengeName(challengeName: string): boolean {
        return this.flags.has(challengeName);
    }

    public checkFlag(challengeName: string, flag: string): boolean {
        let flagBuf = Buffer.from(flag), realFlagBuf = this.flags.get(challengeName);
        return flagBuf.length === realFlagBuf.length && timingSafeEqual(flagBuf, realFlagBuf);
    }
}
