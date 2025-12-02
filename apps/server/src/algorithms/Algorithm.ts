export class Algorithm {
    name: string;
    description: string;

    constructor(name: string, description: string) {
        this.name = name;
        this.description = description;
    }

    async execute(input: any): Promise<any> {
        console.log("Executing algorithm with input:", input);
        throw new Error("Method not implemented.");
    }
}
